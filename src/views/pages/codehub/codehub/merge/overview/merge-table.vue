<template>
  <div>
    <TsTable
      v-bind="tableData"
      :theadList="theadList"
      class="mrtable"
      @changeCurrent="changeCurrent"
      @changePageSize="changePageSize"
      @clickTr="goDetail"
    >
      <template slot="versionId" slot-scope="{row}">
        {{ row.versionId }}
      </template>
      <template slot="status" slot-scope="{row}">
        {{ getStatus(row.status) }}
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
    mergeData: Object,
    mergeTypeList: Array
  },
  data() {
    return {
      theadList: [{
        title: this.$t('term.codehub.mergenumber'),
        key: 'id'
      }, {
        title: this.$t('page.description'),
        key: 'description'
      }, {
        title: this.$t('page.sourcebranch'),
        key: 'srcBranch'
      }, {
        title: this.$t('page.targetbranch'),
        key: 'targetBranch'
      }, {
        title: this.$t('page.versions'),
        key: 'versionVo'
      }, {
        title: this.$t('page.status'),
        key: 'status'
      }, {
        title: this.$t('term.codehub.allrequirements'),
        key: 'allIssueCount'
      }, {
        title: this.$t('term.codehub.conflictingneeds'),
        key: 'conflictIssueCount'
      }, {
        title: this.$t('term.codehub.mergedrequirements'),
        key: 'mergedIssueCount'
      }, {
        title: this.$t('page.presenter'),
        key: 'fcu',
        type: 'user'
      }, {
        title: this.$t('term.process.dealwithuser'),
        key: 'handleUser',
        type: 'user'
      }, {
        title: this.$t('page.updatetime'),
        key: 'lcd',
        type: 'time'
      }],
      tableData: {
        tbodyList: [],
        rowKey: 'id'
      }
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
    changePageSize(pageSize) {
      this.$emit('changePageSize', pageSize);
    },
    changeCurrent(currentPage) {
      this.$emit('changeCurrent', currentPage);
    },
    goDetail(val) {
      this.$router.push({ path: 'merge-review', query: {id: val.id} });
    }
  },
  computed: {
    getStatus() {
      return function(status) {
        let text = '';
        this.mergeTypeList.forEach(m => {
          if (m.status == status) {
            text = m.text;
          }
        });
        return text;
      };
    }
  },
  watch: {
    mergeData: {
      handler: function(val) {
        Object.assign(this.tableData, {
          pageCount: val.pageCount,
          rowNum: val.rowNum,
          pageSize: val.pageSize,
          currentPage: val.currentPage,
          tbodyList: val.tbodyList
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
