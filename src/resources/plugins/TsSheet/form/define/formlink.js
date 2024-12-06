import { $t } from '@/resources/init.js';

export default {
  handler: 'formlink',
  label: $t('page.hyperlink'),
  type: 'form',
  category: 'basic',
  icon: 'tsfont-formlink',
  override_config: {},
  hasValue: false,
  notUniqueKey: true, //不需要唯一标识key
  config: {
    description: '',
    width: '100%',
    isMask: false,
    isHide: false,
    target: '_self'
  },
  reaction: {
    hide: {},
    display: {}
  }
};
