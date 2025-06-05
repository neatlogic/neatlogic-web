
<template>
  <div class="content-main sql-content">
    <span class="action-item runner-show pl-nm pr-nm pt-nm text-right">
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
    <Tabs v-model="tabValue" class="tab-contain block-tabs2" :animated="false">
      <TabPane :label="$t('term.autoexec.standardoutput')" name="standardOutput">
        <div v-if="jobData.isCanExecute" class="div-btn-contain action-group no-line pl-nm">
          <span class="action-item tsfont-restart" :class="phaseData.status == 'running'?'disable':''" @click="resetAllNode()">{{ $t('page.resetall') }}</span>
          <span class="action-item tsfont-run" :class="phaseData.status == 'running'?'disable':''" @click="refirePhase()">{{ $t('page.executeall') }}</span>
        </div>
        <div style="display:grid;grid-template-columns:186px auto;" class="padding">
          <div>
            <div v-if="operationList && operationList.length">
              <div
                v-for="(step, sindex) in operationList"
                :key="sindex"
                class="step-item radius-lg border-color bg-op mb-nm padding-sm cursor"
                :class="{ 'active block-primary': step.status == 'running', 'border-primary': locationId === step.name.replace(/\//, '_') + '_' + step.id }"
                @click="locate(step)"
              >
                <div style="white-space:nowrap" class="overflow">
                  <span class="stepIndex tips" :class="getStepIndexClass(step)" @click.stop></span>
                  <span class="stepName name" :class="{ 'text-primary': step.status == 'running' }" :title="step.name">{{ step.name || '-' }}</span>
                </div>
                <div v-if="step.description" class="stepType overflow">
                  <span class="text-tip fz10 tips" :title="step.description">{{ step.description }}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div v-if="runnerData">
              <SqlLog
                v-if="tabValue == 'standardOutput'"
                :jobData="jobData"
                :phaseData="phaseData"
                :runnerData="runnerData"
                :locationId="locationId"
                :isHasExtraInfo="!$utils.isEmptyObj(jobData.extraInfo)"
              ></SqlLog>
            </div>
          </div>
        </div>
      </TabPane>
      <TabPane :label="$t('term.autoexec.sqlmanifest')" name="sqlfileList">
        <SqlFileList
          :jobData="jobData"
          :phaseData="phaseData"
          :runnerData="runnerData"
          :isHasExtraInfo="!$utils.isEmptyObj(jobData.extraInfo)"
          @refresh="refresh"
        ></SqlFileList>
      </TabPane>
      <TabPane :label="$t('term.autoexec.runrecord')" name="record">
        <div v-if="jobData.isCanExecute && phaseData" class="div-btn-contain action-group no-line pl-nm">
          <span class="action-item tsfont-restart" :class="phaseData.status == 'running'?'disable':''" @click="resetAllNode()">{{ $t('page.resetall') }}</span>
          <span class="action-item tsfont-run" :class="phaseData.status == 'running'?'disable':''" @click="refirePhase()">{{ $t('page.executeall') }}</span>
        </div>
        <Record
          v-if="tabValue == 'record'"
          :nodeData="nodeData"
          :phaseData="phaseData"
          class="padding"
        ></Record>
      </TabPane>
    </Tabs>
    <ResetDialog
      v-if="actionParam && isResetDialogShow"
      :jobId="actionParam.jobId"
      :phaseId="actionParam.phaseId"
      :nodeList="actionParam.nodeList"
      :isAll="actionParam.isAll"
      @close="closeResetDialog"
    ></ResetDialog>
    <RefirePhaseDialog
      v-if="isRefireDialogShow"
      :phaseId="phaseData.id"
      :phaseName="phaseData.name"
      :execMode="phaseData.execMode"
      @close="closeRefireDialog"
    ></RefirePhaseDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    SqlLog: () => import('@/views/pages/autoexec/detail/logcomponents/sql-log.vue'),
    Record: () => import('./node/record.vue'),
    SqlFileList: () => import('./sqlfile-list.vue'),
    ResetDialog: () => import('../reset-dialog.vue'),
    RefirePhaseDialog: () => import('../refire-phase-dialog.vue')
  },
  filters: {},
  directives: {},
  props: {
    jobData: { type: Object }, //作业信息
    phaseData: { type: Object } //阶段信息
  },
  data() {
    return {
      operationList: [], //脚本步骤列表
      tabValue: 'sqlfileList',
      isRefireDialogShow: false,
      interact: null, //配置waitinput对应的值
      timmer: null,
      runnerData: {},
      nodeData: {},
      locationId: null, //日志定位行id
      isResetDialogShow: false,
      actionParam: {}
    };
  },
  beforeCreate() {},
  async created() {
    await this.getRunner();
    this.getOperationList();
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
    locate(operation) {
      if (this.locationId !== operation.name.replace(/\//, '_') + '_' + operation.id) {
        this.locationId = operation.name.replace(/\//, '_') + '_' + operation.id;
      } else {
        this.locationId = '';
      }
    },
    getOperationList() {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      let param = {
        jobPhaseId: this.phaseData.id,
        status: this.phaseData.status
      };
      this.$api.autoexec.job.getOperationList(param).then(res => {
        let data = res.Return;
        let isRefresh = data.isRefresh;
        this.$set(this, 'operationList', data.operationStatusList);
        if (isRefresh === 1) {
          this.timmer = setTimeout(() => {
            this.getOperationList();
          }, 3000);
        }
      });
    },
    async getRunner() {
      let params = {
        jobId: this.jobData.id,
        jobPhaseId: this.phaseData.id
      };
      await this.$api.autoexec.job.getRunnerByPhase(params).then(res => {
        if (res.Return.runnerVo) {
          this.runnerData = {};
          this.runnerData.name = res.Return.runnerVo.name;
          this.runnerData.port = res.Return.runnerVo.host + ':' + res.Return.runnerVo.port;
          this.runnerData.id = res.Return.runnerVo.id;
        }
        this.$set(this.nodeData, 'id', res.Return.id);
      });
    },
    refresh() {
      this.$emit('refresh');
    },
    resetAllNode() {
      if (this.phaseData.status == 'running') { //阶段状态判断:运行中状态：不可点击;其他状态，可以点击
        return false;
      }
      this.actionParam = {};
      this.actionParam.jobId = this.jobData.id;
      this.actionParam.phaseId = this.phaseData.id;
      this.actionParam.isAll = 1;
      this.isResetDialogShow = true;
    },
    closeResetDialog(needRefresh) {
      this.isResetDialogShow = false;
      if (needRefresh) {
        this.refresh();
      }
    },
    refirePhase() {
      if (this.phaseData.status == 'running') { //阶段状态判断:运行中状态：不可点击;其他状态，可以点击
        return false;
      }
      this.isRefireDialogShow = true;
    },
    closeRefireDialog(needRefresh) {
      this.isRefireDialogShow = false;
      if (needRefresh) {
        this.refresh();
      }
    }
  },
  computed: {
    getStepIndexClass() {
      return function(step) {
        let arr = [];
        if (step.status == 'succeed') {
          arr.push('tsfont-check-o text-success');
        } else if (step.status == 'running') {
          arr.push('tsfont-play-o text-primary');
        } else if (step.status == 'failed') {
          arr.push('tsfont-close-o text-danger');
        } else {
          arr.push('tsfont-sla text-grey');
        }
        return arr;
      };
    }
  },
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
.step-item {
  width: 170px;
  border-width: 1px;
  border-style: solid;
}
.sql-content {
  position: relative;
  padding-top: 4px;
}
.runner-show{
  z-index: 1;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
