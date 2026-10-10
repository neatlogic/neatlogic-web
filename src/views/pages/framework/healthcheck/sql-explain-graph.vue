<template>
  <div>
    <div v-if="model.source !== 'json'" class="text-tip mb-sm">{{ $t('term.framework.sqlplangraphfallback') }}</div>
    <div v-if="model.hasUnknown" class="text-tip mb-sm">{{ $t('term.framework.sqlplangraphunknown') }}</div>
    <div class="flex-between mb-sm">
      <span class="text-tip fz10">{{ $t('term.framework.sqlplangraphgesture') }}</span>
      <div class="action-group">
        <Button
          type="text"
          size="small"
          class="action-item text-action"
          :title="$t('term.framework.sqlplangraphzoomin')"
          :aria-label="$t('term.framework.sqlplangraphzoomin')"
          @click="zoom(0.15)"
        ><span class="tsfont-search-plus"></span></Button>
        <Button
          type="text"
          size="small"
          class="action-item text-action"
          :title="$t('term.framework.sqlplangraphzoomout')"
          :aria-label="$t('term.framework.sqlplangraphzoomout')"
          @click="zoom(-0.15)"
        ><span class="tsfont-search-minus"></span></Button>
        <Button
          type="text"
          size="small"
          class="action-item text-action"
          :title="$t('term.framework.sqlplangraphreset')"
          @click="resetZoom"
        >100%</Button>
        <Button
          type="text"
          size="small"
          class="action-item text-action"
          :title="$t('term.framework.sqlplangraphfit')"
          :aria-label="$t('term.framework.sqlplangraphfit')"
          @click="fitAll"
        ><span class="tsfont-center"></span></Button>
      </div>
    </div>
    <div v-if="model.nodes.length" ref="container" class="sql-plan-graph-canvas bg-grey text-tip radius-md"></div>
    <NoData v-else></NoData>
    <div v-if="rawData" class="mt-sm">
      <div class="flex-between mb-xs">
        <strong>{{ $t('term.framework.sqlplangraphraw') }} · {{ rawTitle }}</strong>
        <span class="tsfont-close text-action" :title="$t('page.close')" @click="rawData = null"></span>
      </div>
      <JsonViewer boxed copyable :value="rawData"></JsonViewer>
    </div>
  </div>
</template>
<script>
import { Graph } from '@antv/x6';
import { register } from '@antv/x6-vue-shape';
import { DagreLayout } from '@antv/layout';
import SqlExplainGraphNode from './sql-explain-graph-node.vue';
import { buildExplainGraph } from './sql-explain-graph-utils';

const NODE_SHAPE = 'sql-explain-plan-node';
let registered = false;

