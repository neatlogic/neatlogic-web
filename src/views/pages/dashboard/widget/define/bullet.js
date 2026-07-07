import { $t } from '@/resources/init.js';

export default {
  name: 'bullet',
  label: $t('term.report.chartsetting.bulletchar'),
  type: 'bullet',
  icon: 'tsfont-chart-bullet',
  widgetType: 'basic',
  hasCustomConfig: true,
  width: 5,
  height: 5,
  padding: 10,
  needData: true,
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }],
  fields: [
    { name: 'title', label: $t('page.title'), type: 'text', isRequired: true },
    { name: 'measure', label: $t('term.report.chartsetting.currentvalue'), type: 'number', isRequired: true },
    { name: 'range', label: $t('term.report.chartsetting.maxvalue'), type: 'number', isRequired: true },
    { name: 'target', label: $t('term.report.chartsetting.targetvalue'), type: 'number', isRequired: true }
  ],
  config: {
    legend: { visible: true, position: 'bottom' },
    layout: 'horizontal',
    color: { range: '', measure: '', target: '' },
    yAxis: {
      label: {
        autoHide: true,
        autoEllipsis: true
      },
      title: { text: '' }
    },
    xAxis: { title: { text: '' } }
  }
};
