<template>
  <TsDialog v-bind="dialogConfig" @on-ok="okDialog" @on-close="closeDialog">
    <template v-slot>
      <div class="mb-nm">{{ $t('term.autoexec.resetnodeconfirm') }}</div>
      <Alert show-icon>
        <div>{{ $t('term.autoexec.resetnodescene') }}</div>
        <div>1.{{ $t('term.autoexec.waitrunnodetip') }}</div>
        <div>2.{{ $t('term.autoexec.malfunctionrerunjob') }}</div>
        <div v-if="unresettableStatusText" class="mt-xs  text-warning">{{ $t('term.autoexec.unresettablestatus') }}{{ unresettableStatusText }}</div>
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
    nodeList: { type: Array, default: () => [] }, //节点id
    isAll: { type: Number }, //是否全部重置
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
        pending: this.$t('term.autoexec.statuspending'),
        running: this.$t('term.autoexec.statusrunning'),
        succeed: this.$t('term.autoexec.statussucceed'),
        failed: this.$t('term.autoexec.statusfailed'),
        aborted: this.$t('term.autoexec.statusaborted'),
        aborting: this.$t('term.autoexec.statusaborting'),
        paused: this.$t('term.autoexec.statuspaused'),
        ignored: this.$t('term.autoexec.statusignored'),
        invalid: this.$t('term.autoexec.statusinvalid')
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
    closeDialog(needRefresh) {
      this.$emit('close', needRefresh);
    },
    okDialog() {
      this.$set(this.dialogConfig, 'loading', true);
      const param = {
        jobId: this.jobId,
        jobPhaseId: this.phaseId,
        resourceIdList: this.nodeList.map(d => d.resourceId).filter(d => !!d),
        sqlIdList: this.nodeList.map(d => d.id).filter(d => !!d), //SQL专用，其他情况后端不需要处理此参数
        isAll: this.isAll
      };
      this.$api.autoexec.job
        .resetNode(param)
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
    unresettableStatusList() {
      if (!this.statusActionMapping || !Object.keys(this.statusActionMapping).length) {
        return [];
      }
      const statusList = Object.keys(this.statusActionMapping).filter(status => {
        const actionList = this.statusActionMapping[status] || [];
        return !actionList.includes('reset');
      });
      if (!statusList.includes('invalid')) {
        statusList.push('invalid');
      }
      return statusList;
    },
    unresettableStatusText() {
      return this.unresettableStatusList.map(status => this.statusTextMapping[status] || status).join('、');
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
