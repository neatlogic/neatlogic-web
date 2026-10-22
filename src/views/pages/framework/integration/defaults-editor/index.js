import { $t } from '@/resources/init.js';
// 类型与控件集中映射，主表和嵌套表格均复用同一组编辑器。
import { normalizeDefaultType } from '../integration-default-utils.js';

const editors = {
  string: () => import('./string-editor.vue'),
  number: () => import('./number-editor.vue'),
  int: () => import('./int-editor.vue'),
  boolean: () => import('./boolean-editor.vue'),
  // 保留参数类型标识，所有层级仍使用普通文本框；日期仅增加局部校验及清空语义。
  enum: () => import('./string-editor.vue'),
  date: () => import('./date-editor.vue'),
  array: () => import('./array-editor.vue'),
  object: () => import('./object-editor.vue')
};

export function getDefaultEditor(type) {
  return editors[normalizeDefaultType(type)];
}

// 子字段使用 JSON 文本框；顶层数组、对象继续保留原表格编辑器。
const jsonTextEditor = () => import('./json-editor.vue');
export function getValueEditor(type) {
  return ['array', 'object'].includes(normalizeDefaultType(type)) ? jsonTextEditor : getDefaultEditor(type);
}

export const defaultTypeList = [
  { textKey: 'term.framework.integrationdefault.string', value: 'string' },
  { textKey: 'page.number', value: 'number' },
  { textKey: 'term.plugin.int', value: 'int' },
  { textKey: 'term.framework.integrationdefault.boolean', value: 'boolean' },
  { textKey: 'page.enumerate', value: 'enum' },
  { textKey: 'page.date', value: 'date' },
  { textKey: 'page.object', value: 'object' },
  { textKey: 'term.framework.integrationdefault.array', value: 'array' }
];

// 仅限制默认值结构的新选择，完整类型表仍用于历史配置回显及原类型数据编辑。
export const selectableDefaultTypeList = defaultTypeList.filter(item => !['int', 'boolean'].includes(item.value));

// 翻译仅用于页面展示，稳定类型标识和保存配置不依赖语言。
export function translatedDefaultTypes(list = defaultTypeList) { return list.map(item => ({ ...item, text: $t(item.textKey) })); }
export function defaultTypeName(type, fallback = type) { const option = defaultTypeList.find(item => item.value === normalizeDefaultType(type)); return option ? $t(option.textKey) : fallback; }
