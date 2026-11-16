const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
const Vue = require('vue/dist/vue.common.js');
Vue.config.productionTip = false;
Vue.config.devtools = false;
const clone = value => JSON.parse(JSON.stringify(value));
let uuid = 0;
Vue.prototype.$utils = {deepClone: clone, isEmpty: value => !value?.length, setUuid: () => 'uuid-' + (++uuid)};
Vue.prototype.$t = key => key.split('.').pop();
const dir = resolve(__dirname, '../../src/commercial-module/alert/pages/process');
const input = {props: ['value'], methods: {valid() { return !!this.value; }}, template: '<span />'};
const group = {template: '<section><slot /></section>'};
// 挂载真实模板和状态逻辑，通过替身提供脚本库、弹框外壳及基础输入控件。
const ruleDir = resolve(__dirname, '../../src/views/pages/process/flow/flowedit/components');
const nodemixin = Function(readFileSync(resolve(ruleDir, 'nodemixin.js'), 'utf8').replace('export default', 'return'))();
function component(name, children, folder = dir, imports = {}) {
  const source = readFileSync(resolve(folder, name + '.vue'), 'utf8');
  const script = source.split('<script>')[1].split('</script>')[0].replace(/^import .*;$/gm, '').replace('export default', 'return');
  const options = Function('Editors', 'Items', 'nodemixin', ...Object.keys(imports), script)({}, {}, nodemixin, ...Object.values(imports));
  return Vue.extend({...options, components: children, template: source.substring(source.indexOf('<template>') + 10, source.lastIndexOf('</template>'))});
}
const MappingRow = component('mapping-row', {TsFormItem: group, TsFormSelect: input, FilterList: {...group, methods: {valid() { return true; }}}});
const Tool = component('tool-settings', {MappingRow, TsFormSelect: input, TsFormItem: group, Loading: group, TsFormInput: input,
  TsFormRadio: input, defaultInput: input, AddTarget: group});
const ruleControls = {TsFormSelect: input, TsCodemirror: input, ConditionAttrList: group, forminput:input, formuserselect:input};
for (const name of ['TsRow','Col','Dropdown','DropdownMenu','DropdownItem','Poptip','Icon']) Vue.component(name,{...group});
const metadata = [{name:'title', label:'Title', conditionable:true, type:'common',handler:'forminput',config:{},
  expressionList:[{expression:'like',expressionName:'Contains',isShowConditionValue:1}]}];
const Settings = component('analysis-settings', {TsFormItem: group, TsFormSelect: input, TsFormInput: input, TsFormRadio: input,
  TsDialog: {...group, name: 'TsDialog'}, ToolSettings: Tool});
const tick = () => new Promise(resolve => setImmediate(resolve));
test('侧滑预览、旧映射回显、取消及切换动作后确认', async() => {
  const legacy = {type: 'tool', condition: {field:'title', operator:'contains', value:'disk'}, tool: {scriptId: 1, operationId: 51,
    label:'scan', fieldMappings:{subject:'title'}, param:{limit:'10'}, runnerGroup:{mappingMode:'constant',value:-1}}};
  let versionId = 51;
  Vue.prototype.$api = {autoexec:{script:{getScriptDetail: async(params) => {
    assert.deepEqual(params, {id:1,status:'passed'});
    return {Return:{script:{id:1,name:'scan',execMode:'runner',
    versionVo:{id:versionId,version:versionId === 51 ? 5 : 6,status:'passed',inputParamList:[
      {key:'subject', type:'text',isRequired:1},{key:'limit',type:versionId === 51 ? 'text' : 'select',defaultValue:'20'}]}}}};
  }}}};
  const page = new Settings({propsData:{value:legacy, formConfig:{tableList:[{component:{uuid:'field', label:'Service',handler:'formtext'}}]}}}).$mount();
  const saved = [];
  page.$on('input', data => saved.push(data));
  await tick();
  assert.doesNotMatch(page.$el.textContent,/disk|工单条件|noCondition/);
  assert.match(page.$el.textContent,/scan/);
  assert.doesNotMatch(page.$el.textContent,/versionnumber/);
  assert.equal(page.$refs.tool, undefined);
  page.$el.querySelector('a').click();
  await tick();
  assert.equal(page.$refs.tool.maps.inputs.subject.mappingMode,'processTaskParam');
  assert.equal(page.$refs.tool.maps.inputs.limit.value,'10');
  assert.equal(page.draft.condition,undefined);
  page.draft.type = 'skill';
  page.$children.find(c => c.$options.name === 'TsDialog').$emit('on-close');
  await tick();
  assert.equal(saved.length,0);
  assert.equal(legacy.condition.value,'disk');
  page.open(); await tick();
  const editor = page.$refs.tool;
  versionId = 52;
  await editor.load(1); await tick();
  assert.equal(editor.maps.inputs.subject.value,'title');
  assert.equal(editor.maps.inputs.limit.value,'20');
  page.draft.type = 'skill'; await tick();
  page.draft.type = 'tool'; await tick();
  assert.equal(page.$refs.tool,editor);
  page.confirm();
  assert.equal(saved.length,1);
  assert.equal(saved[0].tool.scriptId,1);
  assert.equal(saved[0].tool.operationId,undefined);
  assert.equal(saved[0].tool.version,undefined);
  assert.equal(saved[0].tool.mappings.inputs.subject.value,'title');
  assert.equal(saved[0].tool.fieldMappings,undefined);
  assert.deepEqual(Object.keys(saved[0].tool.mappings.execution),['runnerGroup']);
  await tick();
  page.open(); await tick();
  page.draft.type='skill'; Vue.set(page.draft,'skillKey','disk-check'); page.setSkill('disk-check',{text:'Disk Check'});
  await tick(); page.confirm();
  assert.deepEqual(saved[1],{type:'skill',skillKey:'disk-check',skillName:'Disk Check'});
  page.$destroy();
});
test('表格列删除或值类型变化后阻止确认', () => {
  const row = {mappingMode:'formTableComponent',value:'grid',column:'capacity'};
  const propsData = {row, kind:'argument',label:'Argument',required:true, fields:[{uuid:'grid',handler:'formtableinputer',config:{dataConfig:[{uuid:'capacity',handler:'formnumber'}]}}]};
  const view = new MappingRow({propsData}).$mount();
  assert.equal(view.valid(),true);
  view.fields = [{...view.fields[0], config:{dataConfig:[{uuid:'capacity',handler:'formupload'}]}}];
  assert.equal(view.valid(),false);
  view.fields = [];
  assert.equal(view.error,'invalidSource');
  view.$destroy();
});

