<template>
  <div v-if="!$utils.isEmpty(serviceData)">
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
    <!-- 作业参数 -->
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
          style="margin-left:4px;"
          :readonly="true"
          :defaultValue="item.defaultValue"
          :config="itemConfig[item.key]"
          :phaseList="getPhaseList(stepList)"
        ></Component>
      </TsFormItem>
    </div>
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
        v-else
        :id="combopId"
        ref="addTarget"
        :value="executeConfig ? executeConfig.executeNodeConfig:{}"
        :canEdit="false"
        :type="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify: 'runtime'"
        :executeConfig="executeValue"
        :runtimeParamList="paramsList"
        :needBorder="needExecuteUser|| needProtocol"
        :filterSearchValue="filterSearchValue"
      ></AddTarget>
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
      basicInfoFormValue: {
        name: '',
        isActive: 0,
        authorityList: [],
        description: '',
        combopId: null,
        formUuid: null
      },
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
          readonly: true
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
        if (this.serviceData.config.executeNodeConfig && this.serviceData.config.executeNodeConfig.mappingMode == 'constant') {
          let {config = {}} = this.serviceData || {};
          let {executeNodeConfig = {}} = config || {};
          let {value = ''} = executeNodeConfig || {};
          
          this.filterSearchValue = value || {}; // 执行目标值回显
          this.$set(this.executeConfig, 'executeNodeConfig', this.filterSearchValue); // 执行目标回显
        } else {
          this.$set(this.executeNode, 'mappingMode', this.serviceData.config.executeNodeConfig.mappingMode);
          this.$set(this.executeNode, 'value', this.serviceData.config.executeNodeConfig.value || {});
        }
      }
      if (!this.$utils.isEmpty(this.serviceData)) {
      // 其他参数值回显
        for (let key in this.serviceData) {
          if (key != 'config' && this.serviceData[key]) {
            if (this.basicInfoFormValue.hasOwnProperty(key)) {
              this.$set(this.basicInfoFormValue, [key], (this.serviceData[key] || '-'));
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
              this.otherFormList.forEach((item) => {
                if (item.name == configKey) {
                  this.otherParamItemList.push({
                    name: item.name,
                    label: item.label,
                    ... (this.getConfigByMappingMode(configKey, item)) // 场景没有表单映射的情况
                  });
                }
              });
            }
          }
        }
      }
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
    async getFormListByFormUuid(uuid) {
      // 根据表单id获取表单列表
      this.formList.dataList = [];
      await this.$api.framework.form.getFormByVersionUuid({uuid: uuid}).then(res => {
        if (res.Status == 'OK') {
          let formConfig = res.Return.formConfig;
          formConfig && formConfig.tableList && formConfig.tableList.length > 0 && formConfig.tableList.forEach((item) => {
            if (item && !this.$utils.isEmpty(item.component) && item.component.hasValue) {
              this.formList.dataList.push(item.component);
            }
          });
        }
      });
    },
    async getCombopDetail() {
      if (!this.combopId) {
        return;
      }
      let data = {
        id: this.combopId
      };
      this.loadingShow = true;
      await this.$api.autoexec.action
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
              this.otherFormList && this.otherFormList.forEach((item) => {
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
            this.serviceData[key]['runtimeParamList'].forEach((item) => {
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
          this.$set(this.valueConfig, data.key, !this.$utils.isEmpty(saveValue) ? (saveValue[data.key] || this.defaultValueByType(data.type)) : (data.defaultValue || this.defaultValueByType(data.type)));
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
  watch: {}
};
</script>
<style lang="less" scoped>
.other-params-wrap {
  display: flex;
  flex-wrap: wrap;
  /deep/ .tsform-item {
    width: 30% !important;
  }
  /deep/ .node-main .list {
    max-width: 40% !important;
  }
}
</style>
