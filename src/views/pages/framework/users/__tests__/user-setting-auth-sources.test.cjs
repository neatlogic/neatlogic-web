// 使用真实页面脚本、模板和语言包验证权限回显，仅替换远程接口及通用控件的插槽外壳。
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
const compiler = require('vue/compiler-sfc');
const {JSDOM} = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
const Vue = require('vue/dist/vue.common.js');
Vue.config.productionTip = false;
Vue.config.devtools = false;
const errors = [];
Vue.config.errorHandler = error => errors.push(error);
const plain = value => JSON.parse(JSON.stringify(value));
const normalize = value => value.textContent.trim().replace(/\s+/g, ' ');

// 直接读取中英文资源，确保展示使用实际文案而非未解析的国际化键。
const languages = Object.fromEntries(['zh', 'en'].map(locale => [locale,
  Object.fromEntries(['term', 'page'].map(group => [group, JSON.parse(fs.readFileSync(
    path.resolve(__dirname, `../../../../../resources/assets/languages/${group}/${locale}.json`), 'utf8'
  ))]))
]));
function translator(locale) {
  return (key, params = {}) => {
    const value = key.split('.').reduce((item, name) => item && item[name], languages[locale]);
    return typeof value === 'string' ? value.replace(/\{(\w+)\}/g, (match, name) => params[name] === undefined ? match : params[name]) : key;
  };
}

// 编译实际SFC，静态导入替身不执行其他页面或后端请求。
function loadSfc(filename) {
  const absolute = path.resolve(__dirname, '..', filename);
  const parsed = compiler.parse({source: fs.readFileSync(absolute, 'utf8'), filename: absolute});
  const {code} = babel.transformSync(parsed.script.content, {
    filename: absolute, babelrc: false, configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs', 'babel-plugin-dynamic-import-node']
  });
  const output = {exports: {}};
  new Function('require', 'module', 'exports', code)(() => ({__esModule: true, default: {getComponent: () => []}}), output, output.exports);
  return {...output.exports.default, ...Vue.compile(parsed.template.content, {whitespace: 'condense'})};
}
const Dialog = loadSfc('user-setting-view-authorization-dialog.vue');
const Setting = loadSfc('user-setting.vue');
const wrapper = {render(h) { return h('div', this.$slots.default || (this.$scopedSlots.default && this.$scopedSlots.default({}))); }};
const groups = [{value: 'process', text: 'IT服务'}, {value: 'cmdb', text: '配置管理'}];
const auth = (code, name = code, sources = []) => ({authGroup: 'process', auth: code, authName: name, sourcePathList: sources});
const role = name => ({roleUuid: 'role-1', roleName: name, teamPathNameList: []});

// 浮层替身保留入口与内容插槽边界，隐藏内容用于核验真实模板传入的配置和来源文本。
const Poptip = {
  props: ['trigger', 'title', 'wordWrap', 'width', 'transfer', 'placement'],
  render(h) {
    return h('span', [
      h('span', {attrs: {'data-source-trigger': ''}}, this.$slots.default),
      h('div', {attrs: {'data-source-content': '', hidden: true}}, this.$slots.content)
    ]);
  }
};

// 表格替身按真实thead与具名插槽渲染；断言读取最终DOM，能捕获列遗漏和文本转义回归。
const TsTable = {
  props: ['theadList', 'tbodyList'],
  render(h) {
    return h('table', [
      h('thead', [h('tr', this.theadList.map(head => h('th', head.title)))]),
      h('tbody', this.tbodyList.map(row => h('tr', {attrs: {'data-auth': row.auth, 'data-group': row.authGroup}},
        this.theadList.map(head => h('td', {attrs: {'data-cell': head.key}}, this.$scopedSlots[head.key] ? this.$scopedSlots[head.key]({row}) : String(row[head.key] || '')))
      )))
    ]);
  }
};
async function settle() {
  for (let index = 0; index < 6; index++) {
    await Promise.resolve();
    await Vue.nextTick();
  }
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(errors.splice(0), []);
}
async function mountDialog(rows, locale = 'zh', groupResponse) {
  const calls = [];
  const component = {
    ...Dialog,
    components: {TsDialog: wrapper, TsRow: wrapper, Col: wrapper, CombineSearcher: wrapper, TsTable, Poptip},
    methods: {...Dialog.methods, getMenuInfoList: () => []},
    beforeCreate() {
      this.$t = translator(locale);
      this.$api = {common: {getAuthGroup() {
        calls.push('auth/group');
        return groupResponse || Promise.resolve({Status: 'OK', Return: {groupList: groups}});
      }}};
    }
  };
  const host = new Vue({data: {rows}, render(h) { return h(component, {props: {userAuthList: this.rows}}); }}).$mount();
  document.body.appendChild(host.$el);
  await settle();
  return {host, vm: host.$children[0], calls};
}
function destroy(host) { const element = host.$el; host.$destroy(); element.remove(); }
function rowElement(vm, code, group = 'process') {
  return [...vm.$el.querySelectorAll('tbody tr')].find(row => row.getAttribute('data-auth') === code && row.getAttribute('data-group') === group);
}
function sourceTexts(vm, code, group) {
  // 来源已从表格正文移入浮层内容插槽，断言其内部逐行文本。
  return [...rowElement(vm, code, group).querySelector('[data-source-content]').firstElementChild.children].map(normalize);
}