// 规则编辑和校验直接使用条件节点，删除行后仍按 UUID 串联。
const Route = component('condition-node', {...ruleControls, FormTagSetting:group,
  TsForm: {template:group.template, methods:{valid:()=>true,getFormValue:()=>({type:'optional',targetStepList:['next']})}},
  TsDialog:{props:['isShow'],template:'<section v-if="isShow"><slot /></section>'}}, ruleDir);
// 创建真实条件节点实例，边界输入由各用例提供。
function routePage() {
  return new Route({parent:new Vue({provide:{flowObj:{processTaskId:7}}}), propsData:{formConfig:{uuid:'f'},
    nodeChildren:[{uuid:'next',name:'Next'}],nodeConfig:{stepConfig:{formTag:'infra'}}}});
}
test('条件节点内联维护组合关系，保留 AND/OR 并校验失效字段', () => {
  const page=routePage();
  page.formAttrList=metadata;
  page.addRule();
  const group=page.editRuleConfig.conditionGroupList[0];
  Object.assign(group.conditionList[0],{type:'common',name:'title',expression:'like',valueList:'disk'});
  page.addCondition(group,'custom'); page.addCondition(group,'custom');
  group.conditionRelList[0].joinType='or';
  group.conditionList[2].expression='return true;'; page.delCondition(group,1);
  assert.deepEqual(clone(group.conditionRelList),[{from:group.conditionList[0].uuid,to:group.conditionList[1].uuid,joinType:'or'}]);
  page.addGroup('custom'); page.addGroup('custom'); page.delGroup(1);
  page.editRuleConfig.conditionGroupList[1].conditionList[0].expression='return true;';
  assert.equal(page.editRuleConfig.conditionGroupRelList[0].to,page.editRuleConfig.conditionGroupList[1].uuid);
  assert.ok(page.validConditions());
  group.conditionList[0].name='removed'; assert.equal(page.validConditions(),false);
  page.$destroy();
});
test('条件节点直接加载工单字段，失败释放 loading，旧响应不能覆盖新标签', async () => {
  const pending=[];
  Vue.prototype.$api.process={process:{conditionList:params=>new Promise((resolve,reject)=>pending.push({params,resolve,reject}))}};
  const page=routePage(); page.formTag='infra';
  const first=page.getNewConditionList('f'); page.formTag='app'; const second=page.getNewConditionList('f');
  assert.deepEqual(pending[0].params,{formUuid:'f',tag:'infra',isAll:1,processTaskId:7});
  assert.equal(page.loadingFields,true);
  pending[1].resolve({Status:'OK',Return:metadata}); await second;
  pending[0].resolve({Status:'OK',Return:[]}); await first;
  assert.deepEqual(clone(page.formAttrList),metadata); assert.equal(page.loadingFields,false);
  const failed=page.getNewConditionList('f'); pending[2].reject(new Error('offline'));
  await assert.rejects(failed,/offline/); assert.equal(page.loadingFields,false);
  page.$destroy();
});
test('告警预分析保存时移除旧条件，仅保留选定动作', async () => {
  const value={type:'skill',skillKey:'disk',skillName:'Disk',condition:{field:'title',operator:'equals',value:'old'}};
  const page=new Settings({propsData:{value}}).$mount(); const saved=[];
  page.$on('input',v=>saved.push(v)); page.open(); await tick(); page.confirm();
  assert.deepEqual(saved[0],{type:'skill',skillKey:'disk',skillName:'Disk'});
  assert.deepEqual(value.condition,{field:'title',operator:'equals',value:'old'});
  page.$destroy();
});

