<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <ExpiredReasonAlert :serviceData="serviceData" type="location" @click="toJobParamLocation"></ExpiredReasonAlert>
    <div class="radius-lg bg-op padding">
      <div class="flex-between" :class="unfoldAndFold.basicForm ? 'mb-sm' : ''">
        <span>{{ $t('page.basicinfo') }}</span>
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
      <div class="flex-between" :class="unfoldAndFold.scenarioForm ? 'mb-sm' : ''">
        <span>{{ $t('page.scene') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.scenarioForm ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('scenarioForm')"></span>
      </div>
      <TsFormItem
        v-show="unfoldAndFold.scenarioForm"
        id="positioningkey_scenarioId"
        :label="$t('page.scene')"
        :required="true"
      >
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
    <div v-if="hasCombopId" class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.roundCountForm ? 'mb-sm' : ''">
        <span>{{ $t('term.autoexec.batchsetting') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.roundCountForm ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('roundCountForm')"></span>
      </div>
      <TsFormItem v-show="unfoldAndFold.roundCountForm" :label="$t('term.autoexec.batchquantity')" :required="hasRequired(roundCount.mappingMode)">
        <div id="positioningkey_roundCount" :class="roundCount.mappingMode == 'formattr' || roundCount.mappingMode == 'constant' ? 'form-wrap-box' : ''">
          <TsFormSelect
            ref="roundCountmappingMode"
            v-model="roundCount.mappingMode"
            :dataList="mappingModeDataList"
            :disabled="roundCountForm.disabled ? true : false"
            :clearable="false"
            :width="roundCount.mappingMode == 'formattr' || roundCount.mappingMode == 'constant' ? 100 : '100%'"
            transfer
            border="border"
            :class="roundCount.mappingMode == 'formattr' || roundCount.mappingMode == 'constant' ? 'pr-sm' : ''"
            :validateList="['required']"
            @change="(mappingMode) => changeMappingMode(mappingMode, 'roundCount')"
          ></TsFormSelect>
          <TsFormSelect
            v-if="roundCount.mappingMode == 'formattr'"
            ref="roundCountmappingMode"
            v-model="roundCount.value"
            :dataList="formDataList"
            :disabled="roundCountForm.disabled ? true : false"
            valueName="uuid"
            textName="label"
            transfer
            border="border"
            class="pr-sm form-li-width"
            :validateList="['required']"
          ></TsFormSelect>
          <TsFormSelect
            v-else-if="roundCount.mappingMode == 'constant'"
            ref="roundCountForm"
            v-model="roundCount.value"
            class="form-li-width"
            v-bind="roundCountForm"
            :validateList="hasRequired(roundCount.mappingMode) ? ['required'] : []"
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
      <TsFormItem v-show="unfoldAndFold.executeTarget" :label="$t('term.autoexec.executetarget')" :required="hasRequired(executeNode.mappingMode)">
        <div id="positioningkey_executeNodeConfig" :class="executeNode.mappingMode == 'formattr' || executeNode.mappingMode == 'constant' ? 'form-wrap-box' : ''">
          <TsFormSelect
            ref="executeNodemappingMode"
            v-model="executeNode.mappingMode"
            :dataList="mappingModeDataList"
            :disabled="!canEditaddTarget(executeConfig)"
            :clearable="false"
            transfer
            border="border"
            :width="executeNode.mappingMode == 'formattr' || executeNode.mappingMode == 'constant' ? 100 : '100%'"
            :class="executeNode.mappingMode == 'formattr' || executeNode.mappingMode == 'constant' ? 'pr-sm' : ''"
            :validateList="['required']"
            @change="(mappingMode) => changeMappingMode(mappingMode, 'executeNode')"
          ></TsFormSelect>
          <TsFormSelect
            v-if="executeNode.mappingMode == 'formattr'"
            ref="executeNodemappingMode"
            v-model="executeNode.value"
            :dataList="formDataList"
            :disabled="!canEditaddTarget(executeConfig)"
            valueName="uuid"
            textName="label"
            transfer
            border="border"
            class="pr-sm form-li-width"
            :validateList="['required']"
          ></TsFormSelect>
          <div v-else style="width: 100%;">
            <AddTarget
              v-if="!loadingShow && executeNode.mappingMode == 'constant'"
              :id="combopId"
              ref="executeTarget"
              :value="executeConfig ? executeConfig.executeNodeConfig:{}"
              :canEdit="canEditaddTarget(executeConfig)"
              :type="executeConfig && executeConfig.whenToSpecify? executeConfig.whenToSpecify: 'runtime'"
              :executeConfig="executeValue"
              :runtimeParamList="paramsList"
              :needBorder="needExecuteUser|| needProtocol"
              :filterSearchValue="filterSearchValue"
              :isRequired="hasRequired(executeNode.mappingMode)"
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
        <TsFormItem :label="$t('page.protocol')" :required="hasRequired(protocol.mappingMode)">
          <div id="positioningkey_protocol" :class="protocol.mappingMode == 'formattr' || protocol.mappingMode == 'constant' ? 'form-wrap-box' : ''">
            <TsFormSelect
              ref="protocolmappingMode"
              v-model="protocol.mappingMode"
              :dataList="mappingModeDataList"
              :clearable="false"
              transfer
              border="border"
              :width="protocol.mappingMode == 'formattr' || protocol.mappingMode == 'constant' ? 100 : '100%'"
              :class="protocol.mappingMode == 'formattr' || protocol.mappingMode == 'constant' ? 'pr-sm' : ''"
              :validateList="['required']"
              @change="(mappingMode) => changeMappingMode(mappingMode, 'protocol')"
            ></TsFormSelect>
            <TsFormSelect
              v-if="protocol.mappingMode == 'formattr'"
              ref="protocolmappingMode"
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
              v-else-if="protocol.mappingMode == 'constant'"
              ref="protocolForm"
              v-model="protocol.value"
              v-bind="protocolForm"
              :validateList="hasRequired(protocol.mappingMode) ? ['required'] : []"
              class="form-li-width"
              transfer
            ></TsFormSelect>
          </div>
        </TsFormItem>
        <TsFormItem :label="$t('page.executeuser')" :required="hasRequired(executeUser.mappingMode)">
          <div id="positioningkey_executeUser" :class="executeUser.mappingMode == 'formattr' || executeUser.mappingMode == 'constant' ? 'form-wrap-box' : ''">
            <template v-if="executeUser.mappingMode == 'runtimeparam'">
              <!-- 执行用户映射关系是自动化设置的作业参数时，设置只读样式 -->
              <ExecuteuserSetting
                ref="executeUser"
                :config="executeUser"
                :readonly="true"
                :runtimeParamList="paramsList"
              ></ExecuteuserSetting>
            </template>
            <template v-else>
              <TsFormSelect
                ref="executeUsermappingMode"
                v-model="executeUser.mappingMode"
                :dataList="mappingModeDataList"
                :clearable="false"
                transfer
                border="border"
                :class="executeUser.mappingMode == 'formattr' || executeUser.mappingMode == 'constant' ? 'pr-sm' : ''"
                :width="executeUser.mappingMode == 'formattr' || executeUser.mappingMode == 'constant' ? 100: '100%'"
                :validateList="['required']"
                @change="(mappingMode) => changeMappingMode(mappingMode, 'executeUser')"
              ></TsFormSelect>
              <TsFormSelect
                v-if="executeUser.mappingMode == 'formattr'"
                ref="executeUsermappingMode"
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
                v-else-if="executeUser.mappingMode == 'constant'"
                ref="executeUserForm"
                v-model="executeUser.value"
                v-bind="executeUserForm"
                :validateList="hasRequired(executeUser.mappingMode) ? ['required'] : []"
                class="form-li-width"
                border="border"
              ></TsFormInput>
            </template>
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
        <div
          v-for="(item, pIndex) in paramsList"
          :id="`positioningkey_${item.key}`"
          :key="pIndex"
          class="mb-nm"
        >
          <TsFormItem :label="item.name" :required="jobParamIsRequired(item.isRequired, item.mappingMode)">
            <div :class="item.mappingMode == 'formattr' || item.mappingMode == 'constant' ? 'form-wrap-box' : ''">
              <TsFormSelect
                ref="jobParammappingMode"
                v-model="item.mappingMode"
                :dataList="getMappingmodeList(item.isRequired)"
                :clearable="false"
                :width="item.mappingMode == 'formattr' || item.mappingMode == 'constant' ? 100 : '100%'"
                transfer
                border="border"
                :class="item.mappingMode == 'formattr' || item.mappingMode == 'constant' ? 'pr-sm' : ''"
                :validateList="['required']"
                :disabled="canEdit(item)"
                @change="(mappingMode) => changejobparamMappingMode(item, item.key, mappingMode)"
              ></TsFormSelect>
              <TsFormSelect
                v-if="item.mappingMode == 'formattr'"
                ref="jobParammappingMode"
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
                v-else-if="item.mappingMode == 'constant'"
                ref="jobParamForm"
                v-model="valueConfig[item.key]"
                :locatedKey="item.key"
                class="form-li-width"
                :isRequired="jobParamIsRequired(item.isRequired, item.mappingMode, item.key)"
                :defaultValue="item.defaultValue"
                :config="itemConfig[item.key]"
                :phaseList="getPhaseList(stepList)"
                :disabled="canEdit(item)"
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
    >{{ $t('page.save') }}</Button>
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
    ExecuteuserSetting: resolve => require(['@/views/pages/autoexec/detail/actionDetail/executeuser-setting.vue'], resolve),
    ExpiredReasonAlert: resolve => require(['../service-catalog/expired-reason-alert'], resolve), // 服务失效原因提示列表
    ...Component
  },
  mixins: [catalogmixin],
  props: {},
  data() {
    return {
      serviceData: {},
      loadingShow: true,
      unfoldAndFold: {
        // 展开收起
        scenarioForm: true,
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
      nociteFormMappingModeList: [
        // 没有应用表单映射关系列表
        {
          text: this.$t('page.constant'),
          value: 'constant'
        },
        {
          text: this.$t('page.notsetting'),
          value: 'notsetup'
        }
      ],
      citeFormMappingModeList: [
        {
          text: this.$t('page.constant'),
          value: 'constant'
        },
        {
          text: this.$t('page.form'),
          value: 'formattr'
        }
      ],
      jobparamnociteformMappingModeList: [
        {
          text: this.$t('page.constant'),
          value: 'constant'
        },
        {
          text: this.$t('term.expression.empty'),
          value: 'isempty'
        },
        {
          text: this.$t('page.notsetting'),
          value: 'notsetup'
        }
      ],
      jobparamciteformMappingModeList: [
        {
          text: this.$t('page.constant'),
          value: 'constant'
        },
        {
          text: this.$t('term.expression.empty'),
          value: 'isempty'
        },
        {
          text: this.$t('page.form'),
          value: 'formattr'
        }
      ],
      mappingModeDataList: this.nociteFormMappingModeList,
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
          validateList: ['required'],
          onChange: (isActive) => {
            this.updateActiveStatus(this.id, isActive);
          }
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
          label: this.$t('page.form'),
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
              this.mappingModeDataList = this.citeFormMappingModeList;
              this.getFormListByFormUuid(uuid);
            } else {
              this.mappingModeDataList = this.nociteFormMappingModeList;
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
      executeUserForm: {},
      jobParamValue: {}, // 作业参数值
      jobParamsMappingMode: {}, // 作业参数映射关系
      locationKey: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changejobparamMappingMode(item, key, mappingMode) {
      if (mappingMode == 'isempty' || mappingMode == 'notsetup') {
        // 映射关系为空或者不设置需要清空值
        this.$set(this.valueConfig, [key], '');
        this.$set(this.itemConfig[key], 'validateList', []); // 解决config选择映射关系为不设置，必填字段没有去掉的问题
      } else if (mappingMode == 'constant' || mappingMode == 'formattr') {
        this.$set(this.itemConfig[key], 'validateList', ['required']);
        if (mappingMode != 'constant') {
        // 映射关系切换成其他的方式时，需要把默认值清空，否则校验会有问题
          this.$set(this.valueConfig, [key], '');
          this.$set(item, 'defaultValue', '');
        }
      }
    },
    changeMappingMode(mappingMode, key) {
      if (key == 'executeNode') {
        //  执行目标映射关系为不设置时，需要清空执行目标的值
        this.filterSearchValue = {};
        this.$refs.executeTarget && this.$refs.executeTarget.clearTarget();
      } else if (mappingMode != 'constant') {
        // 映射关系不是常量时，需要清空对应的值，否则会出现验证不通过的问题
        this.$set(this[key], 'value', '');
      }
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
      this.mappingModeDataList = this.nociteFormMappingModeList;
    },
    defaultIniData() {
      // 默认初始值
      this.unfoldAndFold = {
        // 展开收起
        scenarioForm: true,
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
      this.mappingModeDataList = this.nociteFormMappingModeList;
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
    async initData() {
      this.defaultIniData();
      if (this.id == true) {
        this.basicFormItemList.forEach((item) => {
          if (item && item.name == 'name') {
            item.validateList.forEach((v) => {
              if (v && v.name) {
                v.params = {};
                this.$set(v.params, 'parentId', this.selectedTreeNode.id || 0);
              }
            });
          }
        });
        this.loadingShow = false;
        this.serviceData = {};
        return false;
      }
      this.basicFormItemList.forEach((item) => {
        if (item && item.name == 'name') {
          item.validateList.forEach((v) => {
            if (v && v.name) {
              this.$set(v.params, 'id', this.id);
              this.$set(v.params, 'parentId', this.selectedTreeNode.id);
            }
          });
        }
      });
      // 初始化
      this.loadingShow = true;
      await this.$api.autoexec.catalogManage.getSeriveInfo({id: this.id}).then(async res => {
        if (res.Status == 'OK') {
          let itemValue = res.Return;
          this.serviceData = itemValue;
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
                  if (item.mappingMode) { // 作业参数映射关系值回显
                    this.$set(this.jobParamsMappingMode, [item.key], item.mappingMode);
                  }
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
            this.mappingModeDataList = this.citeFormMappingModeList;
            this.getFormListByFormUuid(itemValue.formUuid);
          } else {
            this.mappingModeDataList = this.nociteFormMappingModeList;
          }
          await this.getCombopDetail(true);
          if (this.positioningKey) {
            // 定位到具体失效的key的位置
            this.toJobParamLocation(this.positioningKey);
          }
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
        this.$set(data, 'mappingMode', !this.$utils.isEmpty(this.jobParamsMappingMode) ? (this.jobParamsMappingMode[data.key] || 'constant') : 'constant');
        this.$set(this.itemConfig, data.key, config);
        // 对象为空显示默认值，否则显示回显值
        this.$set(this.valueConfig, data.key, this.handleValueConfig(data));
      });
    },
    handleValueConfig(data) {
      // 处理作业参数值回显
      if (this.$utils.isEmpty(this.jobParamValue)) {
        return data.defaultValue;
      } else if (this.getExpiredResonKeyList.includes(data.key) && this.$utils.isEmpty(data.defaultValue)) {
        // 服务过期，对应的参数没有设置默认值时，需要清空作业参数值
        return '';
      } else if (this.jobParamValue[data.key]) {
        return this.jobParamValue[data.key];
      } else if (data.mappingMode == 'constant') {
        // 映射关系是常量，需要设置默认值
        return data.defaultValue;
      } else {
        return '';
      }
    },
    handleUnfoldAndFold(moduleName) {
      // 展开收起
      if (this.unfoldAndFold.hasOwnProperty(moduleName)) {
        this.unfoldAndFold[moduleName] = !this.unfoldAndFold[moduleName];
      }
    },
    valid() {
      let isValid = true;
      let formList = ['basicForm', 'scenarioForm', 'roundCountForm', 'executeTarget', 'executeUserForm', 'protocolForm'];
      let jobParamFormList = this.$refs.jobParamForm || [];
      let mappingModeFormList = ['roundCountmappingMode', 'executeNodemappingMode', 'protocolmappingMode', 'executeUsermappingMode']; // 映射关系下拉列表
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
      !this.$utils.isEmpty(mappingModeFormList) && mappingModeFormList.forEach((item) => {
        // 表单映射关系
        if (this.$refs[item] && this.$refs[item].valid && !this.$refs[item].valid()) {
          isValid = false;
        }
      });
      !this.$utils.isEmpty(this.$refs.jobParammappingMode) && this.$refs.jobParammappingMode.forEach((item) => {
        // 作业参数映射关系
        if (item && item.valid && !item.valid()) {
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
            name: item.name,
            type: item.type,
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
        config: {
          scenarioId: this.scenarioId,
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
    toJobParamLocation(key) {
      // 定位到具体作业参数，对应参数需要高亮提示
      if (key) {
        this.$utils.jumpTo('#positioningkey_' + key);
        let jobParamFormList = this.$refs.jobParamForm || [];
        !this.$utils.isEmpty(jobParamFormList) && jobParamFormList.forEach((item) => {
          if (item && item.$attrs && item.$attrs.locatedKey == key && !item.valid()) {
            if (!this.unfoldAndFold['jobParam']) { // 打开作业参数收起按钮
              this.handleUnfoldAndFold('jobParam');
            }
          }
        });
      }
    },
    async getCombopDetail(isEdit = false) {
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
      await this.$api.autoexec.action
        .getActionDetail(data)
        .then(res => {
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
                if (!this.$utils.isEmpty(dataInfo.config.executeConfig['executeUser'] && dataInfo.config.executeConfig['executeUser']['mappingMode'])) {
                  this.executeUser.mappingMode = dataInfo.config.executeConfig['executeUser']['mappingMode']; // 执行用户回显
                }
                this.executeUser.value = dataInfo.config.executeConfig['executeUser']['value'];
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
    hasRequired() {
      // 是否必填,mappingMode映射关系为常量或者表单时，必填，否则不必填
      return (mappingMode) => {
        return !!((mappingMode == 'constant' || mappingMode == 'formattr'));
      };
    },
    jobParamIsRequired() {
      // 作业参数必填
      return (isRequired, mappingMode, key) => {
        if (isRequired || (mappingMode == 'constant' || mappingMode == 'formattr')) {
          if (mappingMode == 'notsetup') {
            // 作业参数必填，但是映射关系是不设置时，需要把必填去掉
            if (key == 'file' || key == 'node') {
              this.$set(this.itemConfig[key], 'validateList', []); // 文件.节点，需要清空必填参数
            }
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      };
    },
    canEdit() {
      // 作业参数在组合工具设置不可编辑，这里也不可编辑
      return (item) => {
        return item.hasOwnProperty('editable') ? !item.editable : false;
      };
    },
    canEditaddTarget() {
      // 执行目标是否可以编辑
      return (executeConfig) => {
        return (executeConfig && executeConfig.whenToSpecify) ? executeConfig.whenToSpecify == 'runtime' : true;
      };
    },
    getMappingmodeList() {
      return (isRequired) => {
        if (isRequired && this.formUuid) {
          // 必填+引用表单
          return this.citeFormMappingModeList;
        } else if (isRequired && !this.formUuid) {
          // 必填+无引用表单
          return this.nociteFormMappingModeList;
        } else if (!isRequired && this.formUuid) {
          // 非必填+引用表单
          return this.jobparamciteformMappingModeList;
        } else if (!isRequired && !this.formUuid) {
          // 非必填+无引用表单
          return this.jobparamnociteformMappingModeList;
        } else {
          return this.nociteFormMappingModeList;
        }
      };
    },
    getExpiredResonKeyList() {
      // 获取服务失效，原因key列表
      let keyList = [];
      if (!this.$utils.isEmpty(this.serviceData.configExpired) && !this.$utils.isEmpty(this.serviceData.configExpiredReason)) {
        this.serviceData.configExpiredReason.reasonList.forEach((item) => {
          if (item.key) {
            keyList.push(item.key);
          }
        });
      }
      return keyList;
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