// 读取最终DOM中的图标及其完整名称，验证节点类型而不是拆分路径文本。
function sourceNodes(vm, code, group) {
  const lines = rowElement(vm, code, group).querySelector('[data-source-content]').firstElementChild.children;
  return [...lines].map(line => [...line.querySelectorAll('.tsfont-team-s, .tsfont-role, .tsfont-security')].map(node => [node.className, node.textContent]));
}

// 浮层嵌套在表格插槽内，递归查找真实模板创建的组件实例以核对传参。
function findSourcePopover(vm) {
  if (vm.$options.propsData?.trigger === 'hover') return vm;
  for (const child of vm.$children) {
    const popover = findSourcePopover(child);
    if (popover) return popover;
  }
}

// 两种语言均验证来源列只有图标入口，SQL列同款浮层配置及来源内容通过真实模板绑定。
test('来源列为80宽图标入口，悬浮浮层向左transfer显示全部来源且不提供按钮', async() => {
  for (const locale of ['zh', 'en']) {
    const {host, vm} = await mountDialog([auth('ROLE', '角色权限', [role('审批角色'), role('复核角色')])], locale);
    try {
      const cell = rowElement(vm, 'ROLE').querySelector('[data-cell="sourcePathList"]');
      const trigger = cell.querySelector('[data-source-trigger]');
      assert.equal(trigger.textContent.trim(), '');
      assert.equal(trigger.children.length, 1);
      assert.ok(trigger.querySelector('.tsfont-zirenwu.cursor-pointer'));
      const popover = findSourcePopover(vm);
      assert.ok(popover);
      assert.equal(popover.trigger, 'hover');
      assert.equal(popover.placement, 'left');
      assert.equal(popover.width, '700');
      assert.equal(popover.transfer, true);
      assert.notEqual(popover.wordWrap, undefined);
      assert.equal(popover.title, translator(locale)('page.source'));
      assert.equal(vm.theadList.find(head => head.key === 'sourcePathList').width, 80);
      assert.equal(cell.querySelector('button'), null);
      assert.deepEqual(sourceTexts(vm, 'ROLE'), ['1. 审批角色 → 角色权限', '2. 复核角色 → 角色权限']);
    } finally { destroy(host); }
  }
});

// 名称补全生成独立展示对象；冻结输入防止无意写回Vuex，来源字段仍原样保留。
test('权限名称缺失或空白时回退编码，原始Vuex数据保持不变', () => {
  const sources = Object.freeze([Object.freeze(role('审批角色'))]);
  const input = Object.freeze([
    Object.freeze(auth('FIRST', '首项名称', sources)),
    Object.freeze({authGroup: 'process', auth: 'SECOND', sourcePathList: []}),
    Object.freeze(auth('THIRD', '   ')),
    null
  ]);
  const before = JSON.stringify(input);
  const result = Setting.computed.userAuthList.call({$store: {state: {userInfo: {userAuthList: input}}}});
  assert.deepEqual(result.map(row => row.authName), ['首项名称', 'SECOND', 'THIRD']);
  assert.notEqual(result, input);
  assert.notEqual(result[0], input[0]);
  assert.equal(result[0].sourcePathList, sources);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(Setting.computed.userAuthList.call({$store: {state: {userInfo: {}}}}), []);
});

