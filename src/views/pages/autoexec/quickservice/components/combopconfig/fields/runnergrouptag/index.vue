<template>
  <TsFormSelect
    ref="control"
    :value="value"
    v-bind="runnerGroupTagConfig"
    :readonly="mode === 'readonly'"
    :disabled="disabled"
    :validateList="isRequired ? ['required'] : []"
    @change="update"
  ></TsFormSelect>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import { editorProps as props } from '../../editor-contract.js';

export default {
  name: 'RunnerGroupTag',
  components: { TsFormSelect },
  props,
  data() {
    return {
      runnerGroupTagConfig: {
        dynamicUrl: '/api/rest/tag/search?type=runnergroup',
        rootName: 'tagList',
        dealDataByUrl: this.$utils.getRunnerGroupTagList,
        keyword: 'name',
        transfer: true,
        multiple: true,
        clearable: true,
        border: 'border'
      }
    };
  },
  methods: {
    update(value) {
      if (this.$utils.isSame(value, this.value)) return;
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
