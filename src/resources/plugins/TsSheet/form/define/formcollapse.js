import { $t } from '@/resources/init.js';

export default {
  handler: 'formcollapse',
  label: $t('term.framework.formcollapse'),
  type: 'form',
  category: 'layout',
  icon: 'tsfont-spacing',
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
    isSimple: false,
    isAccordion: false
  },
  reaction: { mask: {}, hide: {}, display: {} }
};
