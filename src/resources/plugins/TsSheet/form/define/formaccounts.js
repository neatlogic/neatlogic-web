import { $t } from '@/resources/init.js';

export default {
  'handler': 'formaccounts',
  'label': $t('page.account'),
  'type': 'form',
  'category': 'basic',
  'icon': 'tsfont-group',
  'hasValue': true,
  'config': {
    'disableDefaultValue': true,
    'placeholder': $t('dialog.title.choosetarget', {'target': $t('page.account')}),
    'isRequired': false,
    'description': '',
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'isReadOnly': false,
    'isDisabled': false
  },
  'override_config': {},
  'reaction': {
    'hide': {},
    'display': {},
    'readonly': {},
    'required': {}
  }
};
