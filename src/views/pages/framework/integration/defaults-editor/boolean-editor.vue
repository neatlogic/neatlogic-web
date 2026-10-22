<template>
  <TsFormInput
    ref="input"
    :value="displayValue"
    type="text"
    :disabled="disabled"
    :maxlength="null"
    @change="changeText"
    @on-blur="blurInput"
  ></TsFormInput>
</template>
<script>
import ValueBase from './value-base.js';
// 布尔默认值使用普通文本输入，解析结果仍保持 JSON 布尔值。
export default {
  components: { TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue') },
  extends: ValueBase,
  methods: {
    flushInput() { if (!this.disabled) this.changeText(this.readInputValue(this.displayValue)); },
    changeText(value) {
      if (typeof value !== 'string') {
        this.updateValue(value);
        return;
      }
      // 仅去除首尾空白后的小写 true/false 转换；非法文本保留草稿，由原布尔校验阻止保存。
      const text = value.trim();
      this.updateValue(text === '' ? undefined : text === 'true' ? true : text === 'false' ? false : value);
    }
  },
  computed: {
    displayValue() {
      // 输入控件只接收字符串；回显不发出变更，旧数字或对象不会在打开页面时被转成合法布尔值。
      if (this.value === undefined) return '';
      if (typeof this.value === 'string') return this.value;
      return typeof this.value === 'object' ? JSON.stringify(this.value) : String(this.value);
    }
  }
};
</script>
