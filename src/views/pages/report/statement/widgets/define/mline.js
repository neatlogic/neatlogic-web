import {$t} from '@/resources/init.js';

export default { 
  name: 'mline', 
  label: $t('term.report.chartsetting.multilinechart'), 
  type: 'mline', 
  icon: 'tsfont-chart-line', 
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
    { name: 'seriesField', label: $t('term.report.chartsetting.groupfield'), type: 'text', isRequired: false } 
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
