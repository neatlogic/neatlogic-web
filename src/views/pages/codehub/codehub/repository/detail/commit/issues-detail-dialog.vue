<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="closeDialog"
    >
      <Loading
        v-if="loadingShow"
        :loadingShow="loadingShow"
        type="fix"
      ></Loading>
      <TsTable
        v-else
        v-bind="tableConfig"
        :theadList="theadList"
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
      >
        <template slot="" slot-scope="{row}">
          {{ row }}
        </template>
      </TsTable>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {
    issueNo: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loadingShow: true,
      tableConfig: {
        currentPage: 1,
        pageSize: 20,
        tbodyList: []
      },
      dialogConfig: {
        title: this.$t('term.codehub.issuedetail'),
        hasFooter: false,
        maskClose: true,
        isShow: true,
        width: 'large'
      },
      theadList: [
        {
          title: this.$t('term.codehub.issuesnumber'),
          key: 'no'
        }, 
        {
          title: this.$t('page.name'),
          key: 'name'
        }, 
        {
          title: this.$t('term.process.dealwithuser'),
          key: 'lcu',
          type: 'user'
        }, 
        {
          title: this.$t('page.status'),
          key: 'status'
        }, 
        {
          title: this.$t('page.updatetime'),
          key: 'issueUpdateTime',
          type: 'time'
        }, 
        {
          title: this.$t('page.source'),
          key: 'source'
        }]
    };
  },
  beforeCreate() {},
  created() {
    this.getIssuesListByIssueId();
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
    closeDialog() {
      this.$emit('close');
    },
    getIssuesListByIssueId() {
      this.loadingShow = true;
      if (this.$utils.isEmpty(this.issueNo)) {
        this.loadingShow = false;
        return false;
      }
      this.$api.codehub.issue.getList({no: this.issueNo}).then(res => {
        if (res && res.Status == 'OK') {
          this.tableConfig = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changeCurrent(currentPage) {
      this.tableConfig.currentPage = currentPage;
      this.getIssuesListByIssueId();
    },
    changePageSize(pageSize) {
      this.tableConfig.currentPage = 1;
      this.tableConfig.pageSize = pageSize;
      this.getIssuesListByIssueId();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
