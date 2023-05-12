import ViewUI from 'techsure-ui/iview/index.js';
import {$t} from '@/resources/init.js';
(function(global, factory) {
  factory((global.Start = global.Start || {}), global);
})(window, function(exports, global) {
  class Start extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._width = 40;
      this._height = 40;
      this.__shape = 'circle'; //形状
      this._isDeleteable = false; //是否可以被删除
      this._size = 20;
      this._cx = 20;
      this._cy = 20;
      this.__type = 'start';
    }
    fromJson(json) {}
    draw() {
      super.draw();
      if (this.el) {
        this.el.classed('start', true);
      }
    }
    isAllowConnected(sourceNode) {
      return false;
    }
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode) {
      const nodeList = this.getNextNodes('forward');
      //开始节点只能有一个后置节点
      let targetConfig = targetNode.getConfig();
      if (targetConfig.isAllowStart != 1) {
        ViewUI.Message.warning({ content: $t('message.process.nodecannotbeconnectedstartnode'), duration: 3, closable: true });
      } else if (nodeList.length <= 0 && targetNode.isAllowConnected(this)) {
        this.canvas.addLink({
          type: 'forward',
          source: this.getUuid(),
          sAnchor: sourceAnchor,
          target: targetNode.getUuid(),
          tAnchor: targetAnchor
        });
      } else {
        ViewUI.Message.warning({ content: $t('message.process.startnodeonlyoneline'), duration: 3, closable: true });
      }
    }
    valid(nodeConfig) {
      let validList = [];
      if (this.links.length <= 0) {
        validList.push({ name: $t('message.process.nodemusthaveoutgoingline') });
      }
      return validList;
    }
  }
  global.Start = Start;
});
