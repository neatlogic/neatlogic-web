<template>
  <TsDialog v-bind="dialogConfig" @on-ok="okDialog" @on-close="closeDialog">
    <template v-slot>
      <div class="mb-nm">{{ $t('term.autoexec.resetnodeconfirm') }}</div>
      <Alert show-icon>
        <div>{{ $t('term.autoexec.resetnodescene') }}</div>
        <div>1.{{ $t('term.autoexec.waitrunnodetip') }}</div>
        <div>2.{{ $t('term.autoexec.malfunctionrerunjob') }}</div>
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
    isAll: { type: Number } //是否全部重置
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
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