export default {
  name: 'SqlExplainGraph',
  components: {
    JsonViewer: () => import('vue-json-viewer')
  },
  props: {
    planJson: { type: Object, default: null },
    rows: { type: Array, default: () => [] },
    theadList: { type: Array, default: () => [] }
  },
  data() {
    return { rawData: null, rawTitle: '' };
  },
  mounted() {
    this.renderGraph();
  },
  beforeDestroy() {
    // 关闭弹窗时同时释放尺寸监听、待执行帧和X6内部的Vue实例与DOM监听。
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
    if (this.graph) this.graph.dispose();
    this.graph = null;
  },
  methods: {
    renderGraph() {
      // 等待中的nextTick可能晚于弹窗关闭，已销毁组件不再创建画布。
      if (this._isBeingDestroyed || this._isDestroyed) return;
      if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = null;
      // 同一页面可反复打开弹窗，Vue节点形状只注册一次。
      if (!registered) {
        register({ shape: NODE_SHAPE, width: 250, height: 216, component: SqlExplainGraphNode });
        registered = true;
      }
      if (this.graph) this.graph.dispose();
      if (this.resizeObserver) this.resizeObserver.disconnect();
      this.graph = null;
      this.rawData = null;
      const container = this.$refs.container;
      if (!container || !this.model.nodes.length) return;
      this.graph = new Graph({
        container,
        width: Math.max(1, container.clientWidth),
        height: 360,
        panning: { enabled: true, eventTypes: ['leftMouseDown'] },
        mousewheel: { enabled: true, modifiers: ['ctrl', 'meta'], minScale: 0.15, maxScale: 2 },
        interacting: {
          nodeMovable: false,
          magnetConnectable: false,
          edgeMovable: false,
          arrowheadMovable: false,
          vertexMovable: false,
          vertexAddable: false,
          vertexDeletable: false
        }
      });
      const labels = {
        index: this.$t('term.framework.sqlplanindex'),
        rows: this.$t('term.framework.sqlplanestimatedrows'),
        filtered: this.$t('term.framework.sqlplangraphfiltered'),
        raw: this.$t('term.framework.sqlplangraphraw')
      };
      const nodes = this.model.nodes.map(node => ({ ...node, size: [250, node.kind === 'table' ? 216 : 120] }));
      // Dagre坐标是节点中心点，X6使用左上角；模型中的JSON路径ID直接沿用。
      const layout = new DagreLayout({ rankdir: 'LR', nodesep: 24, ranksep: 48, controlPoints: true });
      layout.layout({ nodes, edges: this.model.edges.map(edge => ({ ...edge })) });
      const cells = nodes.map(node => ({
        id: node.id,
        shape: NODE_SHAPE,
        width: node.size[0],
        height: node.size[1],
        x: node.x - node.size[0] / 2,
        y: node.y - node.size[1] / 2,
        data: { ...node, labels: { ...labels, kind: this.$t('term.framework.sqlplangraphkind' + node.kind) } }
      }));
      this.model.edges.forEach(edge => cells.push({
        id: edge.id,
        shape: 'edge',
        source: { cell: edge.source, anchor: 'right' },
        target: { cell: edge.target, anchor: 'left' },
        connector: { name: 'rounded', args: { radius: 10 } },
        router: { name: 'manhattan', args: { padding: 16 } },
        attrs: { line: { stroke: 'currentColor', strokeWidth: 1.5, strokeDasharray: edge.dashed ? '5 4' : '', targetMarker: { name: 'classic', size: 7 } } },
        zIndex: 0
      }));
      this.graph.fromJSON({ cells });
      this.graph.on('sql-plan:raw', ({ data }) => {
        this.rawData = data.raw;
        this.rawTitle = data.table || data.title || '—';
      });
      this.fitAll();
      // 监听画布实际宽度，TsDialog切换全屏与浏览器尺寸变化都能重新适配。
      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
        this.resizeFrame = requestAnimationFrame(() => {
          this.resizeFrame = null;
          if (this.graph && this.$refs.container) {
            this.graph.resize(this.$refs.container.clientWidth, 360);
            this.fitAll();
          }
        });
      });
      this.resizeObserver.observe(container);
    },
    zoom(delta) {
      if (this.graph) this.graph.zoomTo(Math.max(0.15, Math.min(2, this.graph.zoom() + delta)));
    },
    resetZoom() {
      // 恢复实际卡片尺寸后居中，溢出的图仍可通过平移查看。
      if (this.graph) {
        this.graph.zoomTo(1);
        this.graph.centerContent();
      }
    },
    fitAll() {
      if (this.graph) this.graph.zoomToFit({ padding: 20, maxScale: 1, minScale: 0.15 });
    }
  },
  computed: {
    model() {
      return buildExplainGraph(this.planJson, this.rows, this.theadList);
    }
  },
  watch: {
    model() {
      this.$nextTick(this.renderGraph);
    }
  }
};
</script>
<style lang="less" scoped>
/* 图引擎需要固定高度容器；背景与连线颜色均继承公共主题类。 */
.sql-plan-graph-canvas {
  height: 360px;
  width: 100%;
  overflow: hidden;
}
</style>
