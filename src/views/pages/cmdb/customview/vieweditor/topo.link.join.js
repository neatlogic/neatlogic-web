/**topo连线类**/
(function(global, factory) {
  factory((global.Join = global.Join || {}), global);
}(window, function(exports, global) {
  'use strict';
  class Join extends LinkBase {
    constructor(canvas, config) {
      super(canvas, config);
      this.__type = 'Join';//连线类型
    }
  }
  global.Join = Join;
}));
