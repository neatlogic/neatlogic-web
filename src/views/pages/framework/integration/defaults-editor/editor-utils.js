import { $t } from '@/resources/init.js';
import isEqual from 'lodash/isEqual';
import { cloneJson, normalizeDefaultType, getDeclaredSchema, getEffectiveSchema, validateDefaultValue } from '../integration-default-utils.js';

export const hasOwn = (value, name) => value != null && Object.prototype.hasOwnProperty.call(value, name);
export const isComplex = schema => ['array', 'object'].includes(normalizeDefaultType(schema.type));

// 默认值配置属于集成表单，处理器提供的原始定义始终保持只读。
export function resolveSchema(pattern, config) {
  try {
    return { schema: getEffectiveSchema(pattern, config), error: '' };
  } catch (error) {
    return { schema: getDeclaredSchema(pattern), error: error.message };
  }
}

export function getAtPath(value, path) {
  return path.reduce((node, key) => (node != null && hasOwn(node, key) ? node[key] : undefined), value);
}

export function setAtPath(source, path, value) {
  if (!path.length) return cloneJson(value);
  // 用户显式编辑空对象的子字段时建立父容器，避免旧配置中的 null 导致编辑器异常。
  const result = source !== null && typeof source === 'object' ? cloneJson(source) : (typeof path[0] === 'number' ? [] : {});
  let node = result;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!hasOwn(node, key) || node[key] === null || typeof node[key] !== 'object') {
      Object.defineProperty(node, key, { value: typeof path[i + 1] === 'number' ? [] : {}, enumerable: true, configurable: true, writable: true });
    }
    node = node[key];
  }
  const key = path[path.length - 1];
  if (value === undefined) delete node[key];
  else Object.defineProperty(node, key, { value: cloneJson(value), enumerable: true, configurable: true, writable: true });
  return result;
}

// 转换和清理分别记录：转换成功也要回写值，但不能触发清理确认。
function migrated(value, changed, validatePaths = []) {
  return validatePaths.length ? {value, changed, validatePaths} : {value, changed};
}

export function reconcileValue(value, previous, next) {
  if (value === undefined) return { value, changed: false };
  // 无关字段的非法输入也是用户草稿，修改另一字段类型时不得顺带清理或重置提示。
  if (isEqual(previous, next)) return {value: cloneJson(value), changed: false};
  const type = normalizeDefaultType(next.type);
  const oldType = normalizeDefaultType(previous && previous.type);
  const typeChanged = oldType !== type;
  const paths = typeChanged ? [[]] : [];
  if (typeChanged && ['string', 'enum', 'date'].includes(oldType) && typeof value === 'string') {
    const text = value.trim();
    if (['number', 'int'].includes(type)) {
      // 不使用 Number('') 或进制字符串的宽松解析，精度仍沿用现有数字控件。
      const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text) ? Number(text) : NaN;
      return migrated(Number.isFinite(numeric) && (type !== 'int' || Number.isInteger(numeric)) ? numeric : undefined,
        !Number.isFinite(numeric) || (type === 'int' && !Number.isInteger(numeric)), paths);
    }
    if (type === 'boolean') return migrated(text === '' ? undefined : text === 'true' ? true : text === 'false' ? false : value, false, paths);
    if (type === 'date') return migrated(text ? value : undefined, false, paths);
  }
  if (typeChanged && ['number', 'int', 'boolean'].includes(oldType) && ['number', 'boolean'].includes(typeof value) &&
      ['string', 'enum', 'date'].includes(type)) return migrated(String(value), false, paths);
  if (type === 'array' && Array.isArray(value)) {
    if (next.items) {
      let changed = false;
      const validatePaths = [];
      const rows = value.map((row, index) => {
        const result = reconcileValue(row, previous && previous.items, next.items);
        changed = changed || result.changed;
        validatePaths.push(...(result.validatePaths || []).map(path => [index, ...path]));
        // 不兼容元素保留为空行，不能过滤或写成 null；补填或手动删行后才能保存。
        return result.value;
      });
      return migrated(rows, changed, validatePaths);
    }
  }
  if (type === 'object' && value && !Array.isArray(value) && typeof value === 'object') {
    if (next.children && next.children.length) {
      const result = {};
      let changed = false;
      const validatePaths = [];
      Object.keys(value).forEach(name => {
        const oldColumn = ((previous && previous.children) || []).find(child => child.name === name);
        const newColumn = next.children.find(child => child.name === name);
        if (!newColumn) {
          changed = true;
          return;
        }
        const child = reconcileValue(value[name], oldColumn, newColumn);
        changed = changed || child.changed;
        validatePaths.push(...(child.validatePaths || []).map(path => [name, ...path]));
        if (child.value !== undefined) Object.defineProperty(result, name, { value: child.value, enumerable: true, configurable: true, writable: true });
      });
      return migrated(result, changed, validatePaths);
    }
  }
  if (!typeChanged && !['array', 'object'].includes(type)) return {value: cloneJson(value), changed: false};
  // 子字段无内部声明时仅检查容器和 JSON 有效性；顶层缺结构仍由完整提交校验拦截。
  return validateDefaultValue(value, next, $t('page.param'), true, {skipRequired: true})
    ? migrated(undefined, true, paths)
    : migrated(cloneJson(value), false, paths);
}

// 列名和删除操作按页面字段身份迁移真实值，交换名称也必须从同一份旧快照取值。
export function migrateColumnValue(value, schema, childrenPath, fields, removedNames = []) {
  if (value === undefined || value === null) return cloneJson(value);
  const nodePath = childrenPath.slice(0, -1);
  function migrate(current, currentSchema, path) {
    if (current === undefined || current === null) return cloneJson(current);
    if (!path.length) {
      if (typeof current !== 'object' || Array.isArray(current)) return cloneJson(current);
      const result = cloneJson(current);
      [...removedNames, ...fields.map(field => field.previousName).filter(name => name !== null)].forEach(name => { delete result[name]; });
      fields.forEach(field => {
        if (field.previousName !== null && hasOwn(current, field.previousName)) {
          Object.defineProperty(result, field.name, { value: cloneJson(current[field.previousName]), enumerable: true, configurable: true, writable: true });
        }
      });
      return result;
    }
    if (path[0] === 'items' && Array.isArray(current)) return current.map(item => migrate(item, currentSchema.items || {}, path.slice(1)));
    if (path[0] === 'children' && currentSchema.children && path.length >= 2) {
      const column = currentSchema.children[path[1]];
      if (column && hasOwn(current, column.name)) return setAtPath(current, [column.name], migrate(current[column.name], column, path.slice(2)));
    }
    return cloneJson(current);
  }
  return migrate(value, schema, nodePath);
}
