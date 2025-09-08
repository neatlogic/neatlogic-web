<template>
  <div v-if="isReady" class="no-form-service-container">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <ExpiredReasonAlert :serviceData="defaultData"></ExpiredReasonAlert>
    <div :class="getClassByBorder">
      <div :class="getFlexClass(unfoldAndFold.jobName)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.jobName)" @click.stop="handleUnfoldAndFold('jobName')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('term.autoexec.job') }}<i class="require-label"></i></span></Divider>
        </template>
        <template v-else>
          <span>{{ $t('term.autoexec.job') }}<i class="require-label"></i></span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.jobName)" @click.stop="handleUnfoldAndFold('jobName')"></span>
        </template>
      </div>
      <TsFormItem v-show="unfoldAndFold.jobName" label="" :labelWidth="0">
        <TsFormInput
          ref="ref_jobName"
          v-model="jobName"
          border="border"
          v-bind="jobNameForm"
          @change="handleChange"
        ></TsFormInput>
      </TsFormItem>
    </div>
    <div v-if="hasServiceValue.scenarioId" :class="getClassByBorder">
      <div :class="getFlexClass(unfoldAndFold.scenarioForm)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.scenarioForm)" @click.stop="handleUnfoldAndFold('scenarioForm')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('page.scene') }}</span></Divider>
        </template>
        <template v-else>
          <span>{{ $t('page.scene') }}</span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.scenarioForm)" @click.stop="handleUnfoldAndFold('scenarioForm')"></span>
        </template>
      </div>
      <TsFormItem v-show="unfoldAndFold.scenarioForm" :label="$t('page.scene')" :required="true">
        <TsFormRadio
          ref="ref_scenarioForm"
          v-model="scenarioId"
          :dataList="scenarioList"
          valueName="scenarioId"
          textName="scenarioName"
          :allowToggle="true"
          :validateList="['required']"
          @change="handleChange"
        ></TsFormRadio>
      </TsFormItem>
    </div>
    <div v-if="(parallelPolicy.value==='roundCount' && hasServiceValue.roundCount) || (parallelPolicy.value==='parallel' && hasServiceValue.parallelCount)" :class="getClassByBorder">
      <div :class="getFlexClass(unfoldAndFold.roundCount)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.roundCount)" @click.stop="handleUnfoldAndFold('roundCount')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('term.autoexec.batchsetting') }}</span></Divider>
        </template>
        <template v-else>
          <span>{{ $t('term.autoexec.batchsetting') }}</span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.roundCount)" @click.stop="handleUnfoldAndFold('roundCount')"></span>
        </template>
      </div>
      <template v-if="parallelPolicy.value ==='roundCount'">
        <TsFormItem v-show="unfoldAndFold.roundCount" :label="$t('term.autoexec.batchquantity')" :required="true">
          <TsFormSelect
            ref="ref_roundCount"
            v-model="roundCount"
            v-bind="roundCountForm"
            transfer
            @change="handleChange"
          ></TsFormSelect>
        </TsFormItem>
      </template>
      <template v-if="parallelPolicy.value ==='parallel'">
        <TsFormItem v-show="unfoldAndFold.roundCount" :label="$t('term.autoexec.parall')" :required="true">
          <TsFormSelect
            ref="ref_parallelCount"
            v-model="parallelCount"
            v-bind="parallelCountForm"
            transfer
            @change="handleChange"
          ></TsFormSelect>
        </TsFormItem>
      </template>
    </div>
    <div v-if="hasServiceValue.runnerGroupTag" :class="getClassByBorder">
      <div :class="getFlexClass(unfoldAndFold.runnerGroupTag)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.runnerGroupTag)" @click.stop="handleUnfoldAndFold('runnerGroupTag')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('term.deploy.actuatorgrouptag') }}</span></Divider>
        </template>
        <template v-else>
          <span>{{ $t('term.deploy.actuatorgrouptag') }}</span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.runnerGroupTag)" @click.stop="handleUnfoldAndFold('runnerGroupTag')"></span>
        </template>
      </div>
      <TsFormItem v-show="unfoldAndFold.runnerGroupTag" :label="$t('term.deploy.actuatorgrouptag')">
        <RunnerGroupTagSetting
          ref="ref_runnerGroupTag"
          class="grid"
          :config="runnerGroupTag"
          :runtimeParamList="runtimeParamList"
          :isCreateJob="true"
          :disabled="false"
          :isRequired="false"
          @change="(val)=> {
            runnerGroupTag = val;
          }"
        ></RunnerGroupTagSetting>
        <div class="box-block text-tip">
          {{ $t('page.autoexeccomboprunnergrouptagtips') }}
        </div>
      </TsFormItem>
    </div>
    <div v-if="hasServiceValue.runnerGroup && needRunnerGroup" :class="getClassByBorder">
      <div :class="getFlexClass(unfoldAndFold.runnerGroup)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.runnerGroup)" @click.stop="handleUnfoldAndFold('runnerGroup')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('page.autoexeccomboprunnergrouplabel') }}</span></Divider>
        </template>
        <template v-else>
          <span>{{ $t('page.autoexeccomboprunnergrouplabel') }}</span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.runnerGroup)" @click.stop="handleUnfoldAndFold('runnerGroup')"></span>
        </template>
      </div>
      <TsFormItem
        v-if="dataConfig && dataConfig.existRunnerOrSqlExecMode && runnerGroup"
        v-show="unfoldAndFold.runnerGroup"
        :label="$t('page.autoexeccomboprunnergrouplabel')"
        :required="true"
      >
        <RunnerGroupSetting
          ref="ref_runnerGroup"
          class="grid"
          :config="runnerGroup"
          :runtimeParamList="runtimeParamList"
          :isCreateJob="true"
          :disabled="false"
          @change="( val) => {
            runnerGroup = val;
          }"
        ></RunnerGroupSetting>
      </TsFormItem>
      <div v-if="dataConfig && !dataConfig.existRunnerOrSqlExecMode" class="box-block text-tip desc-info">
        {{ $t('message.autoexec.norunnerphaserunnergrouptips') }}
      </div>
      <div v-else class="box-block text-tip desc-info">
        {{ $t('page.autoexeccomboprunnergrouptips') }}
      </div>
    </div>
    <div v-if="hasServiceValue.executeNodeConfig" :class="getClassByBorder">
      <div :class="getFlexClass(unfoldAndFold.executeNodeConfig)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.executeNodeConfig)" @click.stop="handleUnfoldAndFold('executeNodeConfig')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('term.autoexec.executetarget') }}</span></Divider>
        </template>
        <template v-else>
          <span>{{ $t('term.autoexec.executetarget') }}</span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.executeNodeConfig)" @click.stop="handleUnfoldAndFold('executeNodeConfig')"></span>
        </template>
      </div>
      <div v-show="unfoldAndFold.executeNodeConfig">
        <TsFormItem
          v-if="executeConfig && executeConfig.preCondition"
          :label="$t('term.autoexec.precondition')"
        >
          <PreconditionDetail
            :defaultValue="executeConfig.preCondition"
            :canEdit="false"
          ></PreconditionDetail>
        </TsFormItem>
        <TsFormItem v-if="needExecuteNode" :label="$t('term.autoexec.executetarget')" :required="true">
          <AddTarget
            :id="combopId"
            ref="ref_executeNodeConfig"
            :value="executeConfig ? executeConfig.executeNodeConfig:{}"
            :canEdit="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify == 'runtime':true"
            :type="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify: 'runtime'"
            :executeConfig="executeValue"
            :runtimeParamList="runtimeParamList"
            :needBorder="needExecuteUser|| needProtocol"
            :filterSearchValue="filterSearchValue"
            :preCondition="executeConfig? executeConfig.preCondition : null"
            @on-ok="handleChange"
          ></AddTarget>
        </TsFormItem>
        <div v-else class="box-block text-tip">
          <div v-if="dataConfig && dataConfig.allPhasesAreRunnerOrSqlExecMode">
            {{ $t('message.autoexec.executerunnertip') }}
          </div>
          <div v-else>
            {{ $t('message.autoexec.notsetexecutertip') }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="hasServiceValue.executeUser || hasServiceValue.protocol" :class="getClassByBorder">
      <div :class="getFlexClass(unfoldAndFold.protocol)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.protocol)" @click.stop="handleUnfoldAndFold('protocol')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('term.autoexec.executeaccount') }}</span></Divider>
        </template>
        <template v-else>
          <span>{{ $t('term.autoexec.executeaccount') }}</span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.protocol)" @click.stop="handleUnfoldAndFold('protocol')"></span>
        </template>
      </div>
      <div v-show="unfoldAndFold.protocol">
        <TsFormItem v-if="hasServiceValue.protocol" :label="$t('page.protocol')" :required="true">
          <TsFormSelect
            ref="ref_protocol"
            v-model="protocol"
            v-bind="protocolForm"
            transfer
            @change="handleChange"
          ></TsFormSelect>
        </TsFormItem>
        <TsFormItem v-if="hasServiceValue.executeUser" :label="$t('term.autoexec.executeaccount')" :required="true">
          <TsFormInput
            ref="ref_executeUser"
            v-model="executeUser"
            v-bind="executeUserForm"
            border="border"
            @change="handleChange"
          ></TsFormInput>
        </TsFormItem>
      </div>
    </div>
    <div v-if="hasServiceValue.runtimeParamList" :class="getClassByBorder">
      <div :class="getFlexClass(unfoldAndFold.jobParam)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.jobParam)" @click.stop="handleUnfoldAndFold('jobParam')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('term.autoexec.jobparam') }}</span></Divider>
        </template>
        <template v-else>
          <span>{{ $t('term.autoexec.jobparam') }}</span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.jobParam)" @click.stop="handleUnfoldAndFold('jobParam')"></span>
        </template>
      </div>
      <div v-show="unfoldAndFold.jobParam">
        <div v-for="(item, pIndex) in runtimeParamList" :key="pIndex" class="mb-nm">
          <TsFormItem :label="item.name" :required="item.isRequired ? true : false">
            <Component
              :is="handleType(item.type)"
              ref="ref_jobParam"
              v-model="valueConfig[item.key]"
              style="margin-left: 4px;"
              :isRequired="item.isRequired"
              :defaultValue="item.defaultValue"
              :config="itemConfig[item.key]"
              :phaseList="getPhaseList(stepList)"
              @change="handleChange"
            ></Component>
          </TsFormItem>
        </div>
      </div>
    </div>
    <div :class="getClassByBorder">
      <div :class="getFlexClass(unfoldAndFold.otherParam)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.otherParam)" @click.stop="handleUnfoldAndFold('otherParam')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('term.autoexec.otherparam') }}</span></Divider>
        </template>
        <template v-else>
          <span>{{ $t('term.autoexec.otherparam') }}</span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.otherParam)" @click.stop="handleUnfoldAndFold('otherParam')"></span>
        </template>
      </div>
      <div v-show="unfoldAndFold.otherParam">
        <OtherParam v-if="!$utils.isEmpty(defaultData)" :serviceData="defaultData"></OtherParam>
      </div>
    </div>
    <SaveSetting v-if="isSaveDialog" v-model="isSaveDialog" @on-ok="okSave"></SaveSetting>
  </div>