// 仅透传基本信息页的权限插槽，真实模板负责限制前五项及“查看所有”入口。
test('基本信息页维持前五项顺序和查看所有入口，空权限不渲染标签', async() => {
  const store = Vue.observable({state: {userInfo: {userAuthList: Array.from({length: 6}, (_, index) => auth(`CODE_${index}`, index === 2 ? '' : `权限${index}`))}}});
  const component = {
    ...Setting, created() {},
    data() { return {paneName: 'usersetting', userSettingTabsName: 'setting-tabs', userSettingTabList: [], formSetting: [], theadList: [], tableConfig: {}, formValue: {}, userInfo: {}, isShowAuthDialog: false}; },
    computed: {userAuthList: Setting.computed.userAuthList, canShow: () => false},
    components: {
      TsContain: {render(h) { return h('div', this.$scopedSlots.content({})); }}, Tabs: wrapper,
      TabPane: {props: ['name'], render(h) { return h('div', this.name === 'usersetting' ? this.$slots.default : []); }},
      TsForm: {render(h) { return h('div', this.$scopedSlots.userAuthList({})); }},
      Tag: {render(h) { return h('span', {attrs: {'data-permission-tag': ''}}, this.$slots.default); }}, Button: wrapper
    },
    beforeCreate() { this.$store = store; this.$t = translator('zh'); }
  };
  const vm = new Vue(component).$mount();
  document.body.appendChild(vm.$el);
  try {
    assert.deepEqual([...vm.$el.querySelectorAll('[data-permission-tag]')].map(normalize), ['权限0', '权限1', 'CODE_2', '权限3', '权限4']);
    assert.equal(vm.$el.querySelector('.text-href').textContent, translator('zh')('page.viewall'));
    store.state.userInfo.userAuthList = [];
    await settle();
    assert.equal(vm.$el.querySelectorAll('[data-permission-tag]').length, 0);
    assert.equal(vm.$el.querySelector('.text-href'), null);
  } finally { destroy(vm); }
});

for (const locale of ['zh', 'en']) {
  // 当前与旧响应分别区分直接授权、超级管理员和未提供来源，防止把旧数据误认为直接授权。
  test(`${locale}：来源列区分超级管理员、直接授权及旧响应，语言键完整`, async() => {
    const t = translator(locale);
    const old = {auth: 'OLD', authGroup: 'missing'};
    const {host, vm, calls} = await mountDialog([
      auth('SUPER', '', [{isSuperAdmin: true, roleName: '不追加角色', includeAuthPathList: [{auth: 'ROOT'}]}]),
      auth('DIRECT', '直接项', []), old, auth('NULL', null, null)
    ], locale);
    try {
      assert.deepEqual([...vm.$el.querySelectorAll('th')].map(normalize), [t('term.framework.authname'), t('term.framework.belongmodule'), t('page.source')]);
      assert.deepEqual(sourceTexts(vm, 'SUPER'), [t('term.framework.authsourcesuperadmin')]);
      assert.deepEqual(sourceTexts(vm, 'DIRECT'), [t('term.framework.authsourcedirect')]);
      assert.deepEqual(sourceTexts(vm, 'OLD', 'missing'), [t('term.framework.authsourcenotprovided')]);
      assert.deepEqual(sourceTexts(vm, 'NULL'), [t('term.framework.authsourcenotprovided')]);
      // 身份、直接授权及旧数据提示不伪造分组、角色或权限节点。
      assert.deepEqual(sourceNodes(vm, 'SUPER'), [[]]);
      assert.deepEqual(sourceNodes(vm, 'DIRECT'), [[]]);
      assert.deepEqual(sourceNodes(vm, 'OLD', 'missing'), [[]]);
      assert.deepEqual(sourceNodes(vm, 'NULL'), [[]]);
      assert.equal(normalize(rowElement(vm, 'SUPER').querySelector('[data-cell="authName"]')), 'SUPER SUPER');
      assert.deepEqual(calls, ['auth/group']);
      assert.equal(vm.$el.textContent.includes('term.framework.'), false);
    } finally { destroy(host); }
  });
}

