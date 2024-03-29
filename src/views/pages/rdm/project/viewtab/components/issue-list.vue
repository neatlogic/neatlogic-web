<template>
  <div>
    <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
    <div class="mb-md grid">
      <div class="action-group" style="align-self: end">
        <span v-if="canAppend" class="action-item">
          <a href="javascript:void(0)" class="tsfont-plus" @click="addIssue()">{{ app.name }}</a>
        </span>
        <span v-if="relType && relAppType && (fromId || toId)" class="action-item">
          <a
            v-if="getAppByType(relAppType)"
            href="javascript:void(0)"
            class="tsfont-bind"
            @click="linkIssue()"
          >{{ $t('dialog.title.linktarget', { target: getAppByType(relAppType).name }) }}</a>
        </span>
        <span v-if="canBatch" class="action-item">
          <a class="tsfont-mark-all" @click="batchExecute()">批量处理</a>
        </span>
      </div>
      <div>
        <!--由于每次搜索都会更新isSearchReady，导致AttrHandler处于不可用状态，为了让某些AttrHandler可以连续输入，例如文本框，搜索绑定在点击确认和删除条件的时候触发-->
        <CombineSearcher
          v-if="canSearch && isShowCombineSearcher"
          v-model="searchValue"
          v-bind="searchConfig"
          @change="searchIssue(1)"
        >
          <template v-slot:createDate="{ valueConfig, textConfig }">
            <TsFormDatePicker
              v-model="valueConfig.createDate"
              border="border"
              :transfer="true"
              type="daterange"
              format="yyyy-MM-dd"
              @change="
                val => {
                  if (val != null) {
                    $set(valueConfig, 'createDate', val);
                    $set(textConfig, 'createDate', val);
                  } else {
                    $delete(valueConfig, 'createDate');
                    $delete(textConfig, 'createDate');
                  }
                }
              "
            ></TsFormDatePicker>
          </template>
          <template v-for="(attr) in searchAttrList" :slot="attr.isPrivate ? attr.name : 'attr_' + attr.id" slot-scope="{ valueConfig, textConfig }">
            <div :key="attr.id">
              <AttrHandler
                v-if="isSearchReady"
                :projectId="projectId"
                :attrConfig="attr"
                :value="attr.isPrivate ? valueConfig[attr.name] : valueConfig['attr_' + attr.id]"
                mode="search"
                @changeLabel="(text) => changeLabel(attr, text, textConfig)"
                @setValue="
                  (val, text) => {
                    if (attr.isPrivate) {
                      if (val != null) {
                        $set(valueConfig, attr.name, val);
                        $set(textConfig, attr.name, text);
                      } else {
                        $delete(valueConfig, attr.name);
                        $delete(textConfig, attr.name);
                      }
                    } else {
                      if (val != null) {
                        $set(valueConfig, 'attr_' + attr.id, val);
                        $set(textConfig, 'attr_' + attr.id, text);
                      } else {
                        $delete(valueConfig, 'attr_' + attr.id);
                        $delete(textConfig, 'attr_' + attr.id);
                      }
                    }
                  }
                "
              ></AttrHandler>
            </div>
          </template>
        </CombineSearcher>
        <div v-if="showStatus" class="mt-xs" style="text-align: right">
          <span v-for="(status, index) in statusList" :key="index" :style="{ color: status.color }">
            <strong>
              <span class="mr-xs">{{ status.label }}</span>
              <span>{{ status.issueCount }}</span>
            </strong>
            <Divider type="vertical" />
          </span>
          <span>
            <strong>
              <span class="mr-xs">{{ $t('page.completrate') }}</span>
              <span>{{ (completeRate * 100).toFixed(2) }}%</span>
            </strong>
          </span>
        </div>
      </div>
    </div>
    <template v-if="!isLoading">
      <div v-if="viewmode === 'gantt'">
        <IssueListGantt
          v-if="isSearchReady && issueData && issueData.tbodyList && issueData.tbodyList.length > 0"
          :theadList="finalTheadList"
          :issueData="issueData"
          :attrList="attrList"
          :canAction="canAction"
          :parentId="parentId"
          :fromId="fromId"
          :toId="toId"
          :mode="mode"
          :projectId="projectId"
          :checkedIdList="checkedIdList"
          @searchIssue="searchIssue"
          @changePageSize="changePageSize"
          @toIssue="toIssueDetail"
          @openIssue="openIssueDetail"
          @deleteIssue="deleteIssue"
          @toggleChildIssue="toggleChildIssue"
          @unlinkIssue="unlinkIssue"
        ></IssueListGantt>
        <NoData v-else-if="isReady && isShowEmptyTable"></NoData>
      </div>
      <div v-else-if="viewmode === 'table'">
        <IssueListTable
          v-if="isSearchReady && issueData && issueData.tbodyList && issueData.tbodyList.length > 0"
          :theadList="finalTheadList"
          :fixedHeader="fixedHeader"
          :sortList="sortList"
          :issueData="issueData"
          :attrList="attrList"
          :canAction="canAction"
          :parentId="parentId"
          :fromId="fromId"
          :toId="toId"
          :mode="mode"
          :sortData="sortData"
          :projectId="projectId"
          :checkedIdList="checkedIdList"
          @updateSort="updateSort"
          @selected="getSelected"
          @searchIssue="searchIssue"
          @changePageSize="changePageSize"
          @toIssue="toIssueDetail"
          @openIssue="openIssueDetail"
          @deleteIssue="deleteIssue"
          @toggleChildIssue="toggleChildIssue"
          @unlinkIssue="unlinkIssue"
        ></IssueListTable>
        <NoData v-else-if="isReady && isShowEmptyTable"></NoData>
      </div>
      <div v-else-if="viewmode === 'storywall'" style="scroll-x: auto; scroll-y: hidden">
        <IssueListStorywall
          v-if="isSearchReady && issueData && issueData.tbodyList && issueData.tbodyList.length > 0"
          :theadList="finalTheadList"
          :issueData="issueData"
          :attrList="attrList"
          :canAction="canAction"
          :parentId="parentId"
          :fromId="fromId"
          :toId="toId"
          :mode="mode"
          :app="app"
          :projectId="projectId"
          :checkedIdList="checkedIdList"
          @selected="getSelected"
          @searchIssue="searchIssue"
          @changePageSize="changePageSize"
          @toIssue="toIssueDetail"
          @openIssue="openIssueDetail"
          @deleteIssue="deleteIssue"
          @toggleChildIssue="toggleChildIssue"
        ></IssueListStorywall>
        <NoData v-else-if="isReady && isShowEmptyTable"></NoData>
      </div>
    </template>
    <EditIssue
      v-if="isEditIssueShow"
      :app="app"
      :catalog="catalog"
      :iteration="iteration"
      :fromId="fromId"
      :toId="toId"
      :parentId="parentId"
      :relType="relType"
      @close="closeEditIssue"
    ></EditIssue>
    <IssueListDialog
      v-if="isLinkShow && getAppByType(relAppType) && (fromId || toId)"
      :id="fromId || toId"
      :app="getAppByType(relAppType)"
      :direction="fromId ? 'from' : 'to'"
      :reltype="relType"
      :projectId="projectId"
      @close="closeLinkIssue"
    ></IssueListDialog>
    <TsDialog
      v-if="isIssueDetailShow && currentIssue"
      :hasHeader="true"
      type="slide"
      :isShow="true"
      width="huge"
      :maskClose="true"
      :hasFooter="false"
      :isScrollbar="true"
      :hasContentPadding="false"
      @on-close="closeIssueDetail"
    >
      <template v-slot>
        <div>
          <component
            :is="currentIssue.appType + 'Detail'"
            :pId="currentIssue.projectId"
            mode="dialog"
            :aId="currentIssue.appId"
            :iId="currentIssue.id"
          ></component>
        </div>
      </template>
    </TsDialog>
    <BatchExecDialog
      v-if="isBatchExecuteShow"
      :projectId="projectId"
      :appId="app.id"
      @close="closeBatchExecute"
    ></BatchExecDialog>
  </div>
