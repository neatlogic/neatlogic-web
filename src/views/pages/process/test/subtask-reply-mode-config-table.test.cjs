const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const { transformSync } = require('@babel/core');
const { parse } = require('vue/compiler-sfc');
const { JSDOM } = require('jsdom');

const workorder = resolve(__dirname, '../task/processdetail/workorder');

// 加载真实组件及共用展示函数，使用隔离 DOM 验证富文本而非模拟拼接实现。
function loadModule(filename, document, imports = {}) {
  const source = readFileSync(filename, 'utf8');
  const descriptor = filename.endsWith('.vue') ? parse({ source, filename }) : null;
  const { code } = transformSync(descriptor ? descriptor.script.content : source, {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
  });
  const exports = {};
  new Function('exports', 'require', 'document', code)(exports, name => imports[name] || {}, document);
  if (descriptor) exports.default.template = descriptor.template.content;
  return exports;
}

function createConfig() {
  const helper = loadModule(resolve(workorder, 'subtask-reply-display.js'));
  const component = loadModule(resolve(__dirname, '../subtask/subtasktype-manage.vue'), undefined, {
    '../task/processdetail/workorder/subtask-reply-display.js': helper
  }).default;
  const saved = [];
  const vm = {
    $t: key => key,
    $utils: {deepClone: value => JSON.parse(JSON.stringify(value))},
    $set: (target, key, value) => { target[key] = value; }
  };
  Object.assign(vm, component.data.call(vm), component.methods);
  vm.$refs = {
    relationDialogForm: {
      valid: () => true,
      getFormValue: () => Object.fromEntries(vm.relationDialogForm.map(item => [item.name, item.value]))
    }
  };
  vm.seveData = value => saved.push(value);
  return {vm, saved, mode: () => vm.relationDialogForm.find(item => item.name === 'replyDisplayMode')};
}

test('策略显示方式位于自定义按钮之后，不可清空，新增及旧策略默认分开', () => {
  const {vm, mode} = createConfig();
  assert.equal(vm.relationDialogForm.at(-2).name, 'buttonList');
  assert.equal(vm.relationDialogForm.at(-1), mode());
  assert.equal(mode().clearable, false);
  assert.equal(mode().multiple, false);
  assert.ok(!Object.hasOwn(mode(), 'dataList'));
  assert.equal(mode().url, '/api/rest/universal/enum/get');
  assert.deepEqual(mode().params, {enumClass: 'TaskReplyDisplayMode'});
  assert.deepEqual(mode().validateList, ['required']);
  assert.equal(mode().value, 'separate');
  vm.editRelations({id: 1, name: '旧策略', config: {customButtonList: []}});
  assert.equal(mode().value, 'separate');
  vm.editRelations({id: 2, name: '会签', config: {replyDisplayMode: 'combined'}});
  assert.equal(mode().value, 'combined');
  vm.cancleRelations();
  assert.equal(mode().value, 'separate');
  vm.editRelations({id: 2, name: '会签', config: {replyDisplayMode: 'combined'}});
  vm.addRelations();
  assert.equal(mode().value, 'separate');
  assert.deepEqual(vm.strategyConfig, {});
});

test('显示方式使用真实选择组件的 POST/Return 流程加载枚举，按接口文字回显并保存选中的值', async() => {
  const {vm: form, mode, saved} = createConfig();
  const select = loadModule(resolve(__dirname, '../../../../resources/plugins/TsForm/TsFormSelect.vue')).default;
  // 仅替换网络和下拉框定位，使用共享组件原有请求、回显及单选逻辑。
  const requests = [];
  const response = [
    {value: 'separate', text: '操作按钮与回复内容分开显示'},
    {value: 'combined', text: '操作按钮与回复内容拼接显示（以句号分隔）'}
  ];
  const https = async request => {
    requests.push(request);
    return {Status: 'OK', Return: response};
  };
  https.CancelToken = {source: () => ({token: {}, cancel() {}})};
  const vm = {
    ...mode(),
    $https: https,
    $t: key => key,
    $utils: {
      deepClone: value => JSON.parse(JSON.stringify(value)),
      isEmpty: value => value == null || value === '' || Array.isArray(value) && value.length === 0,
      equalStr: (left, right) => String(left) === String(right)
    },
    $emit(event, value) { if (event === 'change') mode().value = value; },
    filterValid: values => values,
    isRequired: true,
    valid: () => true
  };
  for (const name of ['ajaxType', 'valueName', 'textName', 'rootName', 'mode', 'search']) {
    vm[name] = select.props[name].default;
  }
  Object.assign(vm, select.data.call(vm), select.methods, {hideOption() {}, scrollTop() {}});
  vm.currentValue = mode().value;
  vm.initDataListByUrl(false);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requests, [{method: 'post', url: mode().url, data: mode().params}]);
  assert.deepEqual(vm.nodeList, response);
  assert.deepEqual(vm.selectedList, [response[0]], '新增默认 separate 以接口 text 回显');

  form.editRelations({id: 9, name: '会签', config: {replyDisplayMode: 'combined'}});
  vm.currentValue = mode().value;
  vm.initValueByNodeList();
  assert.deepEqual(vm.selectedList, [response[1]], '编辑 combined 使用接口 text 回显');
  vm.toggleSelect(response[1]);
  assert.equal(vm.currentValue, 'combined', '必填单选再次点击当前值不能取消');
  vm.toggleSelect(response[0]);
  assert.equal(mode().value, 'separate');
  assert.deepEqual(vm.selectedList, [response[0]]);
  form.saveRelations();
  assert.equal(saved[0].config.replyDisplayMode, 'separate');
  assert.equal(requests.length, 1, '切换选项和编辑回显沿用已加载枚举');
});

