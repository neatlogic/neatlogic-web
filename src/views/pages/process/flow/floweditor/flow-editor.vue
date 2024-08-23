<template>
  <div :style="{ height: height || '100%', width: width || '100%' }">
    <div
      id="graph-container"
      ref="container"
      class="graph-main"
      :class="{ transition: !!transition }"
    ></div>
  </div>
</template>
<script>
import { Graph, Shape } from '@antv/x6';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
import { Dnd } from '@antv/x6-plugin-dnd';
import { Snapline } from '@antv/x6-plugin-snapline';
import { History } from '@antv/x6-plugin-history';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { Export } from '@antv/x6-plugin-export';
import { ElementFactory } from '@/views/pages/process/flow/floweditor/element/core/ElementFactory.js';
export default {
  name: '',
  components: {
    //TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    mode: { type: String, default: 'graph' }, //graph|widget|template三种模式
    muted: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    grid: { type: Boolean, default: true },
    panning: { type: Boolean, default: true },
    transition: { type: Boolean, default: false }, //开启后transform会有过渡动画
    config: {
      //画布的配置，和x6数据结构无关
      type: Object,
      default: () => {
        return {};
      }
    },
    callback: { type: Object }, //回调函数
    height: { type: String },
    width: { type: String },
    strictMode: { type: Boolean, default: false }, //严格框选模式
    edgeMode: { type: Boolean, default: false },
    edgeType: { type: Boolean } //连线类型
  },
  data() {
    return {
      selectedCell: null,
      ctrlPressed: false, //是否按住ctrl/command
      drawingEdge: null,
      isDrawingLine: false,
      autoSelect: false, //激活添加时自动选中
      fromCiIdList: [], //连线上游支持的模型,edgeType不为空时需要校验
      toCiIdList: [] //连线下游支持的模型,edgeType不为空时需要校验
    };
  },
  beforeCreate() {},
  created() {
    this.registElement();
  },
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    //返回当前节点的所有后续节点，排除自己
    getAllNextNodeId(sourceNode, type) {
      let edgeList = this.graph.getEdges();
      if (type) {
        edgeList = edgeList.filter(d => d.prop('type') === type);
      }
      const foundNodeIdSet = new Set();
      const sourceNodeIdSet = new Set();
      foundNodeIdSet.add(sourceNode.id);
      sourceNodeIdSet.add(sourceNode.id);
      const find = (foundNodeIdSet, sourceNodeIdSet, edgeList) => {
        const targetNodeIdSet = new Set();
        edgeList.forEach(edge => {
          if (sourceNodeIdSet.has(edge.getSourceCellId())) {
            if (!foundNodeIdSet.has(edge.getTargetCellId())) {
              foundNodeIdSet.add(edge.getTargetCellId());
              targetNodeIdSet.add(edge.getTargetCellId());
            }
          }
        });
        if (targetNodeIdSet.size > 0) {
          find(foundNodeIdSet, targetNodeIdSet, edgeList);
        }
      };
      find(foundNodeIdSet, sourceNodeIdSet, edgeList);
      foundNodeIdSet.delete(sourceNode.id);
      return [...foundNodeIdSet];
    },
    toBack() {
      if (this.selectedCell) {
        this.selectedCell.toBack();
      }
    },
    toFront() {
      if (this.selectedCell) {
        this.selectedCell.toFront();
      }
    },
    getGraph() {
      return this.graph;
    },
    registElement() {
      //注册连线文字filter
      Graph.registerFilter(
        'lineText',
        () => {
          return `<filter x="0" y="0" width="1" height="1">
        <feFlood class="linktextbackground" flood-opacity="1"></feFlood>
        <feComposite in="SourceGraphic" operator="over"></feComposite>
        </filter>`;
        },
        true
      );
    },
    clearHighlight() {
      this.graph.getCells().forEach(cell => {
        this.unHighlightNode(cell);
      });
    },
    highlightEdge(edge, action) {
      if (edge && edge.isEdge()) {
        edge.setAttrByPath('line/class', 'line-' + action);
        edge.setAttrByPath('line/targetMarker/class', 'marker-' + action);
      }
    },
    unHighlightEdge(edge) {
      if (edge && edge.isEdge()) {
        edge.setAttrByPath('line/class', 'line');
        edge.setAttrByPath('line/targetMarker/class', 'marker');
      }
    },
    unHighlightNode(node) {
      if (node.getAttrs()['fo']) {
        node.setAttrByPath('fo/filter', null);
      } else if (node.getAttrs()['body']) {
        node.setAttrByPath('body/filter', null);
      } else if (node.getAttrs()['line']) {
        node.setAttrByPath('line/filter', null);
      }
    },
    highlightNode(node, color) {
      this.unHighlightNode(node);
      if (node.getAttrs()['fo']) {
        node.setAttrByPath('fo/filter', {
          name: 'outline',
          args: {
            color: color,
            width: 4,
            margin: 0,
            opacity: 0.2
          }
        });
      } else if (node.getAttrs()['body']) {
        node.setAttrByPath('body/filter', {
          name: 'outline',
          args: {
            color: color,
            width: 4,
            margin: 0,
            opacity: 0.2
          }
        });
      } else if (node.getAttrs()['line']) {
        node.setAttrByPath('line/filter', {
          name: 'outline',
          args: {
            color: color,
            width: 4,
            margin: 0,
            opacity: 0.2
          }
        });
      }
    },
    drawEdge(e) {
      const x = e.clientX;
      const y = e.clientY;
      const p = this.graph.clientToLocal({ x: x, y: y });
      this.drawingEdge.setTarget(p);
      this.drawingEdge.show();
    },
    init: function() {
      if (!this.graph) {
        let graphConfig = {
          container: this.$refs['container'],
          snapline: true,
          background: this.config.background,
          zoomAtMousePosition: true,
          autoResize: true, //自动延伸画布
          panning: this.panning, //拖拽平移
          mousewheel: {
            enabled: true, //滚动缩放
            modifiers: ['ctrl']
          },
          grid: {
            visible: this.grid,
            type: 'dot'
          },
          interacting: cellView => {
            if (this.readonly) {
              //禁止拖动
              //return true;
              return {
                nodeMovable: false, // 节点是否可以被移动
                magnetConnectable: false, // 当在具有 'magnet' 属性的元素上按下鼠标开始拖动时，是否触发连线交互。
                edgeMovable: false, // 边是否可以被移动。
                edgeLabelMovable: false, // 边的标签是否可以被移动。
                arrowheadMovable: false, // 边的起始/终止箭头是否可以被移动。
                vertexMovable: false, // 边的路径点是否可以被移动。
                vertexAddable: false, // 是否可以添加边的路径点。
                vertexDeletable: false // 边的路径点是否可以被删除
              };
            } else {
              if (!this.edgeMode) {
                if (!cellView.cell.getProp('setting')) {
                  return { nodeMovable: true };
                } else {
                  return { nodeMovable: !!cellView.cell.getProp('setting')['draggable'] };
                }
              } else {
                return { nodeMovable: !this.edgeMode };
              }
            }
          },
          connecting: {
            // 配置全局的连线规则
            allowMulti: false, // 是否允许在相同的起始节点和终止之间创建多条边
            allowNode: false, // 是否允许边链接到节点（非节点上的链接桩）
            allowPort: true, //是否允许边链接到连接桩
            allowBlank: false, // 是否允许连接到空白点
            allowLoop: false, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点，
            allowEdge: false,
            connector: {
              name: 'rounded',
              args: {
                radius: 8
              }
            },
            snap: {
              radius: 20
            },
            connectionPoint: {
              name: 'boundary',
              args: {
                sticky: true
              }
            },
            createEdge: ({ sourceCell }) => {
              const edge = new Shape.Edge({
                id: this.$utils.setUuid(),
                type: 'forward',
                router: {
                  name: 'manhattan'
                },
                attrs: {
                  line: {
                    class: 'line',
                    strokeWidth: 1,
                    sourceMarker: {
                      class: 'marker',
                      name: null,
                      width: 12,
                      height: 8
                    },
                    targetMarker: {
                      class: 'marker',
                      name: 'classic',
                      width: 12,
                      height: 8
                    }
                  }
                },
                data: { name: ''},
                zIndex: 0
              });
              return edge;
            },
            //点击 magnet 时 根据 validateMagnet 返回值来判断是否新增边，触发时机是 magnet 被按下，如果返回 false ，则没有任何反应，如果返回 true ，会在当前 magnet 创建一条新的边
            validateMagnet: ({ cell }) => {
              const element = ElementFactory.getElement({ handler: cell.getProp('handler'), type: cell.getProp('type') });
              if (element) {
                if (element.validateMagnet && typeof element.validateMagnet === 'function') {
                  return !!element.validateMagnet({ editor: this, sourceCell: cell, graph: this.graph });
                }
              }
              return true;
            },
            //在移动边的时候判断连接是否有效，如果返回 false ，当鼠标放开的时候，不会连接到当前元素，否则会连接到当前元素。
            validateConnection: ({ sourceCell, targetCell }) => {
              const sourceElement = ElementFactory.getElement({ handler: sourceCell.getProp('handler'), type: sourceCell.getProp('type') });
              let can = true;
              //先校验起始节点，允许连线再继续校验目标节点
              if (sourceElement) {
                if (sourceElement.validateConnection && typeof sourceElement.validateConnection === 'function') {
                  can = !!sourceElement.validateConnection({ editor: this, sourceCell, targetCell, graph: this.graph });
                }
              }
              if (!can) {
                return false;
              }
              const targetElement = ElementFactory.getElement({ handler: targetCell.getProp('handler'), type: targetCell.getProp('type') });
              if (targetElement) {
                if (targetElement.validateConnection && typeof targetElement.validateConnection === 'function') {
                  return !!targetElement.validateConnection({ editor: this, sourceCell, targetCell, graph: this.graph });
                }
              }
              return true;
            },
            //当停止拖动边的时候根据 validateEdge 返回值来判断边是否生效，如果返回 false , 该边会被清除。
            validateEdge: ({ edge }) => {
              const sourceCell = edge.getSourceCell();
              const targetCell = edge.getTargetCell();
              const sourceElement = ElementFactory.getElement({ handler: sourceCell.getProp('handler'), type: sourceCell.getProp('type') });
              let can = true;
              //先校验起始节点，允许连线再继续校验目标节点
              if (sourceElement) {
                if (sourceElement.validateEdge && typeof sourceElement.validateEdge === 'function') {
                  can = !!sourceElement.validateEdge({ edge, editor: this, sourceCell, targetCell, graph: this.graph });
                }
              }
              if (!can) {
                return false;
              }
              const targetElement = ElementFactory.getElement({ handler: targetCell.getProp('handler'), type: targetCell.getProp('type') });
              if (targetElement) {
                if (targetElement.validateEdge && typeof targetElement.validateEdge === 'function') {
                  return !!targetElement.validateEdge({ edge, editor: this, sourceCell, targetCell, graph: this.graph });
                }
              }
              return true;
            }
          },
          highlighting: {
            // 连接桩可以被连接时在连接桩外围围渲染一个包围框
            magnetAvailable: {
              name: 'className',
              args: {
                className: 'port-active'
              }
            },
            // 连接桩吸附连线时在连接桩外围围渲染一个包围框
            magnetAdsorbed: {
              name: 'className',
              args: {
                className: 'port-active'
              }
            }
          },
          //组合设置
          embedding: {
            enabled: true,
            //这里和api讲的不一样，需要返回空数组
            findParent: ({ view, node }) => {
              // 获取移动节点的包围盒
              const bbox = node.getBBox();
              const parentList = [];
              const parentNodeList = this.graph.getNodes().filter(d => node.id != d.id && d.getProp('setting') && d.getProp('setting')['children'] && (d.getProp('setting')['children'].includes('*') || d.getProp('setting')['children'].includes(node.shape)));
              if (parentNodeList.length > 0) {
                parentNodeList.forEach(p => {
                  const targetBBox = p.getBBox();
                  if (targetBBox.x < bbox.x && targetBBox.x + targetBBox.width > bbox.x + bbox.width && targetBBox.y < bbox.y && targetBBox.y + targetBBox.height > bbox.y + bbox.height) {
                    parentList.push(p);
                    node.setProp('parentId', p.id);
                  }
                });
              }
              return parentList;
            }
          },
          translating: {
            restrict: cellView => {
              const cell = cellView.cell;
              const parentId = cell.getProp('parentId');
              if (parentId) {
                const parentNode = this.graph.getCellById(parentId);
                if (parentNode) {
                  const element = ElementFactory.getElement({ handler: parentNode.getProp('handler'), type: parentNode.getProp('type') });
                  if (element && element.restrict) {
                    return element.restrict(parentNode);
                  }
                }
              }
              return false;
            }
          }
          //width: 800,
          //height: 300
        };
        this.graph = new Graph(graphConfig);
        if (!this.readonly) {
          this.graph.use(
            new History({
              enabled: true,
              beforeAddCommand: (event, arg) => {
                //console.log(event, arg);
                const cell = arg.cell;
                const key = arg.key;
                if (['tools'].includes(key)) {
                  return false;
                } /*else if (cell && cell.getProp('isAutofill')) {
                  return false;
                }*/
                return true;
              }
            })
          );
          this.graph.use(
            new Clipboard({
              enabled: true
            })
          );
          this.graph.use(
            new Selection({
              enabled: true,
              multiple: false,
              multipleSelectionModifiers: ['shift'],
              rubberband: true, //禁止拖动框选
              modifiers: ['meta'],
              movable: true,
              showNodeSelectionBox: false, //显示图元的选择框
              showEdgeSelectionBox: false, //显示边的选择框
              pointerEvents: 'none',
              filter: node => {
                const setting = node.getProp('setting');
                if (setting) {
                  if (setting['selectable']) {
                    return true;
                  } else {
                    return false;
                  }
                } else {
                  return true;
                }
              }
            })
          );
          this.graph.use(
            new Transform({
              resizing: {
                enabled: false
              }
            })
          );
        }
        this.graph.use(
          new Keyboard({
            enabled: true
          })
        );
        this.graph.use(
          new Snapline({
            enabled: true
          })
        );
        this.graph.use(new Export());
        this.dnd = new Dnd({
          target: this.graph,
          getDragNode: node => {
            return node.clone({
              keepId: true
            });
          },
          getDropNode: node => {
            this.autoSelect = true;
            return node.clone({
              keepId: true
            });
          },
          validateNode: node => {
            if (this.callback && this.callback.validateNode && typeof this.callback.validateNode === 'function') {
              return this.callback.validateNode(node);
            }
            return true;
          }
        });
        //绑定事件
        this.graph.on('node:mousedown', ({ node, e }) => {
          if (this.edgeMode) {
            let canLink = false;
            //根据edgeType判断是否允许连出，edgeType不为为空，要求连出节点必须是cmdb节点，且符合相关条件
            if (node.getProp('setting') && node.getProp('setting')['linkout']) {
              if (this.edgeType) {
                //和配置项有关联的连线，只能在架构图模式下才能绘制
                if (this.mode === 'graph' && node.getData()['ciId']) {
                  if (this.fromCiIdList && this.fromCiIdList.length > 0 && this.fromCiIdList.includes(node.getData()['ciId'])) {
                    canLink = true;
                  }
                }
              } else {
                canLink = true;
              }
            }
            if (canLink) {
              this.graph.startBatch('batch-edge');
              const x = e.clientX;
              const y = e.clientY;
              const p = this.graph.clientToLocal({ x: x, y: y });
              this.drawingEdge = this.graph.addEdge({
                id: this.$utils.setUuid(),
                source: node,
                target: p,
                router: {
                  name: 'normal'
                },
                markup: [
                  {
                    tagName: 'path',
                    selector: 'line',
                    attrs: {
                      fill: 'none'
                    }
                  },
                  {
                    tagName: 'text',
                    selector: 'label'
                  }
                ],
                attrs: {
                  line: {
                    class: 'line',
                    connection: true,
                    strokeWidth: 2,
                    sourceMarker: {
                      class: 'marker',
                      name: null,
                      width: 12,
                      height: 8
                    },
                    targetMarker: {
                      class: 'marker',
                      name: 'classic',
                      width: 12,
                      height: 8
                    }
                  },
                  label: {
                    /*filter: {
                      name: 'lineText',
                      attrs: {
                        x: 0,
                        y: 0,
                        width: 1,
                        height: 1
                      }
                    },*/
                    textPath: { selector: 'line', startOffset: '50%' },
                    textAnchor: 'middle',
                    textVerticalAnchor: 'bottom',
                    text: ''
                  }
                }
                /*tools: [
                  {
                    name: 'segments',
                    args: {
                      snapRadius: 20,
                      attrs: {
                        fill: '#444'
                      }
                    }
                  }
                ]*/
              });
              this.drawingEdge.hide();
              document.addEventListener('mousemove', this.drawEdge);
            }
          }
        });
        this.graph.on('node:mouseup', ({ node, e }) => {
          if (this.drawingEdge) {
            const x = e.clientX;
            const y = e.clientY;
            const p = this.graph.clientToLocal({ x: x, y: y });
            const nodes = this.graph.getNodesFromPoint(p.x, p.y);
            let targetNode = null;
            if (nodes.length > 0) {
              targetNode = nodes.sort((a, b) => {
                return b.zIndex - a.zIndex;
              })[0];
              //不能自己连线
              if (node.id === targetNode.id || !targetNode.getProp('setting') || !targetNode.getProp('setting')['linkin']) {
                targetNode = null;
              }
            }
            const edgeList = this.graph.getEdges();
            if (targetNode) {
              //检查连线是否存在
              if (edgeList.find(edge => edge.getSourceCellId() === node.id && edge.getTargetCellId() === targetNode.id)) {
                targetNode = null;
              }
            }
            let canLink = false;
            if (targetNode && this.edgeType) {
              //把数据设进边中
              this.drawingEdge.setData({
                type: this.edgeType.type,
                id: this.edgeType.id,
                name: this.edgeType.name
              });
              if (this.edgeType.type === 'rel') {
                this.drawingEdge.setData({
                  relId: this.edgeType.relId
                });
              } else if (this.edgeType.type === 'ci') {
                this.drawingEdge.setData({
                  ciId: this.edgeType.ciId,
                  fromRelId: this.edgeType.fromRelId,
                  toRelId: this.edgeType.toRelId
                });
              }
              //设置边的类型为cmdb
              this.drawingEdge.prop('type', 'cmdb');
              //和配置项有关联的连线，只能在架构图模式下才能绘制
              if (this.mode === 'graph' && targetNode.getData()['ciId']) {
                if (this.toCiIdList && this.toCiIdList.length > 0 && this.toCiIdList.includes(targetNode.getData()['ciId'])) {
                  canLink = true;
                  const fromCiEntityId = node.getData() && node.getData()['ciEntityId'];
                  const toCiEntityId = targetNode.getData()['ciEntityId'];
                  const toCiEntityName = targetNode.getData()['ciEntityName'];
                  const fromCiId = node.getData() && node.getData()['ciId'];
                  const toCiId = targetNode.getData()['ciId'];
                  //如果是CMDB关系，则补充fromCiEntityId和toCiEntityId，方便数据回显
                  this.drawingEdge.setData({
                    fromCiEntityId: fromCiEntityId,
                    toCiEntityId: toCiEntityId
                  });
                  //如果连线代表关系，直接生成relEntityData数据
                  if (this.edgeType.type === 'rel' && this.edgeType.relId) {
                    if (fromCiEntityId && toCiEntityId) {
                      const relEntityData = {};
                      relEntityData['relfrom_' + this.edgeType.relId] = {
                        valueList: [
                          {
                            ciEntityId: toCiEntityId,
                            ciEntityName: toCiEntityName,
                            ciId: toCiId
                          }
                        ]
                      };
                      this.drawingEdge.setData({
                        saveData: {
                          ciEntityList: [
                            {
                              id: fromCiEntityId,
                              ciId: fromCiId,
                              relEntityData: relEntityData,
                              editMode: 'partial'
                            }
                          ]
                        }
                      });
                    }
                  }
                }
              }
            } else {
              canLink = true;
            }

            if (targetNode && canLink) {
              this.drawingEdge.setTarget(targetNode);
              //设置路径点，让线可以自由拖动
              /*if (!this.drawingEdge.getRouter()) {
                const sourcePos = this.drawingEdge.getSourcePoint();
                const targetPos = this.drawingEdge.getTargetPoint();
                //if (sourcePos.y !== targetPos.y) {
                this.drawingEdge.setVertices([
                  {
                    x: sourcePos.x + (targetPos.x - sourcePos.x) / 2,
                    y: sourcePos.y
                  },
                  { x: sourcePos.x + (targetPos.x - sourcePos.x) / 2, y: targetPos.y }
                ]);
                //}
                this.graph.select(this.drawingEdge);
              }*/
            } else {
              this.graph.removeEdge(this.drawingEdge);
            }
            document.removeEventListener('mousemove', this.drawEdge);
            this.drawingEdge = null;
            this.graph.stopBatch('batch-edge');
          }
        });
        this.graph.on('node:click', ({ node }) => {
          if (!this.muted) {
            const data = node.getData();
            if (data && data.ciEntityId && data.ciId) {
              this.$emit('node:click:cientity', data.ciEntityId, data.ciId);
            }
          }
        });
        this.graph.on('node:mouseenter', ({ node }) => {
          //this.graph.disableHistory();
          /*const nodeList = this.graph.getNodes();
          nodeList.forEach(n => {
            const ports = n.getPorts() || [];
            ports.forEach(port => {
              n.setPortProp(port.id, 'attrs/circle', {
                class: 'port'
              });
            });
          });*/
          /*const ports = node.getPorts() || [];
          ports.forEach(port => {
            node.setPortProp(port.id, 'attrs/circle', {
              class: 'port'
            });
          });
          this.graph.enableHistory();*/
        });
        this.graph.on('node:mouseleave', ({ node }) => {
          //this.graph.disableHistory();
          /*const nodeList = this.graph.getNodes();
          nodeList.forEach(n => {
            const ports = n.getPorts() || [];
            ports.forEach(port => {
              n.setPortProp(port.id, 'attrs/circle', {
                class: 'port-hidden'
              });
            });
          });*/
          /*const ports = node.getPorts() || [];
          ports.forEach(port => {
            node.setPortProp(port.id, 'attrs/circle', {
              class: 'port-hidden'
            });
          });*/
          //this.graph.enableHistory();
        });
        this.graph.on('node:selected', ({ node }) => {
          //创建改变形状选中框
          //this.graph.createTransformWidget(node);
          this.graph.disableHistory();
          node.addTools({
            name: 'boundary',
            args: {
              padding: 5,
              attrs: {
                class: 'boundary'
              }
            }
          });
          if (node.getProp('setting') && node.getProp('setting')['deleteable']) {
            node.addTools({
              name: 'button-remove',
              args: {
                x: '100%',
                y: 0,
                offset: { x: 10, y: -10 }
              }
            });
          }
          this.selectedCell = node;
          //高亮连线
          const edges = this.graph.getConnectedEdges(node);
          if (edges && edges.length > 0) {
            edges.forEach(e => {
              this.highlightEdge(e, 'actived');
            });
          }
          this.$emit('node:selected', node);
          this.graph.enableHistory();
        });
        this.graph.on('node:unselected', ({ node }) => {
          this.graph.disableHistory();
          node.removeTool('boundary');
          if (node.hasTool('button-remove')) {
            node.removeTool('button-remove');
          }
          if (this.selectedCell && this.selectedCell.id === node.id) {
            const selected = this.graph.getSelectedCells();
            if (selected.length > 0) {
              this.selectedCell = selected[selected.length - 1];
              //由于节点已经处于选中状态，不能直接调用graph.select，只能手动emit
              if (this.selectedCell.isNode()) {
                this.$emit('node:selected', this.selectedCell);
              } else if (this.selectedCell.isEdge()) {
                this.$emit('edge:selected', this.selectedCell);
              }
            } else {
              this.selectedCell = null;
              this.$emit('node:unselected');
            }
          }
          //取消高亮连线
          const edges = this.graph.getConnectedEdges(node);
          if (edges && edges.length > 0) {
            edges.forEach(e => {
              this.unHighlightEdge(e);
            });
          }
          this.graph.enableHistory();
        });
        this.graph.on('edge:selected', ({ edge }) => {
          this.graph.disableHistory();
          if (this.selectedCell && this.selectedCell.isNode()) {
            this.$emit('node:unselected');
          }
          if (!edge.getRouter()) {
            edge.addTools({
              name: 'vertices',
              args: {
                attrs: { fill: '#444' }
              }
            });
          }
          this.highlightEdge(edge, 'selected');
          this.selectedCell = edge;
          this.$emit('edge:selected', edge);
          this.graph.enableHistory();
        });
        this.graph.on('edge:unselected', ({ edge }) => {
          this.graph.disableHistory();
          if (edge.hasTool('button-remove')) {
            edge.removeTool('button-remove');
          }
          if (edge.hasTool('vertices')) {
            edge.removeTool('vertices');
          }
          this.unHighlightEdge(edge);
          if (this.selectedCell && this.selectedCell.id === edge.id) {
            const selected = this.graph.getSelectedCells();
            if (selected.length > 0) {
              this.selectedCell = selected[selected.length - 1];
              if (this.selectedCell.isNode()) {
                this.$emit(
                  'node:selected',
                  {
                    id: this.selectedCell.id,
                    name: this.selectedCell.shape,
                    setting: this.selectedCell.getProp('setting'),
                    data: this.selectedCell.getData()
                  },
                  this.selectedCell
                );
              } else if (this.selectedCell.isEdge()) {
                this.$emit('edge:selected', this.selectedCell);
              }
            } else {
              this.selectedCell = null;
            }
            this.$emit('edge:unselected', edge);
          }
          this.graph.enableHistory();
        });
        this.graph.on('edge:mouseenter', ({ cell }) => {
          this.graph.disableHistory();
          cell.addTools([
            {
              name: 'button-remove',
              args: { distance: '50%' }
            }
          ]);
          this.graph.enableHistory();
        });
        this.graph.on('edge:mouseleave', ({ cell }) => {
          this.graph.disableHistory();
          if (cell.hasTool('button-remove')) {
            cell.removeTool('button-remove');
          }
          this.graph.enableHistory();
        });
        this.graph.on('node:contextmenu', ({ e, x, y, node, view }) => {
          console.log(x, y);
        });
        this.graph.on('node:embedding', ({ e }) => {
          this.ctrlPressed = e.metaKey || e.ctrlKey;
        });
        this.graph.on('node:embedded', () => {
          this.ctrlPressed = false;
        });
        this.graph.on('node:move', ({node}) => {
          this.graph.startBatch('node-move');
        });
        this.graph.on('node:moved', ({ node }) => {
          const outEdges = this.graph.getOutgoingEdges(node);
          const inEdges = this.graph.getIncomingEdges(node);
          const edges = [];
          if (outEdges && outEdges.length > 0) {
            edges.push(...outEdges);
          }
          if (inEdges && inEdges.length > 0) {
            edges.push(...inEdges);
          }

          edges.forEach(edge => {
            if (!edge.getRouter()) {
              const sourcePos = edge.getSourcePoint();
              const targetPos = edge.getTargetPoint();
              edge.setVertices([
                {
                  x: sourcePos.x + (targetPos.x - sourcePos.x) / 2,
                  y: sourcePos.y
                },
                { x: sourcePos.x + (targetPos.x - sourcePos.x) / 2, y: targetPos.y }
              ]);
            } else {
              edge.setVertices([]);
            }
          });
          this.graph.stopBatch('node-move');
        });
        this.graph.on('node:added', ({ node }) => {
          if (this.autoSelect) {
            this.graph.cleanSelection();
            this.graph.select(node);
            //拖拽时才打开此标记，避免粘贴时出现异常
            this.autoSelect = false;
          }
        });
        this.graph.on('view:mounted', cellView => {
          this.$emit('view:mounted', this.graph, cellView);
        });
        this.graph.on('node:removed', ({ view, e }) => {
          this.$emit('node:removed', this.graph, view);
        });
        /*this.graph.on('clipboard:changed', ({ cells }) => {
          console.log(cells);
          cells.forEach(d => {
            d.removeTools();
          });
        });*/

        /* this.lineTextFilterId = this.graph.defineFilter({
          name: 'lineText',
          attrs: {
            id: 'lineTextFilter',
            x: 0,
            y: 0,
            width: 1,
            height: 1
          }
        });
        console.log(this.lineTextFilterId);*/
        this.$emit('ready', this.graph, this.dnd);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    strictMode: {
      handler: function(val) {
        this.graph.toggleStrictRubberband(val);
      }
    },
    edgeType: {
      handler: function(edge) {
        if (edge && edge.id) {
          this.$api.diagram.diagram.getCiListByEdgeType(edge.id).then(res => {
            this.fromCiIdList = res.Return.fromCiIdList || [];
            this.toCiIdList = res.Return.toCiIdList || [];
          });
        } else {
          this.fromCiIdList = [];
          this.toCiIdList = [];
        }
      },
      immediate: true,
      deep: true
    },
    edgeMode: {
      handler: function(val) {
        if (val) {
          if (this.panning) {
            this.graph.disablePanning();
          }
          const edges = this.graph.getEdges();
          if (edges && edges.length > 0) {
            edges.forEach(edge => {
              edge.addTools({
                //name: 'segments',
                name: 'vertices',
                args: {
                  //snapRadius: 20,
                  attrs: {
                    fill: '#444'
                  }
                }
              });
            });
          }
        } else {
          if (this.panning) {
            this.graph.enablePanning();
          }
          const edges = this.graph.getEdges();
          if (edges && edges.length > 0) {
            edges.forEach(edge => {
              //edge.removeTool('segments');
              edge.removeTool('vertices');
            });
          }
        }
      }
    }
  }
};
</script>
<style lang="less">
@import './flow-editor.less';
</style>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';
.theme(@shadow-color) {
  .tool-bar {
    box-shadow: 0px 3px 4px 0px @shadow-color;
    width: 100%;
    z-index: 99;
    position: absolute;
    top: 0px;
    left: 0px;
    height: 30px;
    padding-top: 5px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }
}
html {
  .theme(@default-boxshadow-bolck);

  &.theme-dark {
    .theme(@dark-boxshadow-bolck);
  }
}
</style>
