<template>
  <div class="contain">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="box-block">
      <Divider orientation="start">{{ $t('page.scene') }}</Divider>
      <div class="li-box">
        <Row :gutter="16">
          <Col
            v-for="(item,index) in initData.scenarioList"
            :key="index"
            :xs="12"
            :sm="8"
            :md="6"
            :lg="4"
            :xl="3"
            :xxl="2"
          >
            <div
              v-if="item.isEnable"
              class="li-item text-action"
              :class="scenarioId == item.scenarioId?'li-active li-text border-primary':'border-base bg-op'"
              @click="changeSelect('scenario',item)"
            >{{ item.scenarioName }}</div>
            <Tooltip
              v-else
              placement="top"
              max-width="400"
              theme="light"
              transfer
              class="tooltips-box"
            >
              <div :class="scenarioId == item.scenarioId?'li-active li-text border-primary':'border-base bg-op'" class="width-box li-item text-disabled">{{ item.scenarioName }}</div>
              <div slot="content">
                <div>{{ $t('term.deploy.notsceneauth', {target: item.scenarioName}) }}</div>
              </div>
            </Tooltip>
          </Col>
        </Row>
      </div>
    </div>
    <div class="box-block">
      <Divider orientation="start">{{ $t('page.environment') }}</Divider>
      <div class="li-box">
        <Row :gutter="16">
          <Col
            v-for="(item,index) in initData.envList"
            :key="index"
            :xs="12"
            :sm="8"
            :md="6"
            :lg="4"
            :xl="3"
            :xxl="2"
          >
            <div
              v-if="item.isEnable"
              class="li-item text-action"
              :class="envId == item.id?'li-active li-text border-primary':'border-base bg-op'"
              @click="changeSelect('env',item)"
            >{{ item.name }}</div>
            <Tooltip
              v-else
              placement="top"
              max-width="400"
              theme="light"
              transfer
              class="tooltips-box"
            >
              <div :class="envId == item.id?'li-active li-text border-primary':'border-base bg-op'" class="width-box li-item text-disabled">{{ item.name }}</div>
              <div slot="content">
                <div>{{ $t('term.deploy.notenvauth', {target: item.name}) }}</div>
              </div>
            </Tooltip>
          </Col>
        </Row>
      </div>
    </div>
    <!-- 模块 -->
    <div class="box-block">
      <Divider orientation="start">{{ $t('page.module') }}</Divider>
      <ModuleList
        ref="moduleList"
        :appSystemId="baseParams.appSystemId"
        :envId="envId"
        :envName="envName"
        :appModuleList="appModuleList"
        :loading="appModuleLoading"
        :disabled="disabled"
        @updateSelectModuleList="updateSelectModuleList"
      ></ModuleList>
    </div>
    <div id="roundCount" class="box-block">
      <Divider orientation="start">{{ $t('page.autoexecparallel') }}</Divider>
      <TsFormItem
        :label="$t('page.autoexecparallpolicy')"
        :labelWidth="100"
        labelPosition="left"
        :required="true"
      >
        <TsFormRadio
          v-model="parallelPolicy"
          :dataList="parallelPolicyDataList"
          @on-change="changeParallelPolicy"
        ></TsFormRadio>
      </TsFormItem>
      <div v-if="parallelPolicy === 'roundCount'">
        <TsFormItem
          :label="$t('term.autoexec.batchquantity')"
          :labelWidth="100"
          labelPosition="left"
          :required="true"
        >
          <TsFormSelect
            ref="roundCountForm"
            v-model="roundCount"
            v-bind="roundCountForm"
            :disabled="disabled"
          ></TsFormSelect>
        </TsFormItem>
      </div>
      <div v-else>
        <TsFormItem
          :label="$t('term.autoexec.parall')"
          :labelWidth="100"
          labelPosition="left"
          :required="true"
        >
          <TsFormSelect
            ref="parallelForm"
            v-model="parallelCount"
            v-bind="parallelForm"
          ></TsFormSelect>
        </TsFormItem>
      </div>
    </div>
    <div id="param" class="box-block">
      <Divider orientation="start">{{ $t('term.autoexec.jobparam') }}</Divider>
      <div>
        <SetParam
          ref="param"
          :paramList="runtimeParamList"
          :phaseList="combopPhaseList"
          :param="param"
          :disabled="disabled"
        ></SetParam>
      </div>
    </div>
    <!-- 流水线 -->
    <PhaseList
      v-if="selectModuleList.length"
      :appSystemId="baseParams.appSystemId"
      :envId="envId"
      :moduleList="selectModuleList"
      :combopPhaseNameList="combopPhaseNameList"
    ></PhaseList>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    ModuleList: () => import('@/views/pages/deploy/job/publishing/module-list'),
    SetParam: () => import('@/views/pages/autoexec/detail/runnerDetail/param.vue'),
    PhaseList: () => import('@/views/pages/deploy/job/publishing/phase-list'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
  },
  props: {
    baseParams: Object,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loadingShow: true,
      searchParams: {},
      initData: {},
      appModuleList: [],
      scenarioId: null,
      combopPhaseNameList: [],
      envId: null,
      envName: '',
      appModuleLoading: true,
      selectModuleList: [],
      roundCount: 2,
      roundCountForm: {
        placeholder: this.$t('page.selectinput'),
        border: 'border',
        dataList: this.getRoundCountList(),
        filterName: 'text',
        // allowCreate: true,
        search: true,
        transfer: true,
        desc: this.$t('term.autoexec.roundcountdescrition'),
        validateList: ['required', 'maxNum']
      },
      runtimeParamList: [], //作业参数
      combopPhaseList: [],
      param: {},
      defaultModuleList: [], //模块默认值
      moduleEnvInstanceMap: {},
      parallelForm: {
        placeholder: this.$t('page.selectinput'),
        border: 'border',
        dataList: this.getRoundCountList(),
        filterName: 'text',
        search: true,
        transfer: true,
        desc: this.$t('term.autoexec.paralldesc'),
        validateList: ['required', 'maxNum']
      },
      parallelPolicyDataList: [
        {
          text: this.$t('page.autoexecparall'),
          value: 'parallel'
        },
        {
          text: this.$t('page.autoexecbatchround'),
          value: 'roundCount'
        }
      ],
      parallelPolicy: 'roundCount',
      parallelCount: 4
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async init() {
      this.getCreateJobData();
      this.getAppPipeline();
      this.loadingShow = false;
    },
    initJobParams(data) {
      this.envId = data.envId || null;
      this.scenarioId = data.scenarioId || null;
      this.parallelPolicy = data.parallelPolicy || 'roundCount';
      this.param = data.param || {};
      this.defaultModuleList = data.moduleList || [];
      this.roundCount = null;
      this.parallelCount = null;
      if (!this.$utils.isEmpty(data.roundCount)) {
        this.roundCount = data.roundCount;
      }
      if (!this.$utils.isEmpty(this.parallelCount)) {
        this.parallelCount = data.parallelCount;
      }
    },
    getAppPipeline() { //流水线
      this.$api.deploy.apppipeline.getAppPipeline(this.searchParams).then(res => {
        if (res && res.Status == 'OK') {
          let data = res.Return || {};
          if (data.config) {
            this.runtimeParamList = data.config.runtimeParamList || [];
            this.combopPhaseList = data.config.combopPhaseList || [];
          }
        }
      });
    },
    getCreateJobData() { //发布作业
      this.$api.deploy.job.getCreateJobData(this.searchParams).then(res => {
        if (res.Status == 'OK') {
          this.initData = res.Return || {};
          this.appModuleList = this.initData.appModuleList || [];
          if (this.scenarioId) {
            let scenario = this.initData.scenarioList.find(e => e.scenarioId == this.scenarioId);
            if (scenario) {
              this.combopPhaseNameList = scenario.combopPhaseNameList;
            }
          } else {
            this.scenarioId = this.initData.defaultSelectScenario.scenarioId;
            this.combopPhaseNameList = this.initData.defaultSelectScenario.combopPhaseNameList;
          }
          if (this.envId) {
            let env = this.initData.envList.find(e => e.id == this.envId);
            if (env) {
              this.envName = env.name;
            }
          } else {
            this.envId = this.initData.defaultSelectEnv.id;
            this.envName = this.initData.defaultSelectEnv.name;
          }
          this.getJobModuleList();
        }
      });
    },
    getJobModuleList(type) {
      let data = {
        appSystemId: this.searchParams.appSystemId,
        envId: this.envId,
        scenarioId: this.scenarioId
      };
      this.$api.deploy.job.getJobModuleList(data).then(res => {
        if (res && res.Status == 'OK') {
          let moduleList = res.Return || [];
          this.appModuleList.forEach(item => {
            let findItem = moduleList.find(m => m.id == item.id);
            if (findItem) {
              this.$set(item, 'canSelectModule', true); //标识可选择的模块
              this.$set(item, 'isHasBuildTypeTool', findItem.isHasBuildTypeTool);
              this.$set(item, 'isHasDeployTypeTool', findItem.isHasDeployTypeTool);
              this.$set(item, 'disableInstanceFilter', false);
              //模块未配置runner组，需要添加
              this.$set(item, 'isHasRunner', findItem.isHasRunner);
              if (findItem.isHasRunner) {
                this.$set(item, 'isChecked', true);
                this.$set(item, 'isSelectInstance', false);
                this.$set(item, 'disabled', false);
              } else {
                this.$set(item, 'isChecked', false);
                this.$set(item, 'disabled', true);
              }
            } else {
              this.$set(item, 'isChecked', false);
              this.$set(item, 'disabled', true);
              this.$set(item, 'disableInstanceFilter', true);
            }
          });
          //编辑定时作业
          if (!type && this.defaultModuleList.length > 0) {
            this.appModuleList.forEach(item => {
              let findItem = this.defaultModuleList.find(m => m.id == item.id);
              if (findItem) {
                findItem.version && this.$set(item, 'version', findItem.version);
                findItem.buildNo && this.$set(item, 'buildNo', findItem.buildNo);
                if (findItem.selectNodeList && findItem.selectNodeList.length) {
                  this.$set(item, 'instanceList', findItem.selectNodeList);
                  this.$set(item, 'isSelectInstance', true);
                  this.$set(item, 'isChecked', true);
                }
              }
            });
          }
          if (type === 'env') { //环境改变时，实例改变
            this.appModuleList.forEach(item => {
              const key = 'app_' + item.id + '_' + this.envId;
              this.$set(item, 'isSelectInstance', false);
              if (this.moduleEnvInstanceMap[key] && !this.$utils.isEmpty(this.moduleEnvInstanceMap[key])) {
                this.$set(item, 'loadingShow', true);
                this.$set(item, 'instanceList', this.moduleEnvInstanceMap[key]);
                this.$nextTick(() => {
                  this.$set(item, 'isSelectInstance', true);
                });
              } else {
                this.$set(item, 'instanceList', []);
              }
            });
          }

          //编辑定时作业end
          this.updateSelectModuleList(this.appModuleList);
        }
      }).finally(() => {
        this.appModuleLoading = false;
      });
    },
    updateSelectModuleList(list) {
      this.selectModuleList = list.filter(m => {
        return m.isChecked;
      });
    },
    changeSelect(type, item) {
      if (this.disabled) {
        return;
      }
      if (type == 'scenario') {
        this.scenarioId = item.scenarioId;
        this.combopPhaseNameList = item.combopPhaseNameList;
      } else if (type == 'env') {
        this.getModuleEnvInstanceMap(this.envId);
        this.envId = item.id;
        this.envName = item.name;
      }
      this.getJobModuleList(type);
    },
    getModuleEnvInstanceMap(envId) {
      this.appModuleList.forEach(item => {
        this.appModuleList.forEach(item => {
          const key = 'app_' + item.id + '_' + envId;
          if (item.isSelectInstance) {
            this.$set(this.moduleEnvInstanceMap, key, item.instanceList || []);
          } else {
            this.$set(this.moduleEnvInstanceMap, key, []);
          }
        });
      });
    },
    valid() {
      let validList = [];
      if (!this.envId) { //没有权限时不能选择环境
        validList.push({
          text: this.$t('term.deploy.noselecttarget', {target: this.$t('page.environment')}),
          type: 'error',
          id: '#env'
        });
      }
      if (!this.scenarioId) { //没有权限时不能选择场景
        validList.push({
          text: this.$t('term.deploy.noselecttarget', {target: this.$t('page.scene')}),
          type: 'error',
          id: '#scenario'
        });
      }
      if (this.$refs.moduleList && this.$refs.moduleList.valid().length) {
        let moduleValidList = this.$refs.moduleList.valid();
        validList.push(...moduleValidList);
      }
      if (this.$refs.roundCountForm) {
        if (!this.$refs.roundCountForm.valid()) {
          validList.push({
            text: this.$t('term.deploy.roundcountvalidate'),
            type: 'error',
            id: '#roundCount'
          });
        }
      }
      if (this.$refs.parallelForm) {
        if (!this.$refs.parallelForm.valid()) {
          validList.push({
            text: this.$t('term.deploy.roundcountvalidate'),
            type: 'error',
            id: '#roundCount'
          });
        }
      }
      if (this.$refs.param) {
        if (!this.$refs.param.valid()) {
          validList.push({
            text: this.$t('term.deploy.jobparamvalid'),
            type: 'error',
            id: '#param'
          });
        }
      }
      return validList;
    },
    saveJobData() {
      let data = {
        envId: this.envId,
        scenarioId: this.scenarioId,
        parallelPolicy: this.parallelPolicy,
        param: {},
        moduleList: this.$refs.moduleList.getData()
      };
      if (this.parallelPolicy == 'parallel') {
        this.$set(data, 'parallelCount', !this.$utils.isEmpty(this.parallelCount) ? this.parallelCount : 32);
      } else {
        this.$set(data, 'roundCount', !this.$utils.isEmpty(this.roundCount) ? this.roundCount : 64);
      }
      if (this.$refs.param) {
        this.$set(data, 'param', this.$refs.param.getValue());
      }
      return data;
    },
    getRoundCountList() {
      let list = [
        {
          value: -1,
          text: '蓝绿执行'
        }
      ];
      list.push(...this.$utils.getRoundCountList());
      return list;
    },
    changeParallelPolicy(val) {
      if (val && val == 'roundCount') {
        if (this.$utils.isEmpty(this.roundCount)) {
          this.roundCount = 64;
        }
      } else {
        if (this.$utils.isEmpty(this.parallelCount)) {
          this.parallelCount = 32;
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    baseParams: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          let searchParams = {
            appSystemId: val.appSystemId,
            appModuleId: val.appModuleId
          };
          if (!this.$utils.isEmpty(val.config)) {
            this.initJobParams(val.config);
          }
          if (!this.$utils.isSame(searchParams, this.searchParams)) {
            this.searchParams = searchParams;
            this.init();
          }
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.publishing-main{
  position: relative;
}
.contain {
  position: relative;
  padding: 0 16px;
  .box-block {
    padding-bottom: 22px;
    .li-box {
      margin-bottom: -10px;
      .li-item {
        padding: 6px 16px;
        border-radius: 4px;
        text-align: center;
        margin-bottom: 10px;
      }
    }
  }
  ::v-deep .ivu-form-item {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  .tooltips-box {
    width: 100%;
    ::v-deep &.ivu-tooltip {
      width: 100%;
    }
    ::v-deep .ivu-tooltip-rel {
      width: 100%;
    }
    .width-box {
      width: 100%;
    }
  }
}
</style>
