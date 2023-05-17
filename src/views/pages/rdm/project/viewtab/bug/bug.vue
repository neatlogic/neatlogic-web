<template>
  <div>
    <TsContain :enableCollapse="true">
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
          <span class="action-item tsfont-plus" @click="addIssue()">{{ $t('term.rdm.bug') }}</span>
        </div>
      </template>
      <template v-slot:content>
        <IssueList
          v-if="appData"
          ref="issueList"
          :app="appData"
          @toDetail="toRequestDetail"
        ></IssueList>
      </template>
    </TsContain>
    <EditIssue
      v-if="isEditIssueShow"
      :id="currentIssueId"
      :app="appData"
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
    AttrSettingDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/attr-setting-dialog.vue'], resolve)
  },
  props: {
  
  },
  data() {
    return {
      pageName: this.$t('term.rdm.requestmanage'),
      appId: null,
      projectId: null,
      appData: null,
      currentIssueId: null,
      isEditIssueShow: false,
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
      this.$router.push({path: '/request-detail/' + this.projectId + '/' + this.appId + '/' + id});
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
  computed: {
  },
  watch: {}
};
</script>
