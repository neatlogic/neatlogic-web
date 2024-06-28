const { Select } = require('neatlogic-ui/iview/index.js');
/**topo节点的基础类，所有节点class都要extends此类**/
(function (global, factory) {
  factory((global.NodeBase = global.NodeBase || {}), global);
})(window, function (exports, global) {
  'use strict';
  class NodeBase extends EventBase {
    constructor(canvas, config) {
      super(canvas, config);
      if (!canvas) {
        console.error('请定义画布');
        return;
      }
      if (!config) {
        console.error('请提供节点定义');
        return;
      }

      if (!config.type) {
        console.error('请定义节点类型');
        return;
      }
      canvas.nodes.push(this); //将自己添加到画布节点列表里
      //如果画布有偏移，先修正坐标值
      this.__originalX = 0; //记录原始X坐标
      this.__originalY = 0; //记录原始Y坐标
      if (config.hasOwnProperty('x')) {
        this.__originalX = config.x;
      }
      if (config.hasOwnProperty('y')) {
        this.__originalY = config.y;
      }

      
      /*if (config.hasOwnProperty('x')) {
        this.__originalX = config.x;
        config.x = config.x - canvas.getTransformX();
      }
      if (config.hasOwnProperty('y')) {
        this.__originalY = config.y;
        config.y = config.y - canvas.getTransformY();
      }*/

      /**
       * 重要说明：
       * ======================================================================
       * 两下划线开头的属性，代表需要在tojson中序列化，单下划线只是代表私有属性，不需要序列化
       */
      this.config = config; //保存原始设置
      this.status = { selected: false }; //状态
      this.anchors = []; //连接点对象
      this.links = []; //连线对象
      this.group = null; //所属分组
      this.getSet = {}; //存储属性旧值，方便比对
      this.getSetConfig = {}; //存储旧config值
      this.canvas = canvas; //画布对象
      this.type = 'node'; //对象类型
      this._isResizing = false;
      this._isDragging = false;
      this._animate = null;
      this._anchorList = [{ position: 'L' }, { position: 'R' }, { position: 'T' }, { position: 'B' }]; //连线点列表，默认上下左右四个锚点
      this._size = 0; //尺寸
      this._cx = 0;
      this._cy = 0;
      this._rx = 0; //圆角
      this._ry = 0;
      this._dx = 0; //拖动时偏移x坐标
      this._dy = 0; //拖动时偏移y坐标
      this._padding = 10;
      this._borderradius = 3; //边框圆角幅度
      this._strokewidth = 1; //边框宽度
      this._needShadow = true; //是否需要阴影
      //是否允许选中
      if (canvas.config.hasOwnProperty('node.selectable')) {
        if (typeof canvas.config['node.selectable'] === 'function') {
          this._isSelectable = canvas.config['node.selectable'](this);
        } else {
          this._isSelectable = !!canvas.config['node.selectable'];
        }
      } else if (this.config.hasOwnProperty('selectable')) {
        this._isSelectable = !!this.config['selectable'];
      } else {
        this._isSelectable = true;
      }
      //是否允许拖拽
      if (canvas.config.hasOwnProperty('node.dragable')) {
        if (typeof canvas.config['node.dragable'] === 'function') {
          this._isDragable = canvas.config['node.dragable'](this);
        } else {
          this._isDragable = !!canvas.config['node.dragable'];
        }
      } else if (this.config.hasOwnProperty('dragable')) {
        this._isDragable = !!this.config['dragable'];
      } else {
        this._isDragable = true;
      }
      //是否允许删除
      if (canvas.config.hasOwnProperty('node.deleteable')) {
        if (typeof canvas.config['node.deleteable'] === 'function') {
          this._isDeleteable = canvas.config['node.deleteable'](this);
        } else {
          this._isDeleteable = !!canvas.config['node.deleteable'];
        }
      } else if (this.config.hasOwnProperty('deleteable')) {
        this._isDeleteable = !!this.config['deleteable'];
      } else {
        this._isDeleteable = true;
      }
      //是否允许连线
      if (canvas.config.hasOwnProperty('node.connectable')) {
        if (typeof canvas.config['node.connectable'] === 'function') {
          this._isConnectable = canvas.config['node.connectable'](this);
        } else {
          this._isConnectable = !!canvas.config['node.connectable'];
        }
      } else if (this.config.hasOwnProperty('connectable')) {
        this._isConnectable = !!this.config['connectable'];
      } else {
        this._isConnectable = true;
      }
      this._fontfamily = 'tsfont'; //图标字体
      this._iconsize = config.iconsize || canvas.config['node.iconsize'] || 18; //节点图标大小
      this._width = 0; //节点宽度
      this._height = 0; //节点高度
      this.__uuid = config.uuid || Topo.generateUuid(); //唯一id
      if (!this.config.uuid) {
        this.config.uuid = this.__uuid;
      }
      this.__x = config.x || 0; //x坐标
      this.__y = config.y || 0; //y坐标
      this.__group = config.group; //分组uuid
      this.__shape = config.shape || canvas.config['node.shape']; //形状
      this.__icon = config.icon || canvas.config['node.icon']; //节点图标
      this.__iconcolor = config.iconcolor || canvas.config['node.iconcolor']; //节点图标颜色
      this.__iconweight = config.iconweight || canvas.config['node.iconweight']; //节点图标加粗
      this.__fill = config.fill || canvas.config['node.fill']; //节点填充颜色
      this.__stroke = config.stroke || canvas.config['node.stroke']; //节点边框颜色
      this.__loadingcolor = config.loadingcolor; //loading效果颜色，为空时不显示loading
      this.__class = config.class || canvas.config['node.class'] || ''; //节点样式
      this.__name = config.name; //节点名称
      this.__config = config.config; //节点个性化数据
      this.__type = config.type;

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
            return this;
          };
        } else if (k.startsWith('_')) {
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
    //生成节点
    draw() {
      if (this.el) {
        return;
      }
      //设置连线点，由于子类会覆盖anchorList，所以不能放构造函数里
      if (this.getAnchorList() && this.getAnchorList().length > 0) {
        this.getAnchorList().forEach(element => {
          this.anchors.push(new Anchor(this.canvas, this, element));
        });
      }

      const canvasEl = this.canvas.zoomG; //在zoomG里创建所有元素
      this.el = canvasEl.append('g');
      this.el.datum(this);
      this.el.classed('nodeG', true).classed(this.getClass(), true).attr('cursor', 'pointer');
      this.initEvent();

      //重新设置一遍属性，触发PH set方法进行绘制
      for (var k in this.getSet) {
        this[k] = this.getSet[k];
      }

      //绘制连接点
      if (this.anchors && this.anchors.length) {
        //一定要先创建anchorG，anchor的draw方法需要在里面绘制连接点
        this.anchorG = this.el.append('g');
        this.anchorG.attr('class', 'anchorG');
        // this.anchorG = this.canvas.zoomG.append('g');
        // this.anchorG.attr('class', 'anchorG').attr('transform', `translate(${this.getX()},${this.getY()})`);
        this.anchors.forEach(element => {
          element.draw();
        });
      }
    }
    //获取创建节点时的config对象，外部直接修改这个对象的值即可调用topo.ph中相关属性的变更函数
    getNodeConfig() {
      return this.config;
    }
    //选中后函数
    selectedFn() {
      if (typeof this.canvas.config['node.selectedFn'] == 'function') {
        this.canvas.config['node.selectedFn'](this, this.canvas.getSelected());
      }
    }
    //取消选中后函数
    unselectFn() {
      if (typeof this.canvas.config['node.unselectFn'] == 'function') {
        this.canvas.config['node.unselectFn'](this, this.canvas.getSelected());
      }
    }
    clickFn() {
      if (typeof this.canvas.config['node.clickFn'] == 'function') {
        this.canvas.config['node.clickFn'](this);
      }
    } //鼠标进入函数
    mouseenterFn() {
      if (typeof this.canvas.config['node.mouseenterFn'] == 'function') {
        this.canvas.config['node.mouseenterFn'](this);
      }
    } //鼠标离开函数
    mouseleaveFn() {
      if (typeof this.canvas.config['node.mouseleaveFn'] == 'function') {
        this.canvas.config['node.mouseleaveFn'](this);
      }
    }
    removeFn() {
      if (typeof this.canvas.config['node.removeFn'] == 'function') {
        this.canvas.config['node.removeFn'](this);
      }
    }
    initBinding() {
      //创建外来数据双向绑定，外面属性变化自动修改节点属性
      let bindConfigSetting = {};
      for (const p in this) {
        if (p.startsWith('__')) {
          const k = p.substring(2);
          this.getSetConfig[k] = this.config[k];
          const that = this;
          bindConfigSetting[k] = {
            get: function () {
              return that.getSetConfig[k];
            },
            set: function (value) {
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
            get: function () {
              return that.getSet[k];
            },
            set: function (value) {
              if (that.getSet[k] !== value) {
                that.getSet[k] = value;
              }
              if (PH['node.' + ak] && typeof PH['node.' + ak] === 'function') {
                PH['node.' + ak](that, value);
                this.canvas.watcher.call('node.' + ak);
                //执行完公共方法后，根据节点情况执行自动方法
                if (that.customFn && that.customFn()['node.' + ak] && typeof that.customFn()['node.' + ak] === 'function') {
                  that.customFn()['node.' + ak](that, value);
                }
              }
            }
          };
        }
      }
      Object.defineProperties(this, bindSetting);
    }
    //选中
    select() {
      this.canvas.links.forEach(element => {
        element.unselect();
      });
      if (!this.canvas.isShiftKey) {
        //按住Shift键
        this.canvas.getSelected().forEach(element => {
          if (element != this) {
            element.unselect();
          }
        });
      }

      if (!this.selectEl) {
        const box = this.shapeEl.node().getBBox();
        this.selectEl = this.el
          .insert('rect', ':first-child')
          .attr('class', 'select')
          //.attr('transform', 'scale(1.2)')
          .attr('fill', 'transparent')
          .attr('width', box.width * 1.2)
          .attr('height', box.height * 1.2)
          .attr('x', (-box.width * 0.2) / 2)
          .attr('y', (-box.height * 0.2) / 2);
      }
      if (!this.status.selected) {
        this.status.selected = true;
        if (this.selectedFn && typeof this.selectedFn == 'function') {
          this.selectedFn();
        }
      }
    }
    //取消选中
    unselect() {
      if (this.selectEl) {
        this.selectEl.remove();
        this.selectEl = null;
      }
      if (this.status.selected) {
        this.status.selected = false;
        if (this.unselectFn && typeof this.unselectFn == 'function') {
          this.unselectFn();
        }
      }
    }
    //获取中心点x坐标
    getCoreX() {
      return this.getX() + this.getWidth() / 2;
    }
    //获取中心点y坐标
    getCoreY() {
      return this.getY() + this.getHeight() / 2;
    }
    destory() {
      //如果属于分组，则删除分组节点列表信息
      if (this.group) {
        this.group.removeNode(this);
      }
      this.el.remove();
      //删除对象
      const ni = this.canvas.nodes.findIndex(item => Object.is(item, this));
      if (ni >= 0) {
        this.canvas.nodes.splice(ni, 1);
      }

      //删除数据
      const ndi = this.canvas.canvasJson.nodes.findIndex(item => item['uuid'] === this.getUuid());
      if (ndi >= 0) {
        this.canvas.canvasJson.nodes.splice(ndi, 1);
      }

      //删除连线
      if (this.links && this.links.length > 0) {
        this.links.forEach(link => {
          link.destory();
        });
      }

      if (this.removeFn && typeof this.removeFn == 'function') {
        this.removeFn();
      }
    }
    /**
     * 根据位置获取连接点对象
     * @param {String:L|R|T|B} dir
     */
    getAnchor(dir) {
      if (this.anchors && this.anchors.length > 0) {
        return this.anchors.find(element => element.getPosition() == dir);
      }
    }
    /**
     * 是否允许被起点关联
     * @param {NodeBase} 起点节点对象
     */
    isAllowConnected(sourceNode) {
      //是否允许被别的节点关联
      return false;
    }
    /**
     * 关联其他节点，如果不允许关联，则什么都不做
     * @param {Object} sourceAnchor 当前节点连接点位置:{dir:'L|R|T|B'}
     * @param {NodeBase} targetNode 目标节点对象
     * @param {Object} targetAnchor 目标节点连接点位置:{dir:'L|R|T|B'}
     * @param {NodeBase} sourceNode 当前节点对象
     */
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode) {}
    /**
     * 获取当前节点的连入线
     * @returns 连线数组
     */
    getPrevLinks() {
      return this.canvas.links.filter(link => link.getTarget() == this.getUuid() && link.getSource() != this.getUuid());
    }
    /**
     * 获取当前节点的连出线
     * @returns 连线数组
     */
    getNextLinks() {
      return this.canvas.links.filter(link => link.getTarget() != this.getUuid() && link.getSource() == this.getUuid());
    }
    /**
     * 获取当前节点的直接前置节点(不包含自身)
     * @param {String} type 连线类型
     */
    getPrevNodes(type) {
      let nodeList = [];
      this.canvas.links.forEach(element => {
        if ((!type || type == element.getType()) && element.getTarget() == this.getUuid() && element.getSource() != this.getUuid()) {
          const n = this.canvas.getElementByUuid(element.getSource());
          if (n) {
            nodeList.push(n);
          }
        }
      });
      return nodeList;
    }
    /**
     * 获取当前节点的直接后置节点(不包含自身)
     * @param {String} type 连线类型
     */
    getNextNodes(type) {
      let nodeList = [];
      this.canvas.links.forEach(element => {
        if (((!type && element.getIsReal()) || type == element.getType()) && element.getSource() == this.getUuid() && element.getTarget() != this.getUuid()) {
          const n = this.canvas.getElementByUuid(element.getTarget());
          if (n) {
            nodeList.push(n);
          }
        }
      });
      return nodeList;
    }
    /**
     *  获取当前节点的所有前置节点(不包含自身)
     * @param {String} type 连线类型
     */
    getAllPrevNodes(type) {
      let nodeList = this.getPrevNodes(type);
      const nodeSet = new Set(nodeList);
      if (nodeList && nodeList.length > 0) {
        let size = nodeList.length;
        for (let i = 0; i < size; i++) {
          const n = nodeList[i];
          const tmpList = n.getPrevNodes(type);
          tmpList.forEach(tmp => {
            //判断新的关系是否存在，不存在则加入nodeList继续循环
            if (!nodeSet.has(tmp) && !Object.is(tmp, this)) {
              nodeSet.add(tmp);
              nodeList.push(tmp);
            }
          });
          size = nodeList.length; //重新修正新的size
        }
      }
      return nodeList;
    }
    /**
     * 获取当前节点的所有后置节点(不包含自身)
     * @param {String} type 连线类型
     */
    getAllNextNodes(type) {
      let nodeList = this.getNextNodes(type);
      const nodeSet = new Set(nodeList);
      if (nodeList && nodeList.length > 0) {
        let size = nodeList.length;
        for (let i = 0; i < size; i++) {
          const n = nodeList[i];
          const tmpList = n.getNextNodes(type);
          tmpList.forEach(tmp => {
            //判断新的关系是否存在，不存在则加入nodeList继续循环
            if (!nodeSet.has(tmp) && !Object.is(tmp, this)) {
              nodeSet.add(tmp);
              nodeList.push(tmp);
            }
          });
          size = nodeList.length; //重新修正新的size
        }
      }
      return nodeList;
    }
    toJson() {
      let json = {};
      for (const k in this) {
        if (k.startsWith('__')) {
          json[k.substring(2)] = this[k];
        }
      }
      // json.type = this.constructor.name;
      return json;
    }
    // getType() {
    //   return this.constructor.name.toLowerCase();
    // }
    /**
     * 对节点进行校验
     * @param {Object} nodeConfig 节点的数据
     */
    valid(nodeConfig) {}
  }
  global.NodeBase = NodeBase;
});
