import { $t } from '@/resources/init.js';

export default {
  handler: 'formpassword',
  label: $t('page.password'),
  type: 'form',
  category: 'basic',
  switchHandler: ['formtext', 'formtextarea', 'formckeditor', 'formnumber', 'formpassword'],
  icon: 'tsfont-option-horizontal',
  override_config: {},
  hasValue: true,
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
    required: {},
    clearValue: {}
  }
};
