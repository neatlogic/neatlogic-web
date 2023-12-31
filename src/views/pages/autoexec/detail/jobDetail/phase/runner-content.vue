<template>
  <div v-if="jobData && phaseData" class="runner-content">
    <div v-if="runnerData" class="pl-nm pr-nm pt-nm text-right runner-action">
      <div class="action-group line">
        <span v-if="phaseData.warnCount > 0" class="action-item">
          <span>{{ $t('page.warningmessage') }}</span>
          <span class="text-warning pl-icon">{{ phaseData.warnCount }}</span>
        </span>
        <span
          v-if="jobData.isCanExecute"
          class="action-item tsfont-minus-o"
          :class="phaseData.status != 'failed' ? 'disable' : 'text-action'"
          @click="ignorePhase()"
        >{{ $t('page.ignore') }}
        </span>
        <span
          v-if="jobData.isCanExecute"
          class="action-item tsfont-run"
          :class="phaseData.status == 'running' ? 'disable' : 'text-action'"
          @click="refirePhase()"
        >{{ $t('page.execute') }}
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
            </div>
          </Poptip>
        </span>
      </div>
    </div>
    <NodeDetail
      :jobData="jobData"
      :phaseData="phaseData"
      :runnerData="runnerData"
      :nodeData="nodeData"
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
  </div>
  <NoData v-else></NoData>
</template>
<script>
export default {
  name: '',
  components: {
    NodeDetail: resolve => require(['./node/node-detail.vue'], resolve),
    RefirePhaseDialog: resolve => require(['../refire-phase-dialog.vue'], resolve),
    IgnorePhaseDialog: resolve => require(['./ignore-phase-dialog.vue'], resolve)
  },
  filters: {},
  props: {
    jobData: { type: Object },
    phaseData: { type: Object }
  },
  data() {
    return {
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
  beforeDestroy() {},
  destroyed() {},
  methods: {
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
          this.nodeData.warnCount = res.Return.warnCount;
        }
        this.$set(this.nodeData, 'id', res.Return.id);
      });
    },
    ignorePhase() {
      if (this.phaseData.status != 'failed') {
        //阶段状态判断:非失败状态：不可点击;其他状态，可以点击
        return false;
      }
      this.isIgnorePhseeDialogShow = true;
    }
  },
  computed: {},
  watch: {
    /**
     * 本地runner没有nodeData，nodeData是虚构出来的
     * 为了后面查看日志的方法一致，当阶段状态更新后，把状态更新到nodeData中，其他依赖nodeData的插件才能正常工作
     **/
    'phaseData.status': {
      handler: function(val) {
        this.$set(this.nodeData, 'status', val);
      },
      deep: true,
      immediate: true
    }
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
