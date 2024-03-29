<template>
  <div>
    <div class="padding">
      <div class="grid">
        <div class="action-group">
          <div class="action-item">
            <Dropdown placement="bottom-start">
              <a v-if="!currentTemplate" href="javascript:void(0)">
                {{ $t('term.cmdb.extendlevel') }}
                <b class="ml-xs">{{ searchParam.level }}</b>
                <Icon class="ml-xs" type="ios-arrow-down"></Icon>
              </a>
              <a v-else>
                {{ $t('page.scene') }}
                <b class="ml-xs">{{ currentTemplate.name }}</b>
                <Icon class="ml-xs" type="ios-arrow-down"></Icon>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem v-if="filterCiTopoTemplateList.length > 0" disabled>按场景展开</DropdownItem>
                <DropdownItem v-for="(topoTemplate, index) in filterCiTopoTemplateList" :key="index" :selected="searchParam.templateId === topoTemplate.id">
                  <span :class="{ 'text-grey': !topoTemplate.isActive }" @click="showTopoTemplate(topoTemplate)">{{ topoTemplate.name }}</span>
                  <span v-auth="['CI_MODIFY']" class="ml-xs tsfont-edit" @click="editTopoTemplate(topoTemplate)"></span>
                  <span v-auth="['CI_MODIFY']" class="ml-xs tsfont-trash-o" @click="deleteTopoTemplate(topoTemplate)"></span>
                </DropdownItem>
                <DropdownItem v-if="ciTopoTemplateList && ciTopoTemplateList.length > 0" divided disabled>按层数展开</DropdownItem>
                <DropdownItem
                  v-for="i in maxLevel"
                  :key="i"
                  :name="i"
                  :selected="searchParam.level === i"
                  @click.native="changeLevel(i)"
                >{{ $t('term.cmdb.levelnumber', { level: i }) }}</DropdownItem>
                <DropdownItem :divided="ciTopoTemplateList && ciTopoTemplateList.length > 0" @click.native="editTopoTemplate()">
                  <span class="tsfont-plus">{{ $t('dialog.title.addtarget', { target: $t('page.scene') }) }}</span>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div class="action-item">
            <Dropdown placement="bottom-start" :transfer="true" @on-click="changeLayout">
              <a href="javascript:void(0)">
                <span v-if="currentLayout">
                  {{ layoutList.find(d => d.engine === currentLayout).name }}
                  <Icon type="ios-arrow-down"></Icon>
                </span>
                <span v-else>{{ $t('term.cmdb.pleaseselectlayout') }}</span>
              </a>
              <DropdownMenu slot="list">
                <template>
                  <DropdownItem
                    v-for="(layout, index) in layoutList"
                    :key="index"
                    :name="layout.engine"
                    :selected="currentLayout === layout.engine"
                  >
                    {{ layout.name }}
                  </DropdownItem>
                </template>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div v-if="!searchParam.templateId" class="action-item">
            <TsFormSwitch
              :trueName="1"
              :falseName="0"
              :showStatus="true"
              :trueText="$t('term.cmdb.onlybackbone')"
              :falseText="$t('term.cmdb.showallrel')"
              :value="searchParam.isBackbone"
              @on-change="changeIsBackbone"
            ></TsFormSwitch>
          </div>
        </div>
        <div>
          <TsFormInput
            v-model="keyword"
            :search="true"
            :width="250"
            border="bottom"
            @on-change="findNode"
          ></TsFormInput>
        </div>
      </div>
      <div v-if="globalAttrList && globalAttrList.length > 0" class="mb-md">
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
        <div v-if="currentTemplate && currentTemplate.config && currentTemplate.config.ciRelList && currentTemplate.config.ciRelList.length > 0" class="mb-md">
          <span v-for="(p, pindex) in currentTemplate.config.ciRelList" :key="pindex">
            <span v-if="pindex === 0">
              <Tag color="success">{{ p.ciLabel }}({{ p.ciName }})</Tag>
            </span>
            <span v-if="p.direction === 'from'" class="text-grey fz10 tsfont-minus"></span>
            <span v-else-if="p.direction === 'to'" class="text-grey fz10 tsfont-arrow-left"></span>
            <span class="text-grey fz10">
              {{ p.relLabel }}
            </span>
            <span v-if="p.direction === 'from'" class="text-grey fz10 tsfont-arrow-right"></span>
            <span v-else-if="p.direction === 'to'" class="text-grey fz10 tsfont-minus"></span>
            <span>
              <Tag v-if="pindex === currentTemplate.config.ciRelList.length - 1" color="success">{{ p.targetCiLabel }}({{ p.targetCiName }})</Tag>
              <Tag
                v-else
                class="cursor"
                :color="isRelShow(p) ? 'primary' : 'default'"
                @click.native="toggleRelShow(p)"
              >
                <span :class="!p.isHidden ? 'tsfont-eye' : 'tsfont-eye-off'">{{ p.targetCiLabel }}({{ p.targetCiName }})</span>
              </Tag>
            </span>
          </span>
        </div>
        <div ref="graph" class="clearfix graph"></div>
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
      <CiTopoTemplateEdit
        v-if="isCiTopoTemplateEditShow"
        :id="currentTopoTemplateId"
        :ciId="ciId"
        @close="closeTopoTemplateDialog"
      ></CiTopoTemplateEdit>
    </div>
  </div>
