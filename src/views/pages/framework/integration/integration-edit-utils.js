import isEqual from 'lodash/isEqual';
import {cloneParamConfig} from './integration-param-utils.js';
import {cloneJson, getEffectiveSchema, isDefaultEnabled, normalizeDefaultType} from './integration-default-utils.js';

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

// 仅清理定义层的页面身份，不进入 defaultConfig.value，业务 JSON 中的同名键必须保留。
function schemaSnapshot(schema) {
  if (!object(schema)) return cloneJson(schema);
  const result = cloneJson(schema);
  delete result.uuid;
  delete result._integrationParamKey;
  delete result.typeName;
  delete result.options;
  result.type = normalizeDefaultType(result.type);
  result.isRequired = result.isRequired === true || result.isRequired === 1 ? 1 : 0;
  if (Array.isArray(result.children)) result.children = result.children.map(schemaSnapshot);
  if (hasOwn(result, 'items')) result.items = schemaSnapshot(result.items);
  return result;
}

function defaultSnapshot(config, pattern) {
  const source = object(config) ? config : {};
  const result = {...cloneJson(source), enabled: isDefaultEnabled(source)};
  if (pattern) {
    // 输入会补充完整结构快照，等效声明不能把“改回原值”误判为修改；非法结构仍原样参与比较。
    try { result.schema = schemaSnapshot(getEffectiveSchema(pattern, source)); } catch (error) { result.schema = schemaSnapshot(source.schema); }
  } else if (hasOwn(source, 'schema')) result.schema = schemaSnapshot(source.schema);
  return result;
}

function paramSnapshot(param, patterns, handler) {
  const result = cloneParamConfig(param);
  result.paramList = result.paramList.map(item => {
    if (!object(item)) return item;
    const copy = schemaSnapshot(item);
    copy.isSearchAble = item.isSearchAble === true || item.isSearchAble === 1 ? 1 : 0;
    copy.defaultConfig = defaultSnapshot(item.defaultConfig, item);
    return copy;
  });
  result.builtinDefaultList = (result.builtinDefaultList || []).map(entry => {
    if (!object(entry)) return entry;
    const pattern = entry.handler === handler && patterns.find(item => item.mode === entry.mode && item.name === entry.name);
    return {...entry, defaultConfig: defaultSnapshot(entry.defaultConfig, pattern)};
  }).filter(entry => {
    if (!object(entry)) return true;
    const pattern = entry.handler === handler && patterns.find(item => item.mode === entry.mode && item.name === entry.name);
    // 从未设置的固定值清空后可能留下空配置；有禁用草稿值或自定义结构时绝不能忽略。
    return !pattern || !isEqual(entry.defaultConfig, defaultSnapshot(undefined, pattern));
  });
  return result;
}

export function integrationEditSnapshot(integration, patterns = []) {
  const source = integration || {};
  const config = source.config || {};
  const auth = config.authentication || {};
  const other = cloneJson(config.other || {});
  // 其他设置表单会补齐未配置的空项；只规范这些控件，不改写任何默认值数据。
  ['connectTimeout', 'readTimeout', 'rateLimitIntervalSeconds', 'rateLimitCount', 'charset'].forEach(key => {
    if (other[key] === '' || other[key] == null) delete other[key];
  });
  return {
    name: source.name == null ? null : source.name,
    handler: source.handler == null ? null : source.handler,
    method: source.method == null ? null : source.method,
    url: source.url == null ? null : source.url,
    config: {
      authentication: {...cloneJson(auth), type: auth.type || 'noauth', config: cloneJson(auth.config || {})},
      param: paramSnapshot(config.param, patterns, source.handler),
      head: cloneJson(config.head || []),
      input: {...cloneJson(config.input || {}), content: (config.input && config.input.content) || ''},
      output: {...cloneJson(config.output || {}), content: (config.output && config.output.content) || ''},
      other
    }
  };
}

export function hasIntegrationEditChanges(initial, current, initialPatterns = [], currentPatterns = initialPatterns) {
  return !isEqual(integrationEditSnapshot(initial, initialPatterns), integrationEditSnapshot(current, currentPatterns));
}
