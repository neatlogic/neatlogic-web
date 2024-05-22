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
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft><span>{{ $t('term.autoexec.addjob') }}</span></template>
      <template v-if="!id" v-slot:topRight>
        <div class="div-btn-contain action-group" style="text-align: right;">
          <span v-if="source == 'combop'" class="action-item">
            <Button
              type="primary"
              ghost
              icon="tsfont tsfont-save"
              :disabled="(!dataConfig.isActive || !dataConfig.executable) && source == 'combop'"
              @click="openSavesetting"
            >{{ $t('page.save') }}</Button>
          </span>
          <span class="action-item last">
            <Button
              type="primary"
              icon="tsfont tsfont-run"
              :disabled="(!dataConfig.isActive || !dataConfig.executable) && source == 'combop'"
              :loading="isCreating"
              @click="openExecuteSetting"
            >{{ $t('term.autoexec.immediateexecution') }}</Button>
          </span>
        </div>
      </template>
      <div slot="content" class="contain pl-nm pr-nm" :class="{'pt-xs':!id}">
        <ExpiredReasonAlert v-if="configExpired == 1" :configExpiredReason="configExpiredReason" :combopId="dataConfig.id"></ExpiredReasonAlert>
        <div v-if="!id" class="box-block">
          <Divider orientation="start">{{ $t('term.autoexec.jobname') }}</Divider>
          <div>
            <TsForm ref="nameForm" v-bind="nameForm"></TsForm>
          </div>
        </div>
        <div v-if="scenarioList.length > 0" class="box-block">
          <Divider orientation="start">{{ $t('page.scene') }}</Divider>
          <div>
            <TsFormRadio
              v-model="scenarioId"
              :dataList="scenarioList"
              valueName="scenarioId"
              textName="scenarioName"
              :allowToggle="true"
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
        <div>
          <Divider orientation="start">{{ $t('term.deploy.actuatorgroup') }}</Divider>
          <div v-if="dataConfig.existRunnerOrSqlExecMode && runnerGroup && runnerGroup.mappingMode==='runtimeparam'">
            <RunnerGroupSetting
              ref="runnerGroup"
              :config="runnerGroup"
              :readonly="true"
              :runtimeParamList="runtimeParamList"
            ></RunnerGroupSetting>
          </div>
          <div v-if="dataConfig.existRunnerOrSqlExecMode && runnerGroup && runnerGroup.mappingMode==='constant'">
            <RunnerGroupSetting
              ref="runnerGroup"
              :config="runnerGroup"
              :runtimeParamList="runtimeParamList"
              :isCreateJob="true"
              :disabled="false"
            ></RunnerGroupSetting>
          </div>
          <div v-if="!dataConfig.existRunnerOrSqlExecMode" class="box-block text-tip">
            {{ $t('message.autoexec.norunnerphaserunnergrouptips') }}
          </div>
        </div>
        <div>
          <Divider orientation="start">{{ $t('term.autoexec.executetarget') }}</Divider>
          <div v-if="needExecuteNode" class="box-block">
            <AddTarget
              :id="actionId"
              ref="addTarget"
              :value="executeConfig ? executeConfig.executeNodeConfig:{}"
              :canEdit="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify == 'runtime':true"
              :type="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify: 'runtime'"
              :executeConfig="executeValue"
              :runtimeParamList="runtimeParamList"
              :needBorder="needExecuteUser|| needProtocol"
              :filterSearchValue="filterSearchValue"
            ></AddTarget>
          </div>
          <div v-else class="box-block text-tip">
            <div v-if="dataConfig.allPhasesAreRunnerOrSqlExecMode">
              {{ $t('message.autoexec.executerunnertip') }}
            </div>
            <div v-else>
              {{ $t('message.autoexec.notsetexecutertip') }}
            </div>
          </div>
        </div>
        <template v-if="dataConfig.config && showExecuteData && showScenarioExecute">
          <div v-if="needExecuteUser|| needProtocol" class="box-block">
            <Divider orientation="start">{{ $t('term.autoexec.executeaccount') }}</Divider>
            <div>
              <TsForm ref="executeForm" v-model="executeValue" v-bind="executeForm">
                <template v-slot:executeUser>
                  <div v-if="executeValue.executeUser && executeValue.executeUser.mappingMode==='runtimeparam'">
                    <ExecuteuserSetting
                      ref="executeUser"
                      :config="executeValue.executeUser"
                      :readonly="true"
                      :runtimeParamList="runtimeParamList"
                    ></ExecuteuserSetting>
                  </div>
                  <div v-else>
                    <TsFormInput
                      ref="executeUser"
                      v-model="executeValue.executeUser.value"
                      :validateList="['required']"
                    ></TsFormInput>
                  </div>
                </template>
              </TsForm>
            </div>
          </div>
        </template>
        <div v-if="runtimeParamList && runtimeParamList.length > 0" class="box-block">
          <Divider orientation="start">{{ $t('term.autoexec.jobparam') }}</Divider>
          <div>
            <SetParam
              :id="actionId"
              ref="param"
              :isUseParam="true"
              :param="paramValue"
              :paramList="runtimeParamList"
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
                  :runtimeParamList="runtimeParamList"
                ></StepList>
              </div>
              <div class="right" :class="{'pt-nm': id}">
                <div v-if="currentConfig">
                  <!-- 阶段配置 -->
                  <StepConfig
                    ref="stepConfig"
                    :currentStep="currentStep"
                    :config="currentConfig"
                    :paramList="runtimeParamList"
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
    <!-- 执行 -->
    <SaveSetting v-if="isSaveDialog" v-model="isSaveDialog" @on-ok="okSave"></SaveSetting>
  </div>