</template>
<script>
import d3 from '../asset/d3';
import '@/resources/assets/font/tsfonts/tsfont.js';
import '@/resources/assets/font/tsIconfont.js';
import { graphviz } from 'd3-graphviz';
import { addEvent } from './util/event.js';
export default {
  name: '',
  components: {
    D3Tooltip: resolve => require(['../asset/d3/d3-tooltip.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve),
    CiTopoTemplateEdit: resolve => require(['@/views/pages/cmdb/ci/ci-topo-template-edit-dialog.vue'], resolve)
  },
  props: {
    ciEntityId: { type: Number },
    ciId: { type: Number }
  },
  data() {
    return {
      keyword: '',
      maxLevel: 5,
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
      searchParam: {
        isBackbone: 1,
        ciEntityId: this.ciEntityId,
        ciId: this.ciId,
        disableRelList: [],
        globalAttrFilterList: [],
        templateConfig: {}
      },
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
      globalAttrList: [],
      ciTopoTemplateList: [],
      isCiTopoTemplateEditShow: false,
      currentTopoTemplateId: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    this.searchGlobalAttr();
    this.initGraph();
    await this.getCiTopoTemplateByCiId();
    this.$set(this.searchParam, 'level', 3);
    if (this.ciTopoTemplateList && this.ciTopoTemplateList.length > 0) {
      const template = this.ciTopoTemplateList.find(d => d.isActive && d.isDefault);
      if (template) {
        this.showTopoTemplate(template);
      }
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toggleRelShow(p) {
      const relId = p.relId.toString();
      if (!this.searchParam.templateConfig[relId]) {
        this.$set(this.searchParam.templateConfig, relId, {});
      }
      if (p.isHidden) {
        this.$set(this.searchParam.templateConfig[relId], 'isShow', !this.searchParam.templateConfig[relId].isShow);
      } else {
        this.$set(this.searchParam.templateConfig[relId], 'isHidden', !this.searchParam.templateConfig[relId].isHidden);
      }
    },
    isRelShow(p) {
      const relId = p.relId.toString();
      if (p.isHidden && !this.searchParam.templateConfig[relId]?.isShow) {
        return false;
      } else if (!p.isHidden && this.searchParam.templateConfig[relId]?.isHidden) {
        return false;
      } else {
        return true;
      }
    },
    showTopoTemplate(template) {
      this.$set(this.searchParam, 'templateId', template.id);
      this.$delete(this.searchParam, 'level');
    },
    deleteTopoTemplate(template) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.scene') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.ci.deleteCiTopoTemplateById(template.id).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.getCiTopoTemplateByCiId();
              if (this.searchParam.templateId) {
                this.$delete(this.searchParam, 'templateId');
                this.$set(this.searchParam, 'level', 3);
              }
              vnode.isShow = false;
            }
          });
        }
      });
    },
    async closeTopoTemplateDialog(needRefresh) {
      if (needRefresh) {
        await this.getCiTopoTemplateByCiId();
        if (this.currentTemplate) {
          if (this.currentTemplate.isActive) {
            this.renderGraph();
          } else {
            this.$delete(this.searchParam, 'templateId');
          }
        }
      }
      this.isCiTopoTemplateEditShow = false;
      this.currentTopoTemplateId = null;
    },
    editTopoTemplate(template) {
      this.isCiTopoTemplateEditShow = true;
      if (template) {
        this.currentTopoTemplateId = template.id;
      } else {
        this.currentTopoTemplateId = null;
      }
    },
    async getCiTopoTemplateByCiId() {
      await this.$api.cmdb.ci.getCiTopoTemplateByCiId(this.ciId).then(res => {
        this.ciTopoTemplateList = res.Return;
      });
    },
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
          this.searchParam.globalAttrFilterList.push({ attrId: attr.id, expression: 'like', valueList: [item.id] });
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
    changeLevel(level) {
      this.$set(this.searchParam, 'level', level);
      this.$delete(this.searchParam, 'templateId');
    },
    changeIsBackbone(isBackbone) {
      this.searchParam.isBackbone = isBackbone;
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
      const graphEl = this.$refs['graph'];
      if (graphEl) {
        d3.select(graphEl)
          .selectWithoutDataPropagation('svg')
          .transition()
          .attr('width', graphEl.offsetWidth)
          .attr('height', window.innerHeight - 40 - this.getGraphTop(graphEl).y);
      }
    },
    initGraph() {
      //window.setTimeout(() => {
      const graphEl = this.$refs['graph'];
      if (graphEl) {
        let graph = d3.select(graphEl);
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
                _this.nodeNameMap[d.attributes['xlink:title']].push(d); //d3.select(this);
              } else {
                _this.nodeNameMap[d.attributes['xlink:title']] = [d];
              }
            }
          })
          .on('end', () => {
            //console.log('done');
          });
        d3.select(window).on('resize', this.resizeSVG);
      }
      //}, 0);
    },
    renderGraph() {
      if (this.graph) {
        this.isloading = true;
        const graphEl = this.$refs['graph'];
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
      }
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
        const parentRect = this.$refs['graph'].getBoundingClientRect();
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
    filterCiTopoTemplateList() {
      if (this.ciTopoTemplateList) {
        if (this.$AuthUtils.hasRole('CI_MODIFY')) {
          return this.ciTopoTemplateList;
        } else {
          return this.ciTopoTemplateList.filter(d => !!d.isActive);
        }
      }
      return [];
    },
    currentTemplate() {
      if (this.searchParam.templateId && this.ciTopoTemplateList && this.ciTopoTemplateList.length > 0) {
        return this.ciTopoTemplateList.find(d => d.id === this.searchParam.templateId);
      }
      return null;
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
