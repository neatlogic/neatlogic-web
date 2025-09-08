<template>
  <div v-if="isReady && !$utils.isEmpty(serviceData)">
    <TsForm
      v-model="basicInfoFormValue"
      class="other-params-wrap"
      :item-list="basicInfoItemList"
    ></TsForm>
    <TsForm
      v-if="!$utils.isEmpty(otherParamItemList)"
      v-model="otherParamFormValue"
      class="other-params-wrap"
      :item-list="otherParamItemList"
    ></TsForm>
    <div class="other-params-wrap">
      <TsFormItem v-for="(item, pIndex) in paramsList" :key="pIndex" :label="item.name">
        <TsFormSelect
          v-if="item.mappingMode == 'formattr'"
          ref="mappingModeForm"
          v-model="valueConfig[item.key]"
          :dataList="formList.dataList"
          valueName="uuid"
          textName="label"
          transfer
          border="border"
          :readonly="true"
        ></TsFormSelect>
        <Component
          :is="handleType(item.type)"
          v-else
          v-model="valueConfig[item.key]"
          style="margin-left: 4px"
          :readonly="true"
          :defaultValue="item.defaultValue"
          :config="itemConfig[item.key]"
          :phaseList="getPhaseList(stepList)"
        ></Component>
      </TsFormItem>
    </div>
    <TsFormItem :label="$t('term.deploy.actuatorgrouptag')">
      <div :class="runnerGroupTag.mappingMode == 'formattr' || runnerGroupTag.mappingMode == 'constant' ? 'form-wrap-box' : ''">
        <template v-if="runnerGroupTag.mappingMode == 'runtimeparam'">
          <RunnerGroupTagSetting
            ref="runnerGroupTag"
            :config="runnerGroupTag"
            :readonly="true"
            :runtimeParamList="paramsList"
          ></RunnerGroupTagSetting>
        </template>
        <template v-else-if="runnerGroupTag.mappingMode == 'formattr'">
          <template v-if="!$utils.isEmpty(runnerGroupTag.value)">
            <TsFormSelect
              ref="runnerGroupTag"
              v-model="runnerGroupTag.value"
              :dataList="formDataList"
              valueName="uuid"
              textName="label"
              transfer
              border="border"
              class="pr-sm form-li-width"
              :validateList="['required']"
            ></TsFormSelect>
          </template>
          <template v-else>
            <span class="text-tip">{{ $t('page.form') }}</span>
            <span class="text-tip ml-nm">-</span>
          </template>
        </template>
        <template v-else-if="runnerGroupTag.mappingMode === 'constant'">
          <template v-if="!$utils.isEmpty(runnerGroupTag.value)">
            <RunnerGroupTagSetting
              ref="runnerGroupTag"
              :config="runnerGroupTag"
              :runtimeParamList="paramsList"
              :readonly="true"
            ></RunnerGroupTagSetting>
          </template>
          <template v-else>
            <span class="text-tip">{{ $t('page.constant') }}</span>
            <span class="text-tip ml-nm">-</span>
          </template>
        </template>
      </div>
      <div class="text-tip">
        {{ $t('page.autoexeccomboprunnergrouptagtips') }}
      </div>
    </TsFormItem>
    <TsFormItem v-if="dataConfig.needRunnerGroup" :label="$t('page.autoexeccomboprunnergrouplabel')">
      <div>
        <template v-if="dataConfig && dataConfig.existRunnerOrSqlExecMode && runnerGroup">
          <template v-if="runnerGroup.mappingMode === 'runtimeparam'">
            <RunnerGroupSetting
              ref="runnerGroup"
              :config="runnerGroup"
              :runtimeParamList="paramsList"
              :readonly="true"
            ></RunnerGroupSetting>
          </template>
          <div :class="runnerGroup.mappingMode === 'constant' || runnerGroup.mappingMode == 'formattr' ? 'form-wrap-box' : ''">
            <RunnerGroupSetting
              v-if="runnerGroup.mappingMode === 'constant'"
              ref="runnerGroup"
              :config="runnerGroup"
              :runtimeParamList="paramsList"
              :readonly="true"
            ></RunnerGroupSetting>
            <TsFormSelect
              v-else-if="runnerGroup.mappingMode == 'formattr'"
              ref="runnerGroup"
              v-model="runnerGroup.value"
              :dataList="formDataList"
              valueName="uuid"
              textName="label"
              transfer
              border="border"
              class="pr-sm form-li-width"
              :validateList="['required']"
            ></TsFormSelect>
          </div>
        </template>
        <div v-if="dataConfig && !dataConfig.existRunnerOrSqlExecMode" class="text-tip">
          {{ $t('message.autoexec.norunnerphaserunnergrouptips') }}
        </div>
        <div v-else class="text-tip">
          {{ $t('page.autoexeccomboprunnergrouptips') }}
        </div>
      </div>
    </TsFormItem>
    <TsFormItem
      v-if="executeConfig && executeConfig.preCondition"
      :label="$t('term.autoexec.precondition')"
    >
      <PreconditionDetail
        :defaultValue="preCondition"
        :canEdit="false"
      ></PreconditionDetail>
    </TsFormItem>
    <TsFormItem :label="$t('term.autoexec.executetarget')">
      <TsFormSelect
        v-if="executeNode.mappingMode == 'formattr'"
        ref="mappingModeForm"
        v-model="executeNode.value"
        :dataList="formList.dataList"
        valueName="uuid"
        textName="label"
        transfer
        border="border"
        :readonly="true"
      ></TsFormSelect>
      <AddTarget
        v-else-if="needExecuteNode"
        :id="combopId"
        ref="addTarget"
        :value="executeConfig ? executeConfig.executeNodeConfig : {}"
        :canEdit="false"
        :type="executeConfig && executeConfig.whenToSpecify ? executeConfig.whenToSpecify : 'runtime'"
        :executeConfig="executeValue"
        :runtimeParamList="paramsList"
        :needBorder="needExecuteUser || needProtocol"
        :filterSearchValue="filterSearchValue"
      ></AddTarget>
      <div v-else class="text-tip">
        <div v-if="dataConfig && dataConfig.allPhasesAreRunnerOrSqlExecMode">
          {{ $t('message.autoexec.executerunnertip') }}
        </div>
        <div v-else>
          {{ $t('message.autoexec.notsetexecutertip') }}
        </div>
      </div>
    </TsFormItem>
  </div>
