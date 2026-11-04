const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
const compiler = require('vue/compiler-sfc');
const { JSDOM } = require('jsdom');

// 页面、弹窗、表单和下载 mixin 使用生产代码，仅替换 UI 叶控件与网络边界。
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
const Vue = require('vue/dist/vue.common.js');
Vue.config.productionTip = false;
Vue.config.devtools = false;
const errors = [];
Vue.config.errorHandler = error => errors.push(error);
const src = path.resolve(__dirname, '../../../../..');
const page = path.join(__dirname, '..');
const plain = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const calls = [];
const downloads = [];
const notices = [];
const roots = [];

// 替换网络请求但保留真实下载回调，测试可主动完成或拒绝每一次请求。
const axios = { post(url, params, config) {
  return new Promise((resolve, reject) => calls.push({ url, params: plain(params), config, resolve, reject }));
} };
const translations = JSON.parse(fs.readFileSync(path.join(src, 'resources/assets/languages/page/zh.json'), 'utf8'));
const translate = key => key.split('.').slice(1).reduce((value, part) => value && value[part], translations) || key;

// 布局替身保留所有 slot，表单的显隐、值绑定和回调仍由真实 TsForm 执行。
const layout = { render(h) {
  return h('div', Object.keys(this.$scopedSlots).flatMap(key => this.$scopedSlots[key]({})));
} };
const radio = {
  name: 'TsFormRadio',
  tagComponent: 'TsForm',
  props: ['value', 'dataList', 'onChange', 'disabled'],
  methods: {
    // 模拟现有叶控件契约，同时触发表单值绑定和配置中的 onChange。
    select(value) {
      this.$emit('change', value);
      this.onChange && this.onChange(value);
    },
    valid() { return !!this.value; }
  },
  render(h) {
    return h('div', this.dataList.map(item => h('label', [
      h('input', {
        attrs: { type: 'radio', value: item.value, disabled: this.disabled },
        domProps: { checked: this.value === item.value },
        on: { change: () => this.select(item.value) }
      }), item.text
    ])));
  }
};
const datePicker = {
  name: 'TsFormDatePicker',
  tagComponent: 'TsForm',
  props: ['value', 'valueType', 'format', 'type', 'disabled'],
  methods: { valid() { return true; } },
  render(h) { return h('input', { attrs: { type: 'text', disabled: this.disabled, 'data-date-picker': '' } }); }
};
const dialogShell = {
  name: 'TsDialog',
  props: ['isShow', 'loading', 'okBtnDisable', 'title', 'okText'],
  render(h) {
    return h('section', [
      h('h2', this.title), this.$scopedSlots.default(),
      h('button', { attrs: { 'data-confirm': '', disabled: this.okBtnDisable }, on: { click: () => this.$emit('on-ok') } }, this.okText),
      h('button', { attrs: { 'data-cancel': '' }, on: { click: () => this.$emit('on-close') } }, '取消')
    ]);
  }
};
Vue.component('TsDialog', dialogShell);
['TsContain', 'Row', 'Col'].forEach(name => Vue.component(name, layout));

// 从 SFC 加载真实脚本和模板，明确声明依赖替身，避免测试意外请求网络。
function load(file, dependencies = {}, template = true) {
  const source = fs.readFileSync(file, 'utf8');
  const parsed = file.endsWith('.vue') ? compiler.parse({ source, filename: file }) : null;
  const script = parsed ? parsed.script.content : source;
  const { code } = babel.transformSync(script, {
    filename: file,
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs', 'babel-plugin-dynamic-import-node']
  });
  const moduleObject = { exports: {} };
  const resolve = request => {
    if (!(request in dependencies)) throw new Error(`未替换的依赖：${request}`);
    return dependencies[request];
  };
  new Function('require', 'module', 'exports', code)(resolve, moduleObject, moduleObject.exports);
  const result = moduleObject.exports.default;
  if (template && parsed && parsed.template) Object.assign(result, Vue.compile(parsed.template.content));
  return result;
}
const downloadMixin = load(path.join(src, 'resources/mixins/download.js'), {
  '@/resources/api/http.js': axios,
  qs: require('qs'),
  'neatlogic-ui/iview/index.js': { Notice: { error: value => notices.push(value), success() {} } },
  '@/resources/assets/js/downloadUtil.js': { downloadBlobFile: (...args) => downloads.push(args) },
  '@/resources/init.js': { $t: translate }
});
const form = load(path.join(src, 'resources/plugins/TsForm/TsForm.vue'), {
  '@/resources/plugins/TsForm/TsFormItem': layout,
  './index.js': { TsFormRadio: radio, TsFormDatePicker: datePicker }
});
const dialog = load(path.join(page, 'log-export-dialog.vue'), {
  '@/resources/mixins/download.js': downloadMixin,
  '@/resources/plugins/TsForm/TsForm.vue': form
});
const logPage = load(path.join(page, 'log-manage.vue'), {
  '@/resources/plugins/TsForm/TsFormSelect.vue': layout,
  './loglevel-edit.vue': layout,
  './log-export-dialog.vue': dialog
});
const pickerLogic = load(path.join(src, 'resources/plugins/TsForm/TsFormDatePicker.vue'), {
  '@/resources/mixins/formMixins.js': {},
  '@/resources/mixins/formScrollMixins.js': {}
}, false);

