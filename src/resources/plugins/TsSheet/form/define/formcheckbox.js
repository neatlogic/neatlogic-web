import { $t } from '@/resources/init.js';

export default {
  handler: 'formcheckbox',
  label: $t('page.checkbox'),
  type: 'form',
  category: 'basic',
  switchHandler: ['formselect', 'formradio', 'formcheckbox'],
  icon: 'tsfont-check-square',
  hasValue: true,
  override_config: {},
  config: {
    isRequired: false,
    description: '',
    width: '100%',
    isMask: false,
    isHide: false,
    isReadOnly: false,
    isDisabled: false,
    isMultiple: true,
    dataList: [],
    dataSource: 'static',
    matrixUuid: '',
    defaultValueType: 'self',
    mapping: { value: '', text: '' },
    direction: 'vertical'
  },
  reaction: {
    mask: {},
    hide: {},
    display: {},
    readonly: {},
    disable: {},
    setvalue: {},
    filter: {},
    required: {},
    clearValue: {}
  }
};
