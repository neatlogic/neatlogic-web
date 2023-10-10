<template>
  <div id="container" class="graph-main"></div>
</template>
<script>
import { Graph, Shape } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
import { Dnd } from '@antv/x6-plugin-dnd';
import { WidgetFactory } from '@/views/pages/diagram/diagram/core/WidgetFactory.js';
import { NodeFactory } from '@/views/pages/diagram/diagram/core/NodeFactory.js';
export default {
  name: '',
  components: {},
  props: {
    graphData: { type: Object, default: {} }
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
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
    createNode(nn) {
      return NodeFactory.createNode(this.graph, nn.shape);
    },
    init: function() {
      if (!this.graph) {
        let graphConfig = {
          container: document.getElementById('container'),
          snapline: true,
          background: this.graphData.background,
          autoResize: true, //自动延伸画布
          panning: true, //拖拽平移
          mousewheel: {
            enabled: true, //滚动缩放
            modifiers: ['ctrl', 'meta']
          },
          grid: true,
          connecting: {
            // 配置全局的连线规则
            allowMulti: false, // 是否允许在相同的起始节点和终止之间创建多条边
            allowNode: false, // 是否允许边链接到节点（非节点上的链接桩）
            allowBlank: false, // 是否允许连接到空白点
            allowLoop: false, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点，
            allowEdge: false,
            connector: {
              name: 'rounded',
              args: {
                radius: 8
              }
            },
            anchor: 'center',
            connectionPoint: 'anchor',
            snap: {
              radius: 20
            },
            createEdge: () => {
              const edge = new Shape.Edge({
                router: {
                  name: this.graphData?.connecting?.router || 'manhattan'
                },
                attrs: {
                  line: {
                    class: 'line',
                    strokeWidth: 2,
                    targetMarker: {
                      class: 'marker',
                      name: 'block',
                      width: 12,
                      height: 8
                    }
                  }
                },
                zIndex: 0
              });
              edge.addTools([
                {
                  name: 'vertices',
                  args: {
                    attrs: { class: 'vertice' }
                  }
                }
              ]);
              return edge;
            },
            validateConnection({ targetMagnet }) {
              return !!targetMagnet;
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
              let parentTypeList = (node.getData() && node.getData()['parent']) || [];
              if (parentTypeList.length > 0) {
                const parentNodeList = this.graph.getNodes().filter(d => parentTypeList.includes(d.shape) && d.getData() && d.getData()['children'] && d.getData()['children'].length > 0 && d.getData()['children'].includes(node.shape));
                if (parentNodeList.length > 0) {
                  parentNodeList.forEach(p => {
                    const targetBBox = p.getBBox();
                    if (bbox.isIntersectWithRect(targetBBox)) {
                      p.toBack();
                      parentList.push(p);
                      node.setProp('parentId', p.id);
                    }
                  });
                }
              }
              // 找到 data 中配置 { parent: true } 的节点，并且移动节点和找到的节点包围盒相交时，返回 true
              /*return this.getNodes().filter((node) => {
                const data = node.getData<{ parent: boolean }>();
                if (data && data.parent) {
                  const targetBBox = node.getBBox();
                  return bbox.isIntersectWithRect(targetBBox);
                }
                return false;
              });*/

              return parentList;
            }
          },
          translating: {
            restrict: cellView => {
              const cell = cellView.cell;
              const parentId = cell.getProp('parentId');
              if (parentId) {
                const parentNode = this.graph.getCellById(parentId);
                const widget = WidgetFactory.getWidget(parentNode.shape);
                if (widget && widget.restrict) {
                  return widget.restrict(parentNode);
                }
              }
              return false;
            }
          },
          width: 800,
          height: 600
        };
        //graphConfig = this.$utils.merge(graphConfig, this.graphData);
        //console.log(graphConfig);
        this.graph = new Graph(graphConfig);
        this.graph.use(
          /*new Transform({
            resizing: {
              enabled: (node) => {
                if (node.getData() && node.getData()['isResizable']) {
                  return true;
                }
                return false;
              }
            }
          }),*/
          new Selection({
            enabled: true,
            multiple: false,
            rubberband: false,
            movable: false,
            showNodeSelectionBox: true
          })
        );
        this.dnd = new Dnd({
          target: this.graph,
          getDragNode: nn => {
            return this.createNode(nn);
          },
          getDropNode: nn => {
            return this.createNode(nn);
          }
        });
        this.graph.on('node:mouseenter', ({ node }) => {
          const ports = node.getPorts() || [];
          ports.forEach((port) => {
            node.setPortProp(port.id, 'attrs/circle', {
              class: 'port'
            });
          });
        });
        this.graph.on('node:mouseleave', ({ node }) => {
          const ports = node.getPorts() || [];
          ports.forEach((port) => {
            node.setPortProp(port.id, 'attrs/circle', {
              class: 'port hidden'
            });
          });
        });
        this.graph.on('node:selected', ({ node }) => {
          this.$emit('node:selected', { id: node.id, name: node.shape, data: node.getData() });
          node.addTools({
            name: 'button-remove',
            args: {
              x: '100%',
              y: 0,
              offset: { x: 0, y: 0 }
            }
          });
        });
        this.graph.on('node:unselected', ({ node }) => {
          this.$emit('node:unselected');
          node.removeTools();
        });
        this.graph.on('edge:mouseenter', ({ cell }) => {
          cell.addTools([
            {
              name: 'button-remove',
              args: { distance: '50%' }
            }
          ]);
        });

        this.graph.on('edge:mouseleave', ({ cell }) => {
          if (cell.hasTool('button-remove')) {
            cell.removeTool('button-remove');
          }
        });
        this.$emit('ready', this.graph, this.dnd);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
@import './graph-editor.less';
</style>
