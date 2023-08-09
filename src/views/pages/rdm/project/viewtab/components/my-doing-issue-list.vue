<template>
  <Scroll :on-reach-bottom="handleReachBottom" :loading-text="loadingTip" :height="height">
    <ul v-if="issueList && issueList.length > 0">
      <li
        v-for="(issue, index) in issueList"
        :key="index"
        class="mb-md cursor"
        @click="selectIssue(issue)"
      >
        <div :class="{ grid: !!issue.status }" class="status-container">
          <div v-if="issue.status" class="status"><IssueStatus :scale="0.8" :issueData="issue"></IssueStatus></div>
          <div class="overflow" :class="{ 'text-primary': issue.id === issueId }">{{ issue.name }}</div>
        </div>
      </li>
    </ul>
    <div v-else><NoData></NoData></div>
  </Scroll>
</template>
<script>
export default {
  name: '',
  components: {
    IssueStatus: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-status.vue'], resolve)
  },
  props: {
    appId: { type: Number },
    projectId: { type: Number },
    issueId: { type: Number }
  },
  data() {
    return {
      height: 0,
      hasMore: true,
      loadingTip: this.$t('page.loadingtip'),
      issueList: [],
      searchParam: {
        isMine: 1,
        isEnd: 0,
        mode: 'list',
        projectId: this.projectId,
        appId: this.appId
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initHeight();
    window.addEventListener('resize', this.initHeight);
    this.searchIssue();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.initHeight);
  },
  destroyed() {},
  methods: {
    initHeight() {
      if (this.$el) {
        this.height = window.innerHeight - this.$el.getBoundingClientRect().top - 16;
      }
    },
    selectIssue(issue) {
      this.$router.push({ path: '/' + issue.appType + '-detail/' + issue.projectId + '/' + issue.appId + '/' + issue.id });
    },
    handleReachBottom() {
      //引用滚动加载
      if (this.searchParam.currentPage) {
        this.searchParam.currentPage += 1;
      }

      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
          if (!this.hasMore) {
            this.loadingTip = this.$t('page.loadfinish');
            return;
          } else {
            this.searchIssue();
          }
        }, 500);
      });
    },
    searchIssue() {
      this.$api.rdm.issue
        .searchIssue(this.searchParam)
        .then(res => {
          const issueList = res.Return.tbodyList;
          const pageSize = res.Return.pageSize;
          if (issueList && issueList.length) {
            if (issueList.length > pageSize) {
              this.hasMore = true;
            } else {
              this.hasMore = false;
            }
            if (this.searchParam.currentPage == 1) {
              this.issueList = issueList;
            } else {
              for (let i = 0; i < Math.min(issueList.length, pageSize); i++) {
                this.issueList.push(issueList[i]);
              }
            }
          } else {
            if (this.searchParam.currentPage == 1) {
              this.issueList = [];
            }
            this.hasMore = false;
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto auto;
}
.status-container {
  position: relative;
  padding-right: 50px;
}
.status {
  position: absolute;
  top: 0px;
  right: 0px;
}
</style>
