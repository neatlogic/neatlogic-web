<template>
  <TsFormInput
    ref="input"
    :value="value"
    type="number"
    :disabled="disabled"
    @change="changeNumber"
    @on-blur="blurInput"
  ></TsFormInput>
</template>
<script>
import ValueBase from './value-base.js';
export default {
  components: { TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue') },
  extends: ValueBase,
  methods: {
    flushInput() { if (!this.disabled) this.changeNumber(this.readInputValue()); },
    changeNumber(value) {
      // 数字输入清空表示尚未录入，不能把空值隐式转换为零。
      this.updateValue(value === '' || value === null ? undefined : value);
    }
  }
};
</script>
