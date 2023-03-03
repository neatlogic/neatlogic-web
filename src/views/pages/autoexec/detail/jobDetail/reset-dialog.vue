<template>
  <TsDialog v-bind="dialogConfig" @on-ok="okDialog" @on-close="closeDialog">
    <template v-slot>
      <div class="mb-nm">重置节点将会使节点状态变为“待运行”，确认重置节点？</div>
      <Alert show-icon>
        <div>重置节点适用于以下两种场景：</div>
        <div>1.节点需要重跑，重置为“待运行”状态后，可重跑节点。</div>
        <div>2.本平台出现故障，导致所有节点停止运行，可重置所有节点，重跑当前作业。</div>
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
        title: '重置确认',
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
            this.$Message.success(this.$t('message.content.executesuccess'));
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
