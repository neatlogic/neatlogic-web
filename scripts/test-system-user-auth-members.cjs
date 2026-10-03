/* 独立运行：node scripts/test-system-user-auth-members.cjs；只执行真实组件脚本与 API 替身。 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Vue = require('vue');
const sfc = require('vue/compiler-sfc');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');
const directory = path.join(root, 'src/views/pages/framework/users');
const clone = value => JSON.parse(JSON.stringify(value));
const flush = async() => { await Promise.resolve(); await Promise.resolve(); await Vue.nextTick(); };

//真实 Vue 编译器校验新增页签和两个组件模板，行为测试直接调用真实组件方法。
function load(filename) {
  const source = fs.readFileSync(path.join(directory, filename), 'utf8');
  const parsed = sfc.parse({ source, filename });
  const template = sfc.compileTemplate({ source: parsed.template.content, filename });
  assert.deepStrictEqual(template.errors, [], filename);
  const code = babel.transformSync(parsed.script.content, { filename, babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'] }).code;
  const module = { exports: {} };
  new Function('module', 'exports', code)(module, module.exports);
  Object.assign(module.exports.default, new Function(template.code + '\nreturn { render, staticRenderFns };')());
  return module.exports.default;
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
  for (const vm of [members, add, page, noAuthority, failed, otherMembers, failedMembers, noCandidates]) vm.$destroy();
  console.log('系统用户权限成员：模板、权限门控、初始计数、搜索/全选、候选去重、新增/移除防重与失败保留、单/批删、归零计数及切页独立状态检查通过。');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
