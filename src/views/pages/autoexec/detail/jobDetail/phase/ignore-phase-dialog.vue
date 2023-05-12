<template>
  <TsDialog v-bind="dialogConfig" @on-ok="okDialog" @on-close="closeDialog">
    <template v-slot>
      <div class="mb-nm">{{ $t('term.autoexec.ignorephaseconfirm') }}</div>
      <Alert show-icon>
        <div>{{ $t('term.autoexec.jobruntip') }}</div>
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
    phaseId: { type: Number } //阶段id
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
      const param = {
        jobId: this.jobId,
        jobPhaseId: this.phaseId
      };
      this.$set(this.dialogConfig, 'loading', true);
      this.$api.autoexec.job
        .ignorePhase(param)
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
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
