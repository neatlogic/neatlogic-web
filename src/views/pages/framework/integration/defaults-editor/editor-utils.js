import { cloneJson, normalizeDefaultType, getDeclaredSchema, getEffectiveSchema } from '../integration-default-utils.js';

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

// 结构改变时逐行清理受影响字段；统一结构会作用于所有行，不能只清理当前进入的行。
export function reconcileValue(value, previous, next) {
  if (value === undefined) return { value, changed: false };
  const type = normalizeDefaultType(next.type);
  if (normalizeDefaultType(previous.type) !== type) return { value: undefined, changed: true };
  // 历史枚举选项清理不属于类型变更，合法文本不得随结构迁移被清空。
  if (type === 'array' && Array.isArray(value)) {
    // 自由 JSON 子字段没有补充元素定义时，保存原结构不能清空其已有值。
    if (!previous.items && !next.items) return { value: cloneJson(value), changed: false };
    if (!previous.items || !next.items || normalizeDefaultType(previous.items.type) !== normalizeDefaultType(next.items.type)) {
      return { value: [], changed: value.length > 0 };
    }
    let changed = false;
    const rows = value.map(row => {
      const result = reconcileValue(row, previous.items, next.items);
      changed = changed || result.changed;
      return result.value;
    });
    return { value: rows, changed };
  }
  if (type === 'object' && value && !Array.isArray(value) && typeof value === 'object') {
    if (!(previous.children || []).length && !(next.children || []).length) return { value: cloneJson(value), changed: false };
    const result = {};
    let changed = false;
    Object.keys(value).forEach(name => {
      const oldColumn = (previous.children || []).find(child => child.name === name);
      const newColumn = (next.children || []).find(child => child.name === name);
      if (!oldColumn || !newColumn) {
        changed = true;
        return;
      }
      const child = reconcileValue(value[name], oldColumn, newColumn);
      changed = changed || child.changed;
      if (child.value !== undefined) Object.defineProperty(result, name, { value: child.value, enumerable: true, configurable: true, writable: true });
    });
    return { value: result, changed };
  }
  return { value: cloneJson(value), changed: false };
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
