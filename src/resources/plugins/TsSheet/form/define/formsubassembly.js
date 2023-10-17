import { $t } from '@/resources/init.js';

export default {
  'handler': 'formsubassembly',
  'label': '表单子组件',
  'type': 'form',
  'category': 'basic',
  'icon': 'tsfont-formlist',
  'override_config': {},
  'hasValue': false,
  'isContainer': true,
  'component': [],
  'config': {
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'isCanAdd': false
  },
  'reaction': { 'mask': {}, 'hide': {}, 'display': {} }
};
