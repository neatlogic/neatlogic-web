<template>
  <TsFormInput
    ref="control"
    :value="value"
    :readonly="mode === 'readonly'"
    :disabled="disabled"
    border="border"
    :validateList="isRequired ? ['required'] : []"
    @on-change="update"
  ></TsFormInput>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import { editorProps as props } from '../../editor-contract.js';

export default {
  name: 'ExecuteUser',
  components: { TsFormInput },
  props,
  methods: {
    update(value) {
      this.$emit('input', value);
      this.$emit('change', value);
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
