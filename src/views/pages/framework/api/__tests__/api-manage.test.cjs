const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test, after } = require('node:test');
const { transformSync } = require('@babel/core');
const { parse } = require('vue/compiler-sfc');
const { JSDOM } = require('jsdom');

// 先创建 DOM，再加载 Vue，确保测试执行真实的渲染和事件绑定。
const dom = new JSDOM('<!doctype html><body></body>');
global.window = dom.window;
global.document = dom.window.document;
const Vue = require('vue/dist/vue.common.js');
Vue.config.productionTip = false;
Vue.config.devtools = false;
after(() => dom.window.close());

// 加载原始脚本和模板，显式替换测试范围外的依赖。
function load(file, dependencies = {}) {
  const source = readFileSync(file, 'utf8');
  const descriptor = file.endsWith('.vue') ? parse({ source, filename: file }) : null;
  const { code } = transformSync(descriptor ? descriptor.script.content : source, {
    filename: file,
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs', 'babel-plugin-dynamic-import-node']
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    assert.ok(Object.hasOwn(dependencies, name), `未替换的依赖：${name}`);
    return dependencies[name];
  }, module, module.exports);
  const component = module.exports.default;
  return descriptor ? { ...component, ...Vue.compile(descriptor.template.content) } : component;
}

const iview = join(require.resolve('neatlogic-ui/package.json'), '..', 'iview');
// 使用实际开关及其表单 mixin，验证鼠标与键盘事件均遵守禁用状态。
const auditSwitch = load(join(iview, 'components/switch/switch.vue'), {
  '../../utils/assist': { oneOf: (value, values) => values.includes(value) },
  '../../mixins/emitter': load(join(iview, 'mixins/emitter.js')),
  '../../mixins/form': load(join(iview, 'mixins/form.js'))
});
const page = load(join(__dirname, '../api-manage.vue'), {
  '@/resources/mixins/download.js': {},
  './mcp-capability': { hasMcpSupport: () => false }
});
const externalToken = 'suzhoubank/processtask/unified/handle';
const empty = { render: h => h('div') };
const dialog = name => ({ render: h => h('div', { attrs: { 'data-dialog': name } }) });
const components = {
  Loading: empty,
  Tree: empty,
  TsContain: { render(h) { return h('div', this.$slots.content); } },
  TsTable: {
    props: ['tbodyList'],
    render(h) {
      return h('div', (this.tbodyList || []).map(row =>
        h('section', { key: row.token }, ['needAudit', 'token', 'action'].map(slot =>
          h('div', { attrs: { 'data-column': slot } }, this.$scopedSlots[slot]({ row }))
        ))
      ));
    }
  },
  'i-switch': auditSwitch,
  ApiTest: dialog('test'),
  ApiHelp: dialog('help'),
  FormDialog: dialog('edit')
};

// 模拟列表响应和保存请求，通过实际表格插槽检查操作入口。
async function mount(context, row) {
  const saved = [];
  const errors = [];
  Vue.config.errorHandler = error => errors.push(error);
  const vm = new Vue({
    components,
    extends: page,
    beforeCreate() {
      this.$t = key => key;
      this.$store = { state: { isSiderTreeHide: false } };
      this.$Message = { success() {} };
      this.$api = { framework: { apiManage: {
        getTree: async() => ({ Status: 'OK', Return: [] }),
        search: async() => ({ Status: 'OK', Return: { tbodyList: [row] } }),
        save: async params => {
          saved.push(params);
          return { Status: 'OK' };
        }
      } } };
    }
  }).$mount();
  document.body.appendChild(vm.$el);
  context.after(() => {
    vm.$destroy();
    vm.$el.remove();
    Vue.config.errorHandler = null;
    assert.deepEqual(errors, []);
  });
  await new Promise(resolve => setImmediate(resolve));
  await Vue.nextTick();
  return { vm, saved, find: selector => vm.$el.querySelector(selector) };
}

for (const needAudit of [0, 1]) {
  test(`公开接口审计状态为 ${needAudit} 时，列表只提供只读入口`, async context => {
    const row = { token: externalToken, isPrivate: false, needAudit };
    const { find, saved } = await mount(context, row);
    const address = find('[data-column="token"] span');
    const audit = find('.ivu-switch');

    assert.equal(find('.tsfont-test'), null);
    assert.equal(address.textContent, externalToken);
    assert.equal(address.classList.contains('text-href'), false);
    assert.ok(audit.classList.contains('ivu-switch-disabled'));
    assert.equal(audit.classList.contains('ivu-switch-checked'), needAudit === 1);

    // 禁用后点击和空格都不能更改审计状态或调用保存接口。
    address.click();
    audit.click();
    audit.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: ' ', keyCode: 32, bubbles: true, cancelable: true }));
    await Vue.nextTick();
    assert.equal(row.needAudit, needAudit);
    assert.equal(find('[data-dialog="edit"]'), null);
    assert.deepEqual(saved, []);

    find('.tsfont-question-o').click();
    await Vue.nextTick();
    assert.ok(find('[data-dialog="help"]'));
  });
}

test('直接调用事件处理函数也不能测试、编辑或保存公开接口', async context => {
  const row = { token: externalToken, isPrivate: false, needAudit: 0 };
  const { vm, find, saved } = await mount(context, row);

  vm.testApi(row);
  vm.showApiForm(row);
  vm.handleSwitchChange(row);
  await Vue.nextTick();

  assert.equal(find('[data-dialog="test"]'), null);
  assert.equal(find('[data-dialog="edit"]'), null);
  assert.deepEqual(saved, []);
});

for (const [name, privacy] of [['私有接口', { isPrivate: true }], ['缺少 isPrivate 的旧记录', {}]]) {
  test(`${name}仍可测试、编辑和切换审计`, async context => {
    const row = { token: 'example/interface', needAudit: 0, ...privacy };
    const { vm, find, saved } = await mount(context, row);

    // 对照可操作行，确认页面仍绑定到原有弹窗与保存流程。
    find('.tsfont-test').click();
    find('[data-column="token"] .text-href').click();
    find('.ivu-switch').click();
    await Vue.nextTick();

    assert.ok(find('[data-dialog="test"]'));
    assert.ok(find('[data-dialog="edit"]'));
    assert.equal(vm.currentToken, row.token);
    assert.equal(row.needAudit, 1);
    assert.deepEqual(saved, [{ token: row.token, needAudit: 1, ...privacy }]);
  });
}
