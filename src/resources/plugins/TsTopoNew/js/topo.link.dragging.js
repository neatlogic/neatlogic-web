/**topo连线类**/
(function(global, factory) {
  factory((global.Dragging = global.Dragging || {}), global);
}(window, function(exports, global) {
  'use strict';
  class Dragging extends LinkBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._class = null;//不需要默认样式
      this._markerend = false;//是否有箭头
      this._markerstart = false;//是否有起点
      this._isReal = false;//虚拟连线
      this._isCurve = false;
      this._isDeleteable = false;
      this._isSelectable = false;
      this._isAnimated = false;
      this.__type = 'dragging';//连线类型
      this.__stroke = 'red';//线段颜色
    }
    draw() {
      super.draw();
    }
  }
  global.Dragging = Dragging;
}));
