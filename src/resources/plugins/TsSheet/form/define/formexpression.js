import { $t } from '@/resources/init.js';

export default {
  handler: 'formexpression',
  label: $t('term.cmdb.expression'),
  type: 'form',
  category: 'basic',
  icon: 'tsfont-json',
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
