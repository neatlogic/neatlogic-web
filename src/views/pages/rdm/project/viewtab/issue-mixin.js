export default {
  data() {
    return {
      appData: null,
      appId: null,
      projectId: null,
      isReady: true//刷新issue-list组件
    };
  },
  created() {
    //初始化当前页面名称
    document.title = this.pageName;
    this.$route.meta.title = this.pageName;
    this.projectId = Math.floor(this.$route.params['projectId']);
    this.appId = Math.floor(this.$route.params['appId']);
    this.getAppById();
  },
  methods: {
    getAppByProjectId() {
      this.$api.rdm.project.getAppByProjectId(this.projectId, {
        isActive: 1
      }).then(res => {
        this.appList = res.Return;
      });
    },
    getAppById() {
      this.$api.rdm.app.getAppById(this.appId, 1).then(res => {
        this.appData = res.Return;
      });
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
    }
  }
};
