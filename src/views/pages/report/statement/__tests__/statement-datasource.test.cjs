const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
const compiler = require('vue/compiler-sfc');
const { JSDOM } = require('jsdom');

// 加载真实页面、公共取数逻辑和 API 封装，仅替换网络及图表绘制等外部依赖。
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
const Vue = require('vue/dist/vue.common.js');
Vue.config.productionTip = false;
Vue.config.devtools = false;
const errors = [];
Vue.config.errorHandler = error => errors.push(error);
const src = path.resolve(__dirname, '../../../../..');
const page = path.join(src, 'views/pages/report/statement');
const apiPath = path.join(src, 'resources/api/report/statement');
const datasourceTypeUrl = '/api/rest/dashboard/datasource/type/list';
const plain = value => value == null ? value : JSON.parse(JSON.stringify(value));
const utils = {
  deepClone: plain,
  isSame: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  isValidDateTime: () => false,
  isValidTimeString: () => false,
  setUuid: () => 'test-widget-uuid'
};

// 通用表单外壳保留 slot，便于检查实际模板传给 TsFormSelect 的接口与参数。
const layout = { render(h) { return h('div', Object.keys(this.$scopedSlots).flatMap(key => this.$scopedSlots[key]({}))); } };
const select = {
  name: 'TsFormSelect',
  props: ['dynamicUrl', 'url', 'params', 'value', 'valueName', 'textName', 'rootName', 'dataList', 'isMultiple'],
  render(h) { return h('div'); }
};
// 叶控件只记录真实 wrapper 传入的配置，条件组件和事件链使用生产实现。
const userSelect = {
  name: 'UserSelect',
  props: ['value', 'multiple', 'groupList', 'includeList', 'excludeList'],
  render(h) { return h('div'); }
};
['Slider', 'Divider', 'Tag', 'Badge'].forEach(name => Vue.component(name, layout));

function load(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(file, 'utf8');
  const script = file.endsWith('.vue') ? compiler.parse({ source, filename: file }).script.content : source;
  const { code } = babel.transformSync(script, {
    filename: file,
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs', 'babel-plugin-dynamic-import-node']
  });
  const moduleObject = { exports: {} };
  const resolve = request => {
    if (request in dependencies) return dependencies[request];
    if (request.endsWith('/datasource') || request === './datasource') return datasource;
    if (request.endsWith('/TsFormSelect')) return { __esModule: true, default: select };
    if (request.endsWith('/init.js')) return { $t: key => key };
    if (request.includes('widget-list')) return { WIDGETS: [], WIDGET_TYPES: [] };
    if (request.includes('widgetthemes')) return {};
    return { __esModule: true, default: layout };
  };
  new Function('require', 'module', 'exports', ...Object.keys(globals), code)(resolve, moduleObject, moduleObject.exports, ...Object.values(globals));
  return moduleObject.exports;
}
const datasource = load(path.join(apiPath, 'datasource.js'));
// 异步配置快照和真实表单控件使用生产工具方法，保留 null/空集合及 Vue 响应式对象的比较语义。
const productionUtils = load(path.join(src, 'resources/assets/js/util.js'), { vue: Vue, lodash: require('lodash') }).default;
['deepClone', 'isSame', 'isEmpty', 'uniqueByField', 'equalStr'].forEach(name => {
  utils[name] = (...args) => productionUtils[name](...args);
});

function createApi(response = () => ({ Return: {} })) {
  const calls = [];
  // 同时保留原引用和既有请求快照，直接验证公共封装不复制参数、不吞掉 undefined。
  const rawCalls = [];
  const axios = { post: async(url, params) => {
    rawCalls.push({ url, params });
    calls.push({ url, params: plain(params) });
    return response(url, params);
  } };
  const statement = load(path.join(apiPath, 'statement.js'), { '../../http': { __esModule: true, default: axios } }).default;
  const common = load(path.join(src, 'resources/api/common/index.js'), { '../http': { __esModule: true, default: axios } }).default;
  return { statement, common, calls, rawCalls };
}

async function settle() {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
    await Vue.nextTick();
  }
  assert.deepEqual(errors.splice(0), []);
}

function inject(vm, api) {
  vm.$api = { common: api.common, report: { statement: api.statement } };
  vm.$t = key => key;
  vm.$utils = utils;
  vm.$store = { getters: { themeType: 'light' } };
}

function find(vm, predicate) {
  if (predicate(vm)) return vm;
  for (const child of vm.$children) {
    const found = find(child, predicate);
    if (found) return found;
  }
}

// 详情接口只返回 fieldList，每项严格限定六个属性，缺失的可选源属性保留 null。
function minimalDatasourceDetail() {
  return { fieldList: [
    { id: 1, label: '耗时', type: 'number', isCondition: 0, inputType: null, config: null },
    { id: 2, label: '作业名', type: 'text', isCondition: 0, inputType: null, config: null },
    { id: 3, label: '作业状态', type: 'text', isCondition: 1, inputType: 'enumselect', config: { enum: 'test.JobStatus', isMultiple: true } },
    { id: 4, label: '处理人', type: 'text', isCondition: 1, inputType: 'userselect', config: { groupList: ['user', 'team'], isMultiple: 1 } }
  ] };
}

// 同时加载真实脚本和模板，使字段绑定、点击及事件传递均执行页面实际逻辑。
function loadVue(file, dependencies = {}) {
  const component = load(file, dependencies).default;
  const parsed = compiler.parse({ source: fs.readFileSync(file, 'utf8'), filename: file });
  Object.assign(component, Vue.compile(parsed.template.content));
  return component;
}

// 使用真实 ConditionHandler 与枚举、用户 wrapper，保留生产动态组件分发过程。
function realConditionDependencies() {
  const folder = path.join(src, 'views/pages/framework/datawarehouse');
  const handlers = load(path.join(folder, 'conditionhandlers/index.js'), {
    './enumselect-handler.vue': { __esModule: true, default: loadVue(path.join(folder, 'conditionhandlers/enumselect-handler.vue')) },
    './userselect-handler.vue': { __esModule: true, default: loadVue(path.join(folder, 'conditionhandlers/userselect-handler.vue'), {
      '@/resources/components/UserSelect/UserSelect.vue': { __esModule: true, default: userSelect }
    }) }
  });
  return {
    '@/views/pages/framework/datawarehouse/condition-handler.vue': {
      __esModule: true,
      default: loadVue(path.join(folder, 'condition-handler.vue'), { './conditionhandlers/index.js': handlers })
    }
  };
}

function findAll(vm, predicate) {
  return (predicate(vm) ? [vm] : []).concat(vm.$children.flatMap(child => findAll(child, predicate)));
}

function mountPanel(widget, api, definition = { dataTypes: [], fields: [{ name: 'angleField', type: 'number' }] }, dependencies = {}) {
  // 真实页面的组件参数来自父级响应式 widgetList，测试也建立同样的观察关系。
  Vue.observable(widget);
  const file = path.join(page, 'statement-data-edit.vue');
  const component = loadVue(file, dependencies);
  return new Vue({
    ...component,
    propsData: { currentWidget: widget, currentWidgetComponent: definition },
    beforeCreate() { inject(this, api); }
  }).$mount();
}

// 保留真实表单脚本、生命周期和请求取消逻辑，仅用原生 DOM 代替 iView 的显示外壳。
function realDatasourceControls(api, https) {
  const formMixins = load(path.join(src, 'resources/mixins/formMixins.js')).default;
  const dependencies = { '@/resources/mixins/formMixins.js': { __esModule: true, default: formMixins } };
  const radio = load(path.join(src, 'resources/plugins/TsForm/TsFormRadio.vue'), dependencies).default;
  // 类型候选只由模拟 HTTP 响应提供，真实控件不再接收写死的 dataList。
  const radioHttps = https || queuedListRequests().https;
  radio.beforeCreate = function() { inject(this, api); this.$https = radioHttps; };
  radio.render = function(h) {
    return h('div', this.nodeList.map(item => h('input', {
      attrs: { type: 'radio', value: item[this.valueName] },
      domProps: { checked: this.currentValue === item[this.valueName] },
      on: { change: () => {
        this.currentValue = item[this.valueName];
        this.onChangeValue();
      } }
    })));
  };
  const result = { '@/resources/plugins/TsForm/TsFormRadio': { __esModule: true, default: radio } };
  if (https) {
    dependencies['@/resources/mixins/formScrollMixins.js'] = {
      __esModule: true, default: load(path.join(src, 'resources/mixins/formScrollMixins.js')).default
    };
    const selector = load(path.join(src, 'resources/plugins/TsForm/TsFormSelect.vue'), dependencies).default;
    selector.beforeCreate = function() { inject(this, api); this.$https = https; };
    selector.render = function(h) { return h('div', this.nodeList.map(item => h('span', String(item[this.textName])))); };
    result['@/resources/plugins/TsForm/TsFormSelect'] = { __esModule: true, default: selector };
  }
  return result;
}

