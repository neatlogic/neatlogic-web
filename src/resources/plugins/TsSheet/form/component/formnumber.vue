<template>
  <TsFormInput
    ref="formitem"
    :value="actualValue"
    :placeholder="config.placeholder"
    :maxlength="config.maxLength"
    :min="config.minNumber"
    :max="config.maxNumber"
    type="number"
    border="border"
    :readonly="readonly"
    :disabled="disabled"
    :validateList="getValidateList"
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
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
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
      if (this.config.minNumber !== '' && this.config.maxNumber !== '' && this.config.maxNumber <= this.config.minNumber) {
        errorList.push({ field: 'minNumber', error: this.$t('page.numberrange') + '：' + this.$t('message.framework.maxnumbervalid')});
      }
      if (this.config.decimalNumber && !(/^[0-9]\d*$/.test(this.config.decimalNumber))) {
        errorList.push({ field: 'decimalNumber', error: this.$t('page.decimalnumber') + '：' + this.$t('form.placeholder.pleaseinput', {'target': this.$t('term.plugin.intgreaterthan0')}) });
      }
      return errorList;
    }
  },
  filter: {},
  computed: {
    actualValue() {
      if (this.value) {
        if (this.value instanceof Array && this.value.length > 0) {
          return Number(this.value[0]);
        } else {
          return Number(this.value);
        }
      }
      return null;
    },
    getValidateList() {
      let _this = this;
      let config = this.config;
      let validateList = [].concat(this.validateList);
      //number类型验证大小和小数位
      if (!_this.$utils.isEmpty(config.minNumber) || !_this.$utils.isEmpty(config.maxNumber)) {
        //最大值，最小值的验证
        validateList.push({
          name: 'tonumber',
          trigger: 'change',
          message: this.$t('form.placeholder.pleaseinput', {'target': (config.minNumber ? this.$t('term.framework.laterandequal') + config.minNumber : '') + (config.maxNumber ? this.$t('term.framework.earlierandequal') + config.maxNumber : '') + '的数据'}),
          validator: (rule, value) => {
            if (_this.$utils.isEmpty(value)) {
              return true;
            } else if (typeof value === 'number') {
              if (!_this.$utils.isEmpty(config.minNumber) && !_this.$utils.isEmpty(config.maxNumber)) {
                return value >= config.minNumber && value <= config.maxNumber;
              } else if (_this.$utils.isEmpty(config.minNumber) && !_this.$utils.isEmpty(config.maxNumber)) {
                return value <= config.maxNumber;
              } else if (!_this.$utils.isEmpty(config.minNumber) && _this.$utils.isEmpty(config.maxNumber)) {
                return value >= config.minNumber;
              }
              return true;
            }
          }
        });
      }
      if (!_this.$utils.isEmpty(config.decimalNumber)) {
        //小数位验证
        validateList.push({
          name: 'decimal',
          trigger: 'change',
          message: this.$t('page.decimalnumber') + config.decimalNumber,
          validator: (rule, value) => {
            if (value == '' || value == null || value == undefined) {
              return true;
            } else if (typeof value === 'number') {
              if (value % 1 === 0) {
                return true;
              } else {
                let index = String(value).indexOf('.');
                return String(value).substr(index + 1).length <= Math.floor(config.decimalNumber);
              }
            } 
          }
        });
      }
      return validateList;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
