<template>
  <div class="autonode-setting">
    <Loading :loading-show="loadingShow" type="fix"></Loading>
    <!-- 表单场景 -->
    <FormsceneSetting
      :value="configData.stepConfig"
      :formConfig="formConfig"
      :toSetting="toSetting"
      @updateScene="updateScene"
    ></FormsceneSetting>
    <AuthoritySetting
      :list="authorityList"
      :defaultIsActive="activeSetting.permission"
      :nodeConfig="nodeConfig"
      @updateauthority="updateauthority"
    ></AuthoritySetting>
    <!-- 通知设置 -->
    <NoticeSetting
      ref="NoticeSetting"
      v-model="activeSetting.informSetting"
      :formUuid="formUuid"
      :config="notifyPolicyConfig"
      :nodeConfig="nodeConfig"
    ></NoticeSetting>
    <ButtonSetting
      :defaultIsActive="activeSetting.buttonStatus"
      :defaultCustomButtonList="customButtonList"
      :defaultCustomStatusList="customStatusList"
      :defaultReplaceableTextList="replaceableTextList"
      :nodeConfig="nodeConfig"
      @updatebutton="updatebutton"
    ></ButtonSetting>
    <div class="permission-list">
      <div class="list">
        <div class="second-title text-grey">{{ $t('term.process.startTimeWindow') }}</div>
        <TsFormDatePicker
          v-model="timeWindow"
          type="timerange"
          transfer
          format="HH:mm"
          :placeholder="$t('form.placeholder.pleaseselect', {target: $t('page.timerange')})"
          border="border"
        ></TsFormDatePicker>
      </div>
    </div>
    <div class="settingList">
      <div id="requestIntegration" class="control-box">
        <div class="control-setting">
          <span class="label require-label">{{ $t('term.process.externalcall') }}</span>
          <span class="control-btn">
            <span class="tip">
              <span
                v-if="requestConfig.integrationUuid"
                class="tsfont-edit text-tip-active"
                :title="$t('page.edit')"
                @click="toIntegration('request',requestConfig.integrationUuid)"
              ></span>
              <span
                v-if="requestConfig.integrationUuid"
                class="tsfont-rotate-right text-tip-active"
                :title="$t('page.refresh')"
                style="padding-left:8px"
                @click="reloadIntegration(requestConfig.integrationUuid)"
              ></span>
            </span>
          </span>
        </div>
      </div>
      <div class="permission-list">
        <div class="list input-border">
          <TsFormSelect
            ref="requestIntegration"
            v-model="requestConfig.integrationUuid"
            transfer
            :search="true"
            :selectItemList.sync="selectItemList"
            :validateList="validateSetting.required"
            :dynamicUrl="dynamicUrl"
            rootName="tbodyList"
            textName="name"
            valueName="uuid"
            border="border"
            @on-change="emptyData('request')"
          >
            <template slot="first-ul">
              <li style="text-align: center;" @click.stop="stopPropagation($event)">
                <a class="tsfont-plus text-href add-integration" href="javascript:void(0);" @click="toIntegration('request')">{{ $t('term.process.externalcall') }}</a>
              </li>
            </template>
          </TsFormSelect>
        </div>
      </div>
      <div v-if="requestConfig.integrationUuid && requestInputParamList.length > 0" class="permission-list">
        <div class="second-title text-grey">{{ $t('term.autoexec.paramsvalue') }}</div>
        <div class="list">
          <div class="">
            <TsRow
              v-for="(inputPara,pindex) in requestInputParamList"
              :key="pindex"
              :gutter="8"
              class="param-list"
            >
              <Col span="8">
                <div class="disabled-text text-title overflow" :title="inputPara.name"><span :class="inputPara.isRequired && inputPara.isRequired==1?'require-label':''"></span>{{ inputPara.name }}</div>
              <!-- <TsFormInput :value="inputPara.name" :disabled="true"></TsFormInput> -->
              </Col>
              <Col span="16">
                <TsFormSelect
                  v-model="inputPara.value"
                  search
                  filterable
                  transfer
                  allow-create
                  :dataList="returnParamConditionList(inputPara)"
                  textName="label"
                  valueName="value"
                  border="border"
                ></TsFormSelect>
              </Col>
            </TsRow>
          </div>
        </div>
      </div>
      <div v-if="requestConfig.integrationUuid" class="permission-list">
        <div class="control-setting">
          <span class="label">
            {{ $t('page.successjudgment') }}
            <span>
              <Tooltip
                placement="bottom"
                max-width="300"
                transfer
                theme="light"
              >
                <b class="tsfont-info-o text-href"></b>
                <div slot="content">
                  <p>{{ $t('term.process.successjudgmenttip') }}</p>
                </div>
              </Tooltip>
            </span>
          </span>
          <span class="control-btn">
            <span class="tip">{{ swithConfig.requestSuccessConfig == 1 ? $t('page.custom'): $t('page.default') }}</span>
            <span style="display: inline-block;" :title="requestOutputParamList.length > 0?'':$t('term.process.extcallnoparamtip')">
              <TsFormSwitch
                v-model="swithConfig.requestSuccessConfig"
                :true-value="1"
                :false-value="0"
                :disabled="requestOutputParamList.length > 0 ? false : true"
              ></TsFormSwitch>
            </span>
          </span>
        </div>
        <div v-if="swithConfig.requestSuccessConfig == 1" class="list list-bottom">
          <div class="">
            <TsRow :gutter="4">
              <Col :span="showConfigInput?8:12">
                <TsFormSelect
                  v-model="requestSuccessConfig.name"
                  :dataList="requestOutputParamList"
                  textName="name"
                  valueName="name"
                ></TsFormSelect>
              </Col>
              <Col :span="showConfigInput?8:12">
                <TsFormSelect
                  v-model="requestSuccessConfig.expression"
                  :dataList="getExpressionList(requestSuccessConfig.name,'request')"
                  valueName="expression"
                  textName="expressionName"
                > </TsFormSelect>
              </Col>
              <Col v-show="showConfigInput" span="8">
                <TsFormInput
                  v-model="requestSuccessConfig.value"
                  maxlength="50"
                  :title="requestSuccessConfig.value"
                > </TsFormInput>
              </Col>
            </TsRow>
          </div>
        </div>
      </div>
    </div>
    <div id="failPolicy" class="permission-list">
      <div class="list">
        <div class="second-title text-grey require-label">{{ $t('page.failurestrategy') }}</div>
        <div class="input-border">
          <TsFormSelect
            ref="failPolicy"
            v-model="requestConfig.failPolicy"
            :dataList="failPolicyList"
            :validateList="validateSetting.required"
            border="border"
          > </TsFormSelect>
        </div>
      </div>
    </div>
    <div class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">{{ $t('term.process.echotemplate') }}</span>
          <span class="control-btn tip">
            <span class="text-tip-active tsfont-edit" @click="editTemplate('request')"></span>
          </span>
        </div>
      </div>
    </div>
    <div class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">{{ $t('term.process.callbackornot') }}</span>
          <span class="control-btn">
            <span class="tip">{{ swithConfig.callbackConfig == 1 ?$t('page.yes') : $t('page.no') }}</span>
            <span style="display: inline-block;">
              <TsFormSwitch v-model="swithConfig.callbackConfig" :true-value="1" :false-value="0"></TsFormSwitch>
            </span>
          </span>
        </div>
      </div>
      <div v-if="swithConfig.callbackConfig == 1" class="permission-list">
        <div class="list list-bottom">
          <RadioGroup v-model="callbackConfigType">
            <Radio v-for="(c,cindex) in callbackList" :key="cindex" :label="c.value">
              <span>{{ c.text }}</span>
              <span v-if="c.value == 'interval'" style="padding-right:8px">
                <Tooltip
                  placement="bottom"
                  max-width="300"
                  transfer
                  theme="light"
                >
                  <b class="tsfont-info-o text-href"></b>
                  <div slot="content">
                    <!-- <p v-if="c.value == 'wait'">步骤将挂起，等待第三方系统回调接口：xxxxxxx（接口+帮助）xxxxxx</p> -->
                    <p>{{ $t('term.process.intervaltip') }}</p>
                  </div>
                </Tooltip>
              </span>
            </Radio>
          </RadioGroup>
        </div>
        <div v-if="callbackConfigType == 'interval'">
          <div id="callbackInterval" class="list">
            <div class="second-title text-grey require-label">{{ $t('page.timeinterval') }}</div>
            <div class="content input-border">
              <TsRow :gutter="8">
                <Col span="12">
                  <TsFormInput
                    ref="callbackInterval"
                    v-model="callbackConfig.config.interval"
                    :placeholder="$t('form.placeholder.pleaseinput', {target:$t('term.process.duration')})"
                    type="number"
                    :validateList="validateSetting.number"
                    border="border"
                  />
                </Col>
                <Col span="12">
                  <div style="line-height: 32px;">{{ $t('page.minute') }}</div>
                </Col>
              </TsRow>
            </div>
          </div>
          <div id="callbackintegration" class="list" :class="callbackConfig.config.integrationUuid?'list-bottom':''">
            <div class="control-setting">
              <span class="label require-label">{{ $t('term.process.externalcall') }}</span>
              <span class="control-btn">
                <span class="tip">
                  <span
                    v-if="callbackConfig.config.integrationUuid"
                    class="tsfont-edit text-tip-active"
                    :title="$t('page.edit')"
                    @click="toIntegration('callback',callbackConfig.config.integrationUuid)"
                  ></span>
                  <span
                    v-if="callbackConfig.config.integrationUuid"
                    class="tsfont-rotate-right text-tip-active"
                    :title="$t('page.refresh')"
                    style="padding-left:8px"
                    @click="reloadIntegration(callbackConfig.config.integrationUuid)"
                  ></span>
                </span>
              </span>
            </div>
            <div class="input-border">
              <TsFormSelect
                ref="callbackintegration"
                v-model="callbackConfig.config.integrationUuid"
                transfer
                :validateList="validateSetting.required"
                :search="true"
                :selectItemList.sync="callbackSelectItemList"
                :dynamicUrl="dynamicUrl"
                rootName="tbodyList"
                textName="name"
                valueName="uuid"
                border="border"
                @on-change="emptyData('callback')"
              >
                <template slot="first-ul">
                  <li style="text-align: center;" @click.stop="stopPropagation($event)">
                    <a class="tsfont-plus text-href add-integration" href="javascript:void(0);" @click="toIntegration('callback')">{{ $t('term.process.externalcall') }}</a>
                  </li>
                </template>
              </TsFormSelect>
            </div>
          </div>
          <div v-if="callbackConfig.config.integrationUuid">
            <div v-if="callbackInputParamList.length > 0">
              <div class="text-grey">{{ $t('term.autoexec.paramsvalue') }}</div>
              <div class="">
                <TsRow
                  v-for="(inputPara,pindex) in callbackInputParamList"
                  :key="pindex"
                  :gutter="8"
                  class="param-list"
                >
                  <Col span="12">
                    <div class="disabled-text text-title overflow" :title="inputPara.name"><span :class="inputPara.isRequired==1?'require-label':''"></span>{{ inputPara.name }}</div>
                  </Col>
                  <Col span="12">
                    <TsFormSelect
                      v-model="inputPara.value"
                      search
                      filterable
                      transfer
                      allow-create
                      :dataList="callbackParamConditionList(inputPara)"
                      textName="label"
                      valueName="value"
                      border="border"
                    ></TsFormSelect>
                  </Col>
                </TsRow>
              </div>
            </div>
            <div>
              <div class="control-setting">
                <span class="label">
                  {{ $t('page.successjudgment') }}
                  <span>
                    <Tooltip
                      placement="bottom"
                      max-width="300"
                      transfer
                      theme="light"
                    >
                      <b class="tsfont-info-o text-href"></b>
                      <div slot="content">
                        <p>{{ $t('term.process.successjudgmenttip') }}</p>
                      </div>
                    </Tooltip>
                  </span>
                </span>
                <span class="control-btn">
                  <span class="tip">{{ swithConfig.callbackSuccessConfig == 1 ? $t('page.custom'): $t('page.default') }}</span>
                  <span style="display: inline-block;" :title="callbackOutputParamList.length > 0?'':$t('term.process.extcallnoparamtip')">
                    <TsFormSwitch
                      v-model="swithConfig.callbackSuccessConfig"
                      :true-value="1"
                      :false-value="0"
                      :disabled="callbackOutputParamList.length > 0 ? false : true"
                    ></TsFormSwitch>
                  </span>
                </span>
              </div>
              <div v-if="swithConfig.callbackSuccessConfig == 1" class="list list-bottom">
                <TsRow :gutter="4">
                  <Col :span="showCallBackSuccessConfig?8:12">
                    <TsFormSelect
                      v-model="callbackSuccessConfig.name"
                      :dataList="callbackOutputParamList"
                      textName="name"
                      valueName="name"
                    ></TsFormSelect>
                  </Col>
                  <Col :span="showCallBackSuccessConfig?8:12">
                    <TsFormSelect
                      v-model="callbackSuccessConfig.expression"
                      :dataList="getExpressionList(callbackSuccessConfig.name,'callback')"
                      valueName="expression"
                      textName="expressionName"
                    > </TsFormSelect>
                  </Col>
                  <Col v-show="showCallBackSuccessConfig" span="8">
                    <TsFormInput v-model="callbackSuccessConfig.value" maxlength="50"> </TsFormInput>
                  </Col>
                </TsRow>
              </div>
            </div>
            <div>
              <div class="control-setting">
                <span class="label">{{ $t('page.failurejudgment') }}
                  <span>
                    <Tooltip
                      placement="bottom"
                      max-width="300"
                      transfer
                      theme="light"
                    >
                      <b class="tsfont-info-o text-href"></b>
                      <div slot="content">
                        <p>{{ $t('term.process.failurejudgmenttip') }}</p>
                      </div>
                    </Tooltip>
                  </span>
                </span>
                <span class="control-btn">
                  <span class="tip">{{ swithConfig.callbackFailConfig == 1 ? $t('page.custom'): $t('page.default') }}</span>
                  <span style="display: inline-block;" :title="callbackOutputParamList.length > 0?'':$t('term.process.extcallnoparamtip')">
                    <TsFormSwitch
                      v-model="swithConfig.callbackFailConfig"
                      :true-value="1"
                      :false-value="0"
                      :disabled="callbackOutputParamList.length > 0 ? false : true"
                    ></TsFormSwitch>
                  </span>
                </span>
              </div>
              <div v-if="swithConfig.callbackFailConfig == 1" class="list list-bottom">
                <TsRow :gutter="4">
                  <Col :span="showCallBackFailConfig?8:12">
                    <TsFormSelect
                      v-model="callbackFailConfig.name"
                      :dataList="callbackOutputParamList"
                      textName="name"
                      valueName="name"
                    ></TsFormSelect>
                  </Col>
                  <Col :span="showCallBackFailConfig?8:12">
                    <TsFormSelect
                      v-model="callbackFailConfig.expression"
                      :dataList="getExpressionList(callbackFailConfig.name,'callback')"
                      valueName="expression"
                      textName="expressionName"
                    > </TsFormSelect>
                  </Col>
                  <Col v-show="showCallBackFailConfig" span="8">
                    <TsFormInput v-model="callbackFailConfig.value" maxlength="50"> </TsFormInput>
                  </Col>
                </TsRow>
              </div>
            </div>
          </div>
          <div class="control-setting">
            <span class="label">{{ $t('term.process.echotemplate') }}</span>
            <span class="control-btn tip">
              <span class="text-tip-active tsfont-edit" @click="editTemplate('callback')"></span>
            </span>
          </div>
        </div>
        <div v-if="callbackConfigType == 'wait'">
          <div>{{ $t('term.process.stepcallbackaiptip') }}</div>
          <div>processtask/automatic/complete</div>
          <div class="control-setting">
            <span class="label">{{ $t('page.inputparam') }}</span>
          </div>
          <div v-if="autoCompleteConfig && autoCompleteConfig.input">
            <WaitTip :dataList="autoCompleteConfig.input" type="input"></WaitTip>
          </div>
          <div class="control-setting">
            <span class="label">{{ $t('page.outputparam') }}</span>
          </div>
          <div v-if="autoCompleteConfig && autoCompleteConfig.output">
            <WaitTip :dataList="autoCompleteConfig.output" type="output"></WaitTip>
          </div>

        </div>
      </div>
    </div>
    <!-- 标签 -->
    <TagSetting
      ref="TagSetting"
      :nodeConfig="nodeConfig"
      :defaultIsActive="activeSetting.tagSetting"
      :list="tagList"
    ></TagSetting>
    <AssignSetting
      id="assignData"
      ref="assignData"
      :prevNodes="prevNodes"
      :formUuid="formUuid"
      :defaultWorkerPolicyConfig="workerPolicyConfig"
      :toSetting="toSetting"
    ></AssignSetting>
    <TemplateEdit
      :isShow="templateEditShow"
      :content="templateText"
      :outList="outList"
      @close="closeTemplateDialog"
      @getTemplate="getTemplate"
    ></TemplateEdit>
  </div>
