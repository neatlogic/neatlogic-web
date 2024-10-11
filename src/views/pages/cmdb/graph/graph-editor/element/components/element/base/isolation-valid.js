import { $t } from '@/resources/init.js';
const isolationValid = {
  //校验是否存在孤岛节点
  valid: ({ node, graph }) => {
    const validList = [];
    const edges = graph.getConnectedEdges(node);
    if (!edges || edges.length <= 0) {
      validList.push({ msg: $t('message.process.nodeorphaned') });
    } else {
      const outgoingEdges = graph.getOutgoingEdges(node);
      if (!outgoingEdges || outgoingEdges.length <= 0) {
        validList.push({ msg: $t('message.process.nodenopostnode') });
      }
      const incomingEdges = graph.getIncomingEdges(node);
      if (!incomingEdges || incomingEdges.length <= 0) {
        validList.push({ msg: $t('message.process.nodenofrontnode') });
      }
    }
    return validList;
  }
};
export { isolationValid };
