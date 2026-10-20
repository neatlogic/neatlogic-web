<template>
  <div style="width: 9em; white-space: normal">
    <!-- 默认值内容区与名称、描述保持相同宽度，不改变各类型控件的编辑行为。 -->
    <!-- 入口区与普通输入框保持相同的最小高度，统一主表行距；错误提示仍可自然撑高。 -->
    <div v-if="complex" class="flex-start" style="min-height: 32px">
      <span
        class="text-href"
        :class="{ disable: disabled }"
        data-open-schema
        @click="openSchema"
      >{{ schema.type === 'array' ? '设置默认值' : '结构设置' }}</span>
      <!-- 数组统一在弹窗录入默认数据；主表仅展示入口及有效顶层行数，避免与参数定义混淆。 -->
      <span v-if="schema.type === 'array' && rowCount" class="text-tip ml-xs" data-default-row-count>{{ rowCount }}行</span>
    </div>
    <template v-else>
      <component
        :is="editor"
        ref="editor"
        :value="currentValue"
        :schema="schema"
        :disabled="disabled || !!resolved.error"
        :validationMode="phase"
        @change="changeValue"
        @blur="handleBlur"
      ></component>
    </template>
    <div v-if="error" class="text-error">{{ error }}</div>
    <span
      v-if="resolved.error"
      class="text-href"
      :class="{ disable: disabled }"
      @click="openSchema"
    >重新配置</span>
  </div>
</template>
<script>
import { getDefaultEditor } from './index.js';
import { resolveSchema, hasOwn, isComplex } from './editor-utils.js';
import { cloneJson, cloneDefaultConfig, validateDefaultConfig, isDefaultEnabled } from '../integration-default-utils.js';
export default {
  props: {
    pattern: { type: Object, required: true },
    config: { type: Object, default: undefined },
    disabled: { type: Boolean, default: false }
  },
  data() { return {phase: 'none', phaseRevision: 0}; },
  methods: {
    openSchema() { if (!this.disabled) this.$emit('open', 'schema'); },
    flushInput() {
      if (this.disabled || this.complex || this.resolved.error) return;
      const editor = this.$refs.editor;
      if (editor && editor.flushInput) {
        // 未触碰的控件只同步真正不同的待提交值，不能把旧非法布尔值转型或给空参数补配置。
        const displayed = 'displayValue' in editor ? editor.displayValue : editor.value;
        if (!editor.inputTouched && editor.readInputValue && editor.readInputValue(displayed) === displayed) return;
        editor.flushInput();
      }
    },
    handleBlur() {
      // 编辑器先提交当前输入，等待回显再校验；迟到的失焦不能覆盖提交或后续输入的状态。
      const revision = ++this.phaseRevision;
      this.$nextTick(() => {
        if (revision === this.phaseRevision && !this.disabled && !this._isDestroyed) this.phase = 'type';
      });
    },
    validateForSubmit() {
      this.phaseRevision++;
      this.phase = 'all';
      return !this.error;
    },
    changeValue(value) {
      if (this.disabled || this.resolved.error) return;
      // 输入中途不显示类型错误，开始修改时清除上次失焦或提交产生的提示。
      this.phaseRevision++;
      this.phase = 'none';
      const next = cloneDefaultConfig(this.config || {});
      if (!hasOwn(next, 'schema')) next.schema = cloneJson(this.schema);
      // 仅实际录入时启用；文本类（含枚举、日期）的空串和 0、false 均为有效值。
      next.enabled = value !== undefined;
      if (value === undefined) delete next.value;
      else next.value = cloneJson(value);
      this.$emit('change', next);
    }
  },
  computed: {
    resolved() { return resolveSchema(this.pattern, this.config); },
    schema() { return this.resolved.schema; },
    complex() { return isComplex(this.schema); },
    // 旧版关闭的草稿继续保存，但不作为有效默认值回显，也不能在渲染时自动启用。
    currentValue() { return isDefaultEnabled(this.config) ? this.config.value : undefined; },
    rowCount() { return Array.isArray(this.currentValue) ? this.currentValue.length : 0; },
    editor() { return getDefaultEditor(this.schema.type); },
    error() {
      // 结构失效仍需即时告知；数组/对象入口继续沿用原完整检查，不影响弹窗校验时机。
      if (this.resolved.error) return this.resolved.error;
      if (!this.complex && this.phase === 'none') return null;
      return validateDefaultConfig(this.pattern, this.config, {skipRequired: !this.complex && this.phase === 'type'});
    }
  },
  watch: {
    'schema.type'() { this.phaseRevision++; this.phase = 'none'; },
    disabled() { this.phaseRevision++; this.phase = 'none'; }
  }
};
</script>