</template>
<script>
//自动处理
import nodemixin from './nodemixin.js';
import itemmixin from './itemmixin.js';
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve),
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    AssignSetting: resolve => require(['./nodesetting/assign-setting'], resolve),
    TemplateEdit: resolve => require(['./nodesetting/template-edit'], resolve),
    NoticeSetting: resolve => require(['./nodesetting/notice-setting.vue'], resolve),
    AuthoritySetting: resolve => require(['./nodesetting/authority-setting.vue'], resolve),
    ButtonSetting: resolve => require(['./nodesetting/button-setting.vue'], resolve),
    WaitTip: resolve => require(['./nodesetting/wait-tip.vue'], resolve),
    TagSetting: resolve => require(['./nodesetting/tag-setting.vue'], resolve),
    FormsceneSetting: resolve => require(['./nodesetting/formscene-setting'], resolve) // 表单场景
  },
  mixins: [nodemixin, itemmixin],
  props: {},
  data() {
    let _this = this;
    return {
      configData: {stepConfig: {}}, //当前节点数据
      activeSetting: {
        //开关设置
        informSetting: 0, //通知设置
        permission: 0, //权限设置开关
        buttonStatus: 0, //按钮状态设置
        tagSetting: 0 //标签
      },
      validateSetting: {
        number: [
          { name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.process.duration')}) },
          { name: 'integer_p', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.positiveinteger')}) }
        ],
        required: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: ''}) }]
      },
      firstData: true,
      templateType: 'request',
      templateText: '',
      loadingShow: true,
      selectItemList: null,
      dynamicUrl: '/api/rest/integration/search',
      formUuid: _this.formConfig && _this.formConfig.uuid ? _this.formConfig.uuid : '', //表单id
      templateEditShow: false,
      formItemList: [], //表单授权列表
      timeWindow: [],
      timeWindowConfig: {},
      requestInputParamList: [], //外部数据源输入参数
      requestOutputParamList: [], //外部数据源输出参数
      paramConditionList: [], //参数条件
      swithConfig: {
        //节点默认和自定义设置按钮
        requestSuccessConfig: 0,
        callbackConfig: 0,
        callbackSuccessConfig: 0,
        callbackFailConfig: 0
      },
      requestConfig: {
        //外面数据源相关参数
        integrationUuid: null,
        paramList: [],
        successConfig: {},
        failPolicy: null, //失败策略
        resultTemplate: ''
      },
      requestSuccessConfig: {
        name: null,
        expression: null,
        value: null
      },
      callbackSelectItemList: null,
      callbackConfig: {
        //定时检测相关配置
        type: 'none',
        config: {
          integrationUuid: null,
          paramList: [],
          interval: null,
          resultTemplate: '',
          successConfig: {},
          failConfig: {}
        }
      },
      callbackInputParamList: [], //外部数据源输入参数
      callbackOutputParamList: [], //外部数据源输出参数
      failPolicyList: [], //失败策略
      defaultFailPolicyList: [],
      callbackConfigType: 'interval', //选择类型
      callbackList: [], //回调类型
      callbackSuccessConfig: {
        name: null,
        expression: null,
        value: null
      },
      callbackFailConfig: {
        name: null,
        expression: null,
        value: null
      },
      outList: [], //回显模板左侧参数
      authorityList: [], //权限
      customButtonList: [], //按钮
      customStatusList: [], //工单状态映射
      replaceableTextList: [], //文案映射
      workerPolicyConfig: {},
      notifyPolicyConfig: {},
      autoCompleteConfig: null, //回调数据
      tagList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.keyList = ['authorityList', 'customStatusList', 'customButtonList', 'replaceableTextList', 'notifyPolicyConfig', 'workerPolicyConfig', 'tagList'];//stepConfig 需要包含的数据
    this.getNodeSetting();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getNodeSetting() {
      if (!this.nodeConfig) {
        return;
      }
      let config = this.configData = this.$utils.deepClone(this.nodeConfig);
      this.uuid = config.uuid;
      this.initNodeData(config, this.keyList);//初始化数据
      await this.getParaConditionList(this.formUuid);
      this.getAutomaticConfig();
      this.getNodeConfig();
      this.getAutoComplete();
    },
    getNodeConfig() {
      //节点数据
      let defaultData = this.nodeConfig.stepConfig || {};
      if (defaultData != {}) {
        if (defaultData.automaticConfig && defaultData.automaticConfig.timeWindowConfig) {
          let timeWindowConfig = defaultData.automaticConfig.timeWindowConfig;
          this.timeWindow.splice(0);
          timeWindowConfig && timeWindowConfig.startTime && this.timeWindow.push(timeWindowConfig.startTime);
          timeWindowConfig && timeWindowConfig.endTime && this.timeWindow.push(timeWindowConfig.endTime);
        }
        if (defaultData.automaticConfig && defaultData.automaticConfig.requestConfig) {
          let requestConfig = defaultData.automaticConfig.requestConfig;
          for (let j in this.requestConfig) {
            if (requestConfig[j]) {
              this.requestConfig[j] = requestConfig[j];
            }
          }
          if (requestConfig.successConfig && JSON.stringify(requestConfig.successConfig) != '{}') {
            this.swithConfig.requestSuccessConfig = 1;
            this.requestSuccessConfig = requestConfig.successConfig;
          }
        }
        if (defaultData.automaticConfig && defaultData.automaticConfig.callbackConfig) {
          let callbackConfig = defaultData.automaticConfig.callbackConfig;
          if (callbackConfig.type && callbackConfig.type != 'none') {
            this.callbackConfigType = callbackConfig.type;
            this.swithConfig.callbackConfig = 1;
            if (callbackConfig.type == 'interval' && callbackConfig.config) {
              let config = callbackConfig.config;
              for (let c in this.callbackConfig.config) {
                if (config[c]) {
                  this.callbackConfig.config[c] = config[c];
                }
              }
              if (config.successConfig && JSON.stringify(config.successConfig) != '{}') {
                this.swithConfig.callbackSuccessConfig = 1;
                this.callbackSuccessConfig = config.successConfig;
              }
              if (config.failConfig && JSON.stringify(config.failConfig) != '{}') {
                this.swithConfig.callbackFailConfig = 1;
                this.callbackFailConfig = config.failConfig;
              }
            }
          }
        }
        if (defaultData.workerPolicyConfig) {
          this.workerPolicyConfig = JSON.parse(JSON.stringify(defaultData.workerPolicyConfig));
        }
      }
      this.loadingShow = false;
    },
    getAutomaticConfig() {
      //获取auto节点初始数据
      this.$api.process.process.getAutomatic().then(res => {
        if (res.Status == 'OK') {
          this.defaultFailPolicyList = res.Return.failPolicyList;
          this.callbackList = res.Return.callbackList;
          this.$nextTick(() => {
            this.updateFailPolicyList();
          });
        }
      });
    },
    getAutoComplete() {
      //获取auto节点等待回调数据
      this.$api.process.process.autoComplete().then(res => {
        this.autoCompleteConfig = res;
      });
    },
    getParaConditionList(formUuid) {
      //参数条件选择
      let data = {
        formUuid: formUuid
      };
      return this.$api.process.process.processParamList(data).then(res => {
        if (res.Status == 'OK') {
          let defaultParamConditionList = res.Return;
          let paramConditionList = [];
          defaultParamConditionList.forEach(p => {
            let label = '';
            label = p.type == 'form' ? p.label + '(' + this.$t('page.form') + ')' : p.label; 
            let obj = {
              label: label,
              value: p.type + '#' + p.name
            };
            paramConditionList.push(obj);
          });
          this.paramConditionList = paramConditionList;
        }
      });
    },
    returnParamConditionList(item) {
      let paramConditionList = JSON.parse(JSON.stringify(this.paramConditionList));
      let config = paramConditionList.find(p => p.value == item.value);
      if (item.value && !config) {
        let obj = {
          label: item.value + '(' + this.$t('page.constant') + ')',
          value: item.value
        };
        paramConditionList.unshift(obj);
      }
      return paramConditionList;
    },
    callbackParamConditionList(item, list) { //回调参数值列表
      let paramConditionList = JSON.parse(JSON.stringify(this.paramConditionList));
      if (this.requestOutputParamList.length > 0) {
        let requestOutputParamList = [];
        this.requestOutputParamList.forEach(o => {
          let obj = {
            label: o.name + '(' + this.$t('page.externaldata') + ')',
            value: 'integration#' + o.name
          };
          requestOutputParamList.push(obj);
        });
        paramConditionList.push(...requestOutputParamList);
      }
      let config = paramConditionList.find(p => p.value == item.value);
      if (item.value && !config) {
        let obj = {
          label: item.value + '(' + this.$t('page.constant') + ')',
          value: item.value
        };
        paramConditionList.unshift(obj);
      }
      return paramConditionList;
    },
    editTemplate(type) {
      this.outList.splice(0);
      this.templateType = type;
      if (type == 'request') {
        this.templateText = this.requestConfig.resultTemplate;
        if (this.requestOutputParamList.length > 0) {
          this.outList = JSON.parse(JSON.stringify(this.requestOutputParamList));
        }
      } else {
        this.templateText = this.callbackConfig.config.resultTemplate;
        if (this.callbackOutputParamList.length > 0) {
          this.outList = JSON.parse(JSON.stringify(this.callbackOutputParamList));
        }
      }
      this.templateEditShow = true;
    },
    closeTemplateDialog(val) {
      this.templateEditShow = false;
      this.templateText = '';
    },
    getTemplate(content) {
      //模板
      if (this.templateType == 'request') {
        this.requestConfig.resultTemplate = content;
      } else {
        this.callbackConfig.config.resultTemplate = content;
      }
    },
    emptyData(type) {
      //切换数据源时清空数据
      if (type == 'request') {
        if (this.requestOutputParamList.length == 0) {
          this.swithConfig.requestSuccessConfig = 0;
        } else if (this.requestOutputParamList.length > 0) {
          this.requestOutputParamList.forEach(i => {
            this.callbackInputParamList.forEach(c => {
              if (c.value && c.value == ('integration#' + i.name)) {
                this.$set(c, 'value', '');
              }
            });
          });
          this.callbackInputParamList;
        }
        this.requestInputParamList.splice(0);
        this.requestOutputParamList.splice(0);
        for (let i in this.requestSuccessConfig) {
          this.requestSuccessConfig[i] = null;
        }
      } else {
        if (this.callbackOutputParamList.length == 0) {
          this.swithConfig.callbackSuccessConfig = 0;
          this.swithConfig.callbackFailConfig = 0;
        }
        this.callbackInputParamList.splice(0);
        this.callbackOutputParamList.splice(0);
        for (let s in this.callbackSuccessConfig) {
          this.callbackSuccessConfig[s] = null;
        }
        for (let f in this.callbackFailConfig) {
          this.callbackFailConfig[f] = null;
        }
      }
    },
    changeParamList(list, defaultList, type) {
      let paramList = this.$utils.deepClone(list);
      let inputParamList = [];
      let outputParamList = [];
      paramList.forEach(p => {
        if (p.mode == 'input') {
          if (defaultList.length > 0) {
            let obj = defaultList.find(b => b.name === p.name);
            if (obj) {
              p.value = obj.value;
            } else {
              p.value = '';
            }
          } else {
            p.value = '';
          }
          inputParamList.push(p);
        } else {
          outputParamList.push(p);
        }
      });
      if (type == 'request') {
        this.requestInputParamList = this.$utils.deepClone(inputParamList);
        this.requestOutputParamList = this.$utils.deepClone(outputParamList);
      } else {
        this.callbackInputParamList = this.$utils.deepClone(inputParamList);
        this.callbackOutputParamList = this.$utils.deepClone(outputParamList);
      }
    },
    getExpressionList(name, type) {
      let expressionList = [];
      if (name && type == 'request' && this.requestOutputParamList.length > 0) {
        if (this.requestOutputParamList.find(b => b.name === name)) {
          expressionList = this.requestOutputParamList.find(b => b.name === name).expresstionList;
        }
      } else if (this.callbackOutputParamList.length > 0) {
        if (this.callbackOutputParamList.find(b => b.name === name)) {
          expressionList = this.callbackOutputParamList.find(b => b.name === name).expresstionList;
        }
      }
      return expressionList;
    },
    stopPropagation(event) {
      return false;
    },
    toIntegration(type, uuid) {
      //跳转到外部数据源管理页
      if (uuid) {
        window.open(HOME + '/framework.html#/integration-manage?isIntegrationDialogShow=true&integrationUuid=' + uuid, '_blank');
      } else {
        window.open(HOME + '/framework.html#/integration-manage?isIntegrationDialogShow=true', '_blank');
      }
    },
    saveNodeData() {
      //保存数据
      let stepConfig = Object.assign({}, this.configData.stepConfig);
      if (this.keyList && this.keyList.length) {
        this.keyList.forEach(item => {
          stepConfig[item] = this[item] || undefined;
        });
      }

      if (this.$refs.NoticeSetting) {
        stepConfig.notifyPolicyConfig = this.$refs.NoticeSetting.getData() || {};
      }
      if (this.$refs.TagSetting) { //标签
        stepConfig.tagList = this.$refs.TagSetting.getData();
      }
      stepConfig.workerPolicyConfig = this.$refs.assignData.saveAssignData();
      let automaticConfig = {};
      if (this.timeWindow && this.timeWindow.length > 0) {
        this.timeWindowConfig.startTime = this.timeWindow[0];
        this.timeWindowConfig.endTime = this.timeWindow[1];
        automaticConfig.timeWindowConfig = this.timeWindowConfig;
      } else {
        this.$set(automaticConfig, 'timeWindowConfig', {});
      }
      if (this.requestConfig.integrationUuid) {
        if (this.requestInputParamList.length > 0) {
          let paramList = [];
          this.requestInputParamList.forEach(b => {
            let obj = {
              name: b.name,
              type: b.value.includes('#') ? b.value.split('#')[0] : 'constant',
              value: b.value
            };
            paramList.push(obj);
          });
          this.requestConfig.paramList = paramList;
        }
        if (this.swithConfig.requestSuccessConfig == 1 && this.requestOutputParamList.length > 0 && this.requestSuccessConfig.name) {
          this.requestConfig.successConfig = this.requestSuccessConfig;
        } else {
          this.requestConfig.successConfig = {};
        }
      }
      automaticConfig.requestConfig = this.requestConfig;
      //定时回调数据
      let callbackConfig = {};
      if (this.swithConfig.callbackConfig == 1) {
        callbackConfig.type = this.callbackConfigType;
        if (this.callbackConfigType == 'interval') {
          let config = {};
          config.integrationUuid = this.callbackConfig.config.integrationUuid;
          config.interval = this.callbackConfig.config.interval;
          config.resultTemplate = this.callbackConfig.config.resultTemplate;
          if (config.integrationUuid) {
            if (this.callbackInputParamList.length > 0) {
              let backParamList = [];
              this.callbackInputParamList.forEach(b => {
                let obj = {
                  name: b.name,
                  type: b.value.includes('#') ? b.value.split('#')[0] : 'constant',
                  value: b.value
                };
                backParamList.push(obj);
              });
              config.paramList = backParamList;
            }
            if (this.swithConfig.callbackSuccessConfig == 1 && this.callbackInputParamList.length > 0 && this.callbackSuccessConfig.name) {
              config.successConfig = this.callbackSuccessConfig;
            }
            if (this.swithConfig.callbackFailConfig == 1 && this.callbackInputParamList.length > 0 && this.callbackSuccessConfig.name) {
              config.failConfig = this.callbackFailConfig;
            }
          }
          callbackConfig.config = config;
        }
      } else {
        callbackConfig.type = 'none';
      }
      automaticConfig.callbackConfig = callbackConfig;
      stepConfig.automaticConfig = automaticConfig;
      return stepConfig;
    },
    reloadIntegration(uuid) {
      // 刷新时需要更新参数
      this.$api.process.process.searchIntegration({ defaultValue: [uuid] }).then(res => {
        if (res && res.Status == 'OK' && res.Return && res.Return.tbodyList && res.Return.tbodyList.length > 0) {
          let oldData = JSON.stringify(this.selectItemList.config);
          let newData = JSON.stringify(res.Return.tbodyList[0].config);
          if (oldData != newData) {
            this.selectItemList = res.Return.tbodyList[0];
          }
          this.$Message.success(this.$t('message.executesuccess'));
        } else {
          this.selectItemList = {};
        }
      });
    },
    nodeValid(href) {
      //校验
      let querySelect = href.substring(1);
      this.$nextTick(() => {
        if (querySelect != 'assignData') {
          this.$refs[`${querySelect}`].valid();
        } else {
          this.$refs.assignData.assignValid();
        }
      });
    },
    updateFailPolicyList() { //更新失败策略选项（‘步骤回退’：必须有回退线才可以选择）
      let failPolicyList = this.defaultFailPolicyList;
      let newfailPolicyList = [];
      let isBack = false;
      if (this.nodeAllLinksList && this.nodeAllLinksList.length > 0) {
        this.nodeAllLinksList.forEach(item => {
          if (item.config.type == 'backward') {
            isBack = true;
          }
        });
      }
      if (!isBack) {
        newfailPolicyList = failPolicyList.filter(f => f.value != 'back');
      } else {
        newfailPolicyList = failPolicyList;
      }
      this.failPolicyList = newfailPolicyList;
    }
  },
  filter: {},
  computed: {
    showConfigInput() {
      let expression = this.requestSuccessConfig.expression;
      return expression != 'is-null' && expression != 'is-not-null';
    },
    showCallBackSuccessConfig() {
      let expression = this.callbackSuccessConfig.expression;
      return expression != 'is-null' && expression != 'is-not-null';
    },
    showCallBackFailConfig() {
      let expression = this.callbackFailConfig.expression;
      return expression != 'is-null' && expression != 'is-not-null';
    }
  },
  watch: {
    formConfig: {
      handler(newVal, oldVal) {
        this.formUuid = newVal.uuid || '';
        this.getParaConditionList(this.formUuid);
      },
      deep: true
    },
    formUuid(newVal, oldVal) {
      //改变表单关联时清空参数
      if (newVal != oldVal) {
        if (this.requestInputParamList && this.requestInputParamList.length > 0) {
          this.requestInputParamList.forEach(p => {
            if (p.value) {
              p.value = '';
            }
          });
        }
        if (this.callbackInputParamList && this.callbackInputParamList.length > 0) {
          this.callbackInputParamList.forEach(p => {
            if (p.value) {
              p.value = '';
            }
          });
        }
      }
    },
    selectItemList: {
      handler(newVal) {
        // if (!this.firstData) {
        //   this.emptyData('request');
        // }
        if (newVal && newVal.config) {
          let selectBaseIntegration = JSON.parse(JSON.stringify(newVal.config));
          if (JSON.stringify(selectBaseIntegration) != '{}' && selectBaseIntegration.param && selectBaseIntegration.param.paramList && selectBaseIntegration.param.paramList.length > 0) {
            let paramList = selectBaseIntegration.param.paramList;
            this.changeParamList(paramList, this.requestConfig.paramList, 'request');
          }
        }
        this.firstData = false;
      },
      deep: true
    },
    callbackSelectItemList: {
      handler(newVal) {
        // if (!this.firstData) {
        //   this.emptyData('callback');
        // }
        if (newVal && newVal.config) {
          let callbackIntegration = JSON.parse(JSON.stringify(newVal.config));
          if (JSON.stringify(callbackIntegration) != '{}' && callbackIntegration.param && callbackIntegration.param.paramList && callbackIntegration.param.paramList.length > 0) {
            let paramList = callbackIntegration.param.paramList;
            this.changeParamList(paramList, this.callbackConfig.config.paramList, 'callback');
          }
        }
      },
      deep: true
    },
    nodeAllLinksList: {
      handler(val) {
        if (val && this.defaultFailPolicyList.length > 0) {
          this.updateFailPolicyList();
        }
      }
    },
    deep: true
  }
};
</script>
<style lang="less" scoped>
.autonode-setting {
  .disabled-text {
    height: 32px;
    line-height: 32px;
  }
  .add-integration {
    display: block;
    height: 32px;
    line-height: 32px;
    text-align: center;
  }
}
.param-list{
  &:not(:last-child){
    padding-bottom: 10px;
  }
}
</style>
