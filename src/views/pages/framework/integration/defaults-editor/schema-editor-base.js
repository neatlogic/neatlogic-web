import { resolveSchema, reconcileValue } from './editor-utils.js';
import { cloneJson, getDeclaredSchema, getEffectiveSchema, validateDefaultSchema } from '../integration-default-utils.js';

// 结构弹窗与内联对象编辑共用草稿、校验和清理规则，避免两套保存行为。
export default {
  props: {
    pattern: { type: Object, required: true },
    config: { type: Object, default: undefined },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return { schemaDraft: null, schemaError: '', schemaSteps: [], schemaEditorKey: 0, pending: null };
  },
  computed: {
    resolved() { return resolveSchema(this.pattern, this.config); },
    declared() { return getDeclaredSchema(this.pattern); }
  },
  methods: {
    emitConfig(config) { if (!this.disabled) this.$emit('change', config); },
    beginSchemaDraft(steps = []) {
      if (this.disabled) return;
      this.schemaDraft = cloneJson(this.resolved.schema);
      this.schemaSteps = cloneJson(steps);
      this.schemaError = '';
      this.pending = null;
      this.schemaEditorKey++;
    },
    changeSchemaDraft(schema) { this.schemaDraft = schema; this.schemaError = ''; },
    saveSchema() {
      if (this.disabled || this.pending || this.resolved.error) return;
      try {
        const schema = getEffectiveSchema(this.pattern, { schema: this.schemaDraft });
        const error = validateDefaultSchema(schema, this.pattern.name, true);
        if (error) { this.schemaError = error; return; }
        const next = cloneJson(this.config || { enabled: false });
        next.schema = cloneJson(schema);
        const reconciled = reconcileValue(next.value, this.resolved.schema, schema);
        if (reconciled.value === undefined) {
          // 结构变化清除整个顶层值时同步关闭；清理子字段时保留其余容器和值。
          delete next.value;
          next.enabled = false;
        } else next.value = reconciled.value;
        if (reconciled.changed) {
          this.pending = { config: next, message: '结构变更会清空所有行中受影响的值，其他字段保留。取消将保留原结构和数据。' };
        } else this.applySchema(next);
      } catch (error) { this.schemaError = error.message; }
    },
    applySchema(config) {
      this.emitConfig(config);
      this.cancelSchemaDraft();
      this.finishSchema();
    },
    cancelSchemaDraft() {
      // 关闭、取消以及外部上下文失效均只丢弃草稿，不触碰父级配置。
      this.pending = null;
      this.schemaDraft = null;
      this.schemaError = '';
    },
    requestReset() {
      if (this.disabled) return;
      this.pending = { config: { enabled: false, schema: cloneJson(this.declared) }, message: '将移除不兼容的默认值并按当前处理器恢复结构，之后可重新录入。' };
    },
    confirmPending() { if (!this.disabled && this.pending) this.applySchema(this.pending.config); },
    cancelPending() {
      this.pending = null;
      this.schemaError = '';
      this.schemaDraft = cloneJson(this.resolved.schema);
      this.schemaEditorKey++;
    },
    finishSchema() {}
  }
};