Vue.prototype.$t = translate;
Vue.prototype.$utils = {
  deepClone: plain,
  isSame: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  isEmpty: value => !value || value.length === 0
};
Vue.prototype.$api = { framework: { server: { getServerList: async() => ({ Status: 'SKIP' }) } } };

// 等待异步组件、Vue 更新和下载 Promise 的实际回调完成。
async function settle() {
  for (let i = 0; i < 12; i++) {
    await Promise.resolve();
    await Vue.nextTick();
  }
  assert.deepEqual(errors.splice(0), []);
}
function mount(component, propsData = {}) {
  const vm = new (Vue.extend(component))({ propsData }).$mount();
  document.body.appendChild(vm.$el);
  roots.push(vm);
  return vm;
}
function find(vm, name) {
  if (vm.$options.name === name) return vm;
  return vm.$children.map(child => find(child, name)).find(Boolean);
}
async function newDialog() {
  const vm = mount(dialog, { serverId: 168, fileName: 'error.log' });
  await settle();
  return vm;
}
async function choose(vm, type) {
  vm.$el.querySelector(`input[value="${type}"]`).dispatchEvent(new window.Event('change'));
  await settle();
}
async function setTime(vm, value) {
  find(vm, 'TsFormDatePicker').$emit('change', value);
  await settle();
}
async function confirm(vm) {
  vm.$el.querySelector('[data-confirm]').click();
  await settle();
}
test.beforeEach(() => { calls.length = 0; downloads.length = 0; notices.length = 0; });
test.afterEach(() => {
  roots.splice(0).forEach(vm => { const element = vm.$el; vm.$destroy(); element.remove(); });
  assert.deepEqual(errors.splice(0), []);
});

test('点击导出只打开弹窗，保存节点文件快照，取消后重新打开恢复默认值', async() => {
  const vm = mount(logPage);
  vm.searchParam = { serverId: 168, fileName: 'error.log', fileSize: 1024 };
  await settle();
  vm.$el.querySelector('.tsfont-download').click();
  await settle();
  assert.equal(calls.length, 0);
  const firstDialog = find(vm, 'LogExportDialog');
  assert.equal(firstDialog.formConfig.type.value, 'groupAndDeduplicate');
  assert.equal(firstDialog.formConfig.startTime.value, null);
  vm.searchParam.serverId = 999;
  vm.searchParam.fileName = 'other.log';
  await settle();
  assert.equal(firstDialog.serverId, 168);
  assert.equal(firstDialog.fileName, 'error.log');
  await setTime(firstDialog, 1793437200000);
  await choose(firstDialog, 'originalData');
  firstDialog.$el.querySelector('[data-cancel]').click();
  await settle();
  assert.equal(vm.exportTarget, null);
  assert.equal(calls.length, 0);
  vm.$el.querySelector('.tsfont-download').click();
  await settle();
  const reopened = find(vm, 'LogExportDialog');
  assert.notEqual(reopened, firstDialog);
  assert.equal(reopened.formConfig.type.value, 'groupAndDeduplicate');
  assert.equal(reopened.formConfig.startTime.value, null);
  assert.equal(vm.searchParam.type, undefined);
  assert.equal(vm.searchParam.startTime, undefined);
});

