<template>
  <div>
    <TsDialog
      type="slider"
      width="large"
      :isShow="true"
      :hasFooter="false"
      :title="t('title')"
      @on-close="$emit('close')"
    >
      <CombineSearcher
        v-model="filters"
        v-bind="searchConfig"
        class="mb-md"
        @change="searchData(1)"
      >
        <template v-slot:appSystemId="{valueConfig, textConfig}">
          <TsFormSelect
            :value="valueConfig.appSystemId"
            dynamicUrl="/api/rest/deploy/app/config/appsystem/search"
            rootName="tbodyList"
            valueName="id"
            textName="abbrName"
            search
            transfer
            @on-change="(value, item) => changeApp(value, item, valueConfig, textConfig)"
          />
        </template>
        <template v-slot:appModuleId="{valueConfig, textConfig}">
          <TsFormSelect
            :key="valueConfig.appSystemId || 'none'"
            :value="valueConfig.appModuleId"
            :dynamicUrl="valueConfig.appSystemId ? '/api/rest/deploy/app/config/module/list' : null"
            :params="{appSystemId: valueConfig.appSystemId}"
            :disabled="!valueConfig.appSystemId"
            valueName="id"
            textName="abbrName"
            search
            transfer
            @on-change="(value, item) => changeModule(value, item, valueConfig, textConfig)"
          />
        </template>
      </CombineSearcher>
      <TsTable
        v-bind="lockData"
        :loading="loading"
        :theadList="theadList"
        @changeCurrent="searchData"
        @changePageSize="changePageSize"
      >
        <template v-slot:lockTarget="{row}">
          <span class="text-href lock-nowrap" @click="detailId = String(row.id)">{{ row.handlerParam && row.handlerParam.lockMode || '-' }}</span>
        </template>
        <template v-slot:key="{row}">
          <Tooltip
            :content="row.key || '-'"
            max-width="480"
            placement="top-start"
            transfer
          >
            <span class="lock-key">{{ row.key || '-' }}</span>
          </Tooltip>
        </template>
        <template v-slot:isLock="{row}"><span class="lock-nowrap">{{ t(row.isLock === 1 ? 'held' : 'waiting') }}</span></template>
        <template v-slot:jobName="{row}">
          <div class="lock-job">
            <Tooltip
              :content="row.jobName || '-'"
              max-width="480"
              placement="top-start"
              transfer
            >
              <a
                class="lock-ellipsis lock-job-name"
                :href="jobUrl(row.jobId)"
                target="_blank"
                rel="noopener noreferrer"
              >{{ row.jobName || '-' }}</a>
            </Tooltip>
            <div class="text-grey lock-nowrap"><a :href="jobUrl(row.jobId)" target="_blank" rel="noopener noreferrer">{{ row.jobId || '-' }}</a></div>
          </div>
        </template>
        <template v-slot:jobStatus="{row}"><Status :statusValue="row.jobStatus" :statusName="row.jobStatusName" type="text" /></template>
        <template v-slot:fcd="{row}">
          <div class="lock-nowrap">{{ row.fcd | formatDate }}</div>
          <div class="text-grey lock-nowrap">{{ t('duration') }}: {{ row.lockCostTime == null || row.lockCostTime === '' ? '-' : row.lockCostTime }}</div>
        </template>
        <template v-slot:error="{row}">
          <div v-if="row.notifyError || row.unlockError" class="text-href text-error" @click="detailId = String(row.id)">
            <div v-for="field in ['notifyError', 'unlockError']" :key="field">
              <Tooltip
                v-if="row[field]"
                max-width="480"
                placement="top-start"
                transfer
              >
                <span class="lock-ellipsis lock-error">{{ t(field) }}: {{ errorMessage(row[field]) }}</span>
                <div slot="content" class="lock-error-content">{{ t(field) }}: {{ errorMessage(row[field]) }}</div>
              </Tooltip>
            </div>
          </div>
          <span v-else>-</span>
        </template>
        <template v-slot:action="{row}">
          <div class="tstable-action"><ul class="tstable-action-ul">
            <li @click="detailId = String(row.id)">{{ t('detail') }}</li>
            <li @click="confirmRelease(row)">{{ t(row.isLock === 1 ? 'unlock' : 'cancel') }}</li>
          </ul></div>
        </template>
      </TsTable>
    </TsDialog>
    <LockDetail
      v-if="detailId"
      :lockId="detailId"
      @close="detailId = null"
      @released="searchData()"
    />
    <UnlockProgress
      v-if="releaseRow"
      :row="releaseRow"
      :action="releaseRow.isLock === 1 ? 'unlock' : 'cancel'"
      @close="releaseRow = null; searchData()"
      @finished="searchData()"
    />
  </div>
