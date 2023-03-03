/**双向绑定处理器，定义每个属性的具体处理方式**/
(function(global, Watcher) {
  Watcher((global.Watcher = global.Watcher || {}), global);
})(window, function(exports, global) {
  'use strict';
  class Watcher {
    constructor() {
      this.timmer = null;
      this.task = [];
      this.queue = [];
    }
    add(node, property, func) {
      if (node && node.type && property && func) {
        if (typeof property === 'string') {
          if (!this.queue[node.type + '.' + property]) {
            this.queue[node.type + '.' + property] = [];
          }
          if (!this.queue[node.type + '.' + property].includes(func)) {
            this.queue[node.type + '.' + property].push(func);
          }
        } else if (property instanceof Array) {
          property.forEach(prop => {
            if (!this.queue[node.type + '.' + prop]) {
              this.queue[node.type + '.' + prop] = [];
            }
            if (!this.queue[node.type + '.' + prop].includes(func)) {
              this.queue[node.type + '.' + prop].push(func);
            }
          });
        }
      }
    }
    call(key) {
      if (this.queue[key] && this.queue[key].length > 0) {
        this.queue[key].forEach(fuc => {
          if (typeof fuc === 'function') {
            if (!this.task.includes(fuc)) {
              this.task.push(fuc);
              if (this.timmer) {
                clearTimeout(this.timmer);
                this.timmer = null;
              }
              this.timmer = setTimeout(() => {
                while (this.task.length > 0) {
                  const task = this.task.shift();
                  task();
                }
              }, 17); //大约60fps
            }
          }
        });
      }
    }
  }
  global.Watcher = Watcher;
});
