const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const { transformSync } = require('@babel/core');
const { parse } = require('vue/compiler-sfc');
const { JSDOM } = require('jsdom');

const workorder = '../task/processdetail/workorder/';

// 加载实际 SFC 的方法和模板，只替换本用例不需要的外部组件依赖。
function loadModule(filename, imports = {}) {
  const absolutePath = resolve(__dirname, workorder, filename);
  const source = readFileSync(absolutePath, 'utf8');
  const descriptor = filename.endsWith('.vue') ? parse({ source, filename: absolutePath }) : null;
  const { code } = transformSync(descriptor ? descriptor.script.content : source, {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
  });
  const exports = {};
  new Function('exports', 'require', code)(exports, name => imports[name] || {});
  if (descriptor && descriptor.template) {
    exports.default.template = descriptor.template.content;
  }
  return exports;
}

const strategy = loadModule('strategy/strategy-detail.vue').default;
const replyDialog = loadModule('strategy/reply-dialog.vue').default;

// 捕获实际提交方法的 API 参数，保留原有内容校验、默认内容和请求中禁用逻辑。
function createSubmission(isDialog, content = '原回复内容', replyLabel = '回复') {
  const requests = [];
  const warnings = [];
  const item = { id: 101, CkeditorContent: content };
  const vm = {
    ...(isDialog ? replyDialog.methods : strategy.methods),
    config: { id: item.id },
    content,
    completingTaskId: null,
    isCompleting: isDialog ? false : strategy.methods.isCompleting,
    $set: (target, key, value) => { target[key] = value; },
    $t: key => key === 'page.reply' ? replyLabel : key,
    $Notice: { warning: message => warnings.push(message) },
    $Message: { success() {} },
    $emit() {},
    getListTask() {},
    $api: { process: { process: { completeTask(data) {
      requests.push({ ...data });
      return Promise.resolve({ Status: 'OK' });
    } } } }
  };
  return {
    vm,
    requests,
    warnings,
    submit(button) {
      if (isDialog) {
        vm.comment(button);
      } else {
        vm.comment(item, button);
      }
    }
  };
}

test('首次回复和编辑回复都提交实际自定义按钮名称，并保留描述内容', async() => {
  for (const isDialog of [false, true]) {
    for (const name of ['同意', '驳回', '确认', '<b>Agree</b> & "确认"']) {
      const fixture = createSubmission(isDialog);
      fixture.submit({ name });
      assert.deepEqual(fixture.requests, [{ id: 101, content: '原回复内容', button: name }]);
      await new Promise(resolve => setImmediate(resolve));
    }
  }
});

test('默认回复记录当前显示语言的按钮名称，自定义默认内容仍生效', async() => {
  for (const isDialog of [false, true]) {
    for (const label of ['回复', 'Reply']) {
      const fixture = createSubmission(isDialog, '原回复内容', label);
      fixture.submit();
      assert.equal(fixture.requests[0].button, label);
      await new Promise(resolve => setImmediate(resolve));
    }
    const fixture = createSubmission(isDialog, '');
    fixture.submit({ name: '同意', defaultContent: '默认意见', isRequired: true });
    assert.deepEqual(fixture.requests, [{ id: 101, content: '默认意见', button: '同意' }]);
    await new Promise(resolve => setImmediate(resolve));
  }
});

test('增加按钮参数后仍阻止空回复和请求中的重复点击', async() => {
  for (const isDialog of [false, true]) {
    const empty = createSubmission(isDialog, '');
    empty.submit();
    assert.equal(empty.requests.length, 0);
    assert.ok(isDialog ? empty.vm.validMesage : empty.warnings.length);

    const pending = createSubmission(isDialog);
    pending.submit({ name: '同意' });
    pending.submit({ name: '驳回' });
    assert.equal(pending.requests.length, 1);
    assert.equal(pending.requests[0].button, '同意');
    await new Promise(resolve => setImmediate(resolve));
  }
});

// 复用实际类型注册和时间线明细循环，验证按钮组件继承的纯文本渲染生效。
function createTimeline(details) {
  const dom = new JSDOM('', { runScripts: 'outside-only' });
  const { window } = dom;
  window.eval(readFileSync(require.resolve('vue/dist/vue.js'), 'utf8'));
  const Vue = window.Vue;
  Vue.config.productionTip = false;
  Vue.config.devtools = false;
  Vue.prototype.$t = key => key;
  Vue.use(require('vue-dompurify-html').default, {}, () => require('dompurify')(window));
  const titleHandler = loadModule('activity/item/title-handler.vue').default;
  const buttonHandler = loadModule('activity/item/button-handler.vue', { './title-handler.vue': titleHandler }).default;
  const contentHandler = loadModule('activity/item/content-handler.vue', {
    '../../long-html-content.js': loadModule('long-html-content.js')
  }).default;
  const item = loadModule('activity/item/index.js', {
    './title-handler': titleHandler,
    './button-handler': buttonHandler,
    './content-handler': contentHandler,
    '@/resources/import/component-manager.js': { getTimeLineComponent: () => ({}) }
  }).default;
  const overview = loadModule('activity/activity-overview.vue', { './item': item }).default;
  const [detailTemplate] = overview.template.match(/<div v-if="item.auditDetailList[\s\S]*?<\/div>/);
  const vm = new Vue({
    components: item,
    data: {
      item: { id: 1, auditDetailList: details },
      frozenFormConfig: {},
      processTaskId: 1
    },
    computed: overview.computed,
    template: detailTemplate
  }).$mount();
  window.document.body.appendChild(vm.$el);
  return {
    vm,
    close() {
      vm.$destroy();
      window.close();
    }
  };
}

test('同一条时间线先显示原富文本内容，再按纯文本显示当次按钮', async() => {
  const buttonName = '<b>同意 Agree</b> & "确认"';
  const content = { auditId: 1, type: 'content', typeName: '内容', changeType: 'new', newContent: '<p><strong>原回复内容</strong></p>' };
  const fixture = createTimeline([content, { auditId: 1, type: 'button', typeName: '按钮', newContent: buttonName }]);
  try {
    const rows = fixture.vm.$el.children;
    assert.equal(rows.length, 2);
    assert.equal(rows[0].querySelector('strong').textContent, '原回复内容');
    assert.equal(rows[1].querySelector('.left-label-text').textContent, '按钮');
    assert.equal(rows[1].lastElementChild.textContent, buttonName);
    assert.equal(rows[1].querySelector('b'), null, '按钮名中的 HTML 标记必须作为文字显示');

    // 刷新为旧时间线数据时，不保留上一条操作的按钮明细。
    fixture.vm.item = { id: 2, auditDetailList: [{ ...content, auditId: 2 }] };
    await fixture.vm.$nextTick();
    assert.equal(fixture.vm.$el.children.length, 1);
    assert.equal(fixture.vm.$el.querySelector('strong').textContent, '原回复内容');
    assert.ok(!fixture.vm.$el.textContent.includes('按钮'));
  } finally {
    fixture.close();
  }
});
