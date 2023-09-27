<template>
  <div>
    <TsContain :enableCollapse="true" :siderWidth="260" :rightWidth="300">
      <template v-slot:navigation><span>导航</span></template>
      <template v-slot:sider>
        <WidgetPanel :dnd="dnd" :graph="graph"></WidgetPanel>
      </template>
      <template v-slot:right>
        <div>
          <WidgetConfig
            v-if="currentWidget && currentWidgetId"
            :id="currentWidgetId"
            :widget="currentWidget"
            @data:update="updateWidgetData"
          ></WidgetConfig>
        </div>
      </template>
      <template v-slot:content>
        <GraphEditor
          ref="graphEditor"
          @ready="ready"
          @node:selected="nodeSelected"
          @node:unselected="nodeUnSelected"
        ></GraphEditor>
      </template>
    </TsContain>
  </div>
</template>
<script>
import { WIDGETS } from '@/views/pages/diagram/diagram/core/WidgetFactory.js';

export default {
  name: '',
  components: {
    WidgetConfig: resolve => require(['@/views/pages/diagram/diagram/widget-config/widget-config.vue'], resolve),
    GraphEditor: resolve => require(['@/views/pages/diagram/diagram/components/graph-editor.vue'], resolve),
    WidgetPanel: resolve => require(['@/views/pages/diagram/diagram/components/widget-panel.vue'], resolve)
  },
  props: {},
  data() {
    return {
      graph: null,
      dnd: null,
      currentWidget: null,
      currentWidgetId: null,
      widgetList: WIDGETS()
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    ready(graph, dnd) {
      this.graph = graph;
      this.dnd = dnd;
    },
    nodeUnSelected() {
      this.currentWidgetId == null;
      this.currentWidget = null;
    },
    nodeSelected(widget) {
      const w = this.widgetList.find(d => d.name === widget.name);
      if (w) {
        w.data = widget.data;
        this.currentWidgetId == null;
        this.currentWidget = null;
        this.$nextTick(() => {
          this.currentWidgetId = widget.id;
          this.currentWidget = w;
        });
      }
    },
    updateWidgetData(widgetId, data) {
      const node = this.graph.getCellById(widgetId);
      if (node) {
        node.replaceData(data);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
