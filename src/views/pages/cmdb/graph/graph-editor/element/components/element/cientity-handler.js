import template from '../shape/circle.vue';
export default {
  name: '普通节点',
  handler: 'cientity',
  isVue: true, //需要声明是vue组件
  config: {
    component: template,
    size: { width: 120, height: 60 }
  },
  event: {},
  setting: {
    resizable: true,
    deleteable: true,
    draggable: true,
    selectable: true,
    linkin: true,
    linkout: true
  },
  validateEdge({ edge, editor, sourceCell, targetCell }) {
    return true;
  },
  //流程保存时校验数据
  valid({ node, graph, view }) {
  }
};
