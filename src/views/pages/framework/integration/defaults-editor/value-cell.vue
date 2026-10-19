<template>
  <div>
    <!-- 复杂子字段直接编辑 JSON；顶层数组仍由外层面板提供行表格。 -->
    <template>
      <span v-if="showValueHints && !complex && value === undefined" class="text-tip mr-xs">未设置</span>
      <component
        :is="editor"
        :value="value"
        :schema="schema"
        :disabled="disabled"
        :path="path"
        @change="updateValue"
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
    showValueHints: { type: Boolean, default: true }
  },
  computed: {
    complex() { return isComplex(this.schema); },
    editor() { return getValueEditor(this.schema.type); },
    initialValue() { return createDefaultValue(this.schema); },
    required() { return this.schema.isRequired === 1 || this.schema.isRequired === true; },
    error() {
      // 单元格显示完整路径，未设置的可选字段允许继续保留空缺。
      if (this.value === undefined) return this.required ? `${this.path}为必填字段` : '';
      return validateDefaultValue(this.value, this.schema, this.path, true);
    }
  }
};
</script>
