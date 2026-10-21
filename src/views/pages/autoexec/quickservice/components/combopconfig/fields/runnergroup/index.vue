<template>
  <RunnergroupSetting
    ref="control"
    :config="{ mappingMode: 'constant', value: $utils.deepClone(value) }"
    :runtimeParamList="context.runtimeParamList"
    :isCreateJob="true"
    :readonly="mode === 'readonly'"
    :disabled="disabled"
    :isRequired="isRequired"
    @change="update"
    @updateRunnergroup="update"
  ></RunnergroupSetting>
</template>
<script>
import RunnergroupSetting from '@/views/pages/autoexec/detail/actionDetail/runnergroup-setting.vue';
import { editorProps as props } from '../../editor-contract.js';

export default {
  name: 'RunnerGroup',
  components: { RunnergroupSetting },
  props,
  methods: {
    update(mapping) {
      if (this.$utils.isSame(mapping.value, this.value)) return;
      this.$emit('input', this.$utils.deepClone(mapping.value));
      this.$emit('change', this.$utils.deepClone(mapping.value));
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
