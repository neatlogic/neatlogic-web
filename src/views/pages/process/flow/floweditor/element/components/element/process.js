import template from '../shape/rect.vue';
import ports from './base/port-config.js';
export default {
  name: '普通节点',
  type: 'process',
  isVue: true, //需要声明是vue组件
  config: {
    component: template,
    ports: ports
  },
  prop: {
    width: 68,
    height: 40
  },
  event: {},
  setting: {
    resizable: false,
    deleteable: true,
    draggable: true,
    selectable: true,
    linkin: true,
    linkout: true
  },
  validateEdge({ edge, editor, sourceCell, targetCell }) {
    const allNextNodeIdList = editor.getAllNextNodeId(targetCell, 'forward');
    if (allNextNodeIdList.has(sourceCell.id)) {
      //
      if (sourceCell.getProp('type') === 'converge') {
        return false;
      }
      edge.prop('type', 'backward');
      edge.setAttrByPath('line/strokeDasharray', 5);
    }
    return true;
  }
};
