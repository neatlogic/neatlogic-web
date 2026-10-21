import { $t } from '@/resources/init.js';
import { isJobEditable } from '../../mapping-rules.js';
import utils from '@/resources/assets/js/util.js';

export default {
  key: 'runnerGroupTag',
  label: $t('term.deploy.actuatorgrouptag'),
  group: 'runnerGroupTag',
  required: false,
  defaultValue: null,
  allowJobOverride: true,
  tip: $t('page.autoexeccomboprunnergrouptagtips'),
  fullWidth: true,
  getJobValue: ({ job, definition, mapping }) => {
    const editable = isJobEditable({ ...definition, locked: false }, mapping);
    return editable ? job[definition.key].value : mapping.value;
  },
  toJobValue: mapping => ({ mappingMode: 'constant', value: utils.deepClone(mapping.value) })
};
