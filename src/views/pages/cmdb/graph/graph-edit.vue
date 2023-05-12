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
          style="display:inline-block"
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
                <DropdownItem v-for="(graph, index) in invokeGraphList" :key="index">
                  <a :class="graph.icon" href="javascript:void(0)" @click="toGraph(graph)">{{ graph.name }}</a>
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
            <TabPane label="配置项" name="cientity"></TabPane>
            <TabPane label="视图" name="graph"></TabPane>
            <TabPane label="其他" name="other"></TabPane>
          </Tabs>
          <!--type=card有问题，所以使用这种方式实现，后面修复了再调回来-->
          <div v-if="activeTab === 'cientity'" class="bg-op padding radius-sm" style="border-top-left-radius:0px;height:calc(100vh - 148px);overflow-y:auto">
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
                  <div :draggable="isNodeExists(row)" :style="!isNodeExists(row) ? 'cursor:not-allowed' : ''" @dragstart="dragCiEntity($event, row)">
                    <div style="margin:auto;line-height:40px;text-align:center;width: 40px; height: 40px; border-radius: 40px;" class="bg-grey">
                      <span :class="row.ciIcon" style="font-size:16px" class="text-grey"></span>
                    </div>
                    <div class="overflow" style="text-align:center" :class="{ 'text-primary': !isNodeExists(row) }">{{ row.name || '-' }}</div>
                  </div>
                </template>
              </TsUlList>
            </div>
          </div>
          <div v-if="activeTab === 'graph'" class="bg-op padding radius-sm" style="height:calc(100vh - 148px);overflow-y:auto">
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
                  <div :draggable="isNodeExists(row)" :style="!isNodeExists(row) ? 'cursor:not-allowed' : ''" @dragstart="dragGraph($event, row)">
                    <div :class="{ 'text-primary': !row.id, 'text-grey': !!row.id }" style="margin:auto;line-height:40px;text-align:center;width: 40px; height: 40px; border-radius: 5px;" class="bg-grey">
                      <span :class="row.icon" style="font-size:16px"></span>
                    </div>
                    <div class="overflow" :class="{ 'text-primary': !row.id || !isNodeExists(row) }" style="text-align:center">{{ row.name || '-' }}</div>
                  </div>
                </template>
              </TsUlList>
            </div>
          </div>
          <div v-if="activeTab === 'other'" class="bg-op padding radius-sm" style="height:calc(100vh - 148px);overflow-y:auto">
            <ul class="tscard-ul ivu-row">
              <div draggable="true" @dragstart="dragGroup($event)">
                <div style="border-radius: 5px;" class="bg-grey padding cursor">
                  <span class="tsfont-square text-grey">{{ $t('page.group') }}</span>
                </div>
              </div>
            </ul>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div ref="divTopo" style="position:relative" :style="{ height: height + 'px' }">
          <div
            class="bg-block radius-md topoContainer"
            style="z-index:0;background-size:100% 100%"
            :style="{
              'background-color': graphData.config.backgroundColor || null,
              'background-image': graphData.config.backgroundImage ? 'url(' + graphData.config.backgroundImage + ')' : null
            }"
          ></div>
          <div style="z-index:1" class="radius-md topoContainer">
            <div
              ref="topo"
              style="height:100%"
              @drop="drop"
              @dragover.prevent
            ></div>
          </div>
        </div>
      </template>
      <template v-slot:right>
        <div class="margin-md">
          <GraphConfig
            v-if="currentElement"
            :config="currentElement"
            :graphData="graphData"
            @setConfig="setConfig"
          ></GraphConfig>
          <div v-else>
            <!--视图配置-->
            <TsFormItem :label="$t('page.icon')" labelPosition="top">
              <div class="padding-sm radius-sm">
                <div class="logo bg-block border-color text-primary" @click="isIconDialogShow = true">
                  <i class="logo-icon" :class="graphData.icon || 'tsfont-question-o'"></i>
                </div>
              </div>
            </TsFormItem>
            <TsFormItem v-if="graphData.type === 'public'" :label="$t('page.auth')" labelPosition="top">
              <UserSelect
                v-model="graphData.authList"
                :multiple="true"
                :transfer="true"
                :groupList="['common', 'user', 'role', 'team']"
              ></UserSelect>
            </TsFormItem>
            <TsFormItem :label="$t('page.backgroundcolor')" labelPosition="top">
              <div class="padding-sm radius-sm">
                <ColorPicker
                  :transfer="true"
                  recommend
                  :value="graphData.config.backgroundColor"
                  :visible="true"
                  class="colorPicker"
                  alpha
                  transfer-class-name="color-picker-transfer-class"
                  @on-change="setBackgroundColor"
                />
              </div>
            </TsFormItem>
            <TsFormItem :label="$t('page.backgroundimage')" labelPosition="top">
              <div class="padding-sm radius-sm">
                <div v-if="graphData.config.backgroundImage" class="snapshot">
                  <img class="radius-md" style="width:60%" :src="graphData.config.backgroundImage" />
                  <i class="tsfont-trash-o" style="cursor:pointer" @click="removeBackgrounImage"></i>
                </div>
                <TsUpLoad
                  v-if="!graphData.config.backgroundImage"
                  styleType="button"
                  dataType="image"
                  className="smallUpload"
                  type="drag"
                  :multiple="false"
                  :format="['png', 'jpg', 'jpeg', 'gif']"
                  @getFileList="setBackgroundImage"
                ></TsUpLoad>
              </div>
            </TsFormItem>
            <TsFormItem :label="$t('page.description')" labelPosition="top">
              <div class="padding-sm radius-sm">
                <TsFormInput
                  v-model="graphData.description"
                  type="textarea"
                  border="border"
                  :maxlength="500"
                ></TsFormInput>
              </div>
            </TsFormItem>
          </div>
        </div>
      </template>
    </TsContain>
    <IconDialog
      v-if="isIconDialogShow"
      :currentIcon="graphData.icon"
      @cancel="isIconDialogShow = false"
      @confirm="setGraphIcon"
    ></IconDialog>
    <GraphAddDialog v-if="isAddGraphShow" :type="graphData.type" @close="closeGraphDialog"></GraphAddDialog>
  </div>
