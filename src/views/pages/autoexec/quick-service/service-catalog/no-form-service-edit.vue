<template>
  <div>
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
          ref="jobName"
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
          ref="scenarioForm"
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
    <div v-if="hasServiceValue.roundCount" :class="getClassByBorder">
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
      <TsFormItem v-show="unfoldAndFold.roundCount" :label="$t('term.autoexec.batchquantity')" :required="true">
        <TsFormSelect
          ref="roundCount"
          v-model="roundCount"
          v-bind="roundCountForm"
          transfer
          @change="handleChange"
        ></TsFormSelect>
      </TsFormItem>
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
            @on-ok="handleChange"
          ></AddTarget>
        </TsFormItem>
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
            ref="protocol"
            v-model="protocol"
            v-bind="protocolForm"
            transfer
            @change="handleChange"
          ></TsFormSelect>
        </TsFormItem>
        <TsFormItem v-if="hasServiceValue.executeUser" :label="$t('term.autoexec.executeaccount')" :required="true">
          <TsFormInput
            ref="executeUser"
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
              ref="jobParam"
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
    ...Component
  },
  mixins: [serviceMixin],
  props: {},
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
  created() {},
  beforeMount() {},
  async mounted() {
    await this.initData();
    this.defaultValue();
    this.handleChange();
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
        for (let key in this.serviceData) {
          if (this.hasOwnProperty(key)) {
            this[key] = this.serviceData[key];
          } else if (key == 'name') {
            this.jobName = this.serviceData[key];
          }
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
      this.defaultInitData();
      if (!this.$utils.isEmpty(this.defaultData)) {
        if (this.defaultData.config && !this.$utils.isEmpty(this.defaultData.config)) {
          for (let key in this.defaultData.config) {
            if (key && this.defaultData.config[key] && this.hasServiceValue.hasOwnProperty(key) && (this.defaultData.config[key]['mappingMode'] == 'notsetup')) {
              // 映射关系为notsetup时，需要把对应的组件显示出来
              this.$set(this.hasServiceValue, [key], true);
            }
          }
          if (this.defaultData.config && !this.$utils.isEmpty(this.defaultData.config.runtimeParamList)) {
            // 作业参数映射关系为不设置时，需要把对应作业参数显示出来
            this.defaultData.config.runtimeParamList.forEach((item) => {
              if (item && item.mappingMode == 'notsetup') {
                this.$set(this.hasServiceValue, 'runtimeParamList', true);
              }
              if (item && item.mappingMode == 'notsetup') {
                this.paramKeyList.push(item.key);
              }
            });
          }
        }
        let {config = {}} = this.defaultData || {};
        let {executeNodeConfig = {}} = config || {};
        let {value = ''} = executeNodeConfig || {};
        this.filterSearchValue = this.serviceData && !this.$utils.isEmpty(this.serviceData.executeNodeConfig) ? this.serviceData.executeNodeConfig : !this.$utils.isEmpty(value) ? value : {}; // 执行目标值回显
        this.combopId = this.defaultData.combopId || null;
        if (!this.$utils.isEmpty(this.defaultData) && this.defaultData.combopName) {
          this.jobName = this.defaultData.combopName;
        }
        if (this.combopId) {
          return this.getCombopDetail();
        }
      }
    },
    getCombopDetail() {
      return this.$api.autoexec.action
        .getActionDetail({id: this.combopId}).then((res) => {
          if (res.Status == 'OK') {
            this.dataConfig = res.Return;
            this.stepList = this.dataConfig.config.combopPhaseList;
            this.executeConfig = this.dataConfig.config.executeConfig || {};
            this.$set(this.executeConfig, 'executeNodeConfig', this.filterSearchValue); // 执行目标回显
            this.runtimeParamList = this.dataConfig.config.runtimeParamList.filter((item) => {
              return this.paramKeyList.includes(item.key);
            });
            let {executeUser = '', protocol = null} = this.serviceData || {};
            let {config = {}} = this.dataConfig || {};
            let {executeConfig = {}, scenarioList = []} = config || {};
            let {executeUser: configexecuteUser, protocolId = null} = executeConfig || {};
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
    getSaveData(data) {
      let params = {
        serviceId: this.defaultData.id,
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
      return params;
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
    defaultData: {
      handler() {
        this.initData();
      },
      deep: true
    },
    serviceData: {
      handler() {
        this.defaultValue();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>
