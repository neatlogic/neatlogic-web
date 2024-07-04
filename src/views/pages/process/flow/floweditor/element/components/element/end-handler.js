import template from '../shape/circle.vue';
import ports from './base/port-config.js';
import { $t } from '@/resources/init.js';

export default {
  name: '结束',
  type: 'end',
  isVue: true, //需要声明是vue组件
  config: {
    component: template,
    ports: ports,
    size: { width: 40, height: 40 }
  },
  event: {},
  setting: {
    resizable: false,
    deleteable: false,
    draggable: true,
    selectable: false,
    linkin: true,
    linkout: false
  },
  validateMagnet() {
    return false;
  },
  validateConnection({ sourceCell }) {
    if (sourceCell.getProp('type') === 'start') {
      return false;
    }
    return true;
  },
  valid({node, graph}) {
    let validList = [];
    const incomingEdges = graph.getIncomingEdges(node);
    if (!incomingEdges || incomingEdges.length <= 0) {
      validList.push({ msg: $t('message.process.nodenofrontnode') });
    }
    return validList;
  }
};
