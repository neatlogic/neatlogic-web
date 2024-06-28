import { ElementFactory } from './ElementFactory.js';
import $utils from '@/resources/assets/js/util.js';

const NodeFactory = {
  createNode: (graph, { handler, type }, config) => {
    const element = ElementFactory.getElement({ handler, type });
    if (element) {
      const nodeConfig = config;
      nodeConfig.shape = element.handler || element.type;
      //设置组件代码中的prop
      if (element.prop) {
        for (let key in element.prop) {
          if (!nodeConfig[key]) {
            nodeConfig[key] = element.prop[key];
          }
        }
      }

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
