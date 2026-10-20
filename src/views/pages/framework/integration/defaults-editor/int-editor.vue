<template>
  <div>
    <TsFormInput
      ref="input"
      :value="value"
      type="number"
      :disabled="disabled"
      :errorMessage="integerError"
      @change="changeNumber"
      @on-blur="blurInput"
    ></TsFormInput>
  </div>
</template>
<script>
import NumberEditor from './number-editor.vue';
export default {
  extends: NumberEditor,
  computed: {
    integerError() {
      // 保留用户输入并明确报错，不静默截断小数后保存。
      return this.validationMode !== 'none' && this.value !== undefined && !Number.isInteger(this.value) ? '必须为整数' : '';
    }
  }
};
</script>