test('默认分组去重显示日期，控件提交毫秒时间戳且与后端日期接口一致', async() => {
  const vm = await newDialog();
  const radioVm = find(vm, 'TsFormRadio');
  assert.deepEqual(plain(radioVm.dataList), [
    { value: 'groupAndDeduplicate', text: '分组去重' }, { value: 'originalData', text: '原始文件' }
  ]);
  const picker = find(vm, 'TsFormDatePicker');
  assert.equal(picker.type, 'datetime');
  assert.equal(picker.valueType, 'timestamp');
  assert.equal(picker.format, 'yyyy-MM-dd HH:mm:ss');
  const date = new Date(2026, 10, 3, 12, 34, 56);
  const timestamp = pickerLogic.methods.changeDateFormat.call({ readonly: false, type: 'datetime' }, date,
    picker.format, false, picker.valueType);
  assert.equal(timestamp, date.getTime());
  await setTime(vm, timestamp);
  await confirm(vm);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'api/binary/log/file/export');
  assert.equal(calls[0].config.responseType, 'blob');
  assert.deepEqual(calls[0].params, { serverId: 168, fileName: 'error.log', type: 'groupAndDeduplicate', startTime: timestamp });
});

test('分组开始时间可选，未选择或清空时间时均不携带 startTime', async() => {
  for (const value of [null, '']) {
    const vm = await newDialog();
    await setTime(vm, value);
    await confirm(vm);
    const request = calls[calls.length - 1];
    assert.deepEqual(request.params, { serverId: 168, fileName: 'error.log', type: 'groupAndDeduplicate' });
  }
});

test('切换原始文件隐藏日期并排除已有时间，切回分组后日期恢复', async() => {
  const vm = await newDialog();
  await setTime(vm, 1793437200000);
  await choose(vm, 'originalData');
  assert.equal(find(vm, 'TsFormDatePicker'), undefined);
  await choose(vm, 'groupAndDeduplicate');
  assert.equal(find(vm, 'TsFormDatePicker').value, 1793437200000);
  await choose(vm, 'originalData');
  await confirm(vm);
  assert.deepEqual(calls[0].params, { serverId: 168, fileName: 'error.log', type: 'originalData' });
});

test('下载期间禁止重复提交，成功后保存下载内容并关闭弹窗', async() => {
  const vm = await newDialog();
  let closed = 0;
  vm.$on('close', () => closed++);
  await confirm(vm);
  assert.equal(vm.isDownloading, true);
  assert.equal(vm.$el.querySelector('[data-confirm]').disabled, true);
  vm.exportLog();
  await confirm(vm);
  assert.equal(calls.length, 1);
  const data = { log: 'grouped log' };
  calls[0].resolve({ status: 200, data, headers: { 'content-disposition': 'attachment; filename="grouped.log"' } });
  await settle();
  assert.equal(closed, 1);
  assert.equal(vm.isDownloading, false);
  assert.equal(find(vm, 'TsFormRadio').disabled, false);
  assert.equal(downloads.length, 1);
  assert.equal(downloads[0][0], data);
  assert.equal(downloads[0][1].contentDisposition, 'attachment; filename="grouped.log"');
});

test('下载失败不关闭弹窗，保留时间和类型，表单重新可编辑并允许重试', async() => {
  const vm = await newDialog();
  let closed = 0;
  vm.$on('close', () => closed++);
  await setTime(vm, 1793437200000);
  await confirm(vm);
  calls[0].reject({ data: { type: 'application/json', text: async() => JSON.stringify({ Message: '导出失败' }) } });
  await settle();
  assert.equal(closed, 0);
  assert.equal(vm.isDownloading, false);
  assert.equal(find(vm, 'TsFormRadio').disabled, false);
  assert.equal(find(vm, 'TsFormDatePicker').disabled, false);
  assert.equal(vm.formConfig.startTime.value, 1793437200000);
  assert.equal(notices[0].desc, '导出失败');
  await choose(vm, 'originalData');
  await confirm(vm);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1].params, { serverId: 168, fileName: 'error.log', type: 'originalData' });
});
