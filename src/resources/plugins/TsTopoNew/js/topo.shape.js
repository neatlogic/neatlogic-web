(function(global, factory) {
  factory((global.NodeShape = global.NodeShape || {}), global);
})(window, function(exports, global) {
  class NodeShape {
    static getShape(nodeData, offsetSize, action) {
      let shapeCreator;
      offsetSize = offsetSize || 0;
      const shape = nodeData.getShape();
      switch (shape) {
        case 'rect':
          shapeCreator = d3
            .create('svg:rect')
            .attr('width', nodeData.getWidth() + offsetSize)
            .attr('height', nodeData.getHeight() + offsetSize)
            //.attr('x', -nodeData.getWidth() / 2 - offsetSize / 2)
            //.attr('y', -nodeData.getHeight() / 2 - offsetSize / 2)
            .attr('rx', nodeData.getRx() || 0)
            .attr('ry', nodeData.getRx() || 0);
          break;
        case 'ellipse':
          shapeCreator = d3
            .create('svg:ellipse')
            //.attr('x', -nodeData.getWidth() / 2 - offsetSize / 2)
            //.attr('y', -nodeData.getHeight() / 2 - offsetSize / 2)
            .attr('rx', nodeData.getWidth() / 2 + offsetSize)
            .attr('ry', nodeData.getHeight() / 2 + offsetSize);
          break;
        case 'circle':
          shapeCreator = d3
            .create('svg:circle')
            //.attr('x', nodeData.getSize() - offsetSize / 2)
            //.attr('y', nodeData.getSize() - offsetSize / 2)
            .attr('r', nodeData.getSize() + offsetSize)
            .attr('cx', nodeData.getCx() || 0)
            .attr('cy', nodeData.getCy() || 0);
          break;
        default:
          shapeCreator = d3.create('svg:path').attr('d', NodeShape.drawShapePath(nodeData, offsetSize));
          //.attr('transform', `translate(${-nodeData.getWidth() / 2 - offsetSize / 2},${-nodeData.getHeight() / 2 - offsetSize / 2})`);
          break;
      }
      return shapeCreator;
    }
    static drawShapeEdge(nodeData, point) {
      let point1 = point;
      switch (nodeData.shape) {
        case 'circle':
          point1 = this.intersect[nodeData.shape](
            {
              x: nodeData.x,
              y: nodeData.y
            },
            nodeData.size,
            point
          );
          break;
        case 'ellipse':
          point1 = this.intersect[nodeData.shape](
            {
              x: nodeData.x,
              y: nodeData.y
            },
            nodeData.width / 2,
            nodeData.height / 2,
            point
          );
          break;
        case 'polygon':
          point1 = this.intersect[nodeData.shape](
            {
              x: nodeData.x,
              y: nodeData.y,
              width: nodeData.width,
              height: nodeData.height
            },
            nodeData.polyPoints,
            point
          );
          break;
        case 'rect':
          point1 = this.intersect[nodeData.shape](
            {
              x: nodeData.x,
              y: nodeData.y,
              width: nodeData.width,
              height: nodeData.height
            },
            point
          );
          break;
        default:
          point1 = this.intersect['rect'](
            {
              x: nodeData.x,
              y: nodeData.y,
              width: nodeData.width,
              height: nodeData.height
            },
            point
          );
          break;
      }
      return point1;
    }
    static drawShapePath(nodeData, offset) {
      if (!nodeData) {
        return false;
      }
      let path = d3.path();
      let shapePoint = [];
      let padding = nodeData.getPadding() || 0;
      let width = nodeData.getWidth() + offset;
      let height = nodeData.getHeight() + offset;
      let shapeArr = nodeData.getShape().split(':') || 'rect';
      let shapeRight = shapeArr.find(function(d) {
        return d.indexOf('R') !== -1;
      });
      let shapeLeft = shapeArr.find(function(d) {
        return d.indexOf('L') !== -1;
      });
      shapeRight = shapeRight ? shapeRight.split('-') : 'rectangle';
      shapeLeft = shapeLeft ? shapeLeft.split('-') : 'rectangle';

      let shapeRightR = Array.isArray(shapeRight) && shapeRight.length === 3 ? shapeRight[2] : nodeData.getBorderradius();
      let shapeLeftR = Array.isArray(shapeLeft) && shapeLeft.length === 3 ? shapeLeft[2] : nodeData.getBorderradius();
      shapeRight = Array.isArray(shapeRight) && shapeRight[1] ? shapeRight[1] : 'rectangle';
      shapeLeft = Array.isArray(shapeLeft) && shapeRight[1] ? shapeLeft[1] : 'rectangle';
      // 处理百分比
      if (typeof shapeRightR === 'string' && shapeRightR.indexOf('%') !== -1) {
        shapeRightR = Number(shapeRightR.split('%')[0]) / 100;
        if (shapeRightR) shapeRightR = shapeRightR * height;
        else shapeRightR = nodeData.getBorderradius();
      }
      if (typeof shapeLeftR === 'string' && shapeLeftR.indexOf('%') !== -1) {
        shapeLeftR = Number(shapeLeftR.split('%')[0]) / 100;
        if (shapeLeftR) shapeLeftR = shapeLeftR * height;
        else shapeRightR = nodeData.getBorderradius();
      }

      shapePoint.push([width / 2, 0]);
      if (shapeRight === 'rectangle') {
        // 矩形
        shapePoint.push([width, 0, shapeRightR]);
        shapePoint.push([width, height, shapeRightR]);
      } else if (shapeRight === 'hexagon') {
        // 六边形
        let unit = height / Math.sqrt(3) / 3;
        shapePoint.push([width - unit, 0, shapeRightR]);
        shapePoint.push([width, height / 2, shapeRightR]);
        shapePoint.push([width - unit, height, shapeRightR]);
      } else if (shapeRight === 'octagon') {
        // 八边形
        let unit = height / (2 + Math.sqrt(2));
        let side = unit * Math.sqrt(2);
        shapePoint.push([width - unit, 0, shapeRightR]);
        shapePoint.push([width, unit, shapeRightR]);
        shapePoint.push([width, unit + side, shapeRightR]);
        shapePoint.push([width - unit, height, shapeRightR]);
      } else if (shapeRight === 'trapezoid') {
        // 梯形
        shapePoint.push([width - padding, 0, shapeRightR]);
        shapePoint.push([width, height, shapeRightR]);
      } else if (shapeRight === 'invertedTrapezoid') {
        // 倒梯形
        shapePoint.push([width, 0, shapeRightR]);
        shapePoint.push([width - padding, height, shapeRightR]);
      } else if (shapeRight === 'triangle') {
        // shapePoint.push([width / 2, 0, shapeRightR]);
        shapePoint.push([width, height / 2, shapeRightR]);
        shapePoint.push([width / 2, height, shapeRightR]);
      }

      if (shapeLeft === 'rectangle') {
        shapePoint.push([0, height, shapeLeftR]);
        shapePoint.push([0, 0, shapeLeftR]);
      } else if (shapeLeft === 'hexagon') {
        var unit = height / Math.sqrt(3) / 3;
        shapePoint.push([unit, height, shapeLeftR]);
        shapePoint.push([0, height / 2, shapeLeftR]);
        shapePoint.push([unit, 0, shapeLeftR]);
      } else if (shapeLeft === 'octagon') {
        let unit = height / (2 + Math.sqrt(2));
        let side = unit * Math.sqrt(2);
        shapePoint.push([unit, height, shapeLeftR]);
        shapePoint.push([0, unit + side, shapeLeftR]);
        shapePoint.push([0, unit, shapeLeftR]);
        shapePoint.push([unit, 0, shapeLeftR]);
      } else if (shapeLeft === 'trapezoid') {
        shapePoint.push([0, height, shapeLeftR]);
        shapePoint.push([padding, 0, shapeLeftR]);
      } else if (shapeLeft === 'invertedTrapezoid') {
        shapePoint.push([padding, height, shapeLeftR]);
        shapePoint.push([0, 0, shapeLeftR]);
      } else if (shapeLeft === 'triangle') {
        // shapePoint.push([width / 2, height, shapeRightR]);
        shapePoint.push([0, height / 2, shapeRightR]);
        // shapePoint.push([width / 2, 0, shapeRightR]);
      }

      shapePoint.forEach(function(d, i, arr) {
        if (i === 0) path.moveTo(d[0], d[1]);
        else if (i < arr.length - 1) {
          path.arcTo(d[0], d[1], arr[i + 1][0], arr[i + 1][1], d[2]);
        } else path.arcTo(d[0], d[1], arr[0][0], arr[0][1], d[2]);
      });
      path.closePath();
      return path.toString();
    }
  }
  global.NodeShape = NodeShape;
});
