<template>
  <TsFormRadio
    ref="control"
    :dataList="context.toolConfig && context.toolConfig.scenarioList || []"
    valueName="scenarioId"
    textName="scenarioName"
    :allowToggle="true"
    :value="value"
    :disabled="disabled"
    :readonly="mode === 'readonly'"
    :validateList="isRequired ? ['required'] : []"
    :transfer="true"
    border="border"
    @on-change="update"
  ></TsFormRadio>
</template>
<script>
import TsFormRadio from '@/resources/plugins/TsForm/TsFormRadio';
import { editorProps as props } from '../../editor-contract.js';

export default {
  name: 'Scenario',
  components: { TsFormRadio },
  props,
  methods: {
    update(value) {
      this.$emit('input', this.$utils.deepClone(value));
      this.$emit('change', this.$utils.deepClone(value));
    },
    getValue() {
      return this.$utils.deepClone(this.value);
    },
    async valid() {
      return !this.$refs.control || (await this.$refs.control.valid());
    }
  }
};
</script>
