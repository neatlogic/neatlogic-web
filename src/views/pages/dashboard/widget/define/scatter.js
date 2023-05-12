import {$t} from '@/resources/init.js';

export default { 
  name: 'scatter', 
  label: $t('term.report.chartsetting.scatter'), 
  type: 'scatter', 
  icon: 'tsfont-chart-scatter', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 5, 
  height: 5, 
  padding: 10, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.xfield'), type: 'number', isRequired: true }, 
    { name: 'yField', label: $t('term.report.axis.yfield'), type: 'number', isRequired: true }, 
    { name: 'colorField', label: $t('term.report.axis.colorfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true }, 
    { name: 'sizeField', label: $t('term.report.axis.sizefield'), type: 'number', isRequired: true } 
  ], 
  config: { 
    xField: 'xField', 
    yField: 'yField', 
    colorField: 'colorField', 
    sizeField: 'sizeField', 
    size: [5, 20], 
    shape: 'circle', 
    yAxis: { title: { text: '' } }, 
    xAxis: { 
      label: { 
        autoHide: true, 
        autoEllipsis: true 
      }, 
      title: { text: '' } 
    }, 
    meta: { 
      xField: { alias: $t('term.report.axis.xfield') }, 
      yField: { alias: $t('term.report.axis.yfield') }, 
      colorField: { alias: $t('term.report.axis.colorfield') }, 
      sizeField: { alias: $t('term.report.axis.sizefield') } 
    }, 
    legend: { 
      visible: true, 
      position: 'bottom' 
    } 
  } 
};
