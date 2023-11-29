import { $t } from '@/resources/init.js';

export default {
  'handler': 'formnumber',
  'label': $t('page.number'),
  'type': 'form',
  'category': 'basic',
  'switchHandler': ['formtext', 'formtextarea', 'formckeditor', 'formnumber', 'formpassword'],
  'icon': 'tsfont-chart-number',
  'override_config': {},
  'hasValue': true,
  'config': {
    'isRequired': false,
    'description': '',
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'isReadOnly': false,
    'isDisabled': false
  },
  'reaction': { 'mask': {}, 'hide': {}, 'display': {}, 'readonly': {}, 'disable': {}, 'setvalue': {}, 'required': {} }
};
