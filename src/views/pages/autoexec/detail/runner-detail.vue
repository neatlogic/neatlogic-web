<template>
  <div class="runner-detail" :class="{'remove-tsform-header': id}">
    <Loading :loadingShow="loading" type="fix"></Loading>
    <TsContain
      v-if="dataConfig"
      ref="main"
      border="border"
      :mode="mode"
      @scroll="scroll"
    >
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/action-manage')">{{ $getFromPage('router.autoexec.combinationtool') }}</span>
      </template>
      <template v-slot:topLeft><span>{{ $t('term.autoexec.addjob') }}</span></template>
      <template v-if="!id" v-slot:topRight>
        <div class="div-btn-contain action-group" style="text-align: right;">
          <span v-if="source == 'human'" class="action-item">
            <Button
              type="primary"
              ghost
              icon="tsfont tsfont-save"
              @click="openSavesetting"
            >{{ $t('button.save') }}</Button>
          </span>
          <span class="action-item last">
            <Button
              type="primary"
              icon="tsfont tsfont-run"
              :disabled="(!dataConfig.isActive || !dataConfig.executable) && source == 'human'"
              @click="openExecuteSetting"
            >{{ $t('term.autoexec.immediateexecution') }}</Button>
          </span>
        </div>
      </template>
      <div slot="content" class="contain pl-nm pr-nm" :class="{'pt-xs':!id}">
        <div v-if="!id" class="box-block">
          <Divider orientation="start">{{ $t('term.autoexec.jobname') }}</Divider>
          <div>
            <TsForm ref="nameForm" v-bind="nameForm"></TsForm>
          </div>
        </div>
        <div v-if="scenarioList.length > 0" class="box-block">
          <Divider orientation="start">{{ $t('term.autoexec.scene') }}</Divider>
          <div>
            <TsFormRadio
              v-model="scenarioId"
              :dataList="scenarioList"
              valueName="scenarioId"
              textName="scenarioName"
              :isClearSameValue="true"
              @change="changeScenarioId"
            ></TsFormRadio>
          </div>
        </div>
        <div v-if="dataConfig.needRoundCount" class="box-block">
          <Divider orientation="start">{{ $t('term.autoexec.batchsetting') }}</Divider>
          <div>
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
              ></TsFormSelect>
            </TsFormItem>
          </div>
        </div>
        <template v-if="dataConfig.config && showExecuteData && showScenarioExecute">
          <div v-if="needExecuteNode" class="box-block">
            <Divider orientation="start">{{ $t('term.autoexec.executetarget') }}</Divider>
            <div>
              <AddTarget
                :id="actionId"
                ref="addTarget"
                :value="executeConfig ? executeConfig.executeNodeConfig:{}"
                :canEdit="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify == 'runtime':true"
                :type="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify: 'runtime'"
                :executeConfig="executeValue"
                :runtimeParamList="paramsList"
                :needBorder="needExecuteUser|| needProtocol"
                :filterSearchValue="filterSearchValue"
              ></AddTarget>
            </div>
          </div>
          <div v-if="needExecuteUser|| needProtocol" class="box-block">
            <Divider orientation="start">{{ $t('term.autoexec.executeaccount') }}</Divider>
            <div>
              <TsForm ref="executeForm" v-model="executeValue" v-bind="executeForm"></TsForm>
            </div>
          </div>
        </template>
        <div v-if="paramsList && paramsList.length > 0" class="box-block">
          <Divider orientation="start">{{ $t('term.autoexec.jobparam') }}</Divider>
          <div>
            <SetParam
              :id="actionId"
              ref="param"
              :isUseParam="true"
              :param="paramValue"
              :paramList="paramsList"
              :phaseList="stepList"
            ></SetParam>
          </div>
        </div>
        <div v-if="!loading" class="box-block">
          <Divider orientation="start">
            <span>{{ $t('term.autoexec.pipeline') }}</span>
            <i class="text-tip-active pr-sm" :class="isShowStepList? 'tsfont-up' : 'tsfont-down'" @click="isShowStepList=!isShowStepList"></i>
          </Divider>
          <div v-show="isShowStepList">
            <div class="content">
              <div class="left dividing-color">
                <StepList
                  :id="actionId"
                  v-model="currentStep"
                  :currentScriptLength="currentScriptLength"
                  :stepList="selectStepList"
                  :canEdit="false"
                  :scrollTop="scrollTop"
                  :execModeList="execModeList"
                  :isRunner="isRunner"
                ></StepList>
              </div>
              <div class="right" :class="{'pt-nm': id}">
                <div v-if="currentConfig">
                  <!-- ???????????? -->
                  <StepConfig
                    ref="stepConfig"
                    :currentStep="currentStep"
                    :config="currentConfig"
                    :paramList="paramsList"
                    :paramsTypeList="paramsTypeList"
                    :list="currentConfig.config.phaseOperationList"
                    :execModeList="execModeList"
                    :execMode="currentConfig.execMode"
                    :canEdit="false"
                    :prevStepList="getPrev(currentConfig, selectStepList)"
                    :isRunner="isRunner"
                  ></StepConfig>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TsContain>
    <NoData v-else-if="!loading"></NoData>
    <!-- ?????? -->
    <SaveSetting v-if="isSaveDialog" v-model="isSaveDialog" @on-ok="okSave"></SaveSetting>
  </div>