test('逐目标执行移除旧并发策略，并按 execrtool 执行方式校验连接参数', async() => {
  const constant = value => ({mappingMode: 'constant', value});
  const execution = {
    runnerGroup: constant(-1),
    executeNodeConfig: {mappingMode:'formCommonComponent', value:'targets'},
    protocolId: constant(1),
    executeUser: constant('operator'),
    parallelCount: constant(3),
    roundCount: {mappingMode:'formCommonComponent', value:'deleted'}
  };
  Vue.prototype.$api.autoexec.script.getScriptDetail = async () => ({Return:{script:{id:1,name:'scan',execMode:'runner_target',
    versionVo:{id:51,version:5,status:'passed',inputParamList:[]}}}});
  const tool = new Tool({propsData:{value:{scriptId:1,operationId:51,parallelPolicy:'roundCount',mappings:{execution}},
    fields:[{uuid:'targets',handler:'formresoureces'}, {uuid:'batches',handler:'formnumber'}],taskFields:[]}}).$mount();
  await tick();
  assert.deepEqual(Object.keys(tool.save().mappings.execution), ['executeNodeConfig', 'protocolId', 'executeUser']);
  assert.equal(tool.save().parallelPolicy, undefined);
  tool.maps.execution.executeUser.value = '';
  await tick();
  assert.equal(tool.save(),null);
  tool.maps.execution.protocolId.value = null;
  await tick();
  assert.deepEqual(Object.keys(tool.save().mappings.execution), ['executeNodeConfig', 'protocolId']);
  tool.execMode = 'target'; await tick();
  assert.deepEqual(Object.keys(tool.save().mappings.execution), ['executeNodeConfig']);
  tool.execMode = 'runner'; await tick();
  assert.deepEqual(Object.keys(tool.save().mappings.execution), ['runnerGroup']);
  tool.execMode = 'sqlfile'; await tick();
  assert.equal(tool.save(),null);
  tool.$destroy();
});

// 使用表格插槽渲染真实值，检查输出结构、转义和折叠交互。
const table = {
  props: ['theadList', 'tbodyList'],
  template: '<table><thead><tr><th v-for="col in theadList">{{ col.title }}</th></tr></thead><tbody><tr v-for="row in tbodyList"><td>{{ row.field }}</td><td><slot name="value" :row="row"/></td></tr></tbody></table>'
};
// 通过组件公开的插槽和关闭事件检验菜单与弹框，Markdown 只检查只读预览契约。
const AnalysisResult = component('analysis-result', {
  TsTable: table, Spin: group,
  Poptip: {props: ['trigger'], data() { return {open: false}; },
    template: '<div @mouseenter="open = true" @mouseleave="open = false"><slot/><section v-if="open"><slot name="content"/></section></div>'},
  JsonViewer: {props: ['value', 'copyable', 'expandDepth'], template: '<code>{{ JSON.stringify(value) }}</code>'},
  Dropdown: {props: ['trigger', 'placement'], data() { return {open: false}; },
    template: '<div><span @click="open = !open"><slot/></span><div v-if="open"><slot name="list"/></div></div>'},
  DropdownMenu: group, DropdownItem: {template: '<button><slot/></button>'},
  TsDialog: {template: '<section role="dialog"><slot/><button class="close" @click="$emit(\'on-close\')"/></section>'},
  TsMarkdownEditor: {props: ['value', 'model', 'toolbar', 'readonly'], template: '<article>{{ value }}</article>'}
});
async function openDetails(view) {
  view.$el.querySelector('.tsfont-option-vertical').click();
  await tick();
  view.$el.querySelector('.action-group button').click();
  await tick();
  return view.$el.querySelector('[role=dialog]');
}
const toolOutput = targets => JSON.stringify({executor: 'execrtool', targets,
  succeeded: targets.filter(t => t.status === 'succeeded').length, failed: targets.filter(t => t.status === 'failed').length});

