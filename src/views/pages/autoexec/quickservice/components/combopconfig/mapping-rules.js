import { $t } from '@/resources/init.js';
import utils from '@/resources/assets/js/util.js';

export const MAPPING_MODES = Object.freeze({
  CONSTANT: 'constant',
  FORM: 'formattr',
  UNSET: 'notsetup',
  EMPTY: 'isempty',
  RUNTIME: 'runtimeparam'
});

export const MAPPING_LABELS = Object.freeze({
  constant: $t('page.constant'),
  formattr: $t('page.form'),
  notsetup: $t('page.notsetting'),
  isempty: $t('term.expression.empty'),
  runtimeparam: $t('term.autoexec.jobparam')
});

export const MAPPING_DESCRIPTIONS = Object.freeze({
  constant: $t('term.autoexec.mappingconstantdesc'),
  formattr: $t('term.autoexec.mappingformdesc'),
  notsetup: $t('term.autoexec.mappingunsetdesc'),
  isempty: $t('term.autoexec.mappingemptydesc')
});

export function mappingOptions(definition, context) {
  const modes = ['constant'];
  if (definition.dynamic && !definition.required) modes.push('isempty');
  modes.push(context.formUuid ? 'formattr' : 'notsetup');
  return modes;
}

export function isJobEditable(definition, mapping) {
  return !definition.locked && (mapping.mappingMode === 'notsetup' || (!!definition.allowJobOverride && mapping.mappingMode === 'constant'));
}

export function isRequired(definition, mapping, scene) {
  if (scene === 'readonly') return false;
  if (scene === 'job-create') return isJobEditable(definition, mapping) && !!definition.required;
  if (mapping.mappingMode === 'formattr') return true;
  return mapping.mappingMode === 'constant' && !!definition.required;
}

export function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

export function asMapping(value, fallback) {
  if (value && typeof value === 'object' && has(value, 'mappingMode')) return utils.deepClone(value);
  return { mappingMode: 'constant', value: value === undefined ? utils.deepClone(fallback) : utils.deepClone(value) };
}

export function cleanMapping(mapping) {
  const result = utils.deepClone(mapping);
  delete result.text;
  if (result.mappingMode === 'isempty') result.value = '';
  if (result.mappingMode === 'notsetup') result.value = null;
  return result;
}

export function changeMapping(mapping, mode, definition) {
  if (mapping.mappingMode === mode) return utils.deepClone(mapping);
  return { mappingMode: mode, value: mode === 'constant' ? utils.deepClone(definition.defaultValue) : mode === 'isempty' ? '' : null };
}
