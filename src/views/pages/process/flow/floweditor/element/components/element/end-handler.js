import template from '../shape/circle.vue';
import ports from './base/port-config.js';
import ViewUI from 'neatlogic-ui/iview/index.js';
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
  oldSetting: {//转换成旧数据时使用
    shape: 'circle',
    icon: '#ts-circle-fill',
    fill: 'RGBA(255, 98, 90, .1)',
    stroke: 'RGBA(255, 98, 90, .1)'
  },
  validateMagnet({ graph, sourceCell }) {
    const node = graph.getCellById(sourceCell.id);
    const setting = node.getProp('setting');
    if (setting.linkout) {
      return true;
    } else {
      ViewUI.Message.warning({ content: $t('message.process.pleasestartscoringsetting'), duration: 3, closable: true });
      return false;
    }
  },
  validateEdge({ edge, editor, sourceCell, targetCell }) {
    const graph = editor.graph;
    const allPrevNodeList = graph.getPredecessors(sourceCell);
    const allPrevnodeIdList = allPrevNodeList.map(item => item.id);
    //启用评分时，可以连接回退线
    if (allPrevnodeIdList.includes(targetCell.id)) {
      if (sourceCell.getProp('type') === 'converge') {
        return false;
      }
      if (targetCell.getProp('type') !== 'end') {
        edge.prop('type', 'backward');
        edge.setAttrByPath('line/strokeDasharray', 5);
      }
    } else if (targetCell.getProp('type') !== 'end') {
      return false;
    }
    return true;
  },
  validateConnection({ sourceCell }) {
    if (sourceCell.getProp('type') === 'start') {
      return false;
    }
    return true;
  },
  valid({ node, graph }) {
    let validList = [];
    const incomingEdges = graph.getIncomingEdges(node);
    if (!incomingEdges || incomingEdges.length <= 0) {
      validList.push({ msg: $t('message.process.nodenofrontnode') });
    }
    return validList;
  }
};
