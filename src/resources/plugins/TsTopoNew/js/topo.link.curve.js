(function(global, factory) {
  factory((global.Link = global.Link || {}), global);
})(window, function(exports, global) {
  'use strict';
  class TsCurve {
    constructor(context, link) {
      this.context = context;
      this.link = link;
      this.sx = 0;
      this.sy = 0;
      this.tx = 0;
      this.ty = 0;
      this.sdir = link.getSAnchor().dir;
      this.tdir = link.getTAnchor().dir;
    }

    areaStart() {
      this._line = 0;
    }
    areaEnd() {
      this._line = NaN;
    }
    lineStart() {
      this._x = this._y = NaN;
      this._point = 0;
    }
    lineEnd() {
      let sy = this.sy;
      let sx = this.sx;
      let ty = this.ty;
      let tx = this.tx;
      let radius = 5; //圆角弧度
      const padding = 15; //偏离锚点的距离

      //移动到起点
      this.context.moveTo(this.sx, this.sy);
      //根据锚点位置重置起点和终点坐标
      if (this.sdir === 'L') {
        sx -= padding;
      } else if (this.sdir === 'R') {
        sx += padding;
      } else if (this.sdir === 'T') {
        sy -= padding;
      } else if (this.sdir === 'B') {
        sy += padding;
      }

      if (this.tdir === 'L') {
        tx -= padding;
      } else if (this.tdir === 'R') {
        tx += padding;
      } else if (this.tdir === 'T') {
        ty -= padding;
      } else if (this.tdir === 'B') {
        ty += padding;
      }
      //this.context.lineTo(sx, sy);
      const minYR = parseInt(Math.abs(ty - sy) / 3);
      const minXR = parseInt(Math.abs(tx - sx) / 3);
      radius = Math.min(radius, Math.min(Math.abs(minYR), Math.abs(minXR)));
      const points = this.generatePoints();
      this.link.setPoints(points);
      for (let i = 1; i < points.length; i++) {
        this.context.arcTo(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y, radius);
      }
      this.context.lineTo(this.tx, this.ty);
    }
    point(x, y) {
      //记录开始节点和结束节点坐标，在lineEnd里统一画线
      if (this._point == 0) {
        this.sx = x;
        this.sy = y;
        this.link.setSx(x);
        this.link.setSy(y);
        this._point++;
      } else if (this._point == 1) {
        this.tx = x;
        this.ty = y;
        this.link.setTx(x);
        this.link.setTy(y);
      }
    }
    generatePoints() {
      let points = [];
      let sy = this.sy;
      let sx = this.sx;
      let ty = this.ty;
      let tx = this.tx;
      const padding = 15; //偏离锚点的距离

      //根据锚点位置重置起点和终点坐标
      if (this.sdir === 'L') {
        sx -= padding;
      } else if (this.sdir === 'R') {
        sx += padding;
      } else if (this.sdir === 'T') {
        sy -= padding;
      } else if (this.sdir === 'B') {
        sy += padding;
      }
      points.push({ x: sx, y: sy });
      if (this.tdir === 'L') {
        tx -= padding;
      } else if (this.tdir === 'R') {
        tx += padding;
      } else if (this.tdir === 'T') {
        ty -= padding;
      } else if (this.tdir === 'B') {
        ty += padding;
      }
      let midX = (sx + tx) * 0.5;
      let midY = (sy + ty) * 0.5;
      //修正锚点列表，存放在第几段线中加入锚点
      let anchors = [];
      if (this.sdir == 'T') {
        //起点是上连接点
        if (sy <= ty) {
          if (sx <= tx) {
            //终点在起点右下角
            if (this.tdir == 'T' || this.tdir == 'R') {
              points.push({ x: tx, y: sy });
              if (this.tdir == 'T') {
                anchors[0] = 'v';
              } else {
                anchors[0] = 'v';
                anchors[1] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'L') {
              points.push({ x: midX, y: sy });
              points.push({ x: midX, y: ty });
              if (this.tdir == 'B') {
                anchors[0] = 'v';
                anchors[1] = 'h';
                anchors[2] = 'v';
              } else {
                anchors[0] = 'v';
                anchors[1] = 'h';
              }
            }
          } else {
            //终点在起点左下角
            if (this.tdir == 'T' || this.tdir == 'L') {
              points.push({ x: tx, y: sy });
              if (this.tdir == 'T') {
                anchors[0] = 'v';
              } else {
                anchors[0] = 'v';
                anchors[1] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'R') {
              points.push({ x: midX, y: sy });
              points.push({ x: midX, y: ty });
              if (this.tdir == 'B') {
                anchors[0] = 'v';
                anchors[1] = 'h';
                anchors[2] = 'v';
              } else {
                anchors[0] = 'v';
                anchors[1] = 'h';
              }
            }
          }
        } else {
          if (sx <= tx) {
            //终点在起点右上角
            if (this.tdir == 'T' || this.tdir == 'L') {
              points.push({ x: sx, y: ty });
              if (this.tdir == 'T') {
                anchors[1] = 'v';
              }
            } else if (this.tdir == 'B' || this.tdir == 'R') {
              points.push({ x: sx, y: midY });
              points.push({ x: tx, y: midY });
              if (this.tdir == 'B') {
                anchors[1] = 'v';
              } else {
                anchors[1] = 'v';
                anchors[2] = 'h';
              }
            }
          } else {
            //终点在起点左上角
            if (this.tdir == 'T' || this.tdir == 'R') {
              points.push({ x: sx, y: ty });
              if (this.tdir == 'T') {
                anchors[1] = 'v';
              }
            } else if (this.tdir == 'B' || this.tdir == 'L') {
              points.push({ x: sx, y: midY });
              points.push({ x: tx, y: midY });
              if (this.tdir == 'B') {
                anchors[1] = 'v';
              } else {
                anchors[1] = 'v';
                anchors[2] = 'h';
              }
            }
          }
        }
      } else if (this.sdir == 'B') {
        //起点是下连接点
        if (sy <= ty) {
          if (sx <= tx) {
            //终点在起点右下角
            if (this.tdir == 'T' || this.tdir == 'R') {
              points.push({ x: sx, y: midY });
              points.push({ x: tx, y: midY });
              if (this.tdir == 'T') {
                anchors[1] = 'v';
              } else {
                anchors[1] = 'v';
                anchors[2] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'L') {
              points.push({ x: sx, y: ty });
              if (this.tdir == 'B') {
                anchors[1] = 'v';
              }
            }
          } else {
            //终点在起点左下角
            if (this.tdir == 'T' || this.tdir == 'L') {
              points.push({ x: sx, y: midY });
              points.push({ x: tx, y: midY });
              if (this.tdir == 'T') {
                anchors[1] = 'v';
              } else {
                anchors[1] = 'v';
                anchors[2] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'R') {
              points.push({ x: sx, y: ty });
              if (this.tdir == 'B') {
                anchors[1] = 'v';
              }
            }
          }
        } else {
          if (sx <= tx) {
            //终点在起点右上角
            if (this.tdir == 'T' || this.tdir == 'L') {
              points.push({ x: midX, y: sy });
              points.push({ x: midX, y: ty });
              if (this.tdir == 'T') {
                anchors[0] = 'v';
                anchors[1] = 'h';
                anchors[2] = 'v';
              } else {
                anchors[0] = 'v';
                anchors[1] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'R') {
              points.push({ x: tx, y: sy });
              if (this.tdir == 'B') {
                anchors[0] = 'v';
              } else {
                anchors[0] = 'v';
                anchors[1] = 'h';
              }
            }
          } else {
            //终点在起点左上角
            if (this.tdir == 'T' || this.tdir == 'R') {
              points.push({ x: midX, y: sy });
              points.push({ x: midX, y: ty });
              if (this.tdir == 'T') {
                anchors[0] = 'v';
                anchors[1] = 'h';
                anchors[2] = 'v';
              } else {
                anchors[0] = 'v';
                anchors[1] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'L') {
              points.push({ x: tx, y: sy });
              if (this.tdir == 'B') {
                anchors[0] = 'v';
              } else {
                anchors[0] = 'v';
                anchors[1] = 'h';
              }
            }
          }
        }
      } else if (this.sdir == 'R') {
        if (sy <= ty) {
          if (sx <= tx) {
            //终点在起点右下角
            if (this.tdir == 'T' || this.tdir == 'R') {
              points.push({ x: tx, y: sy });
              if (this.tdir == 'R') {
                anchors[1] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'L') {
              points.push({ x: midX, y: sy });
              points.push({ x: midX, y: ty });
              if (this.tdir == 'B') {
                anchors[1] = 'h';
                anchors[2] = 'v';
              } else {
                anchors[1] = 'h';
              }
            }
          } else {
            //终点在起点左下角
            if (this.tdir == 'T' || this.tdir == 'L') {
              points.push({ x: sx, y: midY });
              points.push({ x: tx, y: midY });
              if (this.tdir == 'T') {
                anchors[0] = 'h';
                anchors[1] = 'v';
              } else {
                anchors[0] = 'h';
                anchors[1] = 'v';
                anchors[2] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'R') {
              points.push({ x: sx, y: ty });
              if (this.tdir == 'B') {
                anchors[0] = 'h';
                anchors[1] = 'v';
              } else {
                anchors[0] = 'h';
              }
            }
          }
        } else {
          if (sx <= tx) {
            //终点在起点右上角
            if (this.tdir == 'T' || this.tdir == 'L') {
              points.push({ x: midX, y: sy });
              points.push({ x: midX, y: ty });
              if (this.tdir == 'T') {
                anchors[1] = 'h';
                anchors[2] = 'v';
              } else {
                anchors[1] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'R') {
              points.push({ x: tx, y: sy });
              if (this.tdir == 'R') {
                anchors[1] = 'h';
              }
            }
          } else {
            //终点在起点左上角
            if (this.tdir == 'T' || this.tdir == 'R') {
              points.push({ x: sx, y: ty });
              if (this.tdir == 'T') {
                anchors[0] = 'h';
                anchors[1] = 'v';
              } else {
                anchors[0] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'L') {
              points.push({ x: sx, y: midY });
              points.push({ x: tx, y: midY });
              if (this.tdir == 'B') {
                anchors[0] = 'h';
                anchors[1] = 'v';
              } else {
                anchors[0] = 'h';
                anchors[1] = 'v';
                anchors[2] = 'h';
              }
            }
          }
        }
      } else if (this.sdir == 'L') {
        if (sy <= ty) {
          if (sx <= tx) {
            //终点在起点右下角
            if (this.tdir == 'T' || this.tdir == 'R') {
              points.push({ x: sx, y: midY });
              points.push({ x: tx, y: midY });
              if (this.tdir == 'T') {
                anchors[0] = 'h';
                anchors[1] = 'v';
              } else {
                anchors[0] = 'h';
                anchors[1] = 'v';
                anchors[2] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'L') {
              points.push({ x: sx, y: ty });
              if (this.tdir == 'B') {
                anchors[0] = 'h';
                anchors[1] = 'v';
              } else {
                anchors[0] = 'h';
              }
            }
          } else {
            //终点在起点左下角
            if (this.tdir == 'T' || this.tdir == 'L') {
              points.push({ x: tx, y: sy });
              if (this.tdir == 'L') {
                anchors[1] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'R') {
              points.push({ x: midX, y: sy });
              points.push({ x: midX, y: ty });
              if (this.tdir == 'B') {
                anchors[1] = 'h';
                anchors[2] = 'v';
              } else {
                anchors[1] = 'h';
              }
            }
          }
        } else {
          if (sx <= tx) {
            //终点在起点右上角
            if (this.tdir == 'T' || this.tdir == 'L') {
              points.push({ x: sx, y: ty });
              if (this.tdir == 'T') {
                anchors[0] = 'h';
                anchors[1] = 'v';
              } else {
                anchors[0] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'R') {
              points.push({ x: sx, y: midY });
              points.push({ x: tx, y: midY });
              if (this.tdir == 'B') {
                anchors[0] = 'h';
                anchors[1] = 'v';
              } else {
                anchors[0] = 'h';
                anchors[1] = 'v';
                anchors[2] = 'h';
              }
            }
          } else {
            //终点在起点左上角
            if (this.tdir == 'T' || this.tdir == 'R') {
              points.push({ x: midX, y: sy });
              points.push({ x: midX, y: ty });
              if (this.tdir == 'T') {
                anchors[1] = 'h';
                anchors[2] = 'v';
              } else {
                anchors[1] = 'h';
              }
            } else if (this.tdir == 'B' || this.tdir == 'L') {
              points.push({ x: tx, y: sy });
              if (this.tdir == 'L') {
                anchors[1] = 'h';
              }
            }
          }
        }
      }
      /*if (this.tdir !== 'C') {
        points.push({ x: tx, y: ty });
      }
      if (this.tdir === 'C') {
        //如果anchor在中心点，连线终点需要连在图形边缘
        if (this.link.getTargetNode().getShape() === 'circle') {
          //圆半径
          const r = this.link.getTargetNode().getSize();
          //斜边长度
          const bevel = Math.sqrt(Math.pow(this.tx - this.sx, 2) + Math.pow(this.ty - this.sy, 2));
          const ntx = ((this.tx - this.sx) * (bevel - r)) / bevel;
          const nty = ((this.ty - this.sy) * (bevel - r)) / bevel;
          console.log('newX:', ntx, 'oldX:', this.tx);
          console.log('newY:', nty, 'oldY:', this.ty);
          points.push({ x: ntx, y: nty });
        } else {
        }
      } else {
        points.push({ x: this.tx, y: this.ty });
      }*/
      if (this.tdir !== 'C') {
        points.push({ x: tx, y: ty });
      }
      points.push({ x: this.tx, y: this.ty });
      this.link.setAdjustAnchors(anchors);
      return points;
    }
  }
  global.TsCurve = TsCurve;
});
