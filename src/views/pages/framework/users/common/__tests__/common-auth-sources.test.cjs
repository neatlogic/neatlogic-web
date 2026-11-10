// 使用真实 SFC 脚本和模板验证来源提示，控件替身只提供既有插槽与禁用契约。
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
// 从真实语言包读取完整提示句式，命名参数替换保留角色及分组原始业务名称。
const languages = Object.fromEntries(['zh', 'en'].map(locale => [locale, {
  term: JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../../../../../resources/assets/languages/term/${locale}.json`), 'utf8'))
}]));
const translator = locale => (key, params = {}) => {
  const template = key.split('.').reduce((value, name) => value && value[name], languages[locale]);
  return typeof template === 'string' ? template.replace(/\{(\w+)\}/g, (match, name) => params[name] === undefined ? match : params[name]) : key;
};
const translate = translator('zh');
const source = (roleName, teamPathNameList = [], roleUuid = 'role-1') => ({
  roleUuid, roleName, teamUuid: teamPathNameList.length ? 'team-1' : null,
  teamPathNameList, teamLft: teamPathNameList.length ? 5 : null
});
const utils = {
  isEmptyObj: value => !value || Object.keys(value).length === 0,
  deepClone: plain,
  isSame: (left, right) => JSON.stringify(left) === JSON.stringify(right)
};

// 不执行页面初始化及远程加载，父页面测试直接调用其真实方法并注入接口契约。
function loadSfc(relativePath, template = false) {
  const filename = path.resolve(__dirname, relativePath);
  const parsed = compiler.parse({source: fs.readFileSync(filename, 'utf8'), filename});
  const {code} = babel.transformSync(parsed.script.content, {
    filename, babelrc: false, configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs', 'babel-plugin-dynamic-import-node']
  });
  const output = {exports: {}};
  new Function('require', 'module', 'exports', code)(() => ({__esModule: true, default: {}}), output, output.exports);
  const component = output.exports.default;
  if (template) Object.assign(component, Vue.compile(parsed.template.content, {whitespace: 'condense'}));
  return component;
}

const CommonAuth = loadSfc('../common-auth.vue', true);
const UserAddview = loadSfc('../../user-addview.vue');
const Tooltip = {
  props: ['disabled'],
  render(h) {
    return h('div', [this.$slots.default, h('div', {attrs: {'data-tooltip-content': ''}}, this.$slots.content)]);
  }
};
const Checkbox = {
  props: ['label', 'disabled'],
  render(h) {
    return h('label', [h('input', {attrs: {type: 'checkbox', 'data-auth': this.label, disabled: this.disabled}}), this.$slots.default]);
  }
};
const CheckboxGroup = {
  props: ['value'],
  render(h) { return h('div', this.$slots.default); }
};
const inherited = {name: 'SHARED', displayName: '继承权限', description: '权限说明'};
const editable = {name: 'EDIT', displayName: '可编辑权限', description: ''};
const catalog = [{name: 'process', displayName: 'IT服务', authVoList: [inherited, editable]}, {name: 'other', displayName: '其他', authVoList: [inherited]}];

async function settle() {
  for (let index = 0; index < 8; index++) {
    await Promise.resolve();
    await Vue.nextTick();
  }
  // 页面旧保存方法不返回请求，额外排空微任务以捕获 finally 和潜在异步异常。
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(errors.splice(0), []);
}

async function mount(props = {}, locale = 'zh') {
  const vm = new Vue({
    ...CommonAuth,
    components: {Tooltip, Checkbox, CheckboxGroup},
    propsData: {authList: catalog, authRoleSelectList: {process: ['SHARED']}, ...props},
    beforeCreate() { this.$t = translator(locale); this.$utils = utils; }
  }).$mount();
  document.body.appendChild(vm.$el);
  await settle();
  return vm;
}

function destroy(vm) { vm.$destroy(); vm.$el.remove(); }
function tips(vm, index = 0) {
  // 从真实 DOM 读取编号及图标节点，验证每个来源仅占一个路径段落。
  const rows = [...vm.$el.querySelectorAll('.auth-checkbox-tooltip')[index].querySelector('[data-tooltip-content]').firstElementChild.children];
  return {
    summary: rows[0].textContent.trim(),
    details: rows.slice(1).map(row => ({
      text: row.textContent.trim().replace(/\s+/g, ' '),
      // 模板沿用图标类，测试按节点类型定位，不依赖已移除的可点击颜色类。
      nodes: [...row.querySelectorAll('.tsfont-role, .tsfont-team-s, .tsfont-security')].map(node => ({
        name: node.textContent,
        icon: [...node.classList].find(name => name.startsWith('tsfont-'))
      }))
    }))
  };
}
// 期望值独立指定节点类别，避免仅核对文案而遗漏角色、分组或权限图标。
const roleNode = name => ({name, icon: 'tsfont-role'});
const teamNode = name => ({name, icon: 'tsfont-team-s'});
const authNode = name => ({name, icon: 'tsfont-security'});
function expectedTips(t, paths) {
  return {
    summary: t('term.framework.authsourcepathintro'),
    details: paths.map((nodes, index) => ({text: `${index + 1}. ${nodes.map(node => node.name).join(' → ')}`, nodes}))
  };
}
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return {promise, resolve};
}
function pageContext(overrides = {}) {
  const context = {
    uuid: 'user-1', tabsName: 'user', authRoleAuthSourcePathList: [],
    $utils: utils, $t: translate, $Message: {success() {}}, $nextTick: () => Vue.nextTick(),
    $refs: {userForm: {valid: () => true, getFormValue: () => ({uuid: 'user-1'})}},
    ...overrides
  };
  for (const [name, method] of Object.entries(UserAddview.methods)) {
    if (!(name in context)) context[name] = method.bind(context);
  }
  return context;
}

for (const locale of ['zh', 'en']) {
  // 代码权限优先；移除代码权限后恢复超级管理员单条身份，始终保持只读。
  test(`${locale}：代码权限优先于超级管理员，移除后恢复身份提示且不能撤销`, async() => {
    const t = translator(locale);
    const vm = await mount({
      authUserSelectList: {process: ['EDIT']},
      authRoleAuthSourcePathList: [{authGroup: 'process', auth: 'SHARED', sourcePathList: [
        source('其他来源'), {isSuperAdmin: true, teamPathNameList: []}
      ]}]
    }, locale);
    try {
      const expected = {
        summary: t('term.framework.authsourcepathintro'),
        details: [{text: `1. ${locale === 'zh' ? '超级管理员' : 'Super administrator'}`, nodes: []}]
      };
      assert.deepEqual(tips(vm), expected);
      vm.authCodeSelectList = {process: ['SHARED']};
      await settle();
      assert.deepEqual(tips(vm), {summary: t('term.framework.codeauthreadonly'), details: []});
      // 超级管理员来源仍存在，移除代码权限后无需重新加载即可恢复提示。
      vm.authCodeSelectList = {};
      await settle();
      assert.deepEqual(tips(vm), expected);
      assert.equal(vm.$el.querySelector('input[data-auth="SHARED"]').disabled, true);
      assert.deepEqual(plain(vm.displayAuthSelectList.process), ['EDIT', 'SHARED']);
      // 名称点击及组选择更新仍沿用只读拦截，保存集合仅保留原有直接授权。
      vm.$el.querySelector('.auth-name-tooltip > span').dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));
      vm.updateAuthSelection('process', ['EDIT']);
      await settle();
      assert.deepEqual(plain(vm.authSelectList), {process: ['EDIT']});
      vm.handleCheckAll(catalog[0]);
      await settle();
      assert.deepEqual(plain(vm.authSelectList), {});
      assert.deepEqual(plain(vm.displayAuthSelectList.process), ['SHARED']);
      assert.deepEqual(tips(vm), expected);
    } finally { destroy(vm); }
  });

  // 仅布尔true表示超级管理员，普通来源的缺失、null和false均不改变提示优先级。
  test(`${locale}：未标记超级管理员时保留角色路径和代码权限提示`, async() => {
    const t = translator(locale);
    const vm = await mount({}, locale);
    try {
      for (const flag of [undefined, null, false, 'true']) {
        vm.authCodeSelectList = {};
        vm.authRoleAuthSourcePathList = [{authGroup: 'process', auth: 'SHARED', sourcePathList: [
          {...source('普通角色'), isSuperAdmin: flag}
        ]}];
        await settle();
        assert.deepEqual(plain(vm.getReadonlyAuthTips(inherited, 'process')), {
          summary: t('term.framework.authsourcepathintro'),
          details: [{description: '', nodes: [{type: 'role', name: '普通角色'}, {type: 'permission', name: '继承权限'}]}]
        });
        vm.authCodeSelectList = {process: ['SHARED']};
        await settle();
        assert.deepEqual(tips(vm), {summary: t('term.framework.codeauthreadonly'), details: []});
      }
    } finally { destroy(vm); }
  });

  test(`${locale}：全部来源按组和编码隔离，重复角色不合并，原名及 HTML 保持纯文本`, async() => {
    const t = translator(locale);
    const roleName = '<img src=x onerror=alert(1)>系统_管理员角色';
    const vm = await mount({authRoleAuthSourcePathList: [
      {authGroup: 'process', auth: 'SHARED', sourcePathList: [source(roleName), source('第二角色')]},
      {authGroup: 'process', auth: 'SHARED', sourcePathList: [source(roleName)]},
      {authGroup: 'other', auth: 'SHARED', sourcePathList: [source('另一权限组角色')]},
      {authGroup: 'process', auth: 'UNRELATED', sourcePathList: [source('不应串用的角色')]}
    ]}, locale);
    try {
      assert.deepEqual(tips(vm), expectedTips(t, [roleName, '第二角色', roleName].map(name => [roleNode(name), authNode('继承权限')])));
      assert.deepEqual(tips(vm, 2), expectedTips(t, [[roleNode('另一权限组角色'), authNode('继承权限')]]));
      assert.equal(vm.$el.querySelector('img'), null);
      assert.match(vm.$el.innerHTML, /&lt;img/);
      assert.equal(vm.$el.querySelector('.auth-name-tooltip [data-tooltip-content]').textContent, '权限说明');
      // 宽度和原说明提示保持独立，路径节点只展示内容，没有点击事件。
      assert.equal(vm.$el.querySelector('.auth-checkbox-tooltip').getAttribute('max-width'), '600');
      assert.equal(vm.$el.querySelector('.auth-name-tooltip').getAttribute('max-width'), '300');
      vm.$el.querySelector('.auth-checkbox-tooltip .tsfont-role').dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));
      await settle();
      assert.deepEqual(plain(vm.authSelectList), {});
    } finally { destroy(vm); }
  });

  test(`${locale}：分组来源仅显示所属分组原名，后续来源同步显示`, async() => {
    const t = translator(locale);
    const roleName = '系统_管理员角色';
    const teamPathNameList = ['苏州银行分组', '金融市场总部', '<b>金融同业部分组</b>'];
    const vm = await mount({authRoleAuthSourcePathList: [
      {authGroup: 'process', auth: 'SHARED', sourcePathList: [source(roleName, teamPathNameList), source('后续来源')]}
    ]}, locale);
    try {
      assert.deepEqual(tips(vm), expectedTips(t, [
        [teamNode(teamPathNameList[2]), roleNode(roleName), authNode('继承权限')],
        [roleNode('后续来源'), authNode('继承权限')]
      ]));
      assert.equal(vm.$el.querySelector('b'), null);
      assert.match(vm.$el.innerHTML, /&lt;b&gt;/);
      assert.equal(tips(vm).details[0].text.includes('金融市场总部'), false);
    } finally { destroy(vm); }
  });

  test(`${locale}：缺失来源或资料回退原提示，保留编号，代码权限提示优先`, async() => {
    const t = translator(locale);
    const vm = await mount({}, locale);
    try {
      assert.deepEqual(tips(vm), {summary: t('term.framework.notcancelauth'), details: []});
      for (const sources of [
        [{authGroup: 'other', auth: 'SHARED', sourcePathList: []}],
        [{authGroup: 'process', auth: 'SHARED', sourcePathList: []}]
      ]) {
        vm.authRoleAuthSourcePathList = sources;
        await settle();
        assert.deepEqual(tips(vm), {summary: t('term.framework.notcancelauth'), details: []});
      }
      // 不完整来源保留位置，后续有效来源仍正常显示，不将残缺角色伪装为用户直接权限。
      const includeAuthPathList = [{authGroup: 'process', auth: 'ROOT'}, {authGroup: 'process', auth: 'SHARED'}];
      for (const incomplete of [
        {...source('某角色'), teamUuid: 'team-missing'}, source(''), null,
        {...source(null), includeAuthPathList},
        {...source('某角色'), includeAuthPathList: [null, {authGroup: 'process', auth: 'SHARED'}]}
      ]) {
        vm.authRoleAuthSourcePathList = [{authGroup: 'process', auth: 'SHARED', sourcePathList: [incomplete, source('后续角色')]}];
        await settle();
        assert.deepEqual(tips(vm), {
          summary: t('term.framework.authsourcepathintro'),
          details: [
            {text: `1. ${t('term.framework.notcancelauth')}`, nodes: []},
            {text: '2. 后续角色 → 继承权限', nodes: [roleNode('后续角色'), authNode('继承权限')]}
          ]
        });
      }
      vm.authRoleAuthSourcePathList = [{authGroup: 'process', auth: 'SHARED', sourcePathList: [source('某角色')]}];
      vm.authCodeSelectList = {process: ['SHARED']};
      await settle();
      assert.deepEqual(tips(vm), {summary: t('term.framework.codeauthreadonly'), details: []});
    } finally { destroy(vm); }
  });

  test(`${locale}：直接、角色及分组包含路径保留完整多层链，跨组查名并回退编码`, async() => {
    const t = translator(locale);
    const roleName = '<img src=x>系统_管理员角色';
    const teamPathNameList = ['苏州银行分组', '<b>金融同业部分组</b>'];
    const names = locale === 'zh' ? ['<i>根权限</i>', '中间权限', 'MISSING', '目标权限'] : ['<i>Root permission</i>', 'Middle permission', 'MISSING', 'Target permission'];
    const includeAuthPathList = [
      {authGroup: 'process', auth: 'ROOT'}, {authGroup: 'other', auth: 'MID'},
      {authGroup: 'unknown', auth: 'MISSING'}, {authGroup: 'process', auth: 'SHARED'}
    ];
    const authList = [
      {name: 'process', authVoList: [{name: 'ROOT', displayName: names[0]}, {name: 'MID', displayName: '不能串用此名称'}, {name: 'SHARED', displayName: names[3]}]},
      {name: 'other', authVoList: [{name: 'MID', displayName: names[1]}]}
    ];
    // 三类来源共享同一长链，验证用户直接授权不添加角色节点，分组只添加叶子名称。
    for (const [parentSource, prefix] of [
      [{...source(null), roleUuid: null}, []],
      [source(roleName), [roleNode(roleName)]],
      [source(roleName, teamPathNameList), [teamNode(teamPathNameList[1]), roleNode(roleName)]]
    ]) {
      const vm = await mount({authList, authRoleAuthSourcePathList: [{authGroup: 'process', auth: 'SHARED', sourcePathList: [
        {...parentSource, includeAuthPathList}, source('后续角色')
      ]}]}, locale);
      try {
        assert.deepEqual(tips(vm, 2), expectedTips(t, [
          [...prefix, ...names.map(authNode)], [roleNode('后续角色'), authNode(names[3])]
        ]));
        assert.equal(vm.$el.querySelector('img, b, i'), null);
        assert.match(vm.$el.innerHTML, /&lt;i&gt;/);
        vm.authCodeSelectList = {process: ['SHARED']};
        await settle();
        assert.deepEqual(tips(vm, 2), {summary: t('term.framework.codeauthreadonly'), details: []});
      } finally { destroy(vm); }
    }
  });

  test(`${locale}：用户给出的六来源按顺序显示编号路径和对应图标`, async() => {
    const t = translator(locale);
    const target = {authGroup: 'process', auth: 'PROCESS'};
    const codes = ['PROCESS_COLLECTION_PREPARATION_MODIFY', 'PROCESS_COLLECTION_TEMPLATE_MODIFY', 'PROCESS_BASE', 'PROCESS_COLLECTION'];
    const names = ['工单集合预案维护权限', '工单集合模板维护权限', 'IT服务基础权限', '工单集合使用权限'];
    const targetName = 'IT服务基础权限（接口）';
    const include = (roleName, index) => ({
      ...source(roleName, [], roleName || null),
      includeAuthPathList: [{authGroup: 'process', auth: codes[index]}, target]
    });
    // 分成两个接口条目验证顺序合并；同角色经不同途径获得权限时不合并来源。
    const allSources = [source('R_test3'), include(null, 0), include(null, 1), include('R_test', 2), include('R_test2', 3), {
      ...include('R_test2', 3), teamUuid: 'team-3', teamLft: 3910, teamPathNameList: ['T_测试组', 'T_测试组2', 'T_测试组3']
    }];
    const vm = await mount({
      authList: [{name: 'process', authVoList: [{name: 'PROCESS', displayName: targetName}, ...codes.map((name, index) => ({name, displayName: names[index]}))]}],
      authRoleSelectList: {process: ['PROCESS']},
      authRoleAuthSourcePathList: [
        {authGroup: 'process', auth: 'PROCESS', sourcePathList: allSources.slice(0, 3)},
        {authGroup: 'process', auth: 'PROCESS', sourcePathList: allSources.slice(3)}
      ]
    }, locale);
    try {
      const result = tips(vm);
      assert.deepEqual(result, expectedTips(t, [
        [roleNode('R_test3'), authNode(targetName)],
        [authNode(names[0]), authNode(targetName)],
        [authNode(names[1]), authNode(targetName)],
        [roleNode('R_test'), authNode(names[2]), authNode(targetName)],
        [roleNode('R_test2'), authNode(names[3]), authNode(targetName)],
        [teamNode('T_测试组3'), roleNode('R_test2'), authNode(names[3]), authNode(targetName)]
      ]));
      assert.equal(result.details.length, 6);
      // 固定说明及中文六条验收样例使用字面值，避免期望与实现共用翻译而掩盖错误。
      assert.equal(result.summary, locale === 'zh'
        ? '不允许取消授权，该权限由以下来源提供：'
        : 'Authorization cannot be revoked. This permission is provided by the following sources:');
      assert.deepEqual(result.details.map(detail => detail.text), [
        '1. R_test3 → IT服务基础权限（接口）',
        '2. 工单集合预案维护权限 → IT服务基础权限（接口）',
        '3. 工单集合模板维护权限 → IT服务基础权限（接口）',
        '4. R_test → IT服务基础权限 → IT服务基础权限（接口）',
        '5. R_test2 → 工单集合使用权限 → IT服务基础权限（接口）',
        '6. T_测试组3 → R_test2 → 工单集合使用权限 → IT服务基础权限（接口）'
      ]);
      assert.deepEqual(plain(vm.authSelectList), {});
    } finally { destroy(vm); }
  });
}

test('继承权限禁止勾选框、名称及取消全选撤销，保存集合不混入继承权限', async() => {
  const vm = await mount({authUserSelectList: {process: ['EDIT']}});
  try {
    assert.equal(vm.$el.querySelector('[data-auth="SHARED"]').disabled, true);
    assert.equal(vm.$el.querySelector('[data-auth="EDIT"]').disabled, false);
    vm.$el.querySelector('.auth-name-tooltip .check-all-text-pr').dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));
    await settle();
    assert.deepEqual(plain(vm.authSelectList), {process: ['EDIT']});
    vm.$el.querySelector('.flex-start').dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));
    await settle();
    assert.deepEqual(plain(vm.authSelectList), {});
    assert.deepEqual(plain(vm.displayAuthSelectList.process), ['SHARED']);
    const group = vm.$children.find(child => child.$options.props && child.$options.props.value);
    group.$emit('input', ['SHARED', 'EDIT']);
    await settle();
    assert.deepEqual(plain(vm.authSelectList), {process: ['EDIT']});
    assert.deepEqual(plain(vm.authRoleSelectList), {process: ['SHARED']});
  } finally { destroy(vm); }
});

test('整体只读继续阻止单选和全选，隐藏批量入口', async() => {
  const vm = await mount({readOnly: 'true', authUserSelectList: {process: ['EDIT']}});
  try {
    assert.equal(vm.$el.querySelector('.flex-start'), null);
    assert.equal(vm.$el.querySelector('[data-auth="EDIT"]').disabled, true);
    vm.toggleAuth(editable, 'process');
    vm.handleCheckAll(catalog[0]);
    vm.updateAuthSelection('process', []);
    assert.deepEqual(plain(vm.authSelectList), {process: ['EDIT']});
  } finally { destroy(vm); }
});

test('包含独有权限不新增直接授权，已有双重来源的直接授权仍保留', async() => {
  const vm = await mount({authUserSelectList: {process: ['EDIT']}});
  try {
    // CheckboxGroup 提交展示并集时，应过滤后端展开的包含独有项。
    vm.updateAuthSelection('process', ['EDIT', 'SHARED']);
    assert.deepEqual(plain(vm.authSelectList), {process: ['EDIT']});
    vm.authUserSelectList = {process: ['EDIT', 'SHARED']};
    await settle();
    vm.updateAuthSelection('process', []);
    assert.deepEqual(plain(vm.authSelectList), {process: ['SHARED']});
  } finally { destroy(vm); }
});

test('父页面查询接入新字段，旧响应主动清理来源且不改变原授权对象', async() => {
  const sources = [{authGroup: 'process', auth: 'SHARED', sourcePathList: [source('某角色')]}];
  const payload = {userAuthObj: {process: ['EDIT']}, userRoleAuthObj: {process: ['SHARED']}, userRoleAuthSourcePathList: sources};
  const calls = [];
  const context = pageContext({$api: {common: {getUserAuth: async params => { calls.push(params); return {Status: 'OK', Return: payload}; }}}});
  await context.getAuthSelect('user-1');
  assert.deepEqual(calls, [{userUuid: 'user-1'}]);
  assert.deepEqual(context.authRoleAuthSourcePathList, sources);
  assert.deepEqual(context.authUserSelectList, payload.userAuthObj);
  assert.notEqual(context.authUserSelectList, payload.userAuthObj);
  assert.deepEqual(context.authRoleSelectList, payload.userRoleAuthObj);
  delete payload.userRoleAuthSourcePathList;
  await context.getAuthSelect('user-2');
  assert.deepEqual(context.authRoleAuthSourcePathList, []);
});

test('父页面角色变更立即清空旧来源，无需等待角色权限请求完成', async() => {
  const response = deferred();
  const calls = [];
  const context = pageContext({authRoleAuthSourcePathList: [{auth: 'SHARED'}], $api: {common: {getRoleAuth: params => { calls.push(params); return response.promise; }}}});
  context.roleChange(['role#role-2']);
  assert.deepEqual(context.authRoleAuthSourcePathList, []);
  assert.deepEqual(calls, [{roleUuidList: ['role-2']}]);
  response.resolve({Status: 'OK', Return: {roleAuthList: {process: ['NEW']}}});
  await settle();
  assert.deepEqual(context.authRoleSelectList, {process: ['NEW']});
});

test('父页面基本信息成功保存后重新加载来源，加载状态等待查询完成', async() => {
  const response = deferred();
  const calls = [];
  const sources = [{authGroup: 'process', auth: 'SHARED', sourcePathList: [source('新角色')]}];
  const commonAuth = await mount({authUserSelectList: {process: ['EDIT']}});
  const context = pageContext({
    $refs: {
      commonAuth,
      userForm: {valid: () => true, getFormValue: () => ({uuid: 'user-1'})}
    },
    userTabsAuthList: {process: ['EDIT']},
    $api: {
      framework: {user: {saveUser: async params => { calls.push(['save', plain(params)]); return {Status: 'OK'}; }}},
      common: {getUserAuth: params => { calls.push(['search', params]); return response.promise; }}
    }});
  // 模拟父组件 prop 绑定，真实 watcher 在 nextTick 中恢复后端直接授权集合。
  context.getAuthSelect = async uuid => {
    await UserAddview.methods.getAuthSelect.call(context, uuid);
    commonAuth.authUserSelectList = context.authUserSelectList;
  };
  try {
    context.editSave();
    await settle();
    assert.deepEqual(calls, [['save', {uuid: 'user-1'}], ['search', {userUuid: 'user-1'}]]);
    assert.equal(context.isLoading, true);
    response.resolve({Status: 'OK', Return: {userAuthObj: {}, userRoleAuthObj: {process: ['SHARED']}, userRoleAuthSourcePathList: sources}});
    await settle();
    assert.deepEqual(context.authRoleAuthSourcePathList, sources);
    assert.equal(context.isLoading, false);
    assert.deepEqual(plain(context.userTabsAuthList), {});
    assert.deepEqual(plain(context.userData.userAuthList), {});
    context.tabsName = 'auth';
    assert.equal(context.tabClick('user'), false);
  } finally { destroy(commonAuth); }
});

test('授权保存仅提交直接授权并等待重新查询；取消根权限后包含项移除且独立授权保留', async() => {
  const calls = [];
  const direct = {process: ['EDIT', 'ROOT']};
  const response = deferred();
  const authList = [{name: 'process', authVoList: [editable, inherited, {name: 'ROOT', displayName: '根权限'}]}];
  const sources = [{authGroup: 'process', auth: 'SHARED', sourcePathList: [{
    ...source(null), roleUuid: null, includeAuthPathList: [{authGroup: 'process', auth: 'ROOT'}, {authGroup: 'process', auth: 'SHARED'}]
  }]}];
  const commonAuth = await mount({authList, authUserSelectList: direct});
  let refreshCount = 0;
  const context = pageContext({
    tabsName: 'auth', authRoleAuthSourcePathList: sources,
    $refs: {commonAuth},
    $api: {common: {
      saveAuth: async data => { calls.push(['save', plain(data)]); return {Status: 'OK'}; },
      getUserAuth: params => {
        calls.push(['search', params]);
        refreshCount++;
        return refreshCount === 1 ? response.promise : Promise.resolve({Status: 'OK', Return: {
          userAuthObj: {process: ['EDIT']}, userRoleAuthObj: {}, userRoleAuthSourcePathList: []
        }});
      }
    }}
  });
  // 用真实组件 watcher 模拟父页面刷新后的三个 prop 传递，校验保存快照等待其完成。
  context.getAuthSelect = async uuid => {
    await UserAddview.methods.getAuthSelect.call(context, uuid);
    commonAuth.authUserSelectList = context.authUserSelectList;
    commonAuth.authRoleSelectList = context.authRoleSelectList;
    commonAuth.authRoleAuthSourcePathList = context.authRoleAuthSourcePathList;
  };
  try {
    context.editSave();
    await settle();
    assert.deepEqual(calls, [['save', {action: 'cover', userAuthList: direct, userUuidList: ['user-1']}], ['search', {userUuid: 'user-1'}]]);
    assert.equal(context.isLoading, true);
    response.resolve({Status: 'OK', Return: {userAuthObj: direct, userRoleAuthObj: {process: ['SHARED']}, userRoleAuthSourcePathList: sources}});
    await settle();
    assert.equal(context.isLoading, false);
    assert.deepEqual(plain(context.userTabsAuthList), direct);
    assert.deepEqual(plain(context.defaultAuthUserSelectList), direct);
    assert.deepEqual(plain(context.userData.userAuthList), direct);
    assert.deepEqual(plain(commonAuth.displayAuthSelectList.process), ['EDIT', 'ROOT', 'SHARED']);
    commonAuth.toggleAuth({name: 'ROOT'}, 'process');
    assert.deepEqual(plain(commonAuth.authSelectList), {process: ['EDIT']});
    context.editSave();
    await settle();
    assert.deepEqual(calls.slice(-2), [['save', {action: 'cover', userAuthList: {process: ['EDIT']}, userUuidList: ['user-1']}], ['search', {userUuid: 'user-1'}]]);
    assert.deepEqual(plain(commonAuth.displayAuthSelectList.process), ['EDIT']);
    assert.deepEqual(plain(commonAuth.authRoleAuthSourcePathList), []);
    assert.deepEqual(plain(context.userTabsAuthList), {process: ['EDIT']});
    assert.deepEqual(plain(context.defaultAuthUserSelectList), {process: ['EDIT']});
    assert.equal(context.tabClick('user'), false);
  } finally { destroy(commonAuth); }
});
