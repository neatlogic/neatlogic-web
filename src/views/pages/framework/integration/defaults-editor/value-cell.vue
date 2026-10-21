<template>
  <div>
    <!-- 复杂子字段直接编辑 JSON；顶层数组仍由外层面板提供行表格。 -->
    <template>
      <span v-if="showValueHints && !complex && value === undefined" class="text-tip mr-xs">未设置</span>
      <component
        :is="editor"
        ref="editor"
        :value="value"
        :schema="schema"
        :disabled="disabled"
        :path="path"
        :validationMode="validationPhase"
        @change="updateValue"
        @blur="handleBlur"
      ></component>
      <span
        v-if="showValueHints && !complex && value === undefined && initialValue !== undefined"
        class="text-href"
        :class="{ disable: disabled }"
        @click="updateValue(initialValue)"
      >设置{{ initialValue === '' ? '空字符串' : String(initialValue) }}</span>
    </template>
    <div v-if="error && !complex" class="text-error">{{ error }}</div>
    <span
      v-if="showRemove && value !== undefined && !required"
      class="text-href tips"
      :class="{ disable: disabled }"
      @click="updateValue(undefined)"
    >移除</span>
  </div>
</template>
<script>
import ValueBase from './value-base.js';
import { getValueEditor } from './index.js';
import { isComplex } from './editor-utils.js';
import { createDefaultValue, validateDefaultValue } from '../integration-default-utils.js';
export default {
  extends: ValueBase,
  props: {
    // 数组表格可隐藏单元格移除入口，独立对象仍沿用原可选字段行为。
    showRemove: { type: Boolean, default: true },
    // 仅控制基础值辅助提示，不改变缺失值语义。
    showValueHints: { type: Boolean, default: true },
    // 弹窗默认数据延迟显示校验，独立对象仍保留原行为。
    deferValidation: { type: Boolean, default: false },
    valuePath: { type: Array, default: () => [] }
  },
  data() { return { phase: 'none', phaseRevision: 0 }; },
  methods: {
    updateValue(value) {
      if (this.disabled) return;
      this.phaseRevision++;
      this.phase = 'none';
      this.$emit('change', value);
    },
    flushInput() {
      const editor = this.$refs.editor;
      if (editor && editor.flushInput) editor.flushInput();
    },
    handleBlur() {
      // 值事件先传到父数组，等待回显后只检查本格的非空类型。
      const revision = ++this.phaseRevision;
      this.$nextTick(() => {
        // 确定或继续输入比失焦回调更晚发生时，以最新操作为准，不能把必填结果覆盖成类型模式。
        if (revision === this.phaseRevision && !this.disabled) this.phase = 'type';
      });
    },
    validateForSubmit() {
      this.phaseRevision++;
      this.phase = 'all';
      const editor = this.$refs.editor;
      return !this.error && !(editor && editor.error);
    },
    validateType() {
      this.phaseRevision++;
      this.phase = 'type';
    }
  },
  computed: {
    validationPhase() { return this.deferValidation ? this.phase : 'all'; },
    complex() { return isComplex(this.schema); },
    editor() { return getValueEditor(this.schema.type); },
    initialValue() { return createDefaultValue(this.schema); },
    required() { return this.schema.isRequired === 1 || this.schema.isRequired === true; },
    error() {
      // 单元格显示完整路径，未设置的可选字段允许继续保留空缺。
      if (this.validationPhase === 'none') return '';
      if (this.value === undefined) return this.validationPhase === 'all' && this.required ? `${this.path}为必填字段` : '';
      if (this.validationPhase === 'type' && typeof this.value === 'string' && !this.value.trim()) return '';
      return validateDefaultValue(this.value, this.schema, this.path, true, {skipRequired: this.validationPhase === 'type'});
    }
  }
};
</script>
