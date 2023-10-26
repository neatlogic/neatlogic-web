/**双向绑定处理器，定义每个属性的具体处理方式**/
(function (global, factory) {
  factory((global.PH = global.PH || {}), global);
})(window, function (exports, global) {
  class PH {}
  //下面的属性必须要和节点、连线、分组对象中的属性名一致，否则不会触发修改
  PH['canvas.width'] = function (d, value) {
    if (d.el && value) {
      d.el.attr('width', value);
    }
  };
  PH['canvas.height'] = function (d, value) {
    if (d.el && value) {
      d.el.attr('height', value);
    }
  };
  PH['canvas.backgroundImage'] = function (d, value) {
    if (d.el) {
      if (d.pattern) {
        d.pattern.remove();
        d.pattern = null;
      }
      if (d.bgimgage) {
        d.bgimgage.remove();
        d.bgimgage = null;
      }
      if (d.bgimagerect) {
        d.bgimagerect.remove();
        d.bgimagerect = null;
      }
      if (value) {
        d.pattern = d.defs.append('pattern');
        d.pattern.attr('id', 'bgdef').attr('patternUnits', 'userSpaceOnUse').attr('width', '100%').attr('height', '100%');
        d.bgimgage = d.pattern.append('image');
        if (d.getBackgroundLayout()) {
          if (d.getBackgroundLayout() === 'scale') {
            d.bgimgage.attr('width', '100%').attr('height', '100%').attr('preserveAspectRatio', null);
          } else if (d.getBackgroundLayout() === 'stretch') {
            d.bgimgage.attr('width', '100%').attr('height', '100%').attr('preserveAspectRatio', 'none');
          }
        }
        d.bgimgage.attr('xlink:href', value);
        if (d.getBackgroundResizable()) {
          d.bgimagerect = d.zoomG.append('rect');
        } else {
          d.bgimagerect = d.el.append('rect');
        }
        d.bgimagerect.attr('width', '100%').attr('height', '100%').attr('fill', 'url(#bgdef)');
        d.bgimagerect.lower();
      }
    }
  };
  PH['canvas.backgroundColor'] = function (d, value) {
    if (d.el) {
      if (d.bgcolorrect) {
        d.bgcolorrect.remove();
        d.bgcolorrect = null;
      }
      if (value) {
        d.bgcolorrect = d.el.append('rect');
        d.bgcolorrect.attr('width', '100%').attr('height', '100%').attr('fill', value);
        d.bgcolorrect.lower();
      }
    }
  };
  PH['canvas.backgroundResizable'] = function (d, value) {
    if (d.el) {
      if (d.bgimagerect) {
        d.bgimagerect.remove();
        if (value) {
          d.zoomG.append(() => {
            return d.bgimagerect.node();
          });
        } else {
          d.el.append(() => {
            return d.bgimagerect.node();
          });
        }
        d.bgimagerect.lower();
      }
    }
  };
  PH['canvas.backgroundLayout'] = function (d, value) {
    if (d.el) {
      if (d.bgimgage) {
        if (!value) {
          d.bgimgage.attr('width', null).attr('height', null).attr('preserveAspectRatio', null);
        } else if (value === 'scale') {
          d.bgimgage.attr('width', '100%').attr('height', '100%').attr('preserveAspectRatio', null);
        } else if (value === 'stretch') {
          d.bgimgage.attr('width', '100%').attr('height', '100%').attr('preserveAspectRatio', 'none');
        }
      }
    }
  };
  PH['group.contain'] = function (d, value) {
    //重新设置子节点坐标
  };
  PH['group.width'] = PH['node.width'] = function (d, value) {
    if (d.shapeEl) {
      d.shapeEl.attr('width', value);
    }
    //重绘所有连线
    d.links.forEach(link => {
      link.updatePath();
    });
  };
  PH['group.height'] = PH['node.height'] = function (d, value) {
    if (d.shapeEl) {
      d.shapeEl.attr('height', value);
    }
    //重绘所有连线
    d.links.forEach(link => {
      link.updatePath();
    });
  };
  PH['group.name'] = PH['node.name'] = function (d, value) {
    //绘制节点名称
    const node = d.el;
    if (d.textEl) {
      d.textEl.remove();
    }
    if (value) {
      d.textEl = node
        .append('text')
        .attr('data-sort', 1)
        .attr('class', 'name')
        .attr('font-size', 13)
        .attr('text-anchor', 'middle')
        .attr('y', d.getHeight() + 4)
        .attr('x', d.getWidth() / 2);
      d.textEl.append('title').text(value);
      const createText = function () {
        const width = Math.max(d.getWidth() * 1.2, 18 * 4); //比宽度大10%
        const words = value.split('').reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        let lineHeight = 1.1; // ems
        let y = d.textEl.attr('y');
        let dy = 1; //初始位置1em
        let tspanEl = d.textEl
          .append('tspan')
          .attr('class', 'node-name')
          .attr('x', d.getWidth() / 2)
          .attr('y', y)
          .attr('dy', dy + 'em');
        while (true) {
          word = words.pop();
          if (!word) {
            break;
          }
          line.push(word);
          tspanEl.text(line.join(''));
          if (tspanEl.node().getComputedTextLength() > width) {
            lineNumber++;
            line.pop();
            tspanEl.text(line.join(''));
            line = [word];
            tspanEl = d.textEl
              .append('tspan')
              .attr('class', 'node-name')
              .attr('x', d.getWidth() / 2)
              .attr('y', y)
              .attr('dy', lineNumber * lineHeight + dy + 'em')
              .text(word);
          }
        }
      };
      createText();
      d.canvas.watcher.add(d, ['width', 'height'], () => {
        if (d.textEl) {
          d.textEl.attr('y', d.getHeight() + 4).attr('x', d.getWidth() / 2);
          d.textEl.selectAll('.node-name').remove();
          createText();
        }
      });
    }
  };
  PH['group.x'] = PH['node.x'] = function (d, value) {
    //修改坐标
    if (d.el) {
      d.el.attr('transform', `translate(${value || 0},${d.getY() || 0})`);
      //重绘所有连线
      d.links.forEach(link => {
        link.updatePath();
      });
    }
  };
  PH['group.y'] = PH['node.y'] = function (d, value) {
    //修改坐标
    if (d.el) {
      d.el.attr('transform', `translate(${d.getX() || 0},${value || 0})`);
      //重绘所有连线
      d.links.forEach(link => {
        link.updatePath();
      });
    }
  };
  PH['group.rx'] = function (d, value) {
    if (d.shapeEl && d.getShape() === 'rect') {
      d.shapeEl.attr('rx', value);
    }
  };
  PH['group.ry'] = function (d, value) {
    if (d.shapeEl && d.getShape() === 'rect') {
      d.shapeEl.attr('ry', value);
    }
  };
  PH['node.dx'] = function (d, value) {
    //修改坐标
    if (value) {
      const newX = d.getX() + value;
      d.setX(newX);
    }
  };
  PH['node.dy'] = function (d, value) {
    //修改坐标
    if (value) {
      const newY = d.getY() + value;
      d.setY(newY);
    }
  };
  PH['group.dx'] = function (d, value) {
    //修改坐标
    if (value) {
      const newX = d.getX() + value;
      d.setX(newX);
      //重新设置子节点坐标
      if (d.nodes.length > 0) {
        d.nodes.forEach(node => {
          if (!d.draggingNode || d.draggingNode != node) {
            node.setDx(value);
          }
        });
      }
    }
  };
  PH['group.dy'] = function (d, value) {
    //修改坐标
    if (value) {
      const newY = d.getY() + value;
      d.setY(newY);
      //重新设置子节点坐标
      if (d.nodes.length > 0) {
        d.nodes.forEach(node => {
          if (!d.draggingNode || d.draggingNode != node) {
            node.setDy(value);
          }
        });
      }
    }
  };
  PH['group.animate'] = PH['node.animate'] = function (d, value) {
    if (d.animateEl) {
      d.animateEl.remove();
      d.animateEl = null;
    }
    if (d.shapeEl && value) {
      d.animateEl = d.el.append(() => {
        const animate = NodeAnimate.getAnimate(d);
        if (animate) {
          return animate.node();
        }
      });
      if (d.animateEl) {
        d.animateEl.lower();
      }
    }
  };
  PH['node.shape'] = function (d, value) {
    //绘制节点形状
    const node = d.el;
    if (node) {
      if (d.shapeEl) {
        d.shapeEl.remove();
      }
      //添加hover的区域
      /*node
        .append('svg:path')
        .attr('d', `M 0 0 L ${d.getWidth()} 0 L ${d.getWidth()} ${d.getHeight()} L 0 ${d.getHeight()} z`)
        .attr('transform', `translate(${-d.getWidth() / 2},${-d.getHeight() / 2})`)
        .attr('fill', 'transparent');*/
      //节点形状
      d.shapeEl = node.append(function () {
        return NodeShape.getShape(d, 0).node();
      });
      d.shapeEl.attr('class', 'shape');
      //补充阴影
      if (d.getNeedShadow()) {
        d.shapeEl.attr('filter', `url(#node-shadow-${d.canvas.getUuid()})`);
      }
      //补充颜色
      if (d.getFill()) {
        d.setFill(d.getFill());
      }
      if (d.getStroke()) {
        d.setStroke(d.getStroke());
      }
      if (d.getStrokewidth()) {
        d.setStrokewidth(d.getStrokewidth());
      }
      if (d.getAnimate()) {
        d.setAnimate(d.getAnimate());
      }
    }
  };
  PH['node.loadingcolor'] = function (d, value) {
    //加载环境
    if (value) {
      if (!d.loadingEl && !d.loadingMinEl) {
        const r = Math.min(d.getWidth(), d.getHeight()) / 2 - 10; //半径是高度或宽度的一半，并留3个像素padding
        d.loadingEl = d.el
          .append('circle')
          .attr('fill', 'none')
          .attr('stroke', value)
          .attr('stroke-width', 2)

          .attr('cx', d.getWidth() / 2)
          .attr('cy', d.getHeight() / 2)
          .attr('r', r);
        d.loadingMinEl = d.el
          .append('circle')
          .attr('fill', value)
          .attr('stroke', value)
          .attr('stroke-width', 1)
          .attr('opacity', '0.8')
          .attr('cx', d.getWidth() / 2 + 4)
          .attr('cy', d.getHeight() / 2 + 4)
          .attr('r', 2);
        d.loadingMinEl
          .append('animateTransform')
          .attr('attributeName', 'transform')
          .attr('type', 'rotate')
          .attr('dur', '2s')
          .attr('from', `0 ${d.getWidth() / 2} ${d.getHeight() / 2}`)
          .attr('to', `360 ${d.getWidth() / 2} ${d.getHeight() / 2}`)
          .attr('repeatCount', 'indefinite');
        //隐藏图标
        if (d.iconEl) {
          d.iconEl.attr('opacity', 0);
        }
      }
    } else {
      if (d.loadingEl && d.loadingMinEl) {
        d.loadingEl.remove();
        d.loadingMinEl.remove();
        d.loadingEl = null;
        d.loadingMinEl = null;
        //恢复显示图标
        if (d.iconEl) {
          d.iconEl.attr('opacity', 1);
        }
      }
    }
  };
  PH['group.fill'] = PH['node.fill'] = function (d, value) {
    //背景颜色
    if (d.shapeEl) {
      if (value) {
        d.shapeEl.style('fill', value);
      } else {
        d.shapeEl.style('fill', null);
      }
    }
    //动画
    if (d.animateShapeEl) {
      if (value) {
        d.animateShapeEl.style('fill', value);
      } else {
        d.animateShapeEl.style('fill', null);
      }
    }
  };
  PH['group.isDeleteable'] = PH['node.isDeleteable'] = function (d, value) {
    //是否显示删除按钮
    if (d.el) {
      if (value) {
        d.el
          .on('mouseenter.removebtn', function () {
            if (!d.getIsResizing() && !d.getIsDragging()) {
              if (!d.removeEl && d.el) {
                const iconSize = 14;
                d.removeEl = d.el
                  .append('g')
                  .attr('class', 'removeBtn')
                  .attr('data-mouseenter', 'removebtn')
                  .attr('transform', `translate(${d.getWidth() + 8}, -8)`)
                  .attr('opacity', 0)
                  .style('cursor', 'pointer');

                d.removeEl
                  .append('use')
                  .attr('x', -iconSize / 2)
                  .attr('y', -iconSize / 2)
                  .attr('width', iconSize)
                  .attr('height', iconSize)
                  .attr('xlink:href', '#tsfont-close-s')
                  .style('cursor', 'pointer');

                d.removeEl.on('click.removebtn', function () {
                  d3.event.stopPropagation();
                  d.destory();
                });

                d.canvas.watcher.add(d, 'width', () => {
                  if (d.removeEl) {
                    d.removeEl.attr('transform', `translate(${d.getWidth() + 8}, -8)`);
                  }
                });
                d.removeEl.raise();
              }
              d.removeEl
                .transition()
                .duration(200)
                .ease(d3.easeLinear)
                .attr('opacity', 1)
                .attr('transform', `translate(${d.getWidth() + 8}, -8) scale(1)`);
            }
          })
          .on('mouseleave.removebtn', function () {
            if (d.removeEl) {
              if (d.resetDeleteHandler) {
                clearTimeout(d.resetDeleteHandler);
                d.resetDeleteHandler = null;
              }
              d.resetDeleteHandler = setTimeout(() => {
                if (d.removeEl) {
                  d.removeEl
                    .transition()
                    .duration(200)
                    .ease(d3.easeLinear)
                    .attr('opacity', 0)
                    .attr('transform', `translate(${d.getWidth() + 8}, -8) scale(0)`)
                    .on('end', () => {
                      if (d.removeEl) {
                        d.removeEl.remove();
                        d.removeEl = null;
                      }
                    });
                }
              }, 1000);
            }
          });
      } else {
        d.el.on('mouseenter.removebtn', null);
        d.el.on('mouseleave.removebtn', null);
      }
    }
  };
  PH['group.isSelectable'] = PH['node.isSelectable'] = function (d, value) {
    //绘制节点选择框
    if (value) {
      //绑定选中事件
      if (d.el) {
        d.el.on('click.selectable', d => {
          d3.event.stopPropagation();
          if (!d.status.selected) {
            d.select();
          } else {
            d.unselect();
          }
        });
      }
    } else {
      if (d.el) {
        d.el.on('click.selectable', null);
      }
    }
  };
  PH['node.icon'] = function (d, value) {
    //绘制节点图标
    const node = d.el;
    if (d.iconEl) {
      d.iconEl.remove();
    }
    if (value) {
      const isIcon = value.startsWith('#');
      if (isIcon) {
        // eslint-disable-next-line no-eval
        value = eval("'" + value + "'");
        d.iconEl = node
          .append('use')
          .attr('xlink:href', value)
          .attr('data-sort', 11)
          .attr('class', 'icon')
          .attr('x', d.getWidth() / 2 - d.getIconsize() / 2)
          .attr('y', d.getHeight() / 2 - d.getIconsize() / 2)
          .attr('width', d.getIconsize())
          .attr('height', d.getIconsize());
        if (d.getIconcolor()) {
          d.iconEl.style('fill', d.getIconcolor());
        }
        if (d.getIconweight()) {
          d.iconEl.style('font-weight', d.getIconweight());
        }
      } else {
        d.iconEl = node
          .append('text')
          .attr('class', 'icon')
          .attr('x', d.getWidth() / 2)
          .attr('y', d.getHeight() / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .text(value);
        if (d.getIconcolor()) {
          d.iconEl.style('fill', d.getIconcolor());
        }
        if (d.getIconweight()) {
          d.iconEl.style('font-weight', d.getIconweight());
        }
      }
    }
  };
  PH['node.iconcolor'] = function (d, value) {
    //背景颜色
    if (d.iconEl) {
      if (value) {
        d.iconEl.style('fill', value);
      } else {
        d.iconEl.style('fill', null);
      }
    }
  };
  PH['node.iconweight'] = function (d, value) {
    if (d.iconEl) {
      if (value) {
        d.iconEl.style('font-weight', value);
      } else {
        d.iconEl.style('font-weight', null);
      }
    }
  };
  PH['group.stroke'] = PH['node.stroke'] = function (d, value) {
    if (d.shapeEl) {
      d.shapeEl.style('stroke', value);
    }
  };
  PH['group.strokewidth'] = PH['node.strokewidth'] = function (d, value) {
    if (d.shapeEl) {
      d.shapeEl.style('stroke-width', value);
    }
    //动画
    if (d.animateShapeEl) {
      d.animateShapeEl.style('stroke-width', value);
    }
  };
  PH['link.name'] = function (d, value) {
    if (d.el && d.linkEl) {
      if (d.nameEl) {
        d.nameEl.remove();
      }
      if (value) {
        const pos = d.getPosition();
        const pathLength = d.linkEl.node().getTotalLength();
        const linkPos = d.linkEl.node().getPointAtLength(pathLength / 2);
        d.nameEl = d.el.append('text').attr('class', 'name').attr('font-family', 'ts').attr('dy', '0.32em').attr('text-anchor', 'middle').attr('opacity', '1').attr('font-size', '12px').attr('filter', `url(#linktextbg${d.canvas.getUuid()})`);
        //反转字体
        if (pos.tx < pos.sx) {
          d.nameEl.attr('transform', 'rotate(180)').attr('transform-origin', linkPos.x + ' ' + linkPos.y);
        }

        d.nameEl
          .append('textPath')
          .attr('startOffset', '50%')
          .attr('href', '#link-traction' + d.getUuid())
          .append('tspan')
          .text(value)
          .attr('transform', 'rotate(180)');
      }
    }
  };
  PH['link.path'] = function (d, value) {
    //更新所有线段路径
    if (d.el) {
      const _this = d;
      d.el.selectAll('path').attr('d', value);
      //添加修正锚点
      if (d.getIsAdjustAnchor()) {
        const offset = 12; //线段之间要相差offset像素才会出来修正锚点
        let points = d.getPoints();
        let adjustAnchors = d.getAdjustAnchors();
        if (d.adjustAnchorElList) {
          d.adjustAnchorElList.forEach(anchor => {
            anchor.remove();
          });
        }
        d.adjustAnchorElList = [];
        const startPoint = points[0];
        const endPoint = points[points.length - 1];
        //最后一个点是终点，所以需要跳过
        for (let i = 1; i <= points.length - 2; i++) {
          const prevPoint = points[i - 1];
          const currPoint = points[i];
          const anchorDirection = adjustAnchors[i - 1];
          if (anchorDirection) {
            const anchorW = anchorDirection === 'v' ? 12 : 8;
            const anchorH = anchorDirection === 'h' ? 12 : 8;

            const data = { index: i, direction: anchorDirection, width: anchorW, height: anchorH };
            if ((anchorDirection === 'v' && Math.abs(startPoint.y - endPoint.y) > 2 * offset && Math.abs(currPoint.x - prevPoint.x) > offset) || (anchorDirection === 'h' && Math.abs(startPoint.x - endPoint.x) > 2 * offset && Math.abs(currPoint.y - prevPoint.y) > offset)) {
              data.x = (prevPoint.x + currPoint.x) / 2 + anchorW / 2;
              data.y = (prevPoint.y + currPoint.y) / 2 + anchorH / 2;
              if ((anchorDirection === 'h' && data.x >= Math.min(_this.getSx(), _this.getTx()) && data.x <= Math.max(_this.getSx(), _this.getTx())) || (anchorDirection === 'v' && data.y >= Math.min(_this.getSy(), _this.getTy()) && data.y <= Math.max(_this.getSy(), _this.getTy()))) {
                data.position = 'M'; //可以在起点和终点中间移动
              } else if ((anchorDirection === 'h' && data.x <= Math.min(_this.getSx(), _this.getTx())) || (anchorDirection === 'v' && data.y <= Math.min(_this.getSy(), _this.getTy()))) {
                data.position = 'L'; //可以往左无限移动
              } else if ((anchorDirection === 'h' && data.x >= Math.max(_this.getSx(), _this.getTx())) || (anchorDirection === 'v' && data.y >= Math.max(_this.getSy(), _this.getTy()))) {
                data.position = 'R'; //可以往右无限移动
              }
              let adjustAnchorEl = d.el
                .append('rect')
                .datum(data)
                .attr('fill', '#9f9f9f')
                .attr('rx', 3)
                .attr('ry', 3)
                .attr('fill-opacity', 0.6)
                .attr('width', anchorW)
                .attr('height', anchorH)
                .attr('opacity', d.status.selected ? 1 : 0)
                .attr('cursor', anchorDirection == 'v' ? 'ns-resize' : 'ew-resize')
                .attr('transform', `translate(${(prevPoint.x + currPoint.x) / 2 - anchorW / 2},${(prevPoint.y + currPoint.y) / 2 - anchorH / 2})`);
              const padding = 15;
              adjustAnchorEl.call(
                d3
                  .drag()
                  .on('start', d => {
                    _this.status.draging = true;
                    if (_this.removeEl) {
                      _this.removeEl.attr('opacity', '0');
                    }
                  })
                  .on('drag', d => {
                    if (d.direction === 'h') {
                      const newX = d3.event.x; //points[d.index - 1].x + d3.event.dx;
                      let canMove = false;
                      let sx = _this.getSx(),
                        tx = _this.getTx();
                      if (sx <= tx) {
                        if (_this.getSAnchor().dir === 'T' || _this.getSAnchor().dir === 'B' || _this.getSAnchor().dir === 'R') {
                          sx += padding;
                        } else {
                          sx -= padding;
                        }
                        if (_this.getTAnchor().dir === 'T' || _this.getTAnchor().dir === 'B' || _this.getTAnchor().dir === 'L') {
                          tx -= padding;
                        } else {
                          tx += padding;
                        }
                      } else {
                        if (_this.getSAnchor().dir === 'T' || _this.getSAnchor().dir === 'B' || _this.getSAnchor().dir === 'L') {
                          sx -= padding;
                        } else {
                          sx += padding;
                        }
                        if (_this.getTAnchor().dir === 'T' || _this.getTAnchor().dir === 'B' || _this.getTAnchor().dir === 'R') {
                          tx += padding;
                        } else {
                          tx -= padding;
                        }
                      }
                      if (d.position === 'M' && newX >= Math.min(sx, tx) && newX <= Math.max(sx, tx)) {
                        canMove = true;
                      } else if (d.position === 'L' && newX <= Math.min(sx, tx)) {
                        canMove = true;
                      } else if (d.position === 'R' && newX >= Math.max(sx, tx)) {
                        canMove = true;
                      }
                      if (canMove) {
                        points[d.index - 1].x = newX;
                        points[d.index].x = newX;
                      }
                    } else if (d.direction === 'v') {
                      const newY = d3.event.y; //points[d.index - 1].y + d3.event.dy;
                      let canMove = false;
                      let sy = _this.getSy(),
                        ty = _this.getTy();
                      if (sy <= ty) {
                        if (_this.getSAnchor().dir === 'L' || _this.getSAnchor().dir === 'R' || _this.getSAnchor().dir === 'B') {
                          sy += padding;
                        } else {
                          sy -= padding;
                        }
                        if (_this.getTAnchor().dir === 'L' || _this.getTAnchor().dir === 'R' || _this.getTAnchor().dir === 'T') {
                          ty -= padding;
                        } else {
                          ty += padding;
                        }
                      } else {
                        if (_this.getSAnchor().dir === 'L' || _this.getSAnchor().dir === 'R' || _this.getSAnchor().dir === 'T') {
                          sy -= padding;
                        } else {
                          sy += padding;
                        }
                        if (_this.getTAnchor().dir === 'L' || _this.getTAnchor().dir === 'R' || _this.getTAnchor().dir === 'B') {
                          ty += padding;
                        } else {
                          ty -= padding;
                        }
                      }
                      if (d.position === 'M' && newY >= Math.min(sy, ty) && newY <= Math.max(sy, ty)) {
                        canMove = true;
                      } else if (d.position === 'L' && newY <= Math.min(sy, ty)) {
                        canMove = true;
                      } else if (d.position === 'R' && newY >= Math.max(sy, ty)) {
                        canMove = true;
                      }
                      if (canMove) {
                        points[d.index - 1].y = newY;
                        points[d.index].y = newY;
                      }
                    }
                    _this.moveAnchor();
                  })
                  .on('end', d => {
                    _this.status.draging = false;
                  })
              );
              d.adjustAnchorElList.push(adjustAnchorEl);
            }
          }
        }
      }
      //修正文本位置
      if (d.nameEl) {
        const pos = d.getPosition();
        const padding = 15;
        //TODO 需要解决翻转后文字弯曲方向和曲线弯曲方向相反的问题，暂时没有好办法
        //反转字体
        if (pos.tx < pos.sx) {
          const pathLength = d.linkEl.node().getTotalLength();
          const linkPos = d.linkEl.node().getPointAtLength(pathLength / 2);
          d.nameEl.attr('transform', 'rotate(180)').attr('transform-origin', linkPos.x + ' ' + linkPos.y);
        } else {
          d.nameEl.attr('transform', null).attr('transform-origin', null);
        }
      }
    }
  };
  PH['link.isDeleteable'] = function (d, value) {
    if (value) {
      const _this = d;
      if (!d.removeEl && d.el) {
        d.removeEl = d.el.append('text').attr('class', 'removeIcon').attr('font-family', 'tsfont').attr('dy', '-6px').attr('text-anchor', 'middle').attr('opacity', '0');

        d.removeEl
          .append('textPath')
          .attr('startOffset', '50%')
          .attr('class', 'icon')
          .attr('xlink:href', `#link${d.getUuid()}`)
          .append('tspan')
          .text(eval("'" + '\ue870' + "'")); // tsfont-close-s 删除图标

        d.removeEl.on('click', () => {
          if (d.removeEl.attr('opacity')) {
            d3.event.stopPropagation();
            d.destory();
          }
        });
        //原先的写法是绑定在d.tractionLinkEl 现在是绑定在el上面，主要方便remove按钮的出现
        if (d.el) {
          d.el
            .on('mouseenter.removeline', d => {
              if (d.resetActiveHandler) {
                clearTimeout(d.resetActiveHandler);
                d.resetActiveHandler = null;
              }
              if (d.removeEl && !_this.status.draging) {
                d.removeEl.raise().attr('opacity', '1');
              }
            })
            .on('mouseleave.removeline', d => {
              if (d.resetActiveHandler) {
                clearTimeout(d.resetActiveHandler);
                d.resetActiveHandler = null;
              }
              d.resetActiveHandler = setTimeout(() => {
                if (d.removeEl) {
                  d.removeEl.attr('opacity', '0');
                }
              }, 1000); //延时1000毫秒消失，方便点中删除按钮
            });
        }
      }
    } else {
      if (d.removeEl) {
        d.removeEl.remove();
      }
      if (d.tractionLinkEl) {
        d.tractionLinkEl.on('mouseenter.removeline', null).on('mouseleave.removeline', null);
      }
    }
  };
  PH['link.isSelectable'] = function (d, value) {
    //绘制节点选择框
    if (value) {
      d.el.on('click.selectable', d => {
        //原先是绑定在d.tractionLinkEl 上面，如果有文案导致选中不了，因此改了绑定对象
        d3.event.stopPropagation();
        if (!d.status.selected) {
          d.select();
        } else {
          d.unselect();
        }
      });
    } else {
      if (d.el) {
        d.el.on('click.selectable', null); //原先是绑定在d.tractionLinkEl 上面，如果有文案导致选中不了，因此改了绑定对象
      }
    }
  };
  PH['link.animationTimes'] = function (d, value) {
    if (value === -1 || value > 0) {
      if (d.setAnimation) {
        d.setAnimation();
      }
    }
  };
  PH['link.stroke'] = function (d, value) {
    if (d.linkEl) {
      d.linkEl.style('stroke', value);
      if (d.markerStart) {
        d.markerStart.style('fill', value);
        d.markerStart.style('stroke', value);
      }
      if (d.markerEnd) {
        d.markerEnd.style('fill', value);
        d.markerEnd.style('stroke', value);
      }
      if (d.markerEndReverse) {
        d.markerEndReverse.style('fill', value);
        d.markerEndReverse.style('stroke', value);
      }
    }
  };
  PH['link.style'] = function (d, value) {
    if (d.linkEl) {
      if (value === 'solid') {
        d.linkEl.attr('stroke-dasharray', null);
      } else if (value === 'dotted') {
        d.linkEl.attr('stroke-dasharray', '5,3');
      }
    }
  };
  PH['link.class'] = function (d, value) {
    if (d.linkEl) {
      d.linkEl.attr('class', value);
      if (d.markerStart) {
        d.markerStart.attr('class', value);
      }
      if (d.markerEnd) {
        d.markerEnd.attr('class', value);
      }
      if (d.markerEndReverse) {
        d.markerEndReverse.attr('class', value);
      }
    }
  };
  PH['link.opacity'] = function (d, value) {
    if (d.linkEl) {
      d.linkEl.attr('stroke-opacity', value);
    }
  };
  PH['link.markerend'] = function (d, value) {
    if (d.linkEl) {
      if (value) {
        if (!d.getArrowreverse()) {
          if (!d.markerEnd) {
            d.markerEnd = d.canvas.defs.append('marker').classed('linkArrow', true).attr('id', `arrowEnd${d.getUuid()}`).attr('markerUnits', 'strokeWidth').attr('markerWidth', '12').attr('markerHeight', '14').attr('viewBox', '0 0 12 12').attr('refX', '10').attr('refY', '4').attr('orient', 'auto').append('path').attr('d', 'M2,0 L10,4 L2,8 L6,4 L2,0');
          }
          d.markerEnd.style('fill', d.getStroke());
          d.markerEnd.style('stroke', d.getStroke());
          d.markerEnd.raise();
          d.linkEl.attr('marker-end', `url(#arrowEnd${d.getUuid()})`);
        } else {
          if (!d.markerEndReverse) {
            //反向箭头
            d.markerEndReverse = d.canvas.defs.append('marker').classed('linkArrow', true).attr('id', `arrowEndReverse${d.getUuid()}`).attr('markerUnits', 'strokeWidth').attr('markerWidth', '12').attr('markerHeight', '14').attr('viewBox', '0 0 12 12').attr('refX', '10').attr('refY', '4').attr('orient', 'auto').append('path').attr('d', 'M2,4 L10,8 L6,4 L10,0 L2,4');
          }
          d.markerEndReverse.style('fill', d.getStroke());
          d.markerEndReverse.style('stroke', d.getStroke());
          d.markerEndReverse.raise();
          d.linkEl.attr('marker-end', `url(#arrowEndReverse${d.getUuid()})`);
        }
      } else {
        if (d.arrowEnd) {
          d.markerEnd.remove();
          d.markerEnd = null;
        }
        if (d.markerEndReverse) {
          d.markerEndReverse.remove();
          d.markerEndReverse = null;
        }
        d.linkEl.attr('marker-end', null);
      }
    }
  };
  PH['link.markerstart'] = function (d, value) {
    if (d.linkEl) {
      if (value) {
        if (!d.markerStart) {
          d.markerStart = d.canvas.defs.append('marker').classed('linkArrow', true).attr('id', `arrowStart${d.getUuid()}`).attr('markerUnits', 'userSpaceOnUse').attr('markerWidth', '12').attr('markerHeight', '12').attr('viewBox', '0 0 12 12').attr('refX', '3').attr('refY', '6').attr('orient', 'auto').append('circle').attr('r', 2).attr('cx', 3).attr('cy', 6);
        }
        d.markerStart.style('fill', d.getStroke());
        d.markerStart.style('stroke', d.getStroke());
        d.markerStart.raise();
        d.linkEl.attr('marker-start', `url(#arrowStart${d.getUuid()})`);
      } else {
        if (d.markerStart) {
          d.markerStart.remove();
          d.markerStart = null;
        }
        d.linkEl.attr('marker-start', null);
      }
    }
  };
  PH['link.arrowreverse'] = function (d, value) {
    if (d.linkEl) {
      if (d.getMarkerend()) {
        //重新触发添加指针
        d.setMarkerend(d.getMarkerend());
      }
    }
  };
  global.PH = PH;
});
