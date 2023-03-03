/**topo连线类**/
(function(global, factory) {
  factory((global.Link = global.Link || {}), global);
})(window, function(exports, global) {
  'use strict';
  class Link extends LinkBase {
    constructor(canvas, config) {
      super(canvas, config);
      this.__type = 'Link'; //连线类型
    }
  }
  global.Link = Link;
});
