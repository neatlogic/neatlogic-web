<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="radius-lg bg-op padding">
      <div class="flex-between" :class="unfoldAndFold.basicForm ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.basicinformation') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.basicForm ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('basicForm')"></span>
      </div>
      <TsForm
        v-show="unfoldAndFold.basicForm"
        ref="basicForm"
        v-model="basicFormValue"
        :item-list="basicFormItemList"
      ></TsForm>
    </div>
    <div v-if="hasCombopId && (scenarioList.length > 0)" class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.scenario ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.scene') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.scenario ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('scenario')"></span>
      </div>
      <TsFormItem v-show="unfoldAndFold.scenario" label="">
        <TsFormRadio
          v-model="scenarioId"
          :dataList="scenarioList"
          valueName="scenarioId"
          textName="scenarioName"
          :isClearSameValue="true"
        ></TsFormRadio>
      </TsFormItem>
    </div>
    <div v-if="hasCombopId" class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.roundCountForm ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.batchsetting') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.roundCountForm ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('roundCountForm')"></span>
      </div>
      <TsFormItem v-show="unfoldAndFold.roundCountForm" :label="$t('term.autoexec.batchquantity')" :required="hasFormUuid">
        <div class="form-wrap-box">
          <TsFormSelect
            ref="mappingModeForm"
            v-model="roundCount.mappingMode"
            :dataList="mappingModeDataList"
            :width="100"
            transfer
            border="border"
            class="pr-sm"
            :validateList="['required']"
          ></TsFormSelect>
          <TsFormSelect
            v-if="roundCount.mappingMode == 'formattr'"
            ref="mappingModeForm"
            v-model="roundCount.value"
            :dataList="formDataList"
            valueName="uuid"
            textName="label"
            transfer
            border="border"
            class="pr-sm form-li-width"
            :validateList="['required']"
          ></TsFormSelect>
          <TsFormSelect
            v-else
            ref="roundCountForm"
            v-model="roundCount.value"
            class="form-li-width"
            v-bind="roundCountForm"
            transfer
          ></TsFormSelect>
        </div>
      </TsFormItem>  
    </div>
    <div v-if="hasCombopId" class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.executeTarget ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.executetarget') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.executeTarget ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('executeTarget')"></span>
      </div>
      <TsFormItem v-show="unfoldAndFold.executeTarget" :label="$t('term.autoexec.executetarget')" :required="hasFormUuid">
        <div class="form-wrap-box">
          <TsFormSelect
            ref="mappingModeForm"
            v-model="executeNode.mappingMode"
            :dataList="mappingModeDataList"
            transfer
            border="border"
            :width="100"
            class="pr-sm"
            :validateList="['required']"
          ></TsFormSelect>
          <TsFormSelect
            v-if="executeNode.mappingMode == 'formattr'"
            ref="mappingModeForm"
            v-model="executeNode.value"
            :dataList="formDataList"
            valueName="uuid"
            textName="label"
            transfer
            border="border"
            class="pr-sm form-li-width"
            :validateList="['required']"
          ></TsFormSelect>
          <div v-else style="width: 100%;">
            <AddTarget
              v-if="!loadingShow"
              :id="combopId"
              ref="executeTarget"
              :value="executeConfig ? executeConfig.executeNodeConfig:{}"
              :canEdit="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify == 'runtime':true"
              :type="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify: 'runtime'"
              :executeConfig="executeValue"
              :runtimeParamList="paramsList"
              :needBorder="needExecuteUser|| needProtocol"
              :filterSearchValue="filterSearchValue"
              :isRequired="hasFormUuid"
            ></AddTarget>
          </div>
        </div>
      </TsFormItem>
    </div>
    <div v-if="hasCombopId" class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.executeAccountForm ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.executeaccount') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.executeAccountForm ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('executeAccountForm')"></span>
      </div>
      <div v-show="unfoldAndFold.executeAccountForm">
        <TsFormItem :label="$t('page.protocol')" :required="hasFormUuid">
          <div class="form-wrap-box">
            <TsFormSelect
              ref="mappingModeForm"
              v-model="protocol.mappingMode"
              :dataList="mappingModeDataList"
              transfer
              border="border"
              :width="100"
              class="pr-sm"
              :validateList="['required']"
            ></TsFormSelect>
            <TsFormSelect
              v-if="protocol.mappingMode == 'formattr'"
              ref="mappingModeForm"
              v-model="protocol.value"
              :dataList="formDataList"
              valueName="uuid"
              textName="label"
              transfer
              border="border"
              class="pr-sm form-li-width"
              :validateList="['required']"
            ></TsFormSelect>
            <TsFormSelect
              v-else
              ref="protocolForm"
              v-model="protocol.value"
              v-bind="protocolForm"
              class="form-li-width"
              transfer
            ></TsFormSelect>
          </div>
        </TsFormItem>
        <TsFormItem :label="$t('term.autoexec.executeaccount')" :required="hasFormUuid">
          <div class="form-wrap-box">
            <TsFormSelect
              ref="mappingModeForm"
              v-model="executeUser.mappingMode"
              :dataList="mappingModeDataList"
              transfer
              border="border"
              class="pr-sm"
              :width="100"
              :validateList="['required']"
            ></TsFormSelect>
            <TsFormSelect
              v-if="executeUser.mappingMode == 'formattr'"
              ref="mappingModeForm"
              v-model="executeUser.value"
              :dataList="formDataList"
              valueName="uuid"
              textName="label"
              transfer
              border="border"
              class="pr-sm form-li-width"
              :validateList="['required']"
            ></TsFormSelect>
            <TsFormInput
              v-else
              ref="executeUserForm"
              v-model="executeUser.value"
              v-bind="executeUserForm"
              class="form-li-width"
              border="border"
            ></TsFormInput>
          </div>
        </TsFormItem>
      </div>
    </div>
    <div v-if="hasCombopId && !$utils.isEmpty(paramsList)" class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.jobParam ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.jobparam') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.jobParam ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('jobParam')"></span>
      </div>
      <div v-show="unfoldAndFold.jobParam">
        <div v-for="(item, pIndex) in paramsList" :key="pIndex" class="mb-nm">
          <TsFormItem :label="item.name" :required="item.isRequired ? true : false">
            <div class="form-wrap-box">
              <TsFormSelect
                ref="mappingModeForm"
                v-model="item.mappingMode"
                :dataList="mappingModeDataList"
                :width="100"
                transfer
                border="border"
                class="pr-sm"
                :validateList="['required']"
              ></TsFormSelect>
              <TsFormSelect
                v-if="item.mappingMode == 'formattr'"
                ref="mappingModeForm"
                v-model="valueConfig[item.key]"
                :dataList="formDataList"
                valueName="uuid"
                textName="label"
                transfer
                border="border"
                class="pr-sm form-li-width"
                :validateList="['required']"
              ></TsFormSelect>
              <Component
                :is="handleType(item.type)"
                v-else
                ref="jobParamForm"
                v-model="valueConfig[item.key]"
                class="form-li-width"
                :isRequired="item.isRequired"
                :defaultValue="item.defaultValue"
                :config="itemConfig[item.key]"
                :phaseList="getPhaseList(stepList)"
              ></Component>
            </div>
          </TsFormItem>
        </div>
      </div>
    </div>
    <Button
      class="mt-sm"
      type="primary"
      @click="saveService()"
    >{{ $t('button.save') }}</Button>
  </div>
