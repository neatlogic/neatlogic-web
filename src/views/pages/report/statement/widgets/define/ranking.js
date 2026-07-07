import { $t } from '@/resources/init.js';

export default {
  name: 'ranking',
  label: $t('term.report.rankinglist'),
  type: 'ranking',
  icon: 'tsfont-list',
  widgetType: 'basic',
  hasCustomConfig: true,
  supportAppearanceColor: true,
  width: 420,
  height: 300,
  padding: 10,
  color: '#00e5ff',
  accentColor: '#00ffa8',
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }],
  needData: true,
  fields: [
    { name: 'name', label: $t('page.name'), type: ['text', 'date', 'datetime', 'time'], isRequired: true, description: $t('term.report.rankingnamedesc') },
    { name: 'value', label: $t('term.report.chartsetting.value'), type: ['number', 'text'], isRequired: true, description: $t('term.report.rankingvaluedesc') }
  ],
  config: {
    showTitle: true,
    title: $t('term.report.topranking'),
    titleColor: '#00e5ff',
    nameColor: '',
    topN: 6
  }
};
