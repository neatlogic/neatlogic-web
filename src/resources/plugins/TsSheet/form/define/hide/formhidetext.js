import { $t } from '@/resources/init.js';

export default {
  handler: 'formtext',
  label: $t('page.input'),
  type: 'form',
  category: 'hide',
  icon: 'tsfont-forminput',
  hasValue: true,
  isHideComponent: true,
  isDynamicValue: true, //联动规则-赋值(setvalue)：是否需要动态赋值
  config: {
    defaultvalue: ''
  },
  reaction: {
    setvalue: {},
    emit: {},
    clearValue: {}
  }
};
