<template>
  <div class="knowledge-overview">
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsContain border="border" :enableCollapse="true">
      <template v-if="knowledgeType === 'all' && !isHideTree" v-slot:navigation>
        <span class="tsfont-plus text-action" @click="addDocument">{{ $t('term.knowledge.document') }}</span>
      </template>
      <template v-slot:topLeft>
        <span v-if="statusList && statusList.length > 0" class="status-list action-group">
          <span
            v-for="(status, sindex) in statusList"
            :key="sindex"
            class="action-item"
            :class="status.value == statusAction ? 'active' : ''"
            @click="selectStatus(status)"
          >
            <Badge :count="status.count" :offset="[15, -5]">
              <span>{{ status.text }}</span>
            </Badge>
          </span>
        </span>
      </template>
      <template v-slot:topRight>
        <div>
          <CombineSearcher v-model="searchVal" :searchList="searchList" @change="getTable"></CombineSearcher>
        </div>
      </template>
      <template v-if="knowledgeType === 'all' && !isHideTree" v-slot:sider>
        <div class="padding">
          <div v-for="circle in circleList" :key="circle.id">
            <div class="circle-name text-title">{{ circle.circleName }}</div>
            <div class="dividing-bg-color dividing-vertical"></div>
            <Tree
              class="menu-tree"
              :data="circle.children"
              :load-data="getSubTree"
              empty-text=""
              @on-select-change="changeDocumentType"
            />
          </div>
        </div>
      </template>
      <div slot="content" class="layout">
        <SearchResult
          class="search-result-box"
          :circleListNum="circleList.length"
          :result="result"
          :currentPath="currentPath"
          :knowledgeType="knowledgeType"
          @searchResult="getTable"
          @addNewRule="addNewRule"
        ></SearchResult>
      </div>
    </TsContain>
    <!-- 添加对话框 -->
    <TsDialog
      :isShow.sync="isDialogShow"
      :title="$t('dialog.title.addtarget', { target: $t('term.knowledge.document') })"
      @on-ok="okDocument"
      @on-close="closeForm"
    >
      <Tsform ref="form" :itemList="formItemConfig"></Tsform>
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeOverview',
  components: {
    Tsform: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    SearchResult: () => import('./search/search-result.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue')
  },
  props: {
    knowledgeType: { type: String }
  },
  data() {
    return {
      isLoading: true,
      isHideTree: false, //是否隐藏左边的树
      isDialogShow: false,
      searchParams: {
        currentPage: 1,
        pageSize: 10,
        knowledgeType: 'all',
        knowledgeDocumentTypeUuid: null,
        statusList: []
      },
      circleList: [],
      currentPath: '',
      formItemConfig: {
        title: {
          type: 'text',
          label: this.$t('page.name'),
          value: null,
          width: '100%',
          maxlength: 50,
          validateList: ['required', 'name-special', { name: 'searchUrl', url: 'api/rest/knowledge/document/title/update', message: '知识标题已存在' }]
        },
        knowledgeDocumentTypeUuid: {
          type: 'tree',
          label: this.$t('page.type'),
          width: '100%',
          url: 'api/rest/knowledge/document/type/tree/forselect',
          params: { isActive: 1 },
          search: true,
          valueName: 'uuid',
          textName: 'name',
          transfer: true,
          showPath: true,
          validateList: ['required']
        }
      },
      result: {
        dataList: [],
        rowNum: 0,
        pageSize: 10,
        currentPage: 1,
        pageCount: 1
      },
      statusList: [],
      defaultCondition: [],
      knowledgeDocumentTypeUuid: null,
      documentType: 'document',
      statusAction: 'all',
      searchVal: {},
      searchList: []
    };
  },
  created() {
    this.getCondition();
  },
  async activated() {
    document.title = this.$t(this.knowledgeTypeName);
    this.searchParams.keyword = '';
    this.getDefaultCondition();
    if (this.knowledgeType === 'all' && this.$store.state.leftMenu.isKnowledgeCircleUpdated) {
      await this.getTree();
      // const firstTreeNode = this.circleList[0].children[0];
      // this.changeDocumentType(null, firstTreeNode);
      this.$store.commit('leftMenu/isKnowledgeCircleUpdated', false);
      this.knowledgeDocumentTypeUuid = null;
      this.searchParams.knowledgeDocumentTypeUuid = this.knowledgeDocumentTypeUuid;
      this.currentPath = this.$t('page.all');
    } else if (this.knowledgeType != 'all') {
      this.$store.commit('leftMenu/isKnowledgeCircleUpdated', true);
    }
    if (this.knowledgeType == 'waitingforreview') {
      this.statusAction = 'submitted';
    } else {
      this.statusAction = 'all';
    }
    this.getTable();
  },
  methods: {
    restoreHistory(historyData) {
      let config = historyData['konledgeCondition'];
      if (!this.$utils.isEmpty(config)) {
        if (!this.$utils.isEmpty(config.circleList)) {
          this.circleList = config.circleList;
        }
        if (config.knowledgeType == this.knowledgeType) {
          if (config.statusAction) {
            this.statusAction = config.statusAction;
            this.searchParams.statusList = [this.statusAction];
          }
          this.searchVal = config.searchVal || {};
          !this.$utils.isEmpty(config.searchParams) && (this.searchParams = config.searchParams);
        }
      }
    },
    verticals() {
      this.isSiderHide = !this.isSiderHide;
    },
    async getTree() {
      // this.isLoading = true;
      const promise = this.$api.knowledge.overview.getTree();
      const res = await promise;
      if (!res.Return || res.Return.length === 0) {
        this.circleList = [];
        this.isHideTree = true;
        this.isLoading = false;
        return;
      }
      this.isHideTree = false;
      this.circleList = res.Return.map(circle => {
        const { name: circleName, id, children } = circle;
        const typeList = children.map(type => {
          const { name: title, uuid, parentUuid, children, childCount, documentCount } = type;
          const tree = { title, uuid, parentUuid, children, childCount, documentCount, expand: false, path: [circleName, title] };
          if (childCount > 0) {
            tree.loading = false;
          }
          return tree;
        });
        return { circleName, id, children: typeList };
      });
      return promise;
    },
    async getSubTree(parentTree, resolve) {
      const params = { parentUuid: parentTree.uuid };
      const res = await this.$api.knowledge.overview.getSubtree(params);
      const treeList = res.Return.typeList.map(type => {
        const { name: title, uuid, parentUuid, children, childCount, documentCount } = type;
        const tree = { title, uuid, parentUuid, children, childCount, documentCount, expand: false, path: [...parentTree.path, title] };
        if (childCount > 0) {
          tree.loading = false;
        }
        return tree;
      });
      resolve(treeList);
    },
    async getTable(params = {}) {
      let data = {
        knowledgeType: this.knowledgeType,
        ...this.defaultCondition,
        ...this.searchParams,
        ...params
      };
      if (!this.$utils.isEmpty(this.searchVal)) {
        Object.assign(data, this.searchVal);
      }
      // if (this.knowledgeType === 'all' && !this.searchParams.knowledgeDocumentTypeUuid) {
      //   return new Error('知识分类为all时，必须要选择文档分类才能搜索');
      // }

      this.$addHistoryData('konledgeCondition', this.getKonledgeCondition());
      try {
        let res = {};
        if (this.documentType == 'document') {
          res = await this.$api.knowledge.overview.search(data);
        } else {
          res = await this.$api.knowledge.overview.searchVersion(data);
        }
        this.result = res.Return;
        if (this.result.statusList && this.result.statusList.length > 0) {
          this.statusList = this.result.statusList;
        }
      } finally {
        this.isLoading = false;
      }
    },
    async toggleCollect(row) {
      row.isCollect = row.isCollect === 1 ? 0 : 1;
      const params = {
        documentId: row.knowledgeDocumentId,
        isCollect: row.isCollect
      };
      try {
        await this.$api.knowledge.overview.toggleCollect(params);
        this.$Message.success(this.$t('message.executesuccess'));
      } catch {
        row.isCollect = row.isCollect === 1 ? 0 : 1;
      }
    },
    deleteRow(row) {
      if (this.knowledgeType === 'draft' || this.knowledgeType === 'share') {
        this.deleteDraft(row);
      } else {
        this.deleteDocument(row);
      }
    },
    deleteDraft({ title, id: knowledgeDocumentVersionId }) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: title }),
        btnType: 'error',
        'on-ok': async vnode => {
          const params = { knowledgeDocumentVersionId };
          try {
            await this.$api.knowledge.overview.deleteDraft(params);
            this.$Message.success(this.$t('message.deletesuccess'));
            this.getTable();
          } finally {
            vnode.isShow = false;
          }
        }
      });
    },
    deleteDocument({ title, knowledgeDocumentId }) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: title }),
        btnType: 'error',
        'on-ok': async vnode => {
          const params = { knowledgeDocumentId };
          try {
            await this.$api.knowledge.overview.deleteDocument(params);
            this.$Message.success(this.$t('message.deletesuccess'));
            this.getTable();
          } finally {
            vnode.isShow = false;
          }
        }
      });
    },
    addDocument() {
      this.isDialogShow = true;
      if (this.knowledgeDocumentTypeUuid) {
        this.$set(this.formItemConfig.knowledgeDocumentTypeUuid, 'value', this.knowledgeDocumentTypeUuid);
      } else {
        this.$set(this.formItemConfig.knowledgeDocumentTypeUuid, 'value', '');
      }
    },
    closeForm() {
      this.$set(this.formItemConfig.title, 'value', '');
      this.$set(this.formItemConfig.knowledgeDocumentTypeUuid, 'value', '');
    },
    okDocument() {
      if (!this.$refs.form.valid() || !this.isDialogShow) return;
      this.isDialogShow = false;
      const formData = this.$refs.form.getFormValue();
      this.toEditPage(formData);
      this.$refs.form.clearForm();
    },
    toEditPage({ knowledgeDocumentId, knowledgeDocumentTypeUuid, id: knowledgeDocumentVersionId, title }) {
      this.$router.push({
        name: 'knowledge-edit',
        query: { knowledgeDocumentId, knowledgeDocumentTypeUuid, knowledgeDocumentVersionId, title }
      });
    },
    toDetailPage({ knowledgeDocumentId, knowledgeDocumentTypeUuid, id: knowledgeDocumentVersionId, fromVersion, status }) {
      this.$router.push({
        name: this.knowledgeType === 'waitingforreview' ? 'review-detail' : 'knowledge-detail',
        query: { knowledgeDocumentId, knowledgeDocumentTypeUuid, knowledgeDocumentVersionId, fromVersion, status }
      });
    },
    changeDocumentType(nodeList, node) {
      if (this.knowledgeDocumentTypeUuid && this.knowledgeDocumentTypeUuid == node.uuid) {
        this.knowledgeDocumentTypeUuid = null;
        this.currentPath = this.$t('page.all');
        this.traverseTree(this.circleList, item => {
          if (item.uuid === node.uuid) {
            this.$set(item, 'selected', false);
          }
        });
      } else {
        this.knowledgeDocumentTypeUuid = node.uuid;
        this.currentPath = node.path.join(' > ');
        this.traverseTree(this.circleList, item => {
          if (item.uuid === node.uuid) {
            this.$set(item, 'selected', true);
          } else if (item.selected) {
            item.selected = false;
          }
        });
      }
      this.searchParams.knowledgeDocumentTypeUuid = this.knowledgeDocumentTypeUuid;
      this.getTable();
    },
    traverseTree(children, callback) {
      children.forEach(node => {
        callback(node);
        this.traverseTree(node.children, callback);
      });
    },
    // renderContent(h, { root, node, data }) {
    //   return h('div', { class: ['node-title flex-start', { 'node-selected': data.selected }] }, [h('div', { class: ['text-default', { 'text-primary': data.selected }] }, data.title), h('div', { class: ['number-circle text-default border-color', { 'hide-number': data.documentCount === 0 }] }, data.documentCount)]);
    // },
    getCondition() {
      //获取搜索条件
      let data = {
        knowledgeType: this.knowledgeType
      };
      this.$api.knowledge.overview.searchCondition(data).then(res => {
        if (res.Status == 'OK') {
          if (res.Return && res.Return.length > 0) {
            let list = res.Return;
            let searchList = [];
            list.forEach(item => {
              let obj = {
                name: item.handler,
                label: item.handlerName,
                transfer: true
              };
              if (item.handler != 'statusList') {
                Object.assign(obj, item.config);
                this.$set(obj, 'type', item.handlerType);
                searchList.push(obj);
              }
            });
            this.searchList = searchList;
          }
        }
      });
    },
    getDefaultCondition() {
      let find = this.knowledgeTypeMenu.find(d => d.value == this.knowledgeType);
      if (find && find.defaultCondition) {
        this.documentType = find.defaultCondition.type;
        this.defaultCondition = find.defaultCondition;
        this.searchParams.statusList = this.defaultCondition.statusList || [];
      }
    },
    searchStatus(type) {
      this.searchParams.statusList = [type];
      this.getTable();
    },
    addNewRule() {
      // 刷新左侧菜单
      this.$store.dispatch('leftMenu/getKnowledgeTypeMenu');
    },
    selectStatus(item) {
      this.statusAction = item.value;
      this.searchStatus(this.statusAction);
    },
    getKonledgeCondition() {
      let data = {
        knowledgeType: this.knowledgeType,
        statusAction: this.statusAction,
        searchVal: this.searchVal,
        searchParams: this.searchParams,
        circleList: this.circleList
      };
      return data;
    }
  },
  computed: {
    knowledgeTypeName() {
      return this.$store.getters['leftMenu/getKnowLedgeTypeName'](this.knowledgeType);
    },
    isSiderHide: {
      get() {
        return this.$store.state.isSiderTreeHide;
      },
      set(val) {
        this.$store.commit('setSiderTreeHide', val);
      }
    },
    knowledgeTypeMenu() {
      return this.$store.state.leftMenu.knowledgeTypeMenu;
    }
  }
};
</script>

