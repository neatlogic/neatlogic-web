import { $t } from '@/resources/init.js';

export default {
  handler: 'formresoureces',
  label: $t('term.autoexec.executetarget'),
  type: 'form',
  category: 'autoexec',
  icon: 'tsfont-adapter',
  hasValue: true,
  override_config: {},
  config: {
    disableDefaultValue: true,
    isRequired: false,
    description: '',
    width: '100%',
    isMask: false,
    isHide: false,
    isReadOnly: false,
    isDisabled: false
  },
  reaction: {
    hide: {},
    display: {},
    readonly: {},
    required: {},
    clearValue: {}
  }
};
