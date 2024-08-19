import { $t } from '@/resources/init.js';

export default {
  handler: 'formcube',
  label: $t('term.framework.cubeselect'),
  type: 'form',
  category: 'basic',
  icon: 'tsfont-softwareservice',
  hasValue: true,
  override_config: {},
  config: {
    isRequired: false,
    description: '',
    width: '100%',
    isMask: false,
    isHide: false,
    isReadOnly: false,
    isDisabled: false
  },
  reaction: {
    mask: {},
    hide: {},
    display: {},
    readonly: {},
    disable: {},
    emit: {},
    required: {},
    clearValue: {}
  }
};
