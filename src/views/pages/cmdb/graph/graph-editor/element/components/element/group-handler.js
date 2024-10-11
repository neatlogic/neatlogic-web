import template from '../shape/group.vue';
export default {
  name: '分组节点',
  handler: 'group',
  isVue: true, //需要声明是vue组件
  config: {
    component: template,
    size: { width: 150, height: 60 }
  },
  event: {},
  setting: {
    resizable: true,
    deleteable: true,
    draggable: true,
    selectable: true,
    linkin: true,
    linkout: true,
    children: ['*']
  },
  validateEdge({ edge, editor, sourceCell, targetCell }) {
    return true;
  },
  //流程保存时校验数据
  valid({ node, graph, view }) {
  }
};