</template>
<script>
import Component from '@/views/pages/autoexec/components/param/readonly/index.js';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsSheet: () => import('@/resources/plugins/TsSheet/TsSheet.vue'),
    SaveSetting: () => import('@/views/pages/autoexec/detail/runnerDetail/save-setting.vue'),
    AddTarget: () => import('@/views/pages/autoexec/detail/runnerDetail/add-target.vue'),
    RunnerGroupSetting: () => import('@/views/pages/autoexec/detail/actionDetail/runnergroup-setting.vue'),
    RunnerGroupTagSetting: () => import('@/views/pages/autoexec/detail/actionDetail/runnergrouptag-setting.vue'),
    PreconditionDetail: () => import('@/views/pages/autoexec/detail/actionDetail/precondition-detail.vue'),
    ...Component
  },
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
      isReady: false,
      basicInfoFormValue: {
        name: '',
        isActive: 0,
        authorityList: [],
        description: '',
        combopId: null,
        formUuid: null
      },
      dataConfig: null,
      needExecuteNode: false, // 是否需要显示执行目标
      filterSearchValue: {},
      executeConfig: {},
      executeValue: {},
      valueConfig: {},
      itemConfig: {},
      needExecuteUser: '',
      needProtocol: '',
      paramsList: [],
      combopId: null,
      executeNode: {},
      runnerGroupTag: {
        mappingMode: 'constant'
      },
      runnerGroup: {
        mappingMode: 'constant'
      },
      formList: {
        type: 'select',
        valueName: 'uuid',
        textName: 'label',
        transfer: true,
        border: 'border',
        readonly: true,
        dataList: []
      },
      otherParamFormValue: {},
      otherParamItemList: [],
      otherFormList: [
        {
          name: 'scenarioId',
          label: this.$t('page.scene'),
          constantMappingMode: {
            type: 'radio',
            valueName: 'scenarioId',
            textName: 'scenarioName',
            allowToggle: true,
            readonly: true,
            dataList: []
          }
        },
        {
          name: 'roundCount',
          label: this.$t('term.autoexec.batchquantity'),
          constantMappingMode: {
            type: 'select',
            dataList: this.$utils.getRoundCountList(),
            border: 'border',
            filterName: 'text',
            allowCreate: true,
            search: true,
            transfer: true,
            desc: this.$t('term.autoexec.roundcountdescrition'),
            readonly: true
          }
        },
        {
          name: 'parallelCount',
          label: this.$t('term.autoexec.parall'),
          constantMappingMode: {
            type: 'select',
            dataList: this.$utils.getRoundCountList(),
            border: 'border',
            filterName: 'text',
            allowCreate: true,
            search: true,
            transfer: true,
            desc: this.$t('term.autoexec.paralldesc'),
            readonly: true
          }
        },
        {
          label: this.$t('page.protocol'),
          name: 'protocol',
          constantMappingMode: {
            multiple: false,
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getProtocolDataList,
            readonly: true,
            type: 'select'
          }
        },
        {
          label: this.$t('page.executeuser'),
          name: 'executeUser',
          constantMappingMode: {
            readonly: true,
            type: 'text'
          }
        }
      ],
      basicInfoItemList: [
        {
          type: 'text',
          name: 'name',
          maxlength: 50,
          label: this.$t('page.name'),
          readonly: true
        },
        {
          type: 'switch',
          name: 'isActive',
          falseValue: 0,
          trueValue: 1,
          label: this.$t('page.enable'),
          readonly: true
        },
        {
          type: 'userselect',
          name: 'authorityList',
          label: this.$t('page.auth'),
          groupList: ['user', 'team', 'role', 'common'],
          value: ['common#alluser'],
          readonly: true
        },
        {
          type: 'ckeditor',
          name: 'description',
          label: this.$t('page.directorydescription'),
          readonly: true,
          params: {
            uploadVideoConfig: {
              type: 'autoexec'
            }
          }
        },
        {
          type: 'select',
          name: 'combopId',
          label: this.$t('term.autoexec.combinationtool'),
          multiple: false,
          search: true, // 可以搜索
          dynamicUrl: '/api/rest/autoexec/combop/executable/list',
          valueName: 'id',
          textName: 'name',
          rootName: 'tbodyList',
          readonly: true
        },
        {
          type: 'select',
          name: 'formUuid',
          label: this.$t('page.form'),
          dynamicUrl: '/api/rest/form/search',
          params: {
            isActive: 1,
            needPage: false
          },
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'uuid',
          clearable: true,
          transfer: true,
          readonly: true
        }
      ]
    };
  },
  beforeCreate() {},
  async created() {
    await this.initData();
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
    defaultInitData() {
      // 默认初始值
      this.scenarioId = ''; // 场景id
      this.combopId = null; // 自动化组合工具id
      this.valueConfig = {}; //所有值对应的集合
      this.itemConfig = {}; //所以组件对应的渲染config集合
      this.scenarioList = [];
      this.otherParamItemList = [];
      this.basicFormValue = {};
      this.executeConfig = {};
      this.filterSearchValue = {};
      this.basicInfoFormValue = {
        name: '',
        isActive: 0,
        authorityList: [],
        description: '',
        combopId: null,
        formUuid: null
      };
      this.executeNode = {
        mappingMode: 'constant',
        value: ''
      };
    },
    async initData() {
      // 初始化
      this.defaultInitData();
      if (!this.$utils.isEmpty(this.serviceData)) {
        this.combopId = this.serviceData.combopId || null;
        if (this.serviceData.formUuid) {
          await this.getFormListByFormUuid(this.serviceData.formUuid);
        }
        if (this.combopId) {
          await this.getCombopDetail();
        }
        let { config = {} } = this.serviceData || {};
        let { executeNodeConfig = {}, runnerGroup = {}, runnerGroupTag = {} } = config || {};
        let { value = '', mappingMode } = executeNodeConfig || {};
        if (mappingMode == 'constant') {
          if (!this.$utils.isEmpty(value)) {
            this.filterSearchValue = value || {}; // 执行目标值回显
            this.$set(this.executeConfig, 'executeNodeConfig', this.filterSearchValue); // 执行目标回显
          }
        } else {
          this.$set(this.executeNode, 'mappingMode', mappingMode);
          this.$set(this.executeNode, 'value', value || {});
        }
        // 如果有值，则用服务目录接口返回的值
        if (!this.$utils.isEmpty(runnerGroup)) {
          this.runnerGroup = runnerGroup;
        }
        if (!this.$utils.isEmpty(runnerGroupTag)) {
          this.runnerGroupTag = runnerGroupTag;
        }
      }
      if (!this.$utils.isEmpty(this.serviceData)) {
        // 其他参数值回显
        for (let key in this.serviceData) {
          if (key != 'config' && this.serviceData[key]) {
            if (this.basicInfoFormValue.hasOwnProperty(key)) {
              this.$set(this.basicInfoFormValue, [key], this.serviceData[key] || '-');
            }
          }
        }
        if (this.serviceData['config'] && !this.$utils.isEmpty(this.serviceData.config)) {
          for (let configKey in this.serviceData['config']) {
            if (configKey) {
              if (configKey == 'scenarioId') {
                // 单独处理场景回显的情况,场景只返回一个字符串，不是object
                this.$set(this.otherParamFormValue, [configKey], this.serviceData['config'][configKey]);
              } else {
                this.$set(this.otherParamFormValue, [configKey], this.serviceData['config'][configKey]['value']);
              }
              this.otherFormList.forEach(item => {
                if (item.name == configKey) {
                  this.otherParamItemList.push({
                    name: item.name,
                    label: item.label,
                    ...this.getConfigByMappingMode(configKey, item) // 场景没有表单映射的情况
                  });
                }
              });
            }
          }
          this.otherParamItemList.forEach(item => {
            let isHidden = false;
            if (item.name === 'roundCount') {
              if (this.otherParamFormValue.parallelPolicy === 'parallel' || this.$utils.isEmpty(this.otherParamFormValue.roundCount)) {
                isHidden = true;
              }
            } 
            if (item.name === 'parallelCount') {
              if (this.otherParamFormValue.parallelPolicy === 'roundCount' || this.$utils.isEmpty(this.otherParamFormValue.parallelCount)) {
                isHidden = true;
              }
            }
            item.isHidden = isHidden;
          });
        }
      }
      this.$nextTick(() => {
        this.isReady = true;
      });
    },
    getConfigByMappingMode(configKey, item) {
      // 根据映射关系，设置配置信息
      if (this.serviceData['config'][configKey]['mappingMode'] == 'formattr') {
        // 映射关系为表单时
        return this.formList;
      } else {
        return item.constantMappingMode;
      }
    },
    getFormListByFormUuid(uuid) {
      // 根据表单id获取表单列表
      this.formList.dataList = [];
      return this.$api.framework.form.getFormByVersionUuid({ uuid: uuid }).then(res => {
        if (res.Status == 'OK') {
          let formConfig = res.Return.formConfig;
          formConfig &&
            formConfig.tableList &&
            formConfig.tableList.length > 0 &&
            formConfig.tableList.forEach(item => {
              if (item && !this.$utils.isEmpty(item.component) && item.component.hasValue) {
                this.formList.dataList.push(item.component);
              }
            });
        }
      });
    },
    getCombopDetail() {
      let data = {
        id: this.combopId
      };
      this.loadingShow = true;
      return this.$api.autoexec.action
        .getActionDetail(data)
        .then(res => {
          this.loadingShow = false;
          if (res.Status == 'OK') {
            this.dataConfig = res.Return;
            this.stepList = this.dataConfig.config.combopPhaseList;
            this.paramsList = this.dataConfig.config.runtimeParamList || [];
            this.needExecuteNode = this.dataConfig.needExecuteNode;
            this.needExecuteUser = this.dataConfig.needExecuteUser;
            this.needProtocol = this.dataConfig.needProtocol;
            this.needRoundCount = this.dataConfig.needRoundCount;
            this.executeConfig = this.dataConfig.config.executeConfig || {};
            this.runnerGroup = this.executeConfig.runnerGroup || {};
            this.runnerGroupTag = this.executeConfig.runnerGroupTag || {};
            if (this.executeConfig.whenToSpecify == 'runtime') {
              // 过滤器运行在执行，需要把执行目标值清空
              this.$set(this.executeConfig, 'executeNodeConfig', {});
            }
            if (this.paramsList && !this.$utils.isEmpty(this.paramsList)) {
              this.initConfig(); // 设置作业参数值
            }
            if (this.dataConfig.config.executeConfig && !this.$utils.isEmptyObj(this.dataConfig.config.executeConfig)) {
              // 连接协议和执行账户回显
              this.executeValue['executeUser'] = this.dataConfig.config.executeConfig['executeUser'];
              this.executeValue['protocolId'] = this.dataConfig.config.executeConfig['protocolId'];
            }
            // 场景
            if (this.dataConfig && this.dataConfig.config && this.dataConfig.config.scenarioList) {
              this.otherFormList &&
                this.otherFormList.forEach(item => {
                  if (item.name == 'scenarioId') {
                    this.$set(item.constantMappingMode, 'dataList', this.dataConfig.config.scenarioList);
                  }
                });
            }
          }
        })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    initConfig() {
      // 初始化作业参数列表数据
      let saveValue = {}; // 回显的值
      let mappingModeData = {};
      this.itemConfig = {};
      this.valueConfig = {};
      if (!this.$utils.isEmpty(this.serviceData)) {
        for (let key in this.serviceData) {
          if (key == 'config' && this.serviceData[key] && !this.$utils.isEmpty(this.serviceData[key]['runtimeParamList'])) {
            this.serviceData[key]['runtimeParamList'].forEach(item => {
              this.$set(saveValue, [item.key], item.value);
              this.$set(mappingModeData, [item.key], item.mappingMode);
            });
          }
        }
      }
      this.paramsList instanceof Array &&
        this.paramsList.forEach(data => {
          let config = Object.assign({}, data.config ? data.config : data);
          config.desc = data.description;
          config.type = data.type;
          if (data.type == 'file' || data.type == 'node') {
            config.showNumber = 6;
          }
          this.$set(data, 'mappingMode', mappingModeData[data.key]);
          this.$set(this.itemConfig, data.key, config);
          this.$set(this.valueConfig, data.key, !this.$utils.isEmpty(saveValue) ? saveValue[data.key] || this.defaultValueByType(data.type) : data.defaultValue || this.defaultValueByType(data.type));
        });
    },
    defaultValueByType(type) {
      // 根据不同的类型，设置不同的默认值，解决类型传递不对，导致控制台报错问题
      if (type == 'userselect' || type == 'node') {
        return [];
      } else if (type == 'account') {
        return null;
      } else if (type == 'switch') {
        return false;
      } else {
        return '-';
      }
    }
  },
  filter: {},
  computed: {
    handleType() {
      return value => {
        let type = value + 'Handler';
        type = Component[type] ? type : 'defaultInput';
        return type;
      };
    },
    getPhaseList() {
      return phaseList => {
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
  watch: {}
};
</script>
<style lang="less" scoped>
.other-params-wrap {
  display: flex;
  flex-wrap: wrap;
  ::v-deep .tsform-item {
    width: 30% !important;
  }
  ::v-deep .node-main .list {
    max-width: 40% !important;
  }
}
</style>
