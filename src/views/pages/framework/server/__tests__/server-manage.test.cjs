// 编译真实页面、弹框和接口封装，验证停机节点删除的可见性及完整确认交互。
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
const compiler = require('vue/compiler-sfc');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
const Vue = require('vue/dist/vue.common.js');
Vue.config.productionTip = false;
Vue.config.devtools = false;
const errors = [];
Vue.config.errorHandler = error => errors.push(error);
const resources = path.resolve(__dirname, '../../../../../resources');
let activeLocale = 'zh';
let dialogs = [];

// 使用仓库中的中英文文案，避免未解析的语言键掩盖确认提示缺失。
const languages = Object.fromEntries(['zh', 'en'].map(locale => [locale,
  Object.fromEntries(['page', 'term', 'dialog', 'message'].map(group => [group,
    JSON.parse(fs.readFileSync(path.join(resources, 'assets/languages', group, locale + '.json'), 'utf8'))
  ]))
]));
function translate(key, params = {}) {
  const value = key.split('.').reduce((item, name) => item && item[name], languages[activeLocale]);
  assert.equal(typeof value, 'string', '缺少语言键：' + key);
  return value.replace(/\{(\w+)\}/g, (match, name) => params[name] === undefined ? match : params[name]);
}

// 仅替换外部依赖；页面方法、模板、弹框事件和 API 路径仍执行实际源码。
function evaluate(source, filename, resolve = () => ({})) {
  const { code } = babel.transformSync(source, {
    filename, babelrc: false, configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs', 'babel-plugin-dynamic-import-node']
  });
  const output = { exports: {} };
  new Function('require', 'module', 'exports', code)(resolve, output, output.exports);
  return output.exports.default;
}
function loadSfc(filename) {
  const parsed = compiler.parse({ source: fs.readFileSync(filename, 'utf8'), filename });
  return {
    ...evaluate(parsed.script.content, filename),
    ...Vue.compile(parsed.template.content, { whitespace: 'condense' })
  };
}
const Page = loadSfc(path.resolve(__dirname, '../server-manage.vue'));
const Dialog = {
  ...loadSfc(path.join(resources, 'plugins/TsDialog/TsDialog.vue')),
  directives: { TransferDom: {}, scrollHidden: {} },
  components: {
    Button: {
      props: ['disabled'],
      render(h) { return h('button', { attrs: { disabled: this.disabled } }, this.$slots.default); }
    }
  },
  beforeCreate() { this.$t = translate; },
  created() { if (this.isShow) dialogs.push(this); }
};
const dialogPluginPath = path.join(resources, 'plugins/TsDialog/TsDialog.js');
evaluate(fs.readFileSync(dialogPluginPath, 'utf8'), dialogPluginPath, name =>
  name.endsWith('.vue') ? Dialog : { $t: translate }
).install(Vue);