test('多目标保留执行顺序，成功值按字段显示，超时摘要与完整诊断分别可读', async() => {
  const error = 'failed! url:http://runner/exec, errorMsg:Read timed out';
  const run = {id: '8', status: 'partial', result: toolOutput([
    {target: 'A', ip: '192.0.2.1', status: 'succeeded', outputLabels: {count: '数量', enabled: 'Enabled'}, output: {count: 0, enabled: false, text: 'a\nb', nested: {list: [1]}}, auditId: '501'},
    {target: 'B', status: 'failed', error, auditId: '502'},
    {target: 'C', status: 'succeeded', output: false},
    {target: 'D', status: 'succeeded', output: {}}
  ])};
  const view = new AnalysisResult({propsData: {run}}).$mount();
  assert.deepEqual(Array.from(view.$el.querySelectorAll('h5'), e => e.textContent), ['A · 192.0.2.1', 'B', 'C', 'D']);
  const tables = view.$el.querySelectorAll('table');
  assert.equal(tables.length, 2);
  assert.deepEqual(Array.from(tables[0].querySelectorAll('th'), e => e.textContent), ['fieldName', 'value']);
  assert.deepEqual(Array.from(tables[0].querySelectorAll('pre'), e => e.textContent), ['0', 'false', 'a\nb']);
  const nested = tables[0].querySelector('.analysis-json-preview');
  assert.equal(nested.querySelector('span').textContent, '{"list":[1]}');
  nested.dispatchEvent(new window.Event('mouseenter'));
  await tick();
  assert.equal(nested.querySelector('code').textContent, '{"list":[1]}');
  assert.deepEqual(Array.from(tables[1].querySelectorAll('td'), e => e.textContent), ['result', 'false']);
  assert.equal(view.$el.querySelector('.text-error').textContent, 'Read timed out');
  assert.match(view.$el.textContent, /noOutput/);
  assert.deepEqual(Array.from(tables[0].querySelectorAll('tbody tr'), tr => tr.cells[0].textContent), ['数量(count)', 'enabled', 'text', 'nested']);
  assert.equal(view.$el.querySelector('[role=dialog]'), null);
  const details = await openDetails(view);
  assert.ok(details.textContent.includes(error));
  assert.ok(details.textContent.includes('502'));
  view.$destroy();
});

test('模型正文保持原文，历史作业与数组输出使用同一张结果表', async() => {
  const view = new AnalysisResult({propsData: {run: {status: 'succeeded', skillKey: 'memory', skillVersionId: 5, result: '模型结论\n第二行'}}}).$mount();
  assert.equal(view.$el.querySelector('article').textContent, '模型结论\n第二行');
  const preview = view.$children.find(child => child.$options._componentTag === 'TsMarkdownEditor');
  assert.equal(preview.model, 'previewOnly');
  assert.equal(preview.toolbar, false);
  assert.equal(view.$el.querySelector('table'), null);
  assert.match((await openDetails(view)).textContent, /memory.*5/s);
  view.$el.querySelector('.close').click();
  await tick();
  view.run = {jobId: 3, status: 'succeeded', result: JSON.stringify({nodes: [{host: 'linux', status: 'succeed', output: ['A', 'B']}]})};
  await tick();
  assert.equal(view.$el.querySelector('td .analysis-json-preview span').textContent, '["A","B"]');
  view.$destroy();
});

