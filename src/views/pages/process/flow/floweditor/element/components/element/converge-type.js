import template from '../shape/polygon.vue';
import ports from './base/port-config.js';

export default {
  name: '分流/汇聚',
  type: 'converge',
  isVue: true, //需要声明是vue组件
  config: {
    component: template,
    ports: ports,
    size: { width: 68, height: 68 }
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
  validateConnection({ editor, sourceCell, targetCell }) {
    const allNextNodeIdList = editor.getAllNextNodeId(targetCell, 'forward');
    if (allNextNodeIdList.has(sourceCell.id)) {
      return false;
    }
    return true;
  }
};
