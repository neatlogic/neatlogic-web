import ViewUI from 'neatlogic-ui/iview/index.js';
import { $t } from '@/resources/init.js';
(function(global, factory) {
  factory((global.Converge = global.Converge || {}), global);
}(window, function(exports, global) {
  class Converge extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._width = 68;
      this._height = 68;
      this.__shape = 'L-triangle:R-triangle';//形状
      this.__type = 'converge';
    }
    isAllowConnected(sourceNode) { 
      return true;
    }
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode) {
      if (sourceAnchor && targetNode && targetAnchor && !Object.is(this, targetNode)) {
        const prevNodeList = targetNode.getAllNextNodes('forward');
        const set = new Set(prevNodeList);
        if (set.has(this)) { //如果当前节点已经是目标节点的后置节点，则要用回退线
          //分流节点不能连回退线
          ViewUI.Message.warning({ content: $t('message.process.nodenobacklink'), duration: 3, closable: true });
        } else {
          //判断是否有连线
          const forwardSet = new Set(this.getNextNodes('forward'));
          if (!forwardSet.has(targetNode) && targetNode.isAllowConnected(this)) {
            this.canvas.addLink({
              type: 'forward',
              source: this.getUuid(), 
              sAnchor: sourceAnchor,
              target: targetNode.getUuid(),
              tAnchor: targetAnchor
            });
          }
        }
      }
    }
    valid(nodeConfig) {
      let validList = [];
      if (this.links.length <= 0) {
        validList.push({name: $t('message.process.nodeorphaned')});
      } else {
        if (this.getPrevNodes('forward') <= 0) {
          validList.push({name: $t('message.process.nodenofrontnode')});
        }
        if (this.getNextNodes('forward') <= 0) {
          validList.push({name: $t('message.process.nodenopostnode')});
        }
      }
      return validList;
    }
  }
  global.Converge = Converge;
}));