</template>
<script>
import './grapheditor/index.js';
export default {
  name: '',
  components: {
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsUlList: resolve => require(['@/resources/components/TsUlList/TsUlList.vue'], resolve),
    IconDialog: resolve => require(['@/views/pages/common/icon-dialog.vue'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    GraphConfig: resolve => require(['./graph-config.vue'], resolve),
    GraphAddDialog: resolve => require(['./graph-add-dialog.vue'], resolve)
  },
  props: {},
  data() {
    const _this = this;
    return {
      id: null,
      width: 200,
      height: 200,
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
      isIconDialogShow: false,
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
      graphData: { name: '', description: '', icon: 'tsfont-question-o', isActive: 1, config: {} },
      topoData: { nodes: [], links: [], groups: [] }
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
    this.initTopo();
    this.getInvokeGraphList();
    window.addEventListener('resize', () => {
      this.calcTopoHeight();
      this.calcCiEntityHeight();
      this.calcGraphHeight();
    });
    this.calcTopoHeight();
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
    isNodeExists(row) {
      if (this.topo) {
        if (!row.id) {
          return true;
        }
        const nodes = this.topo.getNodes();
        if (nodes && nodes.length > 0) {
          return !nodes.find(d => d.getConfig() && d.getConfig().id === row.id);
        } else {
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
        this.drawGraph(graphData, this.newGraphX, this.newGraphY);
      }
    },
    setBackgroundColor(val) {
      this.$set(this.graphData.config, 'backgroundColor', val);
    },
    setBackgroundImage(val) {
      if (val && val.length > 0) {
        this.$set(this.graphData.config, 'backgroundImage', HOME + '/api/binary/image/download?id=' + val[0].id);
      }
    },
    removeBackgrounImage() {
      this.$delete(this.graphData.config, 'backgroundImage');
    },
    calcTopoHeight() {
      this.$nextTick(() => {
        //减去底部的距离
        this.height = window.innerHeight - 18 - (this.$refs.divTopo ? this.$refs.divTopo.getBoundingClientRect().top : 0);
        if (this.$refs.topo) {
          //const height = this.$refs.topo.offsetHeight;
          const height = this.height - 5;
          const width = this.$refs.divTopo.offsetWidth;
          if (this.topo) {
            this.topo.setHeight(height);
            this.topo.setWidth(width);
          }
        }
      });
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
    setGraphIcon(icon) {
      this.graphData.icon = icon;
      this.isIconDialogShow = false;
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
    selectIcon(icon) {
      this.$set(this.graphData, 'icon', icon);
      this.isIconDialogShow = false;
    },
    initTopo() {
      setTimeout(() => {
        const width = this.$refs.divTopo.offsetWidth;
        const height = this.height - 5;
        this.topo = new Topo(this.$refs.topo, {
          'canvas.width': width,
          'canvas.height': height,
          'canvas.class': 'topoGraph',
          'canvas.autoadjust': true, //显示辅助线
          'anchor.size': 4,
          'node.selectedFn': node => {
            this.currentElement = node.getNodeConfig();
          },
          'node.unselectFn': node => {
            this.currentElement = null;
          },
          'node.removeFn': canvas => {
            this.refreshList();
          },
          'group.selectedFn': group => {
            this.currentElement = group.getGroupConfig();
          },
          'group.unselectFn': group => {
            this.currentElement = null;
          },
          'link.selectedFn': link => {
            this.currentElement = link.getLinkConfig();
          },
          'link.unselectFn': link => {
            this.currentElement = null;
          },
          'link.removeFn': (link, param) => {
            if (!param) {
              const targetNode = link.canvas.getNodeByUuid(link.getTarget());
              if (targetNode && targetNode.getType() === 'Ci') {
                targetNode.destory();
              }
            }
          }
        });
        this.topo.draw();
        if (this.id) {
          this.$api.cmdb.graph.getGraphById(this.id).then(res => {
            Object.assign(this.graphData, res.Return);
            if (res.Return.config.topo) {
              this.topoData = res.Return.config.topo;
            }
            this.tagList = res.Return.tagList;
            this.topo.fromJson(this.topoData);
            this.$addWatchData(this.graphData);
          });
        } else {
          this.topo.fromJson(this.topoData);
          this.$addWatchData(this.graphData);
        }
      }, 100);
    },
    dragCiEntity(event, data) {
      const graph = { type: 'cientity' };
      if (data) {
        graph.data = data;
      }
      event.dataTransfer.setData('data', JSON.stringify(graph));
    },
    dragGraph(event, data) {
      const graph = { type: 'graph' };
      if (data) {
        graph.data = data;
      }
      event.dataTransfer.setData('data', JSON.stringify(graph));
    },
    dragGroup(event) {
      const graph = { type: 'group' };
      event.dataTransfer.setData('data', JSON.stringify(graph));
    },
    drop(event) {
      let data = event.dataTransfer.getData('data');
      if (data) {
        data = JSON.parse(data);
        if (data.type === 'graph') {
          this.drawGraph(data.data, event.offsetX, event.offsetY);
        } else if (data.type === 'group') {
          this.drawGroup(event.offsetX, event.offsetY);
        } else if (data.type === 'cientity') {
          this.drawCiEntity(data.data, event.offsetX, event.offsetY);
        }
      }
    },
    drawCiEntity(cientity, x, y) {
      const node = this.topo.addNode({
        name: cientity.name,
        icon: '#' + cientity.ciIcon,
        x: x,
        y: y,
        type: 'cientity',
        config: { ciId: cientity.ciId, id: cientity.id }
      });
      node.draw();
      this.refreshList();
      return node;
    },
    drawGraph(graph, x, y) {
      if (graph.id) {
        const node = this.topo.addNode({
          name: graph.name,
          icon: '#' + graph.icon,
          x: x,
          y: y,
          type: 'graph',
          config: { id: graph.id }
        });
        node.draw();
        this.refreshList();
        return node;
      } else {
        this.isAddGraphShow = true;
        this.newGraphX = x;
        this.newGraphY = y;
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
        this.graphData.config.topo = this.topo.toJson();
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
    },
    setConfig(config) {
      if (this.currentElement) {
        const node = this.topo.getNodeByUuid(this.currentElement.uuid);
        if (node) {
          node.setConfig(config);
        }
      }
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
