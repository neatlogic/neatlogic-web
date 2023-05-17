<template>
  <div>
    <TsContain :enableCollapse="false">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <AppTab v-if="appId && projectId" :appId="appId" :projectId="projectId"></AppTab>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item tsfont-os" @click="editDisplayAttr()">
            {{ $t('term.rdm.attrsetting') }}
          </span>
          <span class="action-item" @click="displayMode = displayMode === 'level' ? 'list' : 'level'">
            <span class="tsfont-flow-children" :class="{ 'text-primary': displayMode === 'list', 'text-grey': displayMode === 'level' }">列表视图</span>
            <Divider type="vertical" />
            <span class="tsfont-formdynamiclist" :class="{ 'text-primary': displayMode === 'level', 'text-grey': displayMode === 'list' }">层级视图</span>
          </span>
          <span class="action-item tsfont-plus" @click="addIssue()">{{ $t('term.rdm.request') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <CatalogList :appId="appId" @changeCatalog="changeCatalog"></CatalogList>
      </template>
      <template v-slot:content>
        <IssueList
          v-if="isReady && appData"
          ref="issueList"
          :mode="displayMode"
          :app="appData"
          :catalog="currentCatalog"
          :isShowEmptyTable="true"
          @toDetail="toRequestDetail"
        ></IssueList>
      </template>
    </TsContain>
    <EditIssue
      v-if="isEditIssueShow"
      :id="currentIssueId"
      :app="appData"
      :catalogId="currentCatalog"
      @close="closeEditIssue"
    ></EditIssue>
    <AttrSettingDialog v-if="isAttrSettingShow" :appId="appId" @close="closeAttrSetting"></AttrSettingDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppTab: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-tab.vue'], resolve),
    EditIssue: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-issue-dialog.vue'], resolve),
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve),
    CatalogList: resolve => require(['@/views/pages/rdm/project/viewtab/components/catalog-list.vue'], resolve),
    AttrSettingDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/attr-setting-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      pageName: this.$t('term.rdm.requestmanage'),
      appId: null,
      projectId: null,
      appData: null,
      currentCatalog: null,
      currentIssueId: null,
      isEditIssueShow: false,
      displayMode: 'level',
      isAttrSettingShow: false,
      isReady: true//刷新issue-list组件
    };
  },
  beforeCreate() {},
  created() {
    //初始化当前页面名称
    document.title = this.pageName;
    this.$route.meta.title = this.pageName;
    this.projectId = Math.floor(this.$route.params['projectId']);
    this.appId = Math.floor(this.$route.params['appId']);
    this.getAppById();
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
    editDisplayAttr() {
      this.isAttrSettingShow = true;
    },
    closeAttrSetting(needRefresh) {
      this.isAttrSettingShow = false;
      if (needRefresh) {
        this.reloadIssueList();
      }
    },
    toRequestDetail(id) {
      this.$router.push({ path: '/request-detail/' + this.projectId + '/' + this.appId + '/' + id });
    },
    getAppById() {
      this.$api.rdm.app.getAppById(this.appId).then(res => {
        this.appData = res.Return;
      });
    },

    addIssue() {
      this.isEditIssueShow = true;
      this.currentIssueId = null;
    },
    closeEditIssue(needRefresh) {
      this.isEditIssueShow = false;
      if (needRefresh) {
        this.refreshIssueList();
      }
    },
    changeCatalog(catalog) {
      if (catalog) {
        this.currentCatalog = catalog.id;
      } else {
        this.currentCatalog = null;
      }
    },
    reloadIssueList() {
      this.isReady = false;
      this.$nextTick(() => {
        this.isReady = true;
      });
    },
    refreshIssueList(currentPage) {
      const issueList = this.$refs['issueList'];
      if (issueList) {
        issueList.refresh(currentPage);
      }
    },
    editIssue(issue) {
      this.isEditIssueShow = true;
      this.currentIssueId = issue.id;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
