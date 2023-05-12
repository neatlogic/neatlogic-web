import {$t} from '@/resources/init.js';

export default { 
  name: 'pie', 
  label: $t('term.report.chartsetting.piechart'), 
  type: 'pie', 
  icon: 'tsfont-chart-pie', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 3, 
  height: 9, 
  padding: 10, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'angleField', label: $t('term.report.numberfield'), type: 'number', isRequired: true }, 
    { name: 'colorField', label: $t('term.report.chartsetting.classifyfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true } 
  ], 
  config: { 
    legend: { 
      visible: true, 
      position: 'bottom', 
      layout: 'horizontal' 
    }, 
    label: { 
      type: 'inner' 
    }, 
    statistic: { 
      content: { 
        style: { 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          fontSize: 12, 
          color: '' 
        } 
      } 
    } 
  } 
};
