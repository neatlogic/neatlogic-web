import {$t} from '@/resources/init.js';
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
  title: $t('page.revocation'),
  className: '',
  type: 'icon',
  icon: 'tsfont-undo',
  disabled: false,
  isActive: false
},
{
  id: 'recover',
  name: '',
  title: $t('page.recover'),
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
  title: $t('page.primarydirectory'),
  className: '',
  type: 'title',
  icon: '',
  disabled: false,
  isActive: false
},   
{
  id: 'h2',
  name: 'h2',
  title: $t('page.secondarydirectory'),
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
  title: $t('page.bold'),
  className: '',
  type: 'icon',
  icon: 'tsfont-bold',
  disabled: false,
  isActive: false
},  
{
  id: 'i',
  name: 'i',
  title: $t('page.italic'),
  className: '',
  type: 'icon',
  icon: 'tsfont-italic',
  disabled: false,
  isActive: false
},
{
  id: 'u',
  name: 'span',
  title: $t('page.strikeout'),
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
  title: $t('page.orderedlist'),
  className: '',
  type: 'icon',
  icon: 'tsfont-orderlist',
  disabled: false,
  isActive: false,
  children: [{
    type: 'cjk-ideographic',
    title: $t('page.zh')
  }, {
    type: 'decimal',
    title: $t('page.number')
  }]
},
{
  id: 'ul',
  name: 'ul',
  title: $t('page.unorderedlist'),
  className: '',
  type: 'icon',
  icon: 'tsfont-list',
  disabled: false,
  isActive: false,
  children: [{
    type: 'circle',
    title: $t('page.circle')
  }, {
    type: 'disc',
    title: $t('page.disc')
  }, {
    type: 'square',
    title: $t('page.square')
  }]
},
{
  title: '',
  type: 'line'
},
{
  id: 'innerA',
  name: 'a',
  title: $t('page.innerjoin'),
  className: 'innera',
  type: 'icon',
  icon: 'tsfont-inlink',
  disabled: false,
  isActive: false
},
{
  id: 'outerA',
  name: 'a',
  title: $t('page.outerjoin'),
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
  title: $t('dialog.title.addtarget', { target: $t('page.tag') }),
  className: '',
  type: 'icon',
  icon: 'tsfont-addtag',
  disabled: false,
  isActive: false
},
{
  id: 'file',
  name: '',
  title: $t('page.uploadattachment'),
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
  title: $t('dialog.title.addtarget', { target: $t('page.component') }),
  className: '',
  type: 'slot',
  icon: 'tsfont-plus',
  disabled: false,
  isActive: false,
  children: [ 
    {
      type: 'ul',
      title: $t('dialog.title.addtarget', { target: $t('page.orderedlist') })
    }, {
      type: 'ol',
      title: $t('dialog.title.addtarget', { target: $t('page.unorderedlist') })
    }, {
      type: 'img',
      title: $t('dialog.title.addtarget', { target: $t('page.image') })
    }, {
      type: 'table',
      title: $t('dialog.title.addtarget', { target: $t('page.table') })
    }]
},
{
  id: 'search',
  className: '',
  name: '',
  title: $t('page.searchreplace'),
  type: 'icon',
  icon: 'tsfont-search',
  disabled: false,
  isActive: false,
  isShow: false
}
];

export default {
  
};