// 长角色和权限名称完整保留在文本节点中；此处只验证内容，不把JSDOM当作真实布局验收。
test('长角色和权限名称在来源文本中完整保留', async() => {
  const roleName = 'Role & 审批角色 '.repeat(40);
  const authName = 'Permission 权限名称 '.repeat(40);
  const {host, vm} = await mountDialog([auth('LONG', authName, [role(roleName)])]);
  try {
    assert.deepEqual(sourceTexts(vm, 'LONG'), [`${roleName} → ${authName}`.trim().replace(/\s+/g, ' ')]);
    assert.ok(rowElement(vm, 'LONG').querySelector('[data-cell="authName"]').textContent.includes(authName));
  } finally { destroy(host); }
});

// 同组与跨组的相同编码必须按完整键映射；多条来源保持顺序与重复，特殊字符作为文本输出。
test('角色、末级分组和包含链使用完整组编码映射名称，多来源逐行编号且文本安全', async() => {
  const special = '<img src=x onerror=alert(1)>&审批→复核';
  const included = {...role(special), teamUuid: 'team', teamPathNameList: ['总部', '末级组'], includeAuthPathList: [
    {authGroup: 'cmdb', auth: 'ROOT'}, {authGroup: 'missing', auth: 'UNKNOWN'},
    {authGroup: 'missing', auth: 'constructor'}, {authGroup: 'missing', auth: '__proto__'},
    {authGroup: 'process', auth: 'TARGET'}
  ]};
  const rows = [auth('ROOT', '错误同编码名称'), {...auth('ROOT', '配置根权限'), authGroup: 'cmdb'},
    auth('ROLE', '角色权限', [role(special)]), auth('TARGET', '目标权限', [included, role('第二角色'), included])];
  const before = JSON.stringify(rows);
  const {host, vm} = await mountDialog(rows);
  try {
    assert.deepEqual(sourceTexts(vm, 'ROLE'), [`${special} → 角色权限`]);
    assert.deepEqual(sourceTexts(vm, 'TARGET'), [
      `1. 末级组 → ${special} → 配置根权限 → UNKNOWN → constructor → __proto__ → 目标权限`,
      '2. 第二角色 → 目标权限',
      `3. 末级组 → ${special} → 配置根权限 → UNKNOWN → constructor → __proto__ → 目标权限`
    ]);
    // 每级包含权限均带盾牌；多来源的图标与名称顺序保持一致，重复项完整保留。
    const includedNodes = [
      ['tsfont-team-s', '末级组'], ['tsfont-role', special], ['tsfont-security', '配置根权限'],
      ['tsfont-security', 'UNKNOWN'], ['tsfont-security', 'constructor'], ['tsfont-security', '__proto__'],
      ['tsfont-security', '目标权限']
    ];
    assert.deepEqual(sourceNodes(vm, 'ROLE'), [[['tsfont-role', special], ['tsfont-security', '角色权限']]]);
    assert.deepEqual(sourceNodes(vm, 'TARGET'), [includedNodes, [['tsfont-role', '第二角色'], ['tsfont-security', '目标权限']], includedNodes]);
    assert.equal(vm.$el.querySelector('img'), null);
    assert.equal(vm.$el.textContent.includes('总部 →'), false);
    assert.equal(JSON.stringify(rows), before);
  } finally { destroy(host); }
});

// 逐条验证畸形来源，不让异常单项吞掉同一权限的其他合法来源。
test('来源结构异常保留原位置并提示不完整，正常角色来源继续显示', async() => {
  const malformed = [null, 'bad', [], {}, {...role(''), roleUuid: 'r'},
    {...role('角色'), teamUuid: 't', teamPathNameList: []},
    {...role('角色'), teamPathNameList: 'bad'},
    {...role('角色'), includeAuthPathList: {}},
    {...role('角色'), includeAuthPathList: [{authGroup: 'process', auth: 'ROOT'}]},
    {...role('角色'), includeAuthPathList: [null, {authGroup: 'process', auth: 'TARGET'}]}];
  const {host, vm} = await mountDialog([auth('MIXED', '混合权限', [...malformed, role('有效角色')]), auth('BAD_LIST', '异常列表', {})]);
  try {
    assert.deepEqual(sourceTexts(vm, 'MIXED'), [
      ...malformed.map((item, index) => `${index + 1}. 来源信息不完整`),
      `${malformed.length + 1}. 有效角色 → 混合权限`
    ]);
    assert.deepEqual(sourceTexts(vm, 'BAD_LIST'), ['来源信息不完整']);
    // 异常来源只有说明文字，正常来源仍渲染角色和权限图标。
    assert.deepEqual(sourceNodes(vm, 'MIXED'), [
      ...malformed.map(() => []), [['tsfont-role', '有效角色'], ['tsfont-security', '混合权限']]
    ]);
    assert.deepEqual(sourceNodes(vm, 'BAD_LIST'), [[]]);
  } finally { destroy(host); }
});