test('保存两种显示方式时保留配置，删除全部自定义按钮不会复活旧按钮', () => {
  for (const displayMode of ['separate', 'combined']) {
    const {vm, mode, saved} = createConfig();
    const original = {id: 1, name: '会签', config: {replyDisplayMode: 'combined', otherConfig: {keep: true}, customButtonList: [{name: '同意', defaultContent: '意见'}]}};
    vm.editRelations(original);
    mode().value = displayMode;
    vm.customButtonList[0].name = '确认';
    assert.equal(original.config.customButtonList[0].name, '同意', '编辑不能提前修改列表已有配置');
    vm.saveRelations();
    assert.equal(saved[0].config.replyDisplayMode, displayMode);
    assert.deepEqual(saved[0].config.otherConfig, {keep: true});
    assert.deepEqual(saved[0].config.customButtonList, [{name: '确认', defaultContent: '意见'}]);
    assert.ok(!Object.hasOwn(saved[0], 'replyDisplayMode'));
    assert.ok(!Object.hasOwn(saved[0], 'buttonList'));
    vm.saving = false;
    vm.customButtonList = [];
    vm.saveRelations();
    assert.deepEqual(saved[1].config.customButtonList, []);
    assert.deepEqual(saved[1].config.otherConfig, {keep: true});
  }
});

test('新增策略即使没有自定义按钮也提交默认显示方式，并提供中英文文案', () => {
  const {vm, saved} = createConfig();
  vm.addRelations();
  vm.saveRelations();
  assert.deepEqual(saved[0].config, {replyDisplayMode: 'separate', customButtonList: []});
  for (const language of ['zh', 'en']) {
    const messages = JSON.parse(readFileSync(resolve(__dirname, '../../../../resources/assets/languages/term', `${language}.json`), 'utf8')).process;
    for (const key of ['replydisplaymode', 'replydisplayseparate', 'replydisplaycombined']) assert.ok(messages[key]);
    if (language === 'zh') assert.equal(messages.replydisplaymode, '回复意见显示方式');
  }
});

// 挂载两个实际表格模板，仅用简化表格组件调用相同 scoped slots。
function createTable(filename, rows, config) {
  const dom = new JSDOM('', {runScripts: 'outside-only'});
  const {window} = dom;
  const helper = loadModule(resolve(workorder, 'subtask-reply-display.js'), window.document);
  const component = loadModule(resolve(workorder, 'strategy', filename), window.document, {'../subtask-reply-display.js': helper}).default;
  window.eval(readFileSync(require.resolve('vue/dist/vue.js'), 'utf8'));
  const Vue = window.Vue;
  Vue.config.productionTip = false;
  Vue.config.devtools = false;
  Vue.prototype.$t = key => key;
  Vue.prototype.$utils = {deepClone: value => JSON.parse(JSON.stringify(value))};
  const tableTemplate = component.template.slice(component.template.indexOf('<TsTable'), component.template.indexOf('</TsTable>') + '</TsTable>'.length);
  const vm = new Vue({
    data() { return {...component.data.call(this), readonly: true}; },
    methods: component.methods,
    filters: {formatDate: value => value || '-'},
    components: {
      TsTable: {
        props: ['tbodyList', 'theadList'],
        render(h) {
          return h('table', [
            h('thead', [h('tr', this.theadList.map(column => h('th', {attrs: {'data-column': column.key}}, column.title)))]),
            h('tbody', this.tbodyList.map(row => h('tr', {key: row.id}, this.theadList.map(column => h('td', {attrs: {'data-column': column.key}}, this.$scopedSlots[column.key] ? this.$scopedSlots[column.key]({row}) : String(row[column.key] || ''))))))
          ]);
        }
      },
      UserCard: {props: ['uuid'], template: '<span>{{ uuid }}</span>'},
      Tooltip: {template: '<div><span data-summary><slot /></span><div data-tooltip><slot name="content" /></div></div>'}
    },
    template: `<div><div v-for="item in processTaskStepTaskList" :key="item.id">${tableTemplate}</div></div>`
  });
  // 表格刷新以策略 config 为唯一模式来源，保留旧回复字段用于验证其被忽略。
  const update = (values, currentConfig = config) => vm.initData({id: 1, num: -1, rangeList: [], config: currentConfig, processTaskStepTaskList: [{id: 101, stepTaskUserVoList: values}]});
  update(rows, config);
  vm.$mount();
  window.document.body.appendChild(vm.$el);
  return {
    vm, update,
    columns: () => Array.from(vm.$el.querySelectorAll('th'), th => th.getAttribute('data-column')).filter(key => key !== 'action'),
    cells: key => Array.from(vm.$el.querySelectorAll(`tbody td[data-column="${key}"]`)),
    close() { vm.$destroy(); window.close(); }
  };
}

