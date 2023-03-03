(function(global, factory) {
  factory((global.NodeAnimate = global.NodeAnimate || {}), global);
})(window, function(exports, global) {
  class NodeAnimate {
    static getAnimate(node) {
      let animateEl = d3.create('svg:g');
      if (node.getAnimate() === 'breath') {
        const animateShapeEl = node.shapeEl.clone(true); //node.shapeEl.node().cloneNode(true);
        animateEl.node().appendChild(animateShapeEl.node());
        //const animateShapeEl = node.shapeEl.clone(true);
        animateShapeEl.style('fill','transparent');
        if (node.getShape() === 'circle') {
          animateShapeEl
            .append('animate')
            .attr('attributeName', 'r')
            .attr('values', `${node.getSize()};${node.getSize() * 1.3}`)
            .attr('dur', '2s')
            .attr('repeatCount', 'indefinite');
          animateShapeEl
            .append('animate')
            .attr('attributeName', 'stroke-opacity')
            .attr('values', `1;0`)
            .attr('dur', '2s')
            .attr('repeatCount', 'indefinite');
          node.canvas.watcher.add(node, ['stroke', 'fill'], () => {
            animateShapeEl.style('stroke', node.getStroke()).style('fill', node.getFill());
          });
        } else {
          animateEl.attr('transform', `translate(${node.getWidth() / 2} ${node.getHeight() / 2})`);
          animateShapeEl.attr('x', -node.getWidth() / 2).attr('y', -node.getHeight() / 2);
          animateShapeEl
            .append('animateTransform')
            .attr('attributeName', 'transform')
            .attr('attributeType', 'XML')
            .attr('type', 'scale')
            .attr('from', 1)
            .attr('to', 1.2)
            .attr('dur', '2s')
            .attr('repeatCount', 'indefinite');
          animateShapeEl
            .append('animate')
            .attr('attributeName', 'stroke-opacity')
            .attr('values', `1;0`)
            .attr('dur', '2s')
            .attr('repeatCount', 'indefinite');
          node.canvas.watcher.add(node, ['stroke'], () => {
            animateShapeEl.style('stroke', node.getStroke());
          });
        }
        return animateEl;
      }
    }
  }
  global.NodeAnimate = NodeAnimate;
});
