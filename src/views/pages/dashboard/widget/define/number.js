import {$t} from '@/resources/init.js';

export default { 
  name: 'number', 
  label: $t('page.number'), 
  type: 'number', 
  icon: 'tsfont-chart-number', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 5, 
  height: 5, 
  padding: 10, 
  dataTypes: [ 
    { 
      value: 'dynamic', 
      text: $t('term.report.datatype.dynamicdata')
    } 
  ], 
  needData: true, 
  fields: [ 
    { name: 'text', label: $t('page.copywriting'), type: ['text', 'datetime', 'time', 'date'], isRequired: true }, 
    { name: 'number', label: $t('term.report.chartsetting.value'), type: ['number'], isRequired: true } 
  ], 
  config: { 
    textFontSize: 12, 
    textFontColor: '', 
    numberFontSize: 12, 
    numberFontColor: '', 
    backgroundColor: '', 
    backgroundImage: '', 
    align: 'left', 
    radius: 0 
  } 
};

