import {$t} from '@/resources/init.js';

export default { 
  name: 'gauge', 
  label: $t('term.report.chartsetting.dashboard'), 
  type: 'gauge', 
  icon: 'tsfont-chart-progress', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 250, 
  height: 250, 
  padding: 5, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [{ name: 'number', label: $t('page.value'), type: 'number', isRequired: true }], 
  config: { 
    type: '', 
    innerRadius: 0.8, 
    range: { 
      color: '' 
    }, 
    indicator: { 
      pointer: { 
        style: { 
          stroke: '' 
        } 
      }, 
      pin: { 
        style: { 
          stroke: '', 
          fill: '' 
        } 
      } 
    }, 
    statistic: { 
      content: { 
        style: { 
          color: '', 
          fontSize: 20 
        } 
      } 
    } 
  } 
};
