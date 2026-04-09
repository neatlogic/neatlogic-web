import { $t } from '@/resources/init.js';

export default {
  handler: 'formexpression',
  label: $t('page.datachange'),
  type: 'form',
  category: 'basic',
  icon: 'tsfont-data-transformation',
  override_config: {},
  hasValue: false,
  config: {
    isRequired: false,
    description: '',
    width: '100%',
    isHide: false
  },
  reaction: {
    hide: {},
    display: {},
    required: {}
  }
};
