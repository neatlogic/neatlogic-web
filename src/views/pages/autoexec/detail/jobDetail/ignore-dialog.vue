<template>
  <TsDialog v-bind="dialogConfig" @on-ok="okDialog" @on-close="closeDialog">
    <template v-slot>
      <div v-if="isAll == 1">
        <div class="mb-nm">{{ $t('term.autoexec.ignoreall') }}</div>
      </div>
      <div v-else-if="pendingCount || succeedCount || runningCount" class="mb-nm">
        <span>{{ $t('term.autoexec.selectednodeinclude') }}</span>
        <span v-if="ignoreCount" class="ml-xs mr-xs" v-html="$t('term.autoexec.ignorecount', {target: ignoreCount})"></span>
        <span v-if="pendingCount" class="ml-xs mr-xs" v-html="$t('term.autoexec.pendingcount', {target: pendingCount})"></span>
        <span v-if="succeedCount" class="ml-xs mr-xs" v-html="$t('term.autoexec.runningcount', {target: succeedCount})"></span>
        <span v-if="runningCount" class="ml-xs mr-xs" v-html="$t('term.autoexec.ignorecount', {target: runningCount})"></span>
        <span>{{ $t('term.autoexec.deletenodecontinue') }}</span>
      </div>
      <div v-else class="mb-nm">{{ $t('term.autoexec.ignoreselectednodeconfirm') }}</div>
      <Alert show-icon>
        <div>{{ $t('term.autoexec.jobruntip') }}</div>
        <div class="mt-xs text-warning">{{ $t('term.autoexec.unignoreablestatus') }}{{ unignoreableStatusText }}</div>
      </Alert>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    jobId: { type: Number }, //作业id
    phaseId: { type: Number }, //阶段id
    nodeList: { type: Array, default: () => [] }, //节点列表
    isAll: { type: Number }, //是否全部忽略
    statusActionMapping: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      dialogConfig: {
        loading: false,
        title: this.$t('dialog.title.updateconfirm'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      statusTextMapping: {
        running: this.$t('term.autoexec.statusrunning'),
        succeed: this.$t('term.autoexec.statussucceed'),
        ignored: this.$t('term.autoexec.statusignored'),
        invalid: this.$t('term.autoexec.statusinvalid'),
        pending: this.$t('term.autoexec.statuspending'),
        failed: this.$t('term.autoexec.statusfailed'),
        aborted: this.$t('term.autoexec.statusaborted'),
        aborting: this.$t('term.autoexec.statusaborting'),
        paused: this.$t('term.autoexec.statuspaused')
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
    canIgnoreStatus(status) {
      if (status === 'invalid') {
        return false;
      }
      const actionList = this.statusActionMapping[status] || [];
      return actionList.includes('ignore');
    },
    closeDialog(needRefresh) {
      this.$emit('close', needRefresh);
    },
    okDialog() {
      const param = {
        jobId: this.jobId,
        jobPhaseId: this.phaseId,
        resourceIdList: this.nodeList.filter(d => this.canIgnoreStatus(d.status)).map(d => d.resourceId),
        sqlIdList: this.nodeList.filter(d => this.canIgnoreStatus(d.status)).map(d => d.id),
        isAll: this.isAll
      };
      if (this.isAll != 1 && param.resourceIdList.length == 0) {
        this.$Notice.info({ title: this.$t('page.tip'), desc: this.$t('term.autoexec.noignorenode')});
        return;
      }
      this.$set(this.dialogConfig, 'loading', true);
      this.$api.autoexec.job
        .ignoreNode(param)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.closeDialog(true);
          }
        })
        .finally(() => {
          this.$set(this.dialogConfig, 'loading', false);
        });
    }
  },
  filter: {},
  computed: {
    unignoreableStatusList() {
      const statusList = Object.keys(this.statusActionMapping).filter(status => !this.canIgnoreStatus(status));
      if (!statusList.includes('invalid')) {
        statusList.push('invalid');
      }
      return statusList;
    },
    unignoreableStatusText() {
      return this.unignoreableStatusList.map(status => this.statusTextMapping[status] || status).join('、');
    },
    ignoreCount() {
      if (this.nodeList && this.nodeList.length > 0) {
        return this.nodeList.filter(d => d.status == 'ignored').length;
      }
      return 0;
    },
    pendingCount() {
      if (this.nodeList && this.nodeList.length > 0) {
        return this.nodeList.filter(d => d.status == 'pending').length;
      }
      return 0;
    },
    succeedCount() {
      if (this.nodeList && this.nodeList.length > 0) {
        return this.nodeList.filter(d => d.status == 'succeed').length;
      }
      return 0;
    },
    runningCount() {
      if (this.nodeList && this.nodeList.length > 0) {
        return this.nodeList.filter(d => d.status == 'running').length;
      }
      return 0;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
