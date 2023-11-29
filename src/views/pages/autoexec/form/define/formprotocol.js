import { $t } from '@/resources/init.js';

export default {
  'handler': 'formprotocol',
  'label': $t('term.inspect.connectionagreement'),
  'type': 'form',
  'category': 'autoexec',
  'icon': 'tsfont-zirenwu',
  'hasValue': true,
  'override_config': {},
  'config': {
    'disableDefaultValue': true,
    'isRequired': false,
    'description': '',
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'isReadOnly': false,
    'isDisabled': false
  },
  'reaction': {
    'hide': {},
    'display': {},
    'readonly': {},
    'required': {} 
  }
};
