/* 独立运行：node scripts/test-cmdb-relation-filter.cjs；使用真实 Vue 组件和网络替身，不修改业务数据。 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Vue = require('vue');
const sfc = require('vue/compiler-sfc');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');
const base = path.join(root, 'src/views/pages/cmdb');
const cache = new Map();
const clone = value => JSON.parse(JSON.stringify(value));
global.COMMERCIAL_MODULES = ['cmdb'];
Vue.config.productionTip = false;
Vue.config.devtools = false;

// 加载生产脚本和编译后的模板；公共控件及下载指令作为测试边界。
function load(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  let source = fs.readFileSync(filename, 'utf8');
  let template;
  if (filename.endsWith('.vue')) {
    const parsed = sfc.parse({source, filename});
    const result = sfc.compileTemplate({source: parsed.template.content, filename});
    assert.deepStrictEqual(result.errors, [], filename);
    template = new Function(result.code + '\nreturn {render, staticRenderFns};')();
    source = parsed.script.content;
  }
  const code = babel.transformSync(source, {filename, configFile:false, babelrc:false, plugins:['@babel/plugin-transform-modules-commonjs']}).code;
  const module = {exports:{}};
  cache.set(filename, module);
  const localRequire = name => {
    if (name.startsWith('@/resources/')) return {};
    if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
    let file = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(filename), name);
    if (!fs.existsSync(file)) file += '.js';
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.js');
    return load(file);
  };
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
  if (template) Object.assign(module.exports.default, template);
  return module.exports;
}
const component = name => load(path.join(base, name + '.vue')).default;
const flush = async () => { for (let i=0; i<12; i++) { await Promise.resolve(); await Vue.nextTick(); } };
function create(options, props = {}, api = {}, histories = []) {
  return new Vue({...options, propsData:props, beforeCreate() {
    this.$t = key => key;
    this.$utils = {deepClone:clone, isEmpty:value => value == null || Object.keys(value).length === 0};
    this.$api = {cmdb:api};
    this.$addHistoryData = (...args) => histories.push(args);
    this.$Message = {error() {}, info() {}, warning() {}};
  }});
}

// 实际入口的计算属性必须以候选端为准，同一自关联的两个方向也不能混淆。
function checkEntrypoints() {
  for (const name of ['cientity/cientity-edit-core','cientity/cientity-edit-batch']) {
    const options = component(name);
    const fromFilter={filterCiEntityId:'101'};
    const toFilter={filterCiEntityId:'202'};
    const rel={id:1, fromCiId:10, toCiId:10, fromFilter, toFilter};
    assert.strictEqual(options.computed.currentRelFilter.call({currentRel:{...rel,direction:'from'}}), toFilter);
    assert.strictEqual(options.computed.currentRelFilter.call({currentRel:{...rel,direction:'to'}}), fromFilter);
    assert.strictEqual(options.computed.currentRelFilter.call({currentRel:null}),null);
    assert.strictEqual(options.computed.currentRelFilter.call({currentRel:{direction:'from'}}),null);
  }
  const choose=component('cientity/cientity-choose');
  assert.strictEqual(choose.props.conditionReadonly.default,false);
  const ordinary=create(choose,{ciId:10});
  assert.strictEqual(ordinary.condition,null);
  assert.strictEqual(ordinary.conditionReadonly,false);
  ordinary.$destroy();
}


function deferred() {
  let resolve;
  const promise = new Promise(done => {resolve=done;});
  return {promise,resolve};
}
const expressions = ['equal','between','like','notlike','is-null','is-not-null'].map(value=>({value}));
function metadata() {
  return {
    attrs:[{id:1,type:'number',canSearch:true,isSearchAble:1,expressionList:expressions},{id:2,type:'text',canSearch:true,isSearchAble:1,expressionList:expressions},{id:5,type:'datetimerange',canSearch:true,isSearchAble:1,expressionList:expressions}],
    globals:[{id:3,name:'environment'}],
    rels:[{id:4,direction:'from',expressionList:expressions},{id:4,direction:'to',expressionList:expressions}],
    children:[{id:10},{id:11}],groups:[{id:12}]
  };
}
function fixture(options={}) {
  const meta=metadata();
  const queries=[];
  const histories=[];
  const result = value=>Promise.resolve({Return:clone(value)});
  const api={ci:{
    getAttrByCiId:()=>options.gate ? options.gate.promise.then(()=>({Return:meta.attrs})) : result(meta.attrs),
    getGlobalAttrByCiId:()=>options.fail ? Promise.reject(new Error('metadata unavailable')) : result(meta.globals),
    getRelByCiId:()=>result(meta.rels),
    getDownwardCiList:()=>result(meta.children),
    searchCiAttrRel:()=>result([])
  },group:{getCurrentUserActiveGroupByCiId:()=>result(meta.groups)},cientity:{searchCiEntity:params=>{
    queries.push(clone(params));
    return result({tbodyList:[],theadList:[],currentPage:params.currentPage || 1,pageSize:params.pageSize || 10});
  }}};
  return {api,meta,queries,histories};
}
function fixedFilter() {
  return {groupId:12,filterCiEntityId:'12345',filterCiId:11,
    attrFilterList:[{attrId:1,expression:'between',valueList:['0~']},{attrId:5,expression:'equal',valueList:[['2026-09-01','2026-09-16']]}],
    globalAttrFilterList:[{attrId:3,expression:'is-not-null'}],
    relFilterList:[{relId:4,direction:'from',expression:'like',valueList:[21]}]};
}
async function checkList() {
  const options=component('cientity/cientity-list');
  const gate=deferred(); const f=fixture({gate}); const condition=fixedFilter(); const original=clone(condition);
  const vm=create(options,{ciId:10,condition,conditionReadonly:true,mode:'dialog'},f.api,f.histories);
  await flush();
  assert.strictEqual(f.queries.length,0,'元数据完成前不允许发出未过滤的首次请求');
  assert.strictEqual(vm.exportUrl(),null,'未就绪不能导出');
  await vm.searchCiEntity(); assert.strictEqual(f.queries.length,0);
  gate.resolve(); await flush();
  assert.strictEqual(f.queries.length,1,'首次请求只执行一次且携带固定条件');
  for (const key of Object.keys(condition)) assert.deepStrictEqual(f.queries[0][key],condition[key]);
  assert.strictEqual(f.queries[0].globalAttrStrictMode,true);
  assert.strictEqual(vm.isAdvancedSearch,true);
  assert.strictEqual(vm.globalAttrConditionHideData[3],true,'空值操作符隐藏值控件');
  assert(vm.isLocked('attrFilterList',1)); assert(!vm.isLocked('attrFilterList',2));
  assert(vm.isLocked('relFilterList',4,'from')); assert(!vm.isLocked('relFilterList',4,'to'));
  vm.setAttrData(f.meta.attrs[0],'value',['999~']);
  vm.setGlobalAttrData(f.meta.globals[0],'expression','like');
  vm.setRelData(f.meta.rels[0],'value',[999]);
  assert.deepStrictEqual(vm.attrFilterList.attr_1.valueList,['0~']);
  assert.strictEqual(vm.globalAttrFilterList.attr_3.expression,'is-not-null');
  assert.deepStrictEqual(vm.relFilterList.from4.valueList,[21]);
  vm.setAttrData(f.meta.attrs[1],'expression','equal'); vm.setAttrData(f.meta.attrs[1],'value',['extra']);
  vm.setRelData(f.meta.rels[1],'expression','like'); vm.setRelData(f.meta.rels[1],'value',[22]);
  await vm.searchCiEntity(2);
  const request=f.queries[f.queries.length-1];
  assert.strictEqual(request.currentPage,2);
  assert.strictEqual(request.attrFilterList.find(x=>x.attrId===2).valueList[0],'extra');
  assert.strictEqual(request.relFilterList.length,2,'自关联另一方向可独立追加筛选');
  vm.isAdvancedSearch=false; await flush();
  vm.searchParam.keyword='needle'; await vm.searchCiEntity();
  vm.isAdvancedSearch=true; await flush();
  assert.deepStrictEqual(vm.attrFilterList.attr_1.valueList,['0~']);
  assert.strictEqual(vm.searchParam.groupId,12);
  vm.restoreHistory({searchParam:{dsl:'unrelated',groupId:999},attrFilterList:{}});
  assert.strictEqual(vm.searchParam.groupId,12);
  assert.strictEqual(f.histories.length,0,'固定条件弹窗不污染普通搜索历史');
  vm.advencedSearchMode='dsl'; await flush(); assert.strictEqual(vm.advencedSearchMode,'condition');
  // 即使其他页面逻辑误写同字段，请求构造仍以固定条件为准。
  vm.attrFilterList.attr_1.valueList=['tampered']; vm.searchParam.groupId=999;
  vm.sortConfig={name:'DESC'}; await vm.searchCiEntity(3);
  const finalRequest=f.queries[f.queries.length-1];
  assert.deepStrictEqual(finalRequest.attrFilterList.find(x=>x.attrId===1).valueList,['0~']);
  assert.strictEqual(finalRequest.groupId,12); assert.deepStrictEqual(finalRequest.sortConfig,{name:'DESC'});
  const exported=vm.exportUrl().params;
  assert.deepStrictEqual(exported.attrFilterList,finalRequest.attrFilterList);
  assert.deepStrictEqual(exported.relFilterList,finalRequest.relFilterList);
  assert.strictEqual(exported.groupId,12); assert.strictEqual(exported.globalAttrStrictMode,true);
  assert.deepStrictEqual(condition,original,'原关系配置不能被搜索草稿修改');
  vm.$destroy();
  for (const value of [
    {attrFilterList:[{attrId:999,expression:'equal',valueList:['x']}]},
    {attrFilterList:[{attrId:1,expression:'unsupported',valueList:['x']}]},
    {globalAttrFilterList:[{attrId:999,expression:'is-null'}]},
    {relFilterList:[{relId:4,direction:'unknown',expression:'is-null'}]},
    {groupId:999},{filterCiId:999}
  ]) {
    const invalid=fixture(); const instance=create(options,{ciId:10,condition:value,conditionReadonly:true},invalid.api);
    await flush(); assert.strictEqual(invalid.queries.length,0,'失效条件不能无条件检索');
    assert(instance.lockedConditionError); assert.strictEqual(instance.exportUrl(),null);
    instance.$destroy();
  }
  const failed=fixture({fail:true}); const instance=create(options,{ciId:10,condition:original,conditionReadonly:true},failed.api);
  await flush(); assert.strictEqual(failed.queries.length,0); assert(instance.lockedConditionError); instance.$destroy();
  const normal=fixture(); const ordinary=create(options,{ciId:10},normal.api,normal.histories);
  await flush(); assert.strictEqual(normal.queries.length,1); assert(!ordinary.conditionReadonly); assert(!ordinary.isAdvancedSearch);
  ordinary.setAttrData(normal.meta.attrs[0],'expression','between'); ordinary.setAttrData(normal.meta.attrs[0],'value',['1~2']);
  await ordinary.searchCiEntity(); assert(normal.histories.length>0); assert(!ordinary.isLocked('attrFilterList',1));
  ordinary.isAdvancedSearch=true; await flush(); ordinary.isAdvancedSearch=false; await flush();
  assert.strictEqual(ordinary.searchParam.attrFilterList.length,0,'普通模式维持收起后清空行为');
  ordinary.$destroy();
  const reopened=fixture(); const again=create(options,{ciId:10,condition:original,conditionReadonly:true},reopened.api);
  await flush(); assert.strictEqual(reopened.queries[0].attrFilterList.length,2,'重新打开不带入临时条件'); again.$destroy();
}

// 验证真实搜索组件的事件边界：锁定时不回传，默认模式继续保持原有取值结构。
function checkInputLocks() {
  const attrData={id:1,targetCiId:10,config:{type:'daterange',format:'yyyy-MM-dd',members:['x','y']}};
  const names=['text','textarea','number','date','datetime','time','datetimerange','enum','set','expression','select','table'];
  for(const name of names) {
    const options=component('ci/attrhandler/search/'+name+'-attr');
    assert.strictEqual(options.props.disabled.default,false,name+'默认可编辑');
    const vm=create(options,{attrData,disabled:true,valueList:[]});
    const emitted=[]; vm.$on('setData',(...args)=>emitted.push(args)); vm.$on('setValue',(...args)=>emitted.push(args));
    if(vm.setData) vm.setData('blocked');
    if(vm.setDataBefore) vm.setDataBefore(1);
    if(vm.setDataAfter) vm.setDataAfter(2);
    if(vm.searchConfig && vm.searchConfig.onChange) vm.searchConfig.onChange([1],[{text:'blocked'}]);
    assert.strictEqual(emitted.length,0,name+'禁用时不回传');
    vm.$destroy();
  }
  const wrapper=create(component('cientity/attr-searcher'),{attrData:{...attrData,type:'text'},disabled:true});
  let events=0; wrapper.$on('setData',()=>events++); wrapper.$on('select',()=>events++);
  wrapper.setData(['blocked']); wrapper.selectNewCiEntity({id:1}); assert.strictEqual(events,0);
  wrapper.disabled=false; wrapper.setData(['allowed']); wrapper.selectNewCiEntity({id:1}); assert.strictEqual(events,2);
  wrapper.$destroy();
  const text=create(component('ci/attrhandler/search/text-attr'),{attrData});
  let value; text.$on('setData',v=>value=v); text.setData('editable'); assert.deepStrictEqual(value,['editable']); text.$destroy();
}

async function main() {
  checkEntrypoints();
  console.log('PASS 单项、批量、自关联方向及无过滤入口默认值');
  await checkList();
  console.log('PASS 首次请求、条件回填与合并、追加查询、历史隔离、收起展开、翻页排序、导出和失效阻断');
  checkInputLocks();
  console.log('PASS 搜索控件禁用事件及默认可编辑行为');
}
main().catch(error => {console.error(error);process.exitCode=1;});