</template>
<script>
import * as issueDetailHandler from '@/views/pages/rdm/project/viewtab/issus-detail-index.js';

export default {
  name: '',
  components: {
    ...issueDetailHandler,
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    IssueStatus: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-status.vue'], resolve),
    AppIcon: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-icon.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    AttrViewer: resolve => require(['@/views/pages/rdm/project/attr-viewer/attr-viewer.vue'], resolve),
    AttrHandler: resolve => require(['@/views/pages/rdm/project/attr-handler/attr-handler.vue'], resolve),
    EditIssue: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-issue-dialog.vue'], resolve),
    IssueListDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list-dialog.vue'], resolve),
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    BatchExecDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/batchexecute-issue-dialog.vue'], resolve),
    IssueListTable: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list-table.vue'], resolve),
    IssueListGantt: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list-gantt.vue'], resolve),
    IssueListStorywall: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list-storywall.vue'], resolve)
  },
  props: {
    mode: { type: String, default: 'list' }, //显示模式，有level和list两种
    viewmode: { type: String, default: 'table' }, //视图模式，有table,gantt,storywall
    canSearch: { type: Boolean, default: false },
    canAppend: { type: Boolean, default: false },
    canAction: { type: Boolean, default: false },
    //canSelect: { type: Boolean, default: false },
    canBatch: { type: Boolean, default: false }, //是否允许批量处理
    showStatus: { type: Boolean, default: false }, //是否显示状态统计信息
    checkedIdList: { type: Array },
    iteration: { type: Number }, //迭代id
    projectId: { type: Number }, //项目id
    parentId: { type: Number }, //父任务id，传入parentId代表这里显示的是子任务
    fromId: { type: Number }, //来源任务id
    toId: { type: Number }, //目标任务id
    app: { type: Object },
    isMine: { type: Number }, //我的任务
    isMyCreated: { type: Number }, //我创建的
    isEnd: { type: Number }, //是否结束
    isExpired: { type: Number }, //是否过期
    isFavorite: { type: Number }, //是否关注
    isProcessed: { type: Number }, //是否处理过
    displayAttrList: { type: Array }, //需要显示的内部属性列表，一般用在工作台
    isShowEmptyTable: { type: Boolean, default: false }, //没数据时是否显示空白table
    relType: {
      type: String,
      validator: function(value) {
        return ['extend', 'relative', 'repeat'].includes(value);
      }
    },
    relAppType: {
      type: String,
      validator: function(value) {
        return ['story', 'testcase', 'bug', 'task'].includes(value);
      }
    },
    catalog: { type: Number },
    fixedHeader: { // 固定表头，默认true
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isReady: true,
      issueDetailHandler: issueDetailHandler,
      currentIssue: null, //当前选中issue，用于打开issue详情窗口
      isLoading: true,
      isEditIssueShow: false,
      isLinkShow: false,
      issueData: {},
      statusList: [],
      theadList: [
        /* { key: 'name', title: this.$t('page.name') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'createDate', title: this.$t('page.createdate') }*/
      ],
      isIssueDetailShow: false, //是否展示任务详情弹窗
      isSearchReady: true, //用于刷新自定义属性控件
      searchIssueData: {},
      pageSize: null,
      currentPage: 1,
      isShowCombineSearcher: false,
      searchConfig: {
        search: false,
        labelPosition: 'left',
        searchMode: 'clickBtnSearch',
        searchList: [
          {
            type: 'text',
            name: 'keyword',
            label: this.$t('page.keyword')
          },
          {
            type: 'radio',
            name: 'isExpired',
            label: this.$t('page.isexpired'),
            dataList: [
              {
                value: 1,
                text: this.$t('term.process.timedout')
              },
              {
                value: 0,
                text: this.$t('page.nottimedout')
              }
            ]
          },
          {
            type: 'slot',
            name: 'createDate',
            label: this.$t('page.createdate')
          }
        ]
      },
      sortData: [],
      searchValue: {},
      appList: [],
      linkApp: null,
      linkRelType: null,
      completeRate: 0,
      isBatchExecuteShow: false //批量执行确认框
    };
  },
  beforeCreate() {},
  async created() {
    //首先获取用户配置
    await this.getAppSetting();
    this.initTheadList();
    this.initSearchConfig();
    this.initAppList();
    this.searchIssue();
    this.getAppStatus();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    closeIssueDetail() {
      this.isIssueDetailShow = false;
      this.currentIssue = null;
      this.searchIssue();
      this.$emit('refresh');
    },
    changeLabel(attr, text, textConfig) {
      if (attr.isPrivate) {
        if (text?.length > 0) {
          this.$set(textConfig, attr.name, text?.length > 0 ? text : '');
        } else {
          this.$delete(textConfig, attr.name);
        }
      } else if (text?.length > 0) {
        this.$set(textConfig, 'attr_' + attr.id, text, text?.length > 0 ? text : '');
      } else {
        this.$delete(textConfig, 'attr_' + attr.id);
      }
    },
    restoreHistory(historyData) {
      if (historyData) {
        if (historyData['searchValue']) {
          Object.assign(this.searchValue, historyData['searchValue']);
        }
        if (historyData['pageSize']) {
          this.pageSize = historyData['pageSize'];
        }
        if (historyData['currentPage']) {
          this.currentPage = historyData['currentPage'];
        }
      }
    },
    updateSort(sort) {
      this.sortData = [];
      this.sortData.push(sort);
      this.$addHistoryData('sortData', this.sortData);
      this.searchIssue(1);
    },
    closeBatchExecute() {
      this.isBatchExecuteShow = false;
    },
    getAppStatus() {
      if (this.showStatus && this.app) {
        this.$api.rdm.status
          .getStatusByAppId(this.app.id, {
            needIssueCount: 1,
            fromId: this.fromId,
            toId: this.toId
          })
          .then(res => {
            this.statusList = res.Return;
          });
        this.$api.rdm.app.getCompleteRate(this.app.id, this.fromId, this.toId).then(res => {
          this.completeRate = res.Return;
        });
      }
    },
    //供外部调用，刷新查询数据
    refresh(currentPage) {
      this.searchIssue(currentPage);
    },
    initTheadList() {
      if (this.displayAttrList && this.displayAttrList.length > 0) {
        this.displayAttrList.forEach(attr => {
          this.theadList.push({ key: attr.id ? attr.id.toString() : attr.type, title: attr.label });
          /*this.searchConfig.searchList.push({
            type: 'slot',
            name: attr.isPrivate ? attr.name : 'attr_' + attr.id,
            label: attr.label
          });*/
        });
      }
    },
    initAppList() {
      if (this.projectId && this.relAppType) {
        this.$api.rdm.project
          .getAppByProjectId(this.projectId, {
            isActive: 1,
            needSystemAttr: 1,
            appType: this.relAppType
          })
          .then(res => {
            this.appList = res.Return;
          });
      }
    },
    initSearchConfig() {
      if (this.app) {
        this.searchConfig.searchList.push({
          type: 'select',
          name: 'status',
          label: this.$t('page.status'),
          multiple: true,
          valueName: 'id',
          textName: 'label',
          value: this.searchValue['status'],
          url: '/api/rest/rdm/status/list',
          params: { appId: this.app.id },
          transfer: true
        });
        if (this.app.attrList && this.app.attrList.length > 0) {
          this.app.attrList.forEach(attr => {
            if (['all', 'list'].includes(attr.showType)) {
              this.theadList.push({ key: attr.id ? attr.id.toString() : attr.type, title: attr.label });
              if (attr.id) {
                this.searchConfig.searchList.push({
                  type: 'slot',
                  name: attr.isPrivate ? attr.name : 'attr_' + attr.id,
                  label: attr.label
                });
              }
            }
          });
        }
      }
      this.isShowCombineSearcher = true;
    },
    async getAppSetting() {
      if (this.app) {
        await this.$api.rdm.app.getAppUserSetting(this.app.id).then(res => {
          this.appSetting = res.Return;
          if (this.appSetting && this.appSetting?.config?.attrList && this.appSetting.config.attrList.length > 0 && this.app.attrList && this.app.attrList.length > 0) {
            this.appSetting.config.attrList.forEach(attrconf => {
              const attr = this.app.attrList.find(d => (d.id ? d.id === attrconf.attrId : d.type === attrconf.attrType));
              if (attr) {
                this.$set(attr, 'sort', attrconf.sort);
                this.$set(attr, 'showType', attrconf.showType || 'all');
              }
            });
          }
          this.app.attrList.forEach(attr => {
            if (!attr.showType) {
              this.$set(attr, 'showType', 'all');
            }
          });
          this.app.attrList.sort((a, b) => {
            return (a.sort || 0) - (b.sort || 0);
          });
        });
      }
    },
    toggleChildIssue(row) {
      if (!row._loading) {
        const index = this.issueData.tbodyList.findIndex(d => d.id === row.id);
        if (index > -1) {
          if (row['_expand']) {
            this.$set(row, '_expand', false);
            this.issueData.tbodyList = this.issueData.tbodyList.filter(d => !d['parents'] || !d['parents'].includes(row.id));
            this.isReady = false;
            this.$nextTick(() => {
              this.isReady = true;
            });
          } else {
            this.searchChildIssue(row, index);
          }
        }
      }
    },
    toogleChildrenIssue(row) {
      if (!row['_expand']) {
        this.$set(row, '_expand', true);
      } else {
        this.$set(row, '_expand', false);
      }
    },
    getSelected(itemList) {
      this.$emit('selected', itemList);
    },
    batchExecute() {
      this.isBatchExecuteShow = true;
    },
    linkIssue() {
      this.isLinkShow = true;
      this.linkApp = this.getAppByType(this.relAppType);
    },
    deleteIssue(issue) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: issue.appName }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.rdm.issue.deleteIssue(issue.id).then(res => {
            if (res.Status === 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchIssue();
              this.$emit('refresh');
            }
          });
        }
      });
    },
    addIssue() {
      this.isEditIssueShow = true;
    },
    closeEditIssue(needRefresh) {
      this.isEditIssueShow = false;
      if (needRefresh) {
        this.searchIssue();
        this.$emit('refresh');
      }
    },
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.searchIssue(1);
    },
    openIssueDetail(issue) {
      if (this.issueDetailHandler[issue.appType + 'Detail']) {
        this.isIssueDetailShow = true;
        this.currentIssue = issue;
      } else {
        this.toIssueDetail(issue);
      }
    },
    toIssueDetail(issue) {
      this.$router.push({ path: '/' + issue.appType + '-detail/' + issue.projectId + '/' + issue.appId + '/' + issue.id });
    },
    closeLinkIssue(needRefresh) {
      this.isLinkShow = false;
      if (needRefresh) {
        this.searchIssue(1);
        this.$emit('refresh');
      }
    },
    unlinkIssue(issue) {
      this.$createDialog({
        title: this.$t('dialog.title.unlinkconfirm'),
        content: this.$t('dialog.content.unlinkconfirm'),
        btnType: 'error',
        'on-ok': vnode => {
          const param = {};
          if (this.fromId) {
            param.fromId = this.fromId;
            param.toId = issue.id;
          } else if (this.toId) {
            param.toId = this.toId;
            param.fromId = issue.id;
          } else if (this.parentId) {
            param.id = issue.id;
          } else if (issue.parentId) {
            param.id = issue.parentId;
          }
          if (param.fromId && param.toId) {
            this.$api.rdm.issue.deleteIssueRel(param).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.searchIssue(1);
                this.$emit('refresh');
                vnode.isShow = false;
              }
            });
          } else if (param.id) {
            this.$api.rdm.issue.clearParentIssue(issue.id).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.searchIssue(1);
                this.$emit('refresh');
                vnode.isShow = false;
              }
            });
          }
        }
      });
    },
    searchChildIssue(row, index) {
      const searchParam = {};
      searchParam.parentId = row.id;
      searchParam.appId = row.appId;
      searchParam.iteration = this.iteration;
      searchParam.projectId = row.projectId;
      this.$set(row, '_loading', true);
      this.$api.rdm.issue
        .searchIssue(searchParam)
        .then(res => {
          const dataList = res.Return.tbodyList;
          dataList.forEach(d => {
            d['_index'] = (row['_index'] || 0) + 1;
            d['parents'] = [d.parentId];
            if (row['parents']) {
              d['parents'].push(...row['parents']);
            }
          });
          if (index < this.issueData.tbodyList.length - 1) {
            this.issueData.tbodyList.splice(index + 1, 0, ...dataList);
          } else {
            this.issueData.tbodyList.push(...dataList);
          }
          this.$set(row, '_expand', true);
        })
        .finally(() => {
          this.$set(row, '_loading', false);
          this.isReady = false;
          this.$nextTick(() => {
            this.isReady = true;
          });
        });
    },
    searchIssue(currentPage) {
      if (currentPage) {
        this.currentPage = currentPage;
        this.$addHistoryData('currentPage', currentPage);
      }
      this.searchIssueData = {};
      this.searchIssueData.projectId = this.projectId;
      this.searchIssueData.pageSize = this.pageSize;
      this.searchIssueData.currentPage = this.currentPage;
      this.searchIssueData.mode = this.mode;
      this.searchIssueData.parentId = this.parentId;
      this.searchIssueData.fromId = this.fromId;
      this.searchIssueData.toId = this.toId;
      this.searchIssueData.appId = this.app && this.app.id;
      this.searchIssueData.catalog = this.catalog;
      this.searchIssueData.iteration = this.iteration;
      this.searchIssueData.isMine = this.isMine;
      this.searchIssueData.isMyCreated = this.isMyCreated;
      this.searchIssueData.isEnd = this.isEnd;
      this.searchIssueData.isExpired = this.isExpired;
      this.searchIssueData.isFavorite = this.isFavorite;
      this.searchIssueData.isProcessed = this.isProcessed;
      
      if (!this.$utils.isEmpty(this.searchValue)) {
        for (let key in this.searchValue) {
          if (key.startsWith('attr_')) {
            if (!this.searchIssueData.attrFilterList) {
              this.searchIssueData.attrFilterList = [];
            }
            this.searchIssueData.attrFilterList.push({
              attrId: parseInt(key.replace('attr_', '')),
              valueList: this.searchValue[key]
            });
          } else {
            this.searchIssueData[key] = this.searchValue[key];
          }
        }
      }
      //保存查询历史
      this.$addHistoryData('searchValue', this.searchValue);
      this.searchIssueData.sortList = [];
      if (this.sortData && this.sortData.length > 0) {
        this.sortData.forEach(s => {
          for (let key in s) {
            const attr = this.getAppByName(key);
            if (attr) {
              this.searchIssueData.sortList.push({ attr: key, type: attr.type, sort: s[key] });
            }
          }
        });
      }
      this.isSearchReady = false;
      this.isLoading = true;
      this.$api.rdm.issue
        .searchIssue(this.searchIssueData)
        .then(res => {
          this.issueData = res.Return;
          this.isSearchReady = true;
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  },
  filter: {},
  computed: {
    sortList() {
      const sortList = [];
      if (this.attrList && this.attrList.length > 0) {
        this.attrList.forEach(attr => {
          if (attr.id) {
            if (attr.allowSort) {
              sortList.push(attr.id.toString());
            }
          } else {
            sortList.push(attr.type);
          }
        });
      }
      return sortList;
    },
    finalTheadList() {
      const list = [];
      if (this.canBatch) {
        list.push({ key: 'checked' });
      }
      list.push(...this.theadList);
      if (this.canAction) {
        list.push({ key: 'action' });
      }
      return list;
    },
    searchAttrList() {
      return this.attrList.filter(d => d.id);
    },
    attrList() {
      if (this.app && this.app.attrList) {
        return this.app.attrList;
      } else if (this.displayAttrList) {
        return this.displayAttrList;
      }
      return [];
    },
    getAppByName() {
      return name => {
        if (this.attrList && this.attrList.length > 0) {
          if (name.startsWith('_')) {
            return this.attrList.find(d => d.type === name);
          } else {
            return this.attrList.find(d => d.id.toString() === name);
          }
        }
        return null;
      };
    },
    getAppByType() {
      return type => {
        if (this.appList && this.appList.length > 0) {
          return this.appList.find(d => d.type === type);
        }
        return null;
      };
    },
    selectedIssueList() {
      return this.issueData.tbodyList.filter(d => !!d._selected);
    }
  },
  watch: {
    viewmode: {
      handler: function(val, oldval) {
        if (val == 'storywall') {
          this.pageSize = 500;
          this.searchIssue(1);
        } else {
          if (oldval === 'storywall') {
            this.pageSize = 20;
            this.searchIssue(1);
          }
        }
      }
    },
    pageSize: {
      handler: function(val) {
        this.$addHistoryData('pageSize', val);
      }
    },
    catalog: {
      handler: function(val) {
        this.searchIssue(1);
      }
    },
    iteration: {
      handler: function(val) {
        this.searchIssue(1);
      }
    },
    mode: {
      handler: function(val) {
        this.searchIssue(1);
      }
    }
  }
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50% 50%;
}
</style>
