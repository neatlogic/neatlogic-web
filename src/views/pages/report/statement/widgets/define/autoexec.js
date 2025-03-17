import { $t } from '@/resources/init.js';

export default {
  name: 'autoexec',
  label: $t('page.autoexec'),
  type: 'autoexec',
  icon: 'tsfont-zidonghua',
  widgetType: 'other',
  hasCustomConfig: true,
  width: 500,
  height: 300,
  padding: 5,
  needData: true,
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  config: { backgroundColor: '', backgroundImage: '', fontsize: 13, color: '' }
};