test('轮询从等待切换到结果，同次激活保留草稿和展开状态，重入收起明细', async t => {
  t.mock.timers.enable({apis: ['setTimeout']});
  const Panel = component('alert-panel', {AnalysisResult, TsFormInput: input, NoData: group, Divider: group, Loading: group});
  let activation = {id: '8', status: 'pending', revision: 0, summary: ''};
  const urls = [];
  const api = {post: async url => { urls.push(url); return {Return: clone(activation)}; }};
  const source = readFileSync(resolve(dir, 'alert-panel.vue'), 'utf8').split('<script>')[1].split('</script>')[0];
  const options = Function('axios', source.replace(/^import .*;$/gm, '').replace('export default', 'return'))(api);
  const page = new Panel({propsData: {taskId: 1, stepId: 2}, methods: {load: options.methods.load}});
  page.$mount();
  await tick();
  assert.match(page.$el.querySelector('[role=status]').textContent, /pending/);
  assert.ok(page.$el.querySelector('[role=status] [aria-hidden="true"]'));
  page.summary = '编辑中的结论';
  activation = {...activation, status: 'running', result: toolOutput([])};
  t.mock.timers.tick(3500);
  await tick();
  assert.match(page.$el.querySelector('[role=status]').textContent, /runningHint/);
  assert.ok(page.$el.querySelector('[role=status] [aria-hidden="true"]'));
  assert.equal(page.$el.querySelector('table'), null);
  assert.equal(page.$el.querySelector('.action-group a'), null);
  await openDetails(page);
  activation = {...activation, status: 'succeeded', labelsByAudit: {'60': {output: '输出'}}, result: toolOutput([{status: 'succeeded', auditId:'60', output: {output: 'ok'}}])};
  t.mock.timers.tick(3500);
  await tick();
  assert.equal(page.$el.querySelector('td pre').textContent, 'ok');
  assert.equal(page.$el.querySelector('[role=status]'), null);
  assert.equal(page.$el.querySelector('td').textContent, '输出(output)');
  assert.ok(page.$el.querySelector('[role=dialog]'));
  page.$el.querySelector('.close').click();
  await tick();
  assert.equal(page.$el.querySelector('[role=dialog]'), null);
  assert.equal(page.summary, '编辑中的结论');
  t.mock.timers.tick(7000);
  await tick();
  assert.deepEqual(urls, Array(3).fill('api/rest/processtask/alert/get'));
  page.$el.querySelector('.action-group button').click();
  await tick();
  assert.ok(page.$el.querySelector('[role=dialog]'));
  activation.id = '9';
  await page.load();
  await tick();
  assert.equal(page.$el.querySelector('[role=dialog]'), null);
  for (const status of ['partial', 'failed', 'skipped']) {
    // 每个终态都结束局部等待动画。
    page.run.status = 'pending';
    await tick();
    assert.ok(page.$el.querySelector('[role=status] [aria-hidden="true"]'));
    page.run.status = status;
    await tick();
    assert.equal(page.$el.querySelector('[role=status]'), null);
  }
  page.$destroy();
});

// 保留表格列插槽和商业扩展注册的调用方式，使用可控请求模拟延迟与错误返回。
const scriptFolder = resolve(dir, '../../../autoexec/pages/script');
const resultContent = component('execrtool-result', {
  JsonViewer: {props: ['value', 'copyable', 'expandDepth'], template: '<code>{{ JSON.stringify(value) }}</code>'}
}, scriptFolder);
const button = {template: '<button @click="$emit(\'click\', $event)"><slot/></button>'};
const resultDialog = component('execrtool-result-dialog', {
  ExecrtoolResult: resultContent, Spin: group, Button: button,
  TsDialog: {template: '<section role="dialog"><slot/><slot name="footer"/></section>'}
}, scriptFolder);
function makeLog(ConditionExpression) {
  const TsTable = {props: ['theadList','tbodyList'], template: '<table><tr v-for="row in tbodyList"><td v-for="col in theadList"><slot :name="col.key" :row="row"/></td></tr></table>'};
  return component('analysis-log', {ConditionExpression, TsTable, Button: button}, dir, {
    HOME: '/develop',
    ComponentManager: {getComponent(category, key) {
      assert.equal(category, 'autoexecExecution');
      assert.equal(key, 'resultDialog');
      return resultDialog;
    }}
  });
}

// 两个日志入口挂载同一条动作审计，保留目标版本、执行错误和人工记录。
test('时间线与步骤日志仅展示实际动作，历史跳过和人工记录仍可查看', async () => {
  const activityDir = resolve(dir, '../../../../views/pages/process/task/processdetail/workorder/activity/item');
  const ConditionExpression = component('condition-expression', {Tooltip: group, TsCodemirror: {props: ['value'], template: '<code>{{ value }}</code>'}}, activityDir);
  const AnalysisLog = makeLog(ConditionExpression);
  const Steps = component('analysis-step-log', {AnalysisLog, StepLogCommon: {props: ['item'], template: '<aside>{{ item.note }}</aside>'}});
  const run = {runId:'7', conditionStatus:'matched', type:'tool', configuredName:'configured', operation:{id:'8', name:'memory', version:2}, status:'partial',
    rule:{type:'optional',conditionGroupList:[{conditionList:[{uuid:'b',name:'host',expression:'=',valueList:'B',result:false},{uuid:'a',name:'host',expression:'=',valueList:'A',result:true}], conditionRelList:[{from:'a',to:'b',joinType:'or'}]}]},
    targets:[{target:'A',status:'succeeded',auditId:'101',operation:{name:'memory',version:2}},{target:'B',status:'failed',error:'Missing target'}], succeeded:1, failed:1};
  const page = new AnalysisLog({propsData:{config:{newContent: JSON.stringify(run)}}}).$mount();
  assert.equal(page.$el.open, false);
  assert.equal(page.$el.querySelector('summary strong').textContent, 'partial');
  page.$el.querySelector('summary').click();
  assert.equal(page.$el.open, true);
  assert.equal(page.$el.querySelectorAll('small').length,0);
  assert.doesNotMatch(page.$el.textContent,/conditionStatus|matched|unmatched/);
  assert.doesNotMatch(page.$el.textContent, /101/);
  assert.match(page.$el.querySelector('.analysis-operation a').href, /scriptId=8/);
  assert.match(page.$el.textContent, /Missing target/);
  assert.match(page.$el.textContent, /versions 2/);
  const errorRun = {runId:'8', status:'failed', conditionStatus:'error',type:'skill',configuredName:'Linux',error:'bad script',
    rule:{conditionGroupList:[{conditionList:[{type:'custom',expression:'throw 1;',error:'bad script'},{name:'owner'}]}]}};
  const steps = new Steps({propsData:{item:{note:'manual handoff',handlerStepInfo:{analysisRuns:[errorRun,run]}}}}).$mount();
  assert.equal(steps.$el.querySelectorAll('details').length, 2);
  const first = steps.$el.querySelector('details');
  assert.match(first.querySelector('summary').textContent,/failed/);
  assert.equal(first.querySelector('.analysis-operation a'), null);
  assert.equal(first.querySelector('code'),null);
  assert.match(first.textContent,/bad script/);
  const historical=new AnalysisLog({propsData:{entry:{runId:'old',status:'skipped',result:'工单未满足预分析条件。'}}}).$mount();
  assert.match(historical.$el.textContent,/analysisSkipped/); historical.$destroy();
  assert.equal(steps.$el.querySelector('aside').textContent,'manual handoff');
  page.$destroy(); steps.$destroy();
});

