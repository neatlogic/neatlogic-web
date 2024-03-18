
<template>
  <div class="content-main">
    <Tabs v-model="tabValue" class="tab-contain block-tabs2" :animated="false">
      <TabPane :label="$t('term.autoexec.standardoutput')" class="padding" name="standardOutput">
        <div style="display:grid;grid-template-columns:186px auto">
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
      <TabPane :label="$t('term.autoexec.runrecord')" class="padding" name="record">
        <Record v-if="tabValue == 'record'" :nodeData="nodeData" :phaseData="phaseData"></Record>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    SqlLog: resolve => require(['@/views/pages/autoexec/detail/logcomponents/sql-log.vue'], resolve),
    Record: resolve => require(['./node/record.vue'], resolve),
    SqlFileList: resolve => require(['./sqlfile-list.vue'], resolve)
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
      runnerData: null,
      nodeData: {},
      locationId: null //日志定位行id
    };
  },
  beforeCreate() {},
  created() {
    this.getRunner();
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
          this.runnerData.id = res.Return.runnerVo.id;
        }
        this.$set(this.nodeData, 'id', res.Return.id);
      });
    },
    refresh() {
      this.$emit('refresh');
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
</style>
