import {$t} from '@/resources/init.js';

export default { 
  name: 'radar', 
  label: $t('term.report.chartsetting.radarchart'), 
  type: 'radar', 
  icon: 'tsfont-chart-radar', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 3, 
  height: 9, 
  padding: 10, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'yField', label: $t('term.report.numberfield'), type: 'number', isRequired: true }, 
    { name: 'xField', label: $t('term.report.chartsetting.classifyfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true }, 
    { name: 'seriesField', label: $t('term.report.chartsetting.groupfield'), type: ['text', 'date', 'datetime', 'time'], isRequired: true } 
  ], 
  config: { 
    legend: { 
      visible: true, 
      position: 'bottom', 
      layout: 'horizontal' 
    }, 
    xAxis: { 
      line: null, 
      tickLine: null,
      grid: { 
        line: { 
          style: { 
            lineDash: null 
          } 
        } 
      } 
    }, 
    area: { smooth: true }, 
    point: { 
      size: 3 
    } 
  } 
};
