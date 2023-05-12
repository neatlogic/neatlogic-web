/**topo连线类**/
(function(global, factory) {
  factory((global.Nojoin = global.Nojoin || {}), global);
}(window, function(exports, global) {
  'use strict';
  class Nojoin extends LinkBase {
    constructor(canvas, config) {
      super(canvas, config);
      this.__type = 'Nojoin';//连线类型
    }
  }
  global.Nojoin = Nojoin;
}));
