import { $t } from '@/resources/init.js';

export default {
  'handler': 'formcollapse',
  'label': $t('term.framework.formcollapse'),
  'type': 'form',
  'category': 'layout',
  'icon': 'tsfont-spacing',
  'override_config': {},
  'hasValue': false,
  'isContainer': true,
  'component': [],
  'config': {
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'isSimple': false,
    'isAccordion': false
  },
  'reaction': { 'mask': {}, 'hide': {}, 'display': {} }
};
