import { $t } from '@/resources/init.js';

export default {
  handler: 'formtext',
  label: $t('page.input'),
  type: 'form',
  category: 'hide',
  icon: 'tsfont-forminput',
  hasValue: true,
  isHideComponent: true,
  config: {
  },
  reaction: {'setvalue': {}, 'emit': {}}
};
