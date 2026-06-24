import {$t} from '@/resources/init.js';

export default {
  name: 'progress',
  label: '进度条',
  type: 'progress',
  icon: 'tsfont-horizontal-left',
  widgetType: 'basic',
  hasCustomConfig: true,
  supportAppearanceColor: true,
  width: 420,
  height: 260,
  padding: 8,
  color: '#00e5ff',
  accentColor: '#00ffa8',
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }],
  needData: true,
  fields: [
    { name: 'name', label: '名称', type: ['text', 'number'], isRequired: true, description: '必填；进度条名称。' },
    { name: 'value', label: '数值', type: ['number', 'text'], isRequired: true, description: '必填；未绑定目标值时按百分比展示，绑定目标值时按 数值 / 目标值 计算百分比。' },
    { name: 'target', label: '目标值', type: ['number', 'text'], isRequired: false, isRecommended: true, description: '推荐绑定；绑定后按 数值 / 目标值 计算百分比，不绑定时数值直接作为百分比。' },
    { name: 'status', label: '状态', type: ['text'], isRequired: false, description: '可选；normal、warning、critical、offline，非法或为空时按 normal 展示。' }
  ],
  config: {
    showTitle: false,
    title: '资源使用率',
    titleColor: '',
    nameColor: '',
    showValue: true,
    showTarget: false,
    textInside: false,
    itemCount: 5,
    barHeight: 8
  }
};
