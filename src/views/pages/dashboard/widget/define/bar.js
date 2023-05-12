import {$t} from '@/resources/init.js';

export default {
  name: 'bar', 
  label: $t('term.dashboard.barchart'), 
  type: 'bar', 
  icon: 'tsfont-storage', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 5, 
  height: 7, 
  padding: 10, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.xfield'), type: 'number', isRequired: true }, 
    { name: 'yField', label: $t('term.report.axis.yfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true } 
  ], 
  config: { 
    legend: { visible: true, position: 'bottom' }, 
    barWidthRatio: 0.5, 
    color: '', 
    yAxis: { 
      label: { 
        autoHide: true, 
        autoEllipsis: true 
      }, 
      title: { text: '' } 
    }, 
    xAxis: { title: { text: '' } } 
  } 
};