</template>
<script>
export default {
  name: '',
  provide() {
    return {
      getCombopConfig: this.combopConfig
    };
  },
  components: {
    AddTarget: resolve => require(['./runnerDetail/add-target.vue'], resolve),
    StepList: resolve => require(['./actionDetail/step/step-list.vue'], resolve),
    StepConfig: resolve => require(['./actionDetail/step/step-config.vue'], resolve),
    SetParam: resolve => require(['./runnerDetail/param.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    SaveSetting: resolve => require(['./runnerDetail/save-setting.vue'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  filters: {},
  props: {
    // ????????????id
    id: {
      type: [Number, String],
      default: null
    },
    config: {
      // ???????????????config: {
      //   params: Object,
      //   executeForm: Object
      // }
      type: Object,
      default: function() {
        return {};
      }
    },
    mode: { type: String, default: 'window' },
    isEdit: { //??????????????????????????????
      type: Boolean,
      default: false
    }
  },
  data() {
    let _this = this;
    return {
      actionId: null,
      versionId: null,
      source: 'human',
      showExecuteData: true, //???????????????????????????????????????
      paramsList: [],
      dataConfig: null,
      currentStep: null, //????????????????????????
      currentConfig: {}, //???????????????????????????config??????
      stepList: [], //????????????
      currentScriptLength: 0, //???????????????????????????????????????
      loading: true,
      isRunner: true, //?????????????????????????????????????????????????????????????????????????????????
      scrollTop: 0,
      nameForm: {
        labelWidth: 100,
        labelPosition: 'left',
        itemList: {
          name: {
            width: '100%',
            type: 'text',
            label: this.$t('term.autoexec.jobname'),
            value: '',
            validateList: !_this.id ? ['required'] : [],
            isHidden: !!_this.id // ????????????????????????????????????
          }
        }
      },
      executeForm: {
        labelWidth: 100,
        labelPosition: 'left',
        itemList: {
          protocolId: {
            type: 'select',
            label: _this.$i18n.t('page.protocol'),
            value: '',
            multiple: false,
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getProtocolDataList,
            placeholder: this.$i18n.t('page.pleaseselect'),
            validateList: ['required']
          },
          executeUser: {
            type: 'text',
            value: '',
            label: _this.$i18n.t('term.autoexec.executeaccount'),
            validateList: ['required']
          }
        }
      },
      paramsTypeList: [],
      execModeList: [], //????????????
      executeValue: {
        protocolId: null,
        executeUser: null
      },
      needExecuteNode: false, //???????????????????????????
      needExecuteUser: false, //???????????????????????????
      needProtocol: false, //???????????????????????????
      isSaveDialog: false, //????????????
      combopConfig: { //??????????????????
        phaseList: []
      },
      scenarioList: [], //????????????
      scenarioId: null,
      selectStepList: [], //???????????????????????????
      isShowStepList: false, //???????????????
      showScenarioExecute: true, //???????????????????????????????????????(????????????'runner'??????'sqlfile'?????????????????????)
      roundCount: 2,
      roundCountForm: {
        dataList: this.$utils.getRoundCountList(),
        placeholder: this.$t('page.selectinput'),
        border: 'border',
        filterName: 'text',
        allowCreate: true,
        search: true,
        transfer: true,
        desc: this.$t('term.autoexec.roundcountdescrition'),
        validateList: ['required', 'maxNum']
      },
      paramValue: {},
      executeConfig: {},
      jobId: null, //??????id,??????????????????
      jobConfig: {},
      filterSearchValue: {}
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query) {
      if (this.$route.query.actionId || this.id) {
        this.actionId = this.$route.query.actionId ? parseInt(this.$route.query.actionId) : this.id;
      }
      if (this.$route.query.versionId) {
        this.versionId = this.$route.query.versionId ? parseInt(this.$route.query.versionId) : null;
      }
      if (this.$route.query.source) {
        this.source = this.$route.query.source;
      }
      if (this.$route.query.jobId) {
        this.jobId = parseInt(this.$route.query.jobId);
      }
    }
    this.init();
  },
  async beforeMount() {
    await this.getParamsTypeLit();
    await this.getExecModeList();    
  },
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async init() {
      await this.getAction();
      this.getJobData();
    },
    getParamsTypeLit() { //??????????????????
      let data = {enumClass: 'neatlogic.framework.autoexec.script.paramtype.ScriptParamTypeFactory'};
      return this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.paramsTypeList = res.Return;
        }
      });
    },
    getExecModeList() {
      let data = {enumClass: 'neatlogic.framework.autoexec.constvalue.ExecMode'};
      return this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.execModeList = res.Return;
        }
      });
    },
    async getAction() {
      if (!this.actionId) {
        return;
      }
      let data = {
        id: this.actionId,
        versionId: this.versionId
      };
      this.loading = true;
      await this.$api.autoexec.action
        .getActionDetail(data)
        .then(res => {
          this.loading = false;
          if (res.Status == 'OK') {
            this.dataConfig = res.Return;
            this.nameForm.itemList.name.value = this.dataConfig.name;
            this.stepList = this.dataConfig.config.combopPhaseList;
            this.paramsList = this.dataConfig.config.runtimeParamList || [];
            this.needExecuteNode = this.dataConfig.needExecuteNode;
            this.needExecuteUser = this.dataConfig.needExecuteUser;
            this.needProtocol = this.dataConfig.needProtocol;
            this.needRoundCount = this.dataConfig.needRoundCount;
            this.executeConfig = this.dataConfig.config.executeConfig || {};
            this.filterSearchValue = this.executeConfig.executeNodeConfig && this.executeConfig.executeNodeConfig.filter ? this.executeConfig.executeNodeConfig.filter : {};
            if (this.jobId) {
              this.setJobParams(this.jobConfig);
            } else {
              if (!this.$utils.isEmpty(this.executeConfig.roundCount)) {
                this.roundCount = this.executeConfig.roundCount;
                this.$set(this.roundCountForm, 'disabled', true);
                this.$set(this.roundCountForm, 'disabledHoverTitle', this.$t('term.autoexec.setbantchnumbernoupdate'));
              }
              if (this.executeConfig.whenToSpecify == 'runtime') {
                this.$set(this.executeConfig, 'executeNodeConfig', {});
              }
              this.scenarioId = this.dataConfig.config.defaultScenarioId || null;
              for (let key in this.executeForm.itemList) {
              // ???????????????????????????
                let item = this.executeForm.itemList[key];
                this.dataConfig.config.executeConfig && 
                (item.value = this.dataConfig.config.executeConfig[key] || '') && 
                (this.executeValue[key] = this.dataConfig.config.executeConfig[key] || '');
              }
              // ??????????????????
              if (this.isEdit && !this.$utils.isEmpty(this.config)) {
                // ??????????????????????????????
                this.setJobParams(this.config); 
                if (this.executeConfig.whenToSpecify) {
                  this.$set(this.executeConfig, 'whenToSpecify', 'runtime');
                } 
              }
            }
            
            // this.showExecuteData = this.stepList instanceof Array ? this.stepList.find(item => item.execMode != 'runner') : false;//??????????????????????????????runner ????????????????????????????????????
            if (this.needExecuteNode || this.needExecuteUser || this.needProtocol) { //???????????????????????????????????????????????????????????????????????????
              this.showExecuteData = true;
              this.executeForm.itemList.protocolId.isHidden = !this.needProtocol;
              this.executeForm.itemList.executeUser.isHidden = !this.needExecuteUser;
            } else {
              this.showExecuteData = false;
            }
            this.showScenarioExecute = this.showExecuteData;
            //???????????????????????????
            if (this.stepList) {
              this.currentStep = this.stepList && this.stepList.length ? this.stepList[0].uuid : null;
            }
          }
          this.combopConfig.phaseList = this.stepList;
          // ??????
          if (this.dataConfig && this.dataConfig.config && this.dataConfig.config.scenarioList) {
            this.scenarioList = this.dataConfig.config.scenarioList;
          }
          this.getSelectStepList(this.scenarioId);
        })
        .finally(res => {
          this.loading = false;
        });
    },
    validFn() { //??????
      let isValid = true;
      isValid = this.$refs.param ? this.$refs.param.valid() && isValid : isValid;
      isValid = this.$refs.addTarget ? this.$refs.addTarget.valid() && isValid : isValid;
      isValid = this.$refs.executeForm ? this.$refs.executeForm.valid() && isValid : isValid;
      isValid = this.$refs.nameForm ? this.$refs.nameForm.valid() && isValid : isValid;
      isValid = this.$refs.roundCountForm ? this.$refs.roundCountForm.valid() && isValid : isValid;
      return isValid;
    },
    openExecuteSetting() {
      //??????
      let isValid = this.validFn();
      if (this.id) {
        return isValid;
      }
      if (isValid && !this.id) {
        this.executeAction({});
      }
    },
    executeAction(val) {
      //??????
      val = Object.assign(val, {
        combopId: this.actionId,
        combopVersionId: this.versionId,
        source: this.source,
        name: this.nameForm.itemList.name.value
      }, this.getCombopParams());
      this.$api.autoexec.action.executeAction(val).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.savesuccess')); //????????????
          this.$router.push({
            path: '/job-detail',
            query: {id: res.Return.jobId}
          });
        }
      });
    },
    scroll(top) {
      this.scrollTop = top;
    },
    openSavesetting() {
      let isValid = this.validFn();
      if (this.id) {
        return isValid;
      }
      if (isValid && !this.id) {
        this.isSaveDialog = true;
      }
    },
    okSave(val) {
      val = Object.assign(val, {
        combopId: this.actionId,
        source: 'human',
        name: this.nameForm.itemList.name.value
      }, this.getCombopParams());
      this.$api.autoexec.job.saveJob(val).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.savesuccess')); //????????????
          this.$router.push({
            path: '/job-detail',
            query: {id: res.Return.jobId}
          });
        }
      });
    },
    getSelectStepList(scenarioId) { //???????????????????????????
      let stepList = [];
      if (scenarioId) {
        let findItem = this.scenarioList.find(item => item.scenarioId == scenarioId);
        if (findItem) {
          let combopPhaseNameList = findItem.combopPhaseNameList || [];
          this.stepList.forEach(s => {
            if (combopPhaseNameList.indexOf(s.name) > -1) {
              stepList.push(s);
              if (this.showExecuteData && s.execMode != 'runner' && s.execMode != 'sqlfile') {
                this.showScenarioExecute = true;
              }
            }
          });
        }
      } else { //?????????????????????????????????
        stepList = this.stepList;
      }
      this.selectStepList = stepList;
      this.currentStep = this.selectStepList.length ? this.selectStepList[0].uuid : null;
    },
    changeScenarioId(val) { //????????????id
      this.showScenarioExecute = this.showExecuteData;
      this.getSelectStepList(val);
    },
    getCombopParams() { //????????????????????????????????????????????????
      let data = {
        param: {}
      };
      //??????
      if (this.scenarioId) {
        this.$set(data, 'scenarioId', this.scenarioId);
      }
      if (this.dataConfig && this.dataConfig.needRoundCount) { //??????????????????????????????
        this.$set(data, 'roundCount', this.roundCount);
      }
      if (this.$refs.param) {
        this.$set(data, 'param', this.$refs.param.getValue());
      }
      if (this.showExecuteData && this.dataConfig) { //??????????????????????????????
        this.$set(data, 'executeConfig', {});
        data.executeConfig = this.$refs.executeForm ? this.$refs.executeForm.getFormValue() : {};
        data.executeConfig.executeNodeConfig = this.$refs.addTarget ? this.$refs.addTarget.getValue() : {};
        if (this.executeConfig.whenToSpecify) {
          data.executeConfig.whenToSpecify = this.executeConfig.whenToSpecify;
        } else if (!this.isEdit) {
          data.executeConfig.whenToSpecify = 'runtime'; // ????????????????????????????????????????????????????????????
        }
        // ????????????????????????????????????????????????
        if (this.config && this.config.executeConfig && !this.config.executeConfig.whenToSpecify) {
          delete data.executeConfig.whenToSpecify;
        }
      } else if (this.config && this.config.executeConfig) {
        data = this.config; // ???????????????????????????????????????????????????
      }
      return data;
    },
    setJobParams(config) {
      this.nameForm.itemList.name.value = config.name;
      this.paramValue = config.param || {};
      this.scenarioId = config.scenarioId;
      this.roundCount = config.roundCount || 2;
      this.executeConfig = config.executeConfig || {};
      for (let key in this.executeForm.itemList) {
        // ???????????????????????????
        let item = this.executeForm.itemList[key];
        item.value = this.executeConfig[key] || null;
        this.executeValue[key] = this.executeConfig[key] || null;
      }
    },
    getJobData() {
      if (!this.jobId) {
        return;
      }
      this.$api.autoexec.job.getCreateJobData({ jobId: this.jobId}).then(res => {
        if (res.Status == 'OK') {
          this.actionId = res.Return.combopId;
          this.jobConfig = res.Return;
          this.getAction();
        }
      });
    }
  },
  computed: {
    getPrev() {
      return function(config, list) {
        let uk = config.uuid;
        let index = list.findIndex(l => {
          return l.uuid == uk;
        });
        return list.filter((s, sindex) => {
          return sindex < index;
        });
      };
    }
  },
  watch: {
    currentStep: {
      handler(val, oldval) {
        if (val) {
          this.currentConfig = this.stepList.find(s => {
            return s.uuid === val;
          });
          this.currentScriptLength = this.currentConfig && this.currentConfig.config && this.currentConfig.config.phaseOperationList ? this.currentConfig.config.phaseOperationList.length : 0;
        } else {
          this.currentConfig = null;
          this.currentScriptLength = 0;
        }
        if (oldval && this.$refs.stepConfig) {
          if (this.scrollTop > this.$refs.stepConfig.$el.offsetTop) {
            this.$refs.main.scrollTop(this.$refs.stepConfig.$el.offsetTop);
          }
        }
      },
      immediate: true,
      deep: true
    },
    id: {
      handler(val) {
        if (val && !this.$utils.isSame(val, this.actionId)) {
          this.actionId = val;
          this.init();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.runner-detail {
  &.remove-tsform-header {
    // ???????????????????????????????????????
    /deep/ .tscontain-header {
      display: none;
    }
    /deep/ .tscontain-body {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }
  .left-top-no-border-radius {
    border-radius: 0 10px 10px 10px;
  }
  .right {
    &.padding-top-16 {
    padding-top: 16px !important;
    }
  }
  height: 100%;
  .action-title {
    display: inline-flex;
    flex-direction: column;
    &-name {
      display: inline-block;
      height: 21px;
      line-height: 21px;
      vertical-align: middle;
    }
    &-uk {
      display: inline-block;
      height: 16px;
      line-height: 16px;
      vertical-align: middle;
    }
  }
  /deep/.btn-icon{
    vertical-align: baseline;
    margin: 0px;
    &::before{
      margin-right: 5px;
    }
  }
}
.addTarget {
  border-bottom: 1px solid;
}

.contain {

  .content {
    display: flex;
    .left {
      width: 230px;
    }
    .right {
      padding: 10px 0 10px 10px;
      flex: 1;
    }
  }
  .box-block {
    padding-bottom: 22px;
  }
}
.scenario-list {
  padding: 0 16px 16px;
  .name {
    padding: 16px 0;
    border-top:1px solid
  }
}
</style>
