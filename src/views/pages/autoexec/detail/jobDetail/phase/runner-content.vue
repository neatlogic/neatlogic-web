<template>
  <div v-if="jobData && phaseData" class="runner-content">
    <div v-if="runnerData" class="pl-nm pr-nm pt-nm text-right runner-action">
      <div class="action-group line">
        <span v-if="phaseData.warnCount > 0" class="action-item">
          <span>{{ $t('page.warningmessage') }}</span>
          <span class="text-warning pl-icon">{{ phaseData.warnCount }}</span>
        </span>
        <span class="action-item">
          <Poptip transfer placement="bottom">
            <span class="text-action">
              <i class="tsfont-adapter pr-icon"></i><span>{{ $t('term.autoexec.actuatorinformation') }}</span>
            </span>
            <div slot="content">
              <div>
                <span class="text-title">{{ $t('page.name') }}</span>
                <p class="text-default">{{ runnerData.name }}</p>
              </div>
              <div>
                <span class="text-title">{{ $t('page.config') }}</span>
                <p class="text-default">{{ runnerData.port }}</p>
              </div>
              <div>
                <span v-if="runnerData.phaseRunnerGroupFrom" class="text-title">{{ $t('page.config') }}{{ $t('page.source') }}</span>
                <p class="text-default">{{ runnerData.phaseRunnerGroupFrom }}</p>
              </div>
              <div>
                <span class="text-title">{{ $t('page.status') }}</span>
                <p class="text-default">{{ runnerData.status }}</p>
              </div>
            </div>
          </Poptip>
        </span>
      </div>
    </div>
    <NodeDetail
      v-if="runnerData"
      :jobData="jobData"
      :phaseData="phaseData"
      :runnerData="runnerData"
      :nodeData="nodeData"
      @runnerAction="runnerAction"
    ></NodeDetail>
    <RefirePhaseDialog
      v-if="isRefireDialogShow"
      :phaseId="phaseData.id"
      :phaseName="phaseData.name"
      @close="closeRefireDialog"
    ></RefirePhaseDialog>
    <IgnorePhaseDialog
      v-if="isIgnorePhseeDialogShow"
      :jobId="jobData.id"
      :phaseId="phaseData.id"
      @close="closeIgnorePhaseDialog"
    ></IgnorePhaseDialog>
    <ResetRunnerDialog
      v-if="jobData && isResetDialogShow"
      :jobId="jobData.id"
      :phaseId="phaseData.id"
      @close="closeResetDialog"
    ></ResetRunnerDialog>
  </div>
  <NoData v-else></NoData>
</template>
<script>
export default {
  name: '',
  components: {
    NodeDetail: () => import('./node/node-detail.vue'),
    RefirePhaseDialog: () => import('../refire-phase-dialog.vue'),
    IgnorePhaseDialog: () => import('./ignore-phase-dialog.vue'),
    ResetRunnerDialog: () => import('../reset-runner-dialog.vue')
  },
  filters: {},
  props: {
    jobData: { type: Object },
    phaseData: { type: Object }
  },
  data() {
    return {
      isResetDialogShow: false,
      runnerData: null,
      nodeData: {},
      isRefireDialogShow: false,
      isIgnorePhseeDialogShow: false,
      phaseEndingStatusList: ['completed', 'aborted', 'ignored', 'failed']
    };
  },
  beforeCreate() {},
  created() {
    this.getRunner();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.timmer) {
      clearTimeout(this.timmer);
      this.timmer = null;
    }
  },
  destroyed() {},
  methods: {
    closeResetDialog(needRefresh) {
      this.isResetDialogShow = false;
      if (needRefresh) {
        this.$emit('refresh');
      }
    },
    refirePhase() {
      if (this.phaseData.status == 'running') {
        //阶段状态判断:运行中状态：不可点击;其他状态，可以点击
        return false;
      }
      this.isRefireDialogShow = true;
    },
    closeRefireDialog(needRefresh) {
      this.isRefireDialogShow = false;
      if (needRefresh) {
        this.$emit('refresh');
      }
    },
    closeIgnorePhaseDialog(needRefresh) {
      if (needRefresh) {
        this.$emit('refresh');
      }
      this.isIgnorePhseeDialogShow = false;
    },
    resetAllNode() {
      if (this.phaseData.status == 'running') { //阶段状态判断:运行中状态：不可点击;其他状态，可以点击
        return false;
      }
      this.isResetDialogShow = true;
    },
    getRunner() {
      let params = {
        jobId: this.jobData.id,
        jobPhaseId: this.phaseData.id
      };
      this.$api.autoexec.job.getRunnerByPhase(params).then(res => {
        if (res.Return.runnerVo) {
          this.runnerData = {};
          this.runnerData.name = res.Return.runnerVo.name;
          this.runnerData.port = res.Return.runnerVo.host + ':' + res.Return.runnerVo.port;
          this.runnerData.phaseRunnerGroupFrom = res.Return.phaseRunnerGroupFrom;
          this.runnerData.status = res.Return.runnerVo.status;
          this.nodeData.status = res.Return.status;
          this.nodeData.warnCount = res.Return.warnCount;
          if (res.Return.status == 'pending' || res.Return.status == 'running' || res.Return.status == 'waitInput') {
            this.timmer = setTimeout(() => {
              this.getRunner();
            }, 3000);
          }
          if (this.phaseEndingStatusList.includes(res.Return.status)) {
            if (this.timmer) {
              clearTimeout(this.timmer);
              this.timmer = null;
            }
          }
        }
        this.$set(this.nodeData, 'id', res.Return.id);
      });
    },
    ignorePhase() {
      if (this.phaseData.status == 'running' || this.phaseData.status == 'completed' || this.phaseData.status == 'ignored') {
        //阶段状态判断:进行中、已成功和已忽略状态：不可点击;其他状态，可以点击
        return false;
      }
      this.isIgnorePhseeDialogShow = true;
    },
    runnerAction(action) {
      switch (action) {
        case 'refire':
          this.refirePhase();
          break;
        case 'reset':
          this.resetAllNode();
          break;
        case 'ignore':
          this.ignorePhase();
          break;
        case 'refresh':
          this.$emit('refresh');
          break;
      }
    }
  },
  computed: {},
  watch: {
    /**
     * 本地runner没有nodeData，nodeData是虚构出来的
     * 为了后面查看日志的方法一致，当阶段状态更新后，把状态更新到nodeData中，其他依赖nodeData的插件才能正常工作
     **/
    // 'phaseData.status': {
    //   handler: function(val) {
    //     console.log(val);
    //     this.$set(this.nodeData, 'status', val);
    //   },
    //   deep: true,
    //   immediate: true
    // }
  }
};
</script>
<style lang="less" scoped>
.runner-content {
  position: relative;
  padding-top: 4px;
  .runner-action {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
  }
}
</style>
