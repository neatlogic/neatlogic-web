// 运行 TZ=UTC 或 TZ=Asia/Shanghai node --test scripts/check-ts-form-date-picker.cjs。
const assert = require('node:assert/strict');
const { after, afterEach, test } = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { parseComponent } = require('vue/compiler-sfc');

const dom = new JSDOM('<body></body>', { url: 'http://localhost', runScripts: 'outside-only' });
for (const name of ['document', 'Element', 'HTMLElement', 'Node', 'MutationObserver', 'getComputedStyle']) {
  global[name] = dom.window[name];
}
global.self = global.window = dom.window;
global.BASEURLPREFIX = '/';
const src = path.resolve(__dirname, '../src');
const read = file => readFileSync(path.join(src, file), 'utf8');

// 加载项目所用的 Vue 2 和真实日期面板，提供 UI 包启动时需要的浏览器环境。
require('node:vm').runInContext(read('resources/assets/js/jquery-1.11.1.js'), dom.getInternalVMContext());
global.jQuery = global.$ = window.jQuery;
const Vue = require('vue');
Vue.config.productionTip = Vue.config.devtools = false;
require('neatlogic-ui');
const { compile } = require('vue/dist/vue.common.js');
const dateParser = require('neatlogic-ui/iview/utils/date');
Vue.prototype.$t = key => key;
Vue.prototype.$utils = { isEmpty: value => value == null || value === '' || (Array.isArray(value) && !value.length) };

// 使用组件实际脚本和模板，仅注入应用别名对应的依赖，避免加载整个应用或访问接口。
function evaluate(script, imports = {}) {
  const body = script.replace(/^import .*;$/gm, '').replace('export default', 'return');
  return new Function(...Object.keys(imports), body)(...Object.values(imports));
}
function loadComponent(file, imports = {}) {
  const source = parseComponent(read(file));
  return { ...evaluate(source.script.content, imports), ...compile(source.template.content) };
}
const validator = evaluate(read('resources/plugins/TsForm/TsValidtor.js'), { $t: Vue.prototype.$t, utils: Vue.prototype.$utils });
const formMixins = evaluate(read('resources/mixins/formMixins.js'), { validtorJson: validator });
const formScrollMixins = evaluate(read('resources/mixins/formScrollMixins.js'));
const DateField = loadComponent('resources/plugins/TsForm/TsFormDatePicker.vue', { formMixins, formScrollMixins, parseDate: dateParser.parse });
let host;
const flush = () => new Promise(resolve => setImmediate(resolve));

async function mount(props, component = DateField) {
  const events = [];
  host = new Vue({
    render: h => h(component, { ref: 'field', props, on: Object.fromEntries(
      ['input', 'update:value', 'change', 'on-change', 'on-ok', 'on-clear'].map(name => [name, value => events.push([name, value])])
    ) })
  }).$mount();
  await flush();
  return { field: host.$refs.field, events };
}
afterEach(() => { if (host) host.$destroy(); });
after(() => dom.window.close());

const first = Date.UTC(1970, 0, 1, 0, 0, 1);
const last = Date.UTC(2038, 0, 19, 3, 14, 7, 499);
const regular = new Date(2026, 0, 1, 15, 30);
const changes = events => events.filter(([name]) => name === 'change').map(([, value]) => value);

test('单值面板允许边界日进入滚轮，并按毫秒守住事件出口', async() => {
  const { field, events } = await mount({ type: 'datetime', confirm: true });
  const picker = field.$children[0];
  const panel = picker.$refs.pickerPanel;
  for (const time of [first, last]) {
    const day = new Date(time);
    day.setHours(0, 0, 0, 0);
    assert.equal(panel.disabledDate(day), false);
    panel.handlePick(day);
    await flush();
    panel.handleToggleTime();
    await flush();
    assert.ok(panel.$refs.timePicker);
    panel.handlePick(new Date(time), 'time');
    await flush();
    assert.equal(changes(events).at(-1), time);
    const seconds = panel.$refs.timePicker.$refs.timeSpinner.secondsList;
    const sec = new Date(time).getSeconds();
    assert.equal(seconds[sec].disabled, false);
    assert.equal(seconds[time === first ? sec - 1 : sec + 1].disabled, true);
    panel.handleToggleTime();
    await flush();
  }
  for (const time of [first - 1, last + 1]) {
    events.length = 0;
    panel.handleShortcutClick({ value: () => new Date(time) });
    picker.onPickSuccess();
    await flush();
    assert.deepEqual(events, []);
    assert.equal(field.valid(), false);
  }
  picker.handleClear();
  await flush();
  assert.deepEqual(changes(events), [null]);
  assert.equal(field.valid(), true);
});

