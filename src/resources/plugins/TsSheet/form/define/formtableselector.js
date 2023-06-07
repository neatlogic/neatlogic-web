import { $t } from '@/resources/init.js';

export default {
  'handler': 'formtableselector',
  'label': $t('term.framework.tableselect'),
  'type': 'form',
  'category': 'basic',
  'icon': 'tsfont-formdynamiclist',
  'override_config': {},
  'hasValue': true,
  'config': {
    'disableDefaultValue': true,
    'isRequired': false,
    'description': '',
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'mode': 'dialog',
    'dataConfig': [],
    'dataSource': 'matrix',
    'matrixUuid': '',
    'matrixType': '',
    'mapping': {},
    'pageSize': 10,
    'needPage': true
  },
  'reaction': { 'mask': {}, 'hide': {}, 'display': {}, 'readonly': {}, 'disable': {}, 'filter': {}, 'emit': {}, 'required': {} }
};
