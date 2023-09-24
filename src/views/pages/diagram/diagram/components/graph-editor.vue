<template>
  <div id="container"></div>
</template>
<script>
import { Graph, ObjectExt } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
import { Dnd } from '@antv/x6-plugin-dnd';
import { WIDGETS } from '@/views/pages/diagram/diagram/widgets/widget-list.js';

export default {
  name: '',
  components: {},
  props: {
    panning: { type: Boolean, default: true }
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
    init: function() {
      if (!this.graph) {
        this.graph = new Graph({
          autoResize: true, //自动延伸画布
          panning: true, //拖拽平移
          mousewheel: {
            enabled: true, //滚动缩放
            modifiers: ['ctrl', 'meta']
          },
          grid: true,
          connecting: {
            // 配置全局的连线规则
            snap: true, // 是否自动吸附
            allowMulti: false, // 是否允许在相同的起始节点和终止之间创建多条边
            allowNode: false, // 是否允许边链接到节点（非节点上的链接桩）
            allowBlank: false, // 是否允许连接到空白点
            allowLoop: false, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点，
            allowEdge: false
          },
          //组合设置
          embedding: {
            enabled: true,
            //这里和api讲的不一样，需要返回空数组
            findParent: ({ view, node }) => {
              // 获取移动节点的包围盒
              const bbox = node.getBBox();
              const parentList = [];
              if (node.getProp('isChild')) {
                const parents = this.graph.getNodes().filter(d => d.getProp('isParent'));
                if (parents.length > 0) {
                  parents.forEach(p => {
                    const targetBBox = p.getBBox();
                    if (bbox.isIntersectWithRect(targetBBox)) {
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
          container: document.getElementById('container'),
          translating: {
            restrict: cellView => {
              const cell = cellView.cell;
              const parentId = cell.getProp('parentId');
              if (parentId) {
                const parentNode = this.graph.getCellById(parentId);
                if (parentNode) {
                  return parentNode.getBBox().moveAndExpand({
                    x: 0,
                    y: 30,
                    width: 0,
                    height: -30
                  });
                }
              }
              return true;
            }
          },
          width: 800,
          height: 600
        });
        this.graph.use(
          /*new Transform({
            resizing: { enabled: true }
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
          //拖的时候复制一次，放的时候又复制一次，真墨迹
          getDragNode: node => {
            //x6没有处理业务数据，还得自己处理，SB设计师
            const nn = node.clone({ keepId: true });
            nn.setData(node.getData());
            return nn;
          },
          getDropNode: node => {
            //x6没有处理业务数据，还得自己处理，SB设计师
            const nn = node.clone({ keepId: true });
            nn.setData(node.getData());
            const widget = WIDGETS.find(d => d.name === nn.shape);
            if (widget) {
              if (widget.event) {
                for (let e in widget.event) {
                  nn.on(e, ({cell, current}) => {
                    if (widget.event[e]) {
                      widget.event[e](cell, current);
                    }
                  });
                }
              }
            }
            return nn;
          }
        });
        //绑定选中事件
        this.graph.on('node:selected', ({ node }) => {
          this.$emit('node:selected', { id: node.id, name: node.shape, data: node.getData() });
        });
        this.graph.on('node:unselected', ({ node }) => {
          this.$emit('node:unselected');
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
<style lang="less"></style>
