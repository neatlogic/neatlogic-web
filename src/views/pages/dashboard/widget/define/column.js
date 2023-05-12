import {$t} from '@/resources/init.js';

export default { 
  name: 'column', 
  label: $t('term.report.chartsetting.columnchart'), 
  type: 'column', 
  icon: 'tsfont-chart-bar', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 5, 
  height: 5, 
  padding: 10, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.xfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true }, 
    { name: 'yField', label: $t('term.report.axis.yfield'), type: 'number', isRequired: true } 
  ], 
  config: { 
    legend: { visible: true, position: 'bottom' }, 
    columnWidthRatio: 0.5, 
    color: '', 
    yAxis: { title: { text: '' } }, 
    xAxis: { 
      label: { 
        autoHide: true, 
        autoEllipsis: true 
      }, 
      title: { text: '' } 
    } 
  } 
};
