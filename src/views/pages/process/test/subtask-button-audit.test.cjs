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

test('同一条时间线保留富文本内容，以操作标签按纯文本显示当次按钮', async() => {
  const buttonName = '<b>同意 Agree</b> & "确认"';
  for (const [language, title] of [['zh', '操作'], ['en', 'Action']]) {
    // 时间线标签由后端专用翻译提供，读取实际语言资源验证显示文案且保留 button 类型。
    const messages = JSON.parse(readFileSync(resolve(__dirname, '../../../../../../neatlogic-itsm-base/src/main/resources/neatlogic/resources/itsm-base/i18n', `language_${language}.json`), 'utf8'));
    const labels = messages.nfpc.processtaskauditdetailtype.text;
    const content = { auditId: 1, type: 'content', typeName: labels.content, changeType: 'new', newContent: '<p><strong>原回复内容</strong></p>' };
    const fixture = createTimeline([content, { auditId: 1, type: 'button', typeName: labels.button, newContent: buttonName }]);
    try {
      const rows = fixture.vm.$el.children;
      assert.equal(rows.length, 2);
      assert.equal(rows[0].querySelector('strong').textContent, '原回复内容');
      assert.equal(rows[1].querySelector('.left-label-text').textContent, title);
      assert.equal(rows[1].lastElementChild.textContent, buttonName);
      assert.equal(rows[1].querySelector('b'), null, '按钮名中的 HTML 标记必须作为文字显示');

      // 刷新为旧时间线数据时，不保留上一条操作的明细。
      fixture.vm.item = { id: 2, auditDetailList: [{ ...content, auditId: 2 }] };
      await fixture.vm.$nextTick();
      assert.equal(fixture.vm.$el.children.length, 1);
      assert.equal(fixture.vm.$el.querySelector('strong').textContent, '原回复内容');
      assert.ok(!fixture.vm.$el.textContent.includes(title));
    } finally {
      fixture.close();
    }
  }
});

// 使用两个真实组件的数据装配和完整表格模板，表格替身只负责逐列调用 scoped slot。
function createReplyTable(filename, rows, language = 'zh') {
  const component = loadModule(`strategy/${filename}`).default;
  const page = JSON.parse(readFileSync(resolve(__dirname, '../../../../resources/assets/languages/page', `${language}.json`), 'utf8'));
  const dom = new JSDOM('', { runScripts: 'outside-only' });
  const { window } = dom;
  window.eval(readFileSync(require.resolve('vue/dist/vue.js'), 'utf8'));
  const Vue = window.Vue;
  Vue.config.productionTip = false;
  Vue.config.devtools = false;
  Vue.prototype.$t = key => key.startsWith('page.') ? page[key.slice(5)] : key;
  Vue.prototype.$utils = {
    deepClone: value => JSON.parse(JSON.stringify(value)),
    removeHTMLTag: value => value.replace(/<[^>]*>/g, '')
  };
  const tableTemplate = component.template.slice(component.template.indexOf('<TsTable'), component.template.indexOf('</TsTable>') + '</TsTable>'.length);
  const vm = new Vue({
    data() {
      return { ...component.data.call(this), readonly: true };
    },
    methods: component.methods,
    filters: { formatDate: value => value || '-' },
    components: {
      TsTable: {
        props: ['tbodyList', 'theadList'],
        render(h) {
          return h('table', [
            h('thead', [h('tr', this.theadList.map(column => h('th', { attrs: { 'data-column': column.key } }, column.title)))]),
            h('tbody', this.tbodyList.map(row => h('tr', { key: row.id }, this.theadList.map(column => h('td', {
              attrs: { 'data-column': column.key }
            }, this.$scopedSlots[column.key] ? this.$scopedSlots[column.key]({ row }) : String(row[column.key] || ''))))))
          ]);
        }
      },
      UserCard: { props: ['uuid'], template: '<span>{{ uuid }}</span>' },
      Tooltip: { template: '<span><slot /></span>' }
    },
    template: `<div><div v-for="item in processTaskStepTaskList" :key="item.id">${tableTemplate}</div></div>`
  });
  function update(nextRows) {
    vm.initData({
      id: 1,
      num: -1,
      rangeList: [],
      processTaskStepTaskList: [{ id: 101, stepTaskUserVoList: nextRows }]
    });
  }
  update(rows);
  vm.$mount();
  window.document.body.appendChild(vm.$el);
  return {
    vm,
    update,
    cells: () => Array.from(vm.$el.querySelectorAll('tbody td[data-column="button"]')),
    close() {
      vm.$destroy();
      window.close();
    }
  };
}