function datasourceRadio(panel) {
  return find(panel, child => child.$options.name === 'TsFormRadio' && child.url === datasourceTypeUrl);
}

// 原生 change 经过 TsFormRadio.onChangeValue 发出生产 change 事件，再进入面板处理方法。
async function selectDatasourceType(panel, type) {
  const radio = datasourceRadio(panel);
  assert.ok(radio, '动态面板应显示数据源类型');
  const input = radio.$el.querySelector(`input[value="${type}"]`);
  assert.ok(input);
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
  await settle();
}

// 按接口区分类型列表与具体数据源列表；默认类型仅是服务端响应夹具，空/失败响应不提供兜底。
function queuedListRequests({ deferTypes = false, typeRows = [
  { value: 'datawarehouse', text: '数据仓库' }, { value: 'integration', text: '集成' }
] } = {}) {
  const requests = [];
  const typeRequests = [];
  const https = config => new Promise(resolve => {
    const isType = config.url === datasourceTypeUrl;
    assert.ok(isType || config.url === '/api/rest/dashboard/datasource/list', '只允许模拟已声明的列表接口');
    const request = {
      config: { ...config, data: plain(config.data) },
      resolve(rows = isType ? typeRows : [], currentPage = 1, pageCount = 1, status = 'OK') {
        resolve({ Status: status, Return: isType ? { tbodyList: rows } : { tbodyList: rows, currentPage, pageCount } });
      }
    };
    (isType ? typeRequests : requests).push(request);
    if (isType && !deferTypes) request.resolve();
  });
  https.CancelToken = { source: () => {
    const token = { cancelled: false };
    return { token, cancel() { token.cancelled = true; } };
  } };
  return { https, requests, typeRequests };
}

test('三个公共数据源 API 原样传递参数对象，报表 API 不再保留旧方法', async() => {
  const { common, statement, rawCalls } = createApi();
  const methods = ['listDashboardDatasource', 'getDashboardDatasource', 'searchDashboardDatasourceData'];
  for (const name of methods) {
    assert.equal(typeof common[name], 'function');
    assert.equal(Object.hasOwn(statement, name), false);
    assert.equal(statement[name], undefined);
  }
  // 公共入口重命名后不保留旧别名，报表模块也不能重新暴露旧方法。
  for (const name of ['listDatasource', 'getDatasource', 'searchDatasourceData']) {
    for (const api of [common, statement]) {
      assert.equal(Object.hasOwn(api, name), false);
      assert.equal(api[name], undefined);
    }
  }
  for (const value of [undefined, null, '', ' \t ', 'datawarehouse', 'integration', ' custom ']) {
    const params = { datasourceType: value, keyword: '耗时', defaultValue: ['101'], currentPage: 2, pageSize: 10, id: 101, dataSourceId: 101, sortList: [{ fieldId: 7, type: 'DESC' }] };
    const before = { ...params, defaultValue: ['101'], sortList: [{ fieldId: 7, type: 'DESC' }] };
    for (const name of methods) await common[name](params);
    assert.deepEqual(rawCalls.slice(-3).map(call => call.url), [
      '/api/rest/dashboard/datasource/list',
      '/api/rest/dashboard/datasource/get',
      '/api/rest/dashboard/datasource/data/search'
    ]);
    rawCalls.slice(-3).forEach(call => {
      assert.equal(call.params, params);
      assert.equal(Object.hasOwn(call.params, 'datasourceType'), true);
      assert.equal(call.params.datasourceType, value);
    });
    assert.deepEqual(params, before);
  }
  // 未提供类型的对象仍原样传递，列表方法自身的缺省参数只生成空对象。
  const untyped = { id: 101, dataSourceId: 101 };
  for (const name of methods) {
    await common[name](untyped);
    assert.equal(rawCalls.at(-1).params, untyped);
    assert.equal(Object.hasOwn(rawCalls.at(-1).params, 'datasourceType'), false);
  }
  assert.deepEqual(untyped, { id: 101, dataSourceId: 101 });
  await common.listDashboardDatasource();
  assert.deepEqual(rawCalls.at(-1), { url: '/api/rest/dashboard/datasource/list', params: {} });
  await common.searchDashboardDatasourceData({ dataSourceId: 101 });
  assert.equal(Object.hasOwn(rawCalls.at(-1).params, 'limit'), false);
  for (const limit of [0, 5]) {
    await common.searchDashboardDatasourceData({ dataSourceId: 101, limit });
    assert.equal(rawCalls.at(-1).params.limit, limit);
  }
  assert.equal(datasource.getDatasourceType('integration'), 'integration');
  assert.equal(datasource.getDatasourceType(' custom '), ' custom ');
});

test('数据面板及组件调用公共 API 前仍处理空类型，未知非空类型保持原值', async() => {
  for (const value of [undefined, null, '', ' \t ', 'datawarehouse', 'integration', ' custom ']) {
    const type = datasource.getDatasourceType(value);
    const api = createApi(url => ({ Return: url.endsWith('/datasource/get') ? { fieldList: [] } : { theadList: [], tbodyList: [] } }));
    const widget = { dataType: 'dynamic', datasourceId: 101, datasourceType: value, fields: [] };
    const panel = mountPanel(widget, api, { dataTypes: [], fields: [] });
    const mounted = mountWidget(widget, { fields: [] }, api);
    try {
      await settle();
      assert.equal(api.rawCalls.length, 2);
      assert.deepEqual(api.rawCalls.map(call => call.url).sort(), [
        '/api/rest/dashboard/datasource/data/search', '/api/rest/dashboard/datasource/get'
      ]);
      api.rawCalls.forEach(call => assert.equal(call.params.datasourceType, type));
      const selector = find(panel, child => child.$options.name === 'TsFormSelect' && child.dynamicUrl);
      assert.equal(selector.dynamicUrl, '/api/rest/dashboard/datasource/list');
      assert.equal(selector.params.datasourceType, type);
      assert.equal(widget.datasourceType, value);
    } finally { panel.$destroy(); mounted.vm.$destroy(); }
  }
});

test('实际数据面板下拉框传类型，类型和 ID 任一变化会重新获取字段', async() => {
  // 不再为详情字段提供 name，类型变化与字段读取只依赖最小详情属性。
  const fields = [{ id: 1, label: '耗时', type: 'number', isCondition: 0, inputType: null, config: null }, { id: 2, label: '作业名', type: 'text', isCondition: 1, inputType: 'text', config: null }];
  const api = createApi(() => ({ Return: { fieldList: fields } }));
  const widget = { dataType: 'dynamic', datasourceId: 101 };
  const vm = mountPanel(widget, api);
  try {
    await settle();
    const selector = find(vm, child => child.$options.name === 'TsFormSelect' && child.dynamicUrl);
    assert.ok(selector);
    assert.equal(selector.dynamicUrl, '/api/rest/dashboard/datasource/list');
    assert.deepEqual(plain(selector.params), { datasourceType: 'datawarehouse' });
    assert.equal(selector.rootName, 'tbodyList');
    assert.equal(selector.valueName, 'id');
    assert.equal(selector.textName, 'label');
    assert.deepEqual(api.calls[0], { url: '/api/rest/dashboard/datasource/get', params: { id: 101, datasourceType: 'datawarehouse' } });
    assert.deepEqual(vm.getDatasourceFieldList({ type: 'number' }).map(field => field.id), [1]);
    assert.deepEqual(vm.datasourceConditionList.map(field => field.id), [2]);
    Vue.set(widget, 'datasourceType', 'integration');
    await settle();
    assert.deepEqual(api.calls.at(-1).params, { id: 101, datasourceType: 'integration' });
    // 来源类型是下拉实例的 key，切换后必须读取重建实例，旧实例不能继续承载候选项。
    const integrationSelector = find(vm, child => child.$options.name === 'TsFormSelect' && child.dynamicUrl);
    assert.notEqual(integrationSelector, selector);
    assert.equal(selector._isDestroyed, true);
    assert.deepEqual(plain(integrationSelector.params), { datasourceType: 'integration' });
    widget.datasourceId = 102;
    await settle();
    assert.deepEqual(api.calls.at(-1).params, { id: 102, datasourceType: 'integration' });
    const count = api.calls.length;
    widget.datasourceId = null;
    await settle();
    assert.equal(api.calls.length, count);
    assert.deepEqual(plain(vm.datasourceFieldList), []);
    assert.deepEqual(plain(vm.datasourceConditionList), []);
  } finally { vm.$destroy(); }
});

