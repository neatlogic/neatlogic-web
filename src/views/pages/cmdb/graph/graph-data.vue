<template>
  <div style="position:relative">
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item tsfont-node" @click="showGraphRel">
            {{ $t('dialog.title.graphrel') }}
          </span>
          <span
            v-if="allCiEntityIdList && allCiEntityIdList.length > 0"
            class="action-item"
            :class="{ 'tsfont-warning-o': !isAlertListShow, 'tsfont-close': !!isAlertListShow }"
            @click="showAlertList"
          >{{ $t('page.alertlist') }}</span>
          <span class="action-item tsfont-fullscreen" @click="fullscreen">{{ $t('page.fullscreen') }}</span>
          <span class="action-item tsfont-edit" @click="editGraph()">{{ $t('dialog.title.edittarget', { target: $t('term.cmdb.view') }) }}</span>
        </div>
      </template>
      <template v-slot:content>
        <div class="ci-content">
          <div class="ci-right">
            <div class="right-top">
              <div class="icon-block iconWidth radius-lg text-primary">
                <i :class="graphData.icon" class="ci-icon"></i>
              </div>
              <div class="title overflow">
                <div>
                  <span class="ci-label">{{ graphData.name }}</span>
                </div>
                <div v-if="graphData.description" class="ci-description overflow text-grey" :title="graphData.description">{{ graphData.description }}</div>
                <div v-else class="text-grey">{{ $t('page.notarget', { target: $t('page.description') }) }}</div>
              </div>
            </div>
            <div ref="divTopo" style="position:relative" :style="{ height: height + 'px' }">
              <div
                class="bg-block radius-md topoContainer"
                style="z-index:0;background-size:100% 100%"
                :style="{
                  'background-color': graphData.config.backgroundColor || null,
                  'background-image': graphData.config.backgroundImage ? 'url(' + graphData.config.backgroundImage + ')' : null
                }"
              ></div>
              <div class="radius-md topoContainer" style="z-index:1">
                <div ref="topo" style="height:100%"></div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </TsContain>
    <div v-if="isAlertListShow" class="bg-op-opacity padding top-shadow" style="z-index:999;position:absolute;bottom:0px;height:300px;width:100%">
      <TsTable v-bind="ciEntityAlertData" :theadList="theadList" :loading="isLoading">
        <template v-slot:level="{ row }">
          <span :style="{ color: row.levelColor }">{{ row.levelName }}</span>
        </template>
        <template v-slot:ciEntityName="{ row }">
          <a @click="toCiEntity(row.ciId, row.ciEntityId)">{{ row.ciEntityName }}</a>
        </template>
        <template v-slot:alertLink="{ row }">
          <a v-if="row.alertLink" :href="row.alertLink" target="_blank">{{ $t('page.detail') }}</a>
          <span v-else>-</span>
        </template>
      </TsTable>
    </div>
    <GraphTopoDialog v-if="isGraphRelShow" :graphId="id" @close="isGraphRelShow = false"></GraphTopoDialog>
  </div>
