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
        <Button type="primary" @click="addIssue()">
          <span class="tsfont-plus">{{ $t('term.rdm.request') }}</span>
        </Button>
      </template>
      <template v-slot:content>
        <div class="mb-md">
          <IssueList
            v-if="appData"
            ref="issueList"
            :app="appData"
            @toDetail="toRequestDetail"
          ></IssueList>
        </div>
      </template>
    </TsContain>
    <EditIssue
      v-if="isEditIssueShow"
      :id="currentIssueId"
      :app="appData"
      @close="closeEditIssue"
    ></EditIssue>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppTab: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-tab.vue'], resolve),
    EditIssue: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-issue-dialog.vue'], resolve),
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve)
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
      isEditIssueShow: false
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
    toRequestDetail(id) {
      this.$router.push({path: '/task-detail/' + this.projectId + '/' + this.appId + '/' + id});
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