// 先关闭未完成的请求，再打开另一行；上次响应不得覆盖本次返回，重试只能读取所选目标。
test('结果按目标延迟加载，保留权限反馈、执行版本和完整 Runner 返回', async () => {
  const pending = [];
  const api = {autoexec: {script: {getExecrtoolAudit(id) {
    return new Promise((resolve, reject) => pending.push({id, resolve, reject}));
  }}}};
  const snapshot = {runId:'1', type:'tool', status:'partial', conditionStatus:'matched', rule:{type:'always'},
    operation:{id:'10',name:'memory',version:1,versionId:'100'},
    targets:[{target:'host',ip:'192.0.2.1',status:'succeeded',auditId:'A'},
      {target:'Runner',status:'failed',auditId:'B',operation:{id:'10',name:'memory v2',version:2,versionId:'200'}},
      {target:'missing',status:'failed',error:'Unknown host'}]};
  const page = new (makeLog(group))({propsData:{entry:snapshot}}).$mount();
  const previousApi = Vue.prototype.$api;
  Vue.prototype.$api = api;
  try {
    const buttons = page.$el.querySelectorAll('td button');
    assert.equal(buttons.length,2);
    assert.equal(pending.length,0);
    assert.match(page.$el.textContent,/192.0.2.1/);
    assert.match(page.$el.textContent,/Unknown host/);
    buttons[0].click(); buttons[0].click(); await tick();
    assert.deepEqual(pending.map(r => r.id), ['A']);
    page.$el.querySelector('[role=dialog] button').click(); await tick();
    buttons[1].click(); await tick();
    assert.match(page.$el.querySelector('[role=dialog] a').href,/versionId=200/);
    pending[1].reject({response:{status:523,data:{Message:'Access denied'}}}); await tick();
    assert.match(page.$el.querySelector('[role=alert]').textContent,/Access denied/);
    page.$el.querySelector('[role=alert] button').click(); await tick();
    const output = {Status:'OK',Return:{list:[false,0], host:'Runner'},TimeCost:2820};
    pending[2].resolve({Status:'OK',Return:{returnObj:output}}); await tick();
    pending[0].resolve({Status:'OK',Return:{returnObj:{stale:true}}}); await tick();
    assert.deepEqual(JSON.parse(page.$el.querySelector('code').textContent),output);
    assert.deepEqual(pending.map(r => r.id),['A','B','B']);
    page.entry = {...snapshot, runId:'2'}; await tick();
    assert.equal(page.$el.querySelector('[role=dialog]'),null);
  } finally {
    Vue.prototype.$api = previousApi;
    page.$destroy();
  }
});

test('共用结果组件保留标量与非 JSON 返回并区分空状态', () => {
  for (const value of [false, 0, [false,0]]) {
    const view = new resultContent({propsData:{audit:{returnObj:value, returnJson:'legacy'}}}).$mount();
    assert.equal(view.$el.querySelector('code').textContent,JSON.stringify(value));
    assert.notEqual(view.$children[0].$options.propsData.copyable,undefined);
    view.$destroy();
  }
  for (const raw of ['line one\nline two','']) {
    const view = new resultContent({propsData:{audit:{returnObj:null,returnJson:raw}}}).$mount();
    assert.ok(view.$el.textContent.includes(raw || 'nodata'));
    view.$destroy();
  }
});

