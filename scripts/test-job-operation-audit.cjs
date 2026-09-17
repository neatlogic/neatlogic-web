// 隔离验证操作审计面板的异步行为，不发送真实业务请求。
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const compiler = require('vue/compiler-sfc');
const folder = path.resolve(__dirname, '../src/views/pages/autoexec/detail/jobDetail/operation-audit');

// 编译真实模板，脚本依赖以空组件替代，测试真实查询方法。
function load(name) {
  const filename = path.join(folder, name + '.vue');
  const source = fs.readFileSync(filename, 'utf8');
  const descriptor = compiler.parse({source, filename});
  const template = compiler.compileTemplate({source: descriptor.template.content, filename});
  assert.deepStrictEqual(template.errors, [], filename);
  const script = descriptor.script.content.replace(/^import .*;$/gm, '').replace('export default', 'module.exports =');
  const context = {module: {exports: {}}, window: {innerWidth: 1920}, TsTable: {}, CombineSearcher: {}, TsFormInput: {}, OperationAuditDetail: {}};
  vm.runInNewContext(script, context);
  return context.module.exports;
}

// 创建可控制响应顺序的接口替身。
async function run() {
  const component = load('operation-audit-slider');
  load('operation-audit-detail');
  const requests = [], details = [];
  const ctx = {...component.data.call({$t: key => key}), jobId: '9223372036854775807', $t: key => key,
    $set: (obj, key, value) => { obj[key] = value; },
    $api: {autoexec: {job: {
      searchOperationAudit: params => new Promise((resolve, reject) => requests.push({params, resolve, reject})),
      getOperationAudit: params => new Promise((resolve, reject) => details.push({params, resolve, reject}))
    }}}
  };
  Object.entries(component.methods).forEach(([key, fn]) => ctx[key] = fn.bind(ctx));
  ctx.keyword = 'upgrade.sql'; ctx.filters = {objectType: 'sql', timeRange: [1000, 2000]};
  const older = ctx.loadList();
  ctx.filters = {}; const newer = ctx.loadList();
  assert.strictEqual(requests[0].params.jobId, '9223372036854775807');
  assert.strictEqual(requests[0].params.startTime, 1000);
  assert.strictEqual(requests[1].params.keyword, 'upgrade.sql');
  requests[1].resolve({Return: {tbodyList: [{id: '2', jobName: 'job'}], rowNum: 1, currentPage: 1}}); await newer;
  requests[0].resolve({Return: {tbodyList: [{id: '1'}], rowNum: 1, currentPage: 1}}); await older;
  assert.strictEqual(Object.keys(ctx.detailStates).length, 0); assert.strictEqual(details.length, 0);
  ctx.selectRow(ctx.rows[0]);
  ctx.rows.push({id: '3'});
  ctx.rows.forEach(row => ctx.toggleExpand(row, true));
  assert.strictEqual(details.length, 2);
  assert.strictEqual(ctx.detailStates['2'].expanded, true);
  assert.strictEqual(ctx.detailStates['3'].expanded, true);
  details[1].resolve({Return: {id: '3'}}); await Promise.resolve();
  details[0].resolve({Return: {id: '2'}}); await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(ctx.detailStates['2'].detail.id, '2');
  assert.strictEqual(ctx.detailStates['3'].detail.id, '3');
  ctx.rows.forEach(row => ctx.toggleExpand(row, false));
  assert.strictEqual(ctx.detailStates['2'].expanded, false);
  assert.strictEqual(ctx.detailStates['3'].expanded, false);
  ctx.rows.forEach(row => ctx.toggleExpand(row, true));
  assert.strictEqual(details.length, 2);
  ctx.loading = true;
  ctx.toggleExpand(ctx.rows[0], false);
  assert.strictEqual(ctx.detailStates['2'].expanded, true);
  ctx.loading = false;
  const refresh = ctx.loadList(true);
  requests[2].resolve({Return: {tbodyList: [{id: '4'}, {id: '2'}], rowNum: 2, currentPage: 1}}); await refresh;
  assert.strictEqual(ctx.detailStates['2'].expanded, true);
  assert.strictEqual(ctx.detailStates['3'], undefined);
  const stableConfig = ctx.searchConfig;
  const actionField = ctx.searchConfig.searchList.find(item => item.name === 'action');
  actionField.value = 'reset';
  const empty = ctx.loadList();
  requests[3].resolve({Return: {tbodyList: [], rowNum: 0, currentPage: 1, actionList: [{value: 'reset', text: 'Reset'}]}}); await empty;
  assert.strictEqual(Object.keys(ctx.detailStates).length, 0);
  assert.strictEqual(ctx.searchConfig, stableConfig);
  assert.strictEqual(actionField.value, 'reset');
  details[2].resolve({Return: {id: '2'}}); await Promise.resolve();
  assert.strictEqual(Object.keys(ctx.detailStates).length, 0);
  const failure = ctx.loadList(); requests[4].reject(new Error('模拟网络失败')); await failure;
  assert.strictEqual(ctx.loading, false); assert.strictEqual(ctx.listError, true);
  ctx.selectRow({id: '5'});
  ctx.selectRow({id: '5'});
  assert.strictEqual(ctx.detailStates['5'].expanded, false);
  details[3].resolve({Return: {id: '5'}}); await Promise.resolve();
  assert.strictEqual(ctx.detailStates['5'].detail, null);
  const conf = ctx.searchConfig;
  assert.strictEqual(conf.searchList.find(item => item.name === 'action').dataList[0].value, 'reset');
  assert.strictEqual(conf.search, false); assert.strictEqual(conf.searchList.length, 4);
  ctx.viewportWidth = 1920; assert.strictEqual(component.computed.dialogConfig.call(ctx).width, '70%');
  ctx.viewportWidth = 1200; assert.strictEqual(component.computed.dialogConfig.call(ctx).width, '100%');
  console.log('操作审计面板验证通过：模板、组合搜索、大整数 ID、列表与详情竞态、刷新选择、空态、失败释放、响应式宽度。');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
