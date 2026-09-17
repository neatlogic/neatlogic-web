/* 独立运行：node scripts/test-rdm-event-config.cjs；不访问后端或新增依赖。 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Vue = require('vue');
const sfc = require('vue/compiler-sfc');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');
const base = path.join(root, 'src/views/pages/rdm/project/edittab');
const eventBase = path.join(root, 'src/commercial-module/rdm/pages/event');
const cache = new Map();
let eventFileExists = true;
let eventComponentLoads = 0;
global.COMMERCIAL_MODULES = ['rdm'];

// 执行真实组件脚本与注册器，仅替换网络边界；模板由项目 Vue 2 编译器校验。
function load(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  let source = fs.readFileSync(filename, 'utf8');
  let template;
  if (filename.endsWith('.vue')) {
    const parsed = sfc.parse({ source, filename });
    const result = sfc.compileTemplate({ source: parsed.template.content, filename });
    assert.deepStrictEqual(result.errors, [], filename);
    template = new Function(result.code + '\nreturn { render, staticRenderFns };')();
    source = parsed.script.content;
  }
  const code = babel.transformSync(source, { filename, configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-modules-commonjs'] }).code;
  const module = { exports: {} };
  cache.set(filename, module);
  const localRequire = name => {
    if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
    let file = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(filename), name);
    if (!fs.existsSync(file)) file += '.js';
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.js');
    return load(file);
  };
  localRequire.context = (directory, recursive, pattern, mode) => {
    assert.strictEqual(mode, 'lazy');
    const context = key => { eventComponentLoads++; return Promise.resolve({ default: {} }); };
    context.keys = () => eventFileExists ? ['./rdm/pages/event/event-setting.vue'] : [];
    return context;
  };
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
  if (template) Object.assign(module.exports.default, template);
  return module.exports;
}
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
const flush = async () => { await Promise.resolve(); await Vue.nextTick(); await Promise.resolve(); };
function create(options, props, api = {}) {
  return new Vue({ ...options, propsData: props, beforeCreate() {
    this.$api = { rdm: { event: api } };
    this.$t = key => key;
    this.$utils = { deepClone: value => JSON.parse(JSON.stringify(value)), setUuid: () => 'temporary-test-id' };
    this.$Message = { success() {} };
  } });
}

async function main() {
  for (const name of ['story/story', 'task/task', 'bug/bug', 'testcase/testcase', 'testplan/testplan', 'iteration/iteration', 'gitlab/gitlab', 'app-editor']) load(path.join(base, name + '.vue'));
  for (const name of ['event-setting', 'event-handler-tree', 'event-handler-dialog', 'event-handler-children']) load(path.join(eventBase, name + '.vue'));
  load(path.join(root, 'src/commercial-module/rdm/import.js'));
  const setting = load(path.join(eventBase, 'event-setting.vue')).default;
  const registry = load(path.join(root, 'src/resources/import/component-manager.js')).default;
  const appEditor = load(path.join(base, 'app-editor.vue')).default;
  const settingBase = load(path.join(base, 'base-setting.js')).SettingBase;
  const capabilityEvents = load(path.join(base, 'event-capability.js'));
  let capabilityCalls = 0;
  // 商业标识、可选文件、后端能力三者均满足时才开放；不提前加载组件。
  for (const installed of [false, true]) {
    for (const frontend of [false, true]) {
      for (const backend of [false, true]) {
        global.COMMERCIAL_MODULES = installed ? ['rdm'] : [];
        eventFileExists = frontend;
        registry.categoryConfig.rdmEventSetting = {};
        cache.delete(path.join(root, 'src/commercial-module/rdm/import.js'));
        load(path.join(root, 'src/commercial-module/rdm/import.js'));
        const vm = new Vue({ ...settingBase, propsData: { appData: { id: 2, projectId: 1 } }, beforeCreate() {
          this.$api = { rdm: {
            app: { getAppById: async () => ({ Return: { id: 2, projectId: 1, type: 'story' } }) },
            eventCapability: { getCapability: async () => { capabilityCalls++; return { Return: { available: backend } }; } }
          } };
        } });
        await flush();
        assert.strictEqual(!!vm.eventSettingComponent, installed && frontend && backend);
        vm.$destroy();
      }
    }
  }
  assert.strictEqual(capabilityCalls, 2, '未激活商业模块或组件文件缺失时不查询能力');
  assert.strictEqual(eventComponentLoads, 0, '判断能力不能提前加载组件');
  await registry.getComponent('rdmEventSetting').setting();
  assert.strictEqual(eventComponentLoads, 1, 'Vue异步工厂按需加载组件');
  const oldCapability = deferred();
  const newCapability = deferred();
  let sequence = 0;
  let backendAvailable = true;
  const createSettings = id => new Vue({ ...settingBase, propsData: { appData: { id, projectId: 1 } }, beforeCreate() {
    this.$api = { rdm: {
      app: { getAppById: async id => ({ Return: { id, projectId: 1, type: 'story' } }) },
      eventCapability: { getCapability: () => {
        sequence++;
        if (sequence === 1) return oldCapability.promise;
        if (sequence === 2) return newCapability.promise;
        return Promise.resolve({ Return: { available: backendAvailable } });
      } }
    } };
  } });
  const oldContainer = createSettings(2);
  oldContainer.appData = { id: 2, projectId: 1, name: 'updated' };
  await flush();
  assert.strictEqual(sequence, 1, '数据变化不重复查询能力');
  oldContainer.$destroy();
  const container = createSettings(3);
  assert.strictEqual(sequence, 2, '新应用仅在创建时查询一次');
  newCapability.resolve({ Return: { available: false } });
  await flush();
  oldCapability.resolve({ Return: { available: true } });
  await flush();
  assert.strictEqual(container.eventSettingComponent, null, '旧应用能力响应不得重新开放入口');
  assert.strictEqual(oldContainer.eventSettingComponent, null, '销毁后的迟到响应无效');
  await container.refreshEventCapability();
  assert.strictEqual(container.eventSettingComponent, registry.getComponent('rdmEventSetting').setting);
  backendAvailable = false;
  capabilityEvents.notifyEventRequestFailure();
  await flush();
  assert.strictEqual(container.eventSettingComponent, null, '商业接口失败后复查并关闭入口');
  container.$destroy();
  const finalSequence = sequence;
  capabilityEvents.notifyEventRequestFailure();
  assert.strictEqual(sequence, finalSequence, '销毁后解除能力失败订阅');
  for (const name of ['story', 'task', 'bug', 'testcase', 'testplan', 'iteration', 'gitlab']) {
    const filename = path.join(base, name, name + '.vue');
    const options = load(filename).default;
    assert.strictEqual(options.extends, settingBase, name + '复用基础设置逻辑');
    let webhookLoads = 0;
    const vm = new Vue({ ...options, propsData: { appData: { id: 2 } }, beforeCreate() {
      this.$api = { rdm: {
        eventCapability: { getCapability: async () => ({ Return: { available: true } }) },
        webhook: { getWebhookConfigByAppId: async () => { webhookLoads++; return { Return: { appId: 2, webhookUrl: 'existing' } }; } }
      } };
    } });
    await flush();
    assert.strictEqual(vm.eventSettingComponent, registry.getComponent('rdmEventSetting').setting);
    if (name === 'gitlab') {
      assert.strictEqual(webhookLoads, 1, '继承基础逻辑不能覆盖GitLab初始化');
      assert.strictEqual(vm.webhookData.webhookUrl, 'existing');
    }
    vm.currentTab = 'event';
    vm.eventSettingComponent = null;
    await flush();
    assert.strictEqual(vm.currentTab, name === 'gitlab' ? 'webhook' : name === 'iteration' ? 'notify' : 'attr', name + '回到明确的默认页签');
    assert(!fs.readFileSync(filename, 'utf8').includes('commercial-module'), '公共页签不得导入可缺失商业目录');
    vm.$destroy();
  }
  // 容器只负责应用查询，迟到的旧应用响应不能替换当前设置。
  const oldApp = deferred();
  const currentApp = deferred();
  const appContainer = new Vue({ ...appEditor, propsData: { appId: 2, projectId: 1 }, beforeCreate() {
    this.$api = { rdm: { app: { getAppById: id => id === 2 ? oldApp.promise : currentApp.promise } } };
  } });
  appContainer.appId = 3;
  await flush();
  currentApp.resolve({ Return: { id: 3 } });
  await flush();
  oldApp.resolve({ Return: { id: 2 } });
  await flush();
  assert.strictEqual(appContainer.appData.id, 3);
  assert.strictEqual(appContainer.refreshEventCapability, undefined, '容器不管理事件能力');
  appContainer.$destroy();
  const first = deferred();
  const second = deferred();
  let eventCalls = 0;
  const saved = [];
  const vm = create(setting, { projectId: 1, appId: 2 }, {
    listEvents: () => {
      eventCalls++;
      if (eventCalls === 1) return first.promise;
      if (eventCalls === 2) return second.promise;
      return Promise.resolve({ Return: [{ name: 'new', label: 'New', handlerCount: 1 }] });
    },
    listHandlers: () => Promise.resolve({ Return: [] }),
    listPlugins: () => Promise.resolve({ Return: [{ name: 'basic', requiresConfigEditor: false }] }),
    saveHandler: value => { saved.push(value); return Promise.resolve({ Return: 1 }); }
  });
  vm.appId = 3;
  await flush();
  second.resolve({ Return: [{ name: 'new', label: 'New', handlerCount: 0 }] });
  await flush(); await flush();
  first.resolve({ Return: [{ name: 'stale', label: 'Stale' }] });
  await flush();
  assert.strictEqual(vm.selectedEvent, 'new', '旧应用响应不得覆盖当前事件');
  assert.strictEqual(vm.loading, false);
  assert.strictEqual(vm.canAdd, true, '无参数插件支持基础配置');
  vm.plugins = [{ name: 'special', requiresConfigEditor: true }];
  assert.strictEqual(vm.canAdd, false, '缺少必需编辑器不能新增');
  assert.strictEqual(vm.isEditable({ handler: 'special' }), false);
  registry.registerComponent('rdmEventHandlerEdit', { special: { render: h => h('div') } });
  vm.plugins = vm.plugins.slice();
  assert.strictEqual(vm.canAdd, true);
  assert.strictEqual(vm.isEditable({ handler: 'special', handlerList: [{ handler: 'missing-child', requiresConfigEditor: true }] }), false, '子配置缺编辑器时整树只读');
  assert.strictEqual(vm.isEditable({ handler: 'special', handlerList: [{ handler: 'basic', isAvailable: false }] }), false);
  vm.dialogData = { name: 'draft' };
  await vm.save({ name: 'saved', handler: 'special', config: { kept: true }, handlerList: [] });
  assert.strictEqual(saved[0].appId, 3);
  assert.strictEqual(saved[0].event, 'new');
  assert.deepStrictEqual(saved[0].config, { kept: true });
  assert.strictEqual(vm.dialogData, null, '保存成功统一关闭弹窗');
  assert.strictEqual(vm.events[0].handlerCount, 1, '保存后刷新事件配置数量');
  assert.strictEqual(vm.saving, false);
  vm.$destroy();
  const empty = create(setting, { projectId: 1, appId: 2 }, { listEvents: () => Promise.resolve({ Return: [] }) });
  await flush();
  assert.strictEqual(empty.selectedEvent, '');
  assert.strictEqual(empty.canAdd, false);
  assert.strictEqual(empty.loading, false);
  empty.$destroy();
  const dialog = load(path.join(eventBase, 'event-handler-dialog.vue')).default;
  const draft = create(dialog, { value: { name: 'Existing', handler: 'basic', config: { kept: true } }, plugins: [{ name: 'basic', requiresConfigEditor: false }], projectId: 1, appId: 2, event: 'event' });
  draft.$refs.form = { valid: () => true };
  let result;
  draft.$on('save', value => { result = value; });
  await draft.submit();
  assert.deepStrictEqual(result.config, { kept: true }, '无编辑器时保留原配置');
  assert.strictEqual(result.projectId, 1);
  assert.strictEqual(result.uuid, 'temporary-test-id');
  draft.$destroy();
  for (const phase of ['valid', 'save']) {
    const pending = deferred();
    const stale = create(dialog, { value: { name: 'Async', handler: 'special' }, plugins: [{ name: 'special', requiresConfigEditor: true }], projectId: 1, appId: 2, event: 'event' });
    stale.$refs.form = { valid: () => true };
    let saveCalled = false;
    stale.$refs.editor = {
      valid: () => phase === 'valid' ? pending.promise : true,
      save: () => { saveCalled = true; return pending.promise; }
    };
    let emitted = false;
    stale.$emit = () => { emitted = true; };
    const submitting = stale.submit();
    await flush();
    stale.$destroy();
    pending.resolve(true);
    await submitting;
    assert.strictEqual(emitted, false, '异步编辑器完成后不得从已销毁的应用弹窗发出保存');
    if (phase === 'valid') assert.strictEqual(saveCalled, false, '销毁后的异步校验不得继续准备保存');
  }
  // 公共子配置组件必须使用父插件元数据，子树的增删改只向父级回传。
  const childrenOptions = load(path.join(eventBase, 'event-handler-children.vue')).default;
  const childRequests = [];
  const initialChildren = [{ id: 10, name: 'Original', handler: 'basic', config: { retained: true } }];
  const children = create(childrenOptions, { value: initialChildren, parentPlugin: 'parent', projectId: 1, appId: 2, event: 'new' }, {
    listPlugins: params => { childRequests.push(params); return Promise.resolve({ Return: [{ name: 'basic', requiresConfigEditor: false }] }); }
  });
  await flush();
  assert.deepStrictEqual(childRequests, [{ projectId: 1, appId: 2, event: 'new', parentPlugin: 'parent' }]);
  assert.strictEqual(children.valid(), true);
  let childOutput;
  children.$on('input', rows => { childOutput = rows; });
  children.add();
  assert.deepStrictEqual(children.dialogData, {});
  children.saveChild({ uuid: 'child-new', name: 'Added', handler: 'basic', config: {} });
  assert.strictEqual(childOutput.length, 2);
  assert.strictEqual(children.dialogData, null);
  children.edit(children.rows[0], 0);
  assert.strictEqual(children.editingIndex, 0);
  children.saveChild({ ...children.dialogData, name: 'Edited' });
  assert.strictEqual(childOutput[0].name, 'Edited');
  assert.strictEqual(childOutput[0].id, 10);
  assert.strictEqual(initialChildren[0].name, 'Original', '编辑子树不得修改调用方原始树');
  children.rows.reverse();
  children.change();
  assert.strictEqual(childOutput[0].uuid, 'child-new', '子树拖动后保持回传次序');
  children.remove(0);
  assert.strictEqual(childOutput.length, 1);
  children.disabled = true;
  children.remove(0);
  children.add();
  assert.strictEqual(children.rows.length, 1, '只读状态不可删除子配置');
  assert.strictEqual(children.dialogData, null, '只读状态不可新增子配置');
  children.$destroy();

  // 使用真实模板生成的点击处理器检查各层展开方向与插件展示组件注册。
  const viewer = { name: 'TestViewer', render: h => h('div') };
  registry.registerComponent('rdmEventHandlerView', { basic: viewer });
  const treeOptions = load(path.join(eventBase, 'event-handler-tree.vue')).default;
  const tree = create(treeOptions, { node: { handler: 'basic', handlerList: [{ id: 8, name: 'Child', handler: 'basic' }] }, projectId: 1, appId: 2, event: 'new' });
  assert.strictEqual(tree.viewer, viewer);
  const findToggle = vnode => {
    if (vnode.data && vnode.data.on && vnode.data.on.click) return vnode;
    for (const child of vnode.children || []) { const result = findToggle(child); if (result) return result; }
  };
  let toggle = findToggle(tree._render());
  assert.strictEqual(toggle.data.class, 'tsfont-drop-right');
  toggle.data.on.click();
  assert.strictEqual(tree.expanded, true);
  toggle = findToggle(tree._render());
  assert.strictEqual(toggle.data.class, 'tsfont-drop-down');
  toggle.data.on.click();
  assert.strictEqual(tree.expanded, false);
  tree.$destroy();

  // 排序提交完整根 ID 序列，失败或成功之后均重读当前应用。
  const sorts = [];
  const deletes = [];
  let rootReads = 0;
  let pendingSort;
  const rootList = create(setting, { projectId: 1, appId: 2 }, {
    listEvents: () => Promise.resolve({ Return: [{ name: 'new', label: 'New' }] }),
    listPlugins: () => Promise.resolve({ Return: [] }),
    listHandlers: params => { rootReads++; return Promise.resolve({ Return: [{ id: params.appId * 10 + 1 }, { id: params.appId * 10 + 2 }] }); },
    sortHandlers: params => { sorts.push(params); return pendingSort ? pendingSort.promise : Promise.resolve(); },
    deleteHandler: params => { deletes.push(params); return Promise.resolve(); }
  });
  await flush(); await flush();
  rootList.handlers.reverse();
  await rootList.sort();
  assert.deepStrictEqual(sorts[0], { projectId: 1, appId: 2, event: 'new', idList: [22, 21] });
  assert.strictEqual(rootReads, 2, '保存排序后须刷新根配置');
  assert.deepStrictEqual(rootList.handlers.map(row => row.id), [21, 22]);
  pendingSort = deferred();
  const staleSort = rootList.sort();
  rootList.appId = 3;
  await flush(); await flush();
  const refreshedReads = rootReads;
  pendingSort.resolve();
  await staleSort;
  assert.strictEqual(rootReads, refreshedReads, '旧应用排序结果不应触发新应用重复加载');
  assert.deepStrictEqual(rootList.handlers.map(row => row.id), [31, 32]);
  let confirmation;
  rootList.$createDialog = value => { confirmation = value; };
  const missing = { id: 31, handler: 'missing', isAvailable: false };
  assert.strictEqual(rootList.isEditable(missing), false);
  rootList.remove(missing);
  const modal = { isShow: true };
  confirmation['on-ok'](modal);
  await flush(); await flush();
  assert.deepStrictEqual(deletes, [{ projectId: 1, appId: 3, id: 31 }], '缺失插件配置仍允许在当前应用范围删除');
  assert.strictEqual(modal.isShow, false);
  rootList.remove(missing);
  const oldConfirm = confirmation;
  rootList.appId = 4;
  await flush(); await flush();
  oldConfirm['on-ok']({ isShow: true });
  assert.strictEqual(deletes.length, 1, '旧应用确认框不能对新范围发出删除请求');
  rootList.$destroy();
  // 邮件扩展使用真实注册器和组件，网络仅返回当前应用变量元数据。
  const emailBase = path.join(eventBase, 'handler/email');
  const emailEdit = load(path.join(emailBase, 'email-edit.vue')).default;
  const emailView = load(path.join(emailBase, 'email-view.vue')).default;
  assert.strictEqual(typeof registry.getComponent('rdmEventHandlerEdit').ISSUE_EMAIL, 'function');
  assert.strictEqual(typeof registry.getComponent('rdmEventHandlerView').ISSUE_EMAIL, 'function');
  const emailConfig = { mailServerId: 99, toUserUuidList: ['user#user-a'], toRoleList: ['owner'], ccUserUuidList: ['user-b'], ccRoleList: ['worker'], title: '${DATA.name!}', content: '<p>${DATA.content!}</p>' };
  const oldVariables = deferred();
  const newVariables = deferred();
  const variableRequests = [];
  const email = create(emailEdit, { config: emailConfig, projectId: 1, appId: 2 }, {
    listIssueEmailVariables: params => { variableRequests.push(params); return params.appId === 2 ? oldVariables.promise : newVariables.promise; }
  });
  assert.deepStrictEqual(email.toUsers, ['user#user-a', 'rdmUserType#owner']);
  assert.deepStrictEqual(email.ccUsers, ['user#user-b', 'rdmUserType#worker']);
  assert.strictEqual(email.valid(), true);
  assert.deepStrictEqual(email.save(), { ...emailConfig, toUserUuidList: ['user-a'] });
  assert.strictEqual(emailConfig.toUserUuidList[0], 'user#user-a', '邮件回显不得修改父级配置');
  assert.strictEqual(email.serverConfig.url, '/api/rest/rdm/event/issue/email/mailserver/list');
  assert.deepStrictEqual(email.serverConfig.params, { projectId: 1, appId: 2 });
  email.changeRecipients('to', ['user#user-a', 'rdmUserType#owner', 'user#user-a']);
  assert.deepStrictEqual(email.draft.toUserUuidList, ['user-a']);
  assert.deepStrictEqual(email.draft.toRoleList, ['owner']);
  email.changeRecipients('cc', ['rdmUserType#worker']);
  assert.deepStrictEqual(email.draft.ccUserUuidList, []);
  assert.deepStrictEqual(email.ccUsers, ['rdmUserType#worker']);
  email.changeRecipients('to', ['rdmUserType#projectmember']);
  assert.strictEqual(email.valid(), false);
  assert.strictEqual(email.errorKey, 'eventemailinvalidrole');
  email.changeRecipients('to', ['team#other']);
  assert.strictEqual(email.valid(), false);
  assert.strictEqual(email.errorKey, 'eventemailusersonly');
  email.changeRecipients('to', ['rdmUserType#owner']);
  assert.strictEqual(email.valid(), true);
  email.changeRecipients('cc', []);
  assert.deepStrictEqual(email.ccUsers, []);
  email.draft.toRoleList = [];
  email.draft.toUserUuidList = [];
  assert.strictEqual(email.valid(), false);
  assert.strictEqual(email.errorKey, 'eventemailtorequired');
  email.draft.toRoleList = ['worker'];
  assert.strictEqual(email.valid(), true, '动态角色可独立作为收件来源');
  email.draft.title = 'subject\r\nBcc: invalid';
  assert.strictEqual(email.valid(), false);
  assert.strictEqual(email.errorKey, 'eventemailtitlenolinebreak');
  email.draft.title = '';
  assert.strictEqual(email.valid(), false);
  email.draft.title = 'Title';
  email.draft.content = '<p>&nbsp;</p>';
  assert.strictEqual(email.valid(), false);
  email.draft.content = '<p>Body</p>';
  email.draft.ccUserUuidList = ['team#invalid'];
  assert.strictEqual(email.valid(), false);
  assert.strictEqual(email.errorKey, 'eventemailusersonly');
  email.draft.ccUserUuidList = [];
  email.draft.ccRoleList = ['other'];
  assert.strictEqual(email.valid(), false);
  email.draft.ccRoleList = [];
  assert.strictEqual(email.valid(), true, '抄送可以为空');
  email.appId = 3;
  await flush();
  const scopedVariable = { name: 'attribute-8', label: 'Current attribute', snippet: "${DATA.attributes['8']!}" };
  newVariables.resolve({ Return: [scopedVariable] });
  await flush();
  oldVariables.resolve({ Return: [{ name: 'stale', label: 'Stale', snippet: '${STALE}' }] });
  await flush();
  assert.deepStrictEqual(variableRequests, [{ projectId: 1, appId: 2 }, { projectId: 1, appId: 3 }]);
  assert.strictEqual(email.variables[0].name, 'attribute-8', '变量列表不得混入旧应用属性');
  let copied;
  email.$utils.copyText = (selector, text) => { copied = text; };
  email.copyVariable(email.variables[0]);
  assert.strictEqual(copied, scopedVariable.snippet, '复制后端原始snippet而非自行拼接模板');
  email.$destroy();
  const readonlyEmail = create(emailView, { config: emailConfig, projectId: 1, appId: 2 });
  assert.strictEqual(readonlyEmail.value.title, '${DATA.name!}', '查看不能执行标题模板');
  assert.strictEqual(readonlyEmail.value.content, '<p>${DATA.content!}</p>', '查看不能执行正文模板');
  assert.deepStrictEqual(readonlyEmail.toUsers, ['user#user-a', 'rdmUserType#owner']);
  assert.strictEqual(readonlyEmail.serverConfig.url, '/api/rest/rdm/event/issue/email/mailserver/list');
  readonlyEmail.$destroy();
  // 使用真实 Axios 拦截器顺序：公共层抛出文本后，邮件服务器仍能触发能力复查。
  const http = require('axios').create({ adapter: async config => { throw { config, response: { config, status: 500 } }; } });
  http.interceptors.response.use(response => response, () => { throw 'translated-error-without-config'; });
  cache.set(path.join(root, 'src/resources/api/http.js'), { exports: { __esModule: true, default: http } });
  load(path.join(root, 'src/commercial-module/rdm/api/event.js'));
  let failures = 0;
  const unsubscribe = capabilityEvents.subscribeEventRequestFailure(() => { failures++; });
  await assert.rejects(http.post('/api/rest/rdm/event/issue/email/mailserver/list'), error => error === 'translated-error-without-config');
  assert.strictEqual(failures, 1, '在公共错误转换前捕获声明式请求失败');
  await assert.rejects(http.post('/api/rest/other/endpoint'), error => error === 'translated-error-without-config');
  assert.strictEqual(failures, 1, '其他模块失败不触发事件能力查询');
  await assert.rejects(http.post('/api/rest/rdm/event/issue/integration/list'), error => error === 'translated-error-without-config');
  assert.strictEqual(failures, 2, '集成声明式请求失败触发能力查询');
  unsubscribe();
  // 集成插件使用真实组件逻辑校验回显、参数切换和分支保存，网络仅用替身。
  const integrationBase = path.join(eventBase, 'handler/integration');
  const integrationEdit = load(path.join(integrationBase, 'integration-edit.vue')).default;
  const integrationView = load(path.join(integrationBase, 'integration-view.vue')).default;
  const integrationHelpers = load(path.join(integrationBase, 'config.js'));
  assert.strictEqual(load(path.join(eventBase, 'handler/index.js')).managesChildren('ISSUE_INTEGRATION'), true);
  const firstDetail = deferred();
  const secondDetail = deferred();
  const integration = create(integrationEdit, { config: { integrationUuid: 'first', paramMapping: [{ name: 'a', expression: '${DATA.name!}' }], successCallbackList: [{ uuid: 'child', name: 'Mail' }] }, projectId: 1, appId: 2, event: 'ISSUE_CREATE' }, {
    getIssueIntegration: args => args.integrationUuid === 'first' ? firstDetail.promise : secondDetail.promise,
    listIssueIntegrationVariables: async () => ({ Return: [{ name: 'name', label: 'Name', snippet: '${DATA.name!}' }] })
  });
  integration.draft.integrationUuid = 'second';
  const detailRun = integration.loadIntegration();
  secondDetail.resolve({ Return: { uuid: 'second', name: 'Second', isActive: 1, paramList: [{ name: 'b', isRequired: 1, type: 'text' }] } });
  await detailRun;
  firstDetail.resolve({ Return: { uuid: 'first', name: 'First', isActive: 1, paramList: [{ name: 'a' }] } });
  await flush();
  assert.strictEqual(integration.integration.uuid, 'second');
  assert.deepStrictEqual(integration.draft.paramMapping.map(row => row.name), ['b']);
  assert.strictEqual(integration.valid(), false, '必填参数不能为空');
  integration.setExpression('b', '${DATA.name!}');
  integration.$refs.success = { valid: () => true };
  integration.$refs.failed = { valid: () => true };
  assert.strictEqual(integration.valid(), true);
  assert.strictEqual(integration.save().successCallbackList[0].uuid, 'child');
  let integrationCopied;
  integration.$utils.copyText = (_, value) => { integrationCopied = value; };
  integration.copyVariable(integration.variables[0]);
  assert.strictEqual(integrationCopied, '${DATA.name!}');
  integration.integration.isActive = 0;
  assert.strictEqual(integration.valid(), false, '停用集成不能保存');
  const enriched = integrationHelpers.normalizeConfig({ failedCallbackList: [{ uuid: 'child' }] }, { handlerList: [{ uuid: 'child', isAvailable: false }] });
  assert.strictEqual(enriched.failedCallbackList[0].isAvailable, false);
  const integrationReadonly = create(integrationView, { config: integration.save(), projectId: 1, appId: 2, event: 'ISSUE_CREATE' }, { getIssueIntegration: async () => { throw new Error('missing'); } });
  await flush();
  assert.strictEqual(integrationReadonly.failed, true);
  integrationReadonly.$destroy(); integration.$destroy();
  console.log('RDM event configuration: 16 Vue templates, component logic, child CRUD, root sort/delete, email/integration config/validation/registry, commercial capability matrix/revocation and stale scopes PASS');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
