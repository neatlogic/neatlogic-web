import {$t} from '@/resources/init.js';

export default { 
  name: 'liquid', 
  label: $t('term.report.chartsetting.liquidchart'), 
  type: 'liquid', 
  icon: 'tsfont-chart-liquid', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 3, 
  height: 9, 
  padding: 10, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [{ name: 'number', label: $t('page.value'), type: 'number', isRequired: true }], 
  config: { 
    shape: 'circle', 
    color: '', 
    outline: { 
      border: 2, 
      distance: 0, 
      style: { 
        stroke: '' 
      } 
    }, 
    wave: { 
      length: 128 
    }, 
    pattern: { type: '' }, 
    statistic: { content: { style: { color: '', fontSize: 14 } } } 
  } 
};
