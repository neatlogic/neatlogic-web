(function (global, factory) {
  factory((global.TsTopo = global.TsTopo || {}), global);
})(window, function (exports, global) {
  'use strict';
  class Topo {
    //两下划线开头的属性，代表需要在tojson中序列化，单下划线只是代表私有属性，需要通过getXX()方法获取，但不需要序列化，没有下划线代表公共属性
    constructor(vueSelector, config, containerVue) {
      if (!vueSelector) {
        console.error('请提供画布容器');
        return;
      }
      this.nodes = [];
      this.groups = [];
      this.links = [];

      this.__uuid = Topo.generateUuid();
      this._container = vueSelector;
      this.containerVue = containerVue || null; //父类容器的vue 可以不用传主要是用于节点或者连线，需要外部数据的判断
      this.config = config; //topo图的配置（不包含数据，数据通过fromJson传入）
      this.getSet = {}; //存储属性旧值，方便比对
      this.getSetConfig = {}; //存储旧config值
      this.getSetCanvasJson = {}; //存储旧的canvasjson值
      this._allowBrushSelect = config['canvas.allowbrushselect'] || false; //是否允许框选
      this._width = config['canvas.width'] || '100%'; //画布宽度
      this._height = config['canvas.height'] || '100%'; //画布高度
      this._classname = config['canvas.class'] || ''; //画布css样式
      this._backgroundColor = config['canvas.backgroundColor'] || ''; //画布css样式;
      this._backgroundImage = config['canvas.backgroundImage'] || ''; //画布css样式;
      this._backgroundResizable = config['canvas.backgroundResizable'] || false; //背景是否允许拖动
      this._backgroundLayout = config['canvas.backgroundLayout'] || ''; //背景布局
      this._isAutoAdjust = config['canvas.autoadjust'] || false; //是否显示辅助线自动对齐
      this._linkType = config['link.type']; //连线类型，如果需要实现全局切换连线类型功能，可以使用此属性
      this._dom = null; //d3生成的svg对象
      this.groupFactory = new GroupFactory();
      this.nodeFactory = new NodeFactory();
      this.linkFactory = new LinkFactory();
      this.watcher = new Watcher(); //属性监听器

      //动态创建所有get set函数
      for (const k in this) {
        if (k.startsWith('__')) {
          let pname = k.substr(2);
          pname = pname.replace(pname[0], pname[0].toUpperCase());
          this['get' + pname] = function () {
            return this[k];
          };
          this['set' + pname] = function (value) {
            this[k] = value;
          };
        } else if (k.startsWith('_')) {
          let pname = k.substr(1);
          pname = pname.replace(pname[0], pname[0].toUpperCase());
          this['get' + pname] =
            this['get' + pname] ||
            function () {
              return this[k];
            };
          this['set' + pname] = function (value) {
            this[k] = value;
          };
        }
      }
      //设置属性双向绑定
      this.initBinding();
    }
    getWidth() {
      return this.config['canvas.width'] ? this.config['canvas.width'] : this._container.offsetWidth;
    }
    getHeight() {
      return this.config['canvas.height'] ? this.config['canvas.height'] : this._container.offsetHeight;
    }
    fromJson(json) {
      if (!json) {
        console.error('请提供拓扑元件数据');
      }
      if (!json['canvas']) {
        json['canvas'] = {};
      }
      if (!json['nodes']) {
        json['nodes'] = [];
      }
      if (!json['links']) {
        json['links'] = [];
      }
      if (!json['groups']) {
        json['groups'] = [];
      }
      this.canvasJson = json;

      const canvasConfig = json['canvas'];
      this.__zoom = canvasConfig['zoom']; //设置缩放
      this.__backgroundImage = canvasConfig['backgroundImage'];
      this.zoomG.selectAll('g').remove();
      this.nodes = [];
      this.links = [];
      this.groups = [];

      json['nodes'].forEach((nodeData, index) => {
        if (nodeData.type) {
          //节点类型属性是必不可少的，通过类型使用节点工厂实例化不同节点实例
          const nodeObj = this.nodeFactory.create(nodeData.type, this, nodeData);
          if (!nodeObj) {
            console.error('类型为：' + nodeData.type + '的节点没注册');
          }
        }
      });

      //添加节点
      if (this.nodes.length > 0) {
        this.nodes.forEach(element => {
          const n = element.draw();
        });
      }

      //由于节点需要根据分组重新定位，分组也需要根据节点重新设置大小，所以初始化分组要放在最后
      json['groups'].forEach((nodeData, index) => {
        if (nodeData.type) {
          //节点类型属性是必不可少的，通过类型使用节点工厂实例化不同节点实例
          const nodeObj = this.groupFactory.create(nodeData.type, this, nodeData);
          if (!nodeObj) {
            console.error('类型为：' + nodeData.type + '的分组没注册');
          }
        }
      });
      //添加分组
      if (this.groups.length > 0) {
        this.groups.forEach(element => {
          element.draw();
        });
      }

      //存储旧的path信息
      const pathMap = {};
      json['links'].forEach((linkData, index) => {
        if (linkData.type) {
          //连线类型属性是必不可少的，通过类型使用连线工厂实例化不同连线实例
          const linkObj = this.linkFactory.create(linkData.type, this, linkData);
          if (!linkObj) {
            console.error('类型为：' + linkData.type + '的连线没注册');
          }
        }
        if (linkData.adjustPath && linkData.adjustPoints) {
          pathMap[linkData.uuid] = { path: linkData.adjustPath, points: linkData.adjustPoints };
        }
      });

      //添加连线
      if (this.links.length > 0) {
        this.links.forEach(element => {
          element.draw();
          const d = pathMap[element.getUuid()];
          //如果有修正线段
          if (d && d.path && d.points) {
            element.setPoints(d.points);
            element.setPath(d.path);
          }
        });
      }
    }
    addNode(nodeData) {
      if (nodeData.type) {
        //节点类型属性是必不可少的，通过类型使用节点工厂实例化不同节点实例
        const node = this.nodeFactory.create(nodeData.type, this, nodeData);
        if (!node) {
          console.error('类型为：' + nodeData.type + '的节点没注册');
        } else {
          //将此节点的配置添加到canvas的canvasJson中
          if (this.canvasJson.nodes.filter(item => item['uuid'] == node.getUuid()).length == 0) {
            this.canvasJson.nodes.push(nodeData);
          }
          node.draw();

          const groupList = this.getEnterGroups().filter(g => g.getIsAllowDragIn());
          if (groupList && groupList.length > 0) {
            const group = groupList[0];
            group.addNode(node);
          }

          return node;
        }
      }
    }
    addLink(linkData) {
      if (linkData.type) {
        //类型属性是必不可少的，通过类型使用节点工厂实例化不同连线实例
        const link = this.linkFactory.create(linkData.type, this, linkData);
        if (!link) {
          console.error('类型为：' + linkData.type + '的连线没注册');
        } else {
          if (this.canvasJson.links.filter(item => item['uuid'] == link.getUuid()).length == 0) {
            this.canvasJson.links.push(linkData);
          }
          link.draw();
          if (typeof this.config['link.addafter'] == 'function') {
            this.config['link.addafter'](link);
          }
          return link;
        }
      }
    }
    addGroup(groupData) {
      if (groupData.type) {
        //分组类型属性是必不可少的，通过类型使用分组工厂实例化不同分组实例
        const group = this.groupFactory.create(groupData.type, this, groupData);
        if (!group) {
          console.error('类型为：' + nodeData.type + '的分组没注册');
        } else {
          return group;
        }
      }
    }
    clear() {
      if (this.groups && this.groups.length > 0) {
        for (let i = this.groups.length - 1; i >= 0; i--) {
          this.groups[i].destory();
        }
      }
      if (this.nodes && this.nodes.length > 0) {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
          this.nodes[i].destory();
        }
      }
      if (this.links && this.links.length > 0) {
        for (let i = this.links.length - 1; i >= 0; i--) {
          this.links[i].destory();
        }
      }
    }
    initEvent() {
      this.el.on('click', d => {
        d3.event.stopPropagation();
        if (!this.isShiftKey) {
          d.nodes.forEach(element => {
            element.unselect();
          });
          d.groups.forEach(element => {
            element.unselect();
          });
          d.links.forEach(element => {
            element.unselect();
          });
        }
      });

      if (this.config['node.selectable'] !== false) {
        //可以选中节点时,进行键盘事件监听主要用来多选节点的操作
        let _this = this;
        _this.handlerKeydown = function (event) {
          _this.isShiftKey = event.shiftKey || false;
          _this.isCtrlKey = event.ctrlKey || false;
        };
        _this.handlerKeyup = function (event) {
          _this.isShiftKey = false;
          _this.isCtrlKey = false;
        };
        window.addEventListener('keydown', _this.handlerKeydown); //监听键盘事件，主要是为了监听是否按住ctrl键
        window.addEventListener('keyup', _this.handlerKeyup); //监听键盘事件，清楚ctrl标志
      }
    }
    getMouseX() {
      const [x, y] = d3.mouse(this.el.node());
      return x;
    }
    getMouseY() {
      const [x, y] = d3.mouse(this.el.node());
      return y;
    }
    draw() {
      if (this.el) {
        return;
      }
      //生成画布
      this.el = d3.select(this.getContainer()).append('svg');
      this.el.datum(this);
      this.el.classed('topo', true).classed(this.getClassname(), true).attr('cursor', 'pointer');

      //添加缩放层
      this.drawZoom();
      // 添加defs层
      this.drawDefs();
      //添加刷子
      //this.drawBrush();

      //重新设置一遍属性，触发PH set方法进行绘制
      for (var k in this.getSet) {
        this[k] = this.getSet[k];
      }
      //绑定事件
      this.initEvent();
    }
    drawBrush() {
      this.brushG = this.el.append('g').attr('class', 'brushG');
      let zoomIdentity;
      let brushAssist = d3.brush();

      let brush = d3
        .brush()
        .extent([
          [0, 0],
          [this.getWidth(), this.getHeight()]
        ])
        .on('start', () => {
          zoomIdentity = d3.zoomTransform(this.el.node());
        })
        .on('brush', () => {
          const section = d3.event.selection;
          // 获取被框选中的节点
          if (section && this.getAllowBrushSelect()) {
            const selectSection = section.map(function (d) {
              return zoomIdentity.invert(d);
            });
            // FIXME
            /* 这里需要重写
            const gather = this.parent.children.reduce(function(a, b) {
              return a.concat(b.brushIn ? b.brushIn(selectSection) : []);
            }, []);
            var selected = this.parent.getAll('condition', 'selected');
            var unselect = selected.nodes().filter(function(d) {
              return !gather.includes(d);
            });
            d3.selectAll(gather).dispatch('selected');
            d3.selectAll(unselect).dispatch('unselect');*/
          }
        })
        .on('end', () => {
          console.log('end');
          brushAssist.move(this.brushG, [
            [0, 0],
            [0, 0]
          ]);
        });

      this.brushG.call(brush);

      this.brushG
        .on('cancel', () => {
          // 取消brush框
          d3.brush().move(this.brushG, null);
          this.brushG.call(
            brush.extent([
              [0, 0],
              [0, 0]
            ])
          );
        })
        .on('resize', () => {
          console.log('resize');
          this.brushG.call(
            brush.extent([
              [0, 0],
              [this.getWidth(), this.getHeight()]
            ])
          );
        });
    }
    drawZoom() {
      // 添加zoomG
      this.zoomG = this.el.append('g').attr('class', 'zoomG');

      this.el.call(
        d3
          .zoom()
          .filter(() => {
            return d3.event.type !== 'dblclick' && d3.event.which !== 3;
          })
          .wheelDelta(() => {
            return (-d3.event.deltaY * (d3.event.deltaMode ? 120 : 1)) / 1500;
          })
          .on('start', () => {
            //this.hook('zoomStart');
          })
          .on('zoom', () => {
            //拖动画布，缩放画布都从这里触发
            this.zoomG.attr('transform', d3.event.transform);
          })
          .on('end', () => {})
      );
    }
    //获取偏移过的X坐标，用于拖动画布后添加组件修正组件的坐标值
    getTransformX() {
      const transform = this.zoomG.attr('transform');
      if (transform) {
        const transforms = transform.split(' ');
        for (let i = 0; i < transforms.length; i++) {
          if (transforms[i].startsWith('translate')) {
            let str = transforms[i].replace('translate(', '').replace(')', '');
            return parseInt(str.split(',')[0]);
          }
        }
      }
      return 0;
    }
    //获取偏移过的Y坐标，用于拖动画布后添加组件修正组件的坐标值
    getTransformY() {
      const transform = this.zoomG.attr('transform');
      if (transform) {
        const transforms = transform.split(' ');
        for (let i = 0; i < transforms.length; i++) {
          if (transforms[i].startsWith('translate')) {
            let str = transforms[i].replace('translate(', '').replace(')', '');
            return parseInt(str.split(',')[1]);
          }
        }
      }
      return 0;
    }
    drawDefs() {
      let defs = this.el.selectAll('defs').data(['defs']).enter().append('defs');
      this.defs = defs;
      // marker剪切
      this.defs
        .append('clipPath')
        .attr('id', 'marker-' + this.getUuid())
        .append('rect')
        .attr('width', 20 + 10)
        .attr('height', 20 + 10)
        .attr('rx', 6)
        .attr('ry', 6);

      this.defs
        .append('filter')
        .attr('id', 'goo-' + this.getUuid())
        .html(function () {
          return `<feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10"></feGaussianBlur><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo"></feColorMatrix><feGaussianBlur in="goo" stdDeviation="2" result="shadow"></feGaussianBlur><feColorMatrix in="shadow" mode="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 0" result="shadow"></feColorMatrix><feOffset in="shadow" dx="1" dy="1" result="shadow"></feOffset><feComposite in2="shadow" in="goo" result="goo"></feComposite><feComposite in2="goo" in="SourceGraphic" result="mix"></feComposite>`;
        });
      this.defs
        .append('filter')
        .attr('id', 'goo-shadow-' + this.getUuid())
        .html(function () {
          return `<feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
			      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -7" result="goo" />
			      <feComposite in="SourceGraphic" in2="goo" operator="atop"/>`;
        });
      // 阴影
      this.defs
        .append('filter')
        .attr('id', 'node-shadow-' + this.getUuid())
        .attr('x', '-0.5')
        .attr('y', '-0.5')
        .attr('width', '200%')
        .attr('height', '200%')
        .html(function () {
          return `
                       <feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" />
                       <feColorMatrix result="matrixOut" in="offOut" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" />
                       <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="2" />
                       <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                    `;
        });
      this.defs
        .append('filter')
        .attr('id', 'group-shadow-' + this.getUuid())
        .attr('x', '-0.5')
        .attr('y', '-0.5')
        .attr('width', '200%')
        .attr('height', '200%')
        .html(function () {
          return `
                       <feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" />
                       <!--<feColorMatrix result="matrixOut" in="offOut" type="matrix"  />-->
                       <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="3" />
                       <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                    `;
        });
      this.defs
        .append('filter')
        .attr('id', 'link-shadow-' + this.getUuid())
        .attr('x', '-0.5')
        .attr('y', '-0.5')
        .attr('width', '200%')
        .attr('height', '200%')
        .html(function () {
          return `
                       <feOffset result="offOut" in="SourceGraphic" dx="0.5" dy="0.5" />
                       <feColorMatrix result="matrixOut" in="offOut" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0" />
                       <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="1" />
                       <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                    `;
        });
      this.defs
        .append('filter')
        .attr('id', 'text-shadow-' + this.getUuid())
        .attr('x', '-0.5')
        .attr('y', '-0.5')
        .attr('width', '200%')
        .attr('height', '200%')
        .html(function () {
          return `<feOffset result="offOut" in="SourceGraphic" dx="0.2" dy="0.2" />
                  <feColorMatrix result="matrixOut" in="offOut" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0" />
                  <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="0.4" />
                  <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />`;
        });
      //箭头
      /*this.defs
        .append('marker')
        .attr('class', 'arrow')
        .classed('linkArrow', true)
        .attr('id', `arrow${this.getUuid()}`)
        .attr('markerUnits', 'strokeWidth')
        .attr('markerWidth', '12')
        .attr('markerHeight', '14')
        .attr('viewBox', '0 0 12 12')
        .attr('refX', '10')
        .attr('refY', '4')
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M2,0 L10,4 L2,8 L6,4 L2,0');*/
      //反向箭头
      /*this.defs
        .append('marker')
        .attr('class', 'arrow')
        .classed('linkArrow', true)
        .attr('id', `arrow-reverse-${this.getUuid()}`)
        .attr('markerUnits', 'strokeWidth')
        .attr('markerWidth', '12')
        .attr('markerHeight', '14')
        .attr('viewBox', '0 0 12 12')
        .attr('refX', '10')
        .attr('refY', '4')
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M2,4 L10,8 L6,4 L10,0 L2,4');*/
      //线起点
      /*this.defs
        .append('marker')
        .attr('class', 'arrow')
        .classed('linkArrow', true)
        .attr('id', `arrowend${this.getUuid()}`)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', '12')
        .attr('markerHeight', '12')
        .attr('viewBox', '0 0 12 12')
        .attr('refX', '3')
        .attr('refY', '6')
        .attr('orient', 'auto')
        .append('circle')
        .attr('r', 2)
        .attr('cx', 3)
        .attr('cy', 6);*/

      let circleTextFilter = this.defs.append('filter').attr('id', `linktextbg${this.getUuid()}`).attr('x', 0).attr('y', 0).attr('width', 1).attr('height', 1);

      circleTextFilter.append('feFlood').attr('class', 'linktextbackground').attr('flood-opacity', 1);

      circleTextFilter.append('feComposite').attr('in', 'SourceGraphic').attr('operator', 'over');
      // 水波
      /*let symbol = this.defs.append('symbol').attr('id', 'ware-' + this.getUuid());
      symbol.append('path').attr('d', 'M 420 20 c 21.5 -0.4 38.8 -2.5 51.1 -4.5 c 13.4 -2.2 26.5 -5.2 27.3 -5.4 C 514 6.5 518 4.7 528.5 2.7 c 7.1 -1.3 17.9 -2.8 31.5 -2.7 c 0 0 0 0 0 0 v 20 H 420 Z');
      symbol.append('path').attr('d', 'M 420 20 c -21.5 -0.4 -38.8 -2.5 -51.1 -4.5 c -13.4 -2.2 -26.5 -5.2 -27.3 -5.4 C 326 6.5 322 4.7 311.5 2.7 C 304.3 1.4 293.6 -0.1 280 0 c 0 0 0 0 0 0 v 20 H 420 Z');
      symbol.append('path').attr('d', 'M 140 20 c 21.5 -0.4 38.8 -2.5 51.1 -4.5 c 13.4 -2.2 26.5 -5.2 27.3 -5.4 C 234 6.5 238 4.7 248.5 2.7 c 7.1 -1.3 17.9 -2.8 31.5 -2.7 c 0 0 0 0 0 0 v 20 H 140 Z');
      symbol.append('path').attr('d', 'M 140 20 c -21.5 -0.4 -38.8 -2.5 -51.1 -4.5 c -13.4 -2.2 -26.5 -5.2 -27.3 -5.4 C 46 6.5 42 4.7 31.5 2.7 C 24.3 1.4 13.6 -0.1 0 0 c 0 0 0 0 0 0 l 0 20 H 140 Z');
    */
    }
    initBinding() {
      //创建外来数据双向绑定，外面属性变化自动修改节点属性
      let bindConfigSetting = {};
      for (const k in this.config) {
        this.getSetConfig[k] = this.config[k];
        const that = this;
        bindConfigSetting[k] = {
          get: function () {
            return that.getSetConfig[k];
          },
          set: function (value) {
            if (that.getSetConfig[k] !== value) {
              that['_' + k] = value; //topo属性是单下划线开头
              that.getSetConfig[k] = value;
            }
          }
        };
      }
      Object.defineProperties(this.config, bindConfigSetting);
      //创建节点属性双向绑定，节点属性变化自动触发ph中的函数修改SVG
      let bindSetting = {};
      for (const k in this) {
        if (k.startsWith('_')) {
          let ak = k.substr(1); //去掉前缀，PH里的名字是没前缀的
          this.getSet[k] = this[k];
          const that = this;
          bindSetting[k] = {
            get: function () {
              return that.getSet[k];
            },
            set: function (value) {
              if (that.getSet[k] !== value) {
                that.getSet[k] = value;
              }
              if (PH['canvas.' + ak] && typeof PH['canvas.' + ak] === 'function') {
                PH['canvas.' + ak](that, value);
                //执行完公共方法后，根据节点情况执行自动方法
                if (that.customFn && that.customFn()['canvas.' + ak] && typeof that.customFn()['canvas.' + ak] === 'function') {
                  that.customFn()['canvas.' + ak](that, value);
                }
              }
            }
          };
        }
      }
      Object.defineProperties(this, bindSetting);
    }
    toJson() {
      let json = {};
      let canvas = {};
      for (const k in this) {
        if (k.startsWith('__')) {
          canvas[k.substr(2)] = this[k];
        }
      }
      json['canvas'] = canvas;
      if (this.nodes.length > 0) {
        let nodes = [];
        this.nodes.forEach(element => {
          nodes.push(element.toJson());
        });
        json['nodes'] = nodes;
      }
      if (this.groups.length > 0) {
        let groups = [];
        this.groups.forEach(element => {
          groups.push(element.toJson());
        });
        json['groups'] = groups;
      }
      if (this.links.length > 0) {
        let links = [];
        this.links.forEach(element => {
          links.push(element.toJson());
        });
        json['links'] = links;
      }

      return json;
    }
    getEnterGroups() {
      return this.groups.filter(group => !!group.status.entered);
    }
    getNodeByUuid(uuid) {
      if (uuid && this.nodes && this.nodes.length > 0) {
        return this.nodes.find(element => element.getUuid() == uuid);
      }
    }
    getLinkByUuid(uuid) {
      if (uuid && this.links && this.links.length > 0) {
        return this.links.find(element => element.getUuid() == uuid);
      }
    }
    getNodes() {
      return this.nodes;
    }
    getNodeByType(type) {
      if (type) {
        return this.nodes.filter(element => element.getType().toLowerCase() == type.toLowerCase());
      }
    }
    getLinkByType(type) {
      if (type) {
        return this.links.filter(element => element.getType().toLowerCase() == type.toLowerCase());
      }
    }
    getGroupByUuid(uuid) {
      if (uuid && this.groups && this.groups.length > 0) {
        return this.groups.find(element => element.getUuid() === uuid);
      }
    }
    //包括节点和分组，不包含连线
    getElementByUuid(uuid) {
      let element;
      if (uuid && this.nodes && this.nodes.length > 0) {
        element = this.nodes.find(element => element.getUuid() === uuid);
      }
      if (!element && uuid && this.groups && this.groups.length > 0) {
        element = this.groups.find(element => element.getUuid() === uuid);
      }
      return element;
    }
    getGroups() {
      return this.groups;
    }
    getLinks() {
      return this.links;
    }
    static generateUuid() {
      return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    getSelected() {
      return [...this.nodes.filter(node => !!node.status.selected), ...this.groups.filter(group => !!group.status.selected)];
    }
    positionTransform(data, action) {
      //流程图定位坐标
      action = action || 'invert';
      if (data.hasOwnProperty('x') && data.hasOwnProperty('y')) {
        var zoomTransform = d3.zoomTransform(this.el.node());
        var k = zoomTransform.k || 1;
        var position = zoomTransform[action]([data.x, data.y]);
        if (action ==='invert' && k !== 1 ){ 
          //流程图缩放时，坐标轴位置调整
          data.x = position[0] + zoomTransform.x;
          data.y = position[1] + zoomTransform.y;
        } else {
          data.x = position[0];
          data.y = position[1];
        }
      }
      return data;
    }
    highlight(uuidList) {
      //节点高亮处理
      var list = this.nodes.concat(this.links);
      if (Array.isArray(uuidList)) {
        list.forEach(d => {
          if (uuidList.length && uuidList.indexOf(d.getUuid()) < 0) {
            d3.select(d.el.node()).style('opacity', 0.2);
          } else {
            d3.select(d.el.node()).style('opacity', null);
          }
        });
      }
    }
    center(time) {
      //查看流程图居中
      var box = this.zoomG.node().getBBox();
      var width = this.getWidth();
      var height = this.getHeight();
      var k = Math.min(width / box.width, height / box.height) * 0.8;
      k = k > 1.5 ? 1.5 : k;
      k = k < 0.3 ? 0.3 : k;

      this.zoomTransform(
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(k)
          .translate(-(box.width / 2 + box.x), -(box.height / 2 + box.y)),
        time
      );
    }
    zoomTransform(transform, time) {
      let _this = this;
      if (!transform) return false;
      time = time !== undefined ? time : 700;
      !this.zoomed
        ? (this.zoomed = d3.zoom().on('zoom', function () {
            _this.zoomG.attr('transform', d3.event.transform);
          }))
        : '';
      this.el.call(this.zoomed);
      this.el
        .transition()
        .duration(time)
        .call(this.zoomed.transform, typeof transform.translate === 'function' ? transform : d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k));
    }
    destroy() {
      //销毁多余的事件
      this.handlerKeydown && window.removeEventListener('keydown', this.handlerKeydown);
      this.handlerKeyup && window.removeEventListener('keyup', this.handlerKeyup);
    }
  }
  global.Topo = Topo;
});
