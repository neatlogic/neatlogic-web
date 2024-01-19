<template>
  <div>
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
    <TsFormItem :label="$t('message.framework.regex')" labelPosition="top" :tooltip="$t('message.framework.regextip')">
      <TsFormInput
        :value="config.regex"
        :disabled="disabled"
        :validateList="regexValidateList"
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
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      regexValidateList: [
        {
          name: 'tomore',
          trigger: 'change',
          message: this.$t('message.pleaseentertruetarget', {'target': this.$t('message.framework.regularexpression')}),
          validator: (rule, value) => {
            if (this.$utils.isEmpty(value)) {
              return true;
            } else {
              return this.isValidRegex(value);
            }
          }
        }
      ],
      validateList: ['required']
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    isValidRegex(regexString) {
      try {
        new RegExp(regexString); 
        return true; 
      } catch (error) {
        return false; 
      }
    },
    configValid() {
      this.$nextTick(() => {
        if (this.$refs.regexMessage) {
          this.$refs.regexMessage.valid();
        }
      });
    }
  },
  filter: {},
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
/deep/ .regex-input {
  .ivu-input {
    border-radius: 0px !important;
  }
}

</style>