test('最小六属性详情支持实际字段下拉绑定、类型过滤及多字段排序点击', async() => {
  const detail = minimalDatasourceDetail();
  assert.deepEqual(Object.keys(detail), ['fieldList']);
  detail.fieldList.forEach(field => {
    assert.deepEqual(Object.keys(field).sort(), ['config', 'id', 'inputType', 'isCondition', 'label', 'type']);
    assert.equal(Object.hasOwn(field, 'name'), false);
  });
  const api = createApi(() => ({ Return: detail }));
  const pie = load(path.join(page, 'widgets/define/pie.js')).default;
  const widget = { dataType: 'dynamic', datasourceId: 101, fields: [{ name: 'angleField', datasourceField: 1 }, { name: 'colorField', datasourceField: 2 }] };
  const vm = mountPanel(widget, api, pie);
  try {
    await settle();
    const bindings = findAll(vm, child => child.$options.name === 'TsFormSelect' && Array.isArray(child.dataList));
    assert.equal(bindings.length, 2);
    bindings.forEach(binding => {
      assert.equal(binding.valueName, 'id');
      assert.equal(binding.textName, 'label');
    });
    assert.deepEqual(plain(bindings[0].dataList).map(({ id, label }) => ({ id, label })), [{ id: 1, label: '耗时' }]);
    assert.deepEqual(plain(bindings[1].dataList).map(({ id, label }) => ({ id, label })), [
      { id: 2, label: '作业名' }, { id: 3, label: '作业状态' }, { id: 4, label: '处理人' }
    ]);
    assert.equal(bindings[0].value, 1);
    assert.equal(bindings[1].value, 2);
    bindings[1].$emit('change', 3);
    await settle();
    assert.deepEqual(plain(widget.fields), [{ name: 'angleField', datasourceField: 1 }, { name: 'colorField', datasourceField: 3 }]);
    // 从真实模板触发排序点击，验证先后顺序、升降序切换及移除后再加入的优先级。
    const sortButtons = () => [...vm.$el.querySelectorAll('.tssort')];
    assert.deepEqual(sortButtons().map(button => button.previousElementSibling.textContent), ['耗时', '作业名', '作业状态', '处理人']);
    const clickSort = async index => {
      sortButtons()[index].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      await settle();
    };
    await clickSort(2);
    await clickSort(0);
    assert.deepEqual(plain(widget.sortList), [{ fieldId: 3, type: 'ASC' }, { fieldId: 1, type: 'ASC' }]);
    assert.ok(sortButtons()[2].classList.contains('down'));
    await clickSort(2);
    assert.deepEqual(plain(widget.sortList), [{ fieldId: 3, type: 'DESC' }, { fieldId: 1, type: 'ASC' }]);
    assert.ok(sortButtons()[2].classList.contains('up'));
    await clickSort(2);
    assert.deepEqual(plain(widget.sortList), [{ fieldId: 1, type: 'ASC' }]);
    assert.ok(sortButtons()[2].classList.contains('none'));
    await clickSort(2);
    assert.deepEqual(plain(widget.sortList), [{ fieldId: 1, type: 'ASC' }, { fieldId: 3, type: 'ASC' }]);
  } finally { vm.$destroy(); }
});

test('最小详情的原始枚举和用户配置经过真实条件组件回显、变更、保存并重开', async() => {
  const detail = minimalDatasourceDetail();
  const api = createApi(url => url.endsWith('/datasource/get') ? { Return: detail } : { Status: 'OK' });
  const pie = load(path.join(page, 'widgets/define/pie.js')).default;
  const dependencies = realConditionDependencies();
  const widget = { uuid: 'minimal-widget', dataType: 'dynamic', datasourceId: 101, conditionList: [
    { id: 3, inputType: 'enumselect', value: ['running'] },
    { id: 4, inputType: 'userselect', value: ['user#old'] }
  ] };
  const vm = mountPanel(widget, api, pie, dependencies);
  let editor;
  let reopened;
  const enumControl = panel => find(panel, child => child.$options.name === 'TsFormSelect' && child.url === '/api/rest/universal/enum/get');
  const userControl = panel => find(panel, child => child.$options.name === 'UserSelect');
  try {
    await settle();
    assert.deepEqual(vm.datasourceConditionList.map(field => field.id), [3, 4]);
    assert.deepEqual(plain(vm.datasourceConditionList.map(field => field.config)), plain(detail.fieldList.slice(2).map(field => field.config)));
    const enumeration = enumControl(vm);
    const user = userControl(vm);
    assert.ok(enumeration);
    assert.ok(user);
    assert.deepEqual(plain(enumeration.params), { enumClass: 'test.JobStatus' });
    assert.equal(enumeration.isMultiple, true);
    assert.deepEqual(plain(enumeration.value), ['running']);
    assert.deepEqual(plain(user.groupList), ['user', 'team']);
    assert.equal(user.multiple, true);
    assert.deepEqual(plain(user.value), ['user#old']);
    // 事件从叶控件穿过两个真实 wrapper 层，验证已有条件更新和新增条件记录。
    enumeration.$emit('on-change', ['completed']);
    widget.conditionList.splice(1, 1);
    await settle();
    assert.equal(user.value, null);
    user.$emit('change', ['user#new']);
    await settle();
    const expectedConditions = [
      { id: 3, inputType: 'enumselect', value: ['completed'] },
      { id: 4, inputType: 'userselect', value: ['user#new'] }
    ];
    assert.deepEqual(plain(widget.conditionList), expectedConditions);
    // 真实编辑页保存方法负责持久化 widgetList，详情对象无需携带数据源名称或字段 name。
    const component = load(path.join(page, 'statement-edit.vue')).default;
    editor = new Vue({
      data() { return { reportData: { id: 99, name: '最小详情契约', widgetList: [widget] } }; },
      beforeCreate() {
        inject(this, api);
        this.$Message = { warning() {}, success() {} };
      },
      methods: { ...component.methods, addHistory() {} }
    });
    editor.$refs.name = { valid: () => true };
    editor.saveReport();
    await settle();
    const saveCall = api.calls.find(call => call.url === '/api/rest/report/statement/save');
    assert.ok(saveCall);
    const savedWidget = saveCall.params.widgetList[0];
    assert.deepEqual(savedWidget.conditionList, expectedConditions);
    reopened = mountPanel(savedWidget, api, pie, dependencies);
    await settle();
    assert.deepEqual(plain(enumControl(reopened).value), ['completed']);
    assert.deepEqual(plain(userControl(reopened).value), ['user#new']);
    // 原配置对象中的 false/0 同样保持语义，用户 wrapper 负责转成控件布尔属性。
    reopened.datasourceConditionList[0].config.isMultiple = false;
    reopened.datasourceConditionList[1].config.isMultiple = 0;
    await settle();
    assert.equal(enumControl(reopened).isMultiple, false);
    assert.equal(userControl(reopened).multiple, false);
  } finally {
    vm.$destroy();
    if (editor) editor.$destroy();
    if (reopened) reopened.$destroy();
  }
});

test('切换类型、清空来源及销毁后旧字段响应不得回写', async() => {
  const pending = [];
  const api = createApi(() => new Promise(resolve => pending.push(resolve)));
  const widget = { dataType: 'dynamic', datasourceId: 101 };
  const vm = mountPanel(widget, api);
  try {
    await settle();
    Vue.set(widget, 'datasourceType', 'integration');
    await settle();
    pending[1]({ Return: { fieldList: [{ id: 22, type: 'number' }] } });
    await settle();
    pending[0]({ Return: { fieldList: [{ id: 11, type: 'number' }] } });
    await settle();
    assert.deepEqual(vm.datasourceFieldList.map(field => field.id), [22]);
    widget.datasourceId = 102;
    await settle();
    widget.datasourceId = null;
    await settle();
    pending[2]({ Return: { fieldList: [{ id: 33, type: 'number' }] } });
    await settle();
    assert.deepEqual(plain(vm.datasourceFieldList), []);
    widget.datasourceId = 103;
    await settle();
    vm.$destroy();
    pending[3]({ Return: { fieldList: [{ id: 44, type: 'number' }] } });
    await settle();
    assert.deepEqual(plain(vm.datasourceFieldList), []);
  } finally { vm.$destroy(); }
});

