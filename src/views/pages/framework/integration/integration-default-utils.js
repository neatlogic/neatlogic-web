import moment from 'moment';

export const DEFAULT_DATE_ERROR = '日期必须符合 yyyy-MM、yyyy-MM-dd、yyyy-MM-dd HH:mm 或 yyyy-MM-dd HH:mm:ss，且为有效日期时间';
const DATE_FORMATS = ['YYYY-MM', 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'];

// 使用 UTC 只检查日历字段，不把无时区文本转换成本地时间；额外拒绝 Moment 接受的 24:00。
export function isValidDefaultDate(value) {
  return typeof value === 'string' && /^(?!0000)\d{4}-\d{2}(?:-\d{2}(?: (?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?)?)?$/.test(value) &&
    moment.utc(value, DATE_FORMATS, true).isValid();
}

const DEFAULT_TYPES = ['string', 'number', 'int', 'boolean', 'enum', 'date', 'array', 'object'];
const owns = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const required = schema => schema.isRequired === true || schema.isRequired === 1;
const paramPath = pattern => `${pattern.mode || '参数'}.${pattern.name || '未命名参数'}`;

// 草稿中的 undefined 与显式 null 不同；递归复制并保留该区别，避免编辑影响接口来源。
export function cloneJson(value) {
  if (Array.isArray(value)) return value.map(cloneJson);
  if (isObject(value)) {
    return Object.keys(value).reduce((result, key) => {
      Object.defineProperty(result, key, {value: cloneJson(value[key]), enumerable: true, writable: true, configurable: true});
      return result;
    }, {});
  }
  return value;
}

// 只清理结构节点的历史选项，不遍历默认值数据，业务对象中的 options 字段必须完整保留。
export function cloneSchemaWithoutOptions(schema) {
  if (!isObject(schema)) return cloneJson(schema);
  const copy = cloneJson(schema);
  delete copy.options;
  if (owns(copy, 'items')) copy.items = cloneSchemaWithoutOptions(copy.items);
  if (Array.isArray(copy.children)) copy.children = copy.children.map(cloneSchemaWithoutOptions);
  return copy;
}

export function cloneDefaultConfig(config) {
  const copy = cloneJson(config);
  if (isObject(copy) && owns(copy, 'schema')) copy.schema = cloneSchemaWithoutOptions(copy.schema);
  return copy;
}

// 与后端使用相同的类型别名，处理器规范和用户补充结构统一按这些类型校验。
export function normalizeDefaultType(type) {
  if (typeof type !== 'string') return type;
  const normalized = type.toLowerCase();
  return {jsonarray: 'array', jsonobject: 'object', integer: 'int', bool: 'boolean', double: 'number', float: 'number', long: 'number'}[normalized] || normalized;
}

export function isDefaultEnabled(config) {
  return !!config && (config.enabled === true || config.enabled === 1);
}

// 固定数组的 children 描述一行对象，不展开到主参数表，也不复制到自定义参数定义中。
export function getDeclaredSchema(pattern) {
  const schema = {type: normalizeDefaultType(pattern.type), name: pattern.name, isRequired: pattern.isRequired};
  if (Array.isArray(pattern.children) && pattern.children.length) {
    const children = pattern.children.filter(Boolean).map(getDeclaredSchema);
    if (schema.type === 'array') schema.items = {type: 'object', children};
    else schema.children = children;
  }
  return schema;
}

function fail(path, message) {
  throw new Error(`${path}：${message}`);
}

function checkNodeShape(schema, path) {
  if (!isObject(schema)) fail(path, '参数结构格式不正确');
  if (owns(schema, 'items') && !isObject(schema.items)) fail(path, '数组元素结构格式不正确');
  if (owns(schema, 'children') && !Array.isArray(schema.children)) fail(path, '对象列结构格式不正确');
}

function childrenByName(children, path) {
  const result = new Map();
  (children || []).forEach(child => {
    if (!isObject(child)) fail(path, '对象列结构格式不正确');
    if (typeof child.name !== 'string' || !child.name.trim() || result.has(child.name)) fail(path, '对象列名不能为空或重复');
    result.set(child.name, child);
  });
  return result;
}

function mergeSchema(declared, supplement, path) {
  if (supplement != null) checkNodeShape(supplement, path);
  if (!declared) return cloneJson(supplement || {});
  const merged = cloneJson(supplement || {});
  const type = normalizeDefaultType(declared.type);
  if (type) {
    if (supplement && supplement.type && type !== normalizeDefaultType(supplement.type)) fail(path, '参数结构已变化，请重新配置默认值');
    merged.type = type;
  }
  if (owns(declared, 'name')) merged.name = declared.name;
  if (declared.isRequired != null) {
    if (supplement && owns(supplement, 'isRequired') && required(declared) !== required(supplement)) fail(path, '固定字段的必填要求不能修改，请重新配置默认值');
    merged.isRequired = declared.isRequired;
  }
  if (declared.items) merged.items = mergeSchema(declared.items, supplement && supplement.items, `${path}[]`);
  if (declared.children && declared.children.length) {
    const customChildren = supplement && supplement.children;
    const additions = childrenByName(customChildren, path);
    // 保存的完整快照必须与固定列集合一致，用来识别规范新增或删除列。
    if (customChildren && additions.size !== declared.children.length) fail(path, '固定子字段结构已变化，请重新配置默认值');
    merged.children = declared.children.map(child => {
      const result = mergeSchema(child, additions.get(child.name), `${path}.${child.name}`);
      additions.delete(child.name);
      return result;
    });
    if (additions.size) fail(path, '固定子字段结构已变化，请重新配置默认值');
  }
  return merged;
}

// 补充结构仅完善处理器未声明的部分；历史枚举选项在副本中清理，不再影响合法字符串默认值。
export function getEffectiveSchema(pattern, defaultConfig = pattern.defaultConfig) {
  if (defaultConfig && owns(defaultConfig, 'schema') && !isObject(defaultConfig.schema)) fail(paramPath(pattern), '参数结构格式不正确');
  return mergeSchema(getDeclaredSchema(pattern), cloneSchemaWithoutOptions(defaultConfig && defaultConfig.schema), paramPath(pattern));
}

function checkSchema(schema, path, requireStructure) {
  checkNodeShape(schema, path);
  const type = normalizeDefaultType(schema.type);
  if (!DEFAULT_TYPES.includes(type)) fail(path, '请选择有效的数据类型或数组元素类型');
  if (type === 'array') {
    if (!schema.items) {
      if (requireStructure) fail(path, '请先配置数组元素结构');
      return;
    }
    checkSchema(schema.items, `${path}[]`, requireStructure);
  } else if (type === 'object') {
    if (!schema.children || !schema.children.length) {
      if (requireStructure) fail(path, '请先配置对象列结构');
      return;
    }
    // 子字段可直接输入 JSON；存在声明时继续校验结构，未声明部分仅检查容器类型。
    childrenByName(schema.children, path).forEach((child, name) => checkSchema(child, `${path}.${name}`, false));
  }
}

// 自由 JSON 仍必须是可序列化的有限值，避免 1e999 在 stringify 后悄悄变成 null。
function checkJsonValue(value, path) {
  if (typeof value === 'number' && !Number.isFinite(value)) fail(path, '必须为有限数字');
  if (value === undefined || (typeof value !== 'object' && !['string', 'number', 'boolean'].includes(typeof value))) fail(path, '必须为有效 JSON 值');
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) checkJsonValue(value[index], `${path} 第 ${index + 1} 项`);
  } else if (isObject(value)) Object.keys(value).forEach(key => checkJsonValue(value[key], `${path}.${key}`));
}

