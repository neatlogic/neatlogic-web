import utils from '@/resources/assets/js/util.js';
import { has, cleanMapping, isJobEditable } from '../components/combopconfig/mapping-rules.js';

export function cleanFormMappings(values, formFields = [], hasForm = false) {
  const validIds = new Set(formFields.map(field => field.uuid));
  const next = utils.deepClone(values);
  Object.keys(next).forEach(key => {
    if (next[key].mappingMode === 'formattr' && (!hasForm || !validIds.has(next[key].value))) next[key] = { mappingMode: 'constant', value: null };
  });
  return next;
}

export function toServicePayload(basic, values, definitions, { id = '', parentId = 0, preCondition, preConditionChanged = false } = {}) {
  const result = { ...utils.deepClone(basic), type: 'service', id, parentId, config: { runtimeParamList: [] } };
  delete result.citeForm;
  definitions.forEach(definition => {
    const mapping = values[definition.key];
    if (!mapping || mapping.mappingMode === 'runtimeparam') return;
    if (definition.dynamic) {
      result.config.runtimeParamList.push({ ...cleanMapping(mapping), name: definition.name, type: definition.type, key: definition.paramKey });
    } else {
      result.config[definition.key] = definition.toServiceValue ? definition.toServiceValue(mapping) : cleanMapping(mapping);
    }
  });
  if (preConditionChanged) result.config.preCondition = utils.deepClone(preCondition);
  return result;
}

export function toJobPayload(service, draft, values, definitions, options = {}) {
  const result = { serviceId: service.id, name: draft.name, runtimeParamMap: {} };
  definitions.forEach(definition => {
    const mapping = values[definition.key];
    if (!mapping || !isJobEditable(definition, mapping)) return;
    if (definition.dynamic) result.runtimeParamMap[definition.paramKey] = utils.deepClone(mapping.value);
    else result[definition.key] = definition.toJobValue ? definition.toJobValue(mapping) : utils.deepClone(mapping.value);
  });
  if (service.formUuid) {
    result.formAttributeDataList = utils.deepClone(options.formAttributeDataList || draft.formAttributeDataList || []);
    result.hidecomponentList = utils.deepClone(options.hidecomponentList || []);
    result.readcomponentList = utils.deepClone(options.readcomponentList || []);
  }
  if (has(options, 'planStartTime')) result.planStartTime = options.planStartTime;
  if (has(options, 'triggerType')) result.triggerType = options.triggerType;
  return result;
}
