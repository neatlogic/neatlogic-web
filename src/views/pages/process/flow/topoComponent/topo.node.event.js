import {$t} from '@/resources/init.js';
(function(global, factory) {
  factory((global.Process = global.Process || {}), global);
}(window, function(exports, global) {
  class Event extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._width = 68;
      this._height = 40;
      this.__shape = 'L-rectangle:R-rectangle';
      this.__type = 'event';
    }
    isAllowConnected(sourceNode) { 
      return true;
    }
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode) {
      if (sourceAnchor && targetNode && targetAnchor && !Object.is(this, targetNode)) {
        const prevNodeList = targetNode.getAllNextNodes('forward');
        const set = new Set(prevNodeList);
        if (set.has(this)) { //如果当前节点已经是目标节点的后置节点，则要用回退线
          //判断是否有连线
          const backwardSet = new Set(this.getNextNodes('backward'));
          if (!backwardSet.has(targetNode) && targetNode.isAllowConnected(this)) {
            this.canvas.addLink({
              type: 'backward',
              source: this.getUuid(), 
              sAnchor: sourceAnchor,
              target: targetNode.getUuid(),
              tAnchor: targetAnchor
            });
          }
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
  global.Event = Event;
}));
