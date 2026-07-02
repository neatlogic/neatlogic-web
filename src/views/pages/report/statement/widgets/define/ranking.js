import {$t} from '@/resources/init.js';

export default {
  name: 'ranking',
  label: '排名榜',
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
    { name: 'name', label: '名称', type: ['text', 'date', 'datetime', 'time'], isRequired: true, description: '必填；排名条目的名称。' },
    { name: 'value', label: '数值', type: ['number', 'text'], isRequired: true, description: '必填；排名条目的数值，组件会按数值降序排序。' }
  ],
  config: {
    showTitle: true,
    title: 'TOP 排名',
    titleColor: '#00e5ff',
    nameColor: '',
    topN: 6
  }
};
