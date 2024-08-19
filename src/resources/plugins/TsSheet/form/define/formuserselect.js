import { $t } from '@/resources/init.js';

export default {
  handler: 'formuserselect',
  label: $t('term.framework.userselect'),
  type: 'form',
  category: 'basic',
  icon: 'tsfont-userinfo',
  hasValue: true,
  config: {
    disableDefaultValue: true,
    isRequired: false,
    description: '',
    width: '100%',
    isMask: false,
    isHide: false,
    isReadOnly: false,
    isDisabled: false,
    isMultiple: false,
    groupList: []
  },
  override_config: {},
  reaction: {
    hide: {},
    display: {},
    readonly: {},
    disable: {},
    setvalue: {},
    required: {},
    clearValue: {}
  }
};
