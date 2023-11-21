import { $t } from '@/resources/init.js';

export default {
  'handler': 'formrate',
  'label': $t('page.score'),
  'type': 'form',
  'category': 'basic',
  'icon': 'tsfont-star',
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
    'allowHalf': false,
    'showText': false,
    'count': 5
  },
  'reaction': { 'mask': {}, 'hide': {}, 'display': {}, 'disable': {}, 'setvalue': {}, 'emit': {}, 'required': {} }
};
