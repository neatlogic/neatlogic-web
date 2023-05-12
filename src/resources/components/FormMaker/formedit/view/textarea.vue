<template>
  <div style="position: relative;">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <TsFormInput 
      v-if="setting" 
      v-model="currentValue" 
      type="textarea" 
      v-bind="getConfig" 
      :maxlength="setting.config.textareaMaxlength" 
      :value="currentValue" 
      :width="setting.config.width" 
      :height="setting.config.height" 
      :disabled="isReadonly || false"
      @on-change="updatethis(currentValue)"
      @change-label="changeLabel"
    ></TsFormInput>
    <Input v-else placeholder="请输入" type="textarea" />
    <div v-if="setting.config.desc" class="component-tips ts-info">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import viewmixin from './viewmixin.js';
export default {
  name: 'Formtextarea',
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
      currentValue: _this.value || '',
      config: {
        value: this.value || '',
        width: this.setting.config.width,
        textareaMaxlength: this.setting.config.textareaMaxlength,
        validateList: this.setting.config.isRequired ? ['required'] : [],
        isRequire: this.setting.config.isRequired,
        readonly: this.isReadonly || false
      }
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
      if (this.setting.config.isRequired) {
        isVaild = this.$children[0].valid();
      }
      return isVaild;
    }
  },
  computed: {
    getConfig: function() {
      let config = {
        validateList: this.setting.config.isRequired ? ['required'] : [],
        placeholder: this.setting.config.placeholder,
        readonlyClass: ''
      };
      return config;
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
