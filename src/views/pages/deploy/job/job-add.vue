<template>
  <div class="publishing-main">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain v-if="initData">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>{{ initData.appSystemAbbrName }}</template>
      <template v-slot:topRight>
        <div class="">
          <Button
            type="primary"
            ghost
            class="mr-nm"
            :disabled="disabledBtn"
            @click="saveSetting('save')"
          >{{ $t('button.save') }}</Button>
          <Button type="primary" :disabled="disabledBtn" @click="saveSetting('execute')">{{ $t('term.autoexec.immediateexecution') }}</Button>
        </div>
      </template>
      <template v-slot:content>
        <div class="contain">
          <div v-if="initData.scenarioList && initData.scenarioList.length > 0" id="scenario" class="box-block">
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
                    v-if="hasScenarioAuth(item.scenarioId)"
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
                    <div class="width-box li-item text-action text-disabled border-base bg-op">{{ item.scenarioName }}</div>
                    <div slot="content">
                      <div>{{ $t('term.deploy.notsceneauth', {target: item.scenarioName}) }}</div>
                    </div>
                  </Tooltip>
                </Col>
              </Row>
            </div>
          </div>
          <div v-if="initData.envList && initData.envList.length" id="env" class="box-block">
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
                    v-if="hasEnvAuth(item.id)"
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
                    <div class="width-box li-item text-action text-disabled border-base bg-op">{{ item.name }}</div>
                    <div slot="content">
                      <div>{{ $t('term.deploy.notenvauth', {target: item.name}) }}</div>
                    </div>
                  </Tooltip>
                </Col>
              </Row>
            </div>
          </div>
          <!-- ?????? -->
          <div v-if="envId" class="box-block">
            <Divider orientation="start">{{ $t('page.module') }}</Divider>
            <ModuleList
              ref="moduleList"
              :appSystemId="appSystemId"
              :envId="envId"
              :envName="envName"
              :appModuleList="appModuleList"
              :loading="appModuleLoading"
              @updateSelectModuleList="updateSelectModuleList"
            ></ModuleList>
          </div>
          <div id="roundCount" class="box-block">
            <Divider orientation="start">{{ $t('term.autoexec.batchsetting') }}</Divider>
            <div>
              <TsFormItem
                label="????????????"
                :labelWidth="100"
                labelPosition="left"
                :required="true"
              >
                <TsFormSelect
                  v-model="roundCount"
                  v-bind="roundCountForm"
                ></TsFormSelect>
              </TsFormItem>
            </div>
          </div>
          <div v-if="runtimeParamList && runtimeParamList.length > 0" id="param" class="box-block">
            <Divider orientation="start">{{ $t('term.autoexec.jobparam') }}</Divider>
            <div>
              <SetParam
                ref="param"
                :param="paramValue"
                :paramList="runtimeParamList"
                :phaseList="combopPhaseList"
              ></SetParam>
            </div>
          </div>
          <!-- ????????? -->
          <PhaseList
            v-if="selectModuleList.length"
            :appSystemId="appSystemId"
            :moduleList="selectModuleList"
            :combopPhaseNameList="combopPhaseNameList"
          ></PhaseList>
        </div>
      </template>
    </TsContain>
    <!--?????? -->
    <PublishingValid v-model="isShowValidDialog" :validList="validList" @jumpToItem="jumpToItem"></PublishingValid>
    <!-- ?????? -->
    <SaveSetting v-if="isSaveDialog" v-model="isSaveDialog" @on-ok="okSave"></SaveSetting>
    <ResultDialog v-if="isShowResultDialog" :resultList="resultList" @close="isShowResultDialog=false"></ResultDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    ModuleList: resolve => require(['./publishing/module-list'], resolve),
    SetParam: resolve => require(['@/views/pages/autoexec/detail/runnerDetail/param.vue'], resolve),
    SaveSetting: resolve => require(['@/views/pages/autoexec/detail/runnerDetail/save-setting.vue'], resolve),
    ResultDialog: resolve => require(['./publishing/result-dialog'], resolve),
    PublishingValid: resolve => require(['./publishing/publishing-valid'], resolve),
    PhaseList: resolve => require(['./publishing/phase-list'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      appSystemId: null,
      appModuleId: null,
      searchParams: {},
      initData: null,
      scenarioId: null, //??????id
      envId: null,
      envName: '',
      appModuleList: [],
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
        validateList: ['required', 'maxNum']
      },
      runtimeParamList: [], //????????????
      combopPhaseList: [],
      isSaveDialog: false,
      isShowResultDialog: false,
      resultList: [], //?????????????????????
      validList: [], //??????
      isShowValidDialog: false,
      combopPhaseNameList: [], //?????????????????????????????????
      selectModuleList: [], //?????????????????????
      authInfo: null, // ???????????????+?????????????????????????????????
      authList: [], // ????????????
      appModuleLoading: true,
      disabledBtn: true,
      jobId: null, //??????id
      jobConfig: {},
      paramValue: {}
    };
  },
  beforeCreate() {},
  async created() {
    let query = this.$route.query || '';
    if (query && query.appSystemId) {
      this.appSystemId = parseInt(query.appSystemId);
      this.$set(this.searchParams, 'appSystemId', this.appSystemId);
    }
    if (query && query.appModuleId) {
      this.appModuleId = parseInt(query.appModuleId);
      this.$set(this.searchParams, 'appModuleId', this.appModuleId);
    }
    if (this.$route.query.jobId) {
      this.jobId = parseInt(this.$route.query.jobId);
      await this.getJobData();
    }
    this.getInitData();
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
    async getInitData() {
      await this.getAuthInfo({
        appSystemIdList: this.appSystemId ? [parseInt(this.appSystemId)] : [],
        appModuleIdList: this.appModuleId ? [parseInt(this.appModuleId)] : []
      });
      this.getCreateJobData();
      this.getAppPipeline();
    },
    async getAuthInfo(params) {
      // ?????????????????????????????????
      await this.$api.deploy.applicationConfig.searchAppSystemList({...params, authorityActionList: ['view']}).then(res => {
        if (res && res.Status == 'OK') {
          this.authInfo = res.Return && res.Return.tbodyList.length > 0 ? res.Return.tbodyList[0] : null;
          this.authList = (res.Return && res.Return.tbodyList.length > 0 && res.Return.tbodyList[0].authActionSet) ? res.Return.tbodyList[0].authActionSet : [];
        }
      });
    },
    getCreateJobData() { //????????????
      this.$api.deploy.job.getCreateJobData(this.searchParams).then((res) => {
        if (res.Status == 'OK') {
          this.initData = res.Return || {};
          this.appModuleList = this.initData.appModuleList || [];
          if (this.initData.scenarioList && this.initData.scenarioList.length) {
            let scenarioIndex = this.initData.scenarioList.findIndex((item) => {
              return this.authList.includes('scenario#' + item.scenarioId);
            });
            if (scenarioIndex != -1) {
              // ?????????????????????????????????????????????????????????????????????
              if (this.initData.defaultScenarioId && this.authList.includes('scenario#' + this.initData.defaultScenarioId)) {
                this.scenarioId = this.initData.defaultScenarioId;
                let findScenario = this.initData.scenarioList.find(item => item.scenarioId == this.scenarioId);
                if (findScenario) {
                  this.combopPhaseNameList = findScenario.combopPhaseNameList;
                }
              } else {
                this.scenarioId = this.initData.scenarioList[scenarioIndex].scenarioId;
                this.combopPhaseNameList = this.initData.scenarioList[scenarioIndex].combopPhaseNameList;
              }
            } else if (this.initData.defaultScenarioId) {
              this.scenarioId = this.initData.defaultScenarioId;
              let findScenario = this.initData.scenarioList.find(item => item.scenarioId == this.scenarioId);
              if (findScenario) {
                this.combopPhaseNameList = findScenario.combopPhaseNameList;
              }
            } else {
              this.scenarioId = this.initData.scenarioList[0].scenarioId;
              this.combopPhaseNameList = this.initData.scenarioList[0].combopPhaseNameList;
            }
          }
          if (this.initData.envList && this.initData.envList.length) {
            let envIndex = this.initData.envList.findIndex((item) => {
              return this.authList.includes('env#' + item.id);
            });
            if (envIndex != -1) {
              // ???????????????????????????????????????????????????????????????
              this.envId = this.initData.envList[envIndex].id;
              this.envName = this.initData.envList[envIndex].name;
            } else {
              this.envId = this.initData.envList[0].id;
              this.envName = this.initData.envList[0].name;
            }
          }
          if (this.jobId) {
            this.initJobData();
          }
          this.getJobModuleList();
        }
      })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    getJobModuleList() {
      let data = {
        appSystemId: this.appSystemId,
        envId: this.envId,
        scenarioId: this.scenarioId
      };
      this.$api.deploy.job.getJobModuleList(data).then(res => {
        if (res && res.Status == 'OK') {
          let moduleList = res.Return || [];
          this.appModuleList.forEach(item => {
            let findItem = moduleList.find(m => m.id == item.id);
            if (findItem) {
              this.$set(item, 'canSelectModule', true); //????????????????????????
              this.$set(item, 'isHasBuildTypeTool', findItem.isHasBuildTypeTool);
              this.$set(item, 'isHasDeployTypeTool', findItem.isHasDeployTypeTool);
              this.$set(item, 'disableInstanceFilter', false);
              //???????????????runner??????????????????
              this.$set(item, 'isHasRunner', findItem.isHasRunner);
              if (findItem.isHasRunner) {
                this.$set(item, 'isChecked', true);
                this.$set(item, 'isSelectInstance', false);
                this.$set(item, 'disabled', false);
                if (this.jobId) {
                  let moduleItem = this.jobConfig.moduleList.find(i => i.id == item.id);
                  if (moduleItem) {
                    this.$set(item, 'isChecked', true);
                    if (!this.$utils.isEmpty(moduleItem.selectNodeList)) {
                      this.$set(item, 'isSelectInstance', true);
                    }
                  } else {
                    this.$set(item, 'isChecked', false);
                  }
                }
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
          this.updateSelectModuleList(this.appModuleList);
          this.disabledBtn = false;
        }
      }).finally(() => {
        this.appModuleLoading = false;
      });
    },
    getAppPipeline() { //?????????
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
    changeSelect(type, item) {
      if (type == 'scenario') {
        this.scenarioId = item.scenarioId;
        this.combopPhaseNameList = item.combopPhaseNameList;
      } else if (type == 'env') {
        this.envId = item.id;
        this.envName = item.name;
      }
      this.disabledBtn = true;
      this.getJobModuleList();
    },
    saveJobData() {
      let data = {
        appSystemId: this.appSystemId,
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
    },
    validFn() {
      this.validList = [];
      let isValid = true;
      if (!this.envId) { //?????????????????????????????????
        this.validList.push({
          text: this.$t('term.deploy.noselecttarget', {target: this.$t('page.environment')}),
          type: 'error',
          id: '#env'
        });
      }
      if (!this.scenarioId) { //?????????????????????????????????
        this.validList.push({
          text: this.$t('term.deploy.noselecttarget', {target: this.$t('page.scene')}),
          type: 'error',
          id: '#scenario'
        });
      }
      if (this.$refs.moduleList && this.$refs.moduleList.valid().length) {
        isValid = false;
        let moduleValidList = this.$refs.moduleList.valid();
        this.validList.push(...moduleValidList);
      }
      if (this.$refs.roundCountForm) {
        isValid = this.$refs.roundCountForm.valid() && isValid;
        if (!this.$refs.roundCountForm.valid()) {
          this.validList.push({
            text: this.$t('term.deploy.roundcountvalidate'),
            type: 'error',
            id: '#roundCount'
          });
        }
      }
      if (this.$refs.param) {
        isValid = this.$refs.param.valid() && isValid;
        if (!this.$refs.param.valid()) {
          this.validList.push({
            text: this.$t('term.deploy.jobparamvalid'),
            type: 'error',
            id: '#param'
          });
        }
      }
      return isValid;
    },
    saveSetting(type) {
      let isValid = this.validFn();
      if (!isValid) {
        this.isShowValidDialog = true;
        return false;
      }
      if (type == 'execute') {
        this.executeAction();
      } else if (type == 'save') {
        this.isSaveDialog = true;
      }
    },
    executeAction() {
      //??????
      let data = this.saveJobData();
      this.$api.deploy.job.createDeployJob(data).then(res => {
        if (res.Status == 'OK') {
          this.openResultDialog(res.Return);
        }
      });
    },
    okSave(val) { //??????
      let data = Object.assign(val, this.saveJobData());
      this.$api.deploy.job.createDeployJob(data).then(res => {
        if (res.Status == 'OK') {
          this.openResultDialog(res.Return);
        }
      });
    },
    openResultDialog(list) {
      if (list && list.length) {
        this.resultList = list;
        if (list.length == 1 && list[0].jobId) {
          this.$router.push({
            path: '/job-detail',
            query: {id: list[0].jobId}
          });
        } else {
          this.isShowResultDialog = true;
        }
      } else {
        this.$Notice.error({ title: this.$t('term.deploy.moduleaddjobfail', {target: ''}) });
      }
    },
    jumpToItem(obj) { //???????????????????????????
      this.$utils.jumpTo(obj.id);
    },
    updateSelectModuleList(list) {
      this.selectModuleList = list.filter(m => {
        return m.isChecked;
      });
    },
    getJobData() { //???????????????????????????
      if (!this.jobId) {
        return;
      }
      return this.$api.autoexec.job.getCreateJobData({ jobId: this.jobId}).then(res => {
        if (res.Status == 'OK') {
          this.jobConfig = res.Return || {};
          this.appSystemId = this.jobConfig.appSystemId;
          this.$set(this.searchParams, 'appSystemId', this.jobConfig.appSystemId);
        }
      });
    },
    initJobData() { //??????????????????
      this.appModuleList.forEach(item => {
        let findItem = this.jobConfig.moduleList.find(i => i.id == item.id);
        if (findItem) {
          item = Object.assign(item, findItem);
        } else {
          this.$set(item, 'isChecked', false);
          this.$set(item, 'disableInstanceFilter', true);
        }
      });
      this.jobConfig.roundCount && (this.roundCount = this.jobConfig.roundCount);
      this.paramValue = this.jobConfig.param || {};
      if (this.jobConfig.scenarioId) {
        let scenarioIndex = this.initData.scenarioList.findIndex((item) => {
          return item.scenarioId == this.jobConfig.scenarioId;
        });
        if (scenarioIndex != -1) { 
          if (this.authList.includes('scenario#' + this.jobConfig.scenarioId) || this.authList.includes('scenario#all') || this.authInfo.isHasAllAuthority || !this.authInfo.isConfigAuthority) {
            this.scenarioId = this.jobConfig.scenarioId;
            this.combopPhaseNameList = this.initData.scenarioList[scenarioIndex].combopPhaseNameList;
          } 
        }
      }
      if (this.jobConfig.envId) {
        let envIndex = this.initData.envList.findIndex((item) => {
          return item.id == this.jobConfig.envId;
        });
        if (envIndex != -1) { 
          if (this.authList.includes('env#' + this.jobConfig.envId) || this.authList.includes('env#all') || this.authInfo.isHasAllAuthority || !this.authInfo.isConfigAuthority) {
            this.envId = this.jobConfig.envId;
            this.envName = this.initData.envList[envIndex].name;
          } 
        }
      }
    }
  },
  filter: {},
  computed: {
    hasScenarioAuth() {
      // ????????????
      return (scenarioId) => {
        if ((this.authInfo && (this.authInfo.isHasAllAuthority || !this.authInfo.isConfigAuthority)) || (scenarioId && this.authList.includes(`scenario#${scenarioId}`)) || this.authList.includes('scenario#all')) {
          return true;
        } 
        return false;
      };
    },
    hasEnvAuth() {
      // ????????????
      return (envId) => {
        if ((this.authInfo && (this.authInfo.isHasAllAuthority || !this.authInfo.isConfigAuthority)) || (envId && this.authList.includes(`env#${envId}`)) || this.authList.includes('env#all')) {
          return true;
        } 
        return false;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.divier {
  font-size: 13px;
}
.publishing-main{
  position: relative;
}
.contain {
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
