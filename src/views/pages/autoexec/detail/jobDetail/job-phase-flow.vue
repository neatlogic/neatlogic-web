<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot>
      <div style="position: relative">
        <div id="graph" :style="error ? 'display:none' : ''" class="home-page graph"></div>
        <div v-if="error" class="text-grey" style="padding-top: 50px; text-align: center">
          {{ error }}
        </div>
        <Loading :loadingShow="isloading" type="fix"></Loading>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.close') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import * as d3 from 'd3-selection';
import '@/resources/assets/font/tsfonts/tsfont.js';
import '@/resources/assets/font/tsIconfont.js';
import { graphviz } from 'd3-graphviz';
import { addEvent } from '@/resources/assets/js/event.js';
export default {
  name: '',
  components: {},
  props: {
    jobId: { type: Number }
  },
  data() {
    return {
      isloading: false,
      graph: {},
      data: {},
      currentZoomLevelId: [],
      error: null,
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.$t('term.deploy.flowchart'),
        width: 'medium'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initGraph();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    getGraphTop(object, offset) {
      offset = offset || { x: 0, y: 0 };
      offset.x += object.offsetLeft;
      offset.y += object.offsetTop;
      if (object.offsetParent) {
        offset = this.getGraphTop(object.offsetParent, offset);
      }
      return offset;
    },
    resizeSVG() {
      const graphEl = document.getElementById('graph');
      d3.select('#graph')
        .selectWithoutDataPropagation('svg')
        .transition()
        .attr('width', graphEl.offsetWidth - 10)
        .attr('height', window.innerHeight - 30 - this.getGraphTop(graphEl).y);
    },
    initGraph() {
      window.setTimeout(() => {
        const graphEl = document.getElementById('graph');
        let graph = d3.select('#graph');
        graph.on('dblclick.zoom', null).on('wheel.zoom', null).on('mousewheel.zoom', null);
        if (!graph.graphviz) {
          graph.graphviz = graphviz;
        }
        this.graph.graphviz = graph
          .graphviz()
          .height(window.innerHeight - 30 - this.getGraphTop(graphEl).y)
          .width(graphEl.offsetWidth - 10)
          .zoom(true)
          .fit(true)
          .tweenShapes(false)
          .tweenPaths(false)
          .convertEqualSidedPolygons(false)
          .attributer(function(d) {
            if (d.attributes.class === 'edge') {
              let keys = d.key.split('->');
              let from = keys[0].trim();
              let to = keys[1].trim();
              d.attributes.from = from;
              d.attributes.to = to;
            }

            if (d.tag === 'text') {
              let key = d.children[0].text;
              d3.select(this).attr('text-key', key);
            }
          });
        this.renderGraph();
        d3.select(window).on('resize', this.resizeSVG);
      }, 0);
    },
    renderGraph() {
      this.isloading = true;
      this.error = '';
      const graphEl = document.getElementById('graph');
      this.$api.autoexec.job.getPhaseTopo(this.jobId).then(res => {
        try {
          const nodesString = res.Return;
          this.graph.graphviz
            .transition()
            .height(window.innerHeight - 30 - this.getGraphTop(graphEl).y)
            .width(graphEl.offsetWidth - 10)
            .renderDot(nodesString)
            .on('end', () => {});
          addEvent('svg', 'mouseover', e => {
            this.unColorNode();
            e.preventDefault();
            e.stopPropagation();
          });
          addEvent('.phasenode,.converge', 'mouseover', async e => {
            e.preventDefault();
            e.stopPropagation();
            d3.selectAll('g').attr('cursor', 'pointer');
            this.g = e.currentTarget;
            this.nodeName = this.g.firstElementChild.textContent.trim();
            this.colorNode(this.nodeName);
          });
        } catch (e) {
          const toponame = this.layoutList.find(layout => layout.engine == this.currentLayout);
          if (toponame) {
            this.error = this.$t('message.cmdb.topoerror', { target: toponame.name });
          }
        }
        this.isloading = false;
      });
    },
    unColorNode() {
      d3.selectAll('g path').attr('style', '');
      d3.selectAll('g polygon').attr('style', '');
      d3.selectAll('.edge text').attr('style', '');
    },
    colorNode(nodeName) {
      d3.selectAll('g[from="' + nodeName + '"] path').attr('style', 'stroke:orange !important');
      d3.selectAll('g[from="' + nodeName + '"] text').attr('style', 'fill:orange !important');
      d3.selectAll('g[from="' + nodeName + '"] polygon').attr('style', 'stroke:orange !important;fill:orange !important');
      d3.selectAll('g[to="' + nodeName + '"] path').attr('style', 'stroke:#6495ED !important');
      d3.selectAll('g[to="' + nodeName + '"] text').attr('style', 'fill:#6495ED !important');
      d3.selectAll('g[to="' + nodeName + '"] polygon').attr('style', 'stroke:#6495ED !important;fill:#6495ED !important');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scope>
@import '@/views/pages/autoexec/public/graphviz.less';
</style>
