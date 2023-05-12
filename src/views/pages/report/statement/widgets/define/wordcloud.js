import {$t} from '@/resources/init.js';

export default { 
  name: 'wordcloud', 
  label: $t('term.report.chartsetting.wordcloud'), 
  type: 'wordcloud', 
  icon: 'tsfont-chart-wordcloud', 
  widgetType: 'other', 
  hasCustomConfig: true, 
  width: 500, 
  height: 200, 
  padding: 5, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'wordField', label: $t('term.report.axis.namefield'), type: 'text', isRequired: true }, 
    { name: 'colorField', label: $t('term.report.axis.colorfield'), type: 'text', isRequired: true }, 
    { name: 'weightField', label: $t('term.report.numberfield'), type: 'number', isRequired: true } 
  ], 
  config: { 
    wordStyle: { 
      fontSize: [8, 32] 
    } 
  } 
};