// 使用真实 JSON 查看器和复制事件，只替换 JSDOM 缺少的系统剪贴板接口。
test('复制结果包含完整 Runner 返回和折叠的目标明细', async t => {
  for (const name of ['HTMLElement','Element','NodeList','HTMLCollection']) {
    Object.defineProperty(global, name, {configurable:true, value:window[name]});
    t.after(() => { delete global[name]; });
  }
  document.execCommand = command => command === 'copy';
  t.after(() => { delete document.execCommand; });
  const Result = component('execrtool-result', {JsonViewer:require('vue-json-viewer').default}, scriptFolder);
  const output = {Status:'OK',Return:{belowThreshold:false,swapInKiBPerSec:0,topRss:[{pid:123,rssMiB:4}]},TimeCost:2820};
  const view = new Result({propsData:{audit:{returnObj:output}}}).$mount();
  document.body.appendChild(view.$el);
  t.after(() => { view.$destroy(); view.$el.remove(); });
  await tick();
  let copied;
  view.$children[0].$on('copied', event => { copied = event.text; });
  view.$el.querySelector('.jv-button').click();
  assert.deepEqual(JSON.parse(copied),output);
});

test('根因附件变更参与保存修订，上传期间阻止提交，旧响应不覆盖新运行', async() => {
  let finish;
  const sent = [];
  const Panel = component('alert-panel', {Loading: group, AnalysisResult: group, TsFormInput: input, TsUpLoad: group}, dir, {
    axios: {post: async(url, data) => { sent.push(data); return new Promise(resolve => { finish = resolve; }); }}
  });
  const page = new Panel({propsData: {editable: true}});
  page.$Message = {success() {}};
  page.run = {id: 8, summary: '已有根因', revision: 1, files: [{id: 4, name: 'before.log'}]};
  page.summary = '已有根因';
  page.files = [{id: 4, name: 'before.log'}];
  assert.equal(page.dirty, false);
  page.updateFiles([{id: 5, name: 'after.log'}]);
  assert.equal(page.dirty, true);
  page.uploading = true;
  await page.save();
  assert.equal(sent.length, 0);
  page.uploading = false;
  const saving = page.save();
  assert.deepEqual(sent[0].fileIdList, [5]);
  await page.save();
  assert.equal(sent.length, 1);
  page.run = {id: 9, revision: 0};
  finish({Return: {revision: 2, summary: '已有根因', files: [{id: 5}]}});
  await saving;
  assert.equal(page.run.id, 9);
  assert.equal(page.run.revision, 0);
  assert.equal(page.saving, false);
});

