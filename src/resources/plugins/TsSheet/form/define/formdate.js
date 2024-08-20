import { $t } from '@/resources/init.js';

export default {
  handler: 'formdate',
  label: $t('page.date'),
  type: 'form',
  category: 'basic',
  icon: 'tsfont-calendar',
  override_config: {},
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
    format: 'yyyy-MM-dd HH:mm',
    styleType: '-',
    placeholder: $t('form.placeholder.pleaseselect', { target: $t('page.date') })
  },
  reaction: {
    mask: {},
    hide: {},
    display: {},
    readonly: {},
    disable: {},
    setvalue: {},
    required: {},
    clearValue: {}
  }
};
