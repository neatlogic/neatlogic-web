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
    isShowComponentNameInTab: false // 显示拖入Tab选项卡内的组件名称
  },
  reaction: { mask: {}, hide: {}, display: {}, readonly: {}, disable: {} }
};
