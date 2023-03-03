(function(global, factory) {
  factory((global.Group = global.Group || {}), global);
})(window, function(exports, global) {
  class Group extends GroupBase {
    constructor(canvas, config) {
      super(canvas, config);
      this.__width = config.width || 120;
      this.__height = config.height || 30;
      this._isAllowDragIn = false;
      this._isDragable = false; //分组禁止拖动
      this._isDeleteable = false;
      this._isResizable = false;
      this._isSelectable = false;
      this.__stroke = '';
      this.__type = 'Group'; //必须定义节点类型
    }
    draw() {
      super.draw();
      this.layoutNode();
    }
    calcWidth() {
      let width = 0;
      if (this.nodes.length > 0) {
        this.nodes.forEach(node => {
          width = Math.max(node.getWidth(), width);
        });
      }
      return width;
    }
    calcHeight() {
      let height = 0;
      if (this.nodes.length > 0) {
        this.nodes.forEach(node => {
          height += node.getHeight();
        });
      }
      return height;
    }
    //覆盖基类的方法，增加重新计算布局逻辑
    addNode(node) {
      if (node) {
        const nodeSet = new Set(this.nodes);
        if (!nodeSet.has(node)) {
          this.nodes.push(node);
          let contain = this.getContain();
          contain.push(node.getUuid());
          this.setContain(contain);
          node.group = this;
          this.layoutNode();
        }
      }
    }
    //覆盖基类的方法，增加重新计算布局逻辑
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
        this.layoutNode();
      }
    }
    layoutNode() {
      let yOffset = 0;
      const groupWidth = this.calcWidth();
      const groupHeight = this.calcHeight();
      if (this.nodes.length > 0) {
        this.nodes.forEach(node => {
          //if (!this.draggingNode || this.draggingNode != node) {
          node.setX(this.getX());
          node.setY(this.getY() + yOffset);
          //}
          yOffset += node.getHeight();
        });
        this.setWidth(groupWidth);
        this.setHeight(groupHeight);
      }
    }
  }
  global.Group = Group;
});
