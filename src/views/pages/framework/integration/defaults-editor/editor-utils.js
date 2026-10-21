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

// 按新结构逐值判断，不按类型名称清空；必填仍留给确定时检查，不隐式转换真实 JSON 类型。
export function reconcileValue(value, previous, next) {
  if (value === undefined) return { value, changed: false };
  // 无关字段的非法输入也是用户草稿，修改另一字段类型时不得顺带清理或重置提示。
  if (isEqual(previous, next)) return {value: cloneJson(value), changed: false};
  const type = normalizeDefaultType(next.type);
  if (type === 'array' && Array.isArray(value)) {
    if (next.items) {
      let changed = false;
      const rows = value.map(row => {
        const result = reconcileValue(row, previous && previous.items, next.items);
        changed = changed || result.changed;
        // 不兼容元素保留为空行，不能过滤或写成 null；补填或手动删行后才能保存。
        return result.value;
      });
      return { value: rows, changed };
    }
  }
  if (type === 'object' && value && !Array.isArray(value) && typeof value === 'object') {
    if (next.children && next.children.length) {
      const result = {};
      let changed = false;
      Object.keys(value).forEach(name => {
        const oldColumn = ((previous && previous.children) || []).find(child => child.name === name);
        const newColumn = next.children.find(child => child.name === name);
        if (!newColumn) {
          changed = true;
          return;
        }
        const child = reconcileValue(value[name], oldColumn, newColumn);
        changed = changed || child.changed;
        if (child.value !== undefined) Object.defineProperty(result, name, { value: child.value, enumerable: true, configurable: true, writable: true });
      });
      return { value: result, changed };
    }
  }
  // 子字段无内部声明时仅检查容器和 JSON 有效性；顶层缺结构仍由完整提交校验拦截。
  return validateDefaultValue(value, next, '参数', true, {skipRequired: true})
    ? { value: undefined, changed: true }
    : { value: cloneJson(value), changed: false };
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
