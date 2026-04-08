import { $t } from '@/resources/init.js';
export default {
  handler: 'formscript',
  label: $t('page.code'),
  type: 'form',
  category: 'basic',
  icon: 'tsfont-code-block',
  hasValue: true,
  override_config: {},
  config: {
    isRequired: false,
    description: '',
    defaultValue: '',
    width: '100%',
    isMask: false,
    isHide: false,
    isReadOnly: false,
    isDisabled: false,
    isMultiple: false,
    placeholder: $t('form.placeholder.pleaseinput', { target: $t('page.code') }),
    codeMode: 'javascript',
    componentTopLeftTip: 'javascript'
  },
  reaction: {
    mask: {},
    hide: {},
    display: {},
    readonly: {},
    disable: {},
    setvalue: {},
    setValueOther: {},
    filter: {},
    emit: {},
    required: {},
    clearValue: {}
  }
};