const reply = (id, mode, overrides = {}) => ({id, userUuid: `user-${id}`, userVo: {initType: 'user'}, content: '<p><strong>按流程办理</strong></p>', button: '同意', replyDisplayMode: mode, endTime: 100 + id, ...overrides});

for (const filename of ['strategy-detail.vue', 'strategy-detail-readonly.vue']) {
  test(`${filename} 切换当前策略统一刷新历史回复，忽略旧快照并保留原始内容和删除样式`, async() => {
    const specialButton = '<b>同意</b> & "确认"';
    const rows = [reply(1, 'combined', {isReplyable: true}), reply(2, 'separate', {button: specialButton, isDelete: 1})];
    const fixture = createTable(filename, rows, {replyDisplayMode: 'separate'});
    try {
      assert.deepEqual(fixture.columns(), ['userUuid', 'endTime', 'content', 'button', 'fileList']);
      assert.deepEqual(fixture.cells('button').map(cell => cell.textContent.trim()), ['同意', specialButton]);
      assert.equal(fixture.cells('button')[1].querySelector('b'), null, '操作列按纯文本显示');
      assert.ok(fixture.cells('button')[1].querySelector('.text-disabled'));
      assert.ok(fixture.cells('content').every(cell => cell.querySelector('[data-summary]').textContent.trim() === '按流程办理'));

      fixture.update(rows, {replyDisplayMode: 'combined'});
      await fixture.vm.$nextTick();
      assert.deepEqual(fixture.columns(), ['userUuid', 'endTime', 'content', 'fileList']);
      const contentCells = fixture.cells('content');
      assert.equal(contentCells[0].querySelector('[data-summary]').textContent.trim(), '同意。按流程办理');
      const tooltip = contentCells[1].querySelector('[data-tooltip]');
      assert.equal(tooltip.textContent, specialButton + '。按流程办理');
      assert.equal(tooltip.querySelector('b'), null, '操作标签必须作为纯文本');
      assert.equal(tooltip.querySelector('strong').textContent, '按流程办理');
      assert.ok(contentCells[1].querySelector('.text-disabled'));
      const stored = fixture.vm.processTaskStepTaskList[0].tbodyList[1];
      assert.equal(stored.content, rows[1].content);
      assert.equal(stored.button, specialButton);
      assert.equal(stored.replyDisplayMode, 'combined');
      if (filename === 'strategy-detail.vue') {
        const task = fixture.vm.processTaskStepTaskList[0];
        assert.equal(task.CkeditorContent, rows[0].content, '编辑器加载原始回复，不附加操作前缀');
        fixture.vm.editCkeditor(task);
        assert.equal(fixture.vm.replyConfig.CkeditorContent, rows[0].content);
      }

      fixture.update(rows, {replyDisplayMode: 'separate'});
      await fixture.vm.$nextTick();
      assert.deepEqual(fixture.columns(), ['userUuid', 'endTime', 'content', 'button', 'fileList']);
      assert.deepEqual(fixture.cells('button').map(cell => cell.textContent.trim()), ['同意', specialButton]);
      assert.ok(fixture.cells('content').every(cell => cell.querySelector('[data-summary]').textContent.trim() === '按流程办理'));
      assert.equal(rows[0].replyDisplayMode, 'combined', '不改写接口返回的旧字段');
      assert.equal(rows[1].replyDisplayMode, 'separate');
    } finally { fixture.close(); }
  });

  test(`${filename} 操作列跟随当前策略，覆盖待回复、已回复、混合及空记录`, async() => {
    const pending = reply(1, 'separate', {status: 'pending', endTime: null, content: null, button: null});
    // 附件操作可能给待回复行写入 endTime，列显隐仍只取决于当前策略。
    const pendingWithEndTime = reply(2, 'combined', {status: 'pending', content: null, button: null});
    const completed = reply(3, 'separate', {status: 'succeed', endTime: null});
    const fixture = createTable(filename, [pending], {replyDisplayMode: 'combined'});
    try {
      for (const rows of [[pending], [pendingWithEndTime], [pending, pendingWithEndTime], [completed, pending], [completed], []]) {
        for (const mode of ['separate', 'combined']) {
          fixture.update(rows, {replyDisplayMode: mode});
          await fixture.vm.$nextTick();
          const columns = mode === 'combined' ? ['userUuid', 'endTime', 'content', 'fileList'] : ['userUuid', 'endTime', 'content', 'button', 'fileList'];
          assert.deepEqual(fixture.columns(), columns, `${mode} 模式不受回复状态和记录数量影响`);
          rows.forEach((row, index) => {
            if (row.status === 'pending') assert.equal(fixture.cells('content')[index].textContent.trim(), '-');
          });
        }
      }
      fixture.update([completed], {replyDisplayMode: 'combined'});
      await fixture.vm.$nextTick();
      assert.equal(fixture.cells('content')[0].querySelector('[data-summary]').textContent.trim(), '同意。按流程办理');
      assert.ok(!fixture.vm.$el.textContent.includes('同意。同意'));
    } finally { fixture.close(); }
  });

  test(`${filename} 同一批待回复数据切换策略后刷新列，不需要先提交回复`, async() => {
    const rows = [
      reply(1, 'combined', {status: 'pending', endTime: null, content: null, button: null}),
      reply(2, 'separate', {status: 'pending', content: null, button: null})
    ];
    const fixture = createTable(filename, rows, {replyDisplayMode: 'separate'});
    try {
      // 仅刷新策略配置，处理人状态与原始回复保持不变。
      for (const mode of ['separate', 'combined', 'separate']) {
        fixture.update(rows, {replyDisplayMode: mode});
        await fixture.vm.$nextTick();
        assert.equal(fixture.columns().includes('button'), mode === 'separate');
        assert.deepEqual(fixture.cells('content').map(cell => cell.textContent.trim()), ['-', '-']);
        assert.ok(fixture.vm.processTaskStepTaskList[0].tbodyList.every(row => row.status === 'pending' && row.content === null && row.button === null));
      }
    } finally { fixture.close(); }
  });

  test(`${filename} 策略配置缺失、空值和非法模式均按分开显示`, async() => {
    const rows = [reply(1, 'combined')];
    const fixture = createTable(filename, rows);
    try {
      for (const config of [undefined, null, {}, {replyDisplayMode: ''}, {replyDisplayMode: null}, {replyDisplayMode: 'invalid'}]) {
        fixture.update(rows, config);
        await fixture.vm.$nextTick();
        assert.ok(fixture.columns().includes('button'));
        assert.equal(fixture.cells('content')[0].querySelector('[data-summary]').textContent.trim(), '按流程办理');
        assert.equal(fixture.cells('button')[0].textContent.trim(), '同意');
        // 未回复和空列表同样沿用缺省分开模式，不能因记录状态隐藏操作列。
        for (const values of [[reply(2, 'combined', {status: 'pending', endTime: null, content: null, button: null})], []]) {
          fixture.update(values, config);
          await fixture.vm.$nextTick();
          assert.ok(fixture.columns().includes('button'));
        }
      }
    } finally { fixture.close(); }
  });

  test(`${filename} 空回复兼容占位，只有操作或内容时不产生多余句号`, () => {
    const rows = [
      reply(1, 'combined', {content: '<p><br></p>', button: '确认'}),
      reply(2, 'combined', {content: '<p>仅意见</p>', button: '  '}),
      reply(3, 'combined', {content: '<p>&nbsp;<br></p>', button: null}),
      reply(4, 'separate', {content: ' \n ', button: undefined}),
      reply(5, 'combined', {content: '<p><img src="test.png"></p>', button: null})
    ];
    const fixture = createTable(filename, rows, {replyDisplayMode: 'combined'});
    try {
      const cells = fixture.cells('content');
      assert.equal(cells[0].querySelector('[data-summary]').textContent.trim(), '确认');
      assert.equal(cells[1].querySelector('[data-summary]').textContent.trim(), '仅意见');
      assert.equal(cells[2].textContent.trim(), '-');
      assert.equal(cells[3].textContent.trim(), '-');
      assert.equal(cells[4].querySelector('[data-summary]').textContent.trim(), 'page.viewdetails');
      assert.equal(cells[4].querySelector('[data-tooltip] img').getAttribute('src'), 'test.png');
    } finally { fixture.close(); }
  });
}
