<template>
  <div v-if="widgetList && widgetList.length > 0">
    <div
      v-for="(widget, index) in widgetList"
      :key="index"
      draggable="true"
      @dragstart="drag($event, widget)"
    >
      {{ widget.label }}
    </div>
  </div>
</template>
<script>
import { register } from '@antv/x6-vue-shape';
import { Graph, Node } from '@antv/x6';
import { WIDGETS } from '@/views/pages/diagram/diagram/core/WidgetFactory.js';
import { NodeFactory } from '@/views/pages/diagram/diagram/core/NodeFactory.js';
export default {
  name: '',
  components: {},
  props: {
    graph: { type: Graph },
    dnd: { type: Object }
  },
  data() {
    return {
      widgetList: WIDGETS()
    };
  },
  beforeCreate() {},
  created() {
    this.registerWidget();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    drag(event, widget) {
      const node = NodeFactory.createNode(this.graph, widget.name);
      this.dnd.start(node, event);
    },
    registerWidget() {
      this.widgetList.forEach(widget => {
        if (!widget.isVue && widget.config) {
          Graph.registerNode(widget.name, widget.config, true);
        } else {
          register(widget.config);
        }
      });
    },
    registerWidget_bak() {
      this.$api.diagram.widget.listWidgetList({ isActive: 1 }).then(res => {
        this.widgetList = res.Return;
        if (this.widgetList && this.widgetList.length > 0) {
          this.widgetList.forEach(widget => {
            if (widget.config) {
              const n = Graph.registerNode(widget.name, widget.config, true);
              n.config({
                propHooks: {
                  size(metadata) {
                    const { size, ...others } = metadata;
                    if (size != null) {
                      console.log(size);
                    }
                    return metadata;
                  }
                }
              });
            }
          });
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
