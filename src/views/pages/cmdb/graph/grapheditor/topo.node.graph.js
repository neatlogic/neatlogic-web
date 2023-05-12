(function(global, factory) {
  factory((global.Graph = global.Graph || {}), global);
})(window, function(exports, global) {
  //页面拖进来之后的代码
  class Graph extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._anchorList = [{ position: 'C' }];
      this._size = 20; //半径
      this._cy = 20;
      this._cx = 20;
      this._width = 40;
      this._height = 40;
      this._rx = 5;
      this._ry = 5;
      this._needShadow = true;
      this._strokewidth = 5;
      //this._animate = 'breath';
      this.__shape = 'rect';
      this.__class = 'graph_node';
      this.__type = 'Graph';
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
  global.Graph = Graph;
});
