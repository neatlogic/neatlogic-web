<template>
  <div
    v-if="app && app.statusList && app.statusList.length > 0"
    ref="divMain"
    :style="{ height: height + 'px' }"
    class="divContainer"
  >
    <div
      v-for="(status, index) in app.statusList"
      :key="index"
      class="divStatus bg-op radius-md padding"
      :class="index < app.statusList.length - 1 ? 'mr-md' : ''"
    >
      <h3 class="text-grey">{{ status.label }}</h3>
      <div class="status-item mt-sm">
        <div
          v-for="(issue, iindex) in getIssueByStatus(status)"
          :key="issue.id"
          :class="iindex < getIssueByStatus(status).length - 1 ? 'mb-nm' : ''"
          class="radius-sm border-color-base issue-item padding-md bg-grey"
          @click="openIssueDetail(issue)"
        >
          <div class="overflow">
            <span><AppIcon :appType="issue.appType" size="small" :appColor="issue.appColor"></AppIcon></span>
            <span><a @click="toIssueDetail(issue)">{{ issue.name }}</a></span>
          </div>
          <div class="mt-xs mb-xs text-grey fz10">{{ issue.createDate | formatDate('yyyy-mm-dd') }}</div>
          <div><UserCard v-for="(user, uindex) in issue.userList" :key="uindex" :v-bind="user"></UserCard></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppIcon: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-icon.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  props: {
    app: { type: Object },
    issueData: { type: Object },
    theadList: { type: Array },
    attrList: { type: Array },
    mode: { type: String },
    checkedIdList: { type: Array },
    canAction: { type: Boolean, default: false },
    parentId: { type: Number }, //父任务id，传入parentId代表这里显示的是子任务
    fromId: { type: Number }, //来源任务id
    toId: { type: Number } //目标任务id
  },
  data() {
    return {
      height: 0
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initHeight();
    window.addEventListener('resize', this.initHeight);
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
    openIssueDetail(row) {
      this.$emit('openIssue', row);
    },
    initHeight() {
      const main = this.$refs['divMain'];
      if (main) {
        this.height = window.innerHeight - main.getBoundingClientRect().top - 20;
      }
    },
    getSelectedIssueList() {
      const itemList = [];
      if (this.issueData.tbodyList && this.issueData.tbodyList.length > 0) {
        this.issueData.tbodyList.forEach(item => {
          if (item._selected) {
            itemList.push(item);
          }
        });
      }
      return itemList;
    },
    getSelected(idList, itemList) {
      this.$emit('selected', itemList);
    },
    toggleChildIssue(row) {
      this.$emit('toggleChildIssue', row);
    },
    changeChecked(isSelected, issue) {
      this.$set(issue, '_selected', isSelected);
      this.$emit('selected', this.getSelectedIssueList());
    },
    toIssueDetail(row) {
      this.$emit('toIssue', row);
    },
    deleteIssue(row) {
      this.$emit('deleteIssue', row);
    },
    searchIssue(currentPage) {
      this.$emit('searchIssue', currentPage);
    },
    changePageSize(pageSize) {
      this.$emit('changePageSize', pageSize);
    }
  },
  filter: {},
  computed: {
    getIssueByStatus() {
      return status => {
        const issueList = [];
        if (this.issueData && this.issueData.tbodyList && this.issueData.tbodyList.length > 0) {
          this.issueData.tbodyList.forEach(issue => {
            if (issue.status === status.id) {
              issueList.push(issue);
            }
          });
        }
        return issueList;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.divContainer {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: norwap;
}
.status-item {
  width: 100%;
  overflow-y: auto;
  height: calc(100% - 40px);
}
.divStatus {
  width: 300px;
  display: inline-block;
  height: 100%;
}
.issue-item {
  border-width: 1px;
  border-style: solid;
  height: 100px;
  width: 100%;
}
</style>
