/**节点连接点类，一个类实例表示一个连接点**/
(function (global, factory) {
  factory((global.Resizer = global.Resizer || {}), global);
})(window, function (exports, global) {
  'use strict';
  class Resizer {
    constructor(canvas, node) {
      if (!canvas) {
        console.error('请定义画布');
        return;
      }
      if (!node) {
        console.error('请提供节点定义');
        return;
      }
      //两下划线开头的属性，代表需要在tojson中序列化，单下划线只是代表私有属性，但不需要序列化
      this.canvas = canvas; //画布对象
      this.node = node; //节点对象
      this.getSet = {}; //存储属性旧值，方便比对
      this.getSetConfig = {}; //存储旧config值
      this.handlerEls = {}; //四个位置的el
      this._x = 0;
      this._y = 0;
      this._shape = 'rect';
      this._size = 8; // 锚点大小
      this._stroke = '#336EFF';
      this._ishover = false;

      //动态创建所有get set函数
      for (const k in this) {
        if (k.startsWith('_')) {
          let pname = k.substring(1);
          pname = pname.replace(pname[0], pname[0].toUpperCase());
          this['get' + pname] = function () {
            return this[k];
          };
          this['set' + pname] = function (value) {
            this[k] = value;
            return this;
          };
        }
      }
      //设置属性双向绑定
      this.initBinding();
    }
    initBinding() {
      //创建节点属性双向绑定，节点属性变化自动触发ph中的函数修改SVG
      let bindSetting = {};
      for (const k in this) {
        if (k.startsWith('_')) {
          let ak = k.substring(1); //去掉前缀，PH里的名字是没前缀的

          this.getSet[k] = this[k];
          const that = this;
          bindSetting[k] = {
            get: function () {
              return that.getSet[k];
            },
            set: function (value) {
              const oldValue = that.getSet[k];
              if (oldValue !== value) {
                that.getSet[k] = value;
              }
              if (PH['resizer.' + ak] && typeof PH['resizer.' + ak] === 'function') {
                PH['resizer.' + ak](that, value);
              }
            }
          };
        }
      }
      Object.defineProperties(this, bindSetting);
    }
    draw() {
      if (!this.node.resizeG) {
        this.node.resizeG = this.el = this.node.el.append('g');
        this.el.datum(this);
        //计算4个handler的位置
        const handlers = this.calcutePosition();
        handlers.forEach(handler => {
          this.handlerEls[handler.position] = this.el
            .append('rect')
            .attr('fill', 'transparent')
            .attr('x', handler.x)
            .attr('y', handler.y)
            .attr('width', this.getSize())
            .attr('height', this.getSize())
            .attr('stroke-width', 1)
            .attr('style', 'cursor:' + handler.cursor)
            .attr('class', 'resizer');
        });
        //初始化事件
        this.initEvent();
      }
    }
    destory() {
      this.node.resizeG = null;
      this.el.remove();
    }
    calcutePosition() {
      const box = this.node.shapeEl.node().getBBox();
      const handlers = [
        { position: 'LT', cursor: 'nw-resize', x: box.x - this.getSize() / 2, y: box.y - this.getSize() / 2 },
        { position: 'RT', cursor: 'ne-resize', x: box.x + box.width - this.getSize() / 2, y: box.y - this.getSize() / 2 },
        { position: 'LB', cursor: 'sw-resize', x: box.x - this.getSize() / 2, y: box.y + box.height - this.getSize() / 2 },
        { position: 'RB', cursor: 'se-resize', x: box.x + box.width - this.getSize() / 2, y: box.y + box.height - this.getSize() / 2 }
      ];
      return handlers;
    }
    adjustPosition() {
      if (this.handlerEls) {
        const handlers = this.calcutePosition();
        handlers.forEach(handler => {
          const handlerEl = this.handlerEls[handler.position];
          if (handlerEl) {
            handlerEl.attr('x', handler.x).attr('y', handler.y).attr('width', this.getSize()).attr('height', this.getSize());
          }
        });
      }
    }
    initEvent() {
      for (const k in this.handlerEls) {
        const el = this.handlerEls[k];
        el.on('mouseenter', d => {
          el.interrupt();
          el.transition().duration(100).attr('stroke-width', d.getSize()).attr('stroke-opacity', '0.3');
        }).on('mouseleave', d => {
          el.interrupt();
          el.transition().duration(100).attr('stroke-width', '1.5').attr('stroke-opacity', '1');
        });
        //绑定拖拽
        el.call(
          d3
            .drag()
            .on('start', d => {
              this.resizeDir = k;
              this.initData = { x: this.canvas.getMouseX(), y: this.canvas.getMouseY(), width: this.node.getWidth(), height: this.node.getHeight() };
              this.node.setIsResizing(true);
            })
            .on('drag', d => {
              if (this.resizeDir && this.initData) {
                let newX = this.canvas.getMouseX();
                let newY = this.canvas.getMouseY();
                let dx = newX - this.initData.x;
                let dy = newY - this.initData.y;
                if (this.resizeDir === 'LT') {
                  if (this.initData.width - dx < this.node.getMinWidth()) {
                    dx = this.initData.width - this.node.getMinWidth();
                    newX = dx + this.initData.x;
                  }
                  if (this.initData.height - dy < this.node.getMinHeight()) {
                    dy = this.initData.height - this.node.getMinHeight();
                    newY = dy + this.initData.y;
                  }
                  this.node.setX(newX);
                  this.node.setWidth(this.initData.width - dx);
                  this.node.setY(newY);
                  this.node.setHeight(this.initData.height - dy);
                } else if (this.resizeDir === 'RT') {
                  if (this.initData.width + dx < this.node.getMinWidth()) {
                    dx = this.node.getMinWidth() - this.initData.width;
                    newX = dx + this.initData.x;
                  }
                  if (this.initData.height - dy < this.node.getMinHeight()) {
                    dy = this.initData.height - this.node.getMinHeight();
                    newY = dy + this.initData.y;
                  }
                  this.node.setWidth(this.initData.width + dx);
                  this.node.setY(newY);
                  this.node.setHeight(this.initData.height - dy);
                } else if (this.resizeDir === 'LB') {
                  if (this.initData.width - dx < this.node.getMinWidth()) {
                    dx = this.initData.width - this.node.getMinWidth();
                    newX = dx + this.initData.x;
                  }
                  if (this.initData.height + dy < this.node.getMinHeight()) {
                    dy = this.node.getMinHeight() - this.initData.height;
                    newY = dy + this.initData.y;
                  }
                  this.node.setX(newX);
                  this.node.setWidth(this.initData.width - dx);
                  this.node.setHeight(this.initData.height + dy);
                } else if (this.resizeDir === 'RB') {
                  if (this.initData.width + dx < this.node.getMinWidth()) {
                    dx = this.node.getMinWidth() - this.initData.width;
                    newX = dx + this.initData.x;
                  }
                  if (this.initData.height + dy < this.node.getMinHeight()) {
                    dy = this.node.getMinHeight() - this.initData.height;
                    newY = dy + this.initData.y;
                  }
                  this.node.setWidth(this.initData.width + dx);
                  this.node.setHeight(this.initData.height + dy);
                }
                this.adjustPosition();
              }
            })
            .on('end', d => {
              this.resizeDir = null;
              this.initData = null;
              this.node.setIsResizing(false);
            })
        );
      }
    }
  }
  global.Resizer = Resizer;
});
