<template>
  <div class="autoexec-combop-gate-launch">
    <TsForm ref="basicForm" v-model="formValue" :item-list="basicFormConfig"></TsForm>
    <div v-if="formValue.targetId && !loadingCombop" class="launch-section">
      <div v-if="runtimeParamList.length > 0" class="section-block">
        <div class="section-title">{{ $t('term.autoexec.jobparam') }}</div>
        <SetParam
          :id="formValue.targetId"
          ref="param"
          :param="formValue.param"
          :param-list="runtimeParamList"
          :phase-list="stepList"
          :isUseParam="true"
        ></SetParam>
      </div>
      <div v-if="needRunnerGroup && existRunnerOrSqlExecMode" class="section-block">
        <div class="section-title">{{ $t('term.autoexec.runnergroup') }}</div>
        <RunnerGroupSetting
          ref="runnerGroup"
          :config="runnerGroup"
          :runtimeParamList="runtimeParamList"
          :isCreateJob="true"
          :disabled="false"
        ></RunnerGroupSetting>
      </div>
      <div v-if="needExecuteNode" class="section-block">
        <div class="section-title">{{ $t('term.autoexec.executenode') }}</div>
        <AddTarget
          :id="formValue.targetId"
          ref="addTarget"
          :value="executeNodeConfig"
          :canEdit="true"
          type="runtime"
          :executeConfig="executeValue"
          :runtimeParamList="runtimeParamList"
          :needBorder="needExecuteUser || needProtocol"
          :filterSearchValue="filterSearchValue"
          :preCondition="preCondition"
        ></AddTarget>
      </div>
      <div v-if="needExecuteUser || needProtocol" class="section-block">
        <div class="section-title">{{ $t('term.autoexec.executeaccount') }}</div>
        <TsFormItem
          v-if="needExecuteUser"
          :label="$t('term.autoexec.executeuser')"
          :labelWidth="110"
          labelPosition="left"
          :required="true"
        >
          <ExecuteuserSetting
            v-if="executeValue.executeUser && executeValue.executeUser.mappingMode === 'runtimeparam'"
            ref="executeUser"
            :config="executeValue.executeUser"
            :readonly="true"
            :runtimeParamList="runtimeParamList"
          ></ExecuteuserSetting>
          <TsFormInput
            v-else
            ref="executeUser"
            v-model="executeValue.executeUser.value"
            :validateList="['required']"
          ></TsFormInput>
        </TsFormItem>
        <TsFormItem
          v-if="needProtocol"
          :label="$t('term.autoexec.protocol')"
          :labelWidth="110"
          labelPosition="left"
          :required="true"
        >
          <TsFormSelect
            ref="protocol"
            v-model="executeValue.protocolId"
            v-bind="protocolForm"
          ></TsFormSelect>
        </TsFormItem>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AutoexecCombopGateLaunchConfig',
  components: {
    AddTarget: () => import('@/views/pages/autoexec/detail/runnerDetail/add-target.vue'),
    ExecuteuserSetting: () => import('@/views/pages/autoexec/detail/actionDetail/executeuser-setting.vue'),
    RunnerGroupSetting: () => import('@/views/pages/autoexec/detail/actionDetail/runnergroup-setting.vue'),
    SetParam: () => import('@/views/pages/autoexec/detail/runnerDetail/param.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loadingCombop: false,
      loadToken: 0,
      runtimeParamList: [],
      stepList: [],
      scenarioList: [],
      needExecuteNode: false,
      needExecuteUser: false,
      needProtocol: false,
      needRunnerGroup: false,
      existRunnerOrSqlExecMode: false,
      filterSearchValue: {},
      preCondition: null,
      runnerGroup: this.defaultRunnerGroup(),
      executeNodeConfig: {},
      executeValue: this.defaultExecuteValue(),
      formValue: this.buildValue(this.value),
      basicFormConfig: {
        targetId: {
          type: 'select',
          label: this.$t('term.autoexec.combop'),
          validateList: ['required'],
          dynamicUrl: '/api/rest/autoexec/combop/executable/list',
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          search: true,
          transfer: true,
          desc: this.$t('term.autoexec.comboplaunchdesc'),
          onChange: this.changeCombop
        },
        scenarioId: {
          type: 'select',
          label: this.$t('term.autoexec.scenario'),
          dataList: [],
          valueName: 'scenarioId',
          textName: 'scenarioName',
          transfer: true,
          clearable: true,
          desc: this.$t('term.autoexec.defaultcombopscenariodesc')
        }
      },
      protocolForm: {
        dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getProtocolDataList,
        placeholder: this.$t('page.pleaseselect'),
        transfer: true,
        validateList: ['required']
      }
    };
  },
  mounted() {
    if (this.formValue.targetId) {
      this.loadCombopConfig(this.formValue.targetId, true);
    }
  },
  methods: {
    valid() {
      let isValid = this.$refs.basicForm ? this.$refs.basicForm.valid() : true;
      isValid = this.$refs.param ? this.$refs.param.valid() && isValid : isValid;
      isValid = this.$refs.runnerGroup ? this.$refs.runnerGroup.valid() && isValid : isValid;
      isValid = this.$refs.addTarget ? this.$refs.addTarget.valid() && isValid : isValid;
      isValid = this.$refs.executeUser && this.$refs.executeUser.valid ? this.$refs.executeUser.valid() && isValid : isValid;
      isValid = this.$refs.protocol ? this.$refs.protocol.valid() && isValid : isValid;
      return isValid;
    },
    getFormValue() {
      const value = this.buildValue(this.formValue);
      value.param = this.$refs.param ? this.$refs.param.getValue() : value.param;
      if (this.needRunnerGroup && this.existRunnerOrSqlExecMode && this.$refs.runnerGroup) {
        value.runnerGroup = this.$refs.runnerGroup.save();
      }
      const executeConfig = {};
      if (this.needExecuteNode) {
        executeConfig.executeNodeConfig = this.$refs.addTarget ? this.$refs.addTarget.getValue() : this.executeNodeConfig;
        executeConfig.whenToSpecify = 'runtime';
      }
      if (this.needExecuteUser) {
        executeConfig.executeUser = this.executeValue.executeUser;
      }
      if (this.needProtocol) {
        executeConfig.protocolId = this.executeValue.protocolId;
      }
      value.executeConfig = executeConfig;
      return value;
    },
    getStateValue() {
      const value = this.buildValue(this.formValue);
      value.runnerGroup = this.needRunnerGroup && this.existRunnerOrSqlExecMode ? this.runnerGroup : null;
      value.executeConfig = {
        ...(this.needExecuteNode ? { executeNodeConfig: this.executeNodeConfig, whenToSpecify: 'runtime' } : {}),
        ...(this.needExecuteUser ? { executeUser: this.executeValue.executeUser } : {}),
        ...(this.needProtocol ? { protocolId: this.executeValue.protocolId } : {})
      };
      return value;
    },
    emitStateValue() {
      const value = this.getStateValue();
      if (!this.isSameValue(value, this.value)) {
        this.$emit('input', value);
      }
    },
    defaultRunnerGroup() {
      return {
        mappingMode: 'constant',
        value: '-1'
      };
    },
    defaultExecuteValue() {
      return {
        protocolId: null,
        executeUser: {
          mappingMode: 'constant',
          value: ''
        }
      };
    },
    isSameValue(a, b) {
      return JSON.stringify(a || {}) === JSON.stringify(b || {});
    },
    buildValue(value) {
      const data = value || {};
      return {
        targetId: data.targetId || '',
        targetName: data.targetName || '',
        combopVersionId: data.combopVersionId || null,
        combopVersionName: data.combopVersionName || '',
        scenarioId: data.scenarioId || null,
        scenarioName: data.scenarioName || '',
        param: data.param || {},
        executeConfig: data.executeConfig || {},
        runnerGroup: data.runnerGroup || null
      };
    },
    changeCombop(value, item) {
      this.runtimeParamList = [];
      this.stepList = [];
      this.scenarioList = [];
      this.basicFormConfig.scenarioId.dataList = [];
      this.runnerGroup = this.defaultRunnerGroup();
      this.executeNodeConfig = {};
      this.executeValue = this.defaultExecuteValue();
      this.formValue = {
        ...this.buildValue({}),
        targetId: value || '',
        targetName: item && (item.name || item.text) ? (item.name || item.text) : ''
      };
      if (value) {
        this.loadCombopConfig(value, false);
      }
    },
    loadCombopConfig(targetId, keepSavedValue) {
      if (!targetId) {
        return;
      }
      const currentToken = ++this.loadToken;
      const savedValue = keepSavedValue ? this.buildValue(this.value) : this.buildValue(this.formValue);
      this.loadingCombop = true;
      this.$api.autoexec.action.getActionDetail({ id: targetId }).then(res => {
        if (currentToken !== this.loadToken) {
          return;
        }
        if (res && res.Status === 'OK') {
          const data = res.Return || {};
          const config = data.config || {};
          const executeConfig = config.executeConfig || {};
          const scenarioList = config.scenarioList || [];
          const scenario = scenarioList.find(item => String(item.scenarioId) === String(config.defaultScenarioId)) || scenarioList[0] || {};
          this.runtimeParamList = config.runtimeParamList || [];
          this.stepList = config.combopPhaseList || [];
          this.scenarioList = scenarioList;
          this.basicFormConfig.scenarioId.dataList = scenarioList;
          this.needExecuteNode = !!data.needExecuteNode;
          this.needExecuteUser = !!data.needExecuteUser;
          this.needProtocol = !!data.needProtocol;
          this.needRunnerGroup = !!data.needRunnerGroup;
          this.existRunnerOrSqlExecMode = !!data.existRunnerOrSqlExecMode;
          this.preCondition = executeConfig.preCondition || null;
          this.filterSearchValue = executeConfig.executeNodeConfig && executeConfig.executeNodeConfig.filter ? executeConfig.executeNodeConfig.filter : {};
          this.runnerGroup = savedValue.runnerGroup || executeConfig.runnerGroup || this.defaultRunnerGroup();
          const savedExecuteConfig = savedValue.executeConfig || {};
          this.executeNodeConfig = savedExecuteConfig.executeNodeConfig || executeConfig.executeNodeConfig || {};
          this.executeValue = {
            protocolId: savedExecuteConfig.protocolId || executeConfig.protocolId || null,
            executeUser: savedExecuteConfig.executeUser || executeConfig.executeUser || this.defaultExecuteValue().executeUser
          };
          const nextValue = {
            ...savedValue,
            targetId: data.id || targetId,
            targetName: data.name || savedValue.targetName,
            combopVersionId: config.id || data.combopVersionId || savedValue.combopVersionId || null,
            combopVersionName: config.version || data.version || savedValue.combopVersionName || '',
            scenarioId: savedValue.scenarioId || scenario.scenarioId || null,
            scenarioName: savedValue.scenarioName || scenario.scenarioName || '',
            param: savedValue.param || {},
            executeConfig: savedExecuteConfig,
            runnerGroup: savedValue.runnerGroup || null
          };
          if (!this.isSameValue(nextValue, this.formValue)) {
            this.formValue = nextValue;
          }
        }
      }).finally(() => {
        if (currentToken === this.loadToken) {
          this.loadingCombop = false;
        }
      });
    }
  },
  watch: {
    value: {
      handler(value) {
        const nextValue = this.buildValue(value);
        if (!this.isSameValue(nextValue, this.formValue)) {
          this.formValue = nextValue;
        }
      },
      deep: true
    },
    formValue: {
      handler() {
        this.emitStateValue();
      },
      deep: true
    },
    executeValue: {
      handler() {
        this.emitStateValue();
      },
      deep: true
    },
    executeNodeConfig: {
      handler() {
        this.emitStateValue();
      },
      deep: true
    },
    runnerGroup: {
      handler() {
        this.emitStateValue();
      },
      deep: true
    }
  }
};
</script>

<style lang="less" scoped>
.autoexec-combop-gate-launch {
  .launch-section {
    padding-top: 8px;
  }
  .section-block {
    padding-bottom: 18px;
  }
  .section-title {
    padding: 10px 0 8px;
    font-weight: 600;
    line-height: 1;
  }
}
</style>
