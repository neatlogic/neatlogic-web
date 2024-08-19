import { $t } from '@/resources/init.js';

export default {
  handler: 'formtext',
  label: $t('page.input'),
  type: 'form',
  category: 'basic',
  switchHandler: ['formtext', 'formtextarea', 'formckeditor', 'formnumber', 'formpassword'],
  icon: 'tsfont-forminput',
  hasValue: true,
  override_config: {},
  isDynamicValue: true, //联动规则-赋值(setvalue)：是否需要动态赋值
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
    setvalue: {},
    emit: {},
    required: {},
    clearValue: {}
  }
};
