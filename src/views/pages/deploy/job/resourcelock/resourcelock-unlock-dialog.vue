<template>
  <div>
    <TsDialog
      :isShow="true"
      type="modal"
      width="large"
      :hasFooter="false"
      :title="t('progress')"
      @on-close="close"
    >
      <Loading :loadingShow="preparing" />
      <div class="mb-md">
        <span class="text-href" @click="detailId = String(row.id)">{{ row.id }}</span>
        <div class="lock-key">{{ row.key }} <span class="text-href" @click="copy(row.key)">{{ t('copy') }}</span></div>
        <a :href="jobUrl(row.jobId)" target="_blank" rel="noopener noreferrer">{{ row.jobName || row.jobId }} · {{ row.jobId }}</a>
        <div>{{ t('release') }}: {{ progress.releaseStatusText || t(progress.releaseStatus || 'pending') }}</div>
        <pre v-if="progress.releaseError" class="lock-key text-error">{{ errorText(progress.releaseError) }}</pre>
      </div>
      <div v-if="uncertain || stale" class="text-warn mb-md">{{ t('uncertain') }}</div>
      <div v-if="expired" class="text-warn">{{ t('expired') }}</div>
      <div>{{ t('notifyProgress') }}: {{ progress.processed || 0 }} / {{ progress.total || 0 }}</div>
      <TsTable :theadList="columns" :tbodyList="progress.waiters || []">
        <template v-slot:lockId="{row: waiter}"><span class="text-href" @click="detailId = String(waiter.lockId)">{{ waiter.lockId }}</span></template>
        <template v-slot:key="{row: waiter}"><span class="lock-key">{{ waiter.key }}</span> <span class="text-href" @click="copy(waiter.key)">{{ t('copy') }}</span></template>
        <template v-slot:jobId="{row: waiter}"><a :href="jobUrl(waiter.jobId)" target="_blank" rel="noopener noreferrer">{{ waiter.jobName || waiter.jobId }} · {{ waiter.jobId }}</a></template>
        <template v-slot:status="{row: waiter}"><span :class="waiter.status === 'failed' ? 'text-error' : ''">{{ waiter.statusText || t(waiter.status) }}</span></template>
        <template v-slot:error="{row: waiter}"><pre v-if="waiter.error" class="lock-key text-error">{{ errorText(waiter.error) }}</pre></template>
      </TsTable>
      <div v-if="finished" class="mt-md">
        {{ t('result') }}: {{ progress.releaseStatusText || t(progress.releaseStatus) }}
        <span v-if="progress.notificationStatus"> · {{ t('notification') }}: {{ progress.notificationStatusText || t(progress.notificationStatus) }}</span>
        <pre v-if="progress.notificationError" class="lock-key text-error">{{ errorText(progress.notificationError) }}</pre>
      </div>
    </TsDialog>
    <LockDetail v-if="detailId" :lockId="detailId" @close="detailId = null" />
  </div>
</template>
<script>
export default {
  components: {TsTable: () => import('@/resources/components/TsTable/TsTable.vue'), LockDetail: () => import('./resourcelock-detail-dialog.vue')},
  props: {row: {type: Object, required: true}, action: {type: String, required: true}},
  data() { return {progress: {}, preparing: false, operationId: null, timer: null, stopped: false, uncertain: false, expired: false, detailId: null}; },
  created() { this.start(); },
  beforeDestroy() { this.stopped = true; clearTimeout(this.timer); },
  methods: {
    t(key) { return this.$t('term.deploy.resourcelockui.' + key); },
    jobUrl(id) { return HOME + '/autoexec.html#/job-detail?id=' + encodeURIComponent(id || ''); },
    copy(text) { this.$utils.copyText(null, text); },
    errorText(value) { try { const error = JSON.parse(value); return error.detail || error.message; } catch (e) { return value; } },
    close() { this.stopped = true; clearTimeout(this.timer); this.$emit('close'); },
    // 同一操作只提交一次，超时后通过轮询核实结果，不重复提交。
    async start() {
      this.preparing = true;
      try {
        const res = await this.$api.framework.globallock.prepareOperation({lockId: String(this.row.id), action: this.action});
        if (res.Status !== 'OK' || this.stopped) return;
        this.operationId = res.Return.operationId;
        this.progress = res.Return;
        this.preparing = false;
        this.poll();
        try {
          await this.$api.framework.globallock.lock({lockId: String(this.row.id), operType: 'deploy', action: this.action, operationId: this.operationId});
        } catch (e) { this.uncertain = true; }
      } finally { this.preparing = false; }
    },
    async poll() {
      if (this.stopped || this.finished || this.expired) return;
      try {
        const res = await this.$api.framework.globallock.getOperation({operationId: this.operationId});
        if (this.stopped) return;
        if (res.Status === 'OK') {
          this.expired = !!res.Return.expired;
          if (res.Return.progress) { this.progress = res.Return.progress; this.uncertain = false; }
          if (this.finished) this.$emit('finished');
        }
      } catch (e) { this.uncertain = true; } finally { if (!this.stopped && !this.finished && !this.expired) this.timer = setTimeout(() => this.poll(), 1000); }
    }
  },
  computed: {
    columns() { return [{key: 'lockId', title: this.t('lockId')}, {key: 'key', title: 'Key'}, {key: 'jobId', title: this.t('job')}, {key: 'runnerId', title: 'Runner'}, {key: 'status', title: this.t('status')}, {key: 'error', title: this.t('error')}]; },
    finished() { return ['done', 'failed'].includes(this.progress.state); },
    stale() { return !this.finished && this.progress.updatedAt && Date.now() - Number(this.progress.updatedAt) > 120000; }
  }
};
</script>
<style scoped>
.lock-key { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