test('根因草稿可连续追问和引用，保存及上传期间暂时禁用入口', async() => {
  const button = {props: ['disabled'], template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>'};
  const followUp = {props: ['run'], template: '<div class="follow-up-stub"></div>'};
  let saved = {id: 8, status: 'succeeded', revision: 0, summary: '', files: [], replies: []};
  const Panel = component('alert-panel', {Button: button, FollowUp: followUp, Loading: group,
    AnalysisResult: group, TsFormInput: input, TsUpLoad: group, Divider: group}, dir, {
    axios: {post: async() => ({Return: clone(saved)})}
  });
  const page = new Panel({propsData: {editable: true, taskId: 1, stepId: 2}});
  page.$AuthUtils = {hasRole: () => false};
  page.$mount();
  await tick();
  const ask = () => [...page.$el.querySelectorAll('button')].find(item => item.textContent === 'ask');
  page.summary = '首次填写的草稿';
  await tick();
  assert.equal(page.dirty, true);
  assert.equal(ask().disabled, false);
  ask().click();
  await tick();
  assert.ok(page.$el.querySelector('.follow-up-stub'));
  page.chat = false;
  saved = {...saved, id: 9, revision: 1, summary: '已保存的根因'};
  await page.load();
  page.editing = true;
  page.summary = '人工补充的草稿';
  page.files = [{id: 51, name: 'new.log'}];
  await tick();
  assert.equal(ask().disabled, false);
  for (const answer of ['模型补充一', '模型补充二']) {
    ask().click();
    await tick();
    const dialog = page.$children.find(child => child.$options._componentTag === 'FollowUp');
    assert.equal(dialog.run.summary, '已保存的根因');
    assert.deepEqual(clone(dialog.run.files), []);
    dialog.$emit('quote', answer);
    await tick();
    assert.equal(page.chat, false);
    assert.equal(ask().disabled, false);
  }
  assert.equal(page.summary, '人工补充的草稿\n\n模型补充一\n\n模型补充二');
  for (const state of ['saving', 'uploading']) {
    page[state] = true;
    await tick();
    assert.equal(ask().disabled, true);
    ask().click();
    assert.equal(page.chat, false);
    page[state] = false;
    await tick();
    assert.equal(ask().disabled, false);
  }
  page.$destroy();
});



test('共享聊天纯文本模式隐藏扩展工具，消息操作插槽保留默认正文', async() => {
  const aiDir = resolve(__dirname, '../../src/commercial-module/ai/pages');
  const button = {props: ['disabled'], template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>'};
  const Composer = component('ai-chat-composer', {TsFormInput: input, Button: button, TsUpLoad: group,
    AiChatAddMenu: group, TsFormSwitch: group, Poptip: group}, resolve(aiDir, 'topnav/aichat'));
  const composer = new Composer({propsData: {textOnly: true, canSend: true}});
  composer.$store = Vue.observable({getters: {userAuthList: []}});
  composer.$mount();
  assert.equal(composer.$el.querySelector('.ai-chat-debug-toggle'), null);
  composer.$store.getters.userAuthList.push('AI_AGENT_MODIFY');
  await tick();
  assert.ok(composer.$el.querySelector('.ai-chat-debug-toggle'));
  assert.equal(composer.$el.querySelector('.chat-action-bar__left'), null);
  assert.equal(composer.$el.querySelector('.tsfont-microphone'), null);
  assert.equal(composer.$el.querySelector('.tsfont-attachment'), null);
  let sent = 0;
  composer.$on('send', () => sent++);
  composer.$el.querySelector('button').click();
  assert.equal(sent, 1);
  composer.textOnly = false;
  await tick();
  assert.ok(composer.$el.querySelector('.chat-action-bar__left'));
  assert.ok(composer.$el.querySelector('.tsfont-microphone'));
  composer.$destroy();
  const assistant = {props: ['message'], template: '<p>{{message.rawReasoning}}</p>'};
  const Conversation = component('ai-chat-conversation', {AiAssistantDebugWorkspace: group, AiChatComposer: group,
    AiChatMessageLocator: group, AiChatScrollToBottom: group}, resolve(aiDir, 'common'), {messageViewComponents: {assistant}});
  const parent = new Vue({render(h) { return h(Conversation, {props: {messageList: [{type: 'assistant', rawReasoning: '默认正文'}]},
    scopedSlots: {'message-actions': ({message}) => h('button', message.rawReasoning + '引用')}}); }}).$mount();
  assert.equal(parent.$el.querySelector('p').textContent, '默认正文');
  assert.equal(parent.$el.querySelector('button').textContent, '默认正文引用');
  parent.$destroy();
});







// 模型通信归全局聊天，业务弹框只刷新来源和引用已保存的回答。
test('工单追问挂载全局聊天核心并按当前运行刷新来源', async() => {
  const calls = [];
  const reply = {id: 31, question: '检查附件', answer: '发现异常'};
  const Core = {props: ['presetSession', 'beforeSend', 'assistantResultAdapter'], data:()=>({activeRunStatus:'succeeded',finalMessageList:[]}), template: '<div />'};
  const FollowUp = component('follow-up', {Loading: group,TsDialog:group}, dir, {
    ComponentManager: {getComponent: () => ({chatCore: Core})},
    axios: {post: async(url, data) => {
      calls.push({url, data});
      return {Return: url.endsWith('/reply') ? reply : {id: 17, name: 'run', agentName: 'ITSM_ALERT_ANALYSIS', replies: []}};
    }}
  });
  const run = {id: 8, replies: []};
  const page = new FollowUp({propsData: {run}}).$mount();
  page.$on('reply', value => run.replies.push(value));
  await tick();
  assert.equal(page.session.id, 17);
  assert.equal(await page.prepare(), true);
  assert.deepEqual(calls[1].data, {runId: 8, sessionId: 17});
  assert.deepEqual(page.adapt('原始正文'), {content: '原始正文', data: '原始正文'});
  const message={type:'assistant',reasoning:reply.answer};
  page.$refs.chat.finalMessageList.push(message);
  await page.completed({source: 'stream',message});
  await page.completed({source: 'stream',message});
  assert.equal(run.replies.length, 1);
  page.mark(message, reply.answer);
  assert.equal(page.text, reply.answer);
  page.$destroy();
});

test('工单来源校验失败时由全局发送前钩子中止，初始化失败释放等待状态', async() => {
  const FollowUp = component('follow-up', {Loading: group}, dir, {
    ComponentManager: {getComponent: () => ({chatCore: group})},
    axios: {post: async() => { throw new Error('permission denied'); }}
  });
  const page = new FollowUp({propsData: {run: {id: 8, replies: []}}});
  await assert.rejects(page.initialize(), /permission denied/);
  assert.equal(page.loading, false);
  page.session = {id: 17};
  await assert.rejects(page.prepare(), /permission denied/);
  page.$destroy();
});
