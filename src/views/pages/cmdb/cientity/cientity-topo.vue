<template>
  <div>
    <div class="padding">
      <div class="grid">
        <div class="action-group">
          <div class="action-item">
            <Dropdown placement="bottom-start" @on-click="changeLevel">
              <a href="javascript:void(0)">
                {{ $t('term.cmdb.extendlevel') }}
                <b style="margin-left: 3px">{{ searchParam.level }}</b>
                <Icon type="ios-arrow-down"></Icon>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem name="1" :selected="searchParam.level == 1">{{ $t('term.cmdb.levelnumber', { level: 1 }) }}</DropdownItem>
                <DropdownItem name="2" :selected="searchParam.level == 2">{{ $t('term.cmdb.levelnumber', { level: 2 }) }}</DropdownItem>
                <DropdownItem name="3" :selected="searchParam.level == 3">{{ $t('term.cmdb.levelnumber', { level: 3 }) }}</DropdownItem>
                <DropdownItem name="4" :selected="searchParam.level == 4">{{ $t('term.cmdb.levelnumber', { level: 4 }) }}</DropdownItem>
                <DropdownItem name="5" :selected="searchParam.level == 5">{{ $t('term.cmdb.levelnumber', { level: 5 }) }}</DropdownItem>
                <DropdownItem name="6" :selected="searchParam.level == 6">{{ $t('term.cmdb.levelnumber', { level: 6 }) }}</DropdownItem>
                <DropdownItem name="7" :selected="searchParam.level == 7">{{ $t('term.cmdb.levelnumber', { level: 7 }) }}</DropdownItem>
                <DropdownItem name="8" :selected="searchParam.level == 8">{{ $t('term.cmdb.levelnumber', { level: 8 }) }}</DropdownItem>
                <DropdownItem name="9" :selected="searchParam.level == 9">{{ $t('term.cmdb.levelnumber', { level: 9 }) }}</DropdownItem>
                <DropdownItem name="10" :selected="searchParam.level == 10">{{ $t('term.cmdb.levelnumber', { level: 10 }) }}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div class="action-item">
            <Dropdown placement="bottom-start" :transfer="true" @on-click="changeDisableRel">
              <a href="javascript:void(0)">
                {{ $t('term.cmdb.showrel') }}
                <Icon type="ios-arrow-down"></Icon>
              </a>
              <DropdownMenu slot="list">
                <template v-for="relType in relTypeList">
                  <DropdownItem :key="relType.id" :name="'reltype_' + relType.id" :selected="isRelTypeSelected(relType)">
                    <span class="text-grey">{{ relType.name }}</span>
                  </DropdownItem>
                  <DropdownItem
                    v-for="rel in relType.relList"
                    :key="rel.id"
                    :name="'rel_' + rel.id"
                    :selected="!searchParam.disableRelList.includes(rel.id)"
                  >
                    <div>
                      <span>{{ rel.fromCiLabel }}</span>
                      <span class="text-grey">({{ rel.fromLabel }})</span>
                      <span class="fz10 text-grey tsfont-arrow-right"></span>
                      <span>{{ rel.toCiLabel }}</span>
                      <span class="text-grey">({{ rel.toLabel }})</span>
                    </div>
                  </DropdownItem>
                </template>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div
            v-for="(layout, index) in layoutList"
            :key="index"
            class="action-item"
            :class="currentLayout == layout.engine ? 'text-primary' : 'text-grey'"
            style="cursor: pointer"
            @click="changeLayout(layout.engine)"
          >
            {{ layout.name }}
          </div>
        </div>
        <div>
          <TsFormInput
            v-model="keyword"
            :search="true"
            :width="250"
            @on-change="findNode"
          ></TsFormInput>
        </div>
      </div>
      <div v-if="globalAttrList && globalAttrList.length > 0">
        <span v-for="(attr, index) in globalAttrList" :key="index" class="mr-md mb-md">
          <span class="mr-md">
            <b class="text-grey">{{ attr.label }}</b>
          </span>
          <Tag
            v-for="(item, iindex) in attr.itemList"
            :key="iindex"
            :color="isAttrActive(attr, item) ? 'primary' : 'default'"
            class="cursor"
            @click.native="toggleAttr(attr, item)"
          >
            {{ item.value }}
          </Tag>
        </span>
      </div>
      <div style="position: relative">
        <div id="graph" class="clearfix home-page"></div>
        <D3Tooltip
          v-if="isTooltipShow"
          :width="tooltipWidth"
          :height="tooltipHeight"
          :placement="tooltipPlacement"
          :ciId="tooltipCiId"
          :ciEntityId="tooltipCiEntityId"
          style="position: absolute; opacity: 0.9"
          :style="tooltipPosition"
          @mouseenter.native="clearTooltipTimer"
          @mouseleave.native="hideTooltip"
        ></D3Tooltip>
        <div v-if="error" class="text-grey" style="padding-top: 50px; text-align: center">
          {{ error }}
        </div>
      </div>
      <Loading :loadingShow="isloading" type="fix"></Loading>
    </div>
  </div>
