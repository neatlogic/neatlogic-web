import { $t } from '@/resources/init.js';

export default {
  'handler': 'formtext',
  'label': $t('page.input'),
  'type': 'form',
  'category': 'basic',
  'switchHandler': ['formtext', 'formtextarea', 'formckeditor', 'formnumber', 'formpassword'],
  'icon': 'tsfont-forminput',
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
