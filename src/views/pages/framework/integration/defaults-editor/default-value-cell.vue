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
        :value="currentValue"
        :schema="schema"
        :disabled="disabled || !!resolved.error"
        @change="changeValue"
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
  methods: {
    openSchema() { if (!this.disabled) this.$emit('open', 'schema'); },
    changeValue(value) {
      if (this.disabled || this.resolved.error) return;
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
    error() { return this.resolved.error || validateDefaultConfig(this.pattern, this.config); }
  }
};
</script>