</template>
<script>
import './grapheditor/index.js';
import screenfull from '@/resources/assets/js/screenfull.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    GraphTopoDialog: resolve => require(['./graph-topo.vue'], resolve)
  },
  props: {},
  data() {
    const _this = this;
    return {
      id: null,
      isLoading: false,
      isAlertListShow: false,
      isGraphRelShow: false,
      graphData: { config: {} },
      topoData: { nodes: [], links: [], groups: [] },
      height: 200,
      ciEntityAlertData: {},
      ciEntityTimmer: null,
      graphTimmer: null,
      graphIdList: [], //当前视图的子视图id列表
      ciEntityIdList: [], //当前视图的配置项id列表
      graphCiEntityMap: {}, //当前视图的子视图配置项id列表
      searchParam: {},
      graphAlertLevel: {}, //子视图告警级别
      ciEntityAlertLevel: {}, //配置项告警级别
      theadList: [
        { key: 'level', title: this.$t('page.level') },
        { key: 'alertLink', title: this.$t('page.detail') },
        { key: 'alertTime', title: this.$t('page.time'), type: 'time' },
        { key: 'ciEntityName', title: this.$t('term.cmdb.cientity') },
        { key: 'ip', title: this.$t('page.ip') },
        { key: 'metricName', title: this.$t('page.attribute') },
        { key: 'metricValue', title: this.$t('page.value') },
        { key: 'alertMessage', title: this.$t('page.message') }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.params['id']) {
      this.id = parseInt(this.$route.params['id']);
    }
    this.calcTopoHeight();
    window.addEventListener('resize', () => {
      this.calcTopoHeight();
    });
  },
  beforeMount() {},
  mounted() {
    this.initTopo();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    showGraphRel() {
      this.isGraphRelShow = true;
    },
    restoreHistory(historyData) {
      if (historyData['isAlertListShow']) {
        this.isAlertListShow = historyData['isAlertListShow'];
      }
    },
    toCiEntity(ciId, ciEntityId) {
      this.$router.push({ path: '/ci/' + ciId + '/cientity-view/' + ciEntityId });
    },
    async getAllGraphCiEntityId() {
      //获取子视图的所有配置项id，不包括当前视图的配置项id
      if (this.graphIdList && this.graphIdList.length > 0) {
        await this.$api.cmdb.graph.getAllCiEntityId(this.graphIdList).then(res => {
          this.graphCiEntityMap = res.Return;
        });
      }
    },
    showAlertList() {
      this.isAlertListShow = !this.isAlertListShow;
      this.$addHistoryData('isAlertListShow', this.isAlertListShow);
    },
    searchCiEntityAlert(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.searchParam.ciEntityIdList = this.allCiEntityIdList;
      this.isLoading = true;
      this.$api.cmdb.cientity.searchCiEntityAlert(this.searchParam).then(res => {
        this.ciEntityAlertData = res.Return;
        this.isLoading = false;
      });
    },
    refreshCiEntityStatus() {
      if (this.ciEntityTimmer) {
        clearTimeout(this.ciEntityTimmer);
        this.ciEntityTimmer = null;
      }
      const allCiEntityIdList = new Set();
      this.ciEntityIdList.forEach(cientityid => {
        allCiEntityIdList.add(cientityid);
      });
      if (this.graphCiEntityMap && !this.$utils.isEmpty(this.graphCiEntityMap)) {
        for (let key in this.graphCiEntityMap) {
          this.graphCiEntityMap[key].forEach(id => {
            allCiEntityIdList.add(id);
          });
        }
      }
      if (allCiEntityIdList.size > 0) {
        this.$api.cmdb.cientity.getCiEntityStatus(Array.from(allCiEntityIdList)).then(res => {
          const ciEntityList = res.Return;
          //更新配置项状态
          this.ciEntityIdList.forEach(cientityid => {
            this.$set(this.ciEntityAlertLevel, 'cientity_' + cientityid, null);
            if (ciEntityList && ciEntityList.length > 0) {
              const cientityStatus = ciEntityList.find(d => d.ciEntityId === cientityid);
              if (cientityStatus && cientityStatus.alertList && cientityStatus.alertList.length > 0) {
                const alert = cientityStatus.alertList[0];
                this.$set(this.ciEntityAlertLevel, 'cientity_' + cientityid, alert);
              }
            }
          });
          //更新视图状态
          for (let key in this.graphAlertLevel) {
            this.$set(this.graphAlertLevel, key, null);
            this.graphCiEntityMap[key].forEach(cientityid => {
              if (ciEntityList && ciEntityList.length > 0) {
                const cientityStatus = ciEntityList.find(d => d.ciEntityId === cientityid);
                if (cientityStatus && cientityStatus.alertList && cientityStatus.alertList.length > 0) {
                  const alert = cientityStatus.alertList[0];
                  if (!this.graphAlertLevel[key] || this.graphAlertLevel[key].level < alert.level) {
                    this.$set(this.graphAlertLevel, key, alert);
                  }
                }
              }
            });
          }
          this.ciEntityTimmer = setTimeout(() => {
            this.refreshCiEntityStatus();
          }, 10000);
        });
      }
    },
    fullscreen() {
      let fullDiv = this.$refs.divTopo;
      if (screenfull.isEnabled) {
        screenfull.request(fullDiv);
      }
    },
    toGraph(graphId) {
      this.$router.push({ path: '/graph-data/' + graphId });
      this.$route.meta.title = this.graphData.name;
      if (this.$route.name === 'graph-data') {
        this.$router.push({ path: '/graph-datav2/' + graphId });
      } else {
        this.$router.push({ path: '/graph-data/' + graphId });
      }
    },
    calcTopoHeight() {
      this.$nextTick(() => {
        //减去底部的距离
        this.height = window.innerHeight - 18 - (this.$refs.divTopo ? this.$refs.divTopo.getBoundingClientRect().top : 0);
        if (this.$refs.topo) {
          const height = this.height - 5;
          const width = this.$refs.divTopo.offsetWidth;
          if (this.topo) {
            this.topo.setHeight(height);
            this.topo.setWidth(width);
          }
        }
      });
    },
    editGraph() {
      this.$router.push({ path: '/graph-edit/' + this.graphData.type + '/' + this.id });
    },
    initTopo() {
      setTimeout(() => {
        const width = this.$refs.divTopo.offsetWidth;
        const height = this.height - 5;
        this.topo = new Topo(this.$refs.topo, {
          'canvas.width': width,
          'canvas.height': height,
          'canvas.class': 'topoGraph',
          'link.deleteable': false,
          'link.selectable': false,
          'node.selectable': false,
          'node.dragable': false,
          'node.deleteable': false,
          'node.connectable': false,
          'group.deleteable': false,
          'group.selectable': false,
          'group.dragable': false,
          'group.connectable': false,
          'anchor.size': 4,
          'node.clickFn': node => {
            if (node.getType() === 'Graph') {
              if (node.getConfig().id) {
                this.toGraph(node.getConfig().id);
              }
            } else if (node.getType() === 'Cientity') {
              if (node.getConfig().id && node.getConfig().ciId) {
                this.$route.meta.title = this.graphData.name;
                this.$router.push({ path: '/ci/' + node.getConfig().ciId + '/cientity-view/' + node.getConfig().id });
              }
            }
          }
        });
        this.topo.draw();
        if (this.id) {
          this.$api.cmdb.graph.getGraphById(this.id).then(async res => {
            this.graphData = res.Return;
            if (res.Return.config.topo) {
              this.topoData = res.Return.config.topo;
            }
            this.topo.fromJson(this.topoData);
            if (this.topoData && this.topoData.nodes) {
              this.topoData.nodes.forEach(node => {
                if (node.type === 'Cientity') {
                  this.ciEntityIdList.push(node.config.id);
                  this.$set(this.ciEntityAlertLevel, 'cientity_' + node.config.id, null);
                } else if (node.type === 'Graph') {
                  this.graphIdList.push(node.config.id);
                  this.$set(this.graphAlertLevel, 'graph_' + node.config.id, null);
                }
              });
            }
            //因为原来是空对象，这里必须刷新一下，否则watch不能响应
            this.$forceUpdate();
            //等待递归查出所有子视图的配置项id
            await this.getAllGraphCiEntityId();
            this.refreshCiEntityStatus();
          });
        } else {
          this.topo.fromJson(this.topoData);
        }
      }, 100);
    }
  },
  filter: {},
  computed: {
    allCiEntityIdList() {
      const idSet = new Set();
      if (this.graphCiEntityMap) {
        for (let key in this.graphCiEntityMap) {
          this.graphCiEntityMap[key].forEach(cientityid => {
            idSet.add(cientityid);
          });
        }
      }
      if (this.ciEntityIdList) {
        this.ciEntityIdList.forEach(cientityid => {
          idSet.add(cientityid);
        });
      }
      return Array.from(idSet);
    },
    ciEntityAlertLevelStr() {
      return JSON.stringify(this.ciEntityAlertLevel);
    }
  },
  watch: {
    isAlertListShow: {
      handler: function(val) {
        if (val) {
          this.searchCiEntityAlert(1);
        }
      },
      immediate: true
    },
    graphAlertLevel: {
      handler: function(val) {
        for (let key in this.graphAlertLevel) {
          const alert = this.graphAlertLevel[key];
          const graphid = key.replace('graph_', '');
          const node = this.topo.getNodes().find(d => d.getConfig() && d.getType() === 'Graph' && d.getConfig().id == graphid);
          if (node) {
            if (!alert) {
              const nData = this.topoData.nodes.find(d => d.uuid === node.getUuid());
              node.setAnimate(null);
              node.setStroke(nData.stroke);
              node.setIconcolor(nData.iconcolor);
            } else {
              node.setAnimate('breath');
              node.setStroke(alert.levelColor);
              node.setIconcolor(alert.levelColor);
            }
          }
        }
      },
      deep: true
    },
    ciEntityAlertLevel: {
      handler: function(val) {
        for (let key in this.ciEntityAlertLevel) {
          const alert = this.ciEntityAlertLevel[key];
          const cientityid = key.replace('cientity_', '');
          const node = this.topo.getNodes().find(d => d.getConfig() && d.getType() === 'Cientity' && d.getConfig().id == cientityid);
          if (node) {
            if (!alert) {
              const nData = this.topoData.nodes.find(d => d.uuid === node.getUuid());
              node.setAnimate(null);
              node.setStroke(nData.stroke);
              node.setIconcolor(nData.iconcolor);
            } else {
              node.setAnimate('breath');
              node.setStroke(alert.levelColor);
              node.setIconcolor(alert.levelColor);
            }
          }
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
@import '../public/common.less';
@import './grapheditor/topo.less';
.topoContainer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.select-item {
  cursor: move;
  display: grid;
  grid-template-columns: 35px auto;
}
.logo {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: inline-block;
  position: relative;
  border: 1px solid;
  top: -5px;
  text-align: center;
  line-height: 40px;
  .logo-icon {
    font-size: 20px;
    // position: absolute;
    // top: 4px;
    // left: 10px;
  }
  &::after {
    content: '更换';
    left: 44px;
    width: 40px;
    position: absolute;
    top: 2px;
  }
}

.tstable-body {
  th,
  td {
    padding: 4px;
  }
}

.grid {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: auto 45px;
}
.right-top {
  height: 38px !important;
  margin-bottom: 12px;
}
.iconWidth {
  width: 20px !important;
  line-height: 24px !important;
  height: 36px !important;
}
.ci-label {
  margin-bottom: 4px;
}
</style>
