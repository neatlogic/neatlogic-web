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
      <template slot="" slot-scope="{row}">
        {{ row }}
      </template>
      <template slot="action" slot-scope="{ row }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="tsfont-edit" @click="editRow(row)">编辑</li>
            <li class="tsfont-trash-o" @click="deleteRow(row)">删除</li>
          </ul>
        </div>
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
  props: {},
  data() {
    return {
      loadingShow: false,
      tableConfig: {
        currentPage: 1,
        pageSize: 20,
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
          title: '来源',
          key: 'sourceId'
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
          key: 'action'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
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
        pageSize: this.tableConfig.pageSize
      };
      this.$api.deploy.version.getRelatedIssuesList(params).then(res => {
        if (res.Status == 'OK') {
        // 
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    editRow() {

    },
    deleteRow() {
      // 删除行
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
