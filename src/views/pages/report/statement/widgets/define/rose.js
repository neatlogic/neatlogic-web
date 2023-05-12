import {$t} from '@/resources/init.js';

export default { 
  name: 'rose', 
  label: $t('term.report.chartsetting.rosechart'), 
  type: 'rose', 
  icon: 'tsfont-chart-rose', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 250, 
  height: 250, 
  padding: 5, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'yField', label: $t('term.report.numberfield'), type: 'number', isRequired: true }, 
    { name: 'xField', label: $t('term.report.chartsetting.classifyfield'), type: 'text', isRequired: true }, 
    { name: 'seriesField', label: $t('term.report.chartsetting.groupfield'), type: 'text', isRequired: true } 
  ], 
  config: { 
    legend: { 
      visible: true, 
      position: 'bottom', 
      layout: 'horizontal' 
    } 
  } 
};
