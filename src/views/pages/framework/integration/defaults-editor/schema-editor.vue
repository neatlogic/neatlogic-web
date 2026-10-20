<template>
  <div>
    <!-- 根参数名已在弹窗标题显示；仅进入兼容子级视图时保留路径和返回。 -->
    <div v-if="steps.length" class="flex-between mb-sm">
      <span>{{ location }}</span>
      <span v-if="steps.length" class="text-href" @click="steps.pop()">返回上一级结构</span>
    </div>
    <!-- 数组类型已由参数定义确定，不重复显示类型；对象子级仍保留原类型设置。 -->
    <div v-if="current.type !== 'array'" class="mb-sm" data-schema-type>
      <span>类型</span>
      <TsFormSelect
        :value="current.type"
        :dataList="types"
        :disabled="disabled || !!declaredCurrent.type"
        :clearable="false"
        :transfer="true"
        @change="changeType"
      ></TsFormSelect>
    </div>
    <!-- 使用公共表单项横向排列标签与控件，不改变结构草稿和固定字段权限。 -->
    <TsFormItem
      v-if="current.type === 'array'"
      label="元素类型"
      labelPosition="left"
      :labelWidth="80"
      labelAlign="center"
      class="mb-sm"
      data-array-element-type
    >
      <!-- 历史嵌套数组保持只读回显，不因隐藏类型行而改变已保存的结构和值。 -->
      <div v-if="current.items && current.items.type === 'array'">数组</div>
      <!-- 选择框与表格控件同为 9em，避免随弹窗剩余空间拉伸；标签仍保持左侧 80px。 -->
      <div v-else style="width: 9em; min-width: 9em; max-width: 9em" data-array-element-control>
        <TsFormSelect
          :value="current.items && current.items.type"
          :dataList="itemTypes"
          :disabled="disabled || !!declaredCurrent.items"
          :clearable="false"
          :transfer="true"
          @change="changeItemType"
        ></TsFormSelect>
      </div>
      <span
        v-if="current.items && current.items.type === 'array'"
        class="text-href"
        :class="{ disable: disabled }"
        @click="enter(['items'], '数组元素')"
      >子级设置</span>
    </TsFormItem>
    <ColumnsEditor
      v-if="columnSchema"
      ref="columnsEditor"
      :columns="columnSchema.children || []"
      :fixedColumns="declaredColumnSchema.children || []"
      :disabled="disabled"
      :readonlyFixed="readonlyFixed"
      :columnKeys="columnKeys"
      @change="changeColumns"
      @identities="$emit('identities', $event)"
    ></ColumnsEditor>
  </div>
</template>
<script>
import ColumnsEditor from './columns-editor.vue';
import { defaultTypeList } from './index.js';
import { getAtPath, setAtPath, hasOwn } from './editor-utils.js';

// 对象元素与所属数组同页显示；兼容旧导航路径时合并元素层，返回不落入多余的对象页面。
function inlineObjectSteps(schema, steps) {
  const result = [];
  let prefix = [];
  let absolute = [];
  steps.forEach(step => {
    const path = [...prefix, ...step.path];
    const target = [...absolute, ...path];
    const node = getAtPath(schema, target);
    if (target[target.length - 1] === 'items' && node && node.type === 'object') {
      prefix = path;
    } else {
      result.push({ path, label: step.label });
      absolute = target;
      prefix = [];
    }
  });
  return result;
}
export default {
  components: {
    ColumnsEditor,
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue')
  },
  props: {
    schema: { type: Object, required: true },
    declared: { type: Object, default: () => ({}) },
    initialSteps: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    readonlyFixed: { type: Boolean, default: false },
    path: { type: String, default: '' },
    columnKeys: { type: Object, default: () => ({}) }
  },
  data() { return { steps: inlineObjectSteps(this.schema, this.initialSteps) }; },
  methods: {
    changeProperty(key, value) {
      if (!this.disabled) this.$emit('change', setAtPath(this.schema, [...this.nodePath, key], value));
    },
    flushColumns() {
      return !this.$refs.columnsEditor || this.$refs.columnsEditor.flushColumns();
    },
    changeColumns(columns, metadata) {
      // 只改变字段的实际存储路径，对象数组仍使用 items.children，不复制为顶层字段。
      if (!this.disabled) this.$emit('change', setAtPath(this.schema, [...this.nodePath, ...this.columnPath, 'children'], columns), { ...metadata, path: [...this.nodePath, ...this.columnPath, 'children'] });
    },
    changeType(type) {
      // 子级结构视图也不能绕过元素类型限制，已有嵌套数组保持只读。
      if (this.disabled || this.declaredCurrent.type || this.legacyArrayElement || (this.isArrayElement && type === 'array')) return;
      const replacement = { type };
      if (hasOwn(this.current, 'name')) replacement.name = this.current.name;
      if (hasOwn(this.current, 'isRequired')) replacement.isRequired = this.current.isRequired;
      this.$emit('change', setAtPath(this.schema, this.nodePath, replacement));
    },
    changeItemType(type) {
      if (this.disabled || this.declaredCurrent.items || (this.current.items && this.current.items.type === 'array') || !this.itemTypes.some(item => item.value === type)) return;
      this.changeProperty('items', { type });
    },
    enter(path, label) {
      if (!this.disabled) this.steps.push({ path, label });
    },
    enterColumn(index) {
      // 内联字段一次进入目标层，返回时直接回到所属数组及其字段表格。
      this.enter([...this.columnPath, 'children', index], this.columnSchema.children[index].name || `第 ${index + 1} 列`);
    }
  },
  computed: {
    // 只限制数组直接包含数组；对象字段和主参数仍使用完整类型列表。
    itemTypes() { return defaultTypeList.filter(item => item.value !== 'array'); },
    types() { return this.isArrayElement ? this.itemTypes : defaultTypeList; },
    isArrayElement() { return this.nodePath[this.nodePath.length - 1] === 'items'; },
    legacyArrayElement() { return this.isArrayElement && this.current.type === 'array'; },
    nodePath() { return this.steps.reduce((result, step) => result.concat(step.path), []); },
    current() { return getAtPath(this.schema, this.nodePath) || {}; },
    declaredCurrent() { return getAtPath(this.declared, this.nodePath) || {}; },
    columnPath() { return this.current.type === 'array' ? ['items'] : []; },
    columnSchema() {
      if (this.current.type === 'object') return this.current;
      return this.current.type === 'array' && this.current.items && this.current.items.type === 'object' ? this.current.items : null;
    },
    declaredColumnSchema() { return getAtPath(this.declaredCurrent, this.columnPath) || {}; },
    location() { return [this.path, ...this.steps.map(step => step.label)].filter(Boolean).join(' → '); }
  }
};
</script>
