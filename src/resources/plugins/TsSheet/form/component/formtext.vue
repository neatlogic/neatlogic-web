<template>
  <TsFormInput
    ref="formitem"
    type="text"
    border="border"
    :maxlength="config.maxLength"
    :placeholder="config.placeholder"
    :value="actualValue"
    :readonly="readonly"
    :disabled="disabled"
    :validateList="actualValidateList"
    :readonlyTextIsHighlight="readonlyTextIsHighlight"
    @change="
      val => {
        setValue(val);
      }
    "
  ></TsFormInput>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: {
    TsFormInput
  },
  extends: base,
  mixins: [validmixin],
  props: {
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {
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
    validConfig() {
      const errorList = this.validDataForAllItem();
      if (!this.$utils.isEmpty(this.config.regex) && this.$utils.isEmpty(this.config.regexMessage)) {
        errorList.push({ field: 'regexMessage', error: this.$t('form.placeholder.pleaseinput', {'target': this.$t('message.framework.validtip')}) });
      } 
      return errorList;
    },
    isValidRegex(regexString) { //判断正则表达式是否合法
      try {
        new RegExp(regexString); 
        return true; 
      } catch (error) {
        return false; 
      }
    }
  },
  filter: {},
  computed: {
    actualValue() {
      if (this.value) {
        if (this.value instanceof Array && this.value.length > 0) {
          return this.value[0];
        } else {
          return this.value;
        }
      }
      return null;
    },
    actualValidateList() {
      let validateList = this.validateList || [];
      if (!this.$utils.isEmpty(this.config)) {
        if (this.config.validate) {
          validateList.push(this.config.validate);
        }
        if (!this.$utils.isEmpty(this.config.regex) && this.isValidRegex(this.config.regex)) {
          let findRegex = validateList.find(item => item.name === 'regex');
          if (findRegex) {
            this.$set(findRegex, 'pattern', this.config.regex);
            this.$set(findRegex, 'message', this.config.regexMessage);
          } else {
            validateList.push({
              name: 'regex', 
              pattern: this.config.regex,
              message: this.config.regexMessage
            });
          }
        }
      }
      return validateList; 
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
