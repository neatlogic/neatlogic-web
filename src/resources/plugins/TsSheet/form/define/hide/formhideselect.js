import { $t } from '@/resources/init.js';

export default {
  handler: 'formselect',
  label: $t('page.select'),
  type: 'form',
  category: 'hide',
  icon: 'tsfont-formselect',
  hasValue: true,
  isHideComponent: true,
  config: {
    dataList: [],
    dataSource: 'static',
    matrixUuid: '',
    defaultValueType: 'self',
    mapping: { value: '', text: '' }
  },
  reaction: { setvalue: {}, filter: {}, emit: {}}
};
