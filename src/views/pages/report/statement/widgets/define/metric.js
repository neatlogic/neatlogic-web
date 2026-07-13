import { $t } from '@/resources/init.js';

export default {
  name: 'metric',
  label: $t('term.report.metriccard'),
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
    { name: 'title', label: $t('page.title'), type: ['text'], isRequired: false, isRecommended: true, description: $t('term.report.optionaldefaulttitle') },
    { name: 'value', label: $t('term.report.chartsetting.value'), type: ['number', 'text'], isRequired: true, description: $t('term.report.metricvaluedesc') },
    { name: 'unit', label: $t('term.report.unit'), type: ['text'], isRequired: false, description: $t('term.report.optionaldefaultunit') },
    { name: 'trendLabel', label: $t('term.report.trendlabel'), type: ['text'], isRequired: false, description: $t('term.report.optionaltrendonly') },
    { name: 'trendValue', label: $t('term.report.trendvalue'), type: ['number', 'text'], isRequired: false, description: $t('term.report.optionaltrendonly') }
  ],
  config: {
    title: $t('term.report.coremetric'),
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