</template>
<script>
import d3 from '../asset/d3';
import '@/resources/assets/font/tsfont/font/tsfont.js';
import '@/resources/assets/font/tsfonts/iconfont.js';
import { graphviz } from 'd3-graphviz';
import { addEvent } from './util/event.js';
export default {
  name: '',
  components: {
    D3Tooltip: resolve => require(['../asset/d3/d3-tooltip.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve)
  },
  props: {
    ciEntityId: { type: Number },
    ciId: { type: Number }
  },
  data() {
    return {
      keyword: '',
      isloading: false,
      currentLayout: 'dot',
      layoutList: [
        { engine: 'dot', name: this.$t('term.cmdb.topo.dot') },
        { engine: 'circo', name: this.$t('term.cmdb.topo.circo') },
        { engine: 'neato', name: this.$t('term.cmdb.topo.neato') },
        { engine: 'osage', name: this.$t('term.cmdb.topo.osage') },
        { engine: 'fdp', name: this.$t('term.cmdb.topo.fdp') },
        { engine: 'twopi', name: this.$t('term.cmdb.topo.twopi') }
      ],
      graph: {},
      data: {},
      error: '', //异常信息
      relList: [],
      searchParam: { ciEntityId: this.ciEntityId, ciId: this.ciId, level: 3, disableRelList: [], globalAttrFilterList: [] },
      currentZoomLevelId: [],
      tooltipTop: null,
      tooltipLeft: null,
      tooltipRight: null,
      tooltipBottom: null,
      isTooltipShow: false,
      tooltipPlacement: '', //tooltip箭头位置
      tooltipWidth: 350,
      tooltipHeight: 220,
      tooltipCiId: null,
      tooltipCiEntityId: null,
      tooltipTimer: null, //关闭计时器
      nodeNameMap: {},
      globalAttrList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchGlobalAttr();
    this.initGraph();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    isAttrActive(attr, item) {
      if (!this.searchParam.globalAttrFilterList.find(d => d.attrId === attr.id)) {
        return false;
      } else {
        return this.searchParam.globalAttrFilterList.find(d => d.attrId === attr.id).valueList.includes(item.id);
      }
    },
    toggleAttr(attr, item) {
      if (!this.isAttrActive(attr, item)) {
        if (!this.searchParam.globalAttrFilterList.find(d => d.attrId === attr.id)) {
          this.searchParam.globalAttrFilterList.push({attrId: attr.id, expression: 'like', valueList: [item.id]});
        } else {
          this.searchParam.globalAttrFilterList.find(d => d.attrId === attr.id).valueList.push(item.id);
        }
      } else {
        const aindex = this.searchParam.globalAttrFilterList.findIndex(d => d.attrId === attr.id);
        if (aindex > -1) {
          const index = this.searchParam.globalAttrFilterList[aindex].valueList.findIndex(d => d === item.id);
          if (index > -1) {
            this.searchParam.globalAttrFilterList[aindex].valueList.splice(index, 1);
          }
          if (this.searchParam.globalAttrFilterList[aindex].valueList.length === 0) {
            this.searchParam.globalAttrFilterList.splice(aindex, 1);
          }
        }
      }
    },
    searchGlobalAttr() {
      this.$api.cmdb.globalattr.searchGlobalAttr({ isActive: 1 }).then(res => {
        this.globalAttrList = res.Return.tbodyList;
      });
    },
    isRelTypeSelected(relType) {
      let isAllDisabled = true;
      for (let i = 0; i < relType.relList.length; i++) {
        if (!this.searchParam.disableRelList.includes(relType.relList[i].id)) {
          isAllDisabled = false;
          break;
        }
      }
      return !isAllDisabled;
    },
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
    changeDisableRel(name) {
      if (name.startsWith('reltype_')) {
        name = parseInt(name.replace('reltype_', ''));
        const relType = this.relTypeList.find(d => d.id == name);
        if (relType) {
          if (this.isRelTypeSelected(relType)) {
            relType.relList.forEach(rel => {
              if (!this.searchParam.disableRelList.includes(rel.id)) {
                this.searchParam.disableRelList.push(rel.id);
              }
            });
          } else {
            relType.relList.forEach(rel => {
              const index = this.searchParam.disableRelList.findIndex(d => d == rel.id);
              if (index > -1) {
                this.searchParam.disableRelList.splice(index, 1);
              }
            });
          }
        }
      } else if (name.startsWith('rel_')) {
        name = parseInt(name.replace('rel_', ''));
        const index = this.searchParam.disableRelList.findIndex(d => d == name);
        if (index > -1) {
          this.searchParam.disableRelList.splice(index, 1);
        } else {
          this.searchParam.disableRelList.push(name);
        }
      }
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
          .duration(700)
          .attr('width', graphEl.offsetWidth)
          .attr('height', window.innerHeight - 30 - this.getGraphTop(graphEl).y);
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
          .height(window.innerHeight - 30 - this.getGraphTop(graphEl).y)
          .width(graphEl.offsetWidth - 10)
          .zoom(true)
          .fit(false)
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
                _this.nodeNameMap[d.attributes['xlink:title']].push(d); //d3.select(this);
              } else {
                _this.nodeNameMap[d.attributes['xlink:title']] = [d];
              }
            }
          });
        this.renderGraph();
        d3.select(window).on('resize', this.resizeSVG);
      }, 0);
    },
    renderGraph() {
      this.isloading = true;
      const graphEl = document.getElementById('graph');
      const param = this.searchParam;
      param.layout = this.currentLayout;
      this.$api.cmdb.cientity.getCiEntityTopoData(param).then(res => {
        if (!this.$utils.isEmpty(res.Return) && res.Return.dot) {
          this.error = '';
          const nodesString = this.$utils.handleTopoImagePath(res.Return.dot || '');
          this.relList = res.Return.relList || [];
          this.loadImage(nodesString);
          this.graph.graphviz
            .transition()
            .height(window.innerHeight - 30 - this.getGraphTop(graphEl).y)
            .width(graphEl.offsetWidth - 10)
            .renderDot(nodesString)
            .on('end', () => {});
          //let svg = d3.select('#graph').select('svg');
          //svg.append('g').lower();
          addEvent('svg', 'mouseover', e => {
            this.unColorNode();
            e.preventDefault();
            e.stopPropagation();
          });
          addEvent('.cinode', 'mouseenter', async e => {
            e.preventDefault();
            e.stopPropagation();
            d3.selectAll('g').attr('cursor', 'pointer');
            this.g = e.currentTarget;
            this.nodeName = this.g.firstElementChild.textContent.trim();
            this.colorNode(this.nodeName);
            this.showTooltip(e.currentTarget);
          });
          addEvent('.cinode', 'mouseleave', async e => {
            e.preventDefault();
            e.stopPropagation();
            this.hideTooltip();
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
          /*const g = d3.select('#CiEntity_431579058937856_459181555458049');
        let x = g.node().getBBox().x;
        let y = g.node().getBBox().y;
        d3.select('#CiEntity_431579058937856_459181555458049')
          .attr('transform', 'translate(0,0)')
          .append('text')
          .attr('x', x)
          .attr('y', y + 10)
          .text('abc');*/
        } else {
          this.error = this.$t('message.cmdb.notopo');
        }
        this.isloading = false;
      });
    },
    clearTooltipTimer() {
      if (this.tooltipTimer) {
        clearTimeout(this.tooltipTimer);
        this.tooltipTimer = null;
      }
    },
    hideTooltip() {
      if (this.tooltipTimer) {
        clearTimeout(this.tooltipTimer);
        this.tooltipTimer = null;
      }
      this.tooltipTimer = setTimeout(() => {
        this.isTooltipShow = false;
      }, 500);
    },
    showTooltip(node) {
      this.clearTooltipTimer();
      const className = d3.select(node).attr('class');
      const classes = className.split(' ');
      const id = classes.find(d => d.indexOf('CiEntity_') == 0);
      const ciId = id.split('_')[1];
      const ciEntityId = id.split('_')[2];
      if (!this.isTooltipShow || this.tooltipCiId != parseInt(ciId) || this.tooltipCiEntityId != parseInt(ciEntityId)) {
        const maxHeight = this.tooltipHeight;
        const maxWidth = this.tooltipWidth;
        //由于SVG坐标系和dom的坐标不一致，所以需要使用getBoundingClientRect进行计算
        const parentRect = document.getElementById('graph').getBoundingClientRect();
        const nodeRect = d3.select(node).node().getBoundingClientRect();

        //console.log(parentRect);
        //console.log(nodeRect);
        const top = nodeRect.y - parentRect.y;
        const left = nodeRect.x - parentRect.x;
        const bottom = parentRect.bottom - nodeRect.bottom;
        const right = parentRect.right - nodeRect.right;
        let start = '';
        let end = '';
        let tooltipTop;
        let tooltipLeft;
        let tooltipRight;
        let tooltipBottom;
        if (right >= maxWidth) {
          start = 'right';
          tooltipLeft = left + nodeRect.width;
        } else {
          start = 'left';
          tooltipRight = right + nodeRect.width;
        }
        if (bottom >= maxHeight) {
          end = 'start';
          tooltipTop = top;
        } else {
          end = 'end';
          tooltipBottom = bottom;
        }
        this.tooltipTop = tooltipTop;
        this.tooltipLeft = tooltipLeft;
        this.tooltipRight = tooltipRight;
        this.tooltipBottom = tooltipBottom;
        this.tooltipPlacement = start + '-' + end;
        this.tooltipCiId = parseInt(ciId);
        this.tooltipCiEntityId = parseInt(ciEntityId);
        this.isTooltipShow = true;
      }
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
  computed: {
    relTypeList() {
      const relTypeList = [];
      this.relList.forEach(rel => {
        const relType = relTypeList.find(d => d.id === rel.typeId);
        if (relType != null) {
          relType.relList.push(rel);
        } else {
          relTypeList.push({ id: rel.typeId, name: rel.typeText, relList: [rel] });
        }
      });
      return relTypeList;
    },
    showRelList() {
      if (!this.searchParam.disableRelList || this.searchParam.disableRelList.length == 0) {
        return this.relList;
      } else {
        return this.relList.filter(r => !this.searchParam.includes(r.direction + '_' + r.id));
      }
    },
    tooltipPosition() {
      let style = '';
      if (this.tooltipTop) {
        style += ';top:' + this.tooltipTop + 'px';
      }
      if (this.tooltipLeft) {
        style += ';left:' + this.tooltipLeft + 'px';
      }
      if (this.tooltipRight) {
        style += ';right:' + this.tooltipRight + 'px';
      }
      if (this.tooltipBottom) {
        style += ';bottom:' + this.tooltipBottom + 'px';
      }
      return style;
    }
  },
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
<style lang="less" scoped>
@import '../public/graphviz.less';
.header {
  display: grid;
  grid-template-columns: 30% 40% 30%;
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
.grid {
  display: grid;
  grid-template-columns: auto 250px;
}
</style>
