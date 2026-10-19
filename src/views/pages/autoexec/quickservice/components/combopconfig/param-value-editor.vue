<template>
  <component
    :is="definition.component"
    ref="control"
    :value="$utils.deepClone(value)"
    :definition="definition"
    :context="context"
    :mode="mode"
    :disabled="disabled"
    :isRequired="isRequired"
    @input="update"
    @change="update"
  >
  </component>
</template>
<script>
import { editorProps as props } from './editor-contract.js';
export default {
  name: 'ParamValueEditor',
  props: { ...props, definition: { type: Object, required: true } },
  methods: {
    update(value) {
      if (this.$utils.isSame(value, this.value)) return;
      this.$emit('input', this.$utils.deepClone(value));
      this.$emit('change', this.$utils.deepClone(value));
    },
    getValue() {
      return this.$refs.control && this.$refs.control.getValue ? this.$refs.control.getValue() : this.$utils.deepClone(this.value);
    },
    async valid() {
      return !this.$refs.control || !this.$refs.control.valid || (await this.$refs.control.valid());
    }
  }
};
</script>