</template>
<script>
import serviceMixin from '@/views/pages/autoexec/quick-service/service-catalog/service-mixin.js';
import Component from '@/views/pages/autoexec/components/param/view/index.js';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    AddTarget: () => import('@/views/pages/autoexec/detail/runnerDetail/add-target.vue'),
    SaveSetting: () => import('@/views/pages/autoexec/detail/runnerDetail/save-setting.vue'),
    OtherParam: () => import('@/views/pages/autoexec/quick-service/service-catalog/other-params'), // 其他参数
    ExpiredReasonAlert: () => import('@/views/pages/autoexec/quick-service/service-catalog/expired-reason-alert'), // 服务失效原因提示列表
    RunnerGroupSetting: () => import('@/views/pages/autoexec/detail/actionDetail/runnergroup-setting.vue'),
    RunnerGroupTagSetting: () => import('@/views/pages/autoexec/detail/actionDetail/runnergrouptag-setting.vue'),
    PreconditionDetail: () => import('@/views/pages/autoexec/detail/actionDetail/precondition-detail.vue'),
    ...Component
  },
  mixins: [serviceMixin],
  props: {},
  data() {
    return {
      defaultServiceData: null,
      loadingShow: false,
      isSaveDialog: false,
      unfoldAndFold: {
        // 展开收起
        jobName: true,
        scenarioForm: true,
        roundCount: true,
        executeNodeConfig: true,
        protocol: true,
        jobParam: true,
        otherParam: true, // 其他参数
        runnerGroupTag: true, // 执行器组标签
        runnerGroup: true // 执行器组
      },
      hasServiceValue: {
        // 是否服务那边有值
        scenarioId: false,
        roundCount: false,
        protocol: false,
        executeUser: false,
        executeNodeConfig: false,
        runtimeParamList: false,
        runnerGroupTag: false, // 执行器组标签
        runnerGroup: false, // 执行器组
        parallelCount: false,
        parallelPolicy: false
      },
      valueConfig: {}, //所有值对应的集合
      itemConfig: {}, //所以组件对应的渲染config集合
      scenarioId: null, // 场景id
      combopId: null, // 自动化组合工具id
      jobName: '', // 作业名称
      roundCount: 2, // 分批数量
      protocol: '', // 协议ID
      executeUser: '', // 执行用户
      executeNodeConfig: {}, // 执行目标
      scenarioList: [], //场景列表
      runnerGroup: {},
      runnerGroupTag: {},
      defaultRunnerGroupTag: {},
      dataConfig: {},
      paramValue: {},
      executeConfig: {},
      executeValue: {},
      runtimeParamList: [],
      stepList: [],
      paramKeyList: [],
      needRoundCount: false, // 是否需要显示分批数量
      needExecuteNode: false, // 是否需要显示执行目标
      needExecuteUser: false, // 是否需要显示执行用户
      needProtocol: false, // 是否需要显示协议
      needRunnerGroup: false, // 是否需要显示执行器组
      filterSearchValue: {},
      jobNameForm: {
        maxlength: 50,
        validateList: ['required', 'name-special']
      },
      roundCountForm: {
        // 分批数量
        dataList: this.$utils.getRoundCountList(),
        border: 'border',
        filterName: 'text',
        labelWidth: 0,
        hideLabel: true,
        // allowCreate: true, //与发布分批数设置保持一致
        search: true,
        transfer: true,
        desc: this.$t('term.autoexec.roundcountdescrition'),
        validateList: ['required', 'maxNum']
      },
      protocolForm: {
        // 连接协议
        multiple: false,
        dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getProtocolDataList,
        placeholder: this.$t('page.pleaseselect'),
        validateList: ['required']
      },
      executeUserForm: {
        // 执行账户
        validateList: ['required']
      },
      isReady: false,
      parallelPolicy: {
        value: ''
      },
      parallelCount: null,
      parallelCountForm: {
        // 分批数量
        dataList: this.$utils.getRoundCountList(),
        border: 'border',
        filterName: 'text',
        labelWidth: 0,
        hideLabel: true,
        search: true,
        transfer: true,
        desc: this.$t('term.autoexec.paralldesc'),
        validateList: ['required', 'maxNum']
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initData();
    this.defaultValue();
    this.$nextTick(() => {
      this.isReady = true;
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    defaultValue() {
      if (this.source == 'form') {
        let deepCloneData = this.$utils.deepClone(this.serviceData);
        for (let key in deepCloneData) {
          if (this.hasOwnProperty(key)) {
            this[key] = deepCloneData[key];
          } else if (key == 'name' && deepCloneData[key]) {
            this.jobName = deepCloneData[key];
          }
        }
        if (!this.$utils.isEmpty(this.runtimeParamList)) {
          this.initConfig(deepCloneData['runtimeParamMap']);
        }
        if (this.$utils.isEmpty(this.runnerGroupTag) || this.runnerGroupTag['mappingMode'] == 'constant' && this.$utils.isEmpty(this.runnerGroupTag['value'])) {
          this.runnerGroupTag = this.$utils.deepClone(this.defaultRunnerGroupTag);
        }
      }
    },
    handleChange() {
      let param = this.$utils.deepClone(this.getSaveData());
      if (!this.$utils.isEmpty(param)) {
        // 删除计划开始时间和执行方式，后端不需要这两个参数
        delete param.planStartTime;
        delete param.triggerType;
      }
      this.$emit('set-value', param);
    },
    defaultInitData() {
      // 默认初始值
      for (let key in this.unfoldAndFold) {
        this.unfoldAndFold[key] = true;
      }
      for (const key in this.hasServiceValue) {
        this.hasServiceValue[key] = false;
      }
      this.scenarioId = null; // 场景id
      this.combopId = null; // 自动化组合工具id
      this.valueConfig = {}; //所有值对应的集合
      this.itemConfig = {};//所以组件对应的渲染config集合
      this.scenarioList = [];
      this.jobName = '';
      this.roundCount = null; // 分批数量
      this.protocol = ''; // 执行目标
      this.executeUser = '';// 执行用户
      this.executeNodeConfig = {};// 连接协议
      this.executeConfig = {};
      this.filterSearchValue = {};
      this.paramKeyList = []; // 没有设置执行目标key值
      this.needExecuteUser = '';
      this.needProtocol = '';
      this.parallelCount = null;
    },
    async initData() {
      // 初始化
      this.defaultInitData();
      let defaultData = this.$utils.deepClone(this.defaultData);
      let serviceData = this.$utils.deepClone(this.serviceData);
      let {config = {}, combopId, combopName} = defaultData || {};
      let {executeNodeConfig = {}, runtimeParamList = []} = config || {};
      let {value = ''} = executeNodeConfig || {};
      if (!this.$utils.isEmpty(defaultData)) {
        if (config && !this.$utils.isEmpty(config)) {
          for (let key in config) {
            if (key && config[key] && this.hasServiceValue.hasOwnProperty(key)) {
              // 映射关系为notsetup(不设置)时，需要把对应的组件显示出来
              if (config[key]['mappingMode'] == 'notsetup') {
                this.$set(this.hasServiceValue, [key], true);
              } else if (config[key]['mappingMode'] == 'constant' && key == 'runnerGroupTag') {
                // 执行器组标签映射关系为不设置时，需要把对应执行器组标签显示出来
                this.$set(this.hasServiceValue, [key], true);
              }
            }
            if (key === 'parallelPolicy') {
              this.parallelPolicy = config.parallelPolicy;
            }
          }
          if (!this.$utils.isEmpty(runtimeParamList)) {
            // 作业参数映射关系为不设置时，需要把对应作业参数显示出来
            runtimeParamList.forEach((item) => {
              if (item && item.mappingMode == 'notsetup') {
                this.$set(this.hasServiceValue, 'runtimeParamList', true);
                this.paramKeyList.push(item.key);
              }
            });
          }
        }
        this.filterSearchValue = serviceData && !this.$utils.isEmpty(serviceData.executeNodeConfig) ? serviceData.executeNodeConfig : !this.$utils.isEmpty(value) ? value : {}; // 执行目标值回显
        this.combopId = combopId || null;
        if (combopName) {
          this.jobName = combopName;
        }
        if (this.combopId) {
          await this.getCombopDetail();
          if (!this.needExecuteNode) { //不需要执行目标时，不需要把执行目标显示出来
            this.hasServiceValue.executeNodeConfig = false;
          }
        }
      }
    },
    getCombopDetail() {
      // 获取自动化组合工具详情
      return this.$api.autoexec.action
        .getActionDetail({id: this.combopId}).then((res) => {
          if (res.Status == 'OK') {
            this.dataConfig = res.Return;
            let {config = {}, needExecuteNode = false, needExecuteUser = false, needProtocol = false, needRoundCount = false, needRunnerGroup = false} = this.dataConfig || {};
            let {executeConfig = {}, scenarioList = [], combopPhaseList = []} = config || {};
            let {executeUser: configexecuteUser, protocolId = null, executeNodeConfig = {}, runnerGroupTag = {}} = executeConfig || {};
            const {filter = {}} = executeNodeConfig;
            this.stepList = combopPhaseList;
            this.needExecuteNode = needExecuteNode;
            this.needExecuteUser = needExecuteUser;
            this.needProtocol = needProtocol;
            this.needRoundCount = needRoundCount;
            this.needRunnerGroup = needRunnerGroup;
            this.executeConfig = executeConfig;
            if (this.executeConfig.whenToSpecify == 'runtime') { // 过滤器运行在执行，需要把执行目标值清空
              this.$set(this.executeConfig, 'executeNodeConfig', this.filterSearchValue || {});
              if (this.$utils.isEmpty(this.filterSearchValue)) {
                this.filterSearchValue = filter; // 处理运行时指定执行目标值回显的问题
              }
            } else {
              this.filterSearchValue = !this.$utils.isEmpty(this.filterSearchValue) ? this.filterSearchValue : filter || {};
            }
            if (this.$utils.isEmpty(this.runnerGroupTag) || this.runnerGroupTag && (this.runnerGroupTag['mappingMode'] == 'constant' && this.$utils.isEmpty(this.runnerGroupTag['value']))) {
              this.defaultRunnerGroupTag = runnerGroupTag; // 执行器组标签，需要单独处理，服务目录设置为空，组合工具会有默认值，会把空的替换，需要单独处理，可以自行选择
            }
            this.runtimeParamList = this.dataConfig.config.runtimeParamList.filter((item) => {
              return this.paramKeyList.includes(item.key);
            });
            let {executeUser = '', protocol = null} = this.serviceData || {};
            // 连接协议和执行账户回显
            if (executeUser || configexecuteUser) {
              this.executeValue['executeUser'] = executeUser || configexecuteUser;
            }
            if (protocol || protocolId) {
              this.executeValue['protocolId'] = protocol || protocolId;
            }
            // 场景
            if (!this.$utils.isEmpty(scenarioList) && !this.defaultData.config.scenarioId) {
            // 有场景列表，但是场景为空，需要把场景模块显示出来
              this.scenarioList = scenarioList;
              this.$set(this.hasServiceValue, 'scenarioId', true);
            }
            if (this.runtimeParamList && !this.$utils.isEmpty(this.runtimeParamList)) {
              this.initConfig(); // 设置作业参数值
            }
          }
        });
    },
    initConfig(defaultValue = {}) {
      // 初始化作业参数列表数据
      this.itemConfig = {};
      this.valueConfig = {};
      this.runtimeParamList instanceof Array && this.runtimeParamList.forEach(data => {
        let config = Object.assign({}, data.config ? data.config : data);
        config.desc = data.description;
        if (config.validateList && !config.validateList.includes('required')) {
          data.isRequired && config.validateList.push('required');
        } else if (this.$utils.isEmpty(config.validateList)) {
          config.validateList = data.isRequired ? ['required'] : [];
        }
        if (data.type == 'file') {
          config.showNumber = 6;
        }
        if (data.type == 'node') {
          config.showNumber = 6;
        }
        config.type = data.type;
        this.$set(this.itemConfig, data.key, config);
        this.$set(this.valueConfig, data.key, !this.$utils.isEmpty(defaultValue) && !this.$utils.isEmpty(defaultValue[data.key]) ? defaultValue[data.key] : data.defaultValue);
      });
    },
    handleUnfoldAndFold(moduleName) {
      // 展开收起
      if (this.unfoldAndFold.hasOwnProperty(moduleName)) {
        this.unfoldAndFold[moduleName] = !this.unfoldAndFold[moduleName];
      }
    },
    getSaveData(data) {
      let params = {
        serviceId: this.defaultData.id,
        name: this.jobName,
        runtimeParamMap: this.runtimeParamMap,
        planStartTime: data ? data.planStartTime : null,
        triggerType: data ? data.triggerType : null
      };
      let executeNode = this.$refs.ref_executeNodeConfig ? this.$refs.ref_executeNodeConfig.getValue() : ''; // 执行目标
      let runtimeParamMap = {};
      this.runtimeParamList && this.runtimeParamList.forEach((item) => {
        if (item && item.key) {
          this.$set(runtimeParamMap, [item.key], this.valueConfig[item.key]);
        }
      });
      if (this.protocol) {
        params.protocol = this.protocol;
      }
      if (this.scenarioId) {
        params.scenarioId = this.scenarioId;
      }
      if (this.roundCount) {
        params.roundCount = this.roundCount;
      }
      if (this.executeUser) {
        params.executeUser = this.executeUser;
      }
      if (executeNode) {
        params.executeNodeConfig = executeNode;
      }
      if (!this.$utils.isEmpty(runtimeParamMap)) {
        params.runtimeParamMap = runtimeParamMap;
      }
      if (!this.$utils.isEmpty(this.runnerGroup)) {
        params.runnerGroup = this.runnerGroup;
      }
      if (!this.$utils.isEmpty(this.runnerGroupTag)) {
        params.runnerGroupTag = this.runnerGroupTag;
      }
      if (this.parallelCount) {
        params.parallelCount = this.parallelCount;
      }
      return params;
    },
    valid() {
      let isValid = true;
      let refs = this.$refs;
      for (let key in refs) {
        let refName = key ? key.split('_')[1] : '';
        if (refs[key] instanceof Array && refs[key].length) {
          refs[key].forEach((item) => {
            if (item && item.valid && !item.valid()) {
              isValid = false;
              this.handleUnfoldAndFold(refName);
            }
          });
        } else {
          if (refs[key] && refs[key].valid && !refs[key].valid()) {
            isValid = false;
            this.handleUnfoldAndFold(refName);
          }
        }
      }
      return isValid;
    },
    saveService() {
      // 保存
      if (!this.valid()) {
        return false;
      }
      this.isSaveDialog = true;
    },
    saveExecuteService(data) {
      // 立即执行
      if (!this.valid()) {
        return false;
      }
      let params = this.getSaveData(data);
      this.$api.autoexec.catalogManage.saveJobCreate(params).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.addsuccess'));
          this.$router.push({
            path: '/job-detail',
            query: {id: res.Return.jobId}
          });
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    okSave(dataObj) {
      // 保存，添加执行时间和执行方式保存按钮
      this.saveExecuteService(dataObj);
    },
    tocatalogManagePage(key) {
      // 跳转到目录管理页面，定位到具体失效的作业参数
      window.open(HOME + '/autoexec.html#/catalog-manage?id=' + this.defaultData.id + '&key=' + key, '_blank');
    }
  },
  filter: {},
  computed: {
    handleType() {
      return (value) => {
        let type = value + 'Handler';
        type = Component[type] ? type : 'defaultInput';
        return type;
      };
    },
    getPhaseList() {
      return (phaseList) => {
        let list = [];
        if (phaseList && phaseList.length > 0) {
          list = phaseList.map(item => {
            return {
              text: item.name,
              value: item.name
            };
          });
        }
        return list;
      };
    },
    getClassByBorder() {
      return this.border == 'border' ? 'radius-lg bg-op padding mt-nm' : '';
    }
  },
  watch: {
    serviceData: {
      handler(val) {
        let deepCloneData = this.$utils.deepClone(val);
        if (this.isReady && !this.$utils.isSame(val, this.defaultServiceData)) {
          this.defaultValue();
          this.defaultServiceData = deepCloneData;
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.no-form-service-container {
  .grid {
    display: grid;
  }
  .desc-info {
    margin-top: -10px;
    margin-left: 120px;
  }
}
</style>
