import template from '../shape/circle.vue';
import ports from './base/port-config.js';

export default {
  name: '结束',
  type: 'end',
  isVue: true, //需要声明是vue组件
  config: {
    component: template,
    ports: ports
  },
  prop: {
    width: 40,
    height: 40
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
  }
};
