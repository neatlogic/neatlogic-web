import {$t} from '@/resources/init.js';

export default {
  'handler': 'formtime',
  'label': $t('page.time'),
  'type': 'form',
  'category': 'basic',
  'icon': 'tsfont-formtime',
  'hasValue': true,
  'config': {
    'isRequired': false,
    'description': '',
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'isReadOnly': false,
    'isDisabled': false,
    'placeholder': $t('form.placeholder.pleaseselect', {'target': $t('page.time')}),
    'format': 'HH:mm:ss',
    'validValueList': []
  },
  'override_config': {},
  'reaction': { 'mask': {}, 'hide': {}, 'display': {}, 'readonly': {}, 'disable': {}, 'setvalue': {}, 'required': {} }
};
