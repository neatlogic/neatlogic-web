//import { Graph } from '@antv/x6';
import { register } from '@antv/x6-vue-shape';
import $utils from '@/resources/assets/js/util.js';
import elements from '@/views/pages/process/flow/floweditor/element/components/index.js';

//注册所有图形
elements.forEach(element => {
  //全部都需要使用vue节点
  const config = element.config;
  //如果没有handler，则用type注册节点，用type注册代表一类节点，不用为行为一样的节点重复注册
  config.shape = element.handler || element.type;
  register(config);
});

const ElementFactory = {
  getElement: ({ handler, type }) => {
    let element;
    if (handler) {
      element = elements.find(d => d.handler && d.handler === handler);
      if (element) {
        return $utils.deepClone(element);
      }
    }
    if (type) {
      element = elements.find(d => d.type && d.type === type);
      if (element) {
        return $utils.deepClone(element);
      }
    }
    return null;
  }
};

export { ElementFactory };