function mountWidget(widget, definition, api, allowRandomData = false) {
  Vue.observable(widget);
  const timers = new Map();
  let nextTimer = 0;
  const WidgetBase = load(path.join(page, 'widgets/widget-base.js'), {}, {
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); }
  }).WidgetBase;
  let changes = 0;
  let plots = 0;
  const vm = new Vue({
    extends: WidgetBase,
    propsData: { widget, widgetComponent: definition, canvas: { config: {} } },
    beforeCreate() { inject(this, api); },
    methods: {
      createPlot() { plots++; },
      changeData() { changes++; },
      createRandomData() {
        // 清空绑定后的空态由具体组件决定，竞态测试允许空示例，已有绑定回归仍拒绝误入示例分支。
        if (!allowRandomData) throw new Error('已绑定的动态组件不应回退到示例数据');
        this.data = [];
      }
    },
    render(h) { return h('div'); }
  }).$mount();
  return { vm, timers, changes: () => changes, plots: () => plots };
}

test('旧饼图无需重存即可取数，行映射、条件排序及返回行数保持原有行为', async() => {
  const pie = load(path.join(page, 'widgets/define/pie.js')).default;
  const api = createApi(() => ({ Return: { theadList: [], tbodyList: [{ field_1: 12.5, field_2: '应用A' }] } }));
  const widget = { dataType: 'dynamic', datasourceId: 101, fields: [{ name: 'angleField', datasourceField: 1 }, { name: 'colorField', datasourceField: 2 }], conditionList: [{ id: 2, value: '应用A' }], sortList: [{ fieldId: 1, type: 'DESC' }], limit: 8 };
  const mounted = mountWidget(widget, pie, api);
  try {
    await settle();
    assert.deepEqual(api.calls[0], { url: '/api/rest/dashboard/datasource/data/search', params: { dataSourceId: 101, datasourceType: 'datawarehouse', conditionList: plain(widget.conditionList), sortList: plain(widget.sortList), limit: 8 } });
    assert.deepEqual(plain(mounted.vm.data), [{ angleField: 12.5, colorField: '应用A' }]);
    assert.equal(mounted.changes(), 0);
    assert.equal(mounted.plots(), 1);
    assert.equal(Object.hasOwn(widget, 'datasourceType'), false);
  } finally { mounted.vm.$destroy(); }
});

// 通过真实挂载、请求和公共映射链验证字段兼容，不直接调用或复写取值表达式。
test('动态字段优先读取自有直接键，缺失时回退前缀键，并兼容字符串及数字字段 ID', async() => {
  const pie = load(path.join(page, 'widgets/define/pie.js')).default;
  for (const fieldId of ['duration', 101]) {
    const rows = [
      { [fieldId]: 12, [`field_${fieldId}`]: 99, category: '直接键', field_category: '旧分类' },
      { [`field_${fieldId}`]: 8, field_category: '前缀键' }
    ];
    const api = createApi(() => ({ Return: { theadList: [], tbodyList: rows } }));
    const widget = { dataType: 'dynamic', datasourceId: 101, fields: [
      { name: 'angleField', datasourceField: fieldId }, { name: 'colorField', datasourceField: 'category' }
    ] };
    const mounted = mountWidget(widget, pie, api);
    try {
      await settle();
      assert.equal(api.calls.length, 1);
      assert.deepEqual(plain(mounted.vm.data), [
        { angleField: 12, colorField: '直接键' }, { angleField: 8, colorField: '前缀键' }
      ]);
      assert.equal(mounted.plots(), 1);
    } finally { mounted.vm.$destroy(); }
  }
});

test('直接字段的 null、0、false、空字符串及显式 undefined 均原样保留，不回退前缀值', async() => {
  const values = [null, 0, false, '', undefined];
  const rows = values.map(value => ({ metric: value, field_metric: '不应回退' }));
  const api = createApi(() => ({ Return: { theadList: [], tbodyList: rows } }));
  const widget = { dataType: 'dynamic', datasourceId: 101, fields: [{ name: 'valueField', datasourceField: 'metric' }] };
  const mounted = mountWidget(widget, { fields: [{ name: 'valueField' }] }, api);
  try {
    await settle();
    assert.equal(mounted.vm.data.length, values.length);
    values.forEach((value, index) => {
      // 直接检查响应和映射结果，避免 JSON 序列化删除显式 undefined 后掩盖错误。
      assert.equal(Object.hasOwn(mounted.vm.tableData.tbodyList[index], 'metric'), true);
      assert.equal(Object.hasOwn(mounted.vm.data[index], 'valueField'), true);
      assert.equal(mounted.vm.data[index].valueField, value);
    });
  } finally { mounted.vm.$destroy(); }
});

test('原型上的直接字段不算自有键，两种自有键均缺失时映射结果保持 undefined', async() => {
  const inheritedWithFallback = Object.assign(Object.create({ metric: '原型值' }), { field_metric: '前缀值' });
  const inheritedWithoutFallback = Object.create({ metric: '原型值' });
  const rows = [inheritedWithFallback, inheritedWithoutFallback, {}];
  const api = createApi(() => ({ Return: { theadList: [], tbodyList: rows } }));
  const widget = { dataType: 'dynamic', datasourceId: 101, fields: [{ name: 'valueField', datasourceField: 'metric' }] };
  const mounted = mountWidget(widget, { fields: [{ name: 'valueField' }] }, api);
  try {
    await settle();
    assert.equal(Object.hasOwn(mounted.vm.tableData.tbodyList[0], 'metric'), false);
    assert.equal(mounted.vm.tableData.tbodyList[0].metric, '原型值');
    assert.equal(mounted.vm.data[0].valueField, '前缀值');
    for (const index of [1, 2]) {
      assert.equal(Object.hasOwn(mounted.vm.data[index], 'valueField'), true);
      assert.equal(mounted.vm.data[index].valueField, undefined);
    }
  } finally { mounted.vm.$destroy(); }
});

test('详情不提供字段 name 时，流程图绑定及自定义组件 theadList.name 映射保持不变', async() => {
  const autoexec = load(path.join(page, 'widgets/define/autoexec.js')).default;
  const definitions = [autoexec, { fields: [] }];
  const row = { field_1: '切换验证', field_2: 'completed', field_3: 1, field_4: 7, insertTime: 100 };
  const head = ['phase', 'status', 'done', 'group'].map((name, index) => ({ name, key: `field_${index + 1}` }));
  head.push({ key: 'insertTime', title: '插入时间' });
  // 详情字段仅包含六属性；自定义数据的属性名只能取自动态取数返回的 theadList。
  const detail = { fieldList: ['阶段名称', '阶段状态', '阶段进度', '阶段组'].map((label, index) => ({
    id: index + 1, label, type: index < 2 ? 'text' : 'number', isCondition: 0, inputType: null, config: null
  })) };
  for (const definition of definitions) {
    const api = createApi(url => ({ Return: url.endsWith('/datasource/get') ? detail : { theadList: head, tbodyList: [row] } }));
    const widget = { dataType: 'dynamic', datasourceId: 101, fields: autoexec.fields.map((field, index) => ({ name: field.name, datasourceField: index + 1 })) };
    const panel = mountPanel(widget, api, definition);
    const mounted = mountWidget(widget, definition, api);
    try {
      await settle();
      assert.equal(panel.datasourceFieldList.length, 4);
      assert.equal(panel.datasourceFieldList.some(field => Object.hasOwn(field, 'name')), false);
      assert.deepEqual(plain(mounted.vm.data), definition === autoexec ? [{ jobPhaseName: '切换验证', jobPhaseStatus: 'completed', progress: 1, jobGroupSort: 7 }] : [{ phase: '切换验证', status: 'completed', done: 1, group: 7 }]);
      assert.equal(api.calls.find(call => call.url.endsWith('/datasource/data/search')).params.limit, 0);
    } finally { panel.$destroy(); mounted.vm.$destroy(); }
  }
});

test('类型变化触发公共取数，定时刷新走新接口并在销毁时清理', async() => {
  const api = createApi(() => ({ Return: { theadList: [], tbodyList: [] } }));
  const widget = { dataType: 'dynamic', datasourceId: 101, dataInterval: 10 };
  const mounted = mountWidget(widget, { fields: [] }, api);
  await settle();
  assert.equal(api.calls.length, 1);
  assert.equal(mounted.timers.size, 1);
  assert.equal([...mounted.timers.values()][0].delay, 10000);
  Vue.set(widget, 'datasourceType', 'integration');
  await settle();
  assert.equal(api.calls.length, 2);
  assert.equal(api.calls.at(-1).params.datasourceType, 'integration');
  const [id, timer] = [...mounted.timers.entries()][0];
  mounted.timers.delete(id);
  timer.callback();
  await settle();
  assert.equal(api.calls.length, 3);
  assert.equal(api.calls.at(-1).url, '/api/rest/dashboard/datasource/data/search');
  assert.equal(api.calls.at(-1).params.datasourceType, 'integration');
  mounted.vm.$destroy();
  assert.equal(mounted.timers.size, 0);
});

