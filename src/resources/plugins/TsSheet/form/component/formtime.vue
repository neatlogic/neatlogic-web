<template>
  <TsFormDatePicker
    ref="formitem"
    :value="actualValue"
    type="time"
    :format="config.format"
    :readonly="readonly"
    :disabled="disabled"
    :validateList="getValidList"
    :readonlyTextIsHighlight="readonlyTextIsHighlight"
    border="border"
    transfer
    @on-change=" val => {
      setValue(val);
    }"
  ></TsFormDatePicker>

</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
export default {
  name: '',
  components: {
    TsFormDatePicker
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
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
      if (!this.$utils.isEmpty(this.config.validType) && !this.$utils.isEmpty(this.config.validValueList)) {
        for (let i = 0; i < this.config.validValueList.length; i++) {
          if (this.config.validValueList[i].filter && this.config.validValueList[i].filter !== 'custom') {
            const findItem = this.formItemList.find(item => item.uuid == this.config.validValueList[i].filter);
            if (!findItem) {
              this.$set(this.config.validValueList[i], 'filter', '');
            }
          }
          if (!this.config.validValueList[i].text || 
          !this.config.validValueList[i].filter ||
          (this.config.validValueList[i].filter === 'custom' && !this.config.validValueList[i].value)) {
            errorList.push({ field: 'validValueList', error: this.$t('message.completerequired', {'target': this.$t('term.framework.cusvalid')}) });
            break;
          }
        }
      } 
      return errorList;
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
    getValidList() {
      let validateList = this.validateList || [];
      //自定义校验
      if (this.config.validType && this.config.validType.indexOf('custom') >= 0 && !this.$utils.isEmpty(this.config.validValueList)) {
        this.config.validValueList.forEach(item => {
          //text filter value
          if (!item.filter && !item.text) {
            //为空校验
            return;
          } else if (item.filter == 'custom' && item.value) {
            //自定义
            validateList.push({
              name: 'tomore',
              trigger: 'change',
              message: this.$t('term.framework.timeneed') + (item.text == 'later' ? this.$t('page.later') : this.$t('page.earlier')) + item.value,
              validator: (rule, value) => {
                if (value == '') {
                  return true;
                } else if (item.text == 'later') {
                  return value > item.value;
                } else if (item.text == 'earlier') {
                  return value < item.value;
                }
                return true;
              }
            });
          } else {
            //表单相同组件
            if (!this.$utils.isEmpty(this.formItemList)) {
              for (let i = 0; i < this.formItemList.length; i++) {
                if (this.formItemList[i].uuid == item.filter) {
                  let component = this.formItemList[i];
                  let formValue = this.formData[item.filter];
                  validateList.push({
                    name: 'tomore',
                    trigger: 'change',
                    message: this.$t('term.framework.timeneed') + (item.text == 'later' ? this.$t('page.later') : this.$t('page.earlier')) + component.label,
                    validator: (rule, value) => {
                      if (value == '' || !formValue) {
                        return true;
                      } else if (item.text == 'later') {
                        return value > formValue;
                      } else if (item.text == 'earlier') {
                        return value < formValue;
                      }
                      return true;
                    }
                  });
                  break;
                }
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
