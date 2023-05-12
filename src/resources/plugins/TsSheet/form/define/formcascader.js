import { $t } from '@/resources/init.js';

export default {
  'handler': 'formcascader',
  'label': $t('term.framework.formcascader'),
  'type': 'form',
  'category': 'basic',
  'icon': 'tsfont-formcascadelist',
  'hasValue': true,
  'override_config': {},
  'config': {
    'isRequired': false,
    'description': '',
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'isReadOnly': false,
    'isDisabled': false,
    'levelType': 2,
    'dataList': [],
    'dataSource': 'static',
    'matrixUuid': '',
    'defaultValueType': 'self',
    'mapping': { 'value': '', 'text': '' }
  },
  'reaction': { 'mask': {}, 'hide': {}, 'display': {}, 'readonly': {}, 'disable': {}, 'setvalue': {}, 'filter': {}, 'emit': {} }
};
