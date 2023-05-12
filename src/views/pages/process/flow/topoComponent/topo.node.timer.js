import ViewUI from 'neatlogic-ui/iview/index.js';
import {$t} from '@/resources/init.js';
(function(global, factory) {
  factory((global.Timer = global.Timer || {}), global);
}(window, function(exports, global) {
  class Timer extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._width = 68;
      this._height = 40;
      this.__shape = config.shape || 'L-rectangle:R-rectangle';
      this.__type = 'timer';
    }
    isAllowConnected(sourceNode) {
      const nodeList = this.getNextNodes('forward');
      let find = nodeList.find(item => item.getUuid() == sourceNode.getConfig().uuid);
      if (find || sourceNode.getType() == 'end') { //不能连回退线
        ViewUI.Message.warning({ content: $t('message.process.timernodenobacklink'), duration: 3, closable: true });
        return false;
      }
      return true;
    }
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode) {
      const nodeList = this.getNextNodes('forward');
      //只能有一个后置节点
      if (nodeList.length <= 0 && targetNode.isAllowConnected(this)) {
        this.canvas.addLink({
          type: 'forward',
          source: this.getUuid(),
          sAnchor: sourceAnchor,
          target: targetNode.getUuid(),
          tAnchor: targetAnchor
        });
      } else {
        ViewUI.Message.warning({ content: $t('message.process.timerhasonelink'), duration: 3, closable: true });
      }
    }
    valid(nodeConfig) {
      let validList = [];
      if (this.links.length <= 0) {
        validList.push({ name: $t('message.process.nodeorphaned') });
      } else {
        if (this.getPrevNodes('forward') <= 0) {
          validList.push({ name: $t('message.process.nodenofrontnode') });
        }
        if (this.getNextNodes('forward') <= 0) {
          validList.push({ name: $t('message.process.nodenopostnode') });
        }
      }
      return validList;
    }
  }
  global.Timer = Timer;
}));
