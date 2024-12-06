import { $t } from '@/resources/init.js';

export default {
  handler: 'formlabel',
  label: $t('page.tag'),
  type: 'form',
  category: 'basic',
  icon: 'tsfont-title',
  override_config: {},
  hasValue: false,
  notUniqueKey: true, //不需要唯一标识key
  config: {
    width: '100%',
    isMask: false,
    isHide: false
  },
  reaction: { mask: {}, hide: {}, display: {} }
};
