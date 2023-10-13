<template>
  <div class="widgetitem-container">
    <Collapse>
      <Panel v-for="widgetType in widgetTypeList" :key="widgetType.name" :name="widgetType.name">
        {{ widgetType.label }}
        <div slot="content">
          <div
            v-for="(widget, index) in widgetType.widgets"
            :key="index"
            draggable="true"
            class="mt-xs"
            style="cursor:move"
            @dragstart="drag($event, widget)"
          >
            <span :class="widget.icon">{{ widget.label }}</span>
          </div>
        </div>
      </Panel>
    </Collapse>
  </div>
</template>
<script>
import { register } from '@antv/x6-vue-shape';
import { Graph, Node } from '@antv/x6';
import { WIDGET_TYPES } from '@/views/pages/diagram/graph/core/WidgetFactory.js';
import { NodeFactory } from '@/views/pages/diagram/graph/core/NodeFactory.js';
export default {
  name: '',
  components: {},
  props: {
    graph: { type: Graph },
    dnd: { type: Object }
  },
  data() {
    return {
      widgetTypeList: WIDGET_TYPES()
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
      this.widgetTypeList.forEach(widgetType => {
        widgetType.widgets.forEach(widget => {
          if (widget.config) {
            if (!widget.isVue) {
              Graph.registerNode(widget.name, widget.config, true);
            } else {
              register(widget.config);
            }
          }
        });
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';

.theme(@background-color) {
  .widgetitem-container {
    /deep/ .ivu-collapse-content {
      background-color: @background-color;
      > .ivu-collapse-content-box {
        padding-top: 0;
      }
    }
    /deep/ .ivu-collapse {
      border: none;
    }
  }
}
html {
  .theme(@default-background);

  &.theme-dark {
    .theme(@dark-background);
  }
}
</style>
