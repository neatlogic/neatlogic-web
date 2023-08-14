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
          v-if="row.description"
          width="450"
          transfer
          trigger="hover"
          word-wrap
        >
          {{ truncateString(row.description) }}
          <div slot="content" style="height: 500px;overflow-y: auto;">
            <div>{{ row.description }}</div>
          </div>
        </Poptip>
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
          title: '编号',
          key: 'no'
        },
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '类型',
          key: 'type'
        },
        {
          title: '状态',
          key: 'status'
        },
        {
          title: '描述',
          key: 'description'
        },
        {
          title: '需求处理人',
          key: 'handleUserId'
        },
        {
          title: '需求创建时间',
          key: 'issueCreateTime',
          type: 'time'
        },
        {
          title: '更新时间',
          key: 'issueUpdateTime',
          type: 'time'
        },
        {
          title: '最后同步时间',
          key: 'issueLastSyncTime',
          type: 'time'
        },
        {
          title: '创建人',
          key: 'issueCreator'
        },
        {
          title: '更新人',
          key: 'issueUpdateUser'
        },
        {
          title: '负责人',
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
          Object.assign(this.tableConfig, res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  filter: {},
  computed: {
    truncateString(str, maxLength = 20) {
      return () => {
        if (typeof str !== 'string') {
          return str;
        }
        if (str.length <= maxLength) {
          return str;
        } else {
          return str.slice(0, maxLength) + '...'; // 使用 slice() 方法截取前 maxLength 个字符，并添加省略号
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
