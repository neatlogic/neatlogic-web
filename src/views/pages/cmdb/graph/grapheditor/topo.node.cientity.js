(function(global, factory) {
  factory((global.Cientity = global.Cientity || {}), global);
})(window, function(exports, global) {
  //页面拖进来之后的代码
  class Cientity extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._anchorList = [{ position: 'C' }];
      this._needShadow = false;
      this._size = 20; //半径
      this._cy = 20;
      this._cx = 20;
      this._width = 40;
      this._height = 40;
      this._strokewidth = 5;
      //this._animate = 'breath';
      this.__shape = 'circle';
      this.__class = 'cientity_node';
      this.__type = 'Cientity';
    }
    isAllowConnected(sourceNode) {
      if (sourceNode.type === 'group' && this.group && this.group === sourceNode) {
        return false;
      }
      return true;
    }
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode) {
      if (sourceAnchor && targetNode && targetAnchor && this != targetNode && targetNode.isAllowConnected(sourceNode)) {
        const nextNodeList = this.getNextNodes();
        const set = new Set(nextNodeList);
        if (!set.has(targetNode)) {
          const link = this.canvas.addLink({
            type: 'Link',
            source: this.getUuid(),
            sAnchor: sourceAnchor,
            target: targetNode.getUuid(),
            tAnchor: targetAnchor
          });
          return link;
        }
      }
    }
  }
  global.Cientity = Cientity;
});