test('已有 xField 前端排序保持不变', async() => {
  const api = createApi(() => ({ Return: { theadList: [], tbodyList: [{ field_1: 'B', field_2: 5 }, { field_1: 'A', field_2: 8 }] } }));
  const widget = { dataType: 'dynamic', datasourceId: 101, fields: [{ name: 'xField', datasourceField: 1 }, { name: 'yField', datasourceField: 2 }] };
  const mounted = mountWidget(widget, { fields: [{ name: 'xField' }, { name: 'yField' }] }, api);
  try {
    await settle();
    assert.deepEqual(plain(mounted.vm.data), [{ xField: 'A', yField: 8 }, { xField: 'B', yField: 5 }]);
  } finally { mounted.vm.$destroy(); }
});

test('编辑页加载旧组件、新建组件和保存都补齐类型，未知类型保持原值', async() => {
  const component = load(path.join(page, 'statement-edit.vue')).default;
  const saved = [];
  const api = createApi(url => {
    if (url.endsWith('/get')) return { Return: { id: 99, name: '旧大屏', widgetList: [{ uuid: 'old', dataType: 'dynamic', datasourceId: 101 }, { uuid: 'unknown', datasourceType: 'integration' }] } };
    return { Status: 'OK' };
  });
  const saveStatement = api.statement.saveStatement;
  api.statement.saveStatement = data => { saved.push(plain(data)); return saveStatement(data); };
  const vm = new Vue({
    data() { return { id: 99, reportData: { widgetList: [] } }; },
    beforeCreate() {
      inject(this, api);
      this.$route = { query: {} };
      this.$Message = { warning() {}, success() {} };
    },
    methods: { ...component.methods, addHistory() {} }
  });
  vm.$refs.name = { valid: () => true };
  try {
    vm.getReportById();
    await settle();
    assert.equal(vm.reportData.widgetList[0].datasourceType, 'datawarehouse');
    assert.equal(vm.reportData.widgetList[1].datasourceType, 'integration');
    vm.addWidget({ type: 'pie', width: 250, height: 250, dataTypes: [{ value: 'dynamic' }] }, 20, 30);
    assert.equal(vm.reportData.widgetList.at(-1).datasourceType, 'datawarehouse');
    assert.equal(vm.reportData.widgetList.at(-1).dataType, 'dynamic');
    Vue.delete(vm.reportData.widgetList[0], 'datasourceType');
    vm.saveReport();
    await settle();
    assert.equal(saved[0].widgetList[0].datasourceType, 'datawarehouse');
    assert.equal(saved[0].widgetList[1].datasourceType, 'integration');
    assert.equal(saved[0].widgetList.at(-1).datasourceType, 'datawarehouse');
    assert.equal(saved[0].widgetList.at(-1)._selected, undefined);
  } finally { vm.$destroy(); }
});

test('文本、饼图、流程图和自定义组件动态模式显示来源单选，静态模式隐藏', async() => {
  for (const name of ['text', 'pie', 'autoexec', 'custom']) {
    const definition = load(path.join(page, `widgets/define/${name}.js`)).default;
    const api = createApi();
    const widget = { uuid: name, dataType: 'dynamic' };
    const panel = mountPanel(widget, api, definition, realDatasourceControls(api));
    try {
      await settle();
      assert.equal(datasourceRadio(panel).dataList, undefined);
      assert.deepEqual(plain(datasourceRadio(panel).nodeList), [
        { value: 'datawarehouse', text: '数据仓库' },
        { value: 'integration', text: '集成' }
      ]);
      assert.equal(datasourceRadio(panel).value, 'datawarehouse');
      assert.equal(api.calls.length, 0, '尚未选择数据源时不能请求详情');
      widget.dataType = 'static';
      await settle();
      assert.equal(datasourceRadio(panel), undefined);
      widget.dataType = 'dynamic';
      await settle();
      assert.equal(datasourceRadio(panel).value, 'datawarehouse');
    } finally { panel.$destroy(); }
  }
});

test('类型接口按 Return.tbodyList 加载第三种来源，真实单选事件只清理来源绑定', async() => {
  const rows = [{ value: 'datawarehouse', text: '服务端数据仓库' }, { value: 'integration', text: '服务端集成' }, { value: 'external', text: '第三种来源' }];
  const network = queuedListRequests({ deferTypes: true, typeRows: rows });
  const api = createApi(() => ({ Return: minimalDatasourceDetail() }));
  const widget = { uuid: 'third-type', dataType: 'dynamic', datasourceType: 'datawarehouse', datasourceId: 101,
    name: '保留名称', value: '保留静态内容', dataInterval: 20, limit: 8, config: { title: '保留标题' },
    fields: [{ name: 'angleField', value: '静态值', datasourceField: 1 }, { name: 'colorField', datasourceField: 2 }],
    sortList: [{ fieldId: 1, type: 'DESC' }], conditionList: [{ id: 3, value: ['running'] }] };
  const before = plain(widget);
  const panel = mountPanel(widget, api, undefined, realDatasourceControls(api, network.https));
  try {
    await settle();
    const radio = datasourceRadio(panel);
    assert.equal(radio.url, datasourceTypeUrl);
    assert.equal(radio.rootName, 'tbodyList');
    assert.equal(radio.valueName, 'value');
    assert.equal(radio.textName, 'text');
    assert.equal(radio.dataList, undefined);
    assert.deepEqual(plain(radio.nodeList), []);
    assert.deepEqual(plain(widget), before);
    assert.equal(network.typeRequests.length, 1);
    assert.equal(network.typeRequests[0].config.method, 'post');
    assert.equal(network.typeRequests[0].config.url, datasourceTypeUrl);
    network.typeRequests[0].resolve();
    await settle();
    assert.deepEqual(plain(radio.nodeList), rows);
    assert.equal(radio.$el.querySelector('input[value="datawarehouse"]').checked, true);
    assert.deepEqual(plain(widget), before, '加载选项不得清空保存的来源绑定');
    await selectDatasourceType(panel, 'datawarehouse');
    assert.deepEqual(plain(widget), before);
    radio.$emit('change', 'external', { value: 'integration', text: '不匹配选项' });
    await settle();
    assert.deepEqual(plain(widget), before, '选项和值不匹配时不得清理');
    await selectDatasourceType(panel, 'external');
    assert.deepEqual(plain(widget), { ...before, datasourceType: 'external', datasourceId: null, sortList: [], conditionList: [],
      fields: before.fields.map(({ datasourceField, ...field }) => field) });
    assert.deepEqual(plain(panel.datasourceFieldList), []);
    assert.deepEqual(plain(panel.datasourceConditionList), []);
    assert.equal(api.calls.length, 1, '清空来源后不能使用旧 ID 请求第三种类型');
  } finally { panel.$destroy(); }
});

test('空或错误类型响应不回退固定选项，也不修改已保存但未注册的类型和绑定', async() => {
  for (const response of [{ rows: [], status: 'OK' }, { rows: [{ value: 'integration', text: '错误响应不得显示' }], status: 'ERROR' }]) {
    const network = queuedListRequests({ deferTypes: true });
    const api = createApi(() => ({ Return: minimalDatasourceDetail() }));
    const widget = { uuid: 'unknown-type', dataType: 'dynamic', datasourceType: 'unregistered', datasourceId: 101,
      fields: [{ name: 'angleField', datasourceField: 1 }], sortList: [{ fieldId: 1, type: 'ASC' }], conditionList: [{ id: 3, value: 'running' }] };
    const before = plain(widget);
    const panel = mountPanel(widget, api, undefined, realDatasourceControls(api, network.https));
    try {
      await settle();
      const radio = datasourceRadio(panel);
      assert.equal(radio.currentValue, 'unregistered');
      network.typeRequests[0].resolve(response.rows, 1, 1, response.status);
      await settle();
      assert.deepEqual(plain(radio.nodeList), []);
      assert.equal(radio.$el.querySelectorAll('input').length, 0);
      assert.equal(radio.currentValue, 'unregistered');
      assert.deepEqual(plain(widget), before);
      // 通过真实事件生成逻辑模拟无选项值，selectedItem 为 null，页面不得误清理。
      radio.currentValue = 'integration';
      radio.onChangeValue();
      await settle();
      assert.deepEqual(plain(widget), before);
    } finally { panel.$destroy(); }
  }
});

