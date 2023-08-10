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
      <Divider orientation="start">{{ $t('term.autoexec.batchsetting') }}</Divider>
      <div>
        <TsFormItem
          :label="$t('term.autoexec.batchquantity')"
          :labelWidth="100"
          labelPosition="left"
          :required="true"
        >
          <TsFormSelect
            v-model="roundCount"
            v-bind="roundCountForm"
            :disabled="disabled"
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
      :moduleList="selectModuleList"
      :combopPhaseNameList="combopPhaseNameList"
    ></PhaseList>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    ModuleList: resolve => require(['@/views/pages/deploy/job/publishing/module-list'], resolve),
    SetParam: resolve => require(['@/views/pages/autoexec/detail/runnerDetail/param.vue'], resolve),
    PhaseList: resolve => require(['@/views/pages/deploy/job/publishing/phase-list'], resolve)
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
        dataList: this.$utils.getRoundCountList(),
        filterName: 'text',
        allowCreate: true,
        search: true,
        transfer: true,
        desc: this.$t('term.autoexec.roundcountdescrition'),
        validateList: ['required', 'integer_p']
      },
      runtimeParamList: [], //作业参数
      combopPhaseList: [],
      param: {},
      defaultModuleList: [] //模块默认值
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
      this.roundCount = data.roundCount || null;
      this.param = data.param || {};
      this.defaultModuleList = data.moduleList || [];
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
    getJobModuleList() {
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
          if (this.defaultModuleList.length > 0) {
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
        this.envId = item.id;
        this.envName = item.name;
      }
      this.getJobModuleList();
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
        roundCount: this.roundCount,
        param: {},
        moduleList: this.$refs.moduleList.getData()
      };
      if (this.$refs.param) {
        this.$set(data, 'param', this.$refs.param.getValue());
      }
      return data;
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
  /deep/ .ivu-form-item {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  .tooltips-box {
    width: 100%;
    /deep/ &.ivu-tooltip {
      width: 100%;
    }
    /deep/ .ivu-tooltip-rel {
      width: 100%;
    }
    .width-box {
      width: 100%;
    }
  }
}
</style>
