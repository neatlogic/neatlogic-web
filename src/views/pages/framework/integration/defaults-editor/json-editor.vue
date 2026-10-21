<template>
  <div>
    <TsFormInput
      ref="input"
      :value="text"
      type="text"
      :disabled="disabled"
      :maxlength="null"
      @change="changeText"
      @on-blur="blurInput"
    ></TsFormInput>
    <div v-if="error" class="text-error">{{ error }}</div>
  </div>
</template>
<script>
import isEqual from 'lodash/isEqual';
import ValueBase from './value-base.js';
import { cloneJson, validateDefaultValue } from '../integration-default-utils.js';

// 文本仅是页面草稿，合法值按真实 JSON 容器写回；非法文本由容器类型校验阻止保存。
export default {
  components: { TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue') },
  extends: ValueBase,
  data() { return { text: '', jsonError: '', emittedValue: undefined, hasEmitted: false }; },
  methods: {
    flushInput() {
      if (this.disabled) return;
      const text = this.readInputValue(this.text);
      // 结构清理产生的 undefined 只能留在草稿；未编辑的 JSON 回显不能重解析成 null。
      if (!this.hasEmitted && text === this.text) return;
      this.changeText(text);
    },
    changeText(value) {
      if (this.disabled) return;
      this.text = value == null ? '' : String(value);
      let parsed;
      this.jsonError = '';
      if (this.text.trim()) {
        try {
          parsed = JSON.parse(this.text);
          // 先检查容器类型与有限数值，再由已有结构给出字段级错误，合法容器始终保留真实类型。
          const error = validateDefaultValue(parsed, {type: this.schema.type}, this.path, true);
          if (error) throw new Error(error);
          this.jsonError = validateDefaultValue(parsed, this.schema, this.path, true) || '';
        } catch (error) {
          // 原文本不能作为合法 JSON 默认值提交，保留它供用户继续修正，不强转 null 或 false。
          this.jsonError = error instanceof SyntaxError ? `${this.path}：JSON 格式不正确` : error.message;
          parsed = this.text;
        }
      }
      this.hasEmitted = true;
      this.emittedValue = cloneJson(parsed);
      this.updateValue(parsed);
    },
    syncValue(value) {
      // 自己输入后的等值回显不覆盖原格式，避免光标跳动和空格被 stringify 清除。
      if (this.hasEmitted && isEqual(value, this.emittedValue)) return;
      this.hasEmitted = false;
      this.jsonError = '';
      this.text = value === undefined ? '' : typeof value === 'string' ? value : JSON.stringify(value);
    },
    refreshPathError() {
      // 行移动只更新错误定位，不重新发送数据或格式化文本，保留非法 JSON 草稿。
      if (!this.hasEmitted) return;
      this.jsonError = '';
      if (!this.text.trim()) return;
      try {
        const parsed = JSON.parse(this.text);
        this.jsonError = validateDefaultValue(parsed, this.schema, this.path, true) || '';
      } catch (error) {
        this.jsonError = error instanceof SyntaxError ? `${this.path}：JSON 格式不正确` : error.message;
      }
    }
  },
  computed: {
    error() {
      if (this.validationMode === 'none') return '';
      if (this.validationMode === 'type' && !this.text.trim()) return '';
      if (this.value === undefined) return this.validationMode === 'all' && (this.schema.isRequired === true || this.schema.isRequired === 1) ? `${this.path}为必填字段` : '';
      // 从原文本重新判断语法，失焦递归跳过必填；确定时再恢复全部结构约束。
      // 合法 JSON 的原格式仍留在 text 中，不因校验或行排序而重新序列化。
      try {
        const parsed = JSON.parse(this.text);
        return validateDefaultValue(parsed, this.schema, this.path, true, {skipRequired: this.validationMode === 'type'});
      } catch (error) {
        if (error instanceof SyntaxError) return `${this.path}：JSON 格式不正确`;
      }
      return this.jsonError;
    }
  },
  watch: {
    value: { handler: 'syncValue', deep: true, immediate: true },
    path: 'refreshPathError'
  }
};
</script>
