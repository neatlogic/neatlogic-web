import template from '../shape/ellipse.vue';
import ports from './base/port-config.js';
import ViewUI from 'neatlogic-ui/iview/index.js';
import { $t } from '@/resources/init.js';

export default {
  name: '定时节点',
  handler: 'timer',
  type: 'process',
  isVue: true, //需要声明是vue组件
  config: {
    component: template,
    ports: ports,
    size: { width: 68, height: 40 }
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
  oldSetting: {
    shape: 'L-rectangle:R-rectangle',
    icon: '#tsfont-timer'
  },
  validateMagnet({ editor, sourceCell }) {
    const allNextNodeIdList = editor.getAllNextNodeId(sourceCell, 'forward');
    //只能有一个后置节点
    if (allNextNodeIdList.size > 0) {
      ViewUI.Message.warning({ content: $t('message.process.timerhasonelink'), duration: 3, closable: true });
      return false;
    } else {
      return true;
    }
  }
};
