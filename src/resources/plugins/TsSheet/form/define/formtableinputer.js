import { $t } from '@/resources/init.js';

export default {
  'handler': 'formtableinputer',
  'label': $t('term.framework.tableinput'),
  'type': 'form',
  'category': 'basic',
  'icon': 'tsfont-formstaticlist',
  'override_config': {},
  'hasValue': true,
  'config': {
    'disableDefaultValue': true,
    'isRequired': false,
    'description': '',
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'dataConfig': [],
    'isShowNumber': true,
    'isCanDrag': true,
    'lineNumber': 1
  },
  'reaction': { 'mask': {}, 'hide': {}, 'display': {}, 'readonly': {}, 'disable': {}, 'emit': {} }
};
