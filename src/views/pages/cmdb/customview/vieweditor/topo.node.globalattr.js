(function(global, factory) {
  factory((global.GlobalAttr = global.GlobalAttr || {}), global);
})(window, function(exports, global) {
  class GlobalAttr extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._anchorList = [];
      this._needShadow = false;
      this._isDragable = true;
      this._isSelectable = false;
      this._isDeleteable = false;
      this._width = 120;
      this._height = 30;
      //this.__fill = '#ffffff';
      //this.__stroke = '#E2E4EC'; //添加属性字段边框样式
      this.__type = 'GlobalAttr'; //必须定义节点类型
    }
    isAllowConnected(sourceNode) {
      return false;
    }
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode, joinType, name) {
      return null;
    }
  }
  global.GlobalAttr = GlobalAttr;
});
