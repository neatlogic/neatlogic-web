<template>
  <PoptipSelect
    ref="control"
    :value="value"
    :list="options"
    :isRequired="true"
    :disabled="disabled"
    :width="110"
    :popLable="70"
    :popWidth="420"
    @change="update"
  ></PoptipSelect>
</template>
<script>
import PoptipSelect from '@/resources/components/PoptipSelect/PoptipSelect.vue';
import { mappingOptions, MAPPING_LABELS, MAPPING_DESCRIPTIONS } from './mapping-rules.js';
export default {
  name: 'MappingModeSelect',
  components: { PoptipSelect },
  props: { value: String, definition: Object, context: Object, disabled: Boolean },
  methods: {
    update(value) {
      this.$emit('input', value);
      this.$emit('change', value);
    },
    async valid() {
      return await this.$refs.control.valid();
    }
  },
  computed: {
    options() {
      return mappingOptions(this.definition, this.context).map(value => ({
        value,
        text: MAPPING_LABELS[value],
        description: MAPPING_DESCRIPTIONS[value]
      }));
    }
  }
};
</script>
