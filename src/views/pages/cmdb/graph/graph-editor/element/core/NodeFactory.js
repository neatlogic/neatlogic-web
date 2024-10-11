import { ElementFactory } from './ElementFactory.js';
import $utils from '@/resources/assets/js/util.js';

const NodeFactory = {
  createNode: (graph, { handler }, config) => {
    const element = ElementFactory.getElement({ handler });
    if (element) {
      const nodeConfig = config;
      nodeConfig.shape = element.handler;

      //设置组件代码中的setting
      if (element.setting) {
        nodeConfig.setting = element.setting;
      }

      const node = graph.createNode(nodeConfig);
      return node;
    }
    return null;
  }
};

export { NodeFactory };
