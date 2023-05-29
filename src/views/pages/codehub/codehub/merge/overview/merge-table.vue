<template>
  <div>
    <TsTable
      v-bind="tabledata"
      class="mrtable"
      @changeCurrent="changeCurrent"
      @changePageSize="changePageSize"
      @clickTr="goDetail"
    >
      <!-- <template slot="versionStrategyVo" slot-scope="{row}">
        {{ row.versionStrategyVo.name }}
      </template> -->
      <template slot="versionUuid" slot-scope="{row}">
        {{ row.versionUuid }}
      </template>
      <template slot="status" slot-scope="{row}">
        {{ showtxt(row.status) }}
      </template>
      <template slot="lcd" slot-scope="{row}">
        {{ row.lcd|formatDate }}
      </template>
      <template slot="versionVo" slot-scope="{row}">
        {{ row.versionName || row.versionVo.name }}
      </template>
      <template slot="description" slot-scope="{row}">
        <div
          v-if="row.description"
          :title="row.description"
          style="max-width:300px;"
          class="overflow"
        >{{ row.description }}</div>
      </template>
    </TsTable>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  filters: {},
  props: {
    mrData: Object,
    mrList: Array
  },
  data() {
    return {
      tabledata: {
        theadList: [{
          title: 'MR编号',
          key: 'uuid'
        }, {
          title: '描述',
          key: 'description'
        }, {
          title: '源分支',
          key: 'srcBranch'
        }, {
          title: '目标分支',
          key: 'targetBranch'
        }, {
          title: '版本',
          key: 'versionVo'
        }, {
          title: '状态',
          key: 'status'
        }, {
          title: '所有需求',
          key: 'allIssueCount'
        }, {
          title: '冲突需求',
          key: 'conflictIssueCount'
        }, {
        //   title: '已撤销需求',
        //   key: 'canceledIssueCount'
        // }, {
        //   title: '撤销冲突需求',
        //   key: 'cancelConflictIssueCount'
        // }, {
          title: '已合并需求',
          key: 'mergedIssueCount'
        }, {
          title: '提交人',
          key: 'fcu'
        }, {
          title: '处理人',
          key: 'handleUser'
        }, {
          title: '更新时间',
          key: 'lcd'
        }],
        tbodyList: [],
        rowKey: 'uuid'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changePageSize(size) {
      this.$emit('changePageSize', size);
    },
    changeCurrent(page) {
      this.$emit('changeCurrent', page);
    },
    goDetail(val) {
      this.$router.push({ path: 'merge-review', query: {uuid: val.uuid} });
    }
  },
  computed: {
    showtxt() {
      return function(status) {
        let text = '';
        this.mrList.forEach(m => {
          if (m.status == status) {
            text = m.text;
          }
        });
        return text;
      };
    }
  },
  watch: {
    mrData: {
      handler: function(val) {
        Object.assign(this.tabledata, {
          'pageCount': val.pageCount,
          'rowNum': val.rowNum,
          'pageSize': val.pageSize,
          'currentPage': val.currentPage,
          'tbodyList': val.tbodyList
        });
      },
      deep: true,
      immediate: true
    }
  }

};

</script>
<style lang='less' scoped>
.mrtable{
  /deep/ td{
    cursor: pointer;
  }
}
</style>