// 表格外壳保留真实具名插槽，断言最终 DOM 中按钮的顺序及节点状态。
const TsTable = {
  props: ['theadList', 'tbodyList'],
  render(h) {
    return h('table', [h('tbody', this.tbodyList.map(row => h('tr', { attrs: { 'data-server-id': row.serverId } },
      this.theadList.map(head => h('td', { attrs: { 'data-column': head.key } },
        this.$scopedSlots[head.key] ? this.$scopedSlots[head.key]({ row }) : String(row[head.key] || '')
      ))
    )))]);
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
async function mount(rows, deletion, locale = 'zh') {
  activeLocale = locale;
  dialogs = [];
  const calls = [];
  const messages = [];
  let currentRows = rows;
  const apiPath = path.join(resources, 'api/framework/server/server.js');
  const server = evaluate(fs.readFileSync(apiPath, 'utf8'), apiPath, () => ({
    post(url, data) {
      calls.push({ url, data });
      if (url === 'api/rest/server/list') {
        return Promise.resolve({ Status: 'OK', Return: { currentServerId: 1, tbodyList: currentRows } });
      }
      assert.equal(url, 'api/rest/server/delete');
      return deletion(data);
    }
  }));
  const vm = new Vue({
    ...Page,
    components: {
      TsTable, TsDialog: Dialog,
      TsContain: { render(h) { return h('div', this.$scopedSlots.content({})); } },
      TsForm: { render(h) { return h('div'); } }
    },
    beforeCreate() {
      this.$t = translate;
      this.$api = { framework: { server } };
      this.$Message = { success: message => messages.push(message) };
    }
  }).$mount();
  document.body.appendChild(vm.$el);
  await settle();
  return { vm, calls, messages, setRows: rows => { currentRows = rows; } };
}
function dispose(vm) {
  // 清理真实弹框实例，避免前一个场景留下的节点影响后续点击。
  for (const dialog of dialogs) { dialog.$destroy(); dialog.$el.remove(); }
  vm.$destroy();
  vm.$el.remove();
}
function actions(vm, serverId) {
  return [...vm.$el.querySelector('[data-server-id="' + serverId + '"] [data-column="action"]').querySelectorAll('li')];
}
function button(dialog, label) {
  return [...dialog.$el.querySelectorAll('button')].find(node => node.textContent === translate('page.' + label));
}
function deleteCalls(calls) { return calls.filter(call => call.url === 'api/rest/server/delete'); }

// 只有后端明确的 stop 状态提供删除；取消、关闭及重复打开均不会提交请求。
for (const locale of ['zh', 'en']) {
  test(locale + '：仅停机节点在编辑右侧显示删除，确认提示含 ID，取消不提交', async() => {
    const rows = [{ serverId: 10, status: 'stop' }, { serverId: 20, status: 'startup' },
      { serverId: 30, status: 'shutdown' }, { serverId: 40 }];
    const { vm, calls } = await mount(rows, () => assert.fail('取消不应请求删除'), locale);
    try {
      assert.deepEqual(actions(vm, 10).map(node => node.textContent), [translate('page.edit'), translate('page.delete')]);
      for (const id of [20, 30, 40]) assert.deepEqual(actions(vm, id).map(node => node.textContent), [translate('page.edit')]);
      actions(vm, 10)[1].click();
      actions(vm, 10)[1].click();
      await settle();
      assert.equal(dialogs.length, 1);
      assert.ok(dialogs[0].$el.textContent.includes(translate('dialog.content.deletetargetconfirm', { target: translate('page.server') + ' 10' })));
      assert.equal(deleteCalls(calls).length, 0);
      button(dialogs[0], 'cancel').click();
      await settle();
      assert.equal(deleteCalls(calls).length, 0);
      actions(vm, 10)[1].click();
      await settle();
      assert.equal(dialogs.length, 2);
      dialogs[1].$el.querySelector('.tsfont-close').click();
      await settle();
      assert.equal(deleteCalls(calls).length, 0);
    } finally { dispose(vm); }
  });
}

// 延迟真实接口封装的响应，检查重复确认只发送一次并在成功后重新取列表。
test('确认删除透传 serverId，等待期间防重复，成功关闭弹框并刷新列表', async() => {
  let complete;
  const pending = new Promise(resolve => { complete = resolve; });
  const { vm, calls, messages, setRows } = await mount([{ serverId: 10, status: 'stop' }], () => pending);
  try {
    actions(vm, 10)[1].click();
    await settle();
    const dialog = dialogs[0];
    button(dialog, 'confirm').click();
    button(dialog, 'confirm').click();
    await settle();
    assert.deepEqual(deleteCalls(calls), [{ url: 'api/rest/server/delete', data: { serverId: 10 } }]);
    assert.equal(button(dialog, 'confirm').disabled, true);
    assert.equal(messages.length, 0);
    setRows([]);
    complete({ Status: 'OK', Return: null });
    await settle();
    assert.equal(dialog.isShow, false);
    assert.deepEqual(messages, [translate('message.deletesuccess')]);
    assert.equal(calls.filter(call => call.url === 'api/rest/server/list').length, 2);
    assert.equal(vm.$el.querySelector('[data-server-id="10"]'), null);
  } finally { dispose(vm); }
});

// 模拟节点已恢复运行导致拒绝删除：不误报成功，确认按钮恢复后可重试。
test('删除失败保留确认框并恢复按钮，重试成功后才刷新', async() => {
  let attempts = 0;
  const { vm, calls, messages } = await mount([{ serverId: 10, status: 'stop' }], () => {
    attempts++;
    return attempts === 1 ? Promise.reject(new Error('节点已恢复运行')) : Promise.resolve({ Status: 'OK', Return: null });
  });
  try {
    actions(vm, 10)[1].click();
    await settle();
    const dialog = dialogs[0];
    button(dialog, 'confirm').click();
    await settle();
    assert.equal(dialog.isShow, true);
    assert.equal(button(dialog, 'confirm').disabled, false);
    assert.equal(messages.length, 0);
    assert.equal(calls.filter(call => call.url === 'api/rest/server/list').length, 1);
    button(dialog, 'confirm').click();
    await settle();
    assert.equal(deleteCalls(calls).length, 2);
    assert.equal(dialog.isShow, false);
    assert.equal(messages.length, 1);
  } finally { dispose(vm); }
});

// 请求中关闭确认框后仍保持提交保护，防止重新打开相同节点再次删除。
test('删除请求未完成时关闭弹框不能重新提交', async() => {
  let complete;
  const pending = new Promise(resolve => { complete = resolve; });
  const { vm, calls } = await mount([{ serverId: 10, status: 'stop' }], () => pending);
  try {
    actions(vm, 10)[1].click();
    await settle();
    button(dialogs[0], 'confirm').click();
    button(dialogs[0], 'cancel').click();
    actions(vm, 10)[1].click();
    await settle();
    assert.equal(dialogs.length, 1);
    assert.equal(deleteCalls(calls).length, 1);
    complete({ Status: 'ERROR' });
    await settle();
    actions(vm, 10)[1].click();
    await settle();
    assert.equal(dialogs.length, 2);
    assert.equal(deleteCalls(calls).length, 1);
  } finally { dispose(vm); }
});
