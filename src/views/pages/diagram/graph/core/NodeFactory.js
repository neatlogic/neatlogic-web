import { WidgetFactory } from './WidgetFactory.js';
import $utils from '@/resources/assets/js/util.js';

const NodeFactory = {
  createNode: (graph, shape) => {
    const widget = WidgetFactory.getWidget(shape);
    if (widget) {
      const nodeConfig = {
        id: $utils.setUuid(),
        shape: widget.name,
        label: widget.label,
        data: widget.data
      };
      if (widget.prop) {
        for (let key in widget.prop) {
          nodeConfig[key] = widget.prop[key];
        }
      }
      if (widget.setting) {
        nodeConfig.setting = widget.setting;
      }
      const node = graph.createNode(nodeConfig);
      //需要重复设置data，否则取不到值
      node.setData(widget.data);
      if (widget.event) {
        for (let e in widget.event) {
          node.on(e, arg => {
            if (widget.event[e]) {
              widget.event[e](arg, widget);
            }
          });
        }
      }
      return node;
    }
    return null;
  }
};

export { NodeFactory };
