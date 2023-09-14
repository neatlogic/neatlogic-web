import { $t } from '@/resources/init.js';

export default {
  name: 'bullet',
  label: $t('term.report.chartsetting.bulletchar'),
  type: 'bullet',
  icon: 'tsfont-chart-bullet',
  widgetType: 'basic',
  hasCustomConfig: true,
  width: 5,
  height: 5,
  padding: 10,
  needData: true,
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }],
  fields: [
    { name: 'measureField', label: '当前值', type: 'number', isRequired: true },
    { name: 'ranges', label: '最大值', type: 'number', isRequired: true },
    { name: 'targetField', label: '目标值', type: 'number', isRequired: true }
  ],
  config: {
    legend: { visible: true, position: 'bottom' }, 
    layout: 'horizontal',
    color: {range: '', measure: '', target: ''}, 
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
