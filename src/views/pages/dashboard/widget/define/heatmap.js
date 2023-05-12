import {$t} from '@/resources/init.js';

export default { 
  name: 'heatmap', 
  label: $t('term.report.chartsetting.heatmap'), 
  type: 'heatmap', 
  icon: 'tsfont-chart-heatmap', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 5, 
  height: 5, 
  padding: 10, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.xfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true }, 
    { name: 'yField', label: $t('term.report.axis.yfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true }, 
    { name: 'colorField', label: $t('term.report.axis.colorfield'), type: 'number', isRequired: true } 
  ], 
  config: { 
    xField: 'xField', 
    yField: 'yField', 
    colorField: 'colorField', 
    yAxis: { title: { text: '' } }, 
    xAxis: { 
      label: { 
        autoHide: true, 
        autoEllipsis: true 
      }, 
      title: { text: '' } 
    }, 
    legend: { 
      visible: true, 
      position: 'bottom' 
    }, 
    meta: { 
      xField: { alias: $t('term.report.axis.xfield') }, 
      yField: { alias: $t('term.report.axis.yfield') }, 
      colorField: { alias: $t('term.report.axis.colorfield') } 
    } 
  } 
};
