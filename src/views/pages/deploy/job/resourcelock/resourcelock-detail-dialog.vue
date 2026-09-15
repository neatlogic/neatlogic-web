<template>
  <TsDialog
    :isShow="true"
    type="modal"
    width="large"
    :hasFooter="false"
    :title="t('detail')"
    @on-close="$emit('close')"
  >
    <Loading :loadingShow="loading" />
    <div v-if="released">{{ t('releasedMessage') }}</div>
    <div v-else-if="lock">
      <div class="mb-md"><a
        v-if="lock.jobId"
        :href="jobUrl(lock.jobId)"
        target="_blank"
        rel="noopener noreferrer"
      >{{ lock.jobName || lock.jobId }} · {{ lock.jobId }}</a></div>
      <Button class="mb-md" @click="copy">{{ t('copy') }}</Button>
      <pre class="lock-json">{{ formatted }}</pre>
    </div>
  </TsDialog>
</template>
<script>
export default {
  props: {lockId: {type: String, required: true}},
  data() { return {loading: false, released: false, lock: null}; },
  created() { this.load(); },
  methods: {
    t(key) { return this.$t('term.deploy.resourcelockui.' + key); },
    jobUrl(id) { return HOME + '/autoexec.html#/job-detail?id=' + encodeURIComponent(id); },
    async load() {
      this.loading = true;
      try {
        const res = await this.$api.framework.globallock.getLock({lockId: this.lockId});
        if (res.Status === 'OK') {
          this.released = !!res.Return.released; this.lock = res.Return.lock;
          if (this.released) this.$emit('released');
        }
      } finally { this.loading = false; }
    },
    copy() { this.$utils.copyText(null, this.formatted); }
  },
  computed: {formatted() { return JSON.stringify(this.lock, null, 2); }}
};
</script>
<style scoped>
.lock-json { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
