<template>
  <div>
    <div class="action-group padding-md">
      <div class="action-item">
        <Dropdown placement="bottom-start" :transfer="true" @on-click="setLayout">
          <a href="javascript:void(0)">
            <span v-if="currentLayout">
              {{ layoutType[currentLayout].name }}
              <span class="tsfont-drop-down"></span>
            </span>
            <span v-else>{{ $t('term.cmdb.pleaseselectlayout') }}</span>
          </a>
          <DropdownMenu slot="list">
            <template>
              <DropdownItem
                v-for="(value, key, index) in layoutType"
                :key="index"
                :name="key"
                :selected="currentLayout === key"
              >
                {{ value.name }}
              </DropdownItem>
            </template>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div class="action-item">
        <TsFormSwitch
          v-model="showMinimap"
          :showStatus="true"
          :trueValue="1"
          :falseValue="0"
          trueText="小地图"
          falseText="小地图"
          @on-change="
            val => {
              toggleMinimap(val);
            }
          "
        ></TsFormSwitch>
      </div>
      <!-- <div class="action-item">
        <span :class="{ 'text-href': currentLayout === 'antv-dagre' }" @click="setLayout('antv-dagre')">层次布局</span>
      </div>
      <div class="action-item">
        <span :class="{ 'text-href': currentLayout === 'circular' }" @click="setLayout('circular')">环形布局</span>
      </div>
      <div class="action-item">
        <span :class="{ 'text-href': currentLayout === 'concentric' }" @click="setLayout('concentric')">环形布局</span>
      </div> -->
    </div>
    <Loading v-if="isLoading" :loadingShow="true" type="fix"></Loading>
    <div style="position: relative">
      <div ref="container" :class="{ padding: mode === 'window' }" style="height: calc(100vh - 170px); width: 100%"></div>
      <div
        v-if="showMinimap"
        ref="minimap"
        class="border-base radius-sm"
        style="z-index: 2; position: absolute; bottom: 10px; right: 10px; width: 240px; height: 160px"
      ></div>
    </div>
    <CiEntityTreeDialog
      v-if="isShowDialog"
      :relList="currentRelList"
      :ciEntityIdList="currentCiEntityIdList"
      :isEmiting="isLayouting"
      @close="closeDialog"
      @append="addCiEntityNode"
      @remove="removeCiEntityNode"
    ></CiEntityTreeDialog>
    <CiEntityDialog
      v-if="isShowCiEntity"
      :ciId="currentCiId"
      :ciEntityId="currentCiEntityId"
      @close="
        isShowCiEntity = false;
        currentCiId = null;
        currentCiEntityId = null;
      "
    ></CiEntityDialog>
  </div>
</template>
<script>
import { Graph } from '@antv/g6';
import '@/resources/assets/font/tsfonts/tsfont.js';
import '@/resources/assets/font/tsIconfont.js';
import '@/views/pages/cmdb/cientity/customnodes/cientity-combo.js';

