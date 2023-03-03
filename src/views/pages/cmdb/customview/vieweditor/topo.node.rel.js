(function(global, factory) {
  factory((global.Rel = global.Rel || {}), global);
}(window, function(exports, global) {
  class Rel extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._anchorList = [{ position: 'L' }, { position: 'R' }]; //连线点列表，默认左右四个锚点
      this._needShadow = false;
      this._isDragable = true;
      this._isSelectable = false;
      this._isDeleteable = false;
      this._width = 120;
      this._height = 30;
      //this.__fill = '#EEF2F6';
      //this.__iconcolor = '#326FFF';
      this.__type = 'Rel';//必须定义节点类型
    }
    isAllowConnected(sourceNode) {
      return true;
    }
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode, joinType, name) {
      if (sourceAnchor && targetNode && targetAnchor && this != targetNode && targetNode.getType() === 'Ci' && targetNode.isAllowConnected(sourceNode)) {
        const nextNodeList = this.getNextNodes();
        if (nextNodeList.length == 0) {
          const set = new Set(nextNodeList);
          if (!set.has(targetNode)) {
            const link = this.canvas.addLink({
              type: joinType || 'Join',
              source: this.getUuid(), 
              sAnchor: sourceAnchor,
              target: targetNode.getUuid(),
              tAnchor: targetAnchor,
              name: name
            });
            if (link) {
              //link.setClass('linkRel');
              //关系线段不能删除，只能通过删除属性或模型来删除关系
              link.setIsDeleteable(false);
            }
            return link;
          }
        }
      }
    }
  }
  global.Rel = Rel;
}));
