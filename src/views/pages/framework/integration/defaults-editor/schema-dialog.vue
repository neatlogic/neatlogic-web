<template>
  <TsDialog
    type="modal"
    width="medium"
    :isShow="true"
    :maskClose="false"
    :okBtnDisable="disabled || !!pending || !!resolved.error"
    @on-ok="saveSchema"
    @on-close="closeDialog"
  >
    <template v-slot:header><strong style="font-size: 20px">默认值设置：{{ pattern.name }}</strong></template>
    <template v-slot>
      <div ref="editorContent" class="fz14" data-default-dialog-content>
        <!-- 公共弹窗表头高度固定，副标题放入正文独立留白，避免压住生效说明。 -->
        <div class="text-tip mb-sm">{{ subtitle }}</div>
        <!-- 先说明生效条件，再分别展示结构和默认数据，避免把示例误认为运行结果。 -->
        <!-- 公共 Alert 的 desc 模式会增加空标题间距；保留紧凑单行，仅把说明恢复为正文粗细。 -->
        <Alert show-icon class="mb-nm"><span style="font-weight: normal">{{ usageDescription }}</span></Alert>
        <div v-if="resolved.error" class="mb-sm">
          <div class="text-error">{{ resolved.error }}，请重新配置。</div>
          <span class="text-href" :class="{ disable: disabled }" @click="requestReset">按当前规范重新配置</span>
        </div>
        <div class="flex-between mb-sm">
          <strong class="fz16">元素类型与字段</strong>
          <span v-if="fixedStructure" class="text-tip">固定结构，只读</span>
        </div>
        <SchemaEditor
          v-if="schemaDraft"
          :key="schemaEditorKey"
          ref="schemaEditor"
          :schema="schemaDraft"
          :declared="declared"
          :initialSteps="schemaSteps"
          :disabled="disabled || !!pending || !!resolved.error"
          :path="pattern.name"
          :readonlyFixed="true"
          :columnKeys="columnKeys"
          @change="changeSchemaDraft"
          @identities="changeColumnKeys"
        ></SchemaEditor>
        <div v-if="fixedStructure" class="text-tip mt-sm">字段由数据规范提供，默认数据可在下方编辑。</div>
        <div v-if="schemaError" class="text-error mt-sm">{{ schemaError }}</div>
        <!-- 结构和值只在本弹窗内变化；确认清理也不提交外层集成表单。 -->
        <div v-if="pending" class="border-warning padding mt-sm" data-default-schema-confirm>
          <div class="text-warning">{{ pending.message }}</div>
          <div class="action-group mt-xs">
            <span class="action-item text-href" :class="{ disable: disabled }" @click="confirmPending">清空受影响的值并应用</span>
            <span class="action-item text-href" @click="cancelPending">取消变更</span>
          </div>
        </div>
        <Divider></Divider>
        <div class="mb-sm">
          <strong class="fz16">默认数据（{{ rowCount }}行）</strong>
          <div class="text-tip mt-xs">每一行代表一条默认数据。</div>
        </div>
        <div v-if="!valueSchemaError">
          <ArrayEditor
            ref="valueEditor"
            :value="currentValue"
            :schema="valueSchema"
            :columnKeys="columnKeys"
            :disabled="disabled || !!pending || !!resolved.error"
            :path="pattern.name"
            :deferValidation="true"
            @change="changeCurrentValue"
          ></ArrayEditor>
        </div>
        <div v-else class="text-tip padding bg-grey radius-md">请先在上方选择元素类型，并完成对象字段配置，再录入默认数据。</div>
        <div v-if="valueError" class="text-error mt-sm">{{ valueError }}</div>
      </div>
    </template>
    <template v-slot:footer>
      <div class="flex-between">
        <span class="text-tip">确定后，还需在集成页面点击“确认”保存。</span>
        <div>
          <Button @click="closeDialog">取消</Button>
          <Button type="primary" :disabled="disabled || !!pending || !!resolved.error" @click="saveSchema">确定</Button>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import SchemaEditor from './schema-editor.vue';
