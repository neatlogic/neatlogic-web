<template>
  <TsFormRadio
    ref="control"
    :dataList="policyList"
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
  name: 'ParallelPolicy',
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
  },
  computed: {
    policyList() {
      return [
        { text: this.$t('page.autoexecparall'), value: 'parallel' },
        { text: this.$t('page.autoexecbatchround'), value: 'roundCount' }
      ];
    }
  }
};
</script>