test('重新加载类型列表会取消旧请求，迟到结果不得覆盖当前候选或触发绑定清理', async() => {
  const network = queuedListRequests({ deferTypes: true });
  const api = createApi(() => ({ Return: minimalDatasourceDetail() }));
  const widget = { uuid: 'refresh-types', dataType: 'dynamic', datasourceType: 'integration', datasourceId: 101,
    fields: [{ name: 'angleField', datasourceField: 1 }] };
  const before = plain(widget);
  const panel = mountPanel(widget, api, undefined, realDatasourceControls(api, network.https));
  try {
    await settle();
    const radio = datasourceRadio(panel);
    const oldRequest = network.typeRequests[0];
    radio.initDataListByUrl();
    assert.equal(oldRequest.config.cancelToken.cancelled, true);
    assert.equal(network.typeRequests.length, 2);
    const latestRows = [{ value: 'integration', text: '最新名称' }, { value: 'external', text: '扩展类型' }];
    network.typeRequests[1].resolve(latestRows);
    await settle();
    oldRequest.resolve([{ value: 'legacy', text: '迟到旧类型' }]);
    await settle();
    assert.deepEqual(plain(radio.nodeList), latestRows);
    assert.equal(radio.currentValue, 'integration');
    assert.deepEqual(plain(widget), before);
  } finally { panel.$destroy(); }
});

test('面板销毁后延迟类型响应不能写入旧单选或新面板，新请求独立回显已保存未知类型', async() => {
  const network = queuedListRequests({ deferTypes: true });
  const api = createApi(() => ({ Return: minimalDatasourceDetail() }));
  const widget = { uuid: 'destroy-types', dataType: 'dynamic', datasourceType: 'unregistered', datasourceId: 101,
    fields: [{ name: 'angleField', datasourceField: 1 }], config: { title: '保持不变' } };
  const before = plain(widget);
  const oldPanel = mountPanel(widget, api, undefined, realDatasourceControls(api, network.https));
  let reopened;
  try {
    await settle();
    const oldRadio = datasourceRadio(oldPanel);
    const delayed = network.typeRequests[0];
    oldPanel.$destroy();
    assert.equal(oldRadio._isDestroyed, true);
    assert.equal(delayed.config.cancelToken.cancelled, true);
    reopened = mountPanel(widget, api, undefined, realDatasourceControls(api, network.https));
    await settle();
    const radio = datasourceRadio(reopened);
    assert.notEqual(radio, oldRadio);
    const latestRows = [{ value: 'datawarehouse', text: '数据仓库' }, { value: 'external', text: '新面板来源' }];
    network.typeRequests[1].resolve(latestRows);
    await settle();
    delayed.resolve([{ value: 'unregistered', text: '不应注入的新名称' }]);
    await settle();
    assert.deepEqual(plain(oldRadio.nodeList), []);
    assert.deepEqual(plain(radio.nodeList), latestRows);
    assert.equal(radio.currentValue, 'unregistered');
    assert.equal(radio.$el.querySelectorAll('input:checked').length, 0);
    assert.deepEqual(plain(widget), before);
  } finally { oldPanel.$destroy(); if (reopened) reopened.$destroy(); }
});

test('缺省和空白类型正常回显，相同类型不清配置，实际单选切换只清来源绑定', async() => {
  for (const initialType of [undefined, null, '', ' \t ', 'datawarehouse']) {
    const api = createApi(() => ({ Return: minimalDatasourceDetail() }));
    const widget = {
      uuid: 'type-default', dataType: 'dynamic', datasourceId: 101, name: '耗时组件', value: '静态内容',
      dataInterval: 20, limit: 8, config: { color: 'red', nested: { enabled: true } },
      fields: [{ name: 'angleField', value: '静态值', datasourceField: 1, label: '值' }, { name: 'colorField', value: '分类', datasourceField: 2 }],
      sortList: [{ fieldId: 1, type: 'DESC' }], conditionList: [{ id: 3, value: ['running'] }]
    };
    if (initialType !== undefined) widget.datasourceType = initialType;
    const initial = plain(widget);
    const pie = load(path.join(page, 'widgets/define/pie.js')).default;
    const panel = mountPanel(widget, api, pie, realDatasourceControls(api));
    try {
      await settle();
      assert.equal(datasourceRadio(panel).value, 'datawarehouse');
      await selectDatasourceType(panel, 'datawarehouse');
      assert.deepEqual(plain(widget), initial, '初始化和重复选择不得清除旧绑定');
      datasourceRadio(panel).$emit('change', 'unknown');
      await settle();
      assert.deepEqual(plain(widget), initial, '无效单选事件不应修改保存配置');
      await selectDatasourceType(panel, 'integration');
      const expected = { ...initial, datasourceType: 'integration', datasourceId: null, sortList: [], conditionList: [],
        fields: initial.fields.map(({ datasourceField, ...field }) => field) };
      assert.deepEqual(plain(widget), expected);
      assert.deepEqual(plain(panel.datasourceFieldList), []);
      assert.deepEqual(plain(panel.datasourceConditionList), []);
      assert.equal(api.calls.length, 1, '未重新选择来源时不能用旧 ID 请求集成详情');
      await selectDatasourceType(panel, 'integration');
      assert.deepEqual(plain(widget), expected);
    } finally { panel.$destroy(); }
  }
});

test('切换后的类型和清空绑定经真实保存、重新打开保持一致', async() => {
  const api = createApi(url => url.endsWith('/datasource/get') ? { Return: minimalDatasourceDetail() } : { Status: 'OK' });
  const widget = { uuid: 'type-save', dataType: 'dynamic', datasourceId: 101, datasourceType: 'datawarehouse', fields: [{ name: 'angleField', datasourceField: 1, value: '静态值' }], dataInterval: 30, limit: 6, config: { title: '保留标题' } };
  const panel = mountPanel(widget, api, undefined, realDatasourceControls(api));
  const component = load(path.join(page, 'statement-edit.vue')).default;
  const editor = new Vue({
    data() { return { reportData: { id: 99, name: '来源切换', widgetList: [widget] } }; },
    beforeCreate() { inject(this, api); this.$Message = { warning() {}, success() {} }; },
    methods: { ...component.methods, addHistory() {} }
  });
  editor.$refs.name = { valid: () => true };
  let reopened;
  try {
    await settle();
    await selectDatasourceType(panel, 'integration');
    editor.saveReport();
    await settle();
    const saved = api.calls.find(call => call.url.endsWith('/statement/save')).params.widgetList[0];
    assert.deepEqual(saved, plain(widget));
    reopened = mountPanel(saved, api, undefined, realDatasourceControls(api));
    await settle();
    assert.equal(datasourceRadio(reopened).value, 'integration');
    assert.equal(saved.datasourceId, null);
    assert.deepEqual(plain(saved.fields), [{ name: 'angleField', value: '静态值' }]);
    assert.equal(api.calls.filter(call => call.url.endsWith('/datasource/get')).length, 1);
  } finally { panel.$destroy(); editor.$destroy(); if (reopened) reopened.$destroy(); }
});