// 每行采用不同处理人与按钮值，避免表格错误地复用其他处理人的回复信息。
function createReplyRows(buttons) {
  return buttons.map((button, index) => ({
    id: index + 1,
    userUuid: `user-${index + 1}`,
    userVo: { initType: 'user' },
    content: `回复内容 ${index + 1}`,
    endTime: '2026-11-22 17:37:52',
    fileList: [],
    ...(button === undefined ? {} : { button })
  }));
}

for (const filename of ['strategy-detail.vue', 'strategy-detail-readonly.vue']) {
  test(`${filename} 将各行按钮原值传入回复与附件之间的操作列，并使用公共翻译`, () => {
    for (const [language, title] of [['zh', '操作'], ['en', 'Action']]) {
      const rows = createReplyRows(['同意', '驳回', '确认', '回复', 'Reply']);
      const fixture = createReplyTable(filename, rows, language);
      try {
        // Vue 在浏览器上下文中观测数组，转为当前测试上下文的数组后比较业务值。
        const columns = Array.from(fixture.vm.theadList).filter(column => column.key !== 'action');
        assert.deepEqual(columns.map(column => column.key), ['userUuid', 'endTime', 'content', 'button', 'fileList']);
        assert.equal(fixture.vm.$el.querySelector('th[data-column="button"]').textContent, title);
        assert.deepEqual(Array.from(fixture.vm.processTaskStepTaskList[0].tbodyList, row => row.button), rows.map(row => row.button));
        assert.deepEqual(fixture.cells().map(cell => cell.textContent), rows.map(row => row.button));
      } finally {
        fixture.close();
      }
    }
  });

  test(`${filename} 以纯文本显示按钮、兼容空值并沿用已删除行样式`, () => {
    const text = '<b>同意 Agree</b> & "确认" \'回复\'';
    const rows = createReplyRows([text, '  保留名称空格  ', undefined, null, '', ' \t\n ']);
    rows[0].isDelete = 1;
    const fixture = createReplyTable(filename, rows);
    try {
      const cells = fixture.cells();
      assert.deepEqual(cells.map(cell => cell.textContent), [text, '  保留名称空格  ', '-', '-', '-', '-']);
      assert.equal(cells[0].querySelector('b'), null, '按钮名称中的标签不能解析为 HTML');
      assert.ok(cells[0].querySelector('.text-disabled'), '已删除行的按钮应与其他列一样置灰');
      assert.equal(cells[1].querySelector('.text-disabled'), null, '有效回复不应误用删除态样式');
    } finally {
      fixture.close();
    }
  });

  test(`${filename} 刷新回复数据后显示新按钮，按钮变空时清除旧值`, async() => {
    const fixture = createReplyTable(filename, createReplyRows(['同意', '回复']));
    try {
      fixture.update(createReplyRows(['驳回', undefined]));
      await fixture.vm.$nextTick();
      assert.deepEqual(fixture.cells().map(cell => cell.textContent), ['驳回', '-']);
      assert.ok(!fixture.vm.$el.textContent.includes('同意'));
      fixture.update([]);
      await fixture.vm.$nextTick();
      assert.equal(fixture.cells().length, 0, '空回复列表不能留下旧行的按钮');
    } finally {
      fixture.close();
    }
  });
}
