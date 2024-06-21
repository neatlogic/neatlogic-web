import { $t } from '@/resources/init.js';

export default {
  handler: 'formselect',
  label: $t('page.select'),
  type: 'form',
  category: 'basic',
  switchHandler: ['formselect', 'formradio', 'formcheckbox'],
  icon: 'tsfont-formselect',
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
    isMultiple: false,
    dataList: [],
    dataSource: 'static',
    matrixUuid: '',
    defaultValueType: 'self',
    mapping: { value: '', text: '' },
    isAddData: false // 新增数据
  },
  reaction: { mask: {}, hide: {}, display: {}, readonly: {}, disable: {}, setvalue: {}, filter: {}, emit: {}, required: {} }
};