test('真实下拉回显、列表搜索和翻页均携带类型，重建会取消旧查询并隔离旧候选项', async() => {
  const api = createApi(() => ({ Return: minimalDatasourceDetail() }));
  const network = queuedListRequests();
  const widget = { uuid: 'dropdown-type', dataType: 'dynamic', datasourceId: 101 };
  const panel = mountPanel(widget, api, { fields: [], dataTypes: [] }, realDatasourceControls(api, network.https));
  try {
    await settle();
    const getSelector = () => find(panel, child => child.$options.name === 'TsFormSelect' && child.dynamicUrl);
    const oldSelector = getSelector();
    const oldEcho = network.requests.at(-1);
    assert.deepEqual(oldEcho.config.data, { defaultValue: [101], datasourceType: 'datawarehouse' });
    oldEcho.resolve([{ id: 101, label: '旧来源' }]);
    await settle();
    assert.equal(oldSelector.selectedList[0].label, '旧来源');
    for (const type of ['datawarehouse', 'integration']) {
      const selector = getSelector();
      selector.dynamicSearch('', true);
      await settle();
      const listing = network.requests.at(-1);
      assert.equal(listing.config.url, '/api/rest/dashboard/datasource/list');
      assert.equal(listing.config.method, 'post');
      assert.deepEqual(listing.config.data, { currentPage: 1, pageSize: selector.pageSize, keyword: '', datasourceType: type });
      listing.resolve([{ id: 102, label: `${type}-第一页` }], 1, 3);
      await settle();
      selector.dynamicSearch('  作业  ', true);
      await settle();
      const search = network.requests.at(-1);
      assert.deepEqual(search.config.data, { currentPage: 1, pageSize: selector.pageSize, keyword: '作业', datasourceType: type });
      search.resolve([{ id: 103, label: `${type}-搜索` }], 1, 3);
      await settle();
      selector.currentPage = 2;
      selector.isReachBottomSearch = true;
      selector.dynamicSearch('作业');
      await settle();
      const pageTwo = network.requests.at(-1);
      assert.deepEqual(pageTwo.config.data, { currentPage: 2, pageSize: selector.pageSize, keyword: '作业', datasourceType: type });
      pageTwo.resolve([{ id: 104, label: `${type}-第二页` }], 2, 3);
      await settle();
      assert.ok(selector.nodeList.some(item => item.id === 104));
      if (type === 'datawarehouse') {
        // 网络即使在取消后仍交付旧响应，也只能触及已销毁实例，不能污染新类型选项。
        selector.dynamicSearch('迟到旧响应', true);
        await settle();
        const delayed = network.requests.at(-1);
        await selectDatasourceType(panel, 'integration');
        assert.equal(oldSelector._isDestroyed, true);
        assert.equal(delayed.config.cancelToken.cancelled, true);
        assert.equal(oldEcho.config.cancelToken.cancelled, true);
        assert.notEqual(getSelector(), oldSelector);
        assert.deepEqual(plain(getSelector().nodeList), []);
        assert.deepEqual(plain(getSelector().selectedList), []);
        delayed.resolve([{ id: 999, label: '不可出现' }]);
        await settle();
        assert.deepEqual(plain(getSelector().nodeList), []);
        assert.equal(api.calls.length, 1);
        // 重新选择同一个数值 ID 仍由新类型负责解析，不能复用旧来源详情或标签。
        getSelector().$emit('change', 101);
        await settle();
        // 真实下拉 value watcher 会经过 10ms 合并更新，再发默认值回显请求。
        await new Promise(resolve => setTimeout(resolve, 20));
        await settle();
        const echo = network.requests.at(-1);
        assert.deepEqual(echo.config.data, { defaultValue: [101], datasourceType: 'integration' });
        echo.resolve([{ id: 101, label: '集成来源' }]);
        await settle();
        assert.equal(getSelector().selectedList[0].label, '集成来源');
        assert.deepEqual(api.calls.at(-1).params, { id: 101, datasourceType: 'integration' });
      }
    }
  } finally { panel.$destroy(); }
});

test('单选切换立即失效详情请求，同步返回与重新选中相同 ID 均不复用旧字段', async() => {
  const pending = [];
  const api = createApi(() => new Promise(resolve => pending.push(resolve)));
  const widget = { uuid: 'detail-switch', dataType: 'dynamic', datasourceId: 101 };
  const panel = mountPanel(widget, api, undefined, realDatasourceControls(api));
  try {
    await settle();
    const radio = datasourceRadio(panel);
    radio.$el.querySelector('input[value="integration"]').dispatchEvent(new window.Event('change', { bubbles: true }));
    pending[0]({ Return: { fieldList: [{ id: 1, type: 'number' }] } });
    await settle();
    assert.deepEqual(plain(panel.datasourceFieldList), []);
    assert.equal(api.calls.length, 1);
    find(panel, child => child.dynamicUrl).$emit('change', 101);
    await settle();
    assert.deepEqual(api.calls[1].params, { id: 101, datasourceType: 'integration' });
    pending[1]({ Return: { fieldList: [{ id: 2, type: 'number' }] } });
    await settle();
    assert.deepEqual(panel.datasourceFieldList.map(field => field.id), [2]);
  } finally { panel.$destroy(); }
});

// 集成分支使用可控网络响应验证前端分发与竞争处理，实际集成调用由后端测试覆盖。
function queuedDataRequests() {
  const pending = [];
  const api = createApi(url => url.endsWith('/datasource/get') ? { Return: minimalDatasourceDetail() } : new Promise(resolve => pending.push(resolve)));
  const reply = (index, value, label) => pending[index]({ Return: { theadList: [], tbodyList: [{ field_1: value, field_2: label }] } });
  return { api, pending, reply };
}

function dynamicPieWidget() {
  return { uuid: 'async-pie', dataType: 'dynamic', datasourceType: 'datawarehouse', datasourceId: 101, dataInterval: 10,
    fields: [{ name: 'angleField', datasourceField: 1 }, { name: 'colorField', datasourceField: 2 }] };
}

test('首次取数未完成时快速切换来源，新响应负责首绘，反序旧响应不覆盖数据和配置快照', async() => {
  const network = queuedDataRequests();
  const widget = dynamicPieWidget();
  const pie = load(path.join(page, 'widgets/define/pie.js')).default;
  const mounted = mountWidget(widget, pie, network.api);
  try {
    await settle();
    assert.equal(network.pending.length, 1);
    widget.datasourceType = 'integration';
    widget.datasourceId = 202;
    await settle();
    assert.equal(network.pending.length, 2);
    assert.equal(mounted.plots(), 0);
    network.reply(1, 22, '新来源');
    await settle();
    assert.deepEqual(plain(mounted.vm.data), [{ angleField: 22, colorField: '新来源' }]);
    assert.equal(mounted.plots(), 1);
    assert.equal(mounted.changes(), 0);
    assert.equal(mounted.timers.size, 1);
    const table = plain(mounted.vm.tableData);
    const config = plain(mounted.vm.oldConfig);
    network.reply(0, 11, '旧来源');
    await settle();
    assert.deepEqual(plain(mounted.vm.tableData), table);
    assert.deepEqual(plain(mounted.vm.oldConfig), config);
    assert.equal(config.datasourceType, 'integration');
    assert.equal(config.datasourceId, 202);
    assert.equal(mounted.plots(), 1);
    assert.equal(mounted.changes(), 0);
    assert.equal(mounted.timers.size, 1);
  } finally { mounted.vm.$destroy(); }
});

test('面板切换后未选来源或缺少必填绑定时停止取数，旧响应不回写，重新绑定后恢复', async() => {
  const network = queuedDataRequests();
  const widget = dynamicPieWidget();
  const pie = load(path.join(page, 'widgets/define/pie.js')).default;
  const panel = mountPanel(widget, network.api, pie, realDatasourceControls(network.api));
  const mounted = mountWidget(widget, pie, network.api, true);
  try {
    await settle();
    assert.equal(network.pending.length, 1);
    await selectDatasourceType(panel, 'integration');
    assert.equal(widget.datasourceId, null);
    assert.equal(network.pending.length, 1);
    assert.equal(mounted.timers.size, 0);
    network.reply(0, 11, '迟到旧来源');
    await settle();
    assert.deepEqual(plain(mounted.vm.data), []);
    assert.deepEqual(plain(mounted.vm.tableData), {});
    assert.equal(mounted.timers.size, 0);
    find(panel, child => child.dynamicUrl).$emit('change', 101);
    await settle();
    assert.equal(network.pending.length, 1, '重新选 ID 但未绑定必填字段时仍不取数');
    Vue.set(widget.fields[0], 'datasourceField', 1);
    await settle();
    assert.equal(network.pending.length, 1, '只恢复一个必填字段仍不取数');
    Vue.set(widget.fields[1], 'datasourceField', 2);
    await settle();
    assert.equal(network.pending.length, 2);
    assert.equal(network.api.calls.at(-1).params.datasourceType, 'integration');
    assert.equal(network.api.calls.at(-1).params.dataSourceId, 101);
    network.reply(1, 22, '重绑来源');
    await settle();
    assert.deepEqual(plain(mounted.vm.data), [{ angleField: 22, colorField: '重绑来源' }]);
    assert.equal(mounted.timers.size, 1);
  } finally { panel.$destroy(); mounted.vm.$destroy(); }
});

