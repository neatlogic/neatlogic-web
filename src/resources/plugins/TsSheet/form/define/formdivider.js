import { $t } from '@/resources/init.js';

export default {
  'handler': 'formdivider',
  'label': $t('term.framework.formdivider'),
  'type': 'form',
  'category': 'layout',
  'icon': 'tsfont-minus',
  'hasValue': false,
  'override_config': {},
  'config': {
    'description': '',
    'width': '100%',
    'isHide': false,
    'dividerColor': '',
    'dividerType': 'solid',
    'dividerWidth': 1,
    'content': '',
    'contentPosition': 'left'
  },
  'reaction': {
    'hide': {},
    'display': {}
  }
};
