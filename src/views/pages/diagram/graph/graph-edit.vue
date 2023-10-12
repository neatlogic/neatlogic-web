<template>
  <div>
    <TsContain :enableCollapse="true" :rightWidth="300">
      <template v-slot:navigation><span>导航</span></template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item tsfont-save" @click="save()">保存</div>
        </div>
      </template>
      <template v-slot:sider>
        <div class="pr-md">
          <WidgetPanel :dnd="dnd" :graph="graph"></WidgetPanel>
        </div>
      </template>
      <template v-slot:right>
        <div class="pl-md">
          <WidgetConfig
            v-if="currentWidget && currentWidgetId"
            :id="currentWidgetId"
            :widget="currentWidget"
            @data:update="updateWidgetData"
          ></WidgetConfig>
          <GraphConfig v-else :graphData="graphData" :graph="graph"></GraphConfig>
        </div>
      </template>
      <template v-slot:content>
        <GraphEditor
          ref="graphEditor"
          :graphData="graphData"
          @ready="ready"
          @node:selected="nodeSelected"
          @node:unselected="nodeUnSelected"
        ></GraphEditor>
      </template>
    </TsContain>
  </div>
</template>
<script>
import { WIDGET_TYPES } from '@/views/pages/diagram/graph/core/WidgetFactory.js';

export default {
  name: '',
  components: {
    WidgetConfig: resolve => require(['@/views/pages/diagram/graph/widget-config/widget-config.vue'], resolve),
    GraphConfig: resolve => require(['@/views/pages/diagram/graph/widget-config/components/graph-config.vue'], resolve),
    GraphEditor: resolve => require(['@/views/pages/diagram/graph/components/graph-editor.vue'], resolve),
    WidgetPanel: resolve => require(['@/views/pages/diagram/graph/components/widget-panel.vue'], resolve)
  },
  props: {},
  data() {
    return {
      graph: null,
      dnd: null,
      graphData: {},
      currentWidget: null,
      currentWidgetId: null,
      selectedNode: null,
      widgetTypeList: WIDGET_TYPES()
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
    toBack() {

    },
    toFront() {

    },
    save() {
      console.log(JSON.stringify({ config: this.graphData, ...this.graph.toJSON() }, null, 2));
    },
    ready(graph, dnd) {
      this.graph = graph;
      this.dnd = dnd;
      //this.graph.fromJSON();
    },
    nodeUnSelected() {
      this.currentWidgetId == null;
      this.currentWidget = null;
    },
    nodeSelected(widget) {
      for (let i = 0; i < this.widgetTypeList.length; i++) {
        const type = this.widgetTypeList[i];
        const w = type.widgets.find(d => d.name === widget.name);
        if (w) {
          w.data = widget.data;
          this.currentWidgetId == null;
          this.currentWidget = null;
          this.$nextTick(() => {
            this.currentWidgetId = widget.id;
            this.currentWidget = w;
          });
          break;
        }
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