</template>
<script>
import catalogmixin from './catalogmixin.js';
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
    ...Component
  },
  mixins: [catalogmixin],
  props: {},
  data() {
    return {
      loadingShow: true,
      unfoldAndFold: {
        // 展开收起
        scenario: true,
        basicForm: true,
        roundCountForm: true,
        executeTarget: true,
        executeAccountForm: true,
        jobParam: true
      },
      formUuid: '',
      valueConfig: {}, //所有值对应的集合
      itemConfig: {}, //所以组件对应的渲染config集合
      hasCombopId: false, // 是否有组合工具id
      scenarioId: null, // 场景id
      combopId: null, // 自动化组合工具id
      basicFormValue: {
        isActive: 0,
        citeForm: 0
      }, // 基本信息
      roundCount: {mappingMode: 'constant', value: 2}, // 分批数量
      protocol: {mappingMode: 'constant', value: null}, // 执行目标
      executeUser: {
        // 执行账户
        mappingMode: 'constant',
        value: ''
      },
      executeNode: {
        // 连接协议
        mappingMode: 'constant',
        value: null
      },
      scenarioList: [], //场景列表
      paramValue: {},
      executeConfig: {},
      executeValue: {},
      paramsList: [],
      stepList: [],
      needExecuteUser: '',
      needProtocol: '',
      filterSearchValue: {},
      formDataList: [],
      mappingModeDataList: [
        {
          text: this.$t('page.constant'),
          value: 'constant'
        }
      ],
      basicFormItemList: [
        {
          type: 'text',
          name: 'name',
          placeholder: '',
          maxlength: 50,
          label: this.$t('page.name'),
          validateList: ['required', 'name-special', {
            name: 'searchUrl',
            url: '/api/rest/autoexec/service/save',
            key: 'name',
            params: {}
          }]
        },
        {
          type: 'switch',
          name: 'isActive',
          falseValue: 0,
          trueValue: 1,
          isHidden: false,
          label: this.$t('page.enable'),
          validateList: ['required']
        },
        {
          type: 'userselect',
          name: 'authorityList',
          label: this.$t('page.auth'),
          groupList: ['user', 'team', 'role', 'common'],
          value: ['common#alluser'],
          validateList: ['required']
        },
        {
          type: 'ckeditor',
          name: 'description',
          label: this.$t('term.autoexec.servicedescription'),
          validateList: ['required']
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
          validateList: ['required'],
          onChange: (id) => {
            this.hasCombopId = !!id;
            this.combopId = id;
            this.getCombopDetail();
          }
        },
        {
          type: 'switch',
          name: 'citeForm',
          falseValue: 0,
          trueValue: 1,
          label: this.$t('term.autoexec.citeform'),
          onChange: (isOPen) => {
            this.basicFormItemList && this.basicFormItemList.forEach((item) => {
              if (item && item.name == 'formUuid') {
                this.$set(item, 'isHidden', !isOPen);
              }
            });
            if (!isOPen) {
              this.clearMappingMode();
            }
          }
        },
        {
          type: 'select',
          name: 'formUuid',
          label: this.$t('term.process.form'),
          isHidden: true,
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
          validateList: ['required'],
          onChange: (uuid) => {
            this.formUuid = !!uuid;
            if (uuid) {
              this.mappingModeDataList = [{
                text: this.$t('page.constant'),
                value: 'constant'
              }, {
                text: this.$t('term.autoexec.formparameter'),
                value: 'formattr'
              }];
              this.getFormListByFormUuid(uuid);
              this.setRequired(true);
            } else {
              this.mappingModeDataList = [
                {
                  text: this.$t('page.constant'),
                  value: 'constant'
                }
              ];
              this.setRequired(false);
              this.clearMappingMode();
            }
          }
        }
      ],
      roundCountForm: {
        dataList: this.$utils.getRoundCountList(),
        border: 'border',
        filterName: 'text',
        labelWidth: 0,
        hideLabel: true,
        allowCreate: true,
        search: true,
        transfer: true,
        desc: this.$t('term.autoexec.roundcountdescrition')
      },
      protocolForm: {
        multiple: false,
        dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getProtocolDataList,
        placeholder: this.$t('page.pleaseselect')
      },
      executeUserForm: {
      },
      jobParamValue: {}, // 作业参数值
      jobParamsMappingMode: {} // 作业参数映射关系
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
    setRequired(isRequired = false) {
      // 设置必填
      this.$set(this.executeUserForm, 'validateList', isRequired ? ['required'] : []);
      this.$set(this.protocolForm, 'validateList', isRequired ? ['required'] : []);
      this.$set(this.roundCountForm, 'validateList', isRequired ? ['required', 'maxNum'] : []);
    },
    clearMappingMode() {
      // 清空映射关系
      this.formUuid = '';
      this.$set(this.basicFormValue, 'formUuid', '');
      let clearAttrList = ['roundCount', 'protocol', 'executeUser', 'executeNode'];
      clearAttrList.forEach((item) => {
        if (this[item] && this[item].mappingMode && this[item].mappingMode == 'formattr') {
          this.$set(this[item], 'mappingMode', 'constant');
          this.$set(this[item], 'value', null);
        }
      });
      this.paramsList && this.paramsList.forEach((item) => {
        if (item && item.mappingMode == 'formattr') {
          this.$set(item, 'mappingMode', 'constant');
          this.$set(this.valueConfig, item.key, item.defaultValue);
        }
      });
      this.mappingModeDataList = [
        {
          text: this.$t('page.constant'),
          value: 'constant'
        }
      ];
    },
    defaultIniData() {
      // 默认初始值
      this.unfoldAndFold = {
        // 展开收起
        scenario: true,
        basicForm: true,
        roundCountForm: true,
        executeTarget: true,
        executeAccountForm: true,
        jobParam: true
      };
      this.combopId = null; // 自动化组合工具id
      this.hasCombopId = false; // 是否有组合工具id
      this.basicFormValue = {isActive: 0, citeForm: 0};
      this.basicFormItemList && this.basicFormItemList.forEach((item) => {
        if (item && item.name == 'formUuid') {
          this.$set(item, 'isHidden', true);
        }
      });
      this.clearComboptoolValue();
    },
    clearComboptoolValue() {
      // 切换不同的组合工具，需要清空值
      this.formUuid = ''; 
      this.scenarioId = null; // 场景id
      this.needExecuteUser = false;
      this.needProtocol = false;
      this.scenarioList = [];
      this.valueConfig = {}; //所有值对应的集合
      this.itemConfig = {};//所以组件对应的渲染config集合
      this.roundCount = {mappingMode: 'constant', value: 2}; // 分批数量
      this.protocol = {mappingMode: 'constant', value: null}; // 执行目标
      this.executeUser = {mappingMode: 'constant', value: ''};// 执行用户
      this.executeNode = {mappingMode: 'constant', value: null};// 连接协议
      this.executeConfig = {};
      this.executeValue = {};
      this.filterSearchValue = {};
      this.jobParamValue = {};
      this.jobParamsMappingMode = {};
      this.paramsList = [];
    },
    initData() {
      this.defaultIniData();
      if (this.id == true) {
        this.basicFormItemList.forEach((item) => {
          if (item && item.name == 'name') {
            item.validateList.forEach((v) => {
              if (v && v.name) {
                v.params = {};
                this.$set(v.params, 'parentId', this.selectedTreeNode.parentId);
              }
            });
          }
        });
        this.loadingShow = false;
        return;
      }
      this.basicFormItemList.forEach((item) => {
        if (item && item.name == 'name') {
          item.validateList.forEach((v) => {
            if (v && v.name) {
              this.$set(v.params, 'id', this.id);
              this.$set(v.params, 'parentId', this.selectedTreeNode.parentId);
            }
          });
        }
      });
      // 初始化
      this.loadingShow = true;
      this.$api.autoexec.catalogManage.getSeriveInfo({id: this.id}).then(res => {
        if (res.Status == 'OK') {
          let itemValue = res.Return;
          itemValue.description = this.escape2Html(itemValue.description);
          this.$set(this.basicFormValue, 'name', itemValue.name);
          this.$set(this.basicFormValue, 'isActive', itemValue.isActive);
          this.$set(this.basicFormValue, 'authorityList', itemValue.authorityList);
          this.$set(this.basicFormValue, 'description', itemValue.description);
          this.$set(this.basicFormValue, 'citeForm', (itemValue.formUuid ? 1 : 0));
          this.$set(this.basicFormValue, 'combopId', (itemValue.combopId || null));
          this.$set(this.basicFormValue, 'formUuid', (itemValue.formUuid || ''));
          this.hasCombopId = !!itemValue.combopId;
          this.combopId = itemValue.combopId || null;
          if (itemValue.config) {
            for (let key in itemValue.config) {
              this[key] = itemValue.config[key];
            }
            if (itemValue.config && !this.$utils.isEmpty(itemValue.config.runtimeParamList)) {
              itemValue.config.runtimeParamList.forEach((item) => {
                if (item.key) {
                  this.$set(this.jobParamValue, [item.key], item.value);
                  this.$set(this.jobParamsMappingMode, [item.key], item.mappingMode);
                }
              });
            }
            if (itemValue.config.executeNodeConfig.mappingMode == 'constant') {
              this.filterSearchValue = itemValue.config.executeNodeConfig.value || {}; // 执行目标值回显
            } else {
              this.$set(this.executeNode, 'mappingMode', itemValue.config.executeNodeConfig.mappingMode);
              this.$set(this.executeNode, 'value', itemValue.config.executeNodeConfig.value);
            }
          }
          this.basicFormItemList && this.basicFormItemList.forEach((item) => {
            if (item && item.name == 'formUuid' && itemValue.formUuid) {
              this.$set(item, 'isHidden', !itemValue.formUuid);
            }
          });
          this.formUuid = itemValue.formUuid;
          if (itemValue.formUuid) {
            this.mappingModeDataList = [{
              text: this.$t('page.constant'),
              value: 'constant'
            }, {
              text: this.$t('term.autoexec.formparameter'),
              value: 'formattr'
            }];
            this.getFormListByFormUuid(itemValue.formUuid);
          } else {
            this.mappingModeDataList = [
              {
                text: this.$t('page.constant'),
                value: 'constant'
              }
            ];
          }
          this.getCombopDetail(true);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getFormListByFormUuid(uuid) {
      // 根据表单id获取表单列表
      this.formDataList = [];
      this.$api.framework.form.getFormByVersionUuid({uuid: uuid}).then(res => {
        if (res.Status == 'OK') {
          let formConfig = res.Return.formConfig;
          formConfig && formConfig.tableList && formConfig.tableList.length > 0 && formConfig.tableList.forEach((item) => {
            if (item && !this.$utils.isEmpty(item.component) && item.component.hasValue) {
              this.formDataList.push(item.component);
            }
          });
        } 
      });
    },
    initConfig() {
      // 初始化作业参数列表数据
      this.itemConfig = {};
      this.valueConfig = {};
      this.paramsList instanceof Array && this.paramsList.forEach(data => {
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
        this.$set(data, 'mappingMode', !this.$utils.isEmpty(this.jobParamsMappingMode) ? this.jobParamsMappingMode[data.key] : 'constant');
        this.$set(this.itemConfig, data.key, config);
        // 对象为空显示默认值，否则显示回显值
        this.$set(this.valueConfig, data.key, this.$utils.isEmpty(this.jobParamValue) ? data.defaultValue : this.jobParamValue[data.key]);
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
      let formList = ['basicForm', 'roundCountForm', 'executeTarget', 'executeUserForm', 'protocolForm'];
      let jobParamFormList = this.$refs.jobParamForm || [];
      let mappingModeFormList = this.$refs.mappingModeForm || [];
      !this.$utils.isEmpty(formList) && formList.forEach((item) => {
        if (this.$refs[item] && !this.$refs[item].valid()) {
          if (!this.unfoldAndFold[item]) {
            if (!this.unfoldAndFold['executeAccountForm'] && (item == 'executeUserForm' || item == 'protocolForm')) { 
              this.handleUnfoldAndFold('executeAccountForm'); 
            } else {
              this.handleUnfoldAndFold(item);
            }
          }
          isValid = false;
        }
      });
      !this.$utils.isEmpty(jobParamFormList) && jobParamFormList.forEach((item) => {
        // 作业参数必填校验
        if (item && !item.valid()) {
          if (!this.unfoldAndFold['jobParam']) { // 用户关闭作业参数模块，验证不通过，需要打开对应模块
            this.handleUnfoldAndFold('jobParam');
          }
          isValid = false;
        }
      });
      !this.$utils.isEmpty(mappingModeFormList) && !this.$utils.isEmpty(mappingModeFormList.$parent) && !this.$utils.isEmpty(mappingModeFormList.$parent.$children) && mappingModeFormList.$parent.$children.forEach((item) => {
        // 表单映射关系
        if (item && !item.valid()) {
          isValid = false;
        }
      });
      return isValid;
    },
    saveService() {
      let executeNode = this.$refs.executeTarget ? this.$refs.executeTarget.getValue() : ''; // 执行目标
      let runtimeParamList = [];
      this.paramsList && this.paramsList.forEach((item) => {
        if (item && item.key) {
          runtimeParamList.push({
            key: item.key,
            mappingMode: item.mappingMode,
            value: this.valueConfig[item.key]
          });
        }
      });
      let params = {
        ...this.basicFormValue,
        type: 'service',
        id: this.id == true ? '' : this.id,
        parentId: this.id == true ? this.selectedTreeNode.id : this.selectedTreeNode.parentId,
        scenarioId: this.scenarioId,
        config: {
          roundCount: {
            mappingMode: this.roundCount.mappingMode,
            value: this.roundCount.value
          },
          protocol: {
            mappingMode: this.protocol.mappingMode,
            value: this.protocol.value
          },
          executeUser: this.executeUser,
          executeNodeConfig: {
            mappingMode: this.executeNode.mappingMode,
            value: this.executeNode.value || executeNode
          },
          runtimeParamList: runtimeParamList
        }
      };
      if (params && params.hasOwnProperty('citeForm')) {
        delete params.citeForm;
      }
      if (!this.valid()) {
        return false;
      } else {
        this.$emit('save', params);
      }
    },
    getCombopDetail(isEdit = false) {
      if (!this.combopId) {
        return;
      }
      if (!isEdit) {
        // 切换不同的组合工具，需要清空之前的值
        this.clearComboptoolValue();
      }
      let dataInfo = {};
      let data = {
        id: this.combopId
      };
      this.loadingShow = true;
      this.$api.autoexec.action
        .getActionDetail(data)
        .then(res => {
          this.loadingShow = false;
          if (res.Status == 'OK') {
            dataInfo = res.Return;
            this.stepList = dataInfo.config.combopPhaseList;
            this.paramsList = dataInfo.config.runtimeParamList || [];
            this.needExecuteNode = dataInfo.needExecuteNode;
            this.needExecuteUser = dataInfo.needExecuteUser;
            this.needProtocol = dataInfo.needProtocol;
            this.needRoundCount = dataInfo.needRoundCount;
            this.executeConfig = dataInfo.config.executeConfig || {};
            if (isEdit) {
              this.$set(this.executeConfig, 'executeNodeConfig', this.filterSearchValue); // 执行目标回显
            }
            if (this.paramsList && !this.$utils.isEmpty(this.paramsList)) {
              this.initConfig(); // 设置作业参数值
            }
            if (this.needExecuteNode || this.needExecuteUser || this.needProtocol) {
              this.protocolForm.isHidden = !this.needProtocol;
              this.executeUserForm.isHidden = !this.needExecuteUser;
            }
            // 场景
            if (dataInfo && dataInfo.config && dataInfo.config.scenarioList) {
              this.scenarioList = dataInfo.config.scenarioList;
            }
            if (!isEdit) {
              this.filterSearchValue = this.executeConfig.executeNodeConfig && this.executeConfig.executeNodeConfig.filter ? this.executeConfig.executeNodeConfig.filter : {};
              if (this.executeConfig.roundCount == 0 || !this.$utils.isEmpty(this.executeConfig.roundCount)) {
                this.$set(this.roundCount, 'value', this.executeConfig.roundCount);
                this.$set(this.roundCountForm, 'disabled', true);
                this.$set(this.roundCountForm, 'disabledHoverTitle', this.$t('term.autoexec.setbantchnumbernoupdate'));
              }
              if (this.executeConfig.whenToSpecify == 'runtime') { // 过滤器运行在执行，需要把执行目标值清空
                this.$set(this.executeConfig, 'executeNodeConfig', {});
              }
              this.scenarioId = dataInfo.config.defaultScenarioId || null;
              if (dataInfo.config.executeConfig && !this.$utils.isEmptyObj(dataInfo.config.executeConfig)) {
              // 连接协议和执行账户回显
                this.executeValue['executeUser'] = dataInfo.config.executeConfig['executeUser'];
                this.executeValue['protocolId'] = dataInfo.config.executeConfig['protocolId'];
                this.executeUser.value = dataInfo.config.executeConfig['executeUser'];
                this.protocol.value = dataInfo.config.executeConfig['protocolId'];
              }
            }
          }
        })
        .finally(() => {
          this.loadingShow = false;
        });
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
    hasFormUuid() {
      // 是否选中表单
      if (this.formUuid) {
        return true;
      }
      return false;
    }
  },
  watch: {
    id() {
      this.initData();
    }
  }
};
</script>
<style lang="less" scoped>
.form-wrap-box {
  display: flex;
}
.form-li-width {
 width: 100%;
}
</style>
