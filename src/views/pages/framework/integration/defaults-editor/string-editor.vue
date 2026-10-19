<template>
  <div>
    <TsFormInput
      :value="value"
      type="text"
      :disabled="disabled"
      :maxlength="null"
      @change="updateValue"
    ></TsFormInput>
  </div>
</template>
<script>
import ValueBase from './value-base.js';
// 默认值字符串使用固定单行输入，减少主表中的附加交互入口。
export default {
  components: { TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue') },
  extends: ValueBase
};
</script>
