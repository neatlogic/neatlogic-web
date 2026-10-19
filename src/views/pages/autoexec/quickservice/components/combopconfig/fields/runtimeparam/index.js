import utils from '@/resources/assets/js/util.js';
import { has } from '../../mapping-rules.js';

function defaultValueByType(type) {
  if (['node', 'userselect', 'multiselect', 'checkbox', 'runnergrouptag'].includes(type)) return [];
  if (type === 'switch') return false;
  if (type === 'account') return null;
  return '';
}

function initializeRuntimeValue(param, saved, job, scene) {
  const defaultValue = () => has(param, 'defaultValue') ? utils.deepClone(param.defaultValue) : defaultValueByType(param.type);
  const mapping = saved ? utils.deepClone(saved) : { mappingMode: 'constant', value: defaultValue() };
  if (mapping.mappingMode === 'isempty') mapping.value = '';
  if (scene === 'job-create' && mapping.mappingMode === 'notsetup') {
    mapping.value = has(job.runtimeParamMap, param.key) ? utils.deepClone(job.runtimeParamMap[param.key]) : defaultValue();
  }
  return mapping;
}

export function initializeRuntimeValues(config, runtimeParamList, job, scene) {
  const saved = Object.fromEntries((config.runtimeParamList || []).map(p => [p.key, p]));
  return Object.fromEntries((runtimeParamList || []).map(param => [
    `runtime:${param.key}`, initializeRuntimeValue(param, saved[param.key], job, scene)
  ]));
}

export function createRuntimeDefinitions(context) {
  return (context.runtimeParamList || []).map(param => ({
    key: `runtime:${param.key}`,
    paramKey: param.key,
    name: param.name,
    labelText: param.name,
    group: 'jobParam',
    dynamic: true,
    type: param.type,
    required: !!param.isRequired,
    locked: param.editable === false || param.editable === 0,
    defaultValue: utils.deepClone(param.defaultValue !== undefined ? param.defaultValue : defaultValueByType(param.type))
  }));
}
