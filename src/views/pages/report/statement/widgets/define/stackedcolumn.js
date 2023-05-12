import {$t} from '@/resources/init.js';

export default { 
  name: 'stackedcolumn', 
  label: $t('term.report.chartsetting.stackedcolumnchart'), 
  type: 'stackedcolumn', 
  icon: 'tsfont-chart-bar', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 500, 
  height: 200, 
  padding: 5, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.xfield'), type: 'text', isRequired: true }, 
    { name: 'yField', label: $t('term.report.axis.yfield'), type: 'number', isRequired: true }, 
    { name: 'seriesField', label: $t('term.report.chartsetting.groupfield'), type: 'text', isRequired: true } 
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
