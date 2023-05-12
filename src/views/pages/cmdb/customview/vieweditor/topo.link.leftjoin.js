/**topo连线类**/
(function(global, factory) {
  factory((global.Leftjoin = global.Leftjoin || {}), global);
})(window, function(exports, global) {
  'use strict';
  class Leftjoin extends LinkBase {
    constructor(canvas, config) {
      super(canvas, config);
      this.__style = 'dotted'; //虚线
      this.__type = 'Leftjoin'; //连线类型
    }
  }
  global.Leftjoin = Leftjoin;
});
