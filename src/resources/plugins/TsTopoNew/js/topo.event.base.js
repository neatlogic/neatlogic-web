/**topo节点的事件基础类**/
(function (global, factory) {
  factory((global.EventBase = global.EventBase || {}), global);
})(window, function (exports, global) {
  'use strict';
  class EventBase {
    constructor(canvas, config) {}
    initEvent() {
      //绑定拖拽
      if (this.getIsDragable()) {
        this.el.call(
          d3
            .drag()
            .on('start', (event, d) => {
              if (this.getIsDragable()) {
                this.setIsDragging(true);
                let selectNode = this.canvas.getSelected();
                this.status.selected
                  ? selectNode.forEach(node => {
                      //同时存在多个拖动元素
                      node.onDragstart();
                    })
                  : this.onDragstart();
              }
            })
            .on('drag', (event, d) => {
              if (this.getIsDragable()) {
                let selectNode = this.canvas.getSelected();
                this.status.selected
                  ? selectNode.forEach(node => {
                      node.onDrag(event, node);
                    })
                  : this.onDrag(event, d);
              }
            })
            .on('end', (event, d) => {
              if (this.getIsDragable()) {
                this.setIsDragging(false);
                let selectNode = this.canvas.getSelected();
                this.status.selected
                  ? selectNode.forEach(node => {
                      node.onDragend();
                    })
                  : this.onDragend();
              }
            })
        );
      }
      //初始化事件
      this.el
        .on('click', (event, d) => {
          this.onClick(event, d);
        })
        .on('mouseenter', (event, d) => {
          this.onMouseenter(d);
        })
        .on('mouseleave', (event, d) => {
          this.onMouseleave(d);
        })
        .on('dragenter', (event, d) => {
          this.status.entered = true;
        })
        .on('dragleave', (event, d) => {
          this.status.entered = false;
        });
    }
    /*由于外部拖拽事件的数据都是topo以外的自定义数据，所以需要由子类来继承实现个性化 */
    onDragEnter(event) {}
    onClick(event, d) {
      event.stopPropagation();
      if (this.clickFn && typeof this.clickFn === 'function') {
        this.clickFn(d);
      }
    }
    onMouseenter(d) {
      if (d.mouseenterFn && typeof d.mouseenterFn === 'function') {
        d.mouseenterFn(d);
      }
      if (this.getIsConnectable() && !this.getIsResizing() && !this.getIsDragging()) {
        if (d.anchors && d.anchors.length > 0) {
          d.anchors.forEach(element => {
            element.el.dispatch('active');
          });
        }
      }
      this.status.entered = true;
    }
    onMouseleave(d) {
      if (this.mouseleaveFn && typeof this.mouseleaveFn === 'function') {
        this.mouseleaveFn(d);
      }
      if (this.anchors && this.anchors.length > 0) {
        this.anchors.forEach(element => {
          element.el.dispatch('unactive');
        });
      }
      this.status.entered = false;
      if (this.unactive && typeof this.unactive === 'function') {
        this.unactive();
      }
    }
    onDragstart() {
      this.currentX = this.getX();
      this.currentY = this.getY();
      if (this.group) {
        this.group.draggingNode = this; //设置拖动节点，分组移动时忽略当前分组
      }
    }
    onDrag(event,d) {
      this.setDx(event.dx);
      this.setDy(event.dy);
      //删除拖拽目标的指针事件，让下层元素可以响应鼠标事件
      this.el.attr('pointer-events', 'none');
      //如果属于分组，并且分组不能拖动，则拖动整个分组
      if (this.group && !this.group.getIsDragable()) {
        this.group.setDx(event.dx);
        this.group.setDy(event.dy);
      }

      if (this.canvas.getIsAutoAdjust()) {
        //寻找最接近的节点，如果符合接近距离，则显示对齐辅助线
        const offset = 10;
        let targetX = null;
        let targetY = null;
        let minX = offset;
        let minY = offset;
        const allItemList = [...this.canvas.nodes, ...this.canvas.groups];
        allItemList.forEach(node => {
          if (node !== this && node !== this.group) {
            const tx = Math.abs(this.getX() - node.getX());
            const ty = Math.abs(this.getY() - node.getY());
            if (tx <= minX) {
              minX = tx;
              targetX = node;
            }
            if (ty <= minY) {
              minY = ty;
              targetY = node;
            }
          }
        });
        if (targetX) {
          // 添加对齐辅助线
          if (!this.alignPathX) {
            this.alignPathX = this.canvas.zoomG.append('path').attr('stroke-width', 1).attr('class', 'alignPath').attr('stroke-dasharray', '3,4').attr('stroke', 'black').attr('stroke-opacity', 0.5).attr('fill', 'none').attr('d', 'M0,-99999V99999');
          }
          this.alignPathX.attr('transform', `translate(${targetX.getX()}, 0)`);
          this.alignPathX.datum({ x: targetX.getX() });
        } else {
          if (this.alignPathX) {
            this.alignPathX.remove();
            this.alignPathX = null;
          }
        }
        if (targetY) {
          if (!this.alignPathY) {
            this.alignPathY = this.canvas.zoomG.append('path').attr('stroke-width', 1).attr('class', 'alignPath').attr('stroke-dasharray', '3,4').attr('stroke', 'black').attr('stroke-opacity', 0.5).attr('fill', 'none').attr('d', 'M-99999,0H99999');
          }
          this.alignPathY.attr('transform', `translate(0, ${targetY.getY()})`);
          this.alignPathY.datum({ y: targetY.getY() });
        } else {
          if (this.alignPathY) {
            this.alignPathY.remove();
            this.alignPathY = null;
          }
        }
        //检测是否拖进分组
        if (this.type === 'node') {
          const groupList = this.canvas.getEnterGroups();
          if (groupList && groupList.length > 0) {
            groupList.forEach((g, index) => {
              if (g.getIsAllowDragIn()) {
                if (index === 0) {
                  g.active();
                } else {
                  g.unactive();
                }
              }
            });
          }
        }
      }
    }
    onDragend() {
      //恢复拖拽目标的指针事件，否则将不能响应鼠标事件
      this.el.attr('pointer-events', 'auto');
      if (this.alignPathX) {
        const data = this.alignPathX.datum();
        this.alignPathX.remove();
        this.alignPathX = null;
        this.setX(data.x);
        //重绘所有连线
        if (this.links && this.links.length > 0) {
          this.links.forEach(link => {
            link.updatePath();
          });
        }
      }
      if (this.alignPathY) {
        const data = this.alignPathY.datum();
        this.alignPathY.remove();
        this.alignPathY = null;
        this.setY(data.y);
        //重绘所有连线
        if (this.links && this.links.length > 0) {
          this.links.forEach(link => {
            link.updatePath();
          });
        }
      }
      //节点拖进分组
      if (this.type === 'node') {
        if (this.group && this.group.getIsAllowDragIn()) {
          this.group.draggingNode = null; //删除拖动节点
          const groupList = this.canvas.getEnterGroups();
          if (groupList.length == 0) {
            //移出分组
            this.group.removeNode(this);
          } else {
            //转移分组
            const group = groupList[0];
            if (group !== this.group) {
              this.group.removeNode(this);
              group.addNode(this);
            }
          }
        } else if (!this.group) {
          const groupList = this.canvas.getEnterGroups().filter(g => g.getIsAllowDragIn());
          if (groupList && groupList.length > 0) {
            const group = groupList[0];
            group.addNode(this);
          }
        }
      }
    }
  }
  global.EventBase = EventBase;
});
