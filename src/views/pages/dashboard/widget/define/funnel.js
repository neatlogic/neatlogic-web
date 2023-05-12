import {$t} from '@/resources/init.js';

export default { 
  name: 'funnel', 
  label: $t('term.report.chartsetting.funnelchart'), 
  type: 'funnel', 
  icon: 'tsfont-chart-funnel', 
  widgetType: 'other', 
  hasCustomConfig: true, 
  width: 3, 
  height: 7, 
  padding: 10, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.namefield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true }, 
    { name: 'yField', label: $t('term.report.numberfield'), type: 'number', isRequired: true } 
  ], 
  config: { 
    dynamicHeight: true, 
    isTransposed: false, 
    legend: { 
      visible: true, 
      position: 'bottom',
      layout: 'horizontal' 
    }, 
    label: {} 
  } 
};
