<template>
  <div class="batch-import-audit">
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsTable
      class="table"
      canExpand
      v-bind="tableConfig"
      @changeCurrent="currentPage => search({ currentPage })"
      @changePageSize="pageSize => search({ pageSize })"
    >
      <template v-slot:importDate="{ row }">{{ row.importDate | formatDate }}</template>
      <template v-slot:finishDate="{ row }">{{ row.finishDate | formatDate }}</template>
      <template v-slot:successCount="{ row }">
        <span class="text-success">{{ row.successCount }}</span>
      </template>
      <template v-slot:failedCount="{ row }">
        <span class="text-danger">{{ row.failedCount }}</span>
      </template>
      <template v-slot:statusText="{ row }">
        <span v-if="row.status == 'success'" class="text-success">{{ row.statusText }}</span>
        <span v-else-if="row.status == 'failed'" class="text-error">{{ row.statusText }}</span>
        <span v-else><Progress
          hide-info
          :percent="99"
          status="active"
          style="width:50px"
        /></span>
      </template>
      <template v-slot:error="{ row, index }">
        <span v-if="row.error" class="text-href" @click.stop="showHideError(row, index)">{{ row.showFolder ? $t('page.hide') : $t('page.view') }}</span>
      </template>
      <template v-slot:expand="{ row }">
        <div v-if="row.error" v-html="row.error"></div>
        <div v-else class="text-tip line-2">{{ $t('page.notarget', { target: $t('page.exception') }) }}</div>
      </template>
    </TsTable>
  </div>
</template>

<script>
export default {
  name: 'ImportAudit',
  components: {
    TsTable: () => import('components/TsTable/TsTable')
  },
  data() {
    return {
      isLoading: false,
      errorIndex: null,
      searchParams: {
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        { title: '发起人', key: 'importUserName' },
        { title: '导入模型', key: 'ciName' },
        { title: '导入类型', key: 'actionText' },
        { title: '发起时间', key: 'importDate' },
        { title: '完成时间', key: 'finishDate' },
        { title: this.$t('page.success'), key: 'successCount' },
        { title: this.$t('page.fail'), key: 'failedCount' },
        { title: this.$t('page.status'), key: 'statusText' },
        { title: this.$t('page.error'), key: 'error' }
      ],
      tableConfig: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      },
      tbodyList: [],
      setTimeGetData: null //定时器
    };
  },
  created() {
    this.search();
  },
  beforeDestroy() {
    if (this.setTimeGetData) {
      clearTimeout(this.setTimeGetData);
      this.setTimeGetData = null;
    }
  },
  methods: {
    search(params = {}) {
      if (this.setTimeGetData) {
        clearTimeout(this.setTimeGetData);
      }
      this.isLoading = true;
      this.searchParams = { ...this.searchParams, currentPage: 1, ...params };
      this.$api.cmdb.batchImport.searchAudit(this.searchParams).then(res => {
        this.isLoading = false;
        this.tableConfig = res.Return;
        this.tableConfig.theadList = this.theadList;
        if (this.tableConfig.tbodyList && this.tableConfig.tbodyList.length > 0) {
          const idList = [];
          this.tableConfig.tbodyList.forEach(tbody => {
            if (tbody.status === 'running') {
              idList.push(tbody.id);
            }
          });
          if (idList.length > 0) {
            this.setTimeGetData = setTimeout(() => {
              this.searchInterval(idList);
            }, 3000);
          }
        }
      });
    },
    searchInterval(idList) {
      if (this.setTimeGetData) {
        clearTimeout(this.setTimeGetData);
        this.setTimeGetData = null;
      }
      this.$api.cmdb.batchImport.searchAudit({ needPage: false, idList: idList }).then(res => {
        const dataList = res.Return.tbodyList;
        const newIdList = [];
        dataList.forEach(d => {
          if (d.status == 'running') {
            newIdList.push(d.id);
          }
          this.tableConfig.tbodyList.forEach((tbody, index) => {
            if (tbody.id === d.id) {
              this.$set(tbody, 'importDate', d.importDate);
              this.$set(tbody, 'finishDate', d.finishDate);
              this.$set(tbody, 'successCount', d.successCount);
              this.$set(tbody, 'failedCount', d.failedCount);
              this.$set(tbody, 'status', d.status);
              this.$set(tbody, 'statusText', d.statusText);
              this.$set(tbody, 'error', d.error);
            }
          });
        });
        this.$forceUpdate();
        if (newIdList.length > 0) {
          this.setTimeGetData = setTimeout(() => {
            this.searchInterval(newIdList);
          }, 3000);
        }
      });
    },
    showHideError(row, index) {
      if (!row.error) return;
      if (row['_expand']) {
        this.$set(row, '_expand', false);
      } else {
        this.$set(row, '_expand', true);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.batch-import-audit {
  .operation-bar {
    height: 42px;
    line-height: 42px;
    padding-left: 24px;
  }
}
</style>
