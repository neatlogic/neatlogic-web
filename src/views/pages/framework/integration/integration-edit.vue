<template>
  <div>
    <TsDialog v-bind="integrationDialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="integrationData.uuid">{{ $t('dialog.title.edittarget', { target: $t('page.integration') }) }}</div>
        <div v-if="!integrationData.uuid">{{ isCopy ? $t('dialog.title.copytarget', { target: $t('page.integration') }) : $t('dialog.title.addtarget', { target: $t('page.integration') }) }}</div>
      </template>
      <template v-slot>
        <TsForm ref="integrationForm" :item-list="integrationFormConfig">
          <template v-slot:target>
            <div>
              <TsRow :gutter="0">
                <Col span="4">
                  <TsFormSelect
                    v-model="integrationData.method"
                    :data-list="methodList"
                    :name="'method'"
                    style="margin-right: 5px"
                  ></TsFormSelect>
                </Col>
                <Col span="20" style="padding-left: 8px">
                  <TsFormInput v-model="integrationData.url" type="text" :name="'url'" />
                </Col>
              </TsRow>
            </div>
          </template>
          <template v-slot:config>
            <Tabs v-model="activedTab" name="integrationEditTabs">
              <TabPane
                :key="1"
                :label="$t('page.authentication')"
                name="authentication"
                tab="integrationEditTabs"
              >
                <Authentication :integration="integrationData" @setAuthentication="setAuthentication"></Authentication>
              </TabPane>
              <TabPane
                :key="2"
                :label="$t('page.paramdesc')"
                name="param"
                tab="integrationEditTabs"
              >
                <ParamEdit
                  ref="paramEdit"
                  :allow-edit-input-param="allowEditInputParam"
                  :allow-edit-output-param="allowEditOutputParam"
                  :integration="integrationData"
                  :handler-pattern="handlerPattern"
                  :disabled="!canEditIntegration || !handlerPatternReady || isSaving"
                  @setParam="setParam"
                ></ParamEdit>
              </TabPane>
              <TabPane
                v-if="!isMcp"
                :key="3"
                :label="$t('term.framework.head')"
                name="head"
                tab="integrationEditTabs"
              >
                <HeaderEdit :integration="integrationData" @setHead="setHead"></HeaderEdit>
              </TabPane>
              <TabPane
                v-if="!isMcp"
                :key="4"
                :label="$t('term.framework.inputtrans')"
                name="input"
                tab="integrationEditTabs"
              >
                <InputTransform
                  :integration="integrationData"
                  :allow-edit-param="allowEditInputParam"
                  :handler-pattern="handlerInputPattern"
                  @setInput="setInput"
                ></InputTransform>
              </TabPane>
              <TabPane
                v-if="!isMcp"
                :key="5"
                :label="$t('term.framework.outputtrans')"
                name="output"
                tab="integrationEditTabs"
              >
                <OutputTransform
                  :integration="integrationData"
                  :allow-edit-param="allowEditOutputParam"
                  :handler-pattern="handlerOutputPattern"
                  @setOutput="setOutput"
                ></OutputTransform>
              </TabPane>
              <TabPane
                :key="6"
                :label="$t('page.othersetting')"
                name="other"
                tab="integrationEditTabs"
              >
                <Other :integration="integrationData" @setOtherSetting="setOtherSetting"></Other>
              </TabPane>
              <TabPane
                :key="7"
                :label="$t('page.test')"
                name="test"
                tab="integrationEditTabs"
              >
                <Test ref="testComponent" :integration="integrationData" :handler-pattern="handlerInputPattern"></Test>
              </TabPane>
            </Tabs>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button
          type="primary"
          ghost
          :loading="testing"
          @click="testIntegration()"
        >
          <span v-if="!testing">{{ $t('page.test') }}</span>
          <span v-else>{{ $t('page.running') }}...</span>
        </Button>
        <Button
          type="primary"
          :loading="isSaving"
          :disabled="!canEditIntegration || !handlerPatternReady"
          @click="saveIntegration()"
        >{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import Authentication from './authentication-edit.vue';
import HeaderEdit from './head-edit.vue';
import Other from './other-edit.vue';
import OutputTransform from './output-transform.vue';
import InputTransform from './input-transform.vue';
import Test from './integration-test.vue';
import ParamEdit from './param-edit.vue';
import {cloneParamConfig, getParamEditPermission, validateCustomParams, withPatternMode} from './integration-param-utils.js';
import {validateIntegrationDefaults} from './integration-default-utils.js';

export default {
  components: {
    TsForm,
    TsFormInput,
    TsFormSelect,
    OutputTransform,
    InputTransform,
    Authentication,
    HeaderEdit,
    Other,
    Test,
    ParamEdit
  },
  props: {
    uuid: { type: String },
    isCopy: {
      type: Boolean,
      default: false
    }
  },
  data() {
    var _this = this;
    return {
      isSaving: false,
      isPreparingSave: false,
      testing: false,
      activedTab: 'authentication',
      integrationData: { config: {} },
      handlerInputPattern: [],
      handlerOutputPattern: [],
      allowEditInputParam: 0,
      allowEditOutputParam: 0,
      handlerPatternRequest: 0,
      handlerPatternReady: false,
      methodList: [
        { value: 'get', text: 'GET' },
        { value: 'post', text: 'POST' }
      ],
      integrationDialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      integrationFormConfig: [
        {
          type: 'text',
          name: 'uuid',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required'],
          width: '100%',
          onChange: function(name) {
            _this.integrationData.name = name;
          }
        },
        {
          type: 'select',
          name: 'handler',
          label: this.$t('term.framework.dataspecification'),
          width: '100%',
          url: '/api/rest/integration/handler/list',
          validateList: ['required'],
          valueName: 'handler',
          textName: 'name',
          desc: this.$t('message.framework.dataspftdesc'),
          onChange: function(handler) {
            _this.integrationData.handler = handler;
            _this.getHandlerPatternFormat();
          }
        },
        {
          type: 'slot',
          name: 'target',
          label: this.$t('page.targetaddress'),
          validateList: ['required']
        },
        { type: 'slot', name: 'config', label: this.$t('term.framework.reqsetting') }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getIntegration(this.uuid);
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
    getHandlerPatternFormat: function() {
      // 切换规范保留自定义配置；每次请求清理固定定义和权限，旧响应不得覆盖新选择。
      const handler = this.integrationData.handler;
      const request = ++this.handlerPatternRequest;
      this.handlerInputPattern = [];
      this.handlerOutputPattern = [];
      this.allowEditInputParam = 0;
      this.allowEditOutputParam = 0;
      this.handlerPatternReady = false;
      if (handler) {
        return this.$api.framework.integration
          .getIntegrationHandlerByHandler({
            handler
          })
          .then(res => {
            if (request !== this.handlerPatternRequest || handler !== this.integrationData.handler) return;
            if (res.Status === 'OK') {
              // 非空规范始终展示，编辑开关仅控制自定义行，不控制固定参数可见性。
              this.handlerInputPattern = withPatternMode(res.Return.inputPattern, 'input');
              this.handlerOutputPattern = withPatternMode(res.Return.outputPattern, 'output');
              this.allowEditInputParam = getParamEditPermission(res.Return, 'input');
              this.allowEditOutputParam = getParamEditPermission(res.Return, 'output');
              this.setMethodList(res.Return.methodList);
              this.handlerPatternReady = true;
            }
          });
      } else {
        this.allowEditInputParam = 1;
        this.allowEditOutputParam = 1;
        this.handlerPatternReady = true;
        this.setMethodList();
      }
    },
    setMethodList: function(methodList) {
      let list = methodList && methodList.length ? methodList : ['get', 'post'];
      this.methodList = list.map(method => {
        return {
          value: method,
          text: String(method).toUpperCase()
        };
      });
      if (!this.methodList.find(item => item.value == this.integrationData.method)) {
        this.$set(this.integrationData, 'method', this.methodList[0] ? this.methodList[0].value : null);
      }
    },
    setInput: function(input) {
      this.$set(this.integrationData.config, 'input', input);
    },
    setOutput: function(output) {
      this.$set(this.integrationData.config, 'output', output);
    },
    setHead: function(head) {
      this.integrationData.config.head = head;
    },
    setParam: function(param) {
      // 固定定义只来自处理器，配置保存自定义参数、校验开关及独立固定默认值。
      this.$set(this.integrationData.config, 'param', cloneParamConfig(param));
    },
    setAuthentication: function(authentication) {
      this.integrationData.config.authentication = authentication;
    },
    setOtherSetting: function(othersetting) {
      this.integrationData.config.other = othersetting;
    },
    async saveIntegration() {
      if (this.isSaving || this.isPreparingSave || !this.canEditIntegration || !this.handlerPatternReady) return;
      this.isPreparingSave = true;
      try {
        // 点击确认时输入框可能尚未失焦；先收齐最新值，避免校验和保存读到上一次输入。
        const editor = this.$refs.paramEdit;
        const integration = this.integrationData;
        if (editor) await editor.flushDefaultInputs();
        if (this._isDestroyed || this._isBeingDestroyed || this.integrationData !== integration) return;
        const form = this.$refs.integrationForm;
        if (this.canEditIntegration && this.handlerPatternReady && form && form.valid() && this.validParamConfig() && this.validRateLimitConfig()) {
          this.isSaving = true;
          return this.$api.framework.integration
            .saveIntegration(this.integrationData)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.savesuccess'));
                this.close(true);
              }
            })
            .finally(() => {
              this.isSaving = false;
            });
        }
      } finally {
        this.isPreparingSave = false;
      }
    },
    validParamConfig() {
      // 参数页可能尚未挂载，父级仍须检查完整性及同方向重名，禁止绕过保存校验。
      const editor = this.$refs.paramEdit;
      const config = editor ? editor.getConfig() : cloneParamConfig(this.integrationData.config.param);
      const error = validateCustomParams(config, this.handlerPattern);
      if (error) {
        this.activedTab = 'param';
        if (editor) editor.valid();
        else this.$Message.warning(this.$t(error.message, {target: this.$t('page.param')}));
        return false;
      }
      // 参数页可能未打开，默认值的类型、必填和失效结构仍由保存入口统一校验。
      const defaultError = validateIntegrationDefaults(this.handlerPattern, config, this.integrationData.handler);
      if (defaultError) {
        this.activedTab = 'param';
        if (editor) editor.valid();
        else this.$Message.warning(defaultError.message);
        return false;
      }
      this.setParam(config);
      return true;
    },
    validRateLimitConfig: function() {
      let otherConfig = (this.integrationData.config && this.integrationData.config.other) || {};
      let interval = otherConfig.rateLimitIntervalSeconds;
      let count = otherConfig.rateLimitCount;
      if (!this.isNaturalNumber(interval) || !this.isNaturalNumber(count)) {
        this.$Message.warning(this.$t('term.framework.calllimitnaturalnumbervalid'));
        return false;
      }
      let hasInterval = this.isPositiveNumber(interval);
      let hasCount = this.isPositiveNumber(count);
      if (hasInterval !== hasCount) {
        this.$Message.warning(this.$t('term.framework.calllimitpositivevalid'));
        return false;
      }
      return true;
    },
    isEmptyRateLimitValue: function(value) {
      return value === null || value === undefined || value === '';
    },
    isNaturalNumber: function(value) {
      if (this.isEmptyRateLimitValue(value)) {
        return true;
      }
      let numberValue = Number(value);
      return Number.isInteger(numberValue) && numberValue >= 0;
    },
    isPositiveNumber: function(value) {
      if (this.isEmptyRateLimitValue(value)) {
        return false;
      }
      let numberValue = Number(value);
      return Number.isInteger(numberValue) && numberValue > 0;
    },
    isReset() {
      this.integrationData = { config: {} };
    },
    getIntegration: function(uuid) {
      if (uuid) {
        this.$api.framework.integration.getIntegrationByUuid({ uuid: uuid }).then(res => {
          if (res.Status == 'OK') {
            this.integrationData = res.Return;
            this.integrationFormConfig.forEach(element => {
              if (this.isCopy) {
                if (element.name == 'name') {
                  element.value = `${this.integrationData[element.name]}_copy`;
                  this.integrationData[element.name] = `${this.integrationData[element.name]}_copy`;
                } else {
                  element.value = this.integrationData[element.name];
                }
                delete this.integrationData.uuid;
              } else {
                element.value = this.integrationData[element.name];
              }
            });
            this.getHandlerPatternFormat();
          }
        });
      } else {
        this.integrationData = {
          uuid: null,
          name: null,
          handler: null,
          config: {
            param: {needValid: 0, paramList: []},
            authentication: {},
            head: [],
            body: {},
            other: {},
            output: {},
            input: {}
          }
        };
        this.getHandlerPatternFormat();
        this.integrationFormConfig.forEach(element => {
          element.value = this.integrationData[element.name];
        });
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
      this.$refs.integrationFor && this.$refs.integrationForm.resetForm();
      this.integrationData = { config: {} };
    },
    testIntegration: function() {
      this.activedTab = 'test';
      let testComponent = this.$refs['testComponent'];
      this.testing = true;
      testComponent.test(() => {
        this.testing = false;
      });
    }
  },
  filter: {},
  computed: {
    canEditIntegration() {
      // 默认值沿用集成保存权限，与处理器是否允许增删参数定义无关。
      return this.$AuthUtils.hasRole('INTERFACE_MODIFY') || this.$AuthUtils.hasRole('ADMIN');
    },
    handlerPattern: function() {
      return this.handlerInputPattern.concat(this.handlerOutputPattern);
    },
    isMcp: function() {
      return this.integrationData && this.integrationData.method === 'mcp';
    }
  },
  watch: {
    isMcp: function(val) {
      if (val && ['head', 'input', 'output'].includes(this.activedTab)) {
        this.activedTab = 'authentication';
      }
    }
  }
};
</script>
<style lang="less"></style>
