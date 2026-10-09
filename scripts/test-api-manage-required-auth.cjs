/* 独立运行：node scripts/test-api-manage-required-auth.cjs；使用 API 替身验证弹框，不执行真实接口。 */
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
const filename = path.join(root, 'src/views/pages/framework/api/api-manage-form.vue');
const parsed = sfc.parse({ source: fs.readFileSync(filename, 'utf8'), filename });
const template = sfc.compileTemplate({ source: parsed.template.content, filename });
assert.deepStrictEqual(template.errors, []);
const script = babel.transformSync(parsed.script.content, {
  filename, babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs']
}).code;
const moduleObject = { exports: {} };
new Function('module', 'exports', script)(moduleObject, moduleObject.exports);
const options = moduleObject.exports.default;
Object.assign(options, new Function(template.code + '\nreturn { render, staticRenderFns };')());
Vue.config.productionTip = false;
Vue.config.devtools = false;

// 保留真实业务模板，仅替换弹框、表单与 UI 外壳，隔离网络和整站初始化。
Vue.component('TsDialog', {
  render(h) { return h('div', [this.$slots.default, this.$slots.footer]); }
});
Vue.component('Loading', {
  props: ['loadingShow'],
  render(h) { return h('div', { attrs: { 'data-loading': String(this.loadingShow) } }); }
});
Vue.component('Tag', { render(h) { return h('span', this.$slots.default); } });
Vue.component('Button', {
  props: ['disabled', 'loading'],
  render(h) { return h('button', { attrs: { disabled: this.disabled, 'data-saving': String(this.loading) } }, this.$slots.default); }
});
const formShell = {
  props: ['itemList'],
  methods: {
    // 沿用现有 TsForm 的全量取值语义，验证插槽字段确实在保存前被排除。
    getFormValue() { return Object.fromEntries(Object.entries(this.itemList).map(([key, item]) => [key, item.value])); },
    valid() { return true; }
  },
  render(h) {
    return h('div', Object.keys(this.itemList).map(key => h('div', [
      this.itemList[key].label,
      this.$scopedSlots[key] ? this.$scopedSlots[key]({}) : []
    ])));
  }
};

// 可控请求用于观察加载、失败和重复点击之间的状态。
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

// 按真实语言包解析文案，名称使用接口返回值，避免前端重新翻译业务数据。
function create(language, get, save) {
  const dictionaries = {};
  for (const namespace of ['page', 'dialog', 'message', 'term']) {
    dictionaries[namespace] = JSON.parse(fs.readFileSync(path.join(root, 'src/resources/assets/languages', namespace, language + '.json'), 'utf8'));
  }
  return new Vue({
    ...options,
    components: { TsForm: formShell },
    propsData: { isShow: true, token: 'test/required-auth' },
    beforeCreate() {
      this.$api = { framework: { apiManage: { get, save } } };
      this.$t = key => {
        const value = key.split('.').reduce((current, part) => current && current[part], dictionaries);
        assert.strictEqual(typeof value, 'string', '文案 key 必须存在：' + key);
        return value;
      };
      this.$Message = { success() {} };
    }
  }).$mount();
}

const flush = async() => { await Promise.resolve(); await Promise.resolve(); await Vue.nextTick(); };
const response = requiredAuthList => ({ Status: 'OK', Return: {
  token: 'test/required-auth', name: 'API', handler: 'test.handler', type: 'object', isActive: 1,
  isMcp: 1, needAudit: 1, qps: 0, requiredAuthList
} });

