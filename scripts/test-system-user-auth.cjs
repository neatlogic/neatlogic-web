/* 独立运行：node scripts/test-system-user-auth.cjs；仅使用 API 替身，不写入真实授权。 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
const Vue = require('vue');
const sfc = require('vue/compiler-sfc');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');
const userDirectory = path.join(root, 'src/views/pages/framework/users');
Vue.config.productionTip = false;
Vue.config.devtools = false;

//只编译测试涉及的真实组件和依赖，避免装载整个 UI 库及其业务网络模块。
function loadModule(filename) {
  const source = fs.readFileSync(filename, 'utf8');
  let script = source;
  let template;
  if (filename.endsWith('.vue')) {
    const parsed = sfc.parse({ source, filename });
    template = sfc.compileTemplate({ source: parsed.template.content, filename });
    assert.deepStrictEqual(template.errors, [], filename);
    script = parsed.script.content;
  }
  const code = babel.transformSync(script, {
    filename,
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
  }).code;
  const module = { exports: {} };
  const localRequire = name => name.startsWith('.') ? loadModule(require.resolve(path.resolve(path.dirname(filename), name))) : require(name);
  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  if (template) Object.assign(module.exports.default, new Function(template.code + '\nreturn { render, staticRenderFns };')());
  return module.exports;
}

//加载业务组件时保留真实模板，供勾选状态及只读属性的 DOM 验证使用。
function loadComponent(relativePath) {
  return loadModule(path.join(userDirectory, relativePath)).default;
}

//可控响应用于验证加载与重复保存的异步边界。
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

const clone = value => JSON.parse(JSON.stringify(value));
const utils = { deepClone: clone, isEmptyObj: value => !Object.keys(value || {}).length, isEmpty: value => value == null || value === '' };
const flush = async() => { await Promise.resolve(); await Promise.resolve(); await Vue.nextTick(); };

//直接执行组件生命周期和方法，网络边界替换为不会影响真实租户的替身。
function create(options, props, api) {
  return new Vue({
    ...options,
    propsData: props,
    beforeCreate() {
      this.$api = api;
      this.$utils = utils;
      this.$t = key => key;
      this.$Message = { success() {} };
    }
  });
}

async function main() {
  loadComponent('user-manage.vue');
  const listOptions = loadComponent('system-user-list-dialog.vue');
  const editOptions = loadComponent('system-user-auth-dialog.vue');
  const commonOptions = loadComponent('common/common-auth.vue');
  const checkboxDirectory = path.join(root, 'node_modules/neatlogic-ui/iview/components/checkbox');
  Vue.component('Checkbox', loadModule(path.join(checkboxDirectory, 'checkbox.vue')).default);
  Vue.component('CheckboxGroup', loadModule(path.join(checkboxDirectory, 'checkbox-group.vue')).default);
  //浮层定位不属于授权行为，保留其插槽内容以检查真实权限标记。
  Vue.component('Tooltip', {
    props: ['content', 'disabled'],
    render: function(h) { return h('span', { attrs: { 'data-tooltip': this.disabled ? null : this.content } }, [this.$slots.default, this.$slots.content]); }
  });
  const users = [{ uuid: 'system', userId: 'system', userName: '系统' }, { uuid: 'other-uuid', userId: 'other-id', userName: '其他' }];
  const groupResult = { Status: 'OK', Return: { authGroupList: [{ name: 'tenant', authVoList: [{ name: 'USER_MODIFY', displayName: '用户管理权限' }, { name: 'USER_VIEW', displayName: '用户查看权限' }] }] } };
  const userResult = auth => ({ Status: 'OK', Return: { userAuthObj: auth, userRoleAuthObj: { tenant: ['USER_VIEW'] }, userCodeAuthObj: { tenant: ['USER_VIEW'] } } });
  const directoryResponse = deferred();
  const list = create(listOptions, {}, { framework: { user: { searchSystemUser: () => directoryResponse.promise } } });
  assert.strictEqual(list.isLoading, true);
  directoryResponse.resolve({ Status: 'OK', Return: { tbodyList: users } });
  await flush();
  assert.strictEqual(list.isLoading, false);
  assert.deepStrictEqual(clone(list.userList), users);
  list.authorize(list.userList[1]);
  assert.strictEqual(list.selectedUser.uuid, 'other-uuid');
  list.closeAuth();
  assert.strictEqual(list.selectedUser, null, '关闭后清除目标，重新打开时创建新编辑组件');

  const groupResponse = deferred();
  const authResponse = deferred();
  let saveResponse;
  const saveCalls = [];
  const api = { common: {
    getAuthGrouplist: () => groupResponse.promise,
    getUserAuth: ({ userUuid }) => { assert.strictEqual(userUuid, 'system'); return authResponse.promise; },
    saveAuth: data => { saveCalls.push(data); return saveResponse.promise; }
  } };
  const edit = create(editOptions, { systemUser: users[0] }, api);
  groupResponse.resolve(groupResult);
  await flush();
  assert.strictEqual(edit.isLoading, true, '权限目录返回后仍等待目标权限，不能提前创建勾选组件');
  authResponse.resolve(userResult({ tenant: ['USER_MODIFY'] }));
  await flush();
  assert.strictEqual(edit.isLoading, false);
  const common = create(commonOptions, { authList: edit.authList, authUserSelectList: edit.authUserSelectList, authRoleSelectList: edit.authRoleSelectList, authCodeSelectList: edit.authCodeSelectList }, {});
  assert.deepStrictEqual(clone(common.authSelectList), { tenant: ['USER_MODIFY'] });
  assert.strictEqual(common.isDisabled({ name: 'USER_VIEW' }), true, '继承角色权限保持只读回显');
  assert.deepStrictEqual(clone(common.displayAuthSelectList), { tenant: ['USER_MODIFY', 'USER_VIEW'] }, '页面、角色和代码授权在同一列表取并集');
  common.$mount();
  await flush();
  assert.strictEqual(common.$el.querySelector('input[value="USER_VIEW"]').checked, true);
  assert.strictEqual(common.$el.querySelector('input[value="USER_VIEW"]').disabled, true);
  edit.$refs.commonAuth = common;

  const closeEvents = [];
  edit.$on('close', saved => closeEvents.push(saved));
  saveResponse = deferred();
  const failingSave = edit.save();
  await edit.save();
  edit.close();
  assert.strictEqual(saveCalls.length, 1, '提交中重复点击不重复请求');
  assert.deepStrictEqual(clone(saveCalls[0].userAuthList), { tenant: ['USER_MODIFY'] }, '真实保存参数不包含代码独有权限');
  assert.strictEqual(closeEvents.length, 0, '提交中禁止取消');
  saveResponse.reject(new Error('网络失败'));
  await failingSave;
  assert.strictEqual(edit.isSaving, false);
  assert.strictEqual(edit.dialogConfig.isShow, true);
  assert.deepStrictEqual(clone(common.authSelectList), { tenant: ['USER_MODIFY'] }, '请求失败保留勾选，允许重试');

  saveResponse = deferred();
  const rejectedSave = edit.save();
  saveResponse.resolve({ Status: 'ERROR' });
  await rejectedSave;
  assert.strictEqual(edit.dialogConfig.isShow, true, '非成功响应保留编辑弹窗');
  common.authSelectList = {};
  saveResponse = deferred();
  const emptySave = edit.save();
  assert.deepStrictEqual(clone(saveCalls[2]), { action: 'cover', userUuidList: ['system'], userAuthList: {} }, '空直接权限允许覆盖撤权');
  saveResponse.resolve({ Status: 'OK' });
  await emptySave;
  assert.strictEqual(edit.dialogConfig.isShow, false);
  assert.deepStrictEqual(closeEvents, [true], '成功统一 close(true) 交由父组件销毁');

  const nextApi = { common: {
    getAuthGrouplist: async() => groupResult,
    getUserAuth: async({ userUuid }) => { assert.strictEqual(userUuid, 'other-uuid'); return userResult({}); }
  } };
  const nextEdit = create(editOptions, { systemUser: users[1] }, nextApi);
  await flush();
  const nextCommon = create(commonOptions, { authList: nextEdit.authList, authUserSelectList: nextEdit.authUserSelectList, authRoleSelectList: nextEdit.authRoleSelectList }, {});
  assert.deepStrictEqual(clone(nextCommon.authSelectList), {}, '切换到无直接权限用户时不残留上一用户权限');

  const failed = create(editOptions, { systemUser: users[0] }, { common: {
    getAuthGrouplist: async() => { throw new Error('加载失败'); },
    getUserAuth: async() => userResult({})
  } });
  await flush();
  assert.strictEqual(failed.loadFailed, true);
  assert.strictEqual(failed.isLoading, false);
  await failed.save();
  assert.strictEqual(failed.isSaving, false, '加载失败不能提交未初始化权限');

  const autoexecGroup = { name: 'autoexec', authVoList: [
    { name: 'AUTOEXEC_JOB_MODIFY', displayName: '作业维护权限' },
    { name: 'AUTOEXEC_CREATE_PUBLIC_JOB', displayName: '外部作业创建权限' },
    { name: 'AUTOEXEC_SCRIPT_VIEW', displayName: '工具查看权限' },
    { name: 'AUTOEXEC_ADMIN', displayName: '自动化管理员权限' }
  ] };
  const pageAuth = { autoexec: ['AUTOEXEC_JOB_MODIFY'], other: ['OTHER_AUTH'] };
  const codeAuth = { autoexec: ['AUTOEXEC_JOB_MODIFY', 'AUTOEXEC_CREATE_PUBLIC_JOB'] };
  const mixed = create(commonOptions, { authList: [autoexecGroup], authUserSelectList: pageAuth, authCodeSelectList: codeAuth }, {});
  mixed.$mount();
  document.body.appendChild(mixed.$el);
  await flush();
  const input = name => mixed.$el.querySelector('input[value="' + name + '"]');
  //标识与名称同属原有交互区域，系统默认权限及包含权限也统一展示。
  for (const auth of autoexecGroup.authVoList) {
    const option = input(auth.name).closest('.auth-option');
    assert.strictEqual(option.querySelector('.auth-code.text-grey').textContent.trim(), auth.name);
    assert.strictEqual(option.querySelector('.auth-name-tooltip .check-all-text-pr').textContent.replace(/\s+/g, ' ').trim(), auth.displayName + ' ' + auth.name);
  }
  input('AUTOEXEC_JOB_MODIFY').closest('.auth-option').querySelector('.auth-code').click();
  await flush();
  assert.deepStrictEqual(clone(mixed.authSelectList), pageAuth, '点击代码只读权限的英文标识也不能修改授权');
  for (const name of codeAuth.autoexec) {
    assert.strictEqual(input(name).checked, true, '默认及包含权限真实勾选');
    assert.strictEqual(input(name).disabled, true, '默认及包含权限真实禁用');
    input(name).click();
  }
  assert.strictEqual(mixed.$el.querySelectorAll('.auth-checkbox-tooltip[data-tooltip="term.framework.codeauthreadonly"]').length, 2, '代码提示仅绑定默认及包含权限的勾选框');
  assert.strictEqual(mixed.$el.textContent.includes('term.framework.codeauth'), false, '权限旁不显示常驻代码来源文案');
  assert.strictEqual(input('AUTOEXEC_SCRIPT_VIEW').disabled, false, '非代码权限仍可编辑');
  input('AUTOEXEC_SCRIPT_VIEW').click();
  await flush();
  assert.deepStrictEqual(clone(mixed.authSelectList), { autoexec: ['AUTOEXEC_JOB_MODIFY', 'AUTOEXEC_SCRIPT_VIEW'], other: ['OTHER_AUTH'] }, '单选只写入页面选择，保留原有双重来源');
  mixed.handleCheckAll(autoexecGroup);
  await flush();
  assert.strictEqual(mixed.isCheckAll(autoexecGroup), true);
  assert.strictEqual(input('AUTOEXEC_ADMIN').checked, true);
  assert.strictEqual(mixed.authSelectList.autoexec.includes('AUTOEXEC_CREATE_PUBLIC_JOB'), false, '全选不持久化代码独有的包含权限');
  mixed.handleCheckAll(autoexecGroup);
  await flush();
  assert.deepStrictEqual(clone(mixed.authSelectList), pageAuth, '取消全选保留双重来源与其他分组');
  assert.strictEqual(input('AUTOEXEC_CREATE_PUBLIC_JOB').checked, true);
  assert.strictEqual(input('AUTOEXEC_SCRIPT_VIEW').checked, false);
  mixed.toggleAuth(autoexecGroup.authVoList[0], 'autoexec');
  assert.deepStrictEqual(clone(mixed.authSelectList), pageAuth, '点击代码权限名称也不能撤销勾选');
  input('AUTOEXEC_SCRIPT_VIEW').closest('.auth-option').querySelector('.auth-code').click();
  await flush();
  assert.strictEqual(input('AUTOEXEC_SCRIPT_VIEW').checked, true, '非只读权限支持点击英文标识勾选');
  mixed.toggleAuth(autoexecGroup.authVoList[2], 'autoexec');
  assert.deepStrictEqual(pageAuth, { autoexec: ['AUTOEXEC_JOB_MODIFY'], other: ['OTHER_AUTH'] }, '父级页面数据不被交互修改');
  assert.deepStrictEqual(codeAuth, { autoexec: ['AUTOEXEC_JOB_MODIFY', 'AUTOEXEC_CREATE_PUBLIC_JOB'] }, '父级代码数据不被交互修改');

  //动态空结果必须清空旧记录，代码授权随属性更新撤销，避免切换用户残留。
  mixed.authUserSelectList = {};
  await flush();
  assert.deepStrictEqual(clone(mixed.authSelectList), {});
  assert.strictEqual(input('AUTOEXEC_JOB_MODIFY').checked, true, '页面记录清空后代码来源继续显示');
  mixed.authCodeSelectList = {};
  await flush();
  assert.strictEqual(input('AUTOEXEC_JOB_MODIFY').checked, false);
  assert.strictEqual(input('AUTOEXEC_JOB_MODIFY').disabled, false);

  const fixed = create(commonOptions, { authList: [{ name: 'autoexec', authVoList: autoexecGroup.authVoList.slice(0, 2) }], authCodeSelectList: codeAuth }, {});
  fixed.$mount();
  await flush();
  assert.strictEqual(fixed.$el.querySelector('.h2'), null, '全组只读时隐藏全选入口');
  fixed.handleCheckAll(fixed.authList[0]);
  fixed.updateAuthSelection('autoexec', codeAuth.autoexec);
  assert.deepStrictEqual(clone(fixed.authSelectList), {}, '全组只读时不产生页面授权');
  const ordinary = create(commonOptions, { authList: edit.authList, authRoleSelectList: { tenant: ['USER_VIEW'] } }, {});
  ordinary.$mount();
  await flush();
  assert.deepStrictEqual([...ordinary.$el.querySelectorAll('.auth-code')].map(node => node.textContent.trim()), ['USER_MODIFY', 'USER_VIEW'], '普通用户授权入口统一展示英文标识');
  //继承只读原因只绑定禁用勾选框，权限名称保留业务说明提示。
  const inheritedOption = ordinary.$el.querySelector('input[value="USER_VIEW"]').closest('.auth-option');
  assert.strictEqual(inheritedOption.querySelector('.auth-checkbox-tooltip').getAttribute('data-tooltip'), 'term.framework.notcancelauth');
  assert.strictEqual(inheritedOption.querySelector('.auth-name-tooltip').textContent.includes('term.framework.notcancelauth'), false);
  assert.strictEqual(ordinary.$el.querySelector('input[value="USER_MODIFY"]').closest('.auth-option').querySelector('.auth-checkbox-tooltip').getAttribute('data-tooltip'), null, '可编辑勾选框不显示只读提示');
  assert.strictEqual(common.$el.querySelector('input[value="USER_VIEW"]').closest('.auth-option').querySelector('.auth-checkbox-tooltip').getAttribute('data-tooltip'), 'term.framework.codeauthreadonly', '代码与角色双重来源优先显示代码只读原因');
  ordinary.handleCheckAll(ordinary.authList[0]);
  assert.deepStrictEqual(clone(ordinary.authSelectList), { tenant: ['USER_MODIFY'] }, '普通用户全选不写入角色继承权限');
  assert.strictEqual(ordinary.$el.querySelector('input[value="USER_VIEW"]').checked, true);
  assert.strictEqual(ordinary.$el.querySelector('input[value="USER_VIEW"]').disabled, true);
  ordinary.readOnly = true;
  ordinary.handleCheckAll(ordinary.authList[0]);
  ordinary.updateAuthSelection('tenant', []);
  assert.deepStrictEqual(clone(ordinary.authSelectList), { tenant: ['USER_MODIFY'] }, '提交期间单选和全选都不能修改页面记录');
  const role = create(commonOptions, { type: 'role', authList: groupResult.Return.authGroupList }, {});
  role.$mount();
  await flush();
  assert.deepStrictEqual([...role.$el.querySelectorAll('.auth-code')].map(node => node.textContent.trim()), ['USER_MODIFY', 'USER_VIEW'], '角色授权入口统一展示英文标识');
  role.$el.querySelector('.auth-code').click();
  await flush();
  assert.deepStrictEqual(clone(role.authSelectList), { tenant: ['USER_MODIFY'] }, '角色授权点击标识沿用页面勾选逻辑');
  const unnamed = create(commonOptions, { authList: [{ name: 'tenant', authVoList: [{ displayName: '未提供标识的权限' }] }] }, {});
  unnamed.$mount();
  await flush();
  assert.strictEqual(unnamed.$el.querySelector('.auth-code'), null, '缺少标识不显示空标识行');
  for (const vm of [list, edit, common, nextEdit, nextCommon, failed, mixed, fixed, ordinary, role, unnamed]) vm.$destroy();
  for (const language of ['zh', 'en']) {
    const translations = JSON.parse(fs.readFileSync(path.join(root, 'src/resources/assets/languages/term', language + '.json'), 'utf8'));
    assert(translations.framework.systemuserauth);
    assert(translations.framework.systemuserloadfailed);
    for (const key of ['codeauth', 'codeauthreadonly', 'pageauth']) assert(translations.framework[key]);
  }
  console.log('授权入口：名称与英文标识统一展示及点击、真实勾选/禁用、代码及包含权限、双重来源、全选/取消、角色兼容、保存隔离、空结果及失败/防重检查通过。');
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom.window.close());
