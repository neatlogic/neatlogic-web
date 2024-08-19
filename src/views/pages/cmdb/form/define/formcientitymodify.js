import { $t } from '@/resources/init.js';

export default {
  handler: 'formcientitymodify',
  label: $t('term.framework.formcientitymodify'),
  type: 'form',
  category: 'cmdb',
  icon: 'tsfont-cientityselect',
  hasValue: true,
  override_config: {},
  config: {
    disableDefaultValue: true,
    description: '',
    width: '100%',
    isMask: false,
    isHide: false,
    isReadOnly: false,
    isDisabled: false,
    actionEdit: false,
    actionDel: false,
    actionAdd: false,
    dataConfig: []
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