export default {
  name: '',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    CiEntityDialog: () => import('@/views/pages/cmdb/cientity/cientity-detail-dialog.vue'),
    CiEntityTreeDialog: () => import('@/views/pages/cmdb/cientity/cientity-tree-cientity-dialog.vue')
  },
  props: {
    mode: { type: String, default: 'window' }, //window|dialog
    needToolbar: { type: Boolean, default: true },
    rootCiEntity: { type: Object }, //起点配置项
    ciEntityId: { type: Number },
    ciId: { type: Number },
    height: { type: Number },
    templateId: { type: Number },
    globalAttrFilter: { type: Array }
  },
  data() {
    return {
      isShowDialog: false,
      currentRelList: [],
      currentCiEntityIdList: [],
      currentCiId: null,
      currentCiEntityId: null,
      showMinimap: false,
      isLoading: false,
      graph: null,
      currentLayout: 'antv-dagre',
      isShowCiEntity: false, //是否显示配置项详情
      isLayouting: false, //正在布局过程中，不能响应其他动作，否则可能会报错
      relAnimationMap: {},
      layoutType: {
        'antv-dagre': {
          type: 'antv-dagre',
          name: '分层布局',
          ranker: 'network-simplex',
          rankdir: 'TB', //从上到下布局
          nodeSize: [40, 40],
          nodesep: 20,
          ranksep: 20,
          sortByCombo: true,
          focusNode: this.rootCiEntity.id.toString(),
          radial: true
        },
        circular: {
          type: 'circular',
          name: '环形布局',
          nodeSize: [40, 40],
          nodeSpacing: 20,
          ordering: 'topology-directed'
        },
        concentric: {
          type: 'concentric',
          name: '同心圆布局',
          nodeSize: 40,
          nodeSpacing: 20,
          preventOverlap: true
        },
        'compact-box': {
          type: 'compact-box',
          name: '径向布局',
          radial: true,
          direction: 'RL',
          getHeight: () => {
            return 40;
          },
          getWidth: () => {
            return 40;
          },
          getVGap: () => {
            return 20;
          },
          getHGap: () => {
            return 20;
          }
        },
        'indented': {
          type: 'indented',
          name: '缩进树布局',
          direction: 'H',
          indent: 80,
          getHeight: () => {
            return 40;
          },
          getWidth: () => {
            return 40;
          },
          getVGap: () => {
            return 20;
          },
          getHGap: () => {
            return 20;
          }
        }
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
    closeDialog(needRefresh) {
      this.isShowDialog = false;
      this.currentCiEntityIdList = [];
      this.currentRelList = [];
      if (needRefresh) {
        //
      }
    },
    clickCiEntity(cientity) {
      if (this.isLayouting) {
        this.$Message.info('图形布局中，请稍后...');
        return;
      }
      //点击配置项先获取关系
      this.$api.cmdb.cientity.getRelEntityCountByCiEntityId(cientity.ciEntityId).then(res => {
        const relList = res.Return;
        if (relList.length > 0) {
          relList.forEach(item => {
            if (item.fromRelEntityCount || item.toRelEntityCount) {
              this.addRelNode(cientity, item);
            }
          });
        }
      });
    },
    async clickRel(rel) {
      if (this.isLayouting) {
        this.$Message.info('图形布局中，请稍后...');
        return;
      }
      //点击关系获取配置项
      const nodes = this.graph.getNodeData();
      const relcombos = nodes.filter(d => d.data.relList && !!d.data.relList.find(dd => dd.relId === rel.relId));
      if (relcombos.length === 0) {
        this.$api.cmdb.cientity
          .searchCiEntity({
            ciId: rel.direction === 'from' ? rel.toCiId : rel.fromCiId,
            relId: rel.relId,
            direction: rel.direction === 'from' ? 'to' : 'from',
            relCiEntityId: rel.ciEntityId,
            showAttrRelList: ['const_name', 'const_id'] //限制返回信息
          })
          .then(res => {
            if (res.Return.tbodyList && res.Return.tbodyList.length > 0) {
              res.Return.tbodyList.forEach(async item => {
                await this.addCiEntityNode(item, rel);
              });
            }
          });
      } else {
        //collapse布局有bug，暂时不支持收起
        /*const combos = this.graph.getComboData();
        const combo = combos.find(d => d.data.relList.some(d => d.relId === rel.relId));
        if (combo) {
          if (!combo.data._collapsed) {
            await this.graph.collapseElement(combo.id, false);
            combo.data._collapsed = true;
          } else {
            await this.graph.expandElement(combo.id, false);
            combo.data._collapsed = false;
          }
        }*/
      }
    },
    isNodeExists(id) {
      id = id.toString();
      const nodes = this.graph.getNodeData();
      return nodes.some(d => d.id === id);
    },
    isEdgeExists(id) {
      id = id.toString();
      const edges = this.graph.getEdgeData();
      return edges.some(d => d.id === id);
    },
    getComboDataById(id) {
      const combos = this.graph.getComboData();
      return combos.find(d => d.id === id.toString());
    },
    async addRelNode(cientity, rel) {
      let hasNew = false;
      if (!this.isNodeExists(rel.id)) {
        this.graph.addNodeData([
          {
            id: rel.id.toString(),
            data: {
              relId: rel.id,
              direction: rel.direction,
              fromCiId: rel.fromCiId,
              toCiId: rel.toCiId,
              fromLabel: rel.fromLabel,
              toLabel: rel.toLabel,
              fromRelEntityCount: rel.fromRelEntityCount,
              toRelEntityCount: rel.toRelEntityCount,
              ciEntityId: cientity.ciEntityId,
              type: 'rel',
              //name: rel.direction === 'from' ? rel.toLabel : rel.fromLabel,
              icon: '\ue8e4' //rel.direction === 'from' ? '\ue81b' : '\ue81e'
            }
          }
        ]);
        hasNew = true;
      }
      let source, target;
      if (rel.direction === 'from') {
        source = cientity.ciEntityId;
        target = rel.id;
      } else {
        source = rel.id;
        target = cientity.ciEntityId;
      }
      if (!this.isEdgeExists(source + '-' + target)) {
        this.graph.addEdgeData([
          {
            id: source + '-' + target,
            source: source.toString(),
            target: target.toString()
          }
        ]);
        hasNew = true;
      }
      if (hasNew) {
        this.$nextTick(() => {
          this.doLayout();
        });
      }
    },
    getNodeDataById(id) {
      const nodes = this.graph.getNodeData();
      return nodes.find(d => d.id === id.toString());
    },
    //删除所有孤立节点
    removeIsolatedNodes() {
      const visited = new Set();
      const queue = [this.rootCiEntity.id.toString()]; // 从根节点开始搜索
      // BFS搜索所有能连通到的节点
      while (queue.length > 0) {
        const currentId = queue.shift();
        if (visited.has(currentId)) {
          continue;
        }
        visited.add(currentId);

        const neighbors = this.graph.getNeighborNodesData(currentId);
        neighbors.forEach(node => {
          if (!visited.has(node.id)) {
            queue.push(node.id);
          }
        });
      }

      // 删除所有没有访问到的节点
      const allNodes = this.graph.getNodeData();
      allNodes.forEach(node => {
        const nodeId = node.id;
        if (!visited.has(nodeId)) {
          this.removeNodeById(nodeId);
        }
      });
    },
    //删除缺失来源配置项的关系节点
    removeNoCiEntityRelNode(cientityid) {
      const allNodes = this.graph.getNodeData();
      if (!cientityid) {
        allNodes.forEach(node => {
          if (node.data.type === 'rel' && node.data.ciEntityId && !this.getNodeDataById(node.data.ciEntityId)) {
            this.removeNodeById(node.id);
          }
        });
      } else {
        allNodes.forEach(node => {
          if (node.data.type === 'rel' && node.data.ciEntityId && node.data.ciEntityId.toString() === cientityid.toString()) {
            this.removeNodeById(cientityid);
          }
        });
      }
    },
    removeNodeById(id) {
      id = id.toString();
      const ciEntityNode = this.getNodeDataById(id);
      if (!ciEntityNode) {
        return;
      }
      let comboNode;
      if (ciEntityNode.combo) {
        comboNode = this.getComboDataById(ciEntityNode.combo);
      }
      this.graph.removeNodeData([id]);
      if (comboNode) {
        const nodes = this.graph.getNodeData();
        const childNodes = nodes.filter(d => d.combo === comboNode.id);
        if (childNodes.length === 0) {
          //暂停进行中的布局，否则可能出现找不到节点的异常
          this.graph.removeComboData([comboNode.id]);
        }
      }
    },
    //重置所有combo节点的RelList数据，避免删除了rel节点后还有残留
    resetCiEntityNodeRelList() {
      const nodes = this.graph.getNodeData();
      nodes.forEach(d => {
        const relList = d.data.relList;
        if (relList && relList.length > 0) {
          for (let i = relList.length - 1; i >= 0; i--) {
            if (!this.getNodeDataById(relList[i].relId)) {
              relList.splice(i, 1);
            }
          }
        }
      });
    },
    //删除配置项节点
    async removeCiEntityNode(cientity, rel) {
      //删除当前配置项节点
      this.removeNodeById(cientity.id);
      //删除由它产生的关系节点
      this.removeNoCiEntityRelNode(cientity.id);
      //删除所有孤立节点
      this.removeIsolatedNodes();
      //重置combo的RelList数据
      this.resetCiEntityNodeRelList();
      this.$nextTick(() => {
        this.doLayout();
      });
    },
    async addCiEntityNode(cientity, rel) {
      let hasNew = false;
      const comboData = this.getComboDataById(cientity.type);
      if (!comboData) {
        this.graph.addComboData([
          {
            id: cientity.type.toString(),
            data: {
              relList: [rel],
              name: cientity.typeName,
              onClick: ({ combo }) => {
                const nodes = this.graph.getNodeData();
                const childNodes = nodes.filter(d => d.combo === combo.id);
                this.currentRelList = combo.data.relList;
                this.currentCiEntityIdList = childNodes.map(d => d.data.ciEntityId);
                this.isShowDialog = true;
              }
            }
          }
        ]);
        hasNew = true;
      } else {
        if (!comboData.data.relList.find(d => d.relId === rel.relId)) {
          comboData.data.relList.push(rel);
        }
      }

      const nodeData = this.getNodeDataById(cientity.id);
      if (!nodeData) {
        this.graph.addNodeData([
          {
            id: cientity.id.toString(),
            combo: cientity.type.toString(),
            data: {
              relList: [rel], //记录来源关系id，便于后续删除时能找到对应的节点
              type: 'cientity',
              ciEntityId: cientity.id,
              ciType: cientity.type,
              ciId: cientity.ciId,
              name: cientity.name,
              icon: cientity.ciIcon //this.$utils.getUnicodeByClassName(cientity.ciIcon)
            }
          }
        ]);
        hasNew = true;
      } else {
        if (!nodeData.data.relList.find(d => d.relId === rel.relId)) {
          nodeData.data.relList.push(rel);
        }
      }

      let source, target;
      if (rel.direction === 'from') {
        source = rel.relId;
        target = cientity.id;
      } else {
        source = cientity.id;
        target = rel.relId;
      }
      if (!this.isEdgeExists(source + '-' + target)) {
        this.graph.addEdgeData([
          {
            id: source + '-' + target,
            source: source.toString(),
            target: target.toString()
          }
        ]);
        hasNew = true;
      }

      if (hasNew) {
        this.$nextTick(() => {
          this.doLayout();
        });
      }
    },
    async doLayout() {
      this.isLayouting = true;
      await this.graph.draw();
      await this.graph.layout();
      this.isLayouting = false;
    },
    async initGraph() {
      const container = this.$refs.container;
      this.graph = new Graph({
        container: container,
        autoFit: 'center',
        autoResize: true,
        node: {
          type: d => {
            const data = d.data;
            if (data.type === 'cientity') {
              return 'image';
            } else if (data.type === 'rel') {
              return 'hexagon';
            }
            return d.type;
          },
          style: {
            cursor: 'pointer',
            src: d => {
              const data = d.data;
              if (data.type === 'cientity') {
                return '/resource/img/topo/' + data.icon + '.png';
              }
            },
            badge: true, // 是否显示徽标
            badges: d => {
              const data = d.data;
              const badges = [];
              if (data.type === 'rel') {
                //生成关系徽章
                if (data.fromLabel) {
                  badges.push({
                    text: data.fromLabel,
                    placement: 'left-top',
                    backgroundFill: '#FFBE3A'
                  });
                  if (data.fromRelEntityCount) {
                    badges.push({
                      text: data.fromRelEntityCount.toString(),
                      placement: 'right-top',
                      backgroundFill: '#F4664A'
                    });
                  }
                }
                if (data.toLabel) {
                  badges.push({
                    text: data.toLabel,
                    placement: 'left-bottom',
                    backgroundFill: '#FFBE3A'
                  });
                  if (data.toRelEntityCount) {
                    badges.push({
                      text: data.toRelEntityCount.toString(),
                      placement: 'right-bottom',
                      backgroundFill: '#F4664A'
                    });
                  }
                }
              } else if (data.type === 'cientity') {
                //
              }
              return badges;
            },
            // badgePalette: ['#FFBE3A', '#F4664A', '#FFBE3A'],
            size: d => {
              const data = d.data;
              if (data.type === 'cientity') {
                return 40;
              } else if (data.type === 'rel') {
                return 25;
              }
              return d.size;
            },
            fill: d => {
              const data = d.data;
              if (data.type === 'cientity') {
                if (data.isRoot) {
                  return '#1670f0';
                } else {
                  return '#1690ff';
                }
              } else if (data.type === 'rel') {
                return '#1690ff';
              }
              return d.fill;
            },
            labelFontWeight: d => {
              const data = d.data;
              if (data.isRoot) {
                return 'bold';
              } else {
                return 'normal';
              }
            },
            labelFill: d => {
              const data = d.data;
              if (data.isRoot) {
                return 'red';
              } else {
                return 'black';
              }
            },
            labelText: d => d?.data?.name || '',
            iconFontFamily: 'tsfont',
            iconText: d => {
              const data = d.data;
              if (data.type === 'rel') {
                return data.icon;
              }
            },
            labelBackground: true,
            ports: [{ placement: 'top' }, { placement: 'bottom' }]
          },
          palette: {
            field: d => d.combo
          }
        },
        edge: {
          type: 'cubic-vertical',
          style: {
            endArrow: true
          }
        },
        combo: {
          type: 'cientity-combo',
          style: {
            radius: 8,
            labelText: d => d.data.name,
            labelBackground: true,
            labelFill: '#999'
          }
        },
        layout: {
          type: 'antv-dagre',
          ranker: 'network-simplex',
          rankdir: 'TB', //从上到下布局
          nodeSize: [40, 40],
          nodesep: 20,
          ranksep: 20,
          sortByCombo: true,
          focusNode: this.rootCiEntity.id.toString(),
          radial: true
        },
        behaviors: ['drag-element', 'drag-canvas', 'zoom-canvas'],
        plugins: [
          {
            type: 'contextmenu',
            trigger: 'contextmenu',
            onClick: (a, b, target) => {
              const nodeData = this.getNodeDataById(target.id);
              if (nodeData && nodeData.data) {
                if (nodeData.data.type === 'cientity') {
                  this.isShowCiEntity = true;
                  this.currentCiId = nodeData.data.ciId;
                  this.currentCiEntityId = nodeData.data.ciEntityId;
                }
              }
            },
            getItems: () => {
              return [{ name: '查看详情', value: 'detail' }];
            },
            enable: e => {
              const id = e.target.id;
              const nodeData = this.getNodeDataById(id);
              return nodeData && nodeData.data.type === 'cientity';
            }
          }
        ]
      });
      this.graph.on('node:click', evt => {
        const { targetType, target } = evt;
        const nodeData = this.graph.getNodeData(target.id);
        if (nodeData && nodeData.data) {
          if (nodeData.data.type === 'cientity') {
            this.clickCiEntity(nodeData.data);
          } else if (nodeData.data.type === 'rel') {
            this.clickRel(nodeData.data);
          }
        }
      });
      this.graph.addNodeData([
        {
          id: this.rootCiEntity.id.toString(),
          data: {
            type: 'cientity',
            ciEntityId: this.rootCiEntity.id,
            ciId: this.rootCiEntity.ciId,
            name: this.rootCiEntity.name,
            icon: this.rootCiEntity.ciIcon, //this.$utils.getUnicodeByClassName(this.rootCiEntity.ciIcon),
            isRoot: true
          }
        }
      ]);
      await this.graph.render();
      this.graph.fitCenter();
    },
    toggleMinimap(val) {
      this.$nextTick(() => {
        const plugins = this.graph.getPlugins();
        const index = plugins.findIndex(d => d.type === 'minimap');
        if (val) {
          if (index < 0) {
            plugins.push({
              type: 'minimap',
              key: 'minimap',
              container: this.$refs['minimap'],
              position: 'right-bottom',
              delay: 0,
              size: [240, 160]
            });
            this.graph.setPlugins(plugins);
          }
        } else {
          if (index >= 0) {
            plugins.splice(index, 1);
            this.graph.setPlugins(plugins);
          }
        }
      });
    },
    setLayout(type) {
      this.graph.setLayout(this.layoutType[type]);
      this.currentLayout = type;
      this.doLayout();
    }
  },
  filter: {},
  computed: {},
  watch: {
    showMinimap: {
      handler: function(val) {}
    }
  }
};
</script>
<style lang="less">
@import '@/views/pages/cmdb/public/graphviz.less';
</style>
<style lang="less" scoped></style>
