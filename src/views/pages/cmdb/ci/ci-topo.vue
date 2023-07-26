<template>
  <div style="position:relative">
    <div style="position:absolute;right:0px;top:0px" class="layout">
      <span
        v-for="(layout, index) in layoutList"
        :key="index"
        class="item fz10"
        :class="currentLayout == layout.engine ? 'text-primary' : 'text-grey'"
        style="cursor:pointer"
        @click="changeLayout(layout.engine)"
      >
        {{ layout.name }}
      </span>
    </div>
    <div id="graph" :style="error?'display:none':''" class="home-page"></div>
    <div v-if="error" class="text-grey" style="padding-top:50px;text-align:center">
      {{ error }}
    </div>
    <Loading :loadingShow="isloading" type="fix"></Loading>
  </div>
</template>
<script>
import * as d3 from 'd3-selection';
import '@/resources/assets/font/tsfont/font/tsfont.js';
import '@/resources/assets/font/tsfonts/iconfont.js';
import { graphviz } from 'd3-graphviz';
import { addEvent } from '@/resources/assets/js/event.js';
export default {
  name: '',
  components: {},
  props: {
    searchParam: { type: Object, default: null }
  },
  data() {
    return {
      isloading: false,
      currentLayout: 'dot',
      layoutList: [
        { engine: 'dot', name: this.$t('term.cmdb.topo.dot') },
        { engine: 'circo', name: this.$t('term.cmdb.topo.circo') },
        { engine: 'neato', name: this.$t('term.cmdb.topo.neato') },
        { engine: 'osage', name: this.$t('term.cmdb.topo.osage') },
        { engine: 'fdp', name: this.$t('term.cmdb.topo.fdp') },
        // { engine: 'sfdp', name: '大型无向布局' },
        { engine: 'twopi', name: this.$t('term.cmdb.topo.twopi') }
      ],
      graph: {},
      data: {},
      currentZoomLevelId: [],
      error: null
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
    changeLayout(layout) {
      this.currentLayout = layout;
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
      d3.select('#graph')
        .selectWithoutDataPropagation('svg')
        .transition()
        .duration(700)
        .attr('width', graphEl.offsetWidth - 10)
        .attr('height', window.innerHeight - 30 - this.getGraphTop(graphEl).y);
    },
    initGraph() {
      window.setTimeout(() => {
        const graphEl = document.getElementById('graph');
        let graph = d3.select('#graph');
        graph
          .on('dblclick.zoom', null)
          .on('wheel.zoom', null)
          .on('mousewheel.zoom', null);
        this.graph.graphviz = graph
          .graphviz()
          .height(window.innerHeight - 30 - this.getGraphTop(graphEl).y)
          .width(graphEl.offsetWidth - 10)
          .zoom(true)
          .fit(true)
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
      const param = this.searchParam;
      param.layout = this.currentLayout;
      this.$api.cmdb.ci.getCiTopoData(param).then(res => {
        try {
          const nodesString = this.handleImagePath(res.Return);
          this.loadImage(nodesString);
          this.graph.graphviz
            .transition()
            .height(window.innerHeight - 30 - this.getGraphTop(graphEl).y)
            .width(graphEl.offsetWidth - 10)
            .renderDot(nodesString)
            .on('end', () => {
            });
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
            if (g && g.id) {
              const ciid = g.id.replace('Ci_', '');
              this.toCiView(ciid);
            }
          });
        } catch (e) {
          const toponame = this.layoutList.find(layout => layout.engine == this.currentLayout);
          if (toponame) {
            this.error = this.$t('message.cmdb.topoerror', {target: toponame.name});
          }
        }
        this.isloading = false;
      });
    },
    handleImagePath(nodesString) {
      /**
       * 处理图片路径，本地开发环境，图片路径需带上租户，否则图片显示不出来
       * 获取image=最后一个/后的值，然后拼接resource/img/icons静态资源文件路径
       */
      if (!nodesString) {
        return '';
      }
      let regex = /image="(?:\/resource\/img\/icons\/|\/)([^\/"]+)"/g;// 正则匹配 image="/resource/img/icons/xxxxx.xxx.png" 或者 image="/xxxx.xxxx.png" 取最后一个/后的值
      let newNodesString = nodesString.replace(regex, (match, imageName) => {
        let imagePath = `resource/img/icons/${imageName}`;
        let newImagePath = process.env.NODE_ENV === 'development' ? `${process.env.VUE_APP_TENANT}/${imagePath}` : `${imagePath}`;
        return `image="/${newImagePath}"`;
      });
      return newNodesString;
    },
    unColorNode() {
      d3.selectAll('g path')
        .attr('style', '');
      d3.selectAll('g polygon')
        .attr('style', '');
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
    toCiView: function(ciId) {
      if (ciId) {
        this.$router.push({
          path: '/ci-view/' + ciId
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
