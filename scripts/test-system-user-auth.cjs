/* 独立运行：node scripts/test-system-user-auth.cjs；仅使用 API 替身，不写入真实授权。 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Vue = require('vue');
const sfc = require('vue/compiler-sfc');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');
const userDirectory = path.join(root, 'src/views/pages/framework/users');

//读取真实组件脚本，Vue 模板编译用于校验入口与弹窗的语法。
function loadComponent(relativePath) {
  const filename = path.join(userDirectory, relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const parsed = sfc.parse({ source, filename });
  const template = sfc.compileTemplate({ source: parsed.template.content, filename });
  assert.deepStrictEqual(template.errors, [], filename);
  const code = babel.transformSync(parsed.script.content, {
    filename,
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
  }).code;
  const module = { exports: {} };
  new Function('module', 'exports', code)(module, module.exports);
  return module.exports.default;
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
  const users = [{ uuid: 'system', userId: 'system', userName: '系统' }, { uuid: 'other-uuid', userId: 'other-id', userName: '其他' }];
  const groupResult = { Status: 'OK', Return: { authGroupList: [{ name: 'tenant', authVoList: [{ name: 'USER_MODIFY' }, { name: 'USER_VIEW' }] }] } };
  const userResult = auth => ({ Status: 'OK', Return: { userAuthObj: auth, userRoleAuthObj: { tenant: ['USER_VIEW'] } } });
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
  const common = create(commonOptions, { authList: edit.authList, authUserSelectList: edit.authUserSelectList, authRoleSelectList: edit.authRoleSelectList }, {});
  assert.deepStrictEqual(clone(common.authSelectList), { tenant: ['USER_MODIFY'] });
  assert.strictEqual(common.isDisabled({ name: 'USER_VIEW' }), true, '继承角色权限保持只读回显');
  edit.$refs.commonAuth = common;

  const closeEvents = [];
  edit.$on('close', saved => closeEvents.push(saved));
  saveResponse = deferred();
  const failingSave = edit.save();
  await edit.save();
  edit.close();
  assert.strictEqual(saveCalls.length, 1, '提交中重复点击不重复请求');
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
  for (const vm of [list, edit, common, nextEdit, nextCommon, failed]) vm.$destroy();
  for (const language of ['zh', 'en']) {
    const translations = JSON.parse(fs.readFileSync(path.join(root, 'src/resources/assets/languages/term', language + '.json'), 'utf8'));
    assert(translations.framework.systemuserauth);
    assert(translations.framework.systemuserloadfailed);
  }
  console.log('系统内置用户授权：Vue 模板、权限回显、加载失败、提交失败/防重、空授权、用户切换检查通过。');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
