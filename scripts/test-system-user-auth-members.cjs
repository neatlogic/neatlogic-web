/* 独立运行：node scripts/test-system-user-auth-members.cjs；真实组件交互与 API 替身，不写入真实授权。 */
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
const directory = path.join(root, 'src/views/pages/framework/users');
const clone = value => JSON.parse(JSON.stringify(value));
const flush = async() => { await Promise.resolve(); await Promise.resolve(); await Vue.nextTick(); };
Vue.config.productionTip = false;
Vue.config.devtools = false;
Vue.prototype.$utils = {
  deepClone: clone,
  isEmpty: value => value == null || value === '' || (Array.isArray(value) && !value.length),
  isSame: (first, second) => JSON.stringify(first) === JSON.stringify(second)
};
Vue.prototype.$t = key => key;

//编译真实页面、TsFormCheckbox 和 UI 依赖；本测试不设置校验规则，无需装载校验器的网络依赖。
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
  const code = babel.transformSync(script, { filename, babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'] }).code;
  const module = { exports: {} };
  const localRequire = name => {
    if (name === '@/resources/plugins/TsForm/TsValidtor') return {};
    if (name.startsWith('@/')) return loadModule(require.resolve(path.join(root, 'src', name.slice(2))));
    if (name.startsWith('.')) return loadModule(require.resolve(path.resolve(path.dirname(filename), name)));
    return require(name);
  };
  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  if (template) Object.assign(module.exports.default, new Function(template.code + '\nreturn { render, staticRenderFns };')());
  return module.exports;
}

//页面和成员组件共用真实模板及脚本。
function load(filename) {
  return loadModule(path.join(directory, filename)).default;
}

//手工控制请求完成时间，以覆盖防重复提交和失败后保留编辑状态。
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

//创建真实 Vue 实例，仅替换外部 API、翻译和消息提示边界。
function create(options, props, api, hasAuthority = true) {
  return new Vue({
    ...options,
    propsData: props,
    beforeCreate() {
      this.$api = api;
      this.$t = key => key;
      this.$Message = { success() {} };
      this.$AuthUtils = { hasRole: role => role === 'AUTHORITY_MODIFY' && hasAuthority };
      this.$route = { query: { name: 'USER_VIEW', groupName: 'tenant' } };
      this.$hasBack = () => false;
    }
  });
}

//遍历未挂载 VNode 检查权限门控和页签结构，无浏览器或数据库副作用。
function findNode(node, predicate) {
  if (!node) return null;
  if (predicate(node)) return node;
  const children = node.children || node.componentOptions?.children || [];
  for (const child of children) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}

async function main() {
  const pageOptions = load('auth-adduser.vue');
  const membersOptions = load('system-user-auth-members.vue');
  const addOptions = load('system-user-auth-add-dialog.vue');
  const users = [
    { uuid: 'system', userId: 'system-id', userName: '系统' },
    { uuid: 'autoexec', userId: 'executor-id', userName: '执行用户' },
    { uuid: 'anonymous', userId: 'anonymous-id', userName: '匿名' }
  ];
  let directMembers = [users[0], users[1]];
  const searches = [];
  const saves = [];
  const removals = [];
  let saving;
  let removing;
  const api = {
    framework: { auth: {
      getAuthList: async({ keyword }) => ({ Status: 'OK', Return: [{ name: keyword, displayName: keyword === 'USER_VIEW' ? '用户查看权限' : '其他权限' }] }),
      searchSystemUser: async data => {
        searches.push(clone(data));
        const tbodyList = data.auth ? directMembers : users;
        return { Status: 'OK', Return: { tbodyList: clone(tbodyList), rowNum: tbodyList.length } };
      },
      deleltAuthUser: data => { removals.push(clone(data)); return removing.promise; }
    } },
    common: {
      saveAuthUser: data => { saves.push(clone(data)); return saving.promise; },
      getAuthUserList: async() => ({ Status: 'OK', Return: { rowNum: 1 } }),
      getAuthRoleList: async() => ({ Status: 'OK', Return: { roleCount: 1 } })
    }
  };
  const members = create(membersOptions, { authName: 'USER_VIEW', authGroup: 'tenant' }, api);
  const counts = [];
  members.$on('count', count => counts.push(count));
  await flush();
  assert.deepStrictEqual(searches, [{ auth: 'USER_VIEW' }]);
  assert.deepStrictEqual(counts, [2], '组件初始化立即提供总人数，无须先选中系统用户页签');
  members.toggleSelectAll();
  assert.strictEqual(members.isAllSelected, true);
  assert.deepStrictEqual(clone(members.selectedUuids), ['system', 'autoexec']);
  members.keyword = 'executor';
  await flush();
  assert.deepStrictEqual(clone(members.selectedUuids), ['autoexec'], '搜索清除隐藏成员选择');
  assert.deepStrictEqual(clone(members.visibleMembers), [users[1]]);
  assert.strictEqual(searches.length, 1, '关键词仅本地过滤，不能改变完整成员查询');
  members.toggleSelectAll();
  assert.deepStrictEqual(clone(members.selectedUuids), []);
  members.toggleSelectAll();
  assert.deepStrictEqual(clone(members.selectedUuids), ['autoexec'], '全选限于当前过滤可见集合');

  members.openAdd();
  assert.strictEqual(members.isBusy, true);
  members.confirmRemove(['autoexec']);
  members.toggleSelectAll();
  assert.deepStrictEqual(clone(members.removeUuids), []);
  assert.deepStrictEqual(clone(members.selectedUuids), ['autoexec'], '新增弹窗打开期间不能改变列表选择或移除');
  const add = create(addOptions, { authName: 'USER_VIEW', authGroup: 'tenant' }, api);
  await flush();
  assert.deepStrictEqual(searches.slice(-2), [{}, { auth: 'USER_VIEW' }]);
  assert.deepStrictEqual(clone(add.candidateList), [users[2]], '候选排除完整直接成员，包含搜索隐藏的已有成员');
  add.selectedUuids = ['anonymous'];
  saving = deferred();
  const failingSave = add.save();
  await add.save();
  add.close();
  assert.strictEqual(saves.length, 1);
  assert.strictEqual(add.dialogConfig.isShow, true, '提交期间不能取消');
  assert.deepStrictEqual(saves[0], { auth: 'USER_VIEW', authGroup: 'tenant', userUuidList: ['anonymous'], userType: 'system' });
  saving.reject(new Error('网络失败'));
  await failingSave;
  assert.strictEqual(add.isSaving, false);
  assert.strictEqual(add.dialogConfig.isShow, true);
  assert.deepStrictEqual(clone(add.selectedUuids), ['anonymous'], '新增失败保留选择');
  const addCloseEvents = [];
  add.$on('close', saved => { addCloseEvents.push(saved); members.closeAdd(saved); });
  saving = deferred();
  const successfulSave = add.save();
  directMembers = [...directMembers, users[2]];
  saving.resolve({ Status: 'OK' });
  await successfulSave;
  await flush();
  assert.deepStrictEqual(addCloseEvents, [true]);
  assert.strictEqual(counts.at(-1), 3);
  assert.deepStrictEqual(clone(members.selectedUuids), [], '成功刷新后清理列表选择');
  assert.strictEqual(members.keyword, 'executor', '刷新保留关键词，计数仍为完整成员总数');

  members.confirmRemove(['autoexec']);
  removing = deferred();
  const failingRemove = members.removeMembers();
  await members.removeMembers();
  members.closeRemove();
  assert.strictEqual(removals.length, 1, '重复移除提交只发送一次');
  assert.deepStrictEqual(removals[0], { auth: 'USER_VIEW', userUuidList: ['autoexec'], userType: 'system' });
  removing.resolve({ Status: 'ERROR' });
  await failingRemove;
  assert.deepStrictEqual(clone(members.removeUuids), ['autoexec'], '失败响应保留确认目标');
  assert.strictEqual(members.isDeleting, false);
  removing = deferred();
  const successfulRemove = members.removeMembers();
  directMembers = directMembers.filter(user => user.uuid !== 'autoexec');
  removing.resolve({ Status: 'OK' });
  await successfulRemove;
  assert.deepStrictEqual(clone(members.removeUuids), []);
  assert.strictEqual(counts.at(-1), 2);

  members.keyword = '';
  await flush();
  members.toggleSelectAll();
  members.confirmRemove(members.selectedVisibleUuids);
  removing = deferred();
  const batchRemove = members.removeMembers();
  assert.deepStrictEqual(removals.at(-1).userUuidList, ['system', 'anonymous']);
  directMembers = [];
  removing.resolve({ Status: 'OK' });
  await batchRemove;
  assert.strictEqual(counts.at(-1), 0, '批量移除后人数可以归零');
  assert.deepStrictEqual(clone(members.memberList), []);

  //页签渲染仅替换异步子组件的装载边界，子组件脚本已在上方单独实际执行。
  const shallowPageOptions = { ...pageOptions, components: { CommonAdduser: { render: h => h('div') }, SystemUserAuthMembers: { render: h => h('div') } } };
  const page = create(shallowPageOptions, {}, api);
  await flush();
  assert.strictEqual(page.authDisplayName, '用户查看权限', '编辑页标题读取当前权限展示名称');
  page.updateSystemUserCount(3);
  assert.strictEqual(page.tabClick('system'), false, '系统用户页签允许切换');
  page.tabsName = 'role';
  members.keyword = 'anonymous';
  members.openAdd();
  members.closeAdd(false);
  assert.strictEqual(page.tabsName, 'role', '子组件取消和写操作不依赖或修改主页面当前页签');
  const rendered = page._render();
  assert(findNode(rendered, node => node.data?.attrs?.name === 'system'), '有 AUTHORITY_MODIFY 展示系统用户页签');
  assert.strictEqual(findNode(rendered, node => node.componentOptions?.tag === 'SystemUserAuthMembers').key, 'USER_VIEW');
  page.authName = 'OTHER_AUTH';
  await flush();
  assert.strictEqual(page.authDisplayName, '其他权限', '切换权限后标题同步更新');
  assert.strictEqual(findNode(page._render(), node => node.componentOptions?.tag === 'SystemUserAuthMembers').key, 'OTHER_AUTH', '权限切换通过不同 key 销毁旧成员组件并重新加载');
  const otherMembers = create(membersOptions, { authName: 'OTHER_AUTH', authGroup: 'tenant' }, api);
  await flush();
  assert.deepStrictEqual(searches.at(-1), { auth: 'OTHER_AUTH' });
  assert.deepStrictEqual(clone(otherMembers.selectedUuids), []);
  assert.strictEqual(otherMembers.keyword, '');
  assert.strictEqual(otherMembers.showAdd, false);
  const noAuthority = create(shallowPageOptions, {}, api, false);
  await flush();
  assert.strictEqual(findNode(noAuthority._render(), node => node.data?.attrs?.name === 'system'), null, '无 AUTHORITY_MODIFY 不挂载新页签子组件');

  const failed = create(addOptions, { authName: 'USER_VIEW', authGroup: 'tenant' }, { framework: { auth: { searchSystemUser: async() => { throw new Error('读取失败'); } } } });
  await flush();
  assert.strictEqual(failed.loadFailed, true);
  await failed.save();
  assert.strictEqual(failed.isSaving, false, '加载失败不得保存未知候选');
  const failedMembers = create(membersOptions, { authName: 'USER_VIEW', authGroup: 'tenant' }, { framework: { auth: { searchSystemUser: async() => { throw new Error('读取失败'); } } } });
  await flush();
  assert.strictEqual(failedMembers.loadFailed, true);
  failedMembers.openAdd();
  failedMembers.confirmRemove(['system']);
  assert.strictEqual(failedMembers.showAdd, false);
  assert.deepStrictEqual(clone(failedMembers.removeUuids), [], '完整成员加载失败时不能进行新增或移除');
  directMembers = users;
  const noCandidates = create(addOptions, { authName: 'USER_VIEW', authGroup: 'tenant' }, api);
  await flush();
  assert.deepStrictEqual(clone(noCandidates.candidateList), [], '全部已直接授权时没有重复候选');
  const previousSaveCount = saves.length;
  await noCandidates.save();
  assert.strictEqual(saves.length, previousSaveCount, '没有可选成员时不发送保存请求');

  //代码来源优先，双重来源与后端展开的包含权限同样禁止选择、单删和批删。
  directMembers = [
    { ...users[0], isPageAuth: false, isCodeAuth: true },
    { ...users[1], isPageAuth: true, isCodeAuth: true },
    { ...users[2], isPageAuth: true, isCodeAuth: false },
    { uuid: 'included', userId: 'included-id', userName: '包含权限用户', isPageAuth: false, isCodeAuth: true }
  ];
  const mixed = create(membersOptions, { authName: 'USER_VIEW', authGroup: 'tenant' }, api);
  await flush();
  mixed.toggleSelectAll();
  assert.deepStrictEqual(clone(mixed.selectedUuids), ['anonymous'], '全选排除代码、双重来源及包含权限');
  mixed.toggleSelectAll();
  assert.deepStrictEqual(clone(mixed.selectedUuids), [], '取消全选仅清除可操作成员');
  mixed.updateSelection(['system', 'autoexec', 'anonymous', 'included']);
  assert.deepStrictEqual(clone(mixed.selectedUuids), ['anonymous'], '选择方法过滤所有代码成员');
  mixed.confirmRemove(['system', 'autoexec', 'included']);
  assert.deepStrictEqual(clone(mixed.removeUuids), [], '全部代码来源均不能单独移除');
  mixed.confirmRemove(['system', 'autoexec', 'anonymous', 'included']);
  assert.deepStrictEqual(clone(mixed.removeUuids), ['anonymous'], '混合批次仅确认页面来源');
  mixed.closeRemove();
  const previousRemoveCount = removals.length;
  mixed.removeUuids = ['system', 'autoexec', 'included'];
  await mixed.removeMembers();
  assert.strictEqual(removals.length, previousRemoveCount, '提交方法再次拦截代码来源，不依赖确认弹窗');
  mixed.removeUuids = ['system', 'autoexec', 'anonymous', 'included'];
  removing = deferred();
  const mixedRemove = mixed.removeMembers();
  assert.deepStrictEqual(removals.at(-1).userUuidList, ['anonymous'], '删除请求不包含双重来源或代码包含权限');
  removing.resolve({ Status: 'ERROR' });
  await mixedRemove;
  mixed.closeRemove();

  const mixedAdd = create(addOptions, { authName: 'USER_VIEW', authGroup: 'tenant' }, api);
  await flush();
  assert.deepStrictEqual(clone(mixedAdd.candidateList), [], '已有页面、代码及双重来源均不重复添加');
  mixedAdd.selectedUuids = ['system', 'autoexec', 'anonymous', 'included'];
  const previousMixedSaveCount = saves.length;
  await mixedAdd.save();
  assert.strictEqual(saves.length, previousMixedSaveCount, '旧选择不能绕过候选过滤保存已有授权');
  directMembers = directMembers.filter(user => user.uuid !== 'anonymous');
  await mixedAdd.loadCandidates();
  assert.deepStrictEqual(clone(mixedAdd.selectedUuids), [], '重新加载清除旧选择');
  assert.deepStrictEqual(clone(mixedAdd.candidateList), [users[2]], '仅未授权用户保留在候选中');
  mixedAdd.selectedUuids = ['system', 'autoexec', 'anonymous', 'anonymous', 'included', 'unknown'];
  saving = deferred();
  const mixedSave = mixedAdd.save();
  assert.deepStrictEqual(saves.at(-1).userUuidList, ['anonymous'], '保存仅提交未授权候选并去重');
  saving.resolve({ Status: 'ERROR' });
  await mixedSave;

  //挂载真实 TsFormCheckbox 与底层 Checkbox，验证浏览器输入状态；仅替换卡片布局和浮层定位。
  const checkboxDirectory = path.join(root, 'node_modules/neatlogic-ui/iview/components/checkbox');
  Vue.component('Checkbox', loadModule(path.join(checkboxDirectory, 'checkbox.vue')).default);
  Vue.component('CheckboxGroup', loadModule(path.join(checkboxDirectory, 'checkbox-group.vue')).default);
  Vue.component('Tooltip', {
    props: ['content', 'disabled'],
    render: function(h) { return h('span', { attrs: { 'data-tooltip': this.disabled ? null : this.content } }, this.$slots.default); }
  });
  Vue.component('Loading', { render: h => h('div') });
  Vue.component('TsRow', { render: function(h) { return h('div', this.$slots.default); } });
  Vue.component('Col', { render: function(h) { return h('div', this.$slots.default); } });
  Vue.component('NoData', { render: h => h('div') });
  Vue.component('TsDialog', { render: h => h('div') });
  const domOptions = { ...membersOptions, components: {
    TsFormCheckbox: loadModule(path.join(root, 'src/resources/plugins/TsForm/TsFormCheckbox.vue')).default,
    TsFormInput: { render: h => h('div') },
    TsAvatar: { props: ['userName', 'size'], render: function(h) { return h('span', { attrs: { 'data-avatar': this.userName } }); } }
  } };
  directMembers = [...directMembers, { ...users[2], isPageAuth: true, isCodeAuth: false }];
  const mounted = create(domOptions, { authName: 'USER_VIEW', authGroup: 'tenant' }, api).$mount();
  document.body.appendChild(mounted.$el);
  await flush();
  //按可见名称定位成员卡片，布局复用角色页签的 Col，不引入测试专用业务属性。
  const findCard = uuid => [...mounted.$el.querySelectorAll('.system-user-member')].find(card => card.querySelector('.member-name').title === directMembers.find(user => user.uuid === uuid).userName);
  for (const uuid of ['system', 'autoexec', 'included']) {
    const card = findCard(uuid);
    const checkbox = card.querySelector('input[type="checkbox"]');
    assert.strictEqual(checkbox.checked, false, `${uuid} 保持未勾选`);
    assert.strictEqual(checkbox.disabled, true, `${uuid} 禁止勾选`);
    assert.strictEqual(card.querySelector('.tsfont-close'), null, `${uuid} 无移除入口`);
    assert.strictEqual(card.querySelector('tag'), null, `${uuid} 无常驻授权标签`);
    const tooltip = card.querySelector('[data-tooltip="term.framework.codeauthreadonly"]');
    assert(tooltip && tooltip.contains(checkbox), '只读提示绑定勾选框');
    const name = card.querySelector('.member-name');
    assert.strictEqual(tooltip.contains(name), false, '用户名不触发只读提示');
    assert(card.querySelector('.member-actions').contains(checkbox), '勾选框位于独立的卡片操作区');
    checkbox.click();
    name.click();
    await flush();
    assert.deepStrictEqual(clone(mounted.selectedUuids), [], '代码来源不能通过勾选框或名称进入选择');
  }
  const editableCard = findCard('anonymous');
  const editableCheckbox = editableCard.querySelector('input[type="checkbox"]');
  assert.strictEqual(editableCheckbox.disabled, false, '页面来源保持可选择');
  assert.strictEqual(editableCheckbox.checked, false, '页面来源默认也未勾选');
  assert(editableCard.querySelector('.tsfont-close'), '页面来源保留单个移除入口');
  assert.strictEqual(editableCard.querySelector('tag'), null, '页面来源也不显示常驻授权标签');
  assert.strictEqual(editableCard.querySelector('[data-tooltip]'), null, '页面来源无代码只读提示');
  editableCard.querySelector('.member-name').click();
  await flush();
  assert.strictEqual(editableCheckbox.checked, false, '名称与其他两个页签一致，不承担选择操作');
  editableCheckbox.click();
  await flush();
  assert.deepStrictEqual(clone(mounted.selectedUuids), ['anonymous'], '页面勾选框仍可选中');
  editableCheckbox.click();
  await flush();
  assert.strictEqual(editableCheckbox.checked, false, '页面勾选框仍可取消选择');
  mounted.selectedUuids = ['system', 'autoexec', 'included'];
  await flush();
  assert([...mounted.$el.querySelectorAll('input[type="checkbox"]')].every(input => !input.checked), '旧选择不会把代码来源显示为已勾选');
  mounted.keyword = 'executor';
  await flush();
  assert.strictEqual(mounted.editableVisibleMembers.length, 0, '搜索双重来源后没有可全选成员');
  assert.strictEqual(mounted.$el.querySelector('.tsfont-minus-square'), null, '仅只读成员时隐藏全选');
  mounted.$el.remove();
  for (const vm of [members, add, page, noAuthority, failed, otherMembers, failedMembers, noCandidates, mixed, mixedAdd, mounted]) vm.$destroy();
  dom.window.close();
  console.log('系统用户权限成员：代码及双重来源只读、真实勾选框状态与提示范围、候选去重、选择/单删/批删及保存参数、权限切换和异步边界检查通过。');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