// 使用真实筛选入口，名称、编码和模块忽略大小写；来源描述不扩展原有搜索范围。
test('关键词与菜单组合筛选兼容缺字段，权限更新后维持当前筛选条件', async() => {
  const {host, vm} = await mountDialog([auth('ALPHA', 'MiXeD权限', [role('只在来源出现')]), auth('BETA', null), {auth: 'OLD'}]);
  try {
    vm.searchValue = {keyword: 'mixed'};
    vm.filterAuthByCondition();
    assert.deepEqual(vm.tbodyList.map(row => row.auth), ['ALPHA']);
    vm.searchValue = {keyword: 'beta'};
    vm.filterAuthByCondition();
    assert.deepEqual(vm.tbodyList.map(row => row.auth), ['BETA']);
    // 异常菜单值沿用未选择菜单的语义，不影响安全关键词筛选。
    for (const menuName of [null, 'not-an-array', {}]) {
      vm.searchValue = {keyword: 'beta', menuName};
      vm.filterAuthByCondition();
      assert.deepEqual(vm.tbodyList.map(row => row.auth), ['BETA']);
    }
    vm.searchValue = {keyword: 'IT服务', menuName: ['a-menu']};
    vm.searchConfig.searchList[0].onChange([], [{authority: 'alpha'}]);
    vm.filterAuthByCondition();
    assert.deepEqual(vm.tbodyList.map(row => row.auth), ['ALPHA']);
    host.rows = [auth('ALPHA', '更新权限', [role('更新角色')]), auth('BETA', '更新二')];
    await settle();
    assert.deepEqual(vm.tbodyList.map(row => row.auth), ['ALPHA']);
    assert.deepEqual(sourceTexts(vm, 'ALPHA'), ['更新角色 → 更新权限']);
    host.rows[0].sourcePathList[0].roleName = '原位更新角色';
    await settle();
    assert.deepEqual(sourceTexts(vm, 'ALPHA'), ['原位更新角色 → 更新权限']);
    // 在同一来源上追加分组资料后，图标节点随props深层更新，不残留原路径。
    Vue.set(host.rows[0].sourcePathList[0], 'teamUuid', 'updated-team');
    host.rows[0].sourcePathList[0].teamPathNameList = ['总部', '更新→分组'];
    await settle();
    assert.deepEqual(sourceNodes(vm, 'ALPHA'), [[
      ['tsfont-team-s', '更新→分组'], ['tsfont-role', '原位更新角色'], ['tsfont-security', '更新权限']
    ]]);
    vm.searchValue = {keyword: '原位更新角色'};
    vm.filterAuthByCondition();
    assert.equal(vm.tbodyList.length, 0);
    host.rows = [];
    await settle();
    assert.equal(vm.defaultTbodyList.length, 0);
    assert.equal(vm.tbodyList.length, 0);
  } finally { destroy(host); }
});

// 字典请求较慢时以最新props重建数据，保留等待期间输入的搜索条件。
test('模块名称异步返回后使用最新权限数据并保留等待期间的筛选', async() => {
  let resolveGroups;
  const pending = new Promise(resolve => { resolveGroups = resolve; });
  const {host, vm} = await mountDialog([auth('OLD', '旧权限')], 'zh', pending);
  try {
    vm.searchValue = {keyword: '新权限'};
    host.rows = [auth('NEW', '新权限', [role('新角色')])];
    await settle();
    resolveGroups({Status: 'OK', Return: {groupList: groups}});
    await settle();
    assert.deepEqual(vm.tbodyList.map(row => row.auth), ['NEW']);
    assert.equal(rowElement(vm, 'NEW').querySelector('[data-cell="groupName"]').textContent, 'IT服务');
    assert.deepEqual(sourceTexts(vm, 'NEW'), ['新角色 → 新权限']);
    assert.deepEqual(plain(vm.searchValue), {keyword: '新权限'});
  } finally { destroy(host); }
});