</template>
<script>
import { mutations } from '@/views/pages/autoexec/detail/actionDetail/actionState.js';
export default {
  name: '',
  provide() {
    return {
      getCombopConfig: this.combopConfig
    };
  },
  components: {
    AddTarget: () => import('./runnerDetail/add-target.vue'),
    StepList: () => import('./actionDetail/step/step-list.vue'),
    StepConfig: () => import('./actionDetail/step/step-config.vue'),
    SetParam: () => import('./runnerDetail/param.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    SaveSetting: () => import('./runnerDetail/save-setting.vue'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    ExpiredReasonAlert: () => import('./expired-reason-alert'),
    ExecuteuserSetting: () => import('@/views/pages/autoexec/detail/actionDetail/executeuser-setting.vue'),
    RunnerGroupSetting: () => import('@/views/pages/autoexec/detail/actionDetail/runnergroup-setting.vue')
  },
  filters: {},
  props: {
    // 组合工具id
    id: {
      type: [Number, String],
      default: null
    },
    config: {
      // 配置参数，config: {
      //   params: Object,
      //   executeForm: Object
      // }
      type: Object,
      default: function() {
        return {};
      }
    },
    mode: { type: String, default: 'window' },
    isEdit: { //定时作业是否可以编辑
      type: Boolean,
      default: false
    }
  },
  data() {
    let _this = this;
    return {
      isCreating: false,
      actionId: null,
      versionId: null,
      source: 'combop',
      showExecuteData: true, //是否需要显示执行相关的数据
      runtimeParamList: [],
      dataConfig: null,
      currentStep: null, //当前选中哪个阶段
      currentConfig: {}, //当前选中阶段对应的config数据
      stepList: [], //阶段数据
      currentScriptLength: 0, //当前选中的阶段有多少个脚本
      loading: true,
      isRunner: true, //标志是否是执行页面，涉及到执行页面的一系列参数以此为准
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
            isHidden: !!_this.id // 定时作业不显示，其余显示
          }
        }
      },
      executeForm: {
        labelWidth: 100,
        labelPosition: 'left',
        itemList: {
          protocolId: {
            type: 'select',
            label: this.$t('page.protocol'),
            multiple: false,
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getProtocolDataList,
            placeholder: this.$t('page.pleaseselect'),
            validateList: ['required']
          },
          executeUser: {
            type: 'slot',
            label: this.$t('page.executeuser'),
            validateList: ['required']
          }
        }
      },
      paramsTypeList: [],
      execModeList: [], //执行方式
      executeValue: {
        protocolId: null,
        executeUser: {
          mappingMode: 'constant',
          value: ''
        }
      },
      runnerGroup: {
        mappingMode: 'constant',
        value: '-1'
      },
      needExecuteNode: false, //组合工具的执行目标
      needExecuteUser: false, //组合工具的执行用户
      needProtocol: false, //组合工具的连接协议
      isSaveDialog: false, //保存设置
      combopConfig: { //组合工具数据
        phaseList: []
      },
      scenarioList: [], //场景列表
      scenarioId: null,
      selectStepList: [], //根据场景选择的阶段
      isShowStepList: false, //展示流水线
      showScenarioExecute: true, //切换场景是是否需要执行目标(阶段全是'runner'或者'sqlfile'不需要执行目标)
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
      jobId: null, //作业id,用于复制作业
      jobConfig: {},
      filterSearchValue: {},
      configExpired: 0,
      configExpiredReason: {}
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
    getParamsTypeLit() { //选择组件类型
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
            if (this.dataConfig.configExpired == 1) {
              this.configExpired = this.dataConfig.configExpired;
              this.configExpiredReason = this.dataConfig.configExpiredReason;
            }
            this.nameForm.itemList.name.value = this.dataConfig.name;
            this.stepList = this.dataConfig.config.combopPhaseList;
            this.runtimeParamList = this.dataConfig.config.runtimeParamList || [];
            this.needExecuteNode = this.dataConfig.needExecuteNode;
            this.needExecuteUser = this.dataConfig.needExecuteUser;
            this.needProtocol = this.dataConfig.needProtocol;
            this.needRoundCount = this.dataConfig.needRoundCount;
            this.executeConfig = this.dataConfig.config.executeConfig || {};
            this.runnerGroup = this.executeConfig.runnerGroup || this.runnerGroup;
            this.filterSearchValue = this.executeConfig.executeNodeConfig && this.executeConfig.executeNodeConfig.filter ? this.executeConfig.executeNodeConfig.filter : {};
            mutations.setOpType(this.dataConfig.opType);
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
              // 链接协议和执行用户
                let item = this.executeForm.itemList[key];
                if (this.dataConfig.config.executeConfig) {
                  let keyConfig = this.dataConfig.config.executeConfig[key];
                  if (key === 'executeUser') {
                    if (!this.$utils.isEmpty(keyConfig)) {
                      this.$set(this.executeValue.executeUser, 'mappingMode', keyConfig.mappingMode);
                      this.$set(this.executeValue.executeUser, 'value', keyConfig.value);
                    }
                  } else {
                    item.value = keyConfig || '';
                    this.executeValue[key] = keyConfig || '';
                  }
                }
              }
              // 执行目标回显
              if (this.isEdit && !this.$utils.isEmpty(this.config)) {
                // 处理定时任务编辑回显
                this.setJobParams(this.config);
                if (this.executeConfig.whenToSpecify) {
                  this.$set(this.executeConfig, 'whenToSpecify', 'runtime');
                }
              }
            }

            // this.showExecuteData = this.stepList instanceof Array ? this.stepList.find(item => item.execMode != 'runner') : false;//如果阶段执行方式都是runner 则不用显示执行方面的信息
            if (this.needExecuteNode || this.needExecuteUser || this.needProtocol) { //接口返回是否需要展示：执行目标，连接协议，执行用户
              this.showExecuteData = true;
              this.executeForm.itemList.protocolId.isHidden = !this.needProtocol;
              this.executeForm.itemList.executeUser.isHidden = !this.needExecuteUser;
            } else {
              this.showExecuteData = false;
            }
            this.showScenarioExecute = this.showExecuteData;
            //默认进来选中第一个
            if (this.stepList) {
              this.currentStep = this.stepList && this.stepList.length ? this.stepList[0].uuid : null;
            }
          }
          this.combopConfig.phaseList = this.stepList;
          // 场景
          if (this.dataConfig && this.dataConfig.config && this.dataConfig.config.scenarioList) {
            this.scenarioList = this.dataConfig.config.scenarioList;
          }
          this.getSelectStepList(this.scenarioId);
        })
        .finally(res => {
          this.loading = false;
        });
    },
    validFn() { //校验
      let isValid = true;
      isValid = this.$refs.param ? this.$refs.param.valid() && isValid : isValid;
      isValid = this.$refs.addTarget ? this.$refs.addTarget.valid() && isValid : isValid;
      isValid = this.$refs.executeForm ? this.$refs.executeForm.valid() && isValid : isValid;
      isValid = this.$refs.nameForm ? this.$refs.nameForm.valid() && isValid : isValid;
      isValid = this.$refs.roundCountForm ? this.$refs.roundCountForm.valid() && isValid : isValid;
      isValid = this.$refs.runnerGroup ? this.$refs.runnerGroup.valid() && isValid : isValid;
      return isValid;
    },
    openExecuteSetting() {
      //执行
      let isValid = this.validFn();
      if (this.id) {
        return isValid;
      }
      if (isValid && !this.id) {
        this.executeAction({});
      }
    },
    executeAction(val) {
      //执行
      val = Object.assign(val, {
        combopId: this.actionId,
        combopVersionId: this.versionId,
        name: this.nameForm.itemList.name.value
      }, this.getCombopParams());
      this.isCreating = true;
      this.$api.autoexec.action.executeAction(val).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess')); //保存成功
          this.$router.push({
            path: '/job-detail',
            query: {id: res.Return.jobId}
          });
        }
      }).finally(e => {
        this.isCreating = false;
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
        name: this.nameForm.itemList.name.value
      }, this.getCombopParams());
      this.$api.autoexec.action.executeAction(val).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess')); //保存成功
          this.$router.push({
            path: '/job-detail',
            query: {id: res.Return.jobId}
          });
        }
      });
    },
    getSelectStepList(scenarioId) { //获取选中的阶段列表
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
      } else { //不选场景时执行所有阶段
        stepList = this.stepList;
      }
      this.selectStepList = stepList;
      this.currentStep = this.selectStepList.length ? this.selectStepList[0].uuid : null;
    },
    changeScenarioId(val) { //选择场景id
      this.showScenarioExecute = this.showExecuteData;
      this.getSelectStepList(val);
    },
    getCombopParams() { //保存执行目标，作业参数，分批设置
      let data = {
        param: {}
      };
      //场景
      if (this.scenarioId) {
        this.$set(data, 'scenarioId', this.scenarioId);
      }
      if (this.dataConfig && this.dataConfig.needRoundCount) { //是否需要设置分批数量
        this.$set(data, 'roundCount', this.roundCount);
      }
      if (this.$refs.param) {
        this.$set(data, 'param', this.$refs.param.getValue());
      }
      if (this.showExecuteData && this.dataConfig) { //如果执行配置数据存在
        this.$set(data, 'executeConfig', {});
        data.executeConfig = this.$refs.executeForm ? this.$refs.executeForm.getFormValue() : {};
        data.executeConfig.executeNodeConfig = this.$refs.addTarget ? this.$refs.addTarget.getValue() : {};
        if (this.executeConfig.whenToSpecify) {
          data.executeConfig.whenToSpecify = this.executeConfig.whenToSpecify;
        } else if (!this.isEdit) {
          data.executeConfig.whenToSpecify = 'runtime'; // 处理组合工具执行目标运行时再指定执行目标
        }
        // 兼容数据，点击返回时候对比有问题
        if (this.config && this.config.executeConfig && !this.config.executeConfig.whenToSpecify) {
          delete data.executeConfig.whenToSpecify;
        }
      } else if (this.config && this.config.executeConfig) {
        data = this.config; // 解决返回列表页面，数据对比不对问题
      }
      if (this.$refs.runnerGroup) {
        this.$set(this, 'runnerGroup', this.$refs.runnerGroup.save());
      }
      //补充runnerGroup
      if (this.dataConfig.existRunnerOrSqlExecMode) {
        this.$set(data, 'runnerGroup', this.runnerGroup);
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
        // 链接协议和执行用户
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
    // 解决工具参数，样式多余问题
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