<style lang="less" scoped>
/deep/.tscontain-header {
  height: 55px !important;
}
.knowledge-overview {
  .top-default {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .sider-toggle {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;
      .tsfont-tree {
        font-size: 14px;
      }
    }
    .dividing {
      display: block;
      width: 0;
      border-right: 1px solid;
      height: 20px;
      margin: 0 14px 0 10px;
    }
    .create-api {
      display: inline-block;
      width: 90px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      font-size: 13px;
      margin-left: 16px;
      cursor: pointer;
    }
  }
  .layout {
    .search-result-box {
      margin: 0;
    }
    .left-pane {
      .circle-name {
        font-size: 13px;
        margin-left: 16px;
        margin-top: 10px;
      }
      .dividing-vertical {
        height: 1px;
        width: 90%;
        margin: 9px 0 9px 16px;
      }
      /deep/ .menu-tree {
        .node-title {
          .number-circle {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 16px;
            height: 16px;
            border: 1px solid;
            border-radius: 8px;
            font-size: 12px;
            margin-left: 5px;
          }
          .hide-number {
            display: none;
          }
        }
      }
    }
    .right-pane {
      position: relative;
      .current-path {
        margin: 10px 5px 5px 10px;
      }
      /deep/ .table {
        .th-isCollect {
          width: 30px;
        }
        .tstable-tr {
          cursor: pointer;
          .not-collect {
            visibility: hidden;
          }
          &:hover {
            .not-collect {
              visibility: visible;
            }
          }
        }
      }
    }
  }
  .top {
    position: relative;
  }
  .search {
    position: absolute;
    top: 0;
    right: 0;
    width: 600px;
    padding-top: 3px;
  }
  .status-list {
    margin-top: 12px;
    .action-item {
      padding: 0 12px;
      &:first-child {
        padding-left: 0;
      }
    }
  }
  /deep/ .ivu-badge-count {
    line-height: 1;
    height: inherit;
    padding: 0 4px;
  }
}
</style>
