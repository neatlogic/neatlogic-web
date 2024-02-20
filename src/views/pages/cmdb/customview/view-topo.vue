<template>
  <div>
    <div class="header">
      <div class="layout padding">
        <span
          v-for="(layout, index) in layoutList"
          :key="index"
          class="item fz10"
          :class="currentLayout == layout.engine ? 'text-primary' : 'text-grey'"
          style="cursor: pointer"
          @click="changeLayout(layout.engine)"
        >
          {{ layout.name }}
        </span>
      </div>
      <div style="padding-top: 9px" class="pr-md">
        <TsFormInput
          v-model="keyword"
          :search="true"
          placeholder="请输入关键字"
          @on-change="findNode"
        ></TsFormInput>
      </div>
    </div>
    <div id="graph" class="clearfix home-page"></div>
    <Loading :loadingShow="isloading" type="fix"></Loading>
  </div>
</template>
<script>
import * as d3 from 'd3-selection';
import '@/resources/assets/font/tsfonts/tsfont.js';
import '@/resources/assets/font/tsIconfont.js';
import { graphviz } from 'd3-graphviz';
import { addEvent } from './util/event.js';
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve)
  },
  props: {
    isShow: { type: Boolean, default: false },
    ciEntityId: { type: Number },
    viewId: { type: Number }
  },
  data() {
    return {
      isloading: false,
      keyword: '',
      currentLayout: 'dot',
      layoutList: [
        { engine: 'dot', name: this.$t('term.cmdb.topo.dot') },
        { engine: 'circo', name: this.$t('term.cmdb.topo.circo') },
        //{ engine: 'neato', name: '张力布局' },
        { engine: 'osage', name: this.$t('term.cmdb.topo.osage') },
        //{ engine: 'fdp', name: '无向布局' },
        { engine: 'twopi', name: this.$t('term.cmdb.topo.twopi') }
      ],
      graph: {},
      data: {},
      searchParam: { ciEntityId: this.ciEntityId, customViewId: this.viewId, level: 3 },
      currentZoomLevelId: [],
      nodeNameMap: {}
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
    findNode() {
      //d3.selectAll('.selectednode').classed('selectednode', false);
      d3.selectAll('.selectedcircle').remove();
      if (this.keyword.trim() != '') {
        for (let k in this.nodeNameMap) {
          if (k.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1) {
            this.nodeNameMap[k].forEach(element => {
              const g = this.findParentGroup(element);
              if (g && g._this) {
                const pos = g._this.getBBox();
                const cX = pos.x + pos.width / 2;
                const cY = pos.y + pos.height / 2;
                const r = 50;
                //d3.select(g._this).classed('selectednode', true);
                d3.select(g._this).append('circle').classed('selectedcircle', true).attr('cx', cX).attr('cy', cY).attr('r', r).attr('fill-opacity', 0.2).attr('fill', 'orange').attr('stroke-width', 0);
              }
            });
          }
        }
      }
    },
    findParentGroup(node) {
      if (node.attributes && node.attributes.class && node.attributes.class.indexOf('cinode') > -1) {
        return node;
      } else if (node.parent) {
        node.parent._this = node._this.parentNode;
        return this.findParentGroup(node.parent);
      }
    },
    changeLayout(layout) {
      this.currentLayout = layout;
    },
    changeLevel(name) {
      this.searchParam.level = name;
    },
    loadImage(nodesString) {
      (nodesString.match(/image=[^,]*(files\/\d*|png)/g) || [])
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        })
        .map(keyvaluepaire => keyvaluepaire.substr(7))
        .forEach(image => {
          this.graph.graphviz.addImage(image, '48px', '48px');
        });
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
      if (graphEl) {
        d3.select('#graph')
          .selectWithoutDataPropagation('svg')
          .transition()
          .attr('width', graphEl.offsetWidth - 10)
          .attr('height', window.innerHeight - 40 - this.getGraphTop(graphEl).y);
      }
    },
    initGraph() {
      window.setTimeout(() => {
        const graphEl = document.getElementById('graph');
        let graph = d3.select('#graph');
        const _this = this;
        graph.on('dblclick.zoom', null).on('wheel.zoom', null).on('mousewheel.zoom', null);
        this.graph.graphviz = graph
          .graphviz()
          .height(window.innerHeight - 40 - this.getGraphTop(graphEl).y)
          .width(graphEl.offsetWidth - 10)
          .zoom(true)
          .fit(false)
          .tweenShapes(false)
          .tweenPaths(false)
          .convertEqualSidedPolygons(false)
          .tweenPrecision('30%')
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
            if (d.tag == 'a') {
              d._this = this;
              if (_this.nodeNameMap[d.attributes['xlink:title']]) {
                _this.nodeNameMap[d.attributes['xlink:title']].push(d);
              } else {
                _this.nodeNameMap[d.attributes['xlink:title']] = [d];
              }
            }
          })
          .on('end', () => {});
        this.renderGraph();
        d3.select(window).on('resize', this.resizeSVG);
      }, 0);
    },
    renderGraph() {
      this.isloading = true;
      const graphEl = document.getElementById('graph');
      const param = this.searchParam;
      param.layout = this.currentLayout;
      this.$api.cmdb.customview.getCustomViewCiEntityTopoData(param).then(res => {
        if (!this.$utils.isEmpty(res.Return) && res.Return.dot) {
          const nodesString = this.$utils.handleTopoImagePath(res.Return.dot);
          this.loadImage(nodesString);
          this.graph.graphviz
            .transition()
            .height(window.innerHeight - 40 - this.getGraphTop(graphEl).y)
            .width(graphEl.offsetWidth - 10)
            .renderDot(nodesString);
          //let svg = d3.select('#graph').select('svg');
          //svg.append('g').lower();
          addEvent('svg', 'mouseover', e => {
            this.unColorNode();
            e.preventDefault();
            e.stopPropagation();
          });
          addEvent('.cinode', 'mouseover', async e => {
            e.preventDefault();
            e.stopPropagation();
            d3.selectAll('g').attr('cursor', 'pointer');
            this.g = e.currentTarget;
            this.nodeName = this.g.firstElementChild.textContent.trim();
            this.colorNode(this.nodeName);
          });
          addEvent('.cinode', 'click', async e => {
            const g = e.currentTarget;
            const className = d3.select(g).attr('class');
            if (className) {
              const ids = className
                .split(' ')
                .find(d => d.indexOf('CiEntity_') == 0)
                .split('_');
              this.toCiEntityView(ids[1], ids[2]);
            }
          });
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
    },
    toCiEntityView(ciId, ciEntityId) {
      if (ciId && ciEntityId) {
        this.$router.push({
          path: '/ci/' + ciId + '/cientity-view/' + ciEntityId
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    currentLayout: {
      handler: function(val) {
        this.renderGraph();
      }
    },
    searchParam: {
      handler: function(val) {
        this.renderGraph();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scope>
@import '../public/graphviz.less';
.header {
  display: grid;
  grid-template-columns: 70% 30%;
}
.layout {
  display: flex;
  .item {
    padding: 0 10px;
    position: relative;
    &:not(:last-child):after {
      content: '|';
      color: @dividing-color;
      top: 0;
      right: 0;
      position: absolute;
    }
  }
}
</style>
