import {$t} from '@/resources/init.js';

export default { 
  name: 'area', 
  label: $t('term.report.chartsetting.areachart'), 
  type: 'area', 
  icon: 'tsfont-chart-area', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 500, 
  height: 200, 
  padding: 5, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.xfield'), type: 'text', isRequired: true }, 
    { name: 'yField', label: $t('term.report.axis.yfield'), type: 'number', isRequired: true } 
  ], 
  config: { 
    legend: { visible: true, position: 'bottom' }, 
    smooth: false, 
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
