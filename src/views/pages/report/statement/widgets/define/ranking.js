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
  dataTypes: [{ value: 'dynamic', text: '动态数据' }],
  needData: true,
  fields: [
    { name: 'name', label: '名称', type: ['text', 'date', 'datetime', 'time'], isRequired: true },
    { name: 'value', label: '数值', type: ['number', 'text'], isRequired: true }
  ],
  config: {
    showTitle: true,
    title: 'TOP排名',
    titleColor: '#00e5ff',
    topN: 6
  }
};