function checkValue(value, schema, path, nested = false, options = {}) {
  // 仅子字段允许缺省内部结构；主数组仍须先定义元素类型与对象列。
  checkSchema(schema, path, !nested);
  const type = normalizeDefaultType(schema.type);
  // 失焦只检查已填写值的类型；必填检查统一在完整提交时执行，递归子字段同样适用。
  const emptyText = ['string', 'enum', 'date'].includes(type) && typeof value === 'string' && !value.trim();
  if (!options.skipRequired && required(schema) && (value === undefined || emptyText)) fail(path, '必填字段未填写');
  if (options.skipRequired && value === undefined) return;
  switch (type) {
    case 'string':
    case 'enum':
    case 'date':
      // 文本保留真实字符串；日期额外检查格式和有效性，不在保存或运行时改写历史值。
      if (typeof value !== 'string') fail(path, '必须为字符串');
      if (type === 'date' && !isValidDefaultDate(value)) fail(path, DEFAULT_DATE_ERROR);
      break;
    case 'number':
    case 'int':
      if (typeof value !== 'number' || !Number.isFinite(value)) fail(path, '必须为有限数字');
      if (type === 'int' && !Number.isInteger(value)) fail(path, '必须为整数');
      break;
    case 'boolean':
      if (typeof value !== 'boolean') fail(path, '必须为布尔值 true 或 false');
      break;
    case 'array':
      if (!Array.isArray(value)) fail(path, '必须为数组');
      if (!schema.items) { checkJsonValue(value, path); break; }
      // 显式遍历索引，空洞或 undefined 元素不能在序列化为 null 后绕过校验。
      for (let index = 0; index < value.length; index++) {
        checkValue(value[index], schema.items, `${path} 第 ${index + 1} ${normalizeDefaultType(schema.items.type) === 'object' ? '行' : '项'}`, nested, options);
      }
      break;
    case 'object': {
      if (!isObject(value)) fail(path, '必须为对象');
      if (!schema.children || !schema.children.length) { checkJsonValue(value, path); break; }
      const columns = childrenByName(schema.children, path);
      columns.forEach((child, name) => {
        if (!owns(value, name) || value[name] === undefined) {
          if (!options.skipRequired && required(child)) fail(`${path}.${name}`, '必填字段未填写');
        } else checkValue(value[name], child, `${path}.${name}`, true, options);
      });
      Object.keys(value).forEach(key => {
        if (!columns.has(key)) fail(`${path}.${key}`, '字段不在已声明的对象列结构中');
      });
      break;
    }
  }
}

