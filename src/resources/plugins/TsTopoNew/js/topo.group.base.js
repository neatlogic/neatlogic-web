/**topo节点的分组类**/
(function(global, factory) {
  factory((global.GroupBase = global.GroupBase || {}), global);
})(window, function(exports, global) {
  'use strict';
  class GroupBase extends EventBase {
    constructor(canvas, config) {
      super(canvas, config);
      if (!canvas) {
        console.error('请定义画布');
        return;
      }
      if (!config) {
        console.error('请提供分组定义');
        return;
      }
      if (!config.type) {
        console.error('请定义分组类型');
        return;
      }
      canvas.groups.push(this); //将自己添加到画布分组列表里
      //如果画布有偏移，先修正坐标值
      this.__originalX = 0; //记录原始X坐标
      this.__originalY = 0; //记录原始Y坐标
      if (config.hasOwnProperty('x')) {
        this.__originalX = config.x;
        config.x = config.x - canvas.getTransformX();
      }
      if (config.hasOwnProperty('y')) {
        this.__originalY = config.y;
        config.y = config.y - canvas.getTransformY();
      }
      /**
       * 重要说明：
       * ======================================================================
       * 两下划线开头的属性，代表需要在tojson中序列化，单下划线只是代表私有属性，不需要序列化
       */
      this.config = config; //保存原始设置
      this.status = { selected: false, entered: false }; //状态
      this.nodes = []; //子节点列表
      this.anchors = []; //连接点对象
      this.links = []; //连线对象
      this.getSet = {}; //存储属性旧值，方便比对
      this.getSetConfig = {}; //存储旧config值
      this.canvas = canvas; //画布对象

      this.draggingNode = null; //被拖动的子节点，这个节点会带动当前分组的所有子节点一起移动，所以要被排除掉
      this.type = 'group'; //对象类型
      this._animate = null; //动画类型
      this._shape = 'rect'; //分组形状默认是方形
      this._isResizing = false;
      this._isDragging = false;
      this._anchorList = [];
      this._headerHeight = 30;
      //this._fill = '#B8C5D0';
      //this._stroke = '#B8C5D0';
      this._dx = 0; //拖动时偏移x坐标
      this._dy = 0; //拖动时偏移y坐标
      this._minWidth = 100;
      this._minHeight = 100;
      //是否允许拖进分组
      if (canvas.config.hasOwnProperty('group.isallowdragin')) {
        if (typeof canvas.config['group.isallowdragin'] === 'function') {
          this._isAllowDragIn = canvas.config['group.isallowdragin'](this);
        } else {
          this._isAllowDragIn = !!canvas.config['group.isallowdragin'];
        }
      } else if (this.config.hasOwnProperty('isallowdragin')) {
        this._isAllowDragIn = !!this.config['isallowdragin'];
      } else {
        this._isAllowDragIn = true;
      }
      //是否允许选中
      if (canvas.config.hasOwnProperty('group.selectable')) {
        if (typeof canvas.config['group.selectable'] === 'function') {
          this._isSelectable = canvas.config['group.selectable'](this);
        } else {
          this._isSelectable = !!canvas.config['group.selectable'];
        }
      } else if (this.config.hasOwnProperty('selectable')) {
        this._isSelectable = !!this.config['selectable'];
      } else {
        this._isSelectable = true;
      }
      //是否允许拖拽
      if (canvas.config.hasOwnProperty('group.dragable')) {
        if (typeof canvas.config['group.dragable'] === 'function') {
          this._isDragable = canvas.config['group.dragable'](this);
        } else {
          this._isDragable = !!canvas.config['group.dragable'];
        }
      } else if (this.config.hasOwnProperty('dragable')) {
        this._isDragable = !!this.config['dragable'];
      } else {
        this._isDragable = true;
      }
      //是否允许删除
      if (canvas.config.hasOwnProperty('group.deleteable')) {
        if (typeof canvas.config['group.deleteable'] === 'function') {
          this._isDeleteable = canvas.config['group.deleteable'](this);
        } else {
          this._isDeleteable = !!canvas.config['group.deleteable'];
        }
      } else if (this.config.hasOwnProperty('deleteable')) {
        this._isDeleteable = !!this.config['deleteable'];
      } else {
        this._isDeleteable = true;
      }
      //是否允许控制大小
      if (canvas.config.hasOwnProperty('group.resizable')) {
        if (typeof canvas.config['group.resizable'] === 'function') {
          this._isResizable = canvas.config['group.resizable'](this);
        } else {
          this._isResizable = !!canvas.config['group.resizable'];
        }
      } else if (this.config.hasOwnProperty('resizable')) {
        this._isResizable = !!this.config['resizable'];
      } else {
        this._isResizable = true;
      }
      //是否允许连接
      if (canvas.config.hasOwnProperty('group.connectable')) {
        if (typeof canvas.config['group.connectable'] === 'function') {
          this._isConnectable = canvas.config['group.connectable'](this);
        } else {
          this._isConnectable = !!canvas.config['group.connectable'];
        }
      } else if (this.config.hasOwnProperty('connectable')) {
        this._isConnectable = !!this.config['connectable'];
      } else {
        this._isConnectable = true;
      }
      this.__uuid = config.uuid || Topo.generateUuid(); //唯一id
      if (!this.config.uuid) {
        this.config.uuid = this.__uuid;
      }
      this.__width = config.width; //节点宽度
      this.__height = config.height; //节点高度
      this.__shape = config.shape || canvas.config['group.shape'] || 'rect'; //形状
      this.__x = config.x || 0; //x坐标
      this.__y = config.y || 0; //y坐标
      this.__rx = config.rx || 0; //圆角
      this.__ry = config.ry || 0; //圆角
      this.__name = config.name;
      this.__contain = config.contain || []; //包含节点的uuid数组
      this.__config = config.config; //自定义数据
      this.__class = canvas.config['group.class'] || ''; //节点样式
      this.__fill = config.fill || canvas.config['group.fill']; //节点填充颜色
      this.__stroke = config.stroke || canvas.config['group.stroke']; //节点边框颜色
      this.__strokewidth = config.hasOwnProperty('strokewidth') ? config.strokewidth : canvas.config['group.strokewidth'];

      //设置子节点列表
      if (this.__contain && this.__contain.length > 0) {
        this.__contain.forEach(nodeuuid => {
          const node = this.canvas.getNodeByUuid(nodeuuid);
          if (node) {
            this.nodes.push(node);
            node.group = this;
          }
        });
      }

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
    initBinding() {
      //创建外来数据双向绑定，外面属性变化自动修改节点属性
      let bindConfigSetting = {};
      for (const p in this) {
        if (p.startsWith('__')) {
          const k = p.substring(2);
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
              const oldValue = that.getSet[k];
              if (oldValue !== value) {
                that.getSet[k] = value;
              }
              if (PH['group.' + ak] && typeof PH['group.' + ak] === 'function') {
                PH['group.' + ak](that, value);
                this.canvas.watcher.call('group.' + ak);
                //执行完公共方法后，根据节点情况执行自动方法
                if (that.customFn && that.customFn()['group.' + ak] && typeof that.customFn()['group.' + ak] === 'function') {
                  that.customFn()['group.' + ak](that, value, oldValue);
                }
              }
            }
          };
        }
      }
      Object.defineProperties(this, bindSetting);
    }
    getNodeByUuid(uuid) {
      if (uuid && this.nodes && this.nodes.length > 0) {
        return this.nodes.find(element => element.getUuid() == uuid);
      }
    }
    getNodeByType(type) {
      if (type) {
        return this.nodes.filter(element => element.getType().toLowerCase() == type.toLowerCase());
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
    addNode(node) {
      if (node) {
        const nodeSet = new Set(this.nodes);
        if (!nodeSet.has(node)) {
          this.nodes.push(node);
          let contain = this.getContain();
          contain.push(node.getUuid());
          this.setContain(contain);
          node.group = this;
          //移出节点和当前分组的连线
          this.getPrevLinks().forEach(link => {
            if (link.getTarget() === this.getUuid() && link.getSource() === node.getUuid()) {
              link.destory();
            }
          });
          this.getNextLinks().forEach(link => {
            if (link.getTarget() === node.getUuid() && link.getSource() === this.getUuid()) {
              link.destory();
            }
          });
        }
      }
    }
    removeNode(node) {
      if (node) {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
          const n = this.nodes[i];
          if (node === n) {
            this.nodes.splice(i, 1);
            break;
          }
        }
        const contain = this.getContain();
        for (let i = contain.length - 1; i >= 0; i--) {
          const uuid = contain[i];
          if (uuid == node.getUuid()) {
            contain.splice(i, 1);
            break;
          }
        }
        this.setContain(contain);
        node.group = null;
      }
    }
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
      this.el
        .classed('groupG', true)
        .classed(this.getClass(), true)
        .attr('cursor', 'pointer');
      //将分组置于最低层
      this.el.lower();
      //外框
      this.shapeEl = this.el
        .append('rect')
        .attr('fill', 'none')
        .attr('class', 'shape')
        .attr('width', this.getWidth())
        .attr('height', this.getHeight())
        .attr('stroke', this.getStroke())
        .attr('stroke-width', this.getStrokewidth() || 0);

      //初始化事件
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
        this.anchors.forEach(element => {
          element.draw();
        });
      }
    }
    removeFn() {
      if (typeof this.canvas.config['group.removeFn'] == 'function') {
        this.canvas.config['group.removeFn'](this);
      }
    }
    destory() {
      this.el.remove();
      if (this.nodes && this.nodes.length > 0) {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
          const node = this.nodes[i];
          node.destory();
        }
      }
      //删除对象
      const gi = this.canvas.groups.findIndex(item => Object.is(item, this));
      if (gi >= 0) {
        this.canvas.groups.splice(gi, 1);
      }
      //删除数据
      const gdi = this.canvas.canvasJson.groups.findIndex(item => item['uuid'] === this.getUuid());
      if (gdi >= 0) {
        this.canvas.canvasJson.groups.splice(gdi, 1);
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
    toJson() {
      let json = {};
      for (const k in this) {
        if (k.startsWith('__')) {
          json[k.substr(2)] = this[k];
        }
      }
      //json.type = this.constructor.name;
      return json;
    }
    getType() {
      return this.constructor.name.toLowerCase();
    }
    /**
     * 计算分组宽度，由于不同分组具体的形态不一定相同，所以不能是_width属性，直接由子类实现
     */
    getWidth() {
      return 0;
    }
    /**
     * 计算分组高度，由于不同分组具体的形态不一定相同，所以不能是_height属性，直接由子类实现
     */
    getHeight() {
      return 0;
    }
    //拖进前的激活状态
    active() {
      this.shapeEl.classed('active', true);
    }
    //取消激活状态
    unactive() {
      this.shapeEl.classed('active', false);
    }
    //添加尺寸改变控制器
    appendResizer() {
      if (!this.resizer) {
        this.resizer = new Resizer(this.canvas, this);
        this.resizer.draw();
      }
    }
    //删除尺寸改变控制器
    removeResizer() {
      if (this.resizer) {
        this.resizer.destory();
        this.resizer = null;
      }
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

      if (!this.selectEl && this.shapeEl) {
        const box = this.shapeEl.node().getBBox();
        this.selectEl = this.el
          .append('rect')
          .attr('fill', 'none')
          .attr('class', 'select')
          .attr('width', this.getWidth() + this.getStrokewidth() || 0)
          .attr('height', this.getHeight() + this.getStrokewidth() || 0)
          .attr('x', -this.getStrokewidth() || 0 / 2)
          .attr('y', -this.getStrokewidth() || 0 / 2)
          .attr('stroke-width', 1);
        this.canvas.watcher.add(this, ['width', 'height', 'strokewidth'], () => {
          if (this.selectEl) {
            this.selectEl
              .attr('x', -this.getStrokewidth() || 0 / 2)
              .attr('y', -this.getStrokewidth() || 0 / 2)
              .attr('width', this.getWidth() + this.getStrokewidth() || 0)
              .attr('height', this.getHeight() + this.getStrokewidth() || 0);
          }
        });
      }
      if (!this.status.selected) {
        this.status.selected = true;
        if (this.getIsResizable()) {
          this.appendResizer();
        }
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
        if (this.getIsResizable()) {
          this.removeResizer();
        }
        this.status.selected = false;
        if (this.unselectFn && typeof this.unselectFn == 'function') {
          this.unselectFn();
        }
      }
    }
    //选中后函数
    selectedFn() {
      if (typeof this.canvas.config['group.selectedFn'] == 'function') {
        this.canvas.config['group.selectedFn'](this, this.canvas.getSelected());
      }
    }
    //取消选中后函数
    unselectFn() {
      if (typeof this.canvas.config['group.unselectFn'] == 'function') {
        this.canvas.config['group.unselectFn'](this, this.canvas.getSelected());
      }
    }
    //获取创建节点时的config对象，外部直接修改这个对象的值即可调用topo.ph中相关属性的变更函数
    getGroupConfig() {
      return this.config;
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
     * @param {NodeBase,GroupBase} 起点节点对象
     */
    isAllowConnected(sourceNode) {
      //是否允许被别的节点关联
      return false;
    }
    /**
     * 关联其他节点，如果不允许关联，则什么都不做
     * @param {Object} sourceAnchor 当前节点连接点位置:{dir:'L|R|T|B'}
     * @param {NodeBase,GroupBase} targetNode 目标节点对象
     * @param {Object} targetAnchor 目标节点连接点位置:{dir:'L|R|T|B'}
     * @param {NodeBase,GroupBase} sourceNode 当前节点对象
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
  }
  global.GroupBase = GroupBase;
});
