import {$t} from '@/resources/init.js';

export default { 
  name: 'marea', 
  label: $t('term.report.chartsetting.stackedareachart'), 
  type: 'marea', 
  icon: 'tsfont-chart-area', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 5, 
  height: 5, 
  padding: 10, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }],  
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.xfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true }, 
    { name: 'yField', label: $t('term.report.axis.yfield'), type: 'number', isRequired: true }, 
    { name: 'seriesField', label: $t('term.report.chartsetting.groupfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true } 
  ], 
  config: { 
    legend: { visible: true, position: 'bottom' }, 
    smooth: false, 
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
