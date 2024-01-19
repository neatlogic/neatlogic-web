import ViewUI from 'neatlogic-ui/iview/index.js';
import {$t} from '@/resources/init.js';
(function(global, factory) {
  factory((global.Process = global.Process || {}), global);
}(window, function(exports, global) {
  class Process extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._width = 68;
      this._height = 40;
      this.__shape = config.shape || 'L-rectangle:R-rectangle';
      this.__type = 'process';
    }
    isAllowConnected(sourceNode) { 
      const nodeList = this.getNextNodes('forward');
      let find = nodeList.find(item => item.getUuid() == sourceNode.getConfig().uuid);
      if (this.__config.handler == 'timer' && (find || sourceNode.getType() == 'end')) { //定时节点不能连回退线
        ViewUI.Message.warning({ content: $t('message.process.timernodenobacklink'), duration: 3, closable: true });
        return false;
      }
      return true;
    }
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode) {
      if (!this.specialConnect(targetNode, sourceNode)) {
        return;
      }
      if (sourceAnchor && targetNode && targetAnchor && !Object.is(this, targetNode)) {
        const prevNodeList = targetNode.getAllNextNodes('forward');
        const set = new Set(prevNodeList);
        if (set.has(this)) { //如果当前节点已经是目标节点的后置节点，则要用回退线
          //判断是否有连线
          if (sourceNode.getConfig().handler == 'timer') { //定时节点不能连回退线
            ViewUI.Message.warning({ content: $t('message.process.timernodenobacklink'), duration: 3, closable: true });
            return false;
          } else if (sourceNode.getConfig().handler == 'eoa') {
            if (this.getNextNodes('backward') && this.getNextNodes('backward').length > 0) {
              ViewUI.Message.warning({ content: $t('message.process.eoanodenobacklink'), duration: 3, closable: true });
              return false;
            }
          }
          const backwardSet = new Set(this.getNextNodes('backward'));
          if (!backwardSet.has(targetNode) && targetNode.isAllowConnected(this)) {
            if (targetNode.getConfig().handler == 'timer') {
              ViewUI.Message.warning({ content: $t('message.process.timernodenobacklink'), duration: 3, closable: true });
              return false;
            }
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
            if (this.getNextNodes('forward') && this.getNextNodes('forward').length > 0) { 
              //定时节点和审批节点只能有一个后置节点
              if (sourceNode.getConfig().handler == 'timer') {
                ViewUI.Message.warning({ content: $t('message.process.timerhasonelink'), duration: 3, closable: true });
                return false;
              } else if (sourceNode.getConfig().handler == 'eoa') {
                ViewUI.Message.warning({ content: $t('message.process.eoahasonelink'), duration: 3, closable: true });
                return false;
              }
            }
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
    specialConnect(targetNode, sourceNode) {
      if (targetNode.getType() === 'end' && sourceNode.getConfig().handler === 'changecreate') { //变更创建节点不能在结束节点前面
        ViewUI.Message.warning({
          content: $t('message.process.changecrenotendnode'),
          duration: 3,
          closable: true
        });
        return false;
      }
      return true;
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
  global.Process = Process;
}));
