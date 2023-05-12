import {$t} from '@/resources/init.js';

export default { 
  name: 'text', 
  label: $t('page.text'), 
  type: 'text', 
  icon: 'tsfont-title', 
  widgetType: 'basic', 
  hasCustomConfig: true,  
  width: 3, 
  height: 3, 
  padding: 10, 
  dataTypes: [ 
    { value: 'static', text: $t('term.report.datatype.staticdata') }, 
    { value: 'dynamic', text: $t('term.report.datatype.dynamicdata') } 
  ], 
  needData: true,  
  fields: [{ name: 'text', label: $t('page.copywriting'), type: ['text', 'number', 'datetime', 'time', 'date'], isRequired: true }], 
  config: { align: 'left', backgroundColor: '', backgroundImage: '', fontsize: 12, color: '' } 
};
