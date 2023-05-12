import {$t} from '@/resources/init.js';

export default { 
  name: 'pscatter', 
  label: $t('term.report.chartsetting.pscatter'), 
  type: 'pscatter', 
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
    { name: 'colorField', label: $t('term.report.axis.colorfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true } 
  ], 
  config: { 
    xField: 'xField', 
    yField: 'yField', 
    colorField: 'colorField', 
    size: 5, 
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
      xField: { alias: $t('term.report.axis.xfield')}, 
      yField: { alias: $t('term.report.axis.yfield') }, 
      colorField: { alias: $t('term.report.axis.colorfield') } 
    }, 
    legend: { 
      visible: true, 
      position: 'bottom' 
    } 
  } 
};
