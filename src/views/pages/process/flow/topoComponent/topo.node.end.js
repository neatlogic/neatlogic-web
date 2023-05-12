import ViewUI from 'neatlogic-ui/iview/index.js';
import {$t} from '@/resources/init.js';
(function(global, factory) {
  factory((global.End = global.End || {}), global);
}(window, function(exports, global) {
  class End extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._width = 40;
      this._height = 40;
      this.__shape = 'circle';//形状
      this._isDeleteable = false;//是否可以被删除
      this._size = 20;
      this._cx = 20;
      this._cy = 20;
      this.__type = 'end';
    }
    fromJson(json) {
     
    }
    draw() {
      super.draw();
      if (this.el) {
        this.el.classed('end', true);
      }
    }
    isAllowConnected(sourceNode) {
      if (sourceNode.getType() == 'start') { //不允许开始节点直接连
        return false;
      }
      return true;
    }
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode) {
      if (sourceAnchor && targetNode && targetAnchor && !Object.is(this, targetNode) && targetNode.isAllowConnected(this)) {
        const prevNodeList = new Set(this.getAllPrevNodes('forward'));
        let backNode = new Set(this.getNextNodes('backward'));
        if (prevNodeList.has(targetNode) && !backNode.has(targetNode)) {
          let scoreConfig = this.canvas.containerVue.scoreConfig;
          if (!scoreConfig.isActive) {
            ViewUI.Message.warning({ content: $t('message.process.pleasestartscoringsetting'), duration: 3, closable: true });
            return;
          }
          this.canvas.addLink({
            type: 'backward',
            source: this.getUuid(), 
            sAnchor: sourceAnchor,
            target: targetNode.getUuid(),
            tAnchor: targetAnchor
          });
        }
      }
    }
    valid(nodeConfig) {
      let validList = [];
      if (this.links.length <= 0) {
        validList.push({ name: $t('message.process.nodemusthaveinputgoingline') });
      }
      return validList;
    }
  }
  global.End = End;
}));
