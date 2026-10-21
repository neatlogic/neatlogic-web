<template>
  <div :class="{ 'service-param-panel-flat': !grouped }">
    <template v-if="!grouped">
      <template v-for="definition in flatDefinitions">
        <component
          :is="definition.fullField ? definition.component : 'ServiceParamField'"
          :key="definition.key"
          ref="fields"
          class="parameter-field"
          :class="{ 'parameter-full-width': isFullWidth(definition) }"
          :value="value[definition.key]"
          :definition="definition"
          :context="context"
          :mode="mode"
          :disabled="disabled"
          :grouped="grouped"
          @input="update(definition.key, $event)"
          @precondition="updatePrecondition"
        ></component>
      </template>
    </template>
    <template v-else>
      <CollapseSection
        v-for="group in definitionGroups"
        :key="group.key"
        :title="group.title"
        :expanded="expanded[group.key] !== false"
        :border="border"
        @toggle="$set(expanded, group.key, $event)"
      >
        <component
          :is="definition.fullField ? definition.component : 'ServiceParamField'"
          v-for="definition in group.definitions"
          :key="definition.key"
          ref="fields"
          class="parameter-field"
          :class="{ 'parameter-full-width': isFullWidth(definition) }"
          :value="value[definition.key]"
          :definition="definition"
          :context="context"
          :mode="mode"
          :disabled="disabled"
          :grouped="grouped"
          @input="update(definition.key, $event)"
          @precondition="updatePrecondition"
        ></component>
      </CollapseSection>
    </template>
  </div>
</template>
<script>
import CollapseSection from '../collapse-section.vue';
import ServiceParamField from './service-param-field.vue';
import { PARAMETER_GROUPS } from './groups.js';
export default {
  name: 'ServiceParamPanel',
  components: { CollapseSection, ServiceParamField },
  props: {
    value: {
      type: Object,
      required: true
    },
    definitions: {
      type: Array,
      default: () => []
    },
    context: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      default: 'service-edit'
    },
    disabled: Boolean,
    border: {
      type: String,
      default: 'border'
    },
    grouped: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return { expanded: {} };
  },
  methods: {
    isFullWidth(definition) {
      return !!definition.fullWidth;
    },
    updatePrecondition(value) {
      this.$emit('precondition', this.$utils.deepClone(value));
    },
    update(key, mapping) {
      const value = { ...this.$utils.deepClone(this.value), [key]: this.$utils.deepClone(mapping) };
      this.$emit('input', value);
      this.$emit('change', value);
    },
    getValue() {
      const values = this.$utils.deepClone(this.value);
      (this.$refs.fields || []).forEach(field => {
        values[field.definition.key] = field.getValue();
      });
      return values;
    },
    async locate(key) {
      const field = (this.$refs.fields || []).find(f => f.definition.key === key || f.definition.paramKey === key);
      if (!field) return;
      this.$set(this.expanded, field.definition.group, true);
      await this.$nextTick();
      field.$el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    },
    async valid() {
      await this.$nextTick();
      let first = null;
      for (const field of this.$refs.fields || []) {
        if (!(await field.valid())) {
          this.$set(this.expanded, field.definition.group, true);
          if (!first) first = field.definition.key;
        }
      }
      if (first) await this.locate(first);
      return !first;
    }
  },
  computed: {
    flatDefinitions() {
      const definitions = this.definitions.filter(d => this.value[d.key]);
      return definitions.filter(d => !this.isFullWidth(d)).concat(definitions.filter(this.isFullWidth));
    },
    definitionGroups() {
      return PARAMETER_GROUPS.filter(group => this.definitions.some(definition => definition.group === group.key)).map(group => ({
        key: group.key,
        title: group.title,
        definitions: this.definitions.filter(definition => definition.group === group.key && this.value[definition.key])
      }));
    }
  }
};
</script>
<style lang="less" scoped>
.service-param-panel-flat {
  display: flex;
  flex-wrap: wrap;
  > .parameter-field {
    width: 33.333333% !important;
    min-width: 0;
    padding: 0 10px;
    &.parameter-full-width {
      width: 100% !important;
    }
  }
  @media (max-width: 1024px) {
    > .parameter-field {
      width: 50% !important;
    }
  }
  @media (max-width: 640px) {
    > .parameter-field {
      width: 100% !important;
    }
  }
}
</style>
