/**topo连线类**/
(function(global, factory) {
  factory((global.Backward = global.Backward || {}), global);
}(window, function(exports, global) {
  'use strict';
  class Backward extends LinkBase {
    constructor(canvas, config) {
      super(canvas, config);
      this.__style = 'dotted';//虚线
      this.__type = 'backward';//向前
    }
  }
  global.Backward = Backward;
}));
