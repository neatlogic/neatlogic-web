import { $t } from '@/resources/init.js';

export default {
  'handler': 'formcientityselector',
  'label': $t('term.framework.formcientityselector'),
  'type': 'form',
  'category': 'cmdb',
  'icon': 'tsfont-tree',
  'hasValue': true,
  'override_config': {},
  'config': {
    'disableDefaultValue': true,
    'placeholder': $t('dialog.title.choosetarget', {'target': $t('term.cmdb.cientity')}),
    'description': '',
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'ciList': []
  },
  'reaction': { 'mask': {}, 'hide': {}, 'display': {}, 'readonly': {}, 'disable': {} }
};
