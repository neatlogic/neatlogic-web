<template>
  <div>
    <Loading v-if="isLoading" :loadingShow="isLoading"></Loading>
    <div class="mb-md grid">
      <div>
        <span>
          <a
            v-if="canAppend"
            href="javascript:void(0)"
            class="tsfont-plus"
            @click="addIssue()"
          >{{ $t('dialog.title.addtarget', { target: app.name }) }}</a>
        </span>
        <span v-if="relType && relAppType && (fromId || toId)" class="ml-xs">
          <a
            v-if="getAppByType(relAppType)"
            href="javascript:void(0)"
            class="tsfont-bind"
            @click="linkIssue()"
          >{{ $t('dialog.title.linktarget', { target: getAppByType(relAppType).name }) }}</a>
        </span>
      </div>
      <div>
        <!--由于每次搜索都会更新isSearchReady，导致AttrHandler处于不可用状态，为了让某些AttrHandler可以连续输入，例如文本框，搜索绑定在点击确认和删除条件的时候触发-->
        <CombineSearcher
          v-if="canSearch"
          v-model="searchValue"
          v-bind="searchConfig"
          @remove-label="searchIssue(1)"
          @confirm="searchIssue(1)"
        >
          <template v-slot:createDate="{ valueConfig, textConfig }">
            <TsFormDatePicker
              border="border"
              :transfer="true"
              type="daterange"
              format="yyyy-MM-dd"
              @change="(val) => {
                if (val != null) {
                  $set(valueConfig, 'createDate', val);
                  $set(textConfig, 'createDate' , val);
                } else {
                  $delete(valueConfig, 'createDate' );
                  $delete(textConfig, 'createDate' );
                }
              }"
            ></TsFormDatePicker>
          </template>
          <template v-for="(attr, index) in searchAttrList" :slot="attr.isPrivate ? attr.name : 'attr_' + attr.id" slot-scope="{ valueConfig, textConfig }">
            <div :key="index">
              <AttrHandler
                v-if="isSearchReady"
                :projectId="projectId"
                :attrConfig="attr"
                :value="attr.isPrivate ? searchValue[attr.name] : searchValue['attr_' + attr.id]"
                mode="search"
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
      </div>
    </div>
    <TsTable
      v-if="issueData && issueData.tbodyList && issueData.tbodyList.length > 0"
      :theadList="finalTheadList"
      v-bind="issueData"
      multiple
      @changeCurrent="searchIssue"
      @changePageSize="changePageSize"
      @getSelected="getSelected"
    >
      <template v-for="(attr, index) in attrList" :slot="attr.id ? attr.id.toString() : attr.type" slot-scope="{ row }">
        <div :key="index">
          <AttrViewer v-if="attr.id != 0 && isSearchReady" :attrConfig="attr" :issueData="row"></AttrViewer>
          <div v-else-if="attr.type === '_name'" :style="{ 'margin-left': (row['_index'] || 0) * 20 + 'px' }">
            <span><AppIcon :appType="row.appType" :appColor="row.appColor"></AppIcon></span>
            <span
              v-if="mode === 'level' && row.childrenCount"
              class="cursor text-href"
              :class="{ 'tsfont-down': row['_expand'], 'tsfont-right': !row['_expand'] }"
              @click="toggleChildIssue(row)"
            ></span>
            <span class="overflow">
              <a href="javascript:void(0)" @click="toIssueDetail(row)">{{ row.name }}</a>
            </span>
          </div>
          <IssueStatus v-else-if="attr.type === '_status'" :issueData="row"></IssueStatus>
          <span v-else-if="attr.type === '_createdate'">{{ row.createDate | formatDate('yyyy-mm-dd') }}</span>
        </div>
      </template>
      <template v-if="canAction" slot="action" slot-scope="{ row }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li v-if="fromId || toId || parentId || row.parentId" class="tsfont-unbind" @click="unlinkIssue(row)">{{ $t('term.rdm.disconnect') }}</li>
            <li class="tsfont-inspection" @click="toIssueDetail(row)">{{ $t('page.detail') }}</li>
            <li class="tsfont-trash-o" @click="deleteIssue(row)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <NoData v-else-if="isShowEmptyTable"></NoData>
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
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    IssueStatus: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-status.vue'], resolve),
    AppIcon: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-icon.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    AttrViewer: resolve => require(['@/views/pages/rdm/project/attr-viewer/attr-viewer.vue'], resolve),
    AttrHandler: resolve => require(['@/views/pages/rdm/project/attr-handler/attr-handler.vue'], resolve),
    EditIssue: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-issue-dialog.vue'], resolve),
    IssueListDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list-dialog.vue'], resolve),
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve)
  },
  props: {
    mode: { type: String, default: 'list' }, //显示模式，有level和list两种
    canSearch: { type: Boolean, default: false },
    canAppend: { type: Boolean, default: false },
    canAction: { type: Boolean, default: false },
    canSelect: { type: Boolean, default: false },
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
    catalog: { type: Number }
  },
  data() {
    return {
      isLoading: true,
      isEditIssueShow: false,
      isLinkShow: false,
      issueData: {},
      theadList: [
        /* { key: 'name', title: this.$t('page.name') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'createDate', title: this.$t('page.createdate') }*/
      ],
      isSearchReady: true, //用于刷新自定义属性控件
      searchIssueData: {},
      pageSize: null,
      searchConfig: {
        search: false,
        labelPosition: 'left',
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
      searchValue: {},
      appList: [],
      linkApp: null,
      linkRelType: null
    };
  },
  beforeCreate() {},
  async created() {
    //首先获取用户配置
    await this.getAppSetting();
    this.initTheadList();
    this.initSearchConfig();
    this.initAppList();
    this.searchIssue(1);
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
    //供外部调用，刷新查询数据
    refresh(currentPage) {
      this.searchIssue(currentPage);
    },
    initTheadList() {
      if (this.displayAttrList && this.displayAttrList.length > 0) {
        this.displayAttrList.forEach(attr => {
          this.theadList.push({ key: attr.id.toString(), title: attr.label });
          this.searchConfig.searchList.push({
            type: 'slot',
            name: attr.isPrivate ? attr.name : 'attr_' + attr.id,
            label: attr.label
          });
        });
      }
    },
    initAppList() {
      if (this.projectId && this.relAppType) {
        this.$api.rdm.project.getAppByProjectId(this.projectId, { appType: this.relAppType }).then(res => {
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
    },
    async getAppSetting() {
      if (this.app) {
        await this.$api.rdm.app.getAppUserSetting(this.app.id).then(res => {
          this.appSetting = res.Return;
          if (this.appSetting && this.appSetting?.config?.attrList && this.appSetting.config.attrList.length > 0 && this.app.attrList && this.app.attrList.length > 0) {
            this.appSetting.config.attrList.forEach(attrconf => {
              const attr = this.app.attrList.find(d => d.id ? d.id === attrconf.attrId : d.type === attrconf.attrType);
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
    getSelected(idList, itemList) {
      this.$emit('selected', itemList);
    },
    linkIssue() {
      this.isLinkShow = true;
      this.linkApp = this.getAppByType(this.relAppType);
    },
    deleteIssue(issue) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.app.name }),
        btnType: 'error',
        'on-ok': vnode => {}
      });
    },
    addIssue() {
      this.isEditIssueShow = true;
      this.currentIssueId = null;
    },
    closeEditIssue(needRefresh) {
      this.isEditIssueShow = false;
      if (needRefresh) {
        this.searchIssue(1);
        this.$emit('refresh');
      }
    },
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.searchIssue(1);
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
        });
    },
    searchIssue(currentPage) {
      this.isLoading = true;
      this.searchIssueData = {};
      this.searchIssueData.projectId = this.projectId;
      this.searchIssueData.pageSize = this.pageSize;
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
      if (currentPage) {
        this.searchIssueData.currentPage = currentPage;
      } else {
        this.searchIssueData.currentPage = 1;
      }
      this.isSearchReady = false;
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
    finalTheadList() {
      const list = [];
      if (this.canSelect) {
        list.push({ key: 'selection' });
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
    getAppByType() {
      return type => {
        if (this.appList && this.appList.length > 0) {
          return this.appList.find(d => d.type === type);
        }
        return null;
      };
    }
  },
  watch: {
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
  grid-template-columns: 40% auto;
}
</style>
