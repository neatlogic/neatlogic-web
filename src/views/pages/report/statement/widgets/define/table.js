import {$t} from '@/resources/init.js';

export default { 
  name: 'table', 
  label: $t('page.table'), 
  type: 'table', 
  icon: 'tsfont-chart-table', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 500, 
  height: 200, 
  padding: 5, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  needData: true, 
  config: { autoscroll: true } 
};
