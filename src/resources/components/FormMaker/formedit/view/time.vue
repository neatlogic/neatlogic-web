<template>
  <div style="position: relative;">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <TsFormDatePicker 
      v-if="setting" 
      v-model="currentValue" 
      type="time" 
      :transfer="transfer" 
      value-type="format" 
      :validateList="getValidList" 
      :value="currentValue" 
      :width="setting.config.width" 
      :disabled="isReadonly || false" 
      :format="setting.config.showType" 
      :placeholder="setting.config.placeholder"
      readonlyClass=""
      @on-change="updatethis(currentValue)"
    ></TsFormDatePicker>
    <TimePicker v-else type="time" placeholder="选择时间"></TimePicker>
    <div v-if="setting.config.desc" class="component-tips ts-info">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
import viewmixin from './viewmixin.js';
export default {
  name: 'Formtime',
  components: { TsFormDatePicker },
  mixins: [viewmixin],
  props: {
    setting: Object,
    value: [String, Number],
    isReadonly: Boolean,
    componentList: {
      type: Array,
      default: () => []
    },
    formView: {
      //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    transfer: {
      type: Boolean,
      default: true      
    }
  },
  data() {
    let _this = this;
    return {
      currentValue: _this.value || ''
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
    getValidList() {
      let config = this.setting.config;
      let validateList = config.isRequired ? ['required'] : [];
      //自定义校验
      if (config.validType && config.validType.indexOf('custom') >= 0 && config.validValueList && config.validValueList.length > 0) {
        config.validValueList.forEach(item => {
          //text  filter value
          if (!item.filter && !item.text) {
            //为空校验
            return;
          } else if (item.filter == 'custom' && item.value) {
            //自定义
            validateList.push({
              name: 'tomore',
              trigger: 'change',
              message: '时间需要' + (item.text == 'later' ? '晚于' : '早于') + item.value,
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
            for (let i = 0; i < this.componentList.length; i++) {
              if (this.componentList[i].uuid == item.filter) {
                let component = this.componentList[i];
                validateList.push({
                  name: 'tomore',
                  trigger: 'change',
                  message: '时间需要' + (item.text == 'later' ? '晚于' : '早于') + component.label,
                  validator: (rule, value) => {
                    if (value == '' || !component.config.value) {
                      return true;
                    } else if (item.text == 'later') {
                      return value > component.config.value;
                    } else if (item.text == 'earlier') {
                      return value < component.config.value;
                    }
                    return true;
                  }
                });
                break;
              }
            }
          }
        });
      }
      return validateList;
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
