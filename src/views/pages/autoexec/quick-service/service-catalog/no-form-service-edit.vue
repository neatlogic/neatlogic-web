<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <ExpiredReasonAlert :serviceData="serviceData"></ExpiredReasonAlert>
    <div class="radius-lg bg-op padding">
      <div class="flex-between" :class="unfoldAndFold.jobName ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.job') }}<i class="require-label"></i></span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.jobName ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('jobName')"></span>
      </div>
      <TsFormItem v-show="unfoldAndFold.jobName" label="" :labelWidth="0">
        <TsFormInput
          ref="jobName"
          v-model="jobName"
          border="border"
          v-bind="jobNameForm"
        ></TsFormInput>
      </TsFormItem>
    </div>
    <div v-if="hasServiceValue.scenarioId" class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.scenarioForm ? 'mb-sm' : ''">
        <span>{{ $t('page.scene') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.scenarioForm ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('scenarioForm')"></span>
      </div>
      <TsFormItem v-show="unfoldAndFold.scenarioForm" :label="$t('page.scene')" :required="true">
        <TsFormRadio
          ref="scenarioForm"
          v-model="scenarioId"
          :dataList="scenarioList"
          valueName="scenarioId"
          textName="scenarioName"
          :isClearSameValue="true"
          :validateList="['required']"
        ></TsFormRadio>
      </TsFormItem>
    </div>
    <div v-if="hasServiceValue.roundCount" class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.roundCount ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.batchsetting') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.roundCount ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('roundCount')"></span>
      </div>
      <TsFormItem v-show="unfoldAndFold.roundCount" :label="$t('term.autoexec.batchquantity')" :required="true">
        <TsFormSelect
          ref="roundCount"
          v-model="roundCount"
          v-bind="roundCountForm"
          transfer
        ></TsFormSelect>
      </TsFormItem>
    </div>
    <div v-if="hasServiceValue.executeNodeConfig" class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.executeNodeConfig ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.executetarget') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.executeNodeConfig ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('executeNodeConfig')"></span>
      </div>
      <div v-show="unfoldAndFold.executeNodeConfig">
        <TsFormItem :label="$t('term.autoexec.executetarget')" :required="true">
          <AddTarget
            :id="combopId"
            ref="executeNodeConfig"
            :value="executeConfig ? executeConfig.executeNodeConfig:{}"
            :canEdit="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify == 'runtime':true"
            :type="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify: 'runtime'"
            :executeConfig="executeValue"
            :runtimeParamList="runtimeParamList"
            :needBorder="needExecuteUser|| needProtocol"
            :filterSearchValue="filterSearchValue"
          ></AddTarget>
        </TsFormItem>
      </div>
    </div>
    <div v-if="hasServiceValue.executeUser || hasServiceValue.protocol" class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.protocol ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.executeaccount') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.protocol ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('protocol')"></span>
      </div>
      <div v-show="unfoldAndFold.protocol">
        <TsFormItem v-if="hasServiceValue.protocol" :label="$t('page.protocol')" :required="true">
          <TsFormSelect
            ref="protocol"
            v-model="protocol"
            v-bind="protocolForm"
            transfer
          ></TsFormSelect>
        </TsFormItem>
        <TsFormItem v-if="hasServiceValue.executeUser" :label="$t('term.autoexec.executeaccount')" :required="true">
          <TsFormInput
            ref="executeUser"
            v-model="executeUser"
            v-bind="executeUserForm"
            border="border"
          ></TsFormInput>
        </TsFormItem>
      </div>
    </div>
    <div v-if="hasServiceValue.runtimeParamList" class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.jobParam ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.jobparam') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.jobParam ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('jobParam')"></span>
      </div>
      <div v-show="unfoldAndFold.jobParam">
        <div v-for="(item, pIndex) in runtimeParamList" :key="pIndex" class="mb-nm">
          <TsFormItem :label="item.name" :required="item.isRequired ? true : false">
            <Component
              :is="handleType(item.type)"
              ref="jobParam"
              v-model="valueConfig[item.key]"
              style="margin-left: 4px;"
              :isRequired="item.isRequired"
              :defaultValue="item.defaultValue"
              :config="itemConfig[item.key]"
              :phaseList="getPhaseList(stepList)"
            ></Component>
          </TsFormItem>
        </div>
      </div>
    </div>
    <div class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.otherParam ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.otherparam') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.otherParam ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('otherParam')"></span>
      </div>
      <div v-show="unfoldAndFold.otherParam">
        <OtherParam v-if="!$utils.isEmpty(serviceData)" :serviceData="serviceData"></OtherParam>
      </div>
    </div>
    <SaveSetting v-if="isSaveDialog" v-model="isSaveDialog" @on-ok="okSave"></SaveSetting>
  </div>
</template>
<script>
import Component from '@/views/pages/autoexec/components/param/view/index.js';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    AddTarget: resolve => require(['@/views/pages/autoexec/detail/runnerDetail/add-target.vue'], resolve),
    SaveSetting: resolve => require(['@/views/pages/autoexec/detail/runnerDetail/save-setting.vue'], resolve),
    OtherParam: resolve => require(['./other-params'], resolve),
    ExpiredReasonAlert: resolve => require(['./expired-reason-alert'], resolve), // 服务失效原因提示列表
    ...Component
  },
  mixins: [],
  props: {
    serviceData: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
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
        otherParam: true // 其他参数
      },
      hasServiceValue: {
        // 是否服务那边有值
        scenarioId: false,
        roundCount: false,
        protocol: false,
        executeUser: false,
        executeNodeConfig: false,
        runtimeParamList: false
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
      dataConfig: {},
      paramValue: {},
      executeConfig: {},
      executeValue: {},
      runtimeParamList: [],
      stepList: [],
      paramKeyList: [],
      needExecuteUser: '',
      needProtocol: '',
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
        allowCreate: true,
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
      }
    };
  },
  beforeCreate() {},
  created() {
    this.initData();
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
    defaultIniData() {
      // 默认初始值
      this.unfoldAndFold = {
        // 展开收起
        jobName: true, // 作业名称
        scenarioForm: true, // 场景
        roundCount: true, // 分批数量
        executeNodeConfig: true, // 执行目标
        protocol: true, // 连接协议
        jobParam: true, // 作业参数
        otherParam: true // 其他参数
      };
      this.hasServiceValue = {
        // 是否服务那边有值
        scenarioId: false,
        roundCount: false,
        protocol: false,
        executeUser: false,
        executeNodeConfig: false,
        runtimeParamList: false
      };
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
    },
    initData() {
      // 初始化
      this.defaultIniData();
      if (!this.$utils.isEmpty(this.serviceData)) {
        if (this.serviceData.config && !this.$utils.isEmpty(this.serviceData.config)) {
          for (let key in this.serviceData.config) {
            if (key && this.serviceData.config[key] && this.hasServiceValue.hasOwnProperty(key) && (this.serviceData.config[key]['mappingMode'] == 'notsetup')) {
              // 映射关系为notsetup时，需要把对应的组件显示出来
              this.$set(this.hasServiceValue, [key], true);
            }
          }
          if (this.serviceData.config && !this.$utils.isEmpty(this.serviceData.config.runtimeParamList)) {
            // 作业参数映射关系为不设置时，需要把对应作业参数显示出来
            this.serviceData.config.runtimeParamList.forEach((item) => {
              if (item && item.mappingMode == 'notsetup') {
                this.$set(this.hasServiceValue, 'runtimeParamList', true);
              }
              if (item && item.mappingMode == 'notsetup') {
                this.paramKeyList.push(item.key);
              }
            });
          }
        }
        this.filterSearchValue = !this.$utils.isEmpty(this.serviceData.config) ? this.serviceData.config.executeNodeConfig.value : {}; // 执行目标值回显
        this.combopId = this.serviceData.combopId || null;
        if (!this.$utils.isEmpty(this.serviceData) && this.serviceData.combopName) {
          this.jobName = this.serviceData.combopName;
        }
        this.getCombopDetail();
      }
    },
    initConfig() {
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
        this.$set(this.valueConfig, data.key, data.defaultValue);
      });
    },
    handleUnfoldAndFold(moduleName) {
      // 展开收起
      if (this.unfoldAndFold.hasOwnProperty(moduleName)) {
        this.unfoldAndFold[moduleName] = !this.unfoldAndFold[moduleName];
      }
    },
    valid() {
      let isValid = true;
      let formList = ['jobName', 'roundCount', 'executeUser', 'executeNodeConfig', 'protocol'];
      let paramFormList = this.$refs.jobParam || [];
      !this.$utils.isEmpty(formList) && formList.forEach((item) => {
        if (this.$refs[item] && !this.$refs[item].valid()) {
          if (!this.unfoldAndFold[item]) {
            this.handleUnfoldAndFold(item); // 验证不通过，打开对应收起的模块
          }
          isValid = false;
        }
      });
      !this.$utils.isEmpty(paramFormList) && paramFormList.forEach((item) => {
        // 作业参数必填校验
        if (item && !item.valid()) {
          if (!this.unfoldAndFold['jobParam']) {
            this.handleUnfoldAndFold('jobParam');
          }
          isValid = false;
        }
      });
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
      let params = {
        serviceId: this.serviceData.id,
        name: this.jobName,
        runtimeParamMap: this.runtimeParamMap,
        planStartTime: data ? data.planStartTime : null,
        triggerType: data ? data.triggerType : null
      };
      let executeNode = this.$refs.executeNodeConfig ? this.$refs.executeNodeConfig.getValue() : ''; // 执行目标
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
    getCombopDetail() {
      if (!this.combopId) {
        return;
      }
      let data = {
        id: this.combopId
      };
      this.loadingShow = true;
      this.$api.autoexec.action
        .getActionDetail(data)
        .then(res => {
          this.loadingShow = false;
          if (res.Status == 'OK') {
            this.dataConfig = res.Return;
            this.stepList = this.dataConfig.config.combopPhaseList;
            this.executeConfig = this.dataConfig.config.executeConfig || {};
            this.$set(this.executeConfig, 'executeNodeConfig', this.filterSearchValue); // 执行目标回显
            this.runtimeParamList = this.dataConfig.config.runtimeParamList.filter((item) => {
              return this.paramKeyList.includes(item.key);
            });
            if (this.dataConfig.config.executeConfig && !this.$utils.isEmpty(this.dataConfig.config.executeConfig)) {
              // 连接协议和执行账户回显
              this.executeValue['executeUser'] = this.dataConfig.config.executeConfig['executeUser'];
              this.executeValue['protocolId'] = this.dataConfig.config.executeConfig['protocolId'];
            }
            // 场景
            if (this.dataConfig && this.dataConfig.config && !this.$utils.isEmpty(this.dataConfig.config.scenarioList) && !this.serviceData.config.scenarioId) {
              // 有场景列表，但是场景为空，需要把场景模块显示出来
              this.scenarioList = this.dataConfig.config.scenarioList;
              this.$set(this.hasServiceValue, 'scenarioId', true);
            }
            if (this.runtimeParamList && !this.$utils.isEmpty(this.runtimeParamList)) {
              this.initConfig(); // 设置作业参数值
            }
          }
        })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    tocatalogManagePage(key) {
      // 跳转到目录管理页面，定位到具体失效的作业参数
      window.open(HOME + '/autoexec.html#/catalog-manage?id=' + this.serviceData.id + '&key=' + key, '_blank');
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
    }
  },
  watch: {
    serviceData: {
      handler() {
        this.initData();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>