// 验证真实模板的权限分支，以及加载与保存的异步边界。
async function main() {
  const request = deferred();
  let saving;
  const saves = [];
  const vm = create('zh', () => request.promise, data => { saves.push(data); return saving.promise; });
  assert.strictEqual(vm.isLoading, true);
  assert.strictEqual(vm.$el.querySelector('[data-loading]').getAttribute('data-loading'), 'true');
  assert.strictEqual(vm.$el.querySelectorAll('button')[1].disabled, true);
  assert(!vm.$el.textContent.includes('无需接口级功能权限'));
  await vm.handleOk();
  assert.strictEqual(saves.length, 0);
  const longName = '应用配置管理权限'.repeat(30);
  request.resolve(response([
    { name: 'INTERFACE_MODIFY', displayName: '接口管理权限' },
    { name: 'LONG_PERMISSION_IDENTIFIER', displayName: longName }
  ]));
  await flush();
  assert.strictEqual(vm.isLoading, false);
  assert(vm.$el.textContent.includes(longName));
  assert(vm.$el.textContent.includes('INTERFACE_MODIFY'));
  assert(vm.$el.textContent.includes('满足任一项权限即可'));
  assert(vm.formConfig.requiredAuthList.tooltip.includes('业务对象权限以执行时校验为准'));
  assert(!vm.$el.textContent.includes('业务对象权限以执行时校验为准'));

  vm.currentApiData.requiredAuthList = [{ name: 'MISSING_METADATA' }];
  await flush();
  assert(vm.$el.textContent.includes('MISSING_METADATA'));
  assert(!vm.$el.textContent.includes('满足任一项权限即可'));
  vm.currentApiData.requiredAuthList = [];
  await flush();
  assert(vm.$el.textContent.includes('无需接口级功能权限'));
  vm.currentApiData.requiredAuthList = null;
  await flush();
  assert(vm.$el.textContent.includes('无法获取执行权限'));
  assert(!vm.$el.textContent.includes('无需接口级功能权限'));

  saving = deferred();
  const firstSave = vm.handleOk();
  await vm.handleOk();
  assert.strictEqual(saves.length, 1);
  assert(!Object.hasOwn(saves[0], 'requiredAuthList'));
  assert.strictEqual(saves[0].handler, 'test.handler');
  saving.reject(new Error('模拟保存失败'));
  await assert.rejects(firstSave, /模拟保存失败/);
  assert.strictEqual(vm.dialogConfig.loading, false);
  saving = deferred();
  vm.currentApiData.type = 'sse';
  const secondSave = vm.handleOk();
  assert.strictEqual(saves[1].isMcp, 0);
  saving.resolve({ Status: 'ERROR' });
  await secondSave;
  assert.strictEqual(vm.dialogConfig.loading, false);

  // 同步取值异常也必须释放保存状态，不能把弹框锁死。
  vm.$refs.form.getFormValue = () => { throw new Error('模拟取值失败'); };
  await assert.rejects(vm.handleOk(), /模拟取值失败/);
  assert.strictEqual(vm.dialogConfig.loading, false);

  vm.$api.framework.apiManage.get = () => Promise.reject(new Error('模拟加载失败'));
  await assert.rejects(vm.fetchFormValue('test/required-auth'), /模拟加载失败/);
  await flush();
  assert.strictEqual(vm.isLoading, false);
  assert.strictEqual(vm.dialogConfig.isButtonDisabled, true);
  assert(vm.$el.textContent.includes('无法获取执行权限'));
  assert(!vm.$el.textContent.includes('无需接口级功能权限'));
  await vm.handleOk();
  assert.strictEqual(saves.length, 2);
  vm.$destroy();

  const englishRequest = deferred();
  const english = create('en', () => englishRequest.promise, () => { throw new Error('不应保存'); });
  englishRequest.resolve(response([{ name: 'INTERFACE_MODIFY', displayName: 'API Management Permission' }]));
  await flush();
  assert(english.$el.textContent.includes('API Management Permission'));
  assert(english.formConfig.requiredAuthList.tooltip.includes('Business object permissions are checked during execution.'));
  assert(!english.$el.textContent.includes('Business object permissions are checked during execution.'));
  english.currentApiData.requiredAuthList = [];
  await flush();
  assert(english.$el.textContent.includes('No API-Level Functional Permissions Required'));
  english.$destroy();
  console.log('接口执行权限弹框回归通过：权限展示、中英文、加载失败、重复提交与保存参数排除。');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
