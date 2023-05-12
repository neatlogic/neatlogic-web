/**topo连线类**/
(function(global, factory) {
  factory((global.Rightjoin = global.Rightjoin || {}), global);
})(window, function(exports, global) {
  'use strict';
  class Rightjoin extends LinkBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._arrowreverse = true;
      this.__style = 'dotted'; //虚线
      this.__type = 'Rightjoin'; //连线类型
    }
  }
  global.Rightjoin = Rightjoin;
});
