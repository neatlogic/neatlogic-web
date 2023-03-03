/**topo连线类**/
(function(global, factory) {
  factory((global.LinkBase = global.LinkBase || {}), global);
})(window, function(exports, global) {
  'use strict';
  class LinkBase {
    constructor(canvas, config) {
      if (!canvas) {
        console.error('请定义画布');
        return;
      }
      if (!config) {
        console.error('请提供节点定义');
        return;
      }
      canvas.links.push(this); //将自己添加到画布连线列表里
      /**
       * 重要说明：
       * ======================================================================
       * 两下划线开头的属性，代表需要在tojson中序列化，单下划线只是代表私有属性，不需要序列化
       */
      this.canvas = canvas; //画布对象
      this.config = config; //原始配置
      this.getSet = {}; //存储属性旧值，方便比对
      this.getSetConfig = {}; //存储旧config值
      this.status = { selected: false }; //状态
      this.type = 'link'; //类型
      if (config.source) {
        this.source = this.canvas.getElementByUuid(config.source);
        if (this.source) {
          this.source.links.push(this); //将自己添加到节点连线记录里，当节点坐标发生变化重绘线段
        } else {
          console.log('起点节点', config.source, '不存在');
        }
      }
      if (config.target) {
        this.target = this.canvas.getElementByUuid(config.target);
        if (this.target) {
          this.target.links.push(this); //将自己添加到节点连线记录里，当节点坐标发生变化重绘线段
        } else {
          console.log('终点节点', config.target, '不存在');
        }
      }
      this._path = config.path; //线路径
      this._points = []; //连线点
      this._adjustAnchors = []; //修正锚点
      this._config = config; //线路径
      this._class = 'linkPath'; //默认样式
      this._opacity = 0.9; //透明度
      this._markerend = true; //是否有箭头
      this._markerstart = true; //是否有起点
      this._arrowreverse = false; //箭头是否翻转
      this._isReal = true; //是否真实连线（是的话nextnode会统计此连线关联的节点）
      this._isCurve = true; //是否需要根据锚点拐弯
      this._isDeletable = true; //是否允许删除
      this._isAnimated = true; //划线时是否有动画
      this._isAdjustAnchor = true; //是否有修正锚点
      this._sx = 0; //起点x坐标
      this._sy = 0; //起点y坐标
      this._tx = 0; //终点x坐标
      this._ty = 0; //终点y坐标
      //是否允许删除
      if (canvas.config.hasOwnProperty('link.deleteable')) {
        if (typeof canvas.config['link.deleteable'] === 'function') {
          this._isDeleteable = canvas.config['link.deleteable'](this);
        } else {
          this._isDeleteable = !!canvas.config['link.deleteable'];
        }
      } else if (this.config.hasOwnProperty('deleteable')) {
        this._isDeleteable = !!this.config['deleteable'];
      } else {
        this._isDeleteable = true;
      }
      //是否允许选中
      if (canvas.config.hasOwnProperty('link.selectable')) {
        if (typeof canvas.config['link.selectable'] === 'function') {
          this._isSelectable = canvas.config['link.selectable'](this);
        } else {
          this._isSelectable = !!canvas.config['link.selectable'];
        }
      } else if (this.config.hasOwnProperty('selectable')) {
        this._isSelectable = !!this.config['selectable'];
      } else {
        this._isSelectable = true;
      }
      this.__uuid = config.uuid || Topo.generateUuid(); //唯一id
      if (!this.config.uuid) {
        this.config.uuid = this.__uuid;
      }
      this.__type = config.type; //连线类型
      this.__name = config.name || ''; //连线名称
      this.__style = config.style || canvas.config['link.style'] || 'soild'; //连线风格，solid或dotted
      this.__target = config.target; //目标节点
      this.__source = config.source; //开始节点
      this.__tAnchor = config.tAnchor; //目标连线点
      this.__sAnchor = config.sAnchor; //开始连线点
      this.__movecircle = false; //连线转态是否选中，用来进行移动
      this.__adjustPath = config.adjustPath; //修正过的路径
      this.__adjustPoints = config.adjustPoints; //修正后的线段点
      this.__animationTimes = config.animationTimes || canvas.config['link.animationTimes'] || 0; //动画次数，-1代表无限循环，0代表不展示动画
      this.__stroke = config.stroke || canvas.config['link.stroke']; //节点边框颜色; //线段颜色，默认跟随class
      //动态创建所有get set函数
      for (const k in this) {
        if (k.startsWith('__')) {
          let pname = k.substring(2);
          pname = pname.replace(pname[0], pname[0].toUpperCase());
          this['get' + pname] = function() {
            return this[k];
          };
          this['set' + pname] = function(value) {
            this[k] = value;
            return this;
          };
        } else if (k.startsWith('_')) {
          let pname = k.substring(1);
          pname = pname.replace(pname[0], pname[0].toUpperCase());
          this['get' + pname] = function() {
            return this[k];
          };
          this['set' + pname] = function(value) {
            this[k] = value;
            return this;
          };
        }
      }
      //设置属性双向绑定
      this.initBinding();
    }
    moveAnchor() {
      let path = d3.path();
      const points = this.getPoints();
      path.moveTo(this.getSx(), this.getSy());
      let radius = 5; //圆角弧度
      for (let i = 1; i < points.length; i++) {
        path.arcTo(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y, radius);
      }
      path.lineTo(this.getTx(), this.getTy());
      this.setAdjustPath(path.toString());
      this.setAdjustPoints(points);
      this.setPath(path.toString());
    }
    draw() {
      if (this.el) {
        return;
      }
      const canvasEl = this.canvas.zoomG; //在zoomG里创建所有元素
      this.el = canvasEl.append('g');
      this.el.datum(this);
      this.el.attr('class', 'linkG');
      //将线置于最低层
      this.el.lower();
      //主线
      this.linkEl = this.el
        .append('path')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('fill', 'none')
        .attr('id', `link${this.getUuid()}`);
      //.attr('mask', `url(#link-mask${this.getUuid()})`)

      //用于捕获事件和按钮定位
      //添加顺序在阴影线后面，可以捕获mouseenter事件
      this.tractionLinkEl = this.el
        .append('path')
        //.attr('stroke-linecap', 'round')
        //.attr('stroke-linejoin', 'round')//圆边会导致计算offset不准确
        .attr('stroke-opacity', '0')
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 20) //宽度需要更宽
        .attr('id', `link-traction${this.getUuid()}`);

      this.updatePath();

      //触发划线动画，需要在updatePath之后做，因为需要d属性
      if (this.getIsAnimated()) {
        this.animateEl = this.el
          .append('path')
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .attr('class', 'maskPath')
          .attr('fill', 'none')
          .attr('stroke-width', 2)
          .attr('d', this.getPath());
        this.animateEl
          .attr('stroke-dasharray', `${this.getTotalLength()}`)
          .attr('stroke-dashoffset', `0`)
          .transition('animation')
          .duration(`${Math.min(this.getTotalLength() / 0.5, 500)}`)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', `${-this.getTotalLength()}`)
          .on('end', d => {
            this.animateEl.remove();
            this.setAnimation();
          });
      } else {
        this.setAnimation();
      }

      // 绑定事件
      this.initEvent();

      //重新设置一遍属性，触发PH set方法进行绘制
      for (var k in this.getSet) {
        this[k] = this.getSet[k];
      }
    }
    setAnimation() {
      if (this.getAnimationTimes() !== 0) {
        if (!this.animationEl) {
          this.animationEl = this.el
            .append('path')
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('class', 'maskPath')
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .attr('d', this.getPath());
        }
        this.animationEl
          .attr('stroke-dasharray', `${this.getTotalLength()}`)
          .attr('stroke-dashoffset', `${this.getTotalLength()}`)
          .transition('running')
          .duration(Math.max(500, this.getTotalLength() * 2))
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', `${-this.getTotalLength()}`)
          .on('end', d => {
            this.animationPlayTime = (this.animationPlayTime || 0) + 1;
            if (this.getAnimationTimes() === -1 || this.animationPlayTime < this.getAnimationTimes()) {
              this.setAnimation();
            }
          });
      }
    }
    raise() {
      this.el.raise();
    }
    lower() {
      this.el.lower();
    }
    selectedFn() {
      if (typeof this.canvas.config['link.selectedFn'] == 'function') {
        this.canvas.config['link.selectedFn'](this);
      }
    } //选中后函数
    unselectFn() {
      if (typeof this.canvas.config['link.unselectFn'] == 'function') {
        this.canvas.config['link.unselectFn'](this);
      }
    } //取消选中后函数
    removeFn(param) {
      if (typeof this.canvas.config['link.removeFn'] == 'function') {
        this.canvas.config['link.removeFn'](this, param);
      }
    }
    select() {
      this.canvas.nodes.forEach(element => {
        element.unselect();
      });
      this.canvas.groups.forEach(element => {
        element.unselect();
      });
      this.canvas.links.forEach(element => {
        if (element != this) {
          element.unselect();
        }
      });

      if (!this.status.selected) {
        //添加选中阴影
        //在tractionLinkEl前插入，防止tractionLinkEl无法捕捉mouseenter事件
        if (!this.shadowLinkEl) {
          this.shadowLinkEl = this.el
            .insert('path', 'path:nth-child(1)')
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-opacity', '0.3')
            .attr('fill', 'none')
            .attr('stroke-width', 8)
            .attr('class', this.getClass())
            .attr('d', this.getPath());
          this.raise();
        }
        //显示选中锚点
        if (this.adjustAnchorElList) {
          this.adjustAnchorElList.forEach(anchor => {
            anchor.attr('opacity', 1);
          });
        }
        if (this.selectedFn && typeof this.selectedFn == 'function') {
          this.selectedFn();
        }
        this.status.selected = true;
        this.setMovecircle(true);
      }
    }
    unselect() {
      if (this.status.selected) {
        //删除选中阴影
        if (this.shadowLinkEl) {
          this.shadowLinkEl.remove();
          this.shadowLinkEl = null;
        }
        //隐藏选中锚点
        if (this.adjustAnchorElList) {
          this.adjustAnchorElList.forEach(anchor => {
            anchor.attr('opacity', 0);
          });
        }
        if (this.unselectFn && typeof this.unselectFn === 'function') {
          this.unselectFn();
        }
        this.status.selected = false;
        this.setMovecircle(false);
      }
    }
    /**
     * 获取连线总长度
     */
    getTotalLength() {
      return this.linkEl.node().getTotalLength();
    }
    initEvent() {}
    initBinding() {
      //创建外来数据双向绑定，外面属性变化自动修改节点属性
      let bindConfigSetting = {};
      for (const p in this) {
        if (p.startsWith('__')) {
          const k = p.substr(2);
          this.getSetConfig[k] = this.config[k];
          const that = this;
          bindConfigSetting[k] = {
            get: function() {
              return that.getSetConfig[k];
            },
            set: function(value) {
              if (that.getSetConfig[k] !== value) {
                that['__' + k] = value;
                that.getSetConfig[k] = value;
              }
            }
          };
        }
      }
      Object.defineProperties(this.config, bindConfigSetting);
      //创建节点属性双向绑定，节点属性变化自动触发ph中的函数修改SVG
      let bindSetting = {};
      for (const k in this) {
        if (k.startsWith('__') || k.startsWith('_')) {
          let ak = '';
          if (k.startsWith('__')) {
            ak = k.substring(2); //去掉前缀，PH里的名字是没前缀的
          } else if (k.startsWith('_')) {
            ak = k.substring(1); //去掉前缀，PH里的名字是没前缀的
          }
          this.getSet[k] = this[k];
          const that = this;
          bindSetting[k] = {
            get: function() {
              return that.getSet[k];
            },
            set: function(value) {
              if (that.getSet[k] !== value) {
                that.getSet[k] = value;
              }
              if (PH['link.' + ak] && typeof PH['link.' + ak] === 'function') {
                PH['link.' + ak](that, value);
                this.canvas.watcher.call('node.' + ak);
              }
            }
          };
        }
      }
      Object.defineProperties(this, bindSetting);
    }
    //获取创建连线时的config对象，外部直接修改这个对象的值即可调用topo.ph中相关属性的变更函数
    getLinkConfig() {
      return this.config;
    }
    getSourceNode() {
      return this.canvas.getElementByUuid(this.getSource());
    }
    getTargetNode() {
      return this.canvas.getElementByUuid(this.getTarget());
    }
    getPosition() {
      let config = null;
      if (this.getSource() && this.getTarget()) {
        const sourceNode = this.canvas.getElementByUuid(this.getSource());
        const targetNode = this.canvas.getElementByUuid(this.getTarget());
        if (sourceNode && targetNode) {
          const sourceAnchor = sourceNode.getAnchor(this.getSAnchor().dir);
          const targetAnchor = targetNode.getAnchor(this.getTAnchor().dir);
          if (sourceAnchor && targetAnchor) {
            config = {};
            config.sx = sourceNode.getX() + sourceAnchor.getEdgeX();
            config.sy = sourceNode.getY() + sourceAnchor.getEdgeY();
            config.tx = targetNode.getX() + targetAnchor.getEdgeX();
            config.ty = targetNode.getY() + targetAnchor.getEdgeY();
            let newSx = null,
              newSy = null,
              newTx = null,
              newTy = null;
            if (sourceAnchor.getPosition() === 'C') {
              if (sourceNode.getShape() === 'circle') {
                //圆半径
                const r = sourceNode.getSize();
                //边框宽度
                const strokewidth = sourceNode.getStrokewidth() || 0;
                //横边长度
                const xlen = Math.abs(config.tx - config.sx);
                //竖边长度
                const ylen = Math.abs(config.ty - config.sy);
                //斜边长度
                const bevel = Math.sqrt(Math.pow(xlen, 2) + Math.pow(ylen, 2));
                const rate = (r + strokewidth) / bevel;
                if (config.sx > config.tx) {
                  newSx = config.sx - xlen * rate;
                } else if (config.sx < config.tx) {
                  newSx = config.sx + xlen * rate;
                }
                if (config.sy > config.ty) {
                  newSy = config.sy - ylen * rate;
                } else if (config.sy < config.ty) {
                  newSy = config.sy + ylen * rate;
                }
              } else if (sourceNode.getShape() === 'rect') {
                //边框宽度
                const strokewidth = sourceNode.getStrokewidth() || 0;
                //横边长度
                const xlen = Math.abs(config.tx - config.sx);
                //竖边长度
                const ylen = Math.abs(config.ty - config.sy);
                //长宽比例
                const rate = ylen / xlen;
                if (rate <= sourceNode.getHeight() / sourceNode.getWidth()) {
                  if (config.sx > config.tx) {
                    newSx = config.sx - sourceNode.getWidth() / 2 - strokewidth;
                  } else if (config.sx < config.tx) {
                    newSx = config.sx + sourceNode.getWidth() / 2 + strokewidth;
                  }
                  if (config.sy > config.ty) {
                    newSy = config.sy - (sourceNode.getWidth() / 2) * rate - strokewidth;
                  } else if (config.sy < config.ty) {
                    newSy = config.sy + (sourceNode.getWidth() / 2) * rate + strokewidth;
                  }
                } else {
                  if (config.sx > config.tx) {
                    newSx = config.sx - sourceNode.getHeight() / 2 / rate - strokewidth;
                  } else if (config.sx < config.tx) {
                    newSx = config.sx + sourceNode.getHeight() / 2 / rate + strokewidth;
                  }
                  if (config.sy > config.ty) {
                    newSy = config.sy - sourceNode.getHeight() / 2 - strokewidth;
                  } else if (config.sy < config.ty) {
                    newSy = config.sy + sourceNode.getHeight() / 2 + strokewidth;
                  }
                }
              }
            }
            if (targetAnchor.getPosition() === 'C') {
              if (targetNode.getShape() === 'circle') {
                //圆半径
                const r = targetNode.getSize();
                //边框宽度
                const strokewidth = targetNode.getStrokewidth() || 0;
                //横边长度
                const xlen = Math.abs(config.tx - config.sx);
                //竖边长度
                const ylen = Math.abs(config.ty - config.sy);
                //斜边长度
                const bevel = Math.sqrt(Math.pow(xlen, 2) + Math.pow(ylen, 2));
                const rate = (r + strokewidth) / bevel;
                if (config.sx > config.tx) {
                  newTx = config.tx + xlen * rate;
                } else if (config.sx < config.tx) {
                  newTx = config.tx - xlen * rate;
                }
                if (config.sy > config.ty) {
                  newTy = config.ty + ylen * rate;
                } else if (config.sy < config.ty) {
                  newTy = config.ty - ylen * rate;
                }
              } else if (targetNode.getShape() === 'rect') {
                //边框宽度
                const strokewidth = targetNode.getStrokewidth() || 0;
                //横边长度
                const xlen = Math.abs(config.tx - config.sx);
                //竖边长度
                const ylen = Math.abs(config.ty - config.sy);
                //长宽比例
                const rate = ylen / xlen;
                if (rate <= targetNode.getHeight() / targetNode.getWidth()) {
                  if (config.sx > config.tx) {
                    newTx = config.tx + targetNode.getWidth() / 2 + strokewidth;
                  } else if (config.sx < config.tx) {
                    newTx = config.tx - targetNode.getWidth() / 2 - strokewidth;
                  }
                  if (config.sy > config.ty) {
                    newTy = config.ty + (targetNode.getWidth() / 2) * rate + strokewidth;
                  } else if (config.sy < config.ty) {
                    newTy = config.ty - (targetNode.getWidth() / 2) * rate - strokewidth;
                  }
                } else {
                  if (config.sx > config.tx) {
                    newTx = config.tx + targetNode.getHeight() / 2 / rate + strokewidth;
                  } else if (config.sx < config.tx) {
                    newTx = config.tx - targetNode.getHeight() / 2 / rate - strokewidth;
                  }
                  if (config.sy > config.ty) {
                    newTy = config.ty + targetNode.getHeight() / 2 + strokewidth;
                  } else if (config.sy < config.ty) {
                    newTy = config.ty - targetNode.getHeight() / 2 - strokewidth;
                  }
                }
              }
            }
            if (newSx != null) {
              config.sx = newSx;
            }
            if (newSy != null) {
              config.sy = newSy;
            }
            if (newTx != null) {
              config.tx = newTx;
            }
            if (newTy != null) {
              config.ty = newTy;
            }
          }
        }
      }
      return config;
    }
    updatePath(sx, sy, tx, ty) {
      if (typeof sx == 'undefined' || typeof sy == 'undefined' || typeof tx == 'undefined' || typeof ty == 'undefined') {
        let positionConfig = this.getPosition();
        if (positionConfig) {
          sx = positionConfig.sx;
          sy = positionConfig.sy;
          tx = positionConfig.tx;
          ty = positionConfig.ty;
        }
      }
      if (typeof sx != 'undefined' && typeof sy != 'undefined' && typeof tx != 'undefined' && typeof ty != 'undefined') {
        var linkFn = d3
          .line()
          .x(function(d) {
            return d.x;
          })
          .y(function(d) {
            return d.y;
          });
        if (this.getSAnchor() && this.getTAnchor() && this.getIsCurve()) {
          const tsCurve = context => {
            return new TsCurve(context, this);
          };
          linkFn.curve(tsCurve);
        }

        let pos = [];
        pos.push({ x: sx, y: sy }, { x: tx, y: ty });
        const d = linkFn(pos);
        this.setPath(d, sx, sy, tx, ty); //保存路径数据
        //更新连线拖动元素的位置
        this.sourceCircle && this.sourceCircle.attr('cx', sx).attr('cy', sy);
        this.sourceCircle && this.targetCircle.attr('cx', tx).attr('cy', ty);
      }
      //清理修正信息，让线段恢复正常状态
      this.setAdjustPath(null);
      this.setAdjustPoints(null);
    }
    destory(param) {
      this.el.remove();
      if (this.animationEl) {
        this.animationEl.remove();
      }
      //删除节点对象
      this.canvas.nodes.forEach(node => {
        //删除对象
        const lindex = node.links.findIndex(item => Object.is(item, this));
        if (lindex >= 0) {
          node.links.splice(lindex, 1);
        }
      });
      //删除对象
      const li = this.canvas.links.findIndex(item => Object.is(item, this));
      if (li >= 0) {
        this.canvas.links.splice(li, 1);
      }
      //删除数据
      const ldi = this.canvas.canvasJson.links.findIndex(item => item['uuid'] === this.getUuid());
      if (ldi >= 0) {
        this.canvas.canvasJson.links.splice(ldi, 1);
      }
      if (this.constructor.name != 'Dragging' && this.removeFn && typeof this.removeFn == 'function') {
        this.removeFn(param);
      }
    }
    toJson() {
      let json = {};
      for (const k in this) {
        if (k.startsWith('__')) {
          json[k.substr(2)] = this[k];
        }
      }
      // json.type = this.constructor.name;
      return json;
    }
    //屏蔽的原因是打包导致name发生变化
    // getType() {
    //   return this.constructor.name.toLowerCase();
    // }
  }
  global.LinkBase = LinkBase;
});
