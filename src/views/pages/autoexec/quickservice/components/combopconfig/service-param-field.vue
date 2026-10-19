<template>
  <TsFormItem
    :id="`positioningkey_${definition.paramKey || definition.key}`"
    :label="definition.labelText || definition.label"
    :required="required"
  >
    <div class="parameter-controls">
      <MappingModeSelect
        v-if="mode === 'service-edit' && !definition.direct && value.mappingMode !== 'runtimeparam'"
        ref="mapping"
        :value="value.mappingMode"
        :definition="definition"
        :context="context"
        :disabled="disabled || definition.locked"
        @input="updateMapping"
      ></MappingModeSelect>
      <div class="parameter-value">
        <TsFormSelect
          v-if="value.mappingMode === 'formattr'"
          ref="form"
          :value="value.value"
          :dataList="context.formFields"
          valueName="uuid"
          textName="label"
          :readonly="editorMode === 'readonly'"
          :disabled="disabled || definition.locked"
          :validateList="required ? ['required'] : []"
          :transfer="true"
          border="border"
          @on-change="updateValue"
        ></TsFormSelect>
        <span v-else-if="value.mappingMode === 'runtimeparam'" class="text-tip">{{ runtimeParamText }}</span>
        <slot
          v-else-if="showValueEditor"
          name="editor"
          :value="value.value"
          :mode="editorMode"
          :disabled="disabled || definition.locked"
          :isRequired="required"
          :update="updateValue"
        >
          <ParamValueEditor
            ref="editor"
            :value="value.value"
            :definition="definition"
            :context="context"
            :mode="editorMode"
            :disabled="disabled || definition.locked"
            :isRequired="required"
            @input="updateValue"
          ></ParamValueEditor>
        </slot>
        <span v-else-if="mode !== 'service-edit'" class="text-tip">{{ mappingLabel }}</span>
        <div v-if="invalid" class="text-error">
          {{ $t('form.validate.required', { target: definition.labelText || definition.label }) }}</div>
      </div>
    </div>
    <div v-if="definition.tip" class="text-tip">{{ definition.tip }}</div>
  </TsFormItem>
</template>
<script>
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import MappingModeSelect from './mapping-mode-select.vue';
import ParamValueEditor from './param-value-editor.vue';
import { changeMapping, isRequired, isJobEditable, mappingOptions, MAPPING_LABELS } from './mapping-rules.js';
import { validateControls } from './editor-contract.js';
export default {
  name: 'ServiceParamField',
  components: { TsFormItem, TsFormSelect, MappingModeSelect, ParamValueEditor },
  props: { value: { type: Object, required: true }, definition: { type: Object, required: true }, context: { type: Object, required: true }, mode: { type: String, default: 'service-edit' }, disabled: Boolean, getEditor: Function },
  data() {
    return { invalid: false };
  },
  methods: {
    updateMapping(mappingMode) {
      this.update(changeMapping(this.value, mappingMode, this.definition));
    },
    updateValue(value) {
      this.update({ ...this.value, value });
    },
    update(value) {
      this.invalid = false;
      this.$emit('input', this.$utils.deepClone(value));
      this.$emit('change', this.$utils.deepClone(value));
    },
    getValue() {
      const editor = this.showValueEditor && (this.getEditor ? this.getEditor() : this.$refs.editor);
      return editor && editor.getValue ? { ...this.$utils.deepClone(this.value), value: this.$utils.deepClone(editor.getValue()) } : this.$utils.deepClone(this.value);
    },
    async valid() {
      if (this.mode === 'readonly' || this.disabled || this.definition.locked) return true;
      if (this.mode === 'job-create' && !isJobEditable(this.definition, this.value)) return true;
      const required = isRequired(this.definition, this.value, this.mode);
      const editor = this.showValueEditor && this.getEditor ? this.getEditor() : null;
      const controlsValid = await validateControls([...Object.values(this.$refs), editor]);
      const invalidMapping = this.mode === 'service-edit' && !this.definition.direct && this.value.mappingMode !== 'runtimeparam' && !mappingOptions(this.definition, this.context).includes(this.value.mappingMode);
      const invalidForm = this.mode === 'service-edit' && this.value.mappingMode === 'formattr' && !(this.context.formFields || []).some(f => f.uuid === this.value.value);
      this.invalid = invalidMapping || invalidForm || (required && this.$utils.isEmpty(this.getValue().value)) || !controlsValid;
      return !this.invalid;
    }
  },
  computed: {
    showValueEditor() {
      return this.value.mappingMode === 'constant' || (this.mode === 'job-create' && this.value.mappingMode === 'notsetup');
    },
    required() {
      return isRequired(this.definition, this.value, this.mode);
    },
    editorMode() {
      const editable = this.mode === 'service-edit' || (this.mode === 'job-create' && isJobEditable(this.definition, this.value));
      return editable && this.mode !== 'readonly' ? 'edit' : 'readonly';
    },
    runtimeParamText() {
      const param = (this.context.runtimeParamList || []).find(p => p.key === this.value.value);
      return `${MAPPING_LABELS.runtimeparam}: ${param ? param.name : this.value.value || '-'}`;
    },
    mappingLabel() {
      return MAPPING_LABELS[this.value.mappingMode] || this.$t('page.notsetting');
    }
  }
};
</script>
<style lang="less" scoped>
.parameter-controls {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  .parameter-value {
    flex: 1;
    min-width: 0;
  }
}
</style>
