import { $t } from '@/resources/init.js';

export default {
  handler: 'formtab',
  label: $t('page.tab'),
  type: 'form',
  category: 'layout',
  icon: 'tsfont-wenjian',
  override_config: {},
  hasValue: false,
  isContainer: true,
  component: [],
  notUniqueKey: true, //不需要唯一标识key
  config: {
    width: '100%',
    isMask: false,
    isHide: false,
    isReadOnly: false,
    isDisabled: false,
    type: 'line',
    isShowComponentLabel: false // 是否显示组件label
  },
  reaction: { mask: {}, hide: {}, display: {}, readonly: {}, disable: {} }
};
