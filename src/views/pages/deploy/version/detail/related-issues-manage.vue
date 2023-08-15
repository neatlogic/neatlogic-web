<template>
  <div class="padding">
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <TsTable
      v-if="!loadingShow"
      v-bind="tableConfig"
      :theadList="theadList"
      @changeCurrent="changeCurrent"
      @changePageSize="changePageSize"
    >
      <template slot="description" slot-scope="{row}">
        <Poptip
          v-if="row.description && canBeyondHidden(row.description)"
          width="450"
          transfer
          trigger="hover"
          word-wrap
        >
          {{ truncateString(row.description) }}
          <div slot="content" style="max-height: 500px;overflow-y: auto;">
            {{ row.description }}
          </div>
        </Poptip>
        <span v-else>{{ row.description }}</span>
      </template>
    </TsTable>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {
    versionId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loadingShow: true,
      tableConfig: {
        rowNum: 0,
        currentPage: 1,
        pageSize: 20,
        pageCount: 0,
        tbodyList: []
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
          title: this.$t('page.type'),
          key: 'type'
        },
        {
          title: this.$t('page.status'),
          key: 'status'
        },
        {
          title: this.$t('page.description'),
          key: 'description'
        },
        {
          title: this.$t('term.process.dealwithuser'),
          key: 'handleUserId'
        },
        {
          title: this.$t('page.createtime'),
          key: 'issueCreateTime',
          type: 'time'
        },
        {
          title: this.$t('page.updatetime'),
          key: 'issueUpdateTime',
          type: 'time'
        },
        {
          title: this.$t('term.deploy.lastsynchronizationtime'),
          key: 'issueLastSyncTime',
          type: 'time'
        },
        {
          title: this.$t('page.creator'),
          key: 'issueCreator'
        },
        {
          title: this.$t('page.updateuser'),
          key: 'issueUpdateUser'
        },
        {
          title: this.$t('page.responsibleperson'),
          key: 'issuePersonInCharge'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchIssuesData();
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
    changeCurrent(currentPage) {
      this.tableConfig.currentPage = currentPage;
      this.searchIssuesData();
    },
    changePageSize(pageSize) {
      this.tableConfig.currentPage = 1;
      this.tableConfig.pageSize = pageSize;
      this.searchIssuesData();
    },
    searchIssuesData() {
      this.loadingShow = true;
      let params = {
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize,
        versionId: this.versionId
      };
      this.$api.deploy.version.getRelatedIssuesList(params).then(res => {
        if (res.Status == 'OK') {
          this.tableConfig = Object.assign(this.tableConfig, res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  filter: {},
  computed: {
    truncateString() {
      return (str, maxLength = 20) => {
        if (typeof str !== 'string') {
          return str;
        }
        if (str.length <= maxLength) {
          return str;
        } else {
          return str.slice(0, maxLength) + '...'; // 使用 slice() 方法截取前 maxLength 个字符，并添加省略号
        }
      };
    },
    canBeyondHidden() {
      // 文字超出隐藏
      return (str, maxLength = 20) => {
        if (typeof str === 'boolean' || typeof str === 'number') {
          return false;
        } else if (str.length <= maxLength) {
          return false;
        } else {
          return true;
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