test('已排队旧定时器在 watcher 前后都不得请求，绑定失效和销毁会阻止迟到响应', async() => {
  const network = queuedDataRequests();
  const widget = dynamicPieWidget();
  const pie = load(path.join(page, 'widgets/define/pie.js')).default;
  const mounted = mountWidget(widget, pie, network.api, true);
  try {
    await settle();
    network.reply(0, 11, '原来源');
    await settle();
    const timerA = [...mounted.timers.values()][0];
    assert.ok(timerA);
    // Vue watcher 尚未执行时，定时回调也必须检查实时来源，不能继续查询旧类型。
    widget.datasourceType = 'integration';
    timerA.callback();
    assert.equal(network.pending.length, 1);
    await settle();
    assert.equal(network.pending.length, 2);
    assert.deepEqual(plain(mounted.vm.tableData), {});
    assert.equal(mounted.timers.size, 0);
    timerA.callback();
    assert.equal(network.pending.length, 2);
    network.reply(1, 22, '新来源');
    await settle();
    const timerB = [...mounted.timers.values()][0];
    Vue.delete(widget.fields[0], 'datasourceField');
    timerB.callback();
    assert.equal(network.pending.length, 2);
    await settle();
    assert.equal(mounted.timers.size, 0);
    assert.deepEqual(plain(mounted.vm.tableData), {});
    Vue.set(widget.fields[0], 'datasourceField', 1);
    await settle();
    assert.equal(network.pending.length, 3);
    const draws = { plots: mounted.plots(), changes: mounted.changes() };
    const data = plain(mounted.vm.data);
    mounted.vm.$destroy();
    timerA.callback();
    timerB.callback();
    network.reply(2, 33, '销毁后响应');
    await settle();
    assert.equal(network.pending.length, 3);
    assert.deepEqual(plain(mounted.vm.data), data);
    assert.deepEqual(plain(mounted.vm.tableData), {});
    assert.deepEqual({ plots: mounted.plots(), changes: mounted.changes() }, draws);
    assert.equal(mounted.timers.size, 0);
  } finally { mounted.vm.$destroy(); }
});

test('组件销毁时首次在途响应不能创建图表或重新注册刷新', async() => {
  const network = queuedDataRequests();
  const mounted = mountWidget(dynamicPieWidget(), load(path.join(page, 'widgets/define/pie.js')).default, network.api);
  await settle();
  mounted.vm.$destroy();
  network.reply(0, 11, '销毁后首响应');
  await settle();
  assert.equal(mounted.plots(), 0);
  assert.equal(mounted.changes(), 0);
  assert.deepEqual(plain(mounted.vm.data), []);
  assert.deepEqual(plain(mounted.vm.tableData), {});
  assert.equal(mounted.timers.size, 0);
});

// 集成 UUID 和输出 key 都作为字符串贯穿请求、详情及字段绑定，详情仍遵循最小六属性契约。
const integrationUuid = '91f50f88-cc4a-42f3-8538-bcb57be0302c';
function integrationDatasourceDetail() {
  return { fieldList: [
    { id: 'duration_ms', label: '耗时', type: 'number', isCondition: 0, inputType: null, config: null },
    { id: 'phase_name', label: '阶段', type: 'text', isCondition: 0, inputType: null, config: null }
  ] };
}

test('集成 UUID 经真实数据源下拉回显、搜索及详情请求保持字符串', async() => {
  const api = createApi(() => ({ Return: integrationDatasourceDetail() }));
  const network = queuedListRequests();
  const widget = { uuid: 'integration-select', dataType: 'dynamic', datasourceType: 'integration', datasourceId: integrationUuid };
  const panel = mountPanel(widget, api, { fields: [], dataTypes: [] }, realDatasourceControls(api, network.https));
  try {
    await settle();
    const selector = find(panel, child => child.$options.name === 'TsFormSelect' && child.dynamicUrl);
    const echo = network.requests.at(-1);
    assert.deepEqual(echo.config.data, { defaultValue: [integrationUuid], datasourceType: 'integration' });
    echo.resolve([{ id: integrationUuid, label: '作业耗时集成' }]);
    await settle();
    assert.equal(selector.selectedList[0].id, integrationUuid);
    assert.equal(selector.selectedList[0].label, '作业耗时集成');
    assert.deepEqual(api.calls[0], { url: '/api/rest/dashboard/datasource/get', params: { id: integrationUuid, datasourceType: 'integration' } });
    assert.deepEqual(panel.datasourceFieldList.map(field => field.id), ['duration_ms', 'phase_name']);
    selector.dynamicSearch('作业', true);
    await settle();
    const listing = network.requests.at(-1);
    assert.equal(listing.config.url, '/api/rest/dashboard/datasource/list');
    assert.deepEqual(listing.config.data, { currentPage: 1, pageSize: selector.pageSize, keyword: '作业', datasourceType: 'integration' });
    const secondUuid = '3b628b40-8287-4a1b-a03f-35a687fb7944';
    listing.resolve([{ id: secondUuid, label: '另一集成配置' }]);
    await settle();
    assert.equal(selector.nodeList[0].id, secondUuid);
    selector.$emit('change', secondUuid);
    await settle();
    assert.equal(widget.datasourceId, secondUuid);
    assert.deepEqual(api.calls.at(-1).params, { id: secondUuid, datasourceType: 'integration' });
  } finally { panel.$destroy(); }
});

test('集成字符串输出 key 可绑定饼图、排序并在定时取数中保留 UUID', async() => {
  const response = { theadList: [
    { key: 'field_duration_ms', name: 'duration_ms', title: '耗时' },
    { key: 'field_phase_name', name: 'phase_name', title: '阶段' }
  ], tbodyList: [{ field_duration_ms: 12.5, field_phase_name: '切换验证' }] };
  const api = createApi(url => ({ Return: url.endsWith('/datasource/get') ? integrationDatasourceDetail() : response }));
  const widget = { uuid: 'integration-pie', dataType: 'dynamic', datasourceType: 'integration', datasourceId: integrationUuid,
    fields: [], conditionList: [], sortList: [], dataInterval: 10, limit: 5 };
  const pie = load(path.join(page, 'widgets/define/pie.js')).default;
  const panel = mountPanel(widget, api, pie);
  const mounted = mountWidget(widget, pie, api, true);
  try {
    await settle();
    assert.equal(api.calls.filter(call => call.url.endsWith('/datasource/data/search')).length, 0);
    const bindings = findAll(panel, child => child.$options.name === 'TsFormSelect' && Array.isArray(child.dataList));
    assert.deepEqual(bindings.map(binding => binding.dataList.map(field => field.id)), [['duration_ms'], ['phase_name']]);
    bindings[0].$emit('change', 'duration_ms');
    bindings[1].$emit('change', 'phase_name');
    await settle();
    assert.deepEqual(plain(widget.fields), [{ name: 'angleField', datasourceField: 'duration_ms' }, { name: 'colorField', datasourceField: 'phase_name' }]);
    assert.deepEqual(plain(mounted.vm.data), [{ angleField: 12.5, colorField: '切换验证' }]);
    // 排序来自真实模板点击；字段 key 不得被转换为数值或丢失前缀对应关系。
    panel.$el.querySelector('.tssort').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await settle();
    assert.deepEqual(api.calls.at(-1), { url: '/api/rest/dashboard/datasource/data/search', params: {
      dataSourceId: integrationUuid, datasourceType: 'integration', conditionList: [], sortList: [{ fieldId: 'duration_ms', type: 'ASC' }], limit: 5
    } });
    const [timerId, timer] = [...mounted.timers.entries()][0];
    mounted.timers.delete(timerId);
    timer.callback();
    await settle();
    assert.equal(api.calls.at(-1).params.dataSourceId, integrationUuid);
    assert.equal(api.calls.at(-1).params.datasourceType, 'integration');
    assert.deepEqual(plain(mounted.vm.data), [{ angleField: 12.5, colorField: '切换验证' }]);
  } finally { panel.$destroy(); mounted.vm.$destroy(); }
});

test('集成自定义组件按 theadList.name 还原字符串 key，不依赖详情 name 或数值字段 ID', async() => {
  const definition = load(path.join(page, 'widgets/define/custom.js')).default;
  const response = { theadList: [
    { key: 'field_duration_ms', name: 'duration_ms', title: '耗时' },
    { key: 'field_phase_name', name: 'phase_name', title: '阶段' },
    { key: 'insertTime', title: '插入时间' }
  ], tbodyList: [{ field_duration_ms: 12.5, field_phase_name: '切换验证', insertTime: 100 }] };
  const api = createApi(url => ({ Return: url.endsWith('/datasource/get') ? integrationDatasourceDetail() : response }));
  const widget = { uuid: 'integration-custom', dataType: 'dynamic', datasourceType: 'integration', datasourceId: integrationUuid };
  const panel = mountPanel(widget, api, definition);
  const mounted = mountWidget(widget, definition, api);
  try {
    await settle();
    assert.equal(panel.datasourceFieldList.some(field => Object.hasOwn(field, 'name')), false);
    assert.deepEqual(plain(mounted.vm.data), [{ duration_ms: 12.5, phase_name: '切换验证' }]);
    assert.deepEqual(plain(mounted.vm.tableData), plain(response));
    assert.deepEqual(api.calls.find(call => call.url.endsWith('/datasource/data/search')).params,
      { dataSourceId: integrationUuid, datasourceType: 'integration', limit: 0 });
  } finally { panel.$destroy(); mounted.vm.$destroy(); }
});
