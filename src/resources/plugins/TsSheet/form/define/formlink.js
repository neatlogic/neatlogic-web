import { $t } from '@/resources/init.js';

export default {
  'handler': 'formlink',
  'label': $t('page.hyperlink'),
  'type': 'form',
  'category': 'basic',
  'icon': 'tsfont-formlink',
  'override_config': {},
  'hasValue': false,
  'config': {
    'description': '',
    'width': '100%',
    'isMask': false,
    'isHide': false,
    'target': '_self'
  },
  'reaction': {
    'hide': {},
    'display': {}
  }
};
