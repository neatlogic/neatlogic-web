(function(global, factory) {
  factory((global.GraphGroup = global.GraphGroup || {}), global);
})(window, function(exports, global) {
  class GraphGroup extends GroupBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._anchorList = [{ position: 'C' }]; //连线点列表，默认上下左右四个锚点
      //this._animate = 'breath';
      this.__width = config.width || 200;
      this.__height = config.height || 200;
      this.__class = 'group_node';
      this.__type = 'GraphGroup'; //必须定义节点类型
      this.__strokewidth = config.strokewidth;
    }
    isAllowConnected(sourceNode) {
      if (sourceNode.type === 'node' && sourceNode.group && sourceNode.group === this) {
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
    onDragEnter(event) {
      //data是在graph-edit.vue中定义的变量
      console.log(event.dataTransfer.getData('data'));
    }
  }
  global.GraphGroup = GraphGroup;
});
