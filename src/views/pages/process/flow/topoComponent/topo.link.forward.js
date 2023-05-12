/**topo连线类**/
(function(global, factory) {
  factory((global.Forward = global.Forward || {}), global);
}(window, function(exports, global) {
  'use strict';
  class Forward extends LinkBase {
    constructor(canvas, config) {
      super(canvas, config);
      this.__type = 'forward';//向后
    }
  }
  global.Forward = Forward;
}));
