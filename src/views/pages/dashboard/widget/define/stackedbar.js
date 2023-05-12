import {$t} from '@/resources/init.js';

export default { 
  name: 'stackedbar', 
  label: $t('term.report.chartsetting.stackedbarchart'), 
  type: 'stackedbar', 
  icon: 'tsfont-storage', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 5, 
  height: 5, 
  padding: 10, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.xfield'), type: 'number', isRequired: true }, 
    { name: 'yField', label: $t('term.report.axis.yfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true }, 
    { name: 'seriesField', label: $t('term.report.chartsetting.groupfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true } 
  ], 
  config: { 
    isPercent: false, 
    label: false, 
    columnWidthRatio: 0.5, 
    connectedArea: true, 
    legend: { 
      visible: true, 
      position: 'bottom' 
    } 
  } 
};
