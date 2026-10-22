<template>
  <TsFormInput
    ref="input"
    :value="value"
    type="text"
    :disabled="disabled"
    :maxlength="null"
    @change="updateValue"
    @on-blur="blurInput"
  ></TsFormInput>
</template>
<script>
import StringEditor from './string-editor.vue';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';

// 日期仍使用普通文本框；只有实际编辑才把空白视为未设置，打开旧配置不自动改写。
export default {
  // 公共输入框默认 trim；仅日期的局部实例保留原文，让首尾空白参与严格校验。
  components: {
    TsFormInput: {
      extends: TsFormInput,
      methods: { trimValue(value) { return value; } }
    }
  },
  extends: StringEditor,
  methods: {
    updateValue(value) {
      if (!this.disabled) {
        this.inputTouched = true;
        this.$emit('change', typeof value === 'string' && !value.trim() ? undefined : value);
      }
    }
  }
};
</script>
