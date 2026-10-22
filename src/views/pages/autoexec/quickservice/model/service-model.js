import utils from '@/resources/assets/js/util.js';
import { BUILTIN_DEFINITIONS } from '../components/combopconfig/fields/index.js';
import { initializeRuntimeValues } from '../components/combopconfig/fields/runtimeparam/index.js';
import { has, asMapping, isJobEditable } from '../components/combopconfig/mapping-rules.js';

export function initializeValues(service = {}, combop = {}, job = {}, scene = 'service-edit') {
  const config = service.config || {};
  const toolConfig = combop.config || {};
  const executeConfig = toolConfig.executeConfig || {};
  const values = {};
  BUILTIN_DEFINITIONS.forEach(definition => {
    const input = { config, toolConfig, executeConfig, job, scene, definition };
    const inherited = definition.getInheritedValue ? definition.getInheritedValue(input) : executeConfig[definition.key];
    let mapping = asMapping(has(config, definition.key) ? config[definition.key] : inherited, definition.defaultValue);
    if (scene === 'job-create' && has(job, definition.key)) {
      if (definition.getJobValue) mapping.value = utils.deepClone(definition.getJobValue({ ...input, mapping }));
      else if (isJobEditable({ ...definition, locked: false }, mapping)) mapping.value = utils.deepClone(job[definition.key]);
    }
    if (definition.normalizeMapping) mapping = definition.normalizeMapping(mapping, input);
    values[definition.key] = mapping;
  });
  return { ...values, ...initializeRuntimeValues(config, toolConfig.runtimeParamList, job, scene) };
}

/**
 * 参数面板共享的数据，同时保留组合工具顶层的能力标记（needProtocol 等）。
 * 参数业务规则在 combopconfig/fields/参数名/index.js 中维护，选项和编辑器配置在同目录的 index.vue 中维护。
 * @typedef {Object} ParameterContext
 * @property {Object} toolConfig 组合工具原始配置，参数定义按需读取
 * @property {Object} executeConfig 组合工具执行配置
 * @property {Object<string, Object>} values 当前参数映射，可用于参数联动
 * @property {Array} runtimeParamList 运行参数，供参数定义和映射控件共用
 * @property {Array} formFields 可映射的表单字段
 * @property {number|string} combopId 组合工具 ID
 * @property {string} formUuid 表单 UUID
 * @property {*} preCondition 当前前置条件
 */

/**
 * @param {Object} combop 组合工具详情
 * @param {Object<string, Object>} values 当前参数映射
 * @param {Object} service 服务数据
 * @param {Object} [options] 页面提供的共享状态，无需传入 Vue 实例
 * @param {Array} [options.formFields] 可映射的表单字段
 * @param {*} [options.preCondition] 编辑中的前置条件；undefined 时使用服务或工具配置
 * @returns {ParameterContext}
 */
export function parameterContext(combop, values, service, { formFields = [], preCondition } = {}) {
  const config = combop.config || {};
  const executeConfig = config.executeConfig || {};
  return {
    ...combop,
    combopId: service.combopId,
    formUuid: service.formUuid,
    values,
    toolConfig: config,
    executeConfig,
    runtimeParamList: config.runtimeParamList || [],
    preCondition: preCondition === undefined ? (has(service.config, 'preCondition') ? service.config.preCondition : executeConfig.preCondition) : preCondition,
    formFields
  };
}
