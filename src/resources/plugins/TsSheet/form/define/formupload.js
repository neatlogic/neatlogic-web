import {$t} from '@/resources/init.js';

export default {
  'handler': 'formupload',
  'label': $t('page.uploadattachment'),
  'type': 'form',
  'category': 'basic',
  'icon': 'tsfont-upload',
  'hasValue': true,
  'override_config': {},
  'config': {
    'disableDefaultValue': true,
    'isRequired': false,
    'description': '',
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'isTemplate': false,
    'uploadType': 'one'
  },
  'reaction': {
    'hide': {},
    'display': {},
    'readonly': {},
    'required': {}
  }
};
