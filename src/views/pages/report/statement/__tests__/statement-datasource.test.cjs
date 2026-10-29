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
  props: ['dynamicUrl', 'params', 'value', 'valueName', 'textName', 'rootName', 'dataList'],
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

function createApi(response = () => ({ Return: {} })) {
  const calls = [];
  const axios = { post: async(url, params) => {
    calls.push({ url, params: plain(params) });
    return response(url, params);
  } };
  const statement = load(path.join(apiPath, 'statement.js'), { '../../http': { __esModule: true, default: axios } }).default;
  return { statement, calls };
}

async function settle() {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
    await Vue.nextTick();
  }
  assert.deepEqual(errors.splice(0), []);
}

function inject(vm, statement) {
  vm.$api = { report: { statement } };
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

function mountPanel(widget, api) {
  // 真实页面的组件参数来自父级响应式 widgetList，测试也建立同样的观察关系。
  Vue.observable(widget);
  const file = path.join(page, 'statement-data-edit.vue');
  const component = load(file).default;
  const parsed = compiler.parse({ source: fs.readFileSync(file, 'utf8'), filename: file });
  Object.assign(component, Vue.compile(parsed.template.content));
  return new Vue({
    ...component,
    propsData: { currentWidget: widget, currentWidgetComponent: { dataTypes: [], fields: [{ name: 'angleField', type: 'number' }] } },
    beforeCreate() { inject(this, api.statement); }
  }).$mount();
}

test('三个 dashboard 数据源 API 保留原参数并显式提供类型，空值兼容，未知类型不会被替换', async() => {
  const { statement, calls } = createApi();
  for (const value of [undefined, null, '', ' \t ', 'datawarehouse', 'integration', ' custom ']) {
    const type = datasource.getDatasourceType(value);
    const params = { datasourceType: value, keyword: '耗时', defaultValue: ['101'], currentPage: 2, pageSize: 10, id: 101, dataSourceId: 101, sortList: [{ fieldId: 7, type: 'DESC' }] };
    await statement.listDatasource(params);
    await statement.getDatasource(params);
    await statement.searchDatasourceData(params);
    assert.deepEqual(calls.slice(-3).map(call => call.url), [
      '/api/rest/dashboard/datasource/list',
      '/api/rest/dashboard/datasource/get',
      '/api/rest/dashboard/datasource/data/search'
    ]);
    calls.slice(-3).forEach(call => assert.deepEqual(call.params, { ...plain(params), datasourceType: type }));
  }
  await statement.searchDatasourceData({ dataSourceId: 101 });
  assert.equal(Object.hasOwn(calls.at(-1).params, 'limit'), false);
  for (const limit of [0, 5]) {
    await statement.searchDatasourceData({ dataSourceId: 101, limit });
    assert.equal(calls.at(-1).params.limit, limit);
  }
  assert.equal(datasource.getDatasourceType('integration'), 'integration');
  assert.equal(datasource.getDatasourceType(' custom '), ' custom ');
});

test('实际数据面板下拉框传类型，类型和 ID 任一变化会重新获取字段', async() => {
  const fields = [{ id: 1, name: 'duration', label: '耗时', type: 'number' }, { id: 2, name: 'name', label: '作业名', type: 'text', isCondition: 1 }];
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
    assert.deepEqual(plain(selector.params), { datasourceType: 'integration' });
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

function mountWidget(widget, definition, api) {
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
    beforeCreate() { inject(this, api.statement); },
    methods: {
      createPlot() { plots++; },
      changeData() { changes++; },
      createRandomData() { throw new Error('已绑定的动态组件不应回退到示例数据'); }
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

test('流程图及自定义组件继续按各自字段规则转换数据', async() => {
  const autoexec = load(path.join(page, 'widgets/define/autoexec.js')).default;
  const definitions = [autoexec, { fields: [] }];
  const row = { field_1: '切换验证', field_2: 'completed', field_3: 1, field_4: 7, insertTime: 100 };
  const head = ['phase', 'status', 'done', 'group'].map((name, index) => ({ name, key: `field_${index + 1}` }));
  head.push({ key: 'insertTime', title: '插入时间' });
  for (const definition of definitions) {
    const api = createApi(() => ({ Return: { theadList: head, tbodyList: [row] } }));
    const widget = { dataType: 'dynamic', datasourceId: 101, fields: autoexec.fields.map((field, index) => ({ name: field.name, datasourceField: index + 1 })) };
    const mounted = mountWidget(widget, definition, api);
    try {
      await settle();
      assert.deepEqual(plain(mounted.vm.data), definition === autoexec ? [{ jobPhaseName: '切换验证', jobPhaseStatus: 'completed', progress: 1, jobGroupSort: 7 }] : [{ phase: '切换验证', status: 'completed', done: 1, group: 7 }]);
      assert.equal(api.calls[0].params.limit, 0);
    } finally { mounted.vm.$destroy(); }
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
      inject(this, api.statement);
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
