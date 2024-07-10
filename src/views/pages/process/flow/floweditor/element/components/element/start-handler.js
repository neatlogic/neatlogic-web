import template from '../shape/circle.vue';
import ports from './base/port-config.js';
import ViewUI from 'neatlogic-ui/iview/index.js';
import { $t } from '@/resources/init.js';

export default {
  name: '开始',
  type: 'start',

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
    linkin: false,
    linkout: true
  },
  oldSetting: {
    //转换成旧数据时使用
    shape: 'circle',
    icon: '#ts-circle-fill',
    fill: 'RGBA(129, 213, 83, .1)',
    stroke: 'RGBA(129, 213, 83, .1)'
  },
  validateMagnet({ editor, sourceCell }) {
    const allNextNodeIdList = editor.getAllNextNodeId(sourceCell, 'forward');
    //只能有一个后置节点
    if (allNextNodeIdList.size > 0) {
      ViewUI.Message.warning({ content: $t('message.process.startnodeonlyoneline'), duration: 3, closable: true });
      return false;
    } else {
      return true;
    }
  },
  validateEdge({ targetCell }) {
    if (!targetCell.getProp('isAllowStart')) {
      ViewUI.Message.warning({ content: $t('message.process.nodecannotbeconnectedstartnode'), duration: 3, closable: true });
      return false;
    }
    return true;
  },
  valid({ node, graph }) {
    let validList = [];
    const outgoingEdges = graph.getOutgoingEdges(node);
    if (!outgoingEdges || outgoingEdges.length <= 0) {
      validList.push({ msg: $t('message.process.nodenopostnode') });
    }
    return validList;
  }
};
