import template from '../shape/rect.vue';
import ports from './base/port-config.js';
import { $t } from '@/resources/init.js';
export default {
  name: '普通节点',
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
    linkout: true,
    assignable: true//是否需要分配用户
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
  },
  //流程保存时校验数据
  valid({node, graph}) {
    let validList = [];
    const edges = graph.getConnectedEdges(node);
    if (!edges || edges.length <= 0) {
      validList.push({ name: $t('message.process.nodeorphaned') });
    } else {
      const outgoingEdges = graph.getOutgoingEdges(node);
      if (!outgoingEdges || outgoingEdges.length <= 0) {
        validList.push({ name: $t('message.process.nodenopostnode') });
      }
      const incomingEdges = graph.getIncomingEdges(node);
      if (!incomingEdges || incomingEdges.length <= 0) {
        validList.push({ name: $t('message.process.nodenofrontnode') });
      }
    }
    return validList;
  }
};
