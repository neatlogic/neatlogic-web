const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { transformSync } = require('@babel/core');
const { parse } = require('vue/compiler-sfc');
const Vue = require('vue');
const { cloneDeep: deepClone, isEmpty, uniqueId: setUuid } = require('lodash');

function loadOptions(filename) {
  const source = fs.readFileSync(path.resolve(__dirname, filename), 'utf8');
  const { script } = parse({ source, filename });
  const { code } = transformSync(script.content, {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs']
  });
  const exports = {};
  // These tests exercise sheet initialization and layout without reaction scripts or UI controls.
  new Function('exports', 'require', code)(exports, () => ({}));
  return exports.default;
}

const sheet = loadOptions('../TsSheet.vue');
const handler = loadOptions('../../../../views/pages/process/task/processdetail/workorder/activity/item/form-handler.vue');
const $utils = { deepClone, isEmpty, setUuid };

test('two historical sheets initialize independent rows, inherited components and widths', () => {
  const component = { uuid: 'field', componentList: ['child'] };
  const scene = {
    uuid: 'scene', lefterList: [{ height: 50 }], headerList: [{ width: 80 }],
    tableList: [{ component: { uuid: 'field', inherit: true } }]
  };
  const value = {
    uuid: 'main', formWidth: { cellSpacing: 4 }, defaultSceneUuid: 'scene',
    tableList: [{ component }], lefterList: [], headerList: [], sceneList: [scene]
  };
  const original = deepClone(value);
  function init(formSceneUuid) {
    const vm = new Vue({ data: () => ({ config: {}, mode: 'read' }), methods: sheet.methods });
    Object.assign(vm, { $utils, value, formSceneUuid });
    vm.initSheet();
    return vm.config;
  }
  const first = init('scene');
  const rowKey = first.lefterList[0].rowUuid;
  const cellKey = first.tableList[0].rowColUuid;
  const second = init('missing');
  assert.equal(second.uuid, 'scene');
  assert.equal(first.lefterList[0].rowUuid, rowKey);
  assert.equal(first.tableList[0].rowColUuid, cellKey);
  assert.notEqual(second.lefterList[0].rowUuid, rowKey);
  assert.notEqual(second.tableList[0].rowColUuid, cellKey);
  second.tableList[0].component.componentList.push('extra');
  second.formWidth.cellSpacing = 12;
  assert.deepEqual(Array.from(first.tableList[0].component.componentList), ['child']);
  assert.equal(first.formWidth.cellSpacing, 4);
  assert.deepEqual(value, original);
  assert.equal(init('main').uuid, 'main');
});

test('edit-mode row layout sorts cells and skips merged interiors without reordering the source', () => {
  const bottom = { row: 1, col: 0 };
  const covered = { row: 0, col: 1 };
  const merged = { row: 0, col: 0, colspan: 2 };
  const vm = new Vue({
    data: () => ({ mode: 'edit', config: { tableList: [bottom, covered, merged], hiddenRowList: [] } }),
    computed: sheet.computed, methods: sheet.methods
  });
  assert.deepEqual(Array.from(vm.cellList), [merged, covered, bottom]);
  assert.deepEqual(vm.rowCells(0), [merged]);
  assert.equal(vm.rowCells(1)[0], bottom);
  assert.deepEqual(Array.from(vm.config.tableList), [bottom, covered, merged]);
});

test('reopening a historical form rebuilds all field values and highlight flags', () => {
  const vm = {
    $utils, isShow: false, ...handler.methods,
    config: { oldContent: JSON.stringify([
      { attributeUuid: 'a', dataObj: 'value', modified: true },
      { attributeUuid: 'b', dataObj: 0, modified: false }
    ]) },
    formHighlightData: {}
  };
  vm.seeMore();
  const previousFlags = sheet.computed.freezeFormHighlightData.call(vm);
  vm.seeMore();
  vm.seeMore();
  assert.equal(vm.isShow, true);
  assert.deepEqual(vm.formData, { a: 'value', b: 0 });
  assert.deepEqual(vm.formHighlightData, { a: true, b: false });
  assert.notEqual(vm.formHighlightData, previousFlags);
});
