import Vue from 'vue';
//每一个组件对应，可以编辑的工具栏按钮
export let BTNLIST = {
  p: ['h1', 'h2', 'b', 'i', 'u', 'innerA', 'outerA', 'ul', 'ol', 'file', 'search', 'tag', 'repeal', 'recover'],
  ul: ['ol', 'ul', 'b', 'i', 'u', 'innerA', 'outerA', 'file', 'search', 'tag', 'repeal', 'recover'],
  ol: ['ul', 'ol', 'b', 'i', 'u', 'innerA', 'outerA', 'file', 'search', 'tag', 'repeal', 'recover'],
  h1: ['h1', 'h2', 'file', 'search', 'tag', 'repeal', 'recover'],
  h2: ['h1', 'h2', 'file', 'search', 'tag', 'repeal', 'recover'],
  img: ['file', 'search', 'tag', 'repeal', 'recover'],
  table: ['file', 'search', 'tag', 'repeal', 'recover'],
  code: ['file', 'search', 'tag', 'repeal', 'recover'],
  collapsedList: ['b', 'i', 'u', 'innerA', 'outerA']//如果range 没有选中文案，着几个按钮不能被选中
};
export let TAGLIST = ['p', 'h1', 'h2', 'ul', 'ol', 'section'];

//每个组件对应的不可以点击和激活的状态
export let BTNCONFIG = {
  'h1': {disabled: ['b', 'i', 'u', 'innerA', 'outerA'], active: ['h1']},
  'h2': {disabled: ['b', 'i', 'u', 'innerA', 'outerA'], active: ['h2']},
  'p': {disabled: [], active: ['p']},
  'ul': {disabled: ['h1', 'h2'], active: ['ul']},
  'ol': {disabled: ['h1', 'h2'], active: ['ol']},
  'img': {disabled: ['h1', 'h2', 'b', 'i', 'u', 'innerA', 'outerA'], active: []},
  'table': {disabled: ['h1', 'h2', 'b', 'i', 'u', 'innerA', 'outerA'], active: []},
  'code': {disabled: ['h1', 'h2', 'b', 'i', 'u', 'innerA', 'outerA'], active: []}
};
//标题对应的标签
export let TITLELIST = ['h1', 'h2'];

//工具栏对应的数据  repeal  recover  b i u  h1  h2  ol  ul  tag file  add  search innerA  outerA
export let TOOLLIST = [{
  id: 'repeal',
  name: '',
  title: Vue.prototype.i18n.t('page.revocation'),
  className: '',
  type: 'icon',
  icon: 'tsfont-undo',
  disabled: false,
  isActive: false
},
{
  id: 'recover',
  name: '',
  title: Vue.prototype.i18n.t('page.recover'),
  className: '',
  type: 'icon',
  icon: 'tsfont-revover',
  disabled: false,
  isActive: false
},
{
  title: '',
  type: 'line'
},
{
  id: 'h1',
  name: 'h1',
  title: Vue.prototype.i18n.t('page.primarydirectory'),
  className: '',
  type: 'title',
  icon: '',
  disabled: false,
  isActive: false
},   
{
  id: 'h2',
  name: 'h2',
  title: Vue.prototype.i18n.t('page.secondarydirectory'),
  className: '',
  type: 'title',
  icon: '',
  disabled: false,
  isActive: false
},
{
  title: '',
  type: 'line'
}, {
  id: 'b',
  name: 'b',
  title: Vue.prototype.i18n.t('page.bold'),
  className: '',
  type: 'icon',
  icon: 'tsfont-bold',
  disabled: false,
  isActive: false
},  
{
  id: 'i',
  name: 'i',
  title: Vue.prototype.i18n.t('page.italic'),
  className: '',
  type: 'icon',
  icon: 'tsfont-italic',
  disabled: false,
  isActive: false
},
{
  id: 'u',
  name: 'span',
  title: Vue.prototype.i18n.t('page.strikeout'),
  className: 'line-through',
  type: 'icon',
  icon: 'tsfont-text-delete',
  disabled: false,
  isActive: false
},
{
  title: '',
  type: 'line'
},
{
  id: 'ol',
  name: 'ol',
  title: Vue.prototype.i18n.t('page.orderedlist'),
  className: '',
  type: 'icon',
  icon: 'tsfont-orderlist',
  disabled: false,
  isActive: false,
  children: [{
    type: 'cjk-ideographic',
    title: Vue.prototype.i18n.t('page.zh')
  }, {
    type: 'decimal',
    title: Vue.prototype.i18n.t('page.figure')
  }]
},
{
  id: 'ul',
  name: 'ul',
  title: Vue.prototype.i18n.t('page.unorderedlist'),
  className: '',
  type: 'icon',
  icon: 'tsfont-list',
  disabled: false,
  isActive: false,
  children: [{
    type: 'circle',
    title: Vue.prototype.i18n.t('page.circle')
  }, {
    type: 'disc',
    title: Vue.prototype.i18n.t('page.disc')
  }, {
    type: 'square',
    title: Vue.prototype.i18n.t('page.square')
  }]
},
{
  title: '',
  type: 'line'
},
{
  id: 'innerA',
  name: 'a',
  title: Vue.prototype.i18n.t('page.innerjoin'),
  className: 'innera',
  type: 'icon',
  icon: 'tsfont-inlink',
  disabled: false,
  isActive: false
},
{
  id: 'outerA',
  name: 'a',
  title: Vue.prototype.i18n.t('page.outerjoin'),
  className: 'outera',
  type: 'icon',
  icon: 'tsfont-bind',
  disabled: false,
  isActive: false
},
{
  title: '',
  type: 'line'
},
{
  id: 'tag',
  name: '',
  title: Vue.prototype.i18n.t('page.addtarget', { target: Vue.prototype.i18n.t('page.tag') }),
  className: '',
  type: 'icon',
  icon: 'tsfont-addtag',
  disabled: false,
  isActive: false
},
{
  id: 'file',
  name: '',
  title: Vue.prototype.i18n.t('page.uploadattachment'),
  className: '',
  type: 'icon',
  icon: 'tsfont-batch-upload',
  disabled: false,
  isActive: false
},
{
  title: '',
  type: 'line'
},
{
  id: 'add',
  name: '',
  title: Vue.prototype.i18n.t('page.addtarget', { target: Vue.prototype.i18n.t('page.component') }),
  className: '',
  type: 'slot',
  icon: 'tsfont-plus',
  disabled: false,
  isActive: false,
  children: [ 
    {
      type: 'ul',
      title: Vue.prototype.i18n.t('page.addtarget', { target: Vue.prototype.i18n.t('page.orderedlist') })
    }, {
      type: 'ol',
      title: Vue.prototype.i18n.t('page.addtarget', { target: Vue.prototype.i18n.t('page.unorderedlist') })
    }, {
      type: 'img',
      title: Vue.prototype.i18n.t('page.addtarget', { target: Vue.prototype.i18n.t('page.image') })
    }, {
      type: 'table',
      title: Vue.prototype.i18n.t('page.addtarget', { target: Vue.prototype.i18n.t('page.table') })
    }]
},
{
  id: 'search',
  className: '',
  name: '',
  title: Vue.prototype.i18n.t('page.searchreplace'),
  type: 'icon',
  icon: 'tsfont-search',
  disabled: false,
  isActive: false,
  isShow: false
}
];

export default {
  
};
