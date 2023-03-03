(function(global, factory) {
  factory((global.Ci = global.Ci || {}), global);
}(window, function(exports, global) {
  //页面拖进来之后的代码
  class Ci extends NodeBase {
    constructor(canvas, config) {
      super(canvas, config);
      this._anchorList = [{ position: 'L', direction: 'i'}, { position: 'R', direction: 'i'}, { position: 'T', direction: 'i'}];
      this._needShadow = false;
      this._isDragable = true;
      this._isSelectable = true;
      this._width = 120;
      this._height = 30;
      this.__class = 'ci_node';
      //this.__fill = '#E2E4EC';
      //this.__iconcolor = '#212121';
      //this.__stroke = '#e2e4ec';
      this.__type = 'Ci';
    }
    isAllowConnected(sourceNode) { 
      const conf = sourceNode.getConfig();
      if (conf.direction == 'from' && conf.toCiId == this.getConfig()['ciId']) {
        return true;
      } else if (conf.direction == 'to' && conf.fromCiId == this.getConfig()['ciId']) {
        return true;
      }
      return false;
    }
    connect(sourceAnchor, targetNode, targetAnchor, sourceNode) {

    }
    select() { //覆盖选中效果
      if (!this.status.selected) {
        this.canvas.links.forEach(element => {
          element.unselect();
        });
        this.canvas.nodes.forEach(element => {
          if (element != this) {
            element.unselect();
          }
        });
        this.shapeEl.classed('selected', true);
        this.group.shapeEl.classed('selected', true);
        this.status.selected = true;
        this.selectedFn();
      }
    }
    unselect() { //覆盖反选效果
      if (this.status.selected) {
        this.shapeEl.classed('selected', false);
        this.group.shapeEl.classed('selected', false);
        this.status.selected = false;

        if (this.unselectFn && typeof this.unselectFn == 'function') {
          this.unselectFn();
        }
      }
    }
    destory() {
      const prevNodeList = this.getPrevNodes();
      if (prevNodeList.length > 0) {
        prevNodeList.forEach(n => {
          if (n.getType() === 'Rel') {
            n.destory();
          }
        });
      }
      const group = this.group;
      super.destory();
      if (group) {
        group.destory();
      }
    }
  }
  global.Ci = Ci;
}));
