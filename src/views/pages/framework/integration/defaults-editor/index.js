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
  { text: '字符串', value: 'string' },
  { text: '数字', value: 'number' },
  { text: '整数', value: 'int' },
  { text: '布尔', value: 'boolean' },
  { text: '枚举', value: 'enum' },
  { text: '日期', value: 'date' },
  { text: '对象', value: 'object' },
  { text: '数组', value: 'array' }
];

// 仅限制默认值结构的新选择，完整类型表仍用于历史配置回显及原类型数据编辑。
export const selectableDefaultTypeList = defaultTypeList.filter(item => !['int', 'boolean'].includes(item.value));
