(function(global, factory) {
  factory((global.Attr = global.Attr || {}), global);
})(window, function(exports, global) {
  class Attr extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      if (config.config.canLink) {
        this._anchorList = [{ position: 'L' }, { position: 'R' }]; //连线点列表，默认左右四个锚点
        this.__icon = this.__icon + ' >>';
      } else {
        this._anchorList = [];
      }
      this._needShadow = false;
      this._isDragable = true;
      this._isSelectable = false;
      this._isDeleteable = false;
      this._width = 120;
      this._height = 30;
      //this.__fill = '#ffffff';
      //this.__stroke = '#E2E4EC'; //添加属性字段边框样式
      this.__type = 'Attr'; //必须定义节点类型
    }
    isAllowConnected(sourceNode) {
      if (this.getConfig().canLink) {
        return true;
      } else {
        return false;
      }
    }
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode, joinType, name) {
      if (this.getConfig().canLink && sourceAnchor && targetNode && targetAnchor && this != targetNode && (targetNode.getType() == 'Attr' || targetNode.getType() == 'ConstAttr') && targetNode.isAllowConnected(sourceNode)) {
        const nextNodeList = this.getNextNodes();
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
          return link;
        }
      }
    }
  }
  global.Attr = Attr;
});
