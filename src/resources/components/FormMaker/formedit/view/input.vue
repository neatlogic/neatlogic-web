<template>
  <div style="position: relative;">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <TsFormInput 
      v-if="setting" 
      v-model="currentValue" 
      :placeholder="setting.config.placeholder" 
      :maxlength="setting.config.inputMaxlength" 
      :validateList="getInputValueList" 
      :value="currentValue" 
      :width="setting.config.width" 
      :textType="setting.config.textType" 
      readonlyClass=""
      :disabled="isReadonly || false" 
      @on-change="updatethis(currentValue)"
      @change-label="changeLabel"
    ></TsFormInput>
    <Input v-else placeholder="请输入" />
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import viewmixin from './viewmixin.js';
export default {
  name: 'Forminput',
  components: { TsFormInput },
  mixins: [viewmixin],
  props: {
    setting: Object,
    value: String,
    isReadonly: Boolean,
    formView: {
      //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    componentList: {
      //同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    let _this = this;
    return {
      currentValue: _this.value
    };
  },
  created() {},
  methods: {
    updatethis: function(val) {
      this.$emit('update', val);
    },
    updateValue: function(val) {
      this.$set(this, 'currentValue', val);
    },
    getValue: function(val) {
      return this.currentValue;
    },
    validateValue: function() {
      let isVaild = true;
      isVaild = this.$children[0].valid();
      return isVaild;
    }
  },
  computed: {
    getInputValueList() {
      let _this = this;
      let validList = [];

      this.setting.config.isRequired && validList.push('required');
      if (this.setting.config.textType && this.setting.config.textType != 'none') {
        validList.push(this.setting.config.textType);
      }

      let config = this.setting.config;
      if (config.textType != 'float') {
        //非number类型验证长度
        validList.push({
          name: 'tomore',
          trigger: 'change',
          message: '字符长度过长',
          validator: (rule, value) => {
            if (value == '' || value == null || value == undefined) {
              return true;
            } else if (config.inputMaxlength) {
              return value.length <= config.inputMaxlength;
            }
            return true;
          }
        });
      } else if (config.textType == 'float') {
        //number类型验证大小和小数位
        (config.minNumber !== '' || config.maxNumber !== '') &&
          validList.push({
            //最大值，最小值的验证
            name: 'tonumber',
            trigger: 'change',
            message: '请输入' + (config.minNumber ? '大于等于' + config.minNumber : '') + (config.maxNumber ? '小于等于' + config.maxNumber : '') + '的数据',
            validator: (rule, value) => {
              let valid = true;
              if (value == '' || value == null || value == undefined) {
                return true;
              } else {
                if (config.minNumber !== null && config.minNumber !== undefined && config.minNumber !== '') {
                  valid = parseFloat(value) >= parseFloat(config.minNumber);
                }
                if (valid && config.maxNumber !== null && config.maxNumber !== undefined && config.maxNumber !== '') {
                  valid = parseFloat(value) <= parseFloat(config.maxNumber);
                }
              }
              return valid;
            }
          });
        config.decimalNumber !== '' &&
          validList.push({
            //小数位验证
            name: 'decimal',
            trigger: 'change',
            message: '小数位' + config.decimalNumber,
            validator: (rule, value) => {
              let index = value.indexOf('.');
              if (value == '' || value == null || value == undefined) {
                return true;
              } else if (value.indexOf('.') < 0) {
                return true;
              } else {
                let index = value.indexOf('.');
                return value.substr(index + 1).length <= Math.floor(config.decimalNumber);
              }
              // eslint-disable-next-line no-unreachable
              return true;
            }
          });
      }

      return validList;
    }
  },
  watch: {
    value: function(newValue, oldValue) {
      if (newValue != this.currentValue) {
        this.currentValue = newValue;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.readonly-container {
  position: relative;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
  }
}
.component-tips {
  text-align: left;
  font-size: 90%;
  opacity: 0.6;
  word-break: break-all;
  display: block;
  &:before {
    margin-right: 3px;
  }
}
</style>
