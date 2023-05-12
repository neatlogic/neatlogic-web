import {$t} from '@/resources/init.js';

export default { 
  name: 'custom', 
  label: $t('page.custom'), 
  type: 'custom', 
  icon: 'tsfont-plugin', 
  widgetType: 'other', 
  hasCustomConfig: true, 
  width: 5, 
  height: 7, 
  padding: 10, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  needData: true, 
  config: { template: '', fileList: [], config: '' } 
};
