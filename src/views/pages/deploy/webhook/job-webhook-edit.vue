<template>
  <div>
    <TsContain>
      <Loading
        :loadingShow="loadingShow"
        type="fix"
      ></Loading>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span class="tsfont-question-s text-action" @click="openWebhookHelpDialog">{{ $t('page.help') }}</span>
      </template>
      <template v-slot:topRight>
        <Button type="primary" @click="saveJobWebhook">{{ $t('page.save') }}</Button>
      </template>
      <template v-slot:content>
        <ul v-if="!loadingShow">
          <li>
            <Divider orientation="start">{{ $t('page.basicinfo') }}</Divider>
            <TsForm
              ref="basicForm"
              v-model="formValue"
              :item-list="basicFormList"
            ></TsForm>
          </li>
          <li>
            <Divider orientation="start">{{ $t('term.deploy.triggerrange') }}</Divider>
            <TsForm
              ref="triggerRangeForm"
              v-model="formValue"
              :item-list="triggerRangeFormList"
            >
              <template slot="AppModule">
                <ul>
                  <li class="bg-op radius-lg padding">
                    <div
                      v-for="(item, index) in appModuleFormList"
                      :key="item.uuid"
                      class="pt-nm app-module-form-box"
                      @mouseenter="handleMouseEnter(item)"
                      @mouseleave="handleMouseLeave(item)"
                    >
                      <TsForm
                        ref="appModuleForm"
                        v-model="item.formValue"
                        width="95%"
                        :item-list="item.itemList"
                      ></TsForm>
                      <span v-show="index != 0 && item.isShow" class="tsfont-close text-action del-btn-box" @click="delAppModuleFormList(index)">
                        <!-- 默认保留第一个 -->
                      </span>
                    </div>
                  </li>
                  <li>
                    <span class="text-href tsfont-plus pt-sm" @click="addAppModuleFormList">{{ $t('term.deploy.appmodule') }}</span>
                  </li>
                </ul>
              </template>
            </TsForm>
          </li>
          <li>
            <Divider orientation="start">{{ $t('page.actions') }}</Divider>
            <TsForm
              ref="actionForm"
              v-model="formValue"
              :item-list="actionFormList"
            ></TsForm>
          </li>
          <li v-show="integrationInputParamList.length > 0" class="pl-nm pt-nm">
            <!-- 集成管理参数 -->
            <IntegrationParam
              ref="integrationInputParam"
              :value="integrationInputParam"
              :paramList="integrationInputParamList"
            ></IntegrationParam>
          </li>
        </ul>
      </template>
    </TsContain>
    <WebhookHelpDialog v-if="isShowWebhookHelpDialog" @close="closeWebhookHelpDialog"></WebhookHelpDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    IntegrationParam: resolve => require(['./component/integration-param'], resolve),
    WebhookHelpDialog: resolve => require(['./webhook-help-dialog'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      isShowWebhookHelpDialog: false,
      initData: {}, // 初始化数据
      integrationInputParamList: [],
      integrationInputParam: {},
      formValue: {
        isActive: 1,
        type: 'general',
        buildNoPolicy: 'the_same'
      },
      appModuleFormList: [],
      basicFormList: [
        // 基本信息form表单
        {
          name: 'id',
          type: 'text',
          label: '#id',
          isHidden: true
        },
        {
          name: 'name',
          type: 'text',
          label: this.$t('page.name'),
          validateList: [
            'required', 
            'name-special', 
            { 
              name: 'searchUrl', 
              url: '/api/rest/deploy/job/webhook/save', 
              key: 'name', 
              message: this.$t('form.validate.repeat', {target: this.$t('page.name')}), 
              params: { id: '' } 
            }],
          maxlength: 50
        },
        {
          name: 'isActive',
          type: 'switch',
          label: this.$t('page.enable'),
          falseValue: 0,
          trueValue: 1
        }
      ],
      triggerRangeFormList: [
        // 触发范围
        {
          name: 'type',
          type: 'radio',
          label: this.$t('term.deploy.jobtype'),
          validateList: ['required'],
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'ScheduleType' },
          dealDataByUrl: (nodeList) => { return nodeList.filter((item) => item.value == 'general'); }, // 目前暂时只做普通作业
          onChange: (type) => {
            this.$set(this.formValue, 'type', type);
            this.handleFormListByJobType(type);//根据不同的作业类型，显示不同的formList
          }
        }
      ],
      actionFormList: [
        // 动作form表单
        {
          name: 'buildNoPolicy',
          type: 'radio',
          label: 'buildNo',
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'DeployWebhookBuildNoPolicy' }
        },
        {
          name: 'integrationUuid',
          type: 'select',
          label: this.$t('term.deploy.integratedmanagement'),
          validateList: ['required'],
          dynamicUrl: '/api/rest/integration/search',
          params: {handler: 'DeployTriggerIntegrationHandler'},
          firstSelect: false,
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'uuid',
          onChange: (uuid) => {
            this.integrationInputParam = {};
            if (uuid) {
              // 获取集成入参
              this.getIntegrationUuidParams(uuid);
            }
          }
        }
      ],
      defaultAppModuleFormList: [
        {
          name: 'appSystemId',
          type: 'select',
          label: this.$t('page.apply'),
          validateList: ['required', {name: 'custom', trigger: 'change', message: this.$t('form.validate.repeat', {target: this.$t('page.apply')}), validator: (rule, appSystemId) => {
            // 自定义校验规则，验证唯一性
            return this.validUnique('app', appSystemId);
          }}],
          dynamicUrl: '/api/rest/deploy/app/config/appsystem/search',
          dealDataByUrl: (nodeList) => { return this.dealAppSystemDataByUrl(nodeList); },
          rootName: 'tbodyList',
          transfer: true,
          labelWidth: 60,
          onChange: (appSystemId) => {
            if (appSystemId && appSystemId != 0) {
              //应用有值，并且不是所有应用(0)时，才显示该应用下模块下拉列表
              this.$nextTick(() => {
                // nextTick 解决item.formValue数据延迟的问题
                this.appModuleFormList.forEach((item) => {
                  if (item.formValue && item.formValue.hasOwnProperty('appSystemId') && item.formValue['appSystemId'] == appSystemId) {
                    this.$set(item.formValue, 'appModuleId', null); // 切换不同的应用，清空模块下拉的值
                    item.itemList.forEach((innerItem) => {
                      if (innerItem && (innerItem.name == 'appModuleId')) {
                        this.$set(innerItem, 'isHidden', false);
                        this.$set(innerItem.params, 'appSystemId', appSystemId);
                      }
                    });
                  }
                });
              });
            } else if (appSystemId == 0) {
              // 隐藏模块下拉列表
              this.$nextTick(() => {
                // nextTick 解决item.formValue数据延迟问题
                this.appModuleFormList.forEach((item) => {
                  if (item.formValue && item.formValue.hasOwnProperty('appSystemId') && item.formValue['appSystemId'] == appSystemId) {
                    delete item.formValue.appModuleId;
                    item.itemList.forEach((innerItem) => {
                      if (innerItem && (innerItem.name == 'appModuleId')) {
                        this.$set(innerItem, 'isHidden', false);
                        this.$set(innerItem.params, 'appSystemId', null);
                      }
                    });
                  }
                });
              });
            }
          }
        },
        {
          name: 'appModuleId',
          type: 'select',
          label: this.$t('page.module'),
          labelWidth: 60,
          validateList: ['required', {name: 'custom', trigger: 'change', message: this.$t('form.validate.repeat', {target: this.$t('page.module')}), validator: (rule, appModuleId) => {
            // 自定义校验规则，验证唯一性
            return this.validUnique('module', appModuleId);
          }}],
          isHidden: true,
          dynamicUrl: '/api/rest/deploy/app/config/module/list',
          dealDataByUrl: (nodeList) => { return this.dealModuleDataByUrl(nodeList); },
          params: {appSystemId: null}
        }
      ],
      generalJobFormList: [
        // 普通作业form表单
        {
          name: 'AppModule',
          type: 'slot',
          label: this.$t('term.deploy.appmodule'),
          validateList: ['required']
        },
        {
          name: 'envNameList',
          type: 'select',
          label: this.$t('page.environment'),
          multiple: true,
          validateList: ['required'],
          url: '/api/rest/resourcecenter/appenv/list/forselect',
          params: { needPage: false },
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'name'
        },
        {
          name: 'jobStatusList',
          type: 'select',
          label: this.$t('page.jobstatus'),
          multiple: true,
          validateList: ['required'],
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'JobStatus' }
        }
      ],
      pipelineFormList: [
        // 超级流水线form表单
        {
          name: 'pipelineType',
          type: 'radio',
          label: this.$t('term.deploy.pipelinetype'),
          validateList: ['required'],
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'PipelineType' },
          onChange: (pipelineType) => {
            if (this.formValue.type == 'pipeline' && pipelineType == 'appsystem') {
              // 作业类型是超级流水线 + 应用流水线
              this.triggerRangeFormList && this.triggerRangeFormList.forEach((item) => {
                if (item && (item.name == 'pipeline')) {
                  this.$set(item, 'params', {type: 'appsystem'});
                }
              });
            } else if (this.formValue.type == 'pipeline' && pipelineType == 'global') {
              //  作业类型是超级流水线 + 全局流水线
              this.triggerRangeFormList && this.triggerRangeFormList.forEach((item) => {
                if (item && (item.name == 'pipeline')) {
                  delete item.params;
                }
              });
            }
            this.$set(this.formValue, 'pipeline', []); // 切换不同的流水线类型，流水线值清空
          }
        },
        {
          name: 'pipeline',
          type: 'select',
          label: this.$t('term.autoexec.pipeline'),
          multiple: true,
          validateList: ['required'],
          dynamicUrl: '/api/rest/deploy/pipeline/search',
          dealDataByUrl: (nodeList) => this.dealPipelineDataByUrl(nodeList),
          params: {type: 'appsystem'},
          rootName: 'tbodyList'
        },
        {
          name: 'jobStatusList',
          type: 'select',
          label: this.$t('page.jobstatus'),
          multiple: true,
          validateList: ['required'],
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'JobStatus' }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query || {};
    if (query && !this.$utils.isEmptyObj(query) && query.id) {
      this.getWebhookDetailById(parseInt(query.id)).then(() => {
        this.$addWatchData(this.initData);
      });
    } else {
      this.appModuleFormList = [{
        uuid: this.$utils.setUuid(),
        formValue: {},
        itemList: this.$utils.deepClone(this.defaultAppModuleFormList)
      }];
      this.loadingShow = false;
      this.handleFormListByJobType(this.formValue.type);
      this.initData = this.formValue;
      this.$addWatchData(this.initData);
    }
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
    beforeLeaveCompare(oldData) {
      // 离开当前页面，数据对比
      let newData = this.handleInputParams();
      return this.$utils.isSame(oldData, newData);
    },
    async beforeLeave() {
      //离开页面，二次弹窗，点击'确认按钮'，存储数据,
      return await this.saveJobWebhook();
    },
    dealAppSystemDataByUrl(nodeList) {
      // 应用下拉列表数据处理
      let dataList = [];
      if (nodeList) {
        nodeList.forEach(item => {
          dataList.push({
            value: item.id,
            text: item.abbrName ? (item.name ? `${item.abbrName}[${item.name}]` : item.abbrName) : (item.name || '')
          });
        });
      }
      dataList.unshift({
        text: this.$t('term.deploy.allapplication'),
        value: 0
      });
      return dataList;
    },
    dealModuleDataByUrl(nodeList) {
      // 模块下拉列表数据处理
      let dataList = [];
      if (nodeList) {
        nodeList.forEach(item => {
          dataList.push({
            value: item.id,
            text: item.abbrName ? (item.name ? `${item.abbrName}[${item.name}]` : item.abbrName) : (item.name || '')
          });
        });
      }
      dataList.unshift({
        text: this.$t('term.deploy.allmodule'),
        value: 0
      });
      return dataList;
    },
    dealPipelineDataByUrl(nodeList) {
      // 流水线下拉数据列表，应用流水线下拉显示：流水线名称/应用简称，全局流水线显示：全局流水线名称
      let dataList = [];
      if (nodeList) {
        nodeList.forEach(item => {
          dataList.push({
            value: item.id,
            text: this.formValue.type == 'pipeline' && this.formValue.pipeline == 'appsystem' ? (item.appSystemAbbrName ? (item.name ? `${item.name / item.appSystemAbbrName}` : item.appSystemAbbrName) : '') : item.name
          });
        });
      }
      return dataList;
    },
    addAppModuleFormList() {
      this.appModuleFormList.push({
        uuid: this.$utils.setUuid(),
        formValue: {},
        itemList: this.$utils.deepClone(this.defaultAppModuleFormList)
      });
    },
    delAppModuleFormList(index) {
      this.appModuleFormList.splice(index, 1);
    },
    handleMouseEnter(item) {
      // 鼠标移入
      if (item) {
        this.$set(item, 'isShow', true);
      }
    },
    handleMouseLeave(item) {
      // 鼠标移出
      if (item) {
        this.$set(item, 'isShow', false);
      }
    },
    validUnique(type, id) {
      // 验证唯一性
      let isValid = true; // 是否验证通过
      let repeatNum = 0;
      if (type == 'app' && (id || id == 0)) {
        this.appModuleFormList && this.appModuleFormList.forEach((item) => {
          if (item && item.formValue && (item.formValue.appSystemId || item.formValue.appSystemId == 0) && (item.formValue.appSystemId == id)) {
            repeatNum = repeatNum + 1;
          }
        });
      } else if (type == 'module' && id) {
        // 验证模块唯一性
        this.appModuleFormList && this.appModuleFormList.forEach((item) => {
          if (item && item.formValue && (item.formValue.appModuleId || item.formValue.appModuleId == 0) && (item.formValue.appModuleId == id)) {
            repeatNum = repeatNum + 1;
          }
        });
      }
      if (repeatNum >= 2) {
        isValid = false;
      }    
      return isValid;
    },
    valid() {
      let formList = ['basicForm', 'triggerRangeForm', 'actionForm', 'integrationInputParam'];
      let isValid = true;
      formList.forEach((item) => {
        if (item && this.$refs[item] && !this.$refs[item].valid()) {
          isValid = false;
        }
      });
      this.$refs && this.$refs.appModuleForm && this.$refs.appModuleForm.forEach((item) => {
        // 验证应用模块是数组的情况
        if (item && !item.valid()) {
          isValid = false;
        }
      });
      return isValid;
    },
   
    handleInputParams() {
      // 处理入参
      let formValue = {};
      let normalParamsList = ['buildNoPolicy', 'id', 'integrationUuid', 'isActive', 'name', 'type'];
      let list = ['envNameList', 'jobStatusList'];
      for (let key in this.formValue) {
        if (normalParamsList.includes(key)) {
          formValue[key] = this.formValue[key];
        } else if (list.includes(key)) {
          if (formValue && !formValue.hasOwnProperty('config')) {
            formValue.config = {};
          }
          formValue['config'][key] = this.formValue[key];
        }
      }
      // 处理应用模块
      this.appModuleFormList && this.appModuleFormList.forEach((item) => {
        if (item.formValue && !this.$utils.isEmptyObj(item.formValue)) {
          if (formValue && !formValue.hasOwnProperty('config')) {
            formValue.config = {};
            formValue.config['webhookAppModuleList'] = [];
          } else {
            if (formValue && formValue.hasOwnProperty('config') && !formValue.config.hasOwnProperty('webhookAppModuleList')) {
              formValue.config['webhookAppModuleList'] = [];
            }
          }
          formValue.config['webhookAppModuleList'].push(item.formValue);
        }
      });
      // 集成管理参数
      if (this.$refs && this.$refs.integrationInputParam) {
        let integrationInputParam = this.$utils.deepClone(this.$refs.integrationInputParam.getValue()) || {};
        for (let key in integrationInputParam) {
          // 解决保存时，axios会把undefined的字段过滤掉，导致前后对比有问题
          if (key && integrationInputParam[key] == undefined) {
            delete integrationInputParam[key];
          }
        }
        if (integrationInputParam && !this.$utils.isEmptyObj(integrationInputParam)) {
          if (formValue && !formValue.hasOwnProperty('config')) {
            formValue.config = {};
          }
          formValue.config['integrationInputParam'] = integrationInputParam;
        }
      }
      return formValue;
    },
    getIntegrationUuidParams(uuid) {
      // 根据集成管理uuid，查询作业触发器参数
      if (uuid) {
        this.integrationInputParamList = [];
        this.$api.framework.integration.getIntegrationHandlerByHandler({handler: 'DeployTriggerIntegrationHandler'}).then((res) => {
          if (res && res.Status == 'OK') {
            let paramList = res.Return ? res.Return.inputPattern : [];
            paramList && paramList.forEach((item) => {
              if (item && item.isShow) {
                // item.isShow 为1的时候，才显示出来
                this.integrationInputParamList.push({
                  name: item.description,
                  key: item.name,
                  isRequired: item.isRequired,
                  type: item.mode
                });
              }
            });
          }
        });
      }
    },
  
    async getWebhookDetailById(id) {
      if (id) {
        this.loadingShow = true;
        this.formValue = {};
        await this.$api.deploy.webhook.getJobWebhookById({id}).then((res) => {
          if (res && res.Status == 'OK') {
            let {formValue, appModuleFormList, initData} = this.handleOutputParams(res.Return);
            this.formValue = formValue;
            this.appModuleFormList = appModuleFormList;
            this.initData = initData;
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      } else {
        this.loadingShow = false;
      }
    },
    handleOutputParams(param) {
      // 处理输出参数
      let formValue = {};
      let appModuleFormList = [];
      let initData = {}; // 初始化数据，返回对比使用
      let dataInfo = param || {};
      let normalParamKeyList = ['id', 'name', 'isActive', 'type', 'buildNoPolicy', 'integrationUuid'];
      let jobStatusListAndEnvNameList = ['envNameList', 'jobStatusList'];
      let webhookAppModuleListLength = 0; // 长度
      for (let key in dataInfo) {
        if (normalParamKeyList.includes(key)) {
          formValue[key] = dataInfo[key];
          initData[key] = dataInfo[key];
          if (key == 'type') {
            this.handleFormListByJobType(formValue[key]); // 根据不同的作业类型，显示不同的form表单
          } else if (key == 'integrationUuid') {
            this.getIntegrationUuidParams(formValue[key]); // 获取集成管理入参
          }
        } else if (key == 'config' && dataInfo[key] && !this.$utils.isEmptyObj(dataInfo[key])) {
          // 处理config数据回显
          initData[key] = dataInfo[key];
          for (let configKey in dataInfo[key]) {
            if (jobStatusListAndEnvNameList.includes(configKey)) {
              formValue[configKey] = dataInfo[key][configKey];
            } else if (configKey == 'integrationInputParam') {
              // 集成管理入参回显值
              this.integrationInputParam = dataInfo[key][configKey];
            } else if (configKey == 'webhookAppModuleList') {
              // 根据应用(模块)数组长度，回显应用模块
              webhookAppModuleListLength = dataInfo[key][configKey] && (dataInfo[key][configKey] instanceof Array) ? dataInfo[key][configKey].length : 0;
              for (let i = 0; i < webhookAppModuleListLength; i++) {
                appModuleFormList.push({
                  uuid: this.$utils.setUuid(),
                  formValue: dataInfo[key][configKey][i] ? this.$utils.deepClone({...dataInfo[key][configKey][i]}) : {},
                  itemList: this.$utils.deepClone(this.defaultAppModuleFormList)
                });
              }
              // 应用和模块有值，显示模块
              appModuleFormList && appModuleFormList.forEach((item) => {
                if (item && item.formValue && ((item.formValue.appSystemId || item.formValue.appSystemId == 0) && (item.formValue.appModuleId || item.formValue.appModuleId == 0))) {
                  item.itemList && item.itemList.forEach((innerItem) => {
                    if (innerItem && (innerItem.name == 'appModuleId')) {
                      this.$set(innerItem, 'isHidden', false);
                    }
                  });
                }
              });
            }
          }
        }
      }
      return {formValue: formValue || {}, appModuleFormList: appModuleFormList || [], initData: initData || {}};
    },
    handleFormListByJobType(jobType) {
      if (this.triggerRangeFormList && this.triggerRangeFormList.length > 1) {
        // 删除触发范围数组，作业类型后的对象
        this.triggerRangeFormList.splice(1, (this.triggerRangeFormList.length - 1));
      }
      if (jobType == 'general') {
        // 普通作业
        this.triggerRangeFormList.push(...this.generalJobFormList);
        let clearValueKeyList = ['envNameList', 'jobStatusList'];
        for (let key in this.formValue) {
          if (key && clearValueKeyList.includes(key)) {
            // 清空值
            this.$set(this.formValue, [key], []);
          }
        }
        // 清空应用/模块值
        this.appModuleFormList && this.appModuleFormList.forEach(item => {
          this.$set(item, 'formValue', {});
          if (item && item.itemList && item.itemList.length > 0) {
            this.appModuleFormList.splice(1, this.appModuleFormList.length - 1);
          }
          item && item.itemList && item.itemList.forEach((innerItem) => {
            if (innerItem && (innerItem.name == 'appModuleId')) {
              this.$set(innerItem, 'isHidden', true);
            }
          });
        });
      } else if (jobType == 'pipeline') {
        // 超级流水线
        this.triggerRangeFormList.push(...this.pipelineFormList);
        let clearValueKeyList = ['pipelineType', 'pipeline', 'jobStatusList']; // 需要清空value值，key值列表
        for (let key in this.formValue) {
          if (key && clearValueKeyList.includes(key)) {
            // 切换不同作业类型，清空值
            if (key == 'pipelineType') {
              // 默认选择应用流水线
              this.$set(this.formValue, 'pipelineType', 'appsystem');
            } else {
              this.$set(this.formValue, [key], []);
            }
          }
        }
      }
    },
    saveJobWebhook() {
      if (!this.valid()) {
        return false;
      }
      let param = this.handleInputParams();
      this.$api.deploy.webhook.saveJobWebhook(param).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$addWatchData(param);
          this.$back();
        }
      });
    },
    openWebhookHelpDialog() {
      this.isShowWebhookHelpDialog = true;
    },
    closeWebhookHelpDialog() {
      this.isShowWebhookHelpDialog = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.app-module-form-box {
  position: relative;
  .del-btn-box {
    position: absolute;
    top: -7px;
    right: 10px;
  }
}
</style>
