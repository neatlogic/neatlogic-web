/**节点连接点类，一个类实例表示一个连接点**/
(function (global, factory) {
  factory((global.Anchor = global.Anchor || {}), global);
})(window, function (exports, global) {
  'use strict';
  class Anchor {
    constructor(canvas, node, config) {
      if (!canvas) {
        console.error('请定义画布');
        return;
      }
      if (!node) {
        console.error('请提供节点定义');
        return;
      }
      if (!config) {
        console.error('请提供连接点配置');
        return;
      }
      //两下划线开头的属性，代表需要在tojson中序列化，单下划线只是代表私有属性，但不需要序列化
      this.canvas = canvas; //画布对象
      this.node = node; //节点对象
      this.config = config;
      this.linkFactory = new LinkFactory();

      this._shape = 'circle';
      this._size = canvas.config['anchor.size'] || 8; // 锚点大小
      this._direction = 'io'; //支持连入连出
      if (config.position) {
        this._position = config.position;
      } else {
        console.error('请提供节点位置');
        return;
      }
      this._nodeX = config.nodeX; //节点x坐标
      this._nodeY = config.nodeY; //节点y坐标
      this._direction = config.direction || 'io';
      this._stroke = '#336EFF';
      this._ishover = false;

      //动态创建所有get set函数
      for (const k in this) {
        if (k.startsWith('__')) {
          let pname = k.substring(2);
          pname = pname.replace(pname[0], pname[0].toUpperCase());
          this['get' + pname] = function () {
            return this[k];
          };
          this['set' + pname] = function (value) {
            this[k] = value;
          };
        } else if (k.startsWith('_')) {
          let pname = k.substring(1);
          pname = pname.replace(pname[0], pname[0].toUpperCase());
          this['get' + pname] = function () {
            return this[k];
          };
          this['set' + pname] = function (value) {
            this[k] = value;
          };
        }
      }
    }
    getX() {
      if (this.getPosition() === 'L') {
        return 0;
      } else if (this.getPosition() === 'R') {
        return this.node.getWidth();
      } else if (this.getPosition() === 'T') {
        return this.node.getWidth() / 2;
      } else if (this.getPosition() === 'B') {
        return this.node.getWidth() / 2;
      } else if (this.getPosition() === 'C') {
        return this.node.getWidth() / 2;
      }
    }
    getY() {
      if (this.getPosition() === 'L') {
        return this.node.getHeight() / 2;
      } else if (this.getPosition() === 'R') {
        return this.node.getHeight() / 2;
      } else if (this.getPosition() === 'T') {
        return 0;
      } else if (this.getPosition() === 'B') {
        return this.node.getHeight();
      } else if (this.getPosition() === 'C') {
        return this.node.getHeight() / 2;
      }
    }
    getEdgeX() {
      if (this.getPosition() === 'L') {
        return -this._size;
      } else if (this.getPosition() === 'R') {
        return this.node.getWidth() + this.getSize();
      } else if (this.getPosition() === 'T') {
        return this.node.getWidth() / 2;
      } else if (this.getPosition() === 'B') {
        return this.node.getWidth() / 2;
      } else if (this.getPosition() === 'C') {
        return this.node.getWidth() / 2;
      }
    }
    getEdgeY() {
      if (this.getPosition() === 'L') {
        return this.node.getHeight() / 2;
      } else if (this.getPosition() === 'R') {
        return this.node.getHeight() / 2;
      } else if (this.getPosition() === 'T') {
        return -this._size;
      } else if (this.getPosition() === 'B') {
        return this.node.getHeight() + this.getSize();
      } else if (this.getPosition() === 'C') {
        return this.node.getHeight() / 2;
      }
    }
    draw() {
      if (this.node.anchorG) {
        this.el = this.node.anchorG.append('g');
        this.el.datum(this);
        this.el.attr('class', 'anG').attr('transform', `translate(${this.getX()},${this.getY()})`);
        this.anchorEl = this.el
          .append('svg:circle')
          .attr('r', this.getSize())
          .attr('class', 'anchor')
          //.attr('stroke', this.getStroke())
          //.attr('fill', '#FFFFFF')
          .attr('transform', 'scale(0)');
        this.node.canvas.watcher.add(this.node, ['width', 'height'], () => {
          this.el.attr('transform', `translate(${this.getX()},${this.getY()})`);
        });
        //初始化事件
        this.initEvent();
      }
    }
    hide() {
      this.anchorEl.attr('transform', `scale(0)`);
    }
    initEvent() {
      this.el
        .on('active', (event, d) => {
          let needActive = false;
          if (d.getDirection().indexOf('i') > -1) {
            //如果可以连入，有dragging线时才显示
            const linkList = d.canvas.getLinkByType('dragging');
            if (linkList && linkList.length > 0) {
              needActive = true;
            }
          }
          if (d.getDirection().indexOf('o') > -1) {
            //如果可以连出，没有dragging线时才显示
            const linkList = d.canvas.getLinkByType('dragging');
            if (!linkList || linkList.length <= 0) {
              needActive = true;
            }
          }
          if (needActive) {
            if (d.resetActiveHandler) {
              clearTimeout(d.resetActiveHandler);
              d.resetActiveHandler = null;
            }
            d.anchorEl.interrupt();
            d.el.attr('transform', `translate(${this.getX()},${this.getY()})`);
            d.anchorEl
              .transition()
              .duration(100)
              .attr('transform', `scale(1.5)`)
              .attr('stroke-width', '1.5')
              .attr('stroke-opacity', '1')
              .on('end', () => {});
          }
          //将anchor至于最前面
          d.node.anchorG.raise();
        })
        .on('unactive', (event, d) => {
          //延迟300毫秒退出active
          if (d.resetActiveHandler) {
            clearTimeout(d.resetActiveHandler);
            d.resetActiveHandler = null;
          }
          d.resetActiveHandler = setTimeout(() => {
            d.isActived = false;
            d.anchorEl.interrupt();
            d.anchorEl
              .transition()
              .duration(300)
              .attr('transform', `scale(0)`)
              .attr('stroke-width', '1.5')
              .attr('stroke-opacity', '1')
              .on('end', () => {});
          }, 300);
        })
        .on('mouseenter', (event, d) => {
          //if (!this.node.getIsDragging() && !this.node.getIsResizing()) {
          d.anchorEl.interrupt();
          d.anchorEl.transition().duration(100).attr('transform', `scale(1.5)`).attr('stroke-width', d.getSize()).attr('stroke-opacity', '0.3');
          //检测是否需要连线
          const linkList = d.canvas.getLinkByType('dragging');
          if (linkList && linkList.length > 0) {
            //如果正在拖拽中
            const draglink = linkList[0];
            if (linkList.circle == 'source') {
              //先已经存在拖动sourceCircle来改变连线的位子
              draglink.setSource(d.node.getUuid()); //设置起点到拖拽线中
              draglink.setSAnchor({ dir: d.getPosition() });
            } else {
              //1、现已经存在拖动targetCircle来改变连线的位子  2、新建连线
              draglink.setTarget(d.node.getUuid()); //设置终点到拖拽线中
              draglink.setTAnchor({ dir: d.getPosition() });
            }
          }
          //}
        })
        .on('mouseleave', (event, d) => {
          d.anchorEl.interrupt();
          d.anchorEl.transition().duration(100).attr('transform', `scale(1.5)`).attr('stroke-width', '1.5').attr('stroke-opacity', '1');
          //检测是否需要连线
          const linkList = d.canvas.getLinkByType('dragging');
          if (linkList && linkList.length) {
            //如果正在拖拽中
            const draglink = linkList[0];
            draglink.setTarget(null);
            draglink.setTAnchor(null);
          }
        });
      //绑定拖拽
      this.el.call(
        d3
          .drag()
          .on('start', (event, d) => {
            if (!this.dragLine && d.getDirection().indexOf('o') > -1) {
              this.dragLine = this.linkFactory.create('dragging', this.canvas, {
                source: this.node.getUuid(),
                sAnchor: {
                  dir: this.getPosition()
                }
              }); //设置拖出节点为起点
              if (this.dragLine) {
                this.dragLine.draw();
                this.dragLine.raise();
              }
            }
          })
          .on('drag', (event, d) => {
            if (this.dragLine) {
              const sx = this.node.getX() + this.getEdgeX();
              const sy = this.node.getY() + this.getEdgeY();
              let offsetNum = 10;
              let tx = this.node.getX() + event.x + offsetNum;
              let ty = this.node.getY() + event.y + offsetNum;
              /*拖拽线段缩短offset个像素，这样就不会因为线段盖在连接点上导致触发连接点的mouseleave事件 */
              const offset = 20;
              const longEdge = Math.sqrt(Math.pow(ty - sy, 2) + Math.pow(tx - sx, 2));
              const offsetY = (Math.abs(ty - sy) / longEdge) * offset;
              const offsetX = (Math.abs(tx - sx) / longEdge) * offset;
              tx += sx >= tx ? Math.min(sx - tx, offsetX) : -Math.min(tx - sx, offsetX);
              ty += sy >= ty ? Math.min(sy - ty, offsetY) : -Math.min(ty - sy, offsetY);
              if (!isNaN(tx) && !isNaN(ty)) {
                this.dragLine.updatePath(sx, sy, tx, ty);
              }
            }
          })
          .on('end', (event, d) => {
            if (this.dragLine) {
              if (this.dragLine.getSource() && this.dragLine.getTarget()) {
                //如果拖拽线有起点和终点，则代表可以连线
                const sourceNode = this.canvas.getElementByUuid(this.dragLine.getSource());
                const targetNode = this.canvas.getElementByUuid(this.dragLine.getTarget());
                if (sourceNode && targetNode) {
                  //创建连接
                  sourceNode.connect(this.dragLine.getSAnchor(), targetNode, this.dragLine.getTAnchor(), sourceNode);
                }
              }
              this.dragLine.destory();
              this.dragLine = null;
            }
          })
      );
    }
  }
  global.Anchor = Anchor;
});
