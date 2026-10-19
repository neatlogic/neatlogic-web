import { $t } from '@/resources/init.js';
import { has, isJobEditable } from '../../mapping-rules.js';
import utils from '@/resources/assets/js/util.js';

export default {
  key: 'scenarioId',
  label: $t('page.scene'),
  group: 'scenarioForm',
  direct: true,
  required: true,
  defaultValue: null,
  visible: context => context.toolConfig?.scenarioList?.length > 0,
  getInheritedValue: ({ toolConfig }) => toolConfig.defaultScenarioId,
  getJobValue: ({ config, job, definition, mapping }) => {
    if (!has(job, definition.key)) return mapping.value;
    const editable = isJobEditable({ ...definition, locked: false }, mapping);
    return editable || !has(config, definition.key) ? job[definition.key] : mapping.value;
  },
  normalizeMapping: (mapping, { config, scene }) => {
    const isUnset = !has(config, 'scenarioId') || config.scenarioId == null || config.scenarioId === '';
    if (scene === 'job-create' && isUnset) return { ...mapping, mappingMode: 'notsetup' };
    return mapping;
  },
  toServiceValue: mapping => utils.deepClone(mapping.value)
};
