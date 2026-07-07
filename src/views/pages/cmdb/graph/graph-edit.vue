<template>
  <div>
    <TsContain
      :rightWidth="250"
      :siderWidth="280"
      border="border"
      :enableCollapse="true"
      @toggleSiderHide="toggleSiderHide"
    >
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <TsFormInput
          ref="txtName"
          v-model="graphData.name"
          :width="350"
          border="border"
          :placeholder="$t('form.placeholder.name')"
          :validateList="[{ name: 'required', message: '' }]"
          style="display: inline-block"
          :maxlength="50"
        ></TsFormInput>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span v-if="graphData.type === 'public'" class="action-item"><TsFormSwitch
            v-model="graphData.isActive"
            :true-value="1"
            :false-value="0"
            showStatus
          ></TsFormSwitch></span>
          <span v-if="invokeGraphList.length > 0" class="action-item">
            <Dropdown>
              <span>
                {{ $t('term.cmdb.invokelist') }}
                <Icon type="ios-arrow-down"></Icon>
              </span>
              <DropdownMenu slot="list">
                <DropdownItem v-for="(graphItem, index) in invokeGraphList" :key="index">
                  <a :class="graphItem.icon" href="javascript:void(0)" @click="toGraph(graphItem)">{{ graphItem.name }}</a>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </span>
          <span class="action-item">
            <Button type="primary" @click="saveGraph(true)">{{ $t('page.save') }}</Button>
          </span>
          <span v-if="graphData.id && invokeGraphList.length === 0" class="action-item">
            <Button type="error" @click="deleteGraph()">{{ $t('page.delete') }}</Button>
          </span>
        </div>
      </template>
      <template v-slot:sider>
        <div class="pr-md">
          <Tabs v-model="activeTab" type="card">
            <TabPane :label="$t('term.cmdb.cientity')" name="cientity"></TabPane>
            <TabPane :label="$t('term.cmdb.view')" name="graph"></TabPane>
            <TabPane :label="$t('term.cmdb.other')" name="other"></TabPane>
          </Tabs>
          <!--type=card有问题，所以使用这种方式实现，后面修复了再调回来-->
          <div v-if="activeTab === 'cientity'" class="bg-op padding radius-sm" style="border-top-left-radius: 0px; height: calc(100vh - 148px); overflow-y: auto">
            <div>
              <TsFormSelect v-bind="ciSelectConfig"></TsFormSelect>
              <Divider />
              <InputSearcher :placeholder="$t('form.placeholder.keyword')" @change="doSearch"></InputSearcher>
            </div>
            <div ref="ciEntityList">
              <TsUlList
                v-if="isReady && ciEntityData && ciEntityData.tbodyList"
                :dataList="ciEntityData.tbodyList"
                v-bind="ciEntityData"
                pager="scroll"
                itemStyle="display:inline-block;width:50%"
                :height="ciEntityListHeight"
                @updatePage="searchCiEntity"
              >
                <template slot-scope="{ row }">
                  <div :draggable="!isNodeExists(row)" :style="isNodeExists(row) ? 'cursor:not-allowed' : ''" @dragstart="drag($event, row, 'cientity')">
                    <div style="margin: auto; line-height: 40px; text-align: center; width: 40px; height: 40px; border-radius: 40px" class="bg-grey">
                      <span :class="row.ciIcon" style="font-size: 16px" class="text-grey"></span>
                    </div>
                    <div class="overflow" style="text-align: center" :class="{ 'text-primary': isNodeExists(row) }">{{ row.name || '-' }}</div>
                  </div>
                </template>
              </TsUlList>
            </div>
          </div>
          <div v-if="activeTab === 'graph'" class="bg-op padding radius-sm" style="height: calc(100vh - 148px); overflow-y: auto">
            <div>
              <InputSearcher :placeholder="$t('form.placeholder.keyword')" @change="doSearch"></InputSearcher>
            </div>
            <div ref="graphList">
              <TsUlList
                v-if="isReady && graphSearchData && graphSearchData.tbodyList"
                :dataList="graphSearchData.tbodyList"
                v-bind="graphSearchData"
                pager="scroll"
                itemStyle="display:inline-block;width:50%"
                :height="graphListHeight"
                @updatePage="searchGraph"
              >
                <template slot-scope="{ row }">
                  <div :draggable="!isNodeExists(row)" :style="isNodeExists(row) ? 'cursor:not-allowed' : ''" @dragstart="drag($event, row, 'graph')">
                    <div :class="{ 'text-primary': !row.id, 'text-grey': !!row.id }" style="margin: auto; line-height: 40px; text-align: center; width: 40px; height: 40px; border-radius: 5px" class="bg-grey">
                      <span :class="row.icon" style="font-size: 16px"></span>
                    </div>
                    <div class="overflow" :class="{ 'text-primary': !row.id || isNodeExists(row) }" style="text-align: center">{{ row.name || '-' }}</div>
                  </div>
                </template>
              </TsUlList>
            </div>
          </div>
          <div v-if="activeTab === 'other'" class="bg-op padding radius-sm" style="height: calc(100vh - 148px); overflow-y: auto">
            <ul class="tscard-ul ivu-row">
              <div draggable="true" @dragstart="drag($event, null, 'group')">
                <div style="border-radius: 5px" class="bg-grey padding cursor">
                  <span class="tsfont-square text-grey">{{ $t('page.group') }}</span>
                </div>
              </div>
            </ul>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div class="bg-op radius-md" style="height: 100%">
          <div style="height: 34px">
            <GraphEditorToolbar
              :selectedNode="currentNode"
              :selectedEdge="currentEdge"
              :graph="graph"
              :config="toolbarConfig"
              mode="graph"
            ></GraphEditorToolbar>
          </div>
          <div style="height: calc(100% - 40px)">
            <GraphEditor
              ref="flowEditor"
              :config="{}"
              :muted="true"
              :callback="{ validateNode: validateNode }"
              :edgeMode="toolbarConfig.edgeMode"
              @ready="ready"
              @node:selected="nodeSelected"
              @node:unselected="nodeUnSelected"
              @node:removed="nodeRemoved"
              @edge:selected="edgeSelected"
              @edge:unselected="edgeUnSelected"
            ></GraphEditor>
          </div>
        </div>
      </template>
      <template v-slot:right>
        <div class="margin-md">
          <NodeConfig v-if="currentNode" :data="currentNodeData"></NodeConfig>
          <EdgeConfig v-else-if="currentEdge" :edge="currentEdge" :data="currentEdgeData"></EdgeConfig>
          <GraphConfig v-else :graph="graph" :graphData="graphData"></GraphConfig>
        </div>
      </template>
    </TsContain>

    <GraphAddDialog v-if="isAddGraphShow" :type="graphData.type" @close="closeGraphDialog"></GraphAddDialog>
  </div>