</template>
<script>
export default {
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    Status: () => import('@/resources/components/Status/CommonStatus.vue'),
    LockDetail: () => import('./resourcelock-detail-dialog.vue'),
    UnlockProgress: () => import('./resourcelock-unlock-dialog.vue')
  },
  props: { selectedApp: Object, keywordParam: Object },
  data() {
    return { filters: {}, lockData: {}, loading: false, pageSize: 20, currentPage: 1, sequence: 0, detailId: null, releaseRow: null };
  },
  created() {
    this.filters = {...(this.keywordParam || {})};
    if (!this.filters.appSystemId && this.selectedApp) this.$set(this.filters, 'appSystemId', this.selectedApp.id);
    if (this.filters.jobId) this.filters.jobId = String(this.filters.jobId);
    this.searchData(1);
  },
  beforeDestroy() { this.sequence++; },
  methods: {
    t(key) { return this.$t('term.deploy.resourcelockui.' + key); },
    jobUrl(id) { return HOME + '/autoexec.html#/job-detail?id=' + encodeURIComponent(id || ''); },
    errorMessage(error) { try { return JSON.parse(error).message; } catch (e) { return error; } },
    // 仅允许最新请求更新表格或关闭加载状态，避免旧响应覆盖新筛选结果。
    async searchData(page) {
      if (page) this.currentPage = page;
      const sequence = ++this.sequence;
      this.loading = true;
      const keywordParam = {...this.filters};
      const range = keywordParam.timeRange || [];
      delete keywordParam.timeRange;
      if (range[0]) keywordParam.startTime = Number(range[0]);
      if (range[1]) keywordParam.endTime = Number(range[1]);
      if (keywordParam.hasError !== undefined && keywordParam.hasError !== null && keywordParam.hasError !== '') keywordParam.hasError = String(keywordParam.hasError) === '1';
      if (keywordParam.jobId && !/^\d+$/.test(keywordParam.jobId)) {
        this.$Message.error(this.t('invalidJobId')); this.loading = false; return;
      }
      try {
        const res = await this.$api.framework.globallock.searchLockList({handler: 'deploy', keywordParam, currentPage: this.currentPage, pageSize: this.pageSize});
        if (sequence === this.sequence && res.Status === 'OK') this.lockData = res.Return || {};
      } finally { if (sequence === this.sequence) this.loading = false; }
    },
    // 提交搜索前，插槽中的筛选值由 CombineSearcher 内部维护。
    changeApp(value, item, values, texts) {
      if (String(value || '') !== String(values.appSystemId || '')) {
        this.$delete(values, 'appModuleId'); this.$delete(texts, 'appModuleId');
      }
      this.$set(values, 'appSystemId', value);
      this.$set(texts, 'appSystemId', item ? item.text : null);
    },
    changeModule(value, item, values, texts) {
      this.$set(values, 'appModuleId', value);
      this.$set(texts, 'appModuleId', item ? item.text : null);
    },
    changePageSize(size) { this.pageSize = size; this.searchData(1); },
    confirmRelease(row) {
      if (this.releaseRow) return;
      this.$createDialog({title: this.t(row.isLock === 1 ? 'unlock' : 'cancel'), content: this.t('confirm'), 'on-ok': dialog => {
        if (!this.releaseRow) this.releaseRow = row;
        dialog.isShow = false;
      }});
    }
  },
  computed: {
    theadList() {
      return [
        {key: 'lockTarget', title: this.$t('page.type'), width: 70}, {key: 'key', title: 'Key', width: 180},
        {key: 'isLock', title: this.t('status'), width: 80},
        {key: 'jobName', title: this.t('job'), width: 220}, {key: 'jobStatus', title: this.t('jobStatus'), width: 90},
        {key: 'fcd', title: this.t('time'), width: 190},
        {key: 'error', title: this.t('error'), width: 200}, {key: 'action'}
      ];
    },
    searchConfig() {
      return { search: false, searchList: [
        {name: 'appSystemId', type: 'slot', label: this.t('app')},
        {name: 'appModuleId', type: 'slot', label: this.t('module')},
        {name: 'lockMode', type: 'select', label: this.t('mode'), dataList: [{value: 'read', text: this.t('read')}, {value: 'write', text: this.t('write')}], transfer: true},
        {name: 'hasError', type: 'select', label: this.t('hasError'), dataList: [{value: '1', text: this.t('yes')}, {value: '0', text: this.t('no')}], transfer: true},
        {name: 'timeRange', type: 'datetimerange', label: this.t('time'), valueType: 'timestamp', transfer: true},
        {name: 'jobId', type: 'text', label: this.t('jobId')}
      ]};
    }
  }
};
</script>
<style scoped>
/* 限制长文本的实际宽度，避免表格自动布局将 Key 挤成逐字换行。 */
.lock-ellipsis { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* Key 完整展示，固定宽度内允许连续字符自动折行。 */
.lock-key {
  display: block;
  width: 160px;
  white-space: normal;
  overflow-wrap: anywhere;
}
.lock-job, .lock-job-name { width: 200px; }
.lock-error { width: 180px; }
.lock-nowrap { white-space: nowrap; }
/* Tooltip 转移到抽屉外后仍保留完整异常的换行与长单词折行。 */
.lock-error-content { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
