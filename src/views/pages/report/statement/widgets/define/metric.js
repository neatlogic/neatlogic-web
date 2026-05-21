import {$t} from '@/resources/init.js';

export default {
  name: 'metric',
  label: '指标卡',
  type: 'metric',
  icon: 'tsfont-chart-number',
  widgetType: 'basic',
  hasCustomConfig: true,
  supportAppearanceColor: true,
  width: 360,
  height: 168,
  padding: 8,
  color: '#00e5ff',
  accentColor: '#00ffa8',
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }],
  needData: true,
  fields: [
    { name: 'title', label: '标题', type: ['text'], isRequired: false },
    { name: 'value', label: '数值', type: ['number', 'text'], isRequired: true },
    { name: 'unit', label: '单位', type: ['text'], isRequired: false },
    { name: 'trendLabel', label: '趋势标签', type: ['text'], isRequired: false },
    { name: 'trendValue', label: '趋势值', type: ['number', 'text'], isRequired: false }
  ],
  config: {
    title: '核心指标',
    titleColor: '',
    defaultValue: 1286,
    unit: '',
    prefix: '',
    decimals: 0,
    useThousands: true,
    fontSize: 46,
    animation: true,
    duration: 1200,
    showTrend: false,
    trendType: 'up'
  }
};
