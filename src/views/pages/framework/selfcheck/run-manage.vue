<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ $t('term.framework.selfcheck.runhistory') }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <TsFormSelect
              v-model="searchParam.status"
              :dataList="statusDataList"
              :placeholder="$t('page.status')"
              clearable
              width="160px"
              @on-change="searchRun(1)"
            ></TsFormSelect>
          </div>
          <div class="action-item">
            <InputSearcher v-model="searchParam.keyword" @change="searchRun(1)"></InputSearcher>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <TsTable
          v-bind="tableData"
          :theadList="theadList"
          @changeCurrent="searchRun"
          @changePageSize="changePageSize"
        >
          <template v-slot:id="{ row }">
            <span class="text-href" @click="showDetail(row)">{{ row.id || row.runId }}</span>
          </template>
          <template v-slot:status="{ row }">
            <span :class="getStatusClass(row.status)">{{ getStatusText(row.status) }}</span>
          </template>
          <template v-slot:durationMs="{ row }">
            <span>{{ row.durationMs == null ? '-' : row.durationMs + ' ms' }}</span>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-eye" @click="showDetail(row)">{{ $t('page.view') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'SelfCheckRunManage',
  components: {
    TsContain: () => import('@/resources/components/TsContain/TsContain.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  data() {
    return {
      searchParam: {
        keyword: '',
        status: '',
        currentPage: 1,
        pageSize: 20
      },
      tableData: {},
      statusDataList: ['PENDING', 'RUNNING', 'SUCCEED', 'FAILED', 'ABORTED'].map(value => ({
        value,
        text: this.$t(`term.framework.selfcheck.status.${value.toLowerCase()}`)
      })),
      theadList: [
        { key: 'id', title: this.$t('term.framework.selfcheck.runid') },
        { key: 'scenarioName', title: this.$t('term.framework.selfcheck.scenario') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'triggerType', title: this.$t('term.framework.selfcheck.triggertype') },
        { key: 'userName', title: this.$t('page.executeuser') },
        { key: 'startTime', title: this.$t('page.starttime'), type: 'time' },
        { key: 'endTime', title: this.$t('page.endtime'), type: 'time' },
        { key: 'durationMs', title: this.$t('term.framework.selfcheck.duration') },
        { key: 'action', title: '', align: 'right' }
      ]
    };
  },
  created() {
    this.searchRun();
  },
  methods: {
    searchRun(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      const params = Object.assign({}, this.searchParam);
      if (!params.status) {
        delete params.status;
      }
      this.$api.framework.selfcheck.searchRun(params).then(res => {
        if (res.Status === 'OK') {
          this.tableData = res.Return || {};
        }
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchRun(1);
    },
    showDetail(row) {
      this.$router.push({ name: 'scenario-run', query: { runId: row.runId || row.id } });
    },
    getStatusText(status) {
      return this.$t(`term.framework.selfcheck.status.${String(status || 'UNKNOWN').toLowerCase()}`);
    },
    getStatusClass(status) {
      if (status === 'SUCCEED') {
        return 'text-success';
      }
      if (status === 'PENDING' || status === 'RUNNING') {
        return 'text-warning';
      }
      return 'text-error';
    }
  }
};
</script>
