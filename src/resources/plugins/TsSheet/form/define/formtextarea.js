import { $t } from '@/resources/init.js';

export default {
  'handler': 'formtextarea',
  'label': $t('page.textfield'),
  'type': 'form',
  'category': 'basic',
  'switchHandler': ['formtext', 'formtextarea', 'formckeditor', 'formnumber', 'formpassword'],
  'icon': 'tsfont-formtextarea',
  'hasValue': true,
  'override_config': {},
  'config': {
    'isRequired': false,
    'description': '',
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'isReadOnly': false,
    'isDisabled': false
  },
  'reaction': { 'mask': {}, 'hide': {}, 'display': {}, 'readonly': {}, 'disable': {}, 'setvalue': {}, 'emit': {} }
};
