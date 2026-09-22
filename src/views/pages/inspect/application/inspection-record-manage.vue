<template>
  <div class="inspection-record-manage padding">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsTable
      v-bind="tableConfig"
      :theadList="theadList"
      @changeCurrent="search"
      @changePageSize="changePageSize"
    >
      <template v-slot:parentJobId="{ row }">
        <span class="text-href" @click="openJob(row)">{{ row.parentJobId }}</span>
      </template>
      <template v-slot:scope="{ row }">
        <span>{{ formatScope(row) }}</span>
      </template>
      <template v-slot:status="{ row }">
        <CommonStatus :statusName="row.statusName" :statusValue="row.status" type="text"></CommonStatus>
      </template>
      <template v-slot:fcd="{ row }">
        <span>{{ row.fcd | formatDate }}</span>
      </template>
      <template v-slot:execUser="{ row }">
        <UserCard v-if="row.execUser" :uuid="row.execUser" hideAvatar></UserCard>
      </template>
      <template v-slot:action="{ row }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="tsfont-eye" @click="openJob(row)">{{ $t('page.view') }}</li>
            <li
              v-download="downloadConfig(row)"
              v-download:prevent="isRunning(row) || downloadJobId === row.parentJobId"
              class="tsfont-download"
              :title="isRunning(row) ? $t('term.inspect.reportnotready') : ''"
            >{{ $t('term.inspect.downloadreport') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: 'InspectionRecordManage',
  directives: { download },
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  props: {
    appSystemId: Number,
    appModuleId: Number
  },
  data() {
    return {
      loadingShow: false,
      downloadJobId: null,
      searchParam: {
        currentPage: 1,
        pageSize: 20
      },
      tableConfig: {},
      theadList: [
        { key: 'parentJobId', title: this.$t('term.inspect.parentjobid') },
        { key: 'scope', title: this.$t('term.inspect.inspectionscope') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'execUser', title: this.$t('page.executeuser') },
        { key: 'fcd', title: this.$t('page.fcd') },
        { key: 'action', title: '', type: 'action' }
      ]
    };
  },
  created() {
    this.search(1);
  },
  methods: {
    async search(currentPage) {
      if (!this.appSystemId) return;
      this.searchParam.currentPage = currentPage || this.searchParam.currentPage;
      this.loadingShow = true;
      try {
        const res = await this.$api.inspect.applicationInspect.searchInspectAppJob({
          ...this.searchParam,
          appSystemId: this.appSystemId,
          appModuleId: this.appModuleId
        });
        this.tableConfig = res.Return || {};
      } finally {
        this.loadingShow = false;
      }
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.search(1);
    },
    openJob(row) {
      this.$router.push({ path: '/job-detail', query: { id: row.parentJobId } });
    },
    isRunning(row) {
      return ['saved', 'pending', 'waiting', 'running', 'pausing', 'aborting', 'ready', 'waitInput'].includes(row.status);
    },
    formatScope(row) {
      const envList = row.envList || [];
      return envList.length ? envList.map(env => env.envName || env.envId).join(', ') : this.$t('page.all');
    },
    downloadConfig(row) {
      return {
        url: 'api/binary/inspect/app/report/export',
        method: 'post',
        params: { parentJobId: row.parentJobId },
        changeStatus: status => {
          if (status === 'start') {
            this.downloadJobId = row.parentJobId;
          } else if (status === 'success' || status === 'error') {
            this.downloadJobId = null;
          }
        }
      };
    }
  },
  watch: {
    appSystemId() {
      this.search(1);
    },
    appModuleId() {
      this.search(1);
    }
  }
};
</script>