import ArrayEditor from './array-editor.vue';
import { resolveSchema, reconcileValue, migrateColumnValue, hasOwn } from './editor-utils.js';
import { cloneJson, cloneDefaultConfig, getDeclaredSchema, getEffectiveSchema, validateDefaultSchema, validateDefaultConfig, isDefaultEnabled } from '../integration-default-utils.js';
export default {
  name: 'SchemaDialog',
  components: { SchemaEditor, ArrayEditor },
  props: {
    pattern: { type: Object, required: true },
    config: { type: Object, default: undefined },
    disabled: { type: Boolean, default: false },
    initialSteps: { type: Array, default: () => [] }
  },
  data() {
    return { configDraft: undefined, schemaDraft: null, valueSchema: null, schemaError: '', schemaSteps: [], schemaEditorKey: 0, pending: null, columnKeys: {}, submitted: false, saving: false, closed: false };
  },
  created() {
    // 复制整个配置，关闭或取消不会改变来源；旧版关闭的草稿仍保持关闭。
    this.configDraft = cloneDefaultConfig(this.config || { enabled: false });
    this.schemaDraft = cloneJson(this.resolved.schema);
    this.valueSchema = cloneJson(this.resolved.schema);
    this.schemaSteps = cloneJson(this.initialSteps);
  },
  mounted() {
    // 外层保存校验可能直接打开长数组错误；等待传送后的正文挂载，再定位实际错误。
    // 尚未设置结构的新数组只有引导提示，不应在首次打开时自动滚动。
    this.$nextTick(() => {
      if (this.resolved.error || this.valueError) this.revealError();
    });
  },
  methods: {
    changeColumnKeys(fields) {
      // 字段身份单独侧传，不进入配置 JSON；重新挂载结构编辑器仍复用旧列身份。
      this.columnKeys = Object.fromEntries(fields.map(field => [field.name, field.id]));
    },
    changeSchemaDraft(schema, metadata) {
      if (this.disabled || this.pending || this.resolved.error) return;
      this.submitted = false;
      this.schemaError = '';
      this.schemaDraft = cloneJson(schema);
      try {
        const nextSchema = getEffectiveSchema(this.pattern, { schema });
        const fieldEdit = metadata && ['name', 'delete', 'move', 'property'].includes(metadata.kind);
        const reconciled = fieldEdit
          ? { value: migrateColumnValue(this.configDraft.value, this.valueSchema, metadata.path, metadata.fields, metadata.removedNames), changed: false }
          : reconcileValue(this.configDraft.value, this.valueSchema, nextSchema);
        if (fieldEdit) {
          // 名称与顺序变动不会清空其他字段；删除只清理当前弹窗内对应数据。
          if (hasOwn(this.configDraft, 'value')) this.$set(this.configDraft, 'value', cloneJson(reconciled.value));
          this.changeColumnKeys(metadata.fields);
        }
        if (reconciled.changed) {
          // 取消变更仅恢复此次结构，之前在弹窗录入的数据仍保留。
          this.pending = { schema: nextSchema, value: reconciled.value, message: '结构变更会清空所有行中受影响的值，其他字段保留。取消将保留原结构和数据。' };
        } else this.applyDraftSchema(nextSchema);
      } catch (error) { this.schemaError = error.message; }
    },
    applyDraftSchema(schema) {
      this.schemaDraft = cloneJson(schema);
      this.valueSchema = cloneJson(schema);
      this.$set(this.configDraft, 'schema', cloneJson(schema));
    },
    changeCurrentValue(value) {
      if (this.disabled || this.pending || this.resolved.error) return;
      this.submitted = false;
      // 只有实际增删或填写才启用默认值，打开和确认结构不会补造空数组。
      const next = cloneDefaultConfig(this.configDraft);
      next.schema = cloneJson(this.valueSchema);
      next.enabled = value !== undefined;
      if (value === undefined) delete next.value;
      else next.value = cloneJson(value);
      this.configDraft = next;
    },
    async saveSchema() {
      if (this.disabled || this.pending || this.resolved.error || this.saving || this.closed) return;
      this.saving = true;
      try {
        if (this.$refs.schemaEditor && !this.$refs.schemaEditor.flushColumns()) { this.revealError(); return; }
        // 列名提交可能同时迁移数据，等新列身份和数据回显后再同步单元格，避免写回旧列名。
        await this.$nextTick();
        if (this.closed || this._isDestroyed) return;
        // 点击确定时输入框可能仍有焦点，先同步原始输入；等父子值回显后再做完整校验。
        if (this.$refs.valueEditor) this.$refs.valueEditor.flushInputs();
        await this.$nextTick();
        if (this.disabled || this.pending || this.resolved.error || this.closed || this._isDestroyed) return;
        this.submitted = true;
        const cellsValid = !this.$refs.valueEditor || this.$refs.valueEditor.validateForSubmit();
        const schema = getEffectiveSchema(this.pattern, { schema: this.schemaDraft });
        this.schemaError = validateDefaultSchema(schema, this.pattern.name, true) || '';
        if (!cellsValid || this.schemaError || validateDefaultConfig(this.pattern, this.configDraft)) { this.revealError(); return; }
        const next = cloneDefaultConfig(this.configDraft);
        next.schema = cloneJson(schema);
        // 唯一提交点：完整结构与真实 JSON 数据一起更新外层未保存表单。
        this.$emit('change', next);
        this.$emit('close');
      } catch (error) { this.schemaError = error.message; this.revealError(); } finally { this.saving = false; }
    },
    revealError() {
      this.$nextTick(() => {
        // 公共弹窗会将正文传送到 body，使用正文引用定位，不能从组件占位根节点查找。
        const element = this.$refs.editorContent && this.$refs.editorContent.querySelector('.text-error');
        if (element && element.scrollIntoView) element.scrollIntoView({ block: 'nearest' });
      });
    },
    requestReset() {
      if (this.disabled) return;
      this.pending = { reset: true, schema: cloneJson(this.declared), value: undefined, message: '将移除不兼容的默认值并按当前处理器恢复结构，之后可重新录入。' };
    },
    confirmPending() {
      if (this.disabled || !this.pending) return;
      const next = cloneDefaultConfig(this.configDraft);
      if (this.pending.value === undefined) {
        delete next.value;
        next.enabled = false;
      } else next.value = cloneJson(this.pending.value);
      this.configDraft = next;
      this.applyDraftSchema(this.pending.schema);
      this.pending = null;
      this.schemaError = '';
      this.schemaEditorKey++;
    },
    cancelPending() {
      if (!this.pending) return;
      this.pending = null;
      this.schemaError = '';
      this.schemaDraft = cloneJson(this.valueSchema);
      this.schemaEditorKey++;
    },
    closeDialog() {
      // 不向来源回写任何草稿，取消按钮、关闭图标行为一致。
      this.closed = true;
      this.$emit('close');
    }
  },
  computed: {
    resolved() { return resolveSchema(this.pattern, this.configDraft); },
    declared() { return getDeclaredSchema(this.pattern); },
    fixedStructure() { return !!this.declared.items; },
    subtitle() { return [this.pattern.mode === 'output' ? '输出参数' : '输入参数', this.pattern.description, '数组'].filter(Boolean).join(' · '); },
    usageDescription() {
      return this.pattern.mode === 'output'
        ? `当输出转换后的 JSON 对象结果中没有 ${this.pattern.name} 时，自动使用下方默认数据；已有值不会被覆盖，非对象结果不补齐。`
        : `当输入参数中没有 ${this.pattern.name} 时，自动使用下方默认数据；已有值不会被覆盖。`;
    },
    currentValue() { return isDefaultEnabled(this.configDraft) && hasOwn(this.configDraft, 'value') ? this.configDraft.value : undefined; },
    rowCount() { return Array.isArray(this.currentValue) ? this.currentValue.length : 0; },
    valueSchemaError() { return this.valueSchema ? validateDefaultSchema(this.valueSchema, this.pattern.name, true) : '请先配置数组元素类型'; },
    valueError() { return !this.submitted || this.valueSchemaError ? null : validateDefaultConfig(this.pattern, this.configDraft); }
  }
};
</script>
