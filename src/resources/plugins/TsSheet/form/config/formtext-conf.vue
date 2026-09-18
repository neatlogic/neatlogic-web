<template>
  <div v-if="!formItem.isHideComponent">
    <TsFormItem :label="$t('page.strlength')" labelPosition="top">
      <TsFormInput
        :value="config.maxLength"
        type="number"
        :disabled="disabled"
        @on-change="val => {
          setConfig('maxLength', val);
        }"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('page.inputtip')" labelPosition="top">
      <TsFormInput
        :value="config.placeholder"
        :maxlength="50"
        :disabled="disabled"
        @on-change="val => {
          setConfig('placeholder', val);
        }"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('form.placeholder.checkrule')" labelPosition="top">
      <TsFormSelect
        :value="getValidationRule(config)"
        :dataList="ruleList"
        :disabled="disabled"
        transfer
        border="border"
        @on-change="val => changeValidationRule(config, val)"
      ></TsFormSelect>
    </TsFormItem>
    <template v-if="showRegexConfig(config)">
      <TsFormItem :label="$t('message.framework.regex')" labelPosition="top" :tooltip="$t('message.framework.regextip')">
        <TsFormInput
          :value="config.regex"
          :disabled="disabled"
          :validateList="regexValidateList"
          :placeholder="$t('message.framework.regularexpression')"
          prepend="/"
          append="/"
          class="regex-input"
          @on-change="val => {
            setConfig('regex', val);
          }"
        >
        </TsFormInput>
      </TsFormItem>
      <TsFormItem :label="$t('message.framework.validtip')" labelPosition="top" :tooltip="$t('message.framework.regexvalidtip')">
        <TsFormInput
          ref="regexMessage"
          :value="config.regexMessage"
          :disabled="disabled"
          :validateList="!$utils.isEmpty(config.regex)? validateList:[]"
          :placeholder="$t('message.framework.regexvalidplaceholder')"
          @on-change="val => {
            setConfig('regexMessage', val);
          }"
        >
        </TsFormInput>
      </TsFormItem>
    </template>
  </div>
</template>
<script>
import base from './base-config.vue';
import textValidationMixin from './common/text-validation-mixin.js';

export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  extends: base,
  mixins: [textValidationMixin],
  data() {
    return {
      validateList: ['required']
    };
  },
  methods: {
    configValid() {
      this.$nextTick(() => {
        if (this.$refs.regexMessage) {
          this.$refs.regexMessage.valid();
        }
      });
    }
  },
  computed: {
    regexMessageConfig() {
      return this.validClass('regexMessage');
    }
  },
  watch: {
    regexMessageConfig: {
      handler(val) {
        if (val && val['bg-error-grey']) {
          this.configValid();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
::v-deep .regex-input {
  .ivu-input {
    border-radius: 0px !important;
  }
}

</style>
