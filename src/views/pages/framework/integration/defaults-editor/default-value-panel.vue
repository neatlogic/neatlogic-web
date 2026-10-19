<template>
  <div :class="{ 'padding border radius-md bg-block': !isArray }">
    <!-- 数组复用值表格自身容器，去除外层重复背景、边框和留白；非数组沿用原布局。 -->
    <div v-if="!isArray" class="flex-between mb-sm">
      <strong>{{ activeView === 'schema' ? '结构设置' : '默认值设置' }}：{{ pattern.name }}</strong>
      <span class="text-href" @click="closePanel">收起</span>
    </div>
    <div v-if="resolved.error" class="mb-sm">
      <div class="text-error">{{ resolved.error }}，请重新配置。</div>
      <span class="text-href" :class="{ disable: disabled }" @click="requestReset">按当前规范重新配置</span>
    </div>
    <template v-if="activeView === 'schema'">
      <SchemaEditor
        v-if="schemaDraft"
        :key="schemaEditorKey"
        :schema="schemaDraft"
        :declared="declared"
        :initialSteps="schemaSteps"
        :disabled="disabled || !!pending"
        :path="pattern.name"
        @change="changeSchemaDraft"
      ></SchemaEditor>
      <div v-if="schemaError" class="text-error mt-sm">{{ schemaError }}</div>
      <div class="action-group mt-sm">
        <span class="action-item text-href" :class="{ disable: disabled || !!pending }" @click="saveSchema">确定结构</span>
        <span class="action-item text-href" @click="cancelSchema">取消</span>
      </div>
    </template>
    <template v-else>
      <div v-if="!isArray" class="flex-between mb-sm">
        <span class="text-tip">{{ summary }}</span>
        <div v-if="isComplex(currentSchema)" class="action-group">
          <span class="action-item text-href" :class="{ disable: disabled }" @click="beginSchema">结构设置</span>
        </div>
      </div>
      <div v-if="!isArray || steps.length" class="flex-between mb-sm">
        <span>{{ currentPath }}</span>
        <span v-if="steps.length" class="text-href" @click="steps.pop()">返回上一级</span>
      </div>
      <component
        :is="editor"
        :key="currentSchemaPath.join('/')"
        :value="currentValue"
        :schema="currentSchema"
        :disabled="disabled || !!resolved.error"
        :path="currentPath"
        @change="changeCurrentValue"
        @navigate="navigate"
      ></component>
      <div v-if="valueError" class="text-error mt-sm">{{ valueError }}</div>
    </template>
    <div v-if="pending" class="border-warning padding mt-sm">
      <div class="text-warning">{{ pending.message }}</div>
      <div class="action-group mt-xs">
        <span class="action-item text-href" :class="{ disable: disabled }" @click="confirmPending">清空受影响的值并应用</span>
        <span class="action-item text-href" @click="cancelPending">取消变更</span>
      </div>
    </div>
  </div>
</template>
<script>
import SchemaEditor from './schema-editor.vue';
import { getDefaultEditor } from './index.js';
import SchemaEditorBase from './schema-editor-base.js';
import { hasOwn, getAtPath, setAtPath, isComplex } from './editor-utils.js';
import { cloneJson, cloneDefaultConfig, summarizeDefault, validateDefaultConfig, isDefaultEnabled } from '../integration-default-utils.js';
export default {
  components: { SchemaEditor },
  extends: SchemaEditorBase,
  props: {
    view: { type: String, default: 'value' }
  },
  data() {
    return { activeView: 'value', steps: [] };
  },
  created() {
    if (this.view === 'schema') this.beginSchema();
  },
  methods: {
    isComplex,
    changeCurrentValue(value) {
      if (this.disabled || this.resolved.error) return;
      const next = cloneDefaultConfig(this.config || {});
      if (!hasOwn(next, 'schema')) next.schema = cloneJson(this.resolved.schema);
      // 首次实际编辑才创建容器；旧版关闭的草稿不应随新输入一起重新启用。
      const updated = setAtPath(this.enabled ? next.value : undefined, this.currentValuePath, value);
      next.enabled = updated !== undefined;
      if (updated === undefined) delete next.value;
      else next.value = updated;
      this.emitConfig(next);
    },
    navigate(step) {
      if (this.disabled || this.resolved.error) return;
      // 打开子级只是切换视图，不创建默认值；实际新增行或输入时再写回配置。
      this.steps.push(step);
    },
    beginSchema() {
      if (this.disabled) return;
      const steps = this.steps.map(step => ({ path: step.schemaPath, label: step.label }));
      // 数组及其子级统一交给外层弹窗，保留默认值区域的当前导航位置。
      if (this.declared.type === 'array') {
        this.$emit('open-schema', steps);
        return;
      }
      this.beginSchemaDraft(steps);
      this.activeView = 'schema';
    },
    finishSchema() {
      this.steps = [];
      this.activeView = 'value';
    },
    cancelSchema() {
      this.cancelSchemaDraft();
      this.activeView = 'value';
    },
    requestReset() {
      if (this.disabled) return;
      if (this.declared.type === 'array') this.$emit('open-schema', []);
      else SchemaEditorBase.methods.requestReset.call(this);
    },
    closePanel() {
      // 收起结构设置相当于取消草稿，值编辑则已经同步到外层未保存的表单。
      this.cancelSchema();
      this.$emit('close');
    }
  },
  computed: {
    isArray() { return this.declared.type === 'array'; },
    enabled() { return isDefaultEnabled(this.config); },
    summary() { return this.enabled ? summarizeDefault(this.config.value, true) : '未设置'; },
    currentValuePath() { return this.steps.reduce((path, step) => path.concat(step.valuePath), []); },
    currentSchemaPath() { return this.steps.reduce((path, step) => path.concat(step.schemaPath), []); },
    currentValue() { return getAtPath(this.enabled ? this.config.value : undefined, this.currentValuePath); },
    currentSchema() { return getAtPath(this.resolved.schema, this.currentSchemaPath) || {}; },
    currentPath() { return [this.pattern.name, ...this.steps.map(step => step.label)].join(' → '); },
    editor() { return getDefaultEditor(this.currentSchema.type); },
    valueError() { return validateDefaultConfig(this.pattern, this.config); }
  },
  watch: {
    view(value) {
      if (value === 'schema') this.beginSchema();
      else this.cancelSchema();
    }
  }
};
</script>