</template>
<script>
import { NodeFactory } from '@/views/pages/cmdb/graph/graph-editor/element/core/NodeFactory.js';
export default {
  name: '',
  components: {
    GraphEditorToolbar: () => import('@/views/pages/cmdb/graph/graph-editor/graph-editor-toolbar.vue'),
    GraphEditor: () => import('@/views/pages/cmdb/graph/graph-editor/graph-editor.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsUlList: () => import('@/resources/components/TsUlList/TsUlList.vue'),

    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    NodeConfig: () => import('./node-config.vue'),
    EdgeConfig: () => import('./edge-config.vue'),
    GraphConfig: () => import('./graph-config.vue'),
    GraphAddDialog: () => import('./graph-add-dialog.vue')
  },
  props: {},
  data() {
    const _this = this;
    return {
      id: null,
      currentElement: null,
      activeTab: 'cientity',
      ciList: [],
      isAddGraphShow: false,
      newGraphX: null,
      newGraphY: null,
      searchCiEntityParam: {},
      searchGraphParam: { isActive: 1 },
      ciEntityData: {},
      isReady: true,

      ciEntityListHeight: 200,
      graphListHeight: 200,
      invokeGraphList: [], //引用视图列表
      ciSelectConfig: {
        url: 'api/rest/cmdb/ci/citype/search',
        validateList: ['required'],
        placeholder: this.$t('form.placeholder.pleaseselect', { target: this.$t('term.cmdb.ci') }),
        valueName: 'id',
        textName: 'label',
        childrenName: 'ciList',
        parentValueName: 'id',
        parentTextName: 'name',
        search: true,
        mode: 'group',
        transfer: true,
        onChange: val => {
          this.searchCiEntityParam.ciId = val;
          this.searchCiEntity();
        }
      },
      graphSearchData: [],
      graphData: {
        name: '',
        description: '',
        icon: 'tsfont-question-o',
        isActive: 1,
        config: { backgroundLayout: '' }
      },
      //新的开始
      graph: null,
      dnd: null,
      currentNode: null, //当前选中节点对象
      currentNodeData: null, //当前选中节点的数据
      currentEdge: null, //当前选中边
      currentEdgeData: null, //当前选中连线数据
      toolbarConfig: { edgeMode: false }
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.name == 'graph-edit-public') {
      this.graphData.type = 'public';
    } else if (this.$route.name == 'graph-edit-private') {
      this.graphData.type = 'private';
    }
    if (this.$route.params['id']) {
      this.id = parseInt(this.$route.params['id']);
    }
  },
  beforeMount() {},
  mounted() {
    this.searchGraph();
    this.getInvokeGraphList();
    window.addEventListener('resize', () => {
      this.calcCiEntityHeight();
      this.calcGraphHeight();
    });
    this.calcCiEntityHeight();
    this.calcGraphHeight();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getGraphById() {
      if (this.id) {
        await this.$api.cmdb.graph.getGraphById(this.id).then(res => {
          this.graphData = res.Return;
        });
      }
    },
    //流程图ready后的回调方法
    async ready(graph, dnd) {
      this.graph = graph;
      this.dnd = dnd;
      await this.getGraphById();
      if (this.graphData?.config?.topo) {
        this.graph.fromJSON(this.graphData.config.topo);
      }
      this.$nextTick(() => {
        setTimeout(() => {
          this.graph.centerContent();
        }, 500);
      });
    },
    drag(event, component, type) {
      const config = { data: { handler: type } };
      if (component) {
        const { id, name, ciIcon, icon, ciId } = component;
        config.id = id;
        config.data = { icon: ciIcon || icon, name, id, handler: type, ciId };
      }
      const node = NodeFactory.createNode(this.graph, { handler: type }, config);
      this.dnd.start(node, event);
    },
    nodeRemoved() {
      this.refreshList();
    },
    edgeUnSelected() {
      this.currentEdgeData = null;
      this.currentEdge = null;
      this.isSelected = false;
    },
    edgeSelected(edge) {
      //先清空选中数据，强制刷新相关组件
      this.isSelected = false;
      this.currentNode = null;
      this.currentNodeData = null;
      this.currentEdge = null;
      this.currentEdgeData = null;
      this.$nextTick(() => {
        this.currentEdge = edge;
        this.currentEdgeData = edge.getData();
        this.isSelected = true;
      });
    },
    nodeUnSelected() {
      this.currentNodeData = null;
      this.currentNode = null;
      this.isSelected = false;
    },

    nodeSelected(node) {
      //先清空选中数据，强制刷新相关组件
      this.isSelected = false;
      this.currentNode = null;
      this.currentNodeData = null;
      this.currentEdge = null;
      this.currentEdgeData = null;
      this.$nextTick(() => {
        this.currentNode = node;
        this.currentNodeData = node.getData();
        this.isSelected = true;
      });
    },
    validateNode(node) {
      const data = node.getData();
      if (data && data.handler === 'graph' && !data.id) {
        this.isAddGraphShow = true;
        this.newGraphX = node.position().x;
        this.newGraphY = node.position().y;
        return false;
      }
      this.refreshList();
      return true;
    },
    isNodeExists(row) {
      if (this.graph) {
        if (!row.id) {
          return false;
        }
        const node = this.graph.getCellById(row.id);
        if (node) {
          return true;
        }
      }
      return false;
    },
    toggleSiderHide(isHide) {
      setTimeout(() => {
        this.calcTopoHeight();
      }, 300);
    },
    beforeLeaveCompare(oldData) {
      // 离开当前页面，数据对比, getSaveData() 方法为获取提交后端数据的方法
      return this.$utils.isSame(oldData, this.graphData);
    },
    async beforeLeave() {
      return await this.saveGraph();
    },
    closeGraphDialog(graphData) {
      this.isAddGraphShow = false;
      if (graphData) {
        const { id, name, icon } = graphData;
        const config = { id, x: this.newGraphX, y: this.newGraphY };
        config.data = { icon, name, id, handler: 'graph' };
        const node = NodeFactory.createNode(this.graph, { handler: 'graph' }, config);
        this.graph.addNode(node);
        this.searchGraph();
      }
    },
    toGraph(graph) {
      this.$router.push({ path: '/graph-data/' + graph.id });
    },
    getInvokeGraphList() {
      if (this.id) {
        this.$api.cmdb.graph.getInvokeGraph(this.id).then(res => {
          this.invokeGraphList = res.Return;
        });
      }
    },
    addGraph() {
      this.$router.push({ path: '/graph-edit/' + this.graphData.type });
    },

    calcCiEntityHeight() {
      setTimeout(() => {
        //减去底部的距离
        this.ciEntityListHeight = window.innerHeight - 39 - (this.$refs.ciEntityList ? this.$refs.ciEntityList.getBoundingClientRect().top : 0);
      }, 500);
    },
    calcGraphHeight() {
      setTimeout(() => {
        //减去底部的距离
        this.graphListHeight = window.innerHeight - 39 - (this.$refs.graphList ? this.$refs.graphList.getBoundingClientRect().top : 0);
      }, 500);
    },
    searchCiEntity(currentPage) {
      if (this.searchCiEntityParam.ciId) {
        if (currentPage) {
          this.searchCiEntityParam.currentPage = currentPage;
        }
        this.$api.cmdb.cientity.searchCiEntity(this.searchCiEntityParam).then(res => {
          if (res.Return.currentPage === 1) {
            this.ciEntityData = res.Return;
          } else if (res.Return.currentPage > 1) {
            if (res.Return.tbodyList.length > 0) {
              this.$set(this.ciEntityData, 'currentPage', res.Return.currentPage);
              this.ciEntityData.tbodyList.push(...res.Return.tbodyList);
            }
          }
        });
      } else {
        this.ciEntityData = {};
      }
    },
    searchGraph(currentPage) {
      if (currentPage) {
        this.searchGraphParam.currentPage = currentPage;
      } else {
        this.searchGraphParam.currentPage = 1;
      }
      this.searchGraphParam.excludeId = this.id;
      this.$api.cmdb.graph.searchGraph(this.searchGraphParam).then(res => {
        if (res.Return.currentPage === 1) {
          this.graphSearchData = res.Return;
        } else if (res.Return.currentPage > 1) {
          if (res.Return.tbodyList.length > 0) {
            this.$set(this.graphSearchData, 'currentPage', res.Return.currentPage);
            this.graphSearchData.tbodyList.push(...res.Return.tbodyList);
          }
        }
        //添加新视图入口
        this.graphSearchData.tbodyList.unshift({ icon: 'tsfont-plus', name: this.$t('dialog.title.newgraph') });
      });
    },
    doSearch(keyword) {
      if (this.activeTab === 'cientity') {
        this.searchCiEntityParam.keyword = keyword;
        this.searchCiEntity(1);
      } else if (this.activeTab === 'graph') {
        this.searchGraphParam.keyword = keyword;
        this.searchGraph(1);
      }
    },
    refreshList() {
      this.isReady = false;
      this.$nextTick(() => {
        this.isReady = true;
      });
    },
    drawGroup(x, y) {
      const group = this.topo.addGroup({
        type: 'GraphGroup',
        x: x,
        y: y,
        strokewidth: 2,
        rx: 0,
        ry: 0
      });
      group.draw();
      return group;
    },
    async saveGraph(needRefresh) {
      let isSuccess = false;
      if (this.$refs['txtName'].valid()) {
        this.graph.cleanSelection();
        this.graphData.config.topo = this.graph.toJSON();
        await this.$api.cmdb.graph.saveGraph(this.graphData).then(res => {
          if (res.Status == 'OK') {
            this.$addWatchData(this.graphData);
            isSuccess = true;
            this.$Message.success(this.$t('message.savesuccess'));
            if (needRefresh) {
              if (!this.id) {
                this.$router.push({ path: '/graph-edit/' + res.Return.id });
              }
            }
            // 刷新左侧菜单
            this.$store.commit('leftMenu/setCmdbCustomViewCount', 'add');
          } else {
            this.$Message.error(this.$t('message.savefailed'));
          }
        });
      } else {
        this.$Message.info(this.$t('form.placeholder.pleaseinput', { target: this.$t('term.cmdb.viewname') }));
      }
      return isSuccess;
    },
    deleteGraph() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: 'term.cmdb.view' }),
        cancelText: this.$t('page.cancel'),
        btnType: 'error',
        okText: this.$t('page.confirm'),
        'on-ok': vnode => {
          this.$api.cmdb.graph.deleteGraph(this.graphData.id).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.$store.commit('leftMenu/setCmdbCustomViewCount', 'minus');
              this.$router.push('/welcome');
            }
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import './grapheditor/topo.less';
.topoContainer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
</style>
