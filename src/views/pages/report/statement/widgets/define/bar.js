import {$t} from '@/resources/init.js';

export default { 
  name: 'bar', 
  label: $t('term.report.chartsetting.barchart'), 
  type: 'bar', 
  icon: 'tsfont-storage', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 500, 
  height: 200, 
  padding: 5, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.xfield'), type: 'number', isRequired: true }, 
    { name: 'yField', label: $t('term.report.axis.yfield'), type: 'text', isRequired: true } 
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