function errorMessage(callback) {
  try {
    callback();
    return null;
  } catch (error) {
    return error.message;
  }
}

// 编辑器和外层保存共用校验，返回可直接显示在行下方的中文错误，不修改传入结构。
export function validateDefaultSchema(schema, path = '参数', requireStructure = true) {
  return errorMessage(() => checkSchema(schema, path, requireStructure));
}

export function validateDefaultValue(value, schema, path = '参数', nested = false, options = {}) {
  return errorMessage(() => checkValue(value, schema, path, nested, options));
}

export function validateDefaultConfig(pattern, defaultConfig = pattern.defaultConfig, options = {}) {
  if (!isDefaultEnabled(defaultConfig)) return null;
  return errorMessage(() => {
    const path = paramPath(pattern);
    if (!owns(defaultConfig, 'value') || defaultConfig.value === undefined) fail(path, '已启用但未填写默认值');
    // 失焦检查可跳过必填，所有保存入口不传选项，继续执行完整检查。
    checkValue(defaultConfig.value, getEffectiveSchema(pattern, defaultConfig), path, false, options);
  });
}

// 固定默认值按处理器、方向、名称定位；取出的副本可供编辑，不污染保存来源或其他集成。
export function getBuiltinDefault(paramConfig, handler, pattern) {
  const entries = paramConfig && Array.isArray(paramConfig.builtinDefaultList) ? paramConfig.builtinDefaultList : [];
  const match = entries.find(entry => entry && entry.handler === handler && entry.mode === pattern.mode && entry.name === pattern.name);
  return match ? cloneDefaultConfig(match.defaultConfig) : undefined;
}

// 保存前也校验被合并去重遮蔽的自定义项；仅当前处理器的固定配置参与校验。
export function validateIntegrationDefaults(patterns, paramConfig, handler) {
  const fixed = (patterns || []).filter(Boolean);
  const definitions = new Set(fixed.map(pattern => JSON.stringify([pattern.mode, pattern.name])));
  const entries = paramConfig && Array.isArray(paramConfig.builtinDefaultList) ? paramConfig.builtinDefaultList : [];
  const seen = new Set();
  for (const entry of entries) {
    if (!handler || !entry || entry.handler !== handler) continue;
    const key = JSON.stringify([entry.mode, entry.name]);
    let message;
    if (seen.has(key)) message = `${paramPath(entry)}：固定参数默认值重复`;
    else if (isDefaultEnabled(entry.defaultConfig) && !definitions.has(key)) message = `${paramPath(entry)}：参数结构已变化，请重新配置默认值`;
    if (message) return {message, mode: entry.mode, name: entry.name};
    seen.add(key);
  }
  const custom = paramConfig && Array.isArray(paramConfig.paramList) ? paramConfig.paramList : [];
  for (let index = 0; index < custom.length; index++) {
    if (!custom[index]) continue;
    const message = validateDefaultConfig(custom[index]);
    if (message) return {message, mode: custom[index].mode, name: custom[index].name, index};
  }
  for (const pattern of fixed) {
    const defaults = getBuiltinDefault(paramConfig, handler, pattern);
    const message = validateDefaultConfig(pattern, defaults === undefined ? null : defaults);
    if (message) return {message, mode: pattern.mode, name: pattern.name};
  }
  return null;
}

// 仅主动录入或新增元素时使用初值；日期空输入保持未设置，数组空行须补填或删除。
export function createDefaultValue(schema) {
  switch (normalizeDefaultType(schema && schema.type)) {
    case 'string':
    case 'enum': return '';
    case 'date': return undefined;
    case 'number':
    case 'int': return 0;
    case 'boolean': return false;
    case 'array': return [];
    case 'object': return {};
    default: return undefined;
  }
}

// 摘要不使用真假值判断，空串、空数组、0、false 都是明确设置的值。
export function summarizeDefault(value, enabled) {
  if (enabled !== true && enabled !== 1) return '未设置';
  if (value === undefined) return '未设置';
  if (Array.isArray(value)) return `已设置 ${value.length} 行`;
  if (isObject(value)) return `已设置 ${Object.keys(value).length} 个字段`;
  if (value === '') return '空字符串';
  return String(value);
}
