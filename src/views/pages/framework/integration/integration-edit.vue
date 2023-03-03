<template>
  <div>
    <TsDialog v-bind="integrationDialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="integrationData.uuid">编辑配置</div>
        <div v-if="!integrationData.uuid">{{ isCopy ? '复制配置' : '添加配置' }}</div>
      </template>
      <template v-slot>
        <TsForm ref="integrationForm" :item-list="integrationFormConfig">
          <template v-slot:target>
            <TsRow :gutter="0">
              <Col span="4">
                <TsFormSelect
                  v-model="integrationData.method"
                  :data-list="methodList"
                  :name="'method'"
                  style="margin-right:5px"
                ></TsFormSelect>
              </Col>
              <Col span="20" style="padding-left:8px;">
                <TsFormInput v-model="integrationData.url" type="text" :name="'url'" />
              </Col>
            </TsRow>
          </template>
          <template v-slot:config>
            <Tabs v-model="activedTab" name="integrationEditTabs">
              <TabPane label="认证" name="authentication" tab="integrationEditTabs">
                <Authentication :integration="integrationData" @setAuthentication="setAuthentication"></Authentication>
              </TabPane>
              <TabPane label="参数说明" name="param" tab="integrationEditTabs">
                <Param
                  :allow-edit-param="allowEditParam"
                  :integration="integrationData"
                  :handler-pattern="handlerPattern"
                  @setParam="setParam"
                ></Param>
              </TabPane>
              <TabPane label="请求头" name="head" tab="integrationEditTabs">
                <Header :integration="integrationData" @setHead="setHead"></Header>
              </TabPane>
              <TabPane label="输入转换" name="input" tab="integrationEditTabs">
                <InputTransform
                  :integration="integrationData"
                  :allow-edit-param="allowEditParam"
                  :handler-pattern="handlerInputPattern"
                  @setInput="setInput"
                ></InputTransform>
              </TabPane>
              <TabPane label="输出转换" name="output" tab="integrationEditTabs">
                <OutputTransform
                  :integration="integrationData"
                  :allow-edit-param="allowEditParam"
                  :handler-pattern="handlerOutputPattern"
                  @setOutput="setOutput"
                ></OutputTransform>
              </TabPane>
              <TabPane label="其他设置" name="other" tab="integrationEditTabs">
                <Other :integration="integrationData" @setOtherSetting="setOtherSetting"></Other>
              </TabPane>
              <TabPane label="测试" name="test" tab="integrationEditTabs">
                <Test ref="testComponent" :integration="integrationData" :handler-pattern="handlerInputPattern"></Test>
              </TabPane>
            </Tabs>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button
          type="primary"
          ghost
          :loading="testing"
          @click="testIntegration()"
        >
          <span v-if="!testing">测试</span>
          <span v-else>执行中...</span>
        </Button>
        <Button type="primary" :loading="isSaving" @click="saveIntegration()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import Authentication from './authentication-edit.vue';
import Header from './head-edit.vue';
import Other from './other-edit.vue';
import OutputTransform from './output-transform.vue';
import InputTransform from './input-transform.vue';
import Test from './integration-test.vue';
import Param from './param-edit.vue';

export default {
  components: {
    TsForm,
    TsFormInput,
    TsFormSelect,
    OutputTransform,
    InputTransform,
    Authentication,
    Header,
    Other,
    Test,
    Param
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
      testing: false,
      activedTab: 'authentication',
      integrationData: { config: {} },
      handlerInputPattern: [],
      handlerOutputPattern: [],
      allowEditParam: 0,
      methodList: [
        { value: 'get', text: 'GET' },
        { value: 'post', text: 'POST' }
      ],
      integrationDialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
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
          label: '名称',
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
          label: '数据规范',
          width: '100%',
          url: '/api/rest/integration/handler/list',
          validateList: ['required'],
          valueName: 'handler',
          textName: 'name',
          desc: '数据规范设定了输入和输出参数，如果接口返回的数据不符合数据规范要求，需要根据规范对数据进项转换，否则会影响正常使用。',
          onChange: function(handler) {
            _this.integrationData.handler = handler;
            _this.getHandlerPatternFormat();
          }
        },
        {
          type: 'slot',
          name: 'target',
          label: '目标地址',
          validateList: ['required']
        },
        { type: 'slot', name: 'config', label: '请求设置' }
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
      var _this = this;
      if (this.integrationData.handler) {
        this.$api.framework.integration
          .getIntegrationHandlerByHandler({
            handler: this.integrationData.handler
          })
          .then(res => {
            if (res.Status == 'OK') {
              _this.handlerInputPattern = res.Return['inputPattern'] || [];
              _this.handlerOutputPattern = res.Return['outputPattern'] || [];
              _this.allowEditParam = res.Return['hasPattern'] == 0 ? 1 : 0;
            }
          });
      } else {
        _this.handlerInputPattern = [];
        _this.handlerOutputPattern = [];
        _this.allowEditParam = 1;
      }
    },
    setInput: function(input) {
      this.integrationData.config.input = input;
    },
    setOutput: function(output) {
      this.integrationData.config.output = output;
    },
    setHead: function(head) {
      this.integrationData.config.head = head;
    },
    setParam: function(param) {
      this.integrationData.config.param = param;
    },
    setAuthentication: function(authentication) {
      this.integrationData.config.authentication = authentication;
    },
    setOtherSetting: function(othersetting) {
      this.integrationData.config.other = othersetting;
    },
    saveIntegration: function() {
      let form = this.$refs['integrationForm'];
      if (form.valid()) {
        this.isSaving = true;
        this.$api.framework.integration
          .saveIntegration(this.integrationData)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.content.savesuccess'));
              this.close(true);
            }
          })
          .catch(error => {
            if (error.data.Message) {
              this.$Message.error(error.data.Message);
            } else {
              this.$Message.error('保存失败');
            }
          })
          .finally(() => {
            this.isSaving = false;
          });
      }
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
            param: [],
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
    handlerPattern: function() {
      return this.handlerInputPattern.concat(this.handlerOutputPattern);
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
