<template>
  <TsFormSelect
    ref="control"
    dynamicUrl="/api/rest/resourcecenter/account/protocol/search"
    rootName="tbodyList"
    :dealDataByUrl="$utils.getProtocolDataList"
    :value="value"
    :disabled="disabled"
    :readonly="mode === 'readonly'"
    :validateList="isRequired ? ['required'] : []"
    :transfer="true"
    border="border"
    @on-change="update"
  ></TsFormSelect>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import { editorProps as props } from '../../editor-contract.js';

export default {
  name: 'Protocol',
  components: { TsFormSelect },
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
