import {$t} from '@/resources/init.js';

export default { 
  name: 'radar', 
  label: $t('term.report.chartsetting.radarchart'), 
  type: 'radar', 
  icon: 'tsfont-chart-radar', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 250, 
  height: 250, 
  padding: 5, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.chartsetting.classifyfield'), type: 'text', isRequired: true }, 
    { name: 'yField', label: $t('term.report.numberfield'), type: 'number', isRequired: true }, 
    { name: 'seriesField', label: $t('term.report.chartsetting.groupfield'), type: 'text', isRequired: false } 
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
