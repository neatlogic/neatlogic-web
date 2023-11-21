import { $t } from '@/resources/init.js';

export default {
  'handler': 'formsubassembly',
  'label': $t('term.framework.formsubassembly'),
  'type': 'form',
  'category': 'basic',
  'icon': 'tsfont-formlist',
  'override_config': {},
  'hasValue': true,
  'component': [],
  'config': {
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'isReadOnly': false,
    'isDisabled': false,
    'isCanAdd': true
  },
  'reaction': { 'mask': {}, 'hide': {}, 'display': {}, 'readonly': {}, 'disable': {} }
};