test('范围面板的两个端点独立，快捷选项不能提交越界的另一端', async() => {
  const { field, events } = await mount({ type: 'datetimerange' });
  const picker = field.$children[0];
  const panel = picker.$refs.pickerPanel;
  panel.handleShortcutClick({ value: () => [regular, new Date(last)] });
  await flush();
  assert.deepEqual(changes(events).at(-1), [+regular, last]);
  panel.handleToggleTime();
  await flush();
  const left = panel.$refs.timePicker.$refs.timeSpinner;
  assert.equal(left.hoursList[23].disabled, false);
  for (const value of [[new Date(first - 1), regular], [regular, new Date(last + 1)]]) {
    events.length = 0;
    panel.handleShortcutClick({ value: () => value });
    await flush();
    assert.deepEqual(events, []);
    assert.equal(field.valid(), false);
  }
});

test('合并业务范围、禁用日和时间配置，调用方对象可复用', async() => {
  const time = +regular;
  let bounds = [time, 0];
  const options = Object.freeze({ disabledDate: date => date.getDay() === 0 });
  const hours = Object.freeze([17]);
  const { field, events } = await mount({ type: 'datetime', options, timePickerOptions: { disabledHours: hours }, selectableRange: () => bounds });
  const picker = field.$children[0];
  const panel = picker.$refs.pickerPanel;
  for (const invalid of [new Date(time - 1), new Date(2026, 0, 4), new Date(2026, 0, 1, 17)]) {
    panel.handleShortcutClick({ value: () => invalid });
    await flush();
    assert.deepEqual(changes(events), []);
  }
  panel.handlePick(regular);
  await flush();
  assert.deepEqual(changes(events), [time]);
  bounds = [0, time];
  assert.equal(field.isDateSelectionAllowed(new Date(time + 1)), false);
  bounds = [last + 1, 0];
  assert.equal(panel.disabledDate(new Date(last)), true);
  assert.equal(field.valid(), false);
  assert.deepEqual(hours, [17]);
});

test('多选、日期与年月按本地起点校验；不回写历史值', async() => {
  const { field, events } = await mount({ type: 'date', multiple: true, value: [Date.UTC(1960, 0, 1)] });
  const panel = field.$children[0].$refs.pickerPanel;
  assert.deepEqual(events, []);
  assert.equal(panel.disabledDate(new Date(last + 86400000)), true);
  assert.equal(field.isDateSelectionAllowed([regular, new Date(2040, 0, 1)]), false);
  panel.handlePick(new Date(2040, 0, 1));
  await flush();
  assert.deepEqual(events, []);
  for (const type of ['date', 'daterange', 'month', 'year']) {
    host.$destroy();
    const mounted = await mount({ type });
    const start = new Date(last);
    if (type === 'year') start.setMonth(0, 1);
    if (type === 'month') start.setDate(1);
    start.setHours(0, 0, 0, 0);
    assert.equal(mounted.field.dateOptions.disabledDate(start), false);
    assert.equal(mounted.field.dateOptions.disabledDate(new Date(2039, 0, 1)), true);
  }
});

test('历史时间戳保留边界毫秒，重新选值后按原格式确认', async() => {
  const { field, events } = await mount({ type: 'datetime', value: last + 1, valueType: 'format', confirm: true });
  assert.deepEqual(events, []);
  assert.equal(+field.currentValue, last + 1);
  assert.equal(field.valid(), false);
  const picker = field.$children[0];
  picker.$refs.pickerPanel.handlePick(regular);
  picker.onPickSuccess();
  await flush();
  assert.deepEqual(changes(events), ['2026-01-01 15:30:00']);
  assert.deepEqual(events.filter(([name]) => name === 'on-ok'), [['on-ok', undefined]]);
  assert.equal(field.valid(), true);
});

test('纯时间和时间范围保留字符串协议', async() => {
  for (const [type, value] of [['time', '23:59:59'], ['timerange', ['00:00:00', '23:59:59']]]) {
    if (host) host.$destroy();
    const { field, events } = await mount({ type, value });
    field.onChangeValue();
    assert.deepEqual(changes(events), [value]);
  }
});
