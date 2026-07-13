import { $t } from '@/resources/init.js';

export default {
  name: 'progress',
  label: $t('term.report.progressbar'),
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
    { name: 'name', label: $t('page.name'), type: ['text', 'number'], isRequired: true, description: $t('term.report.progressnamedesc') },
    { name: 'value', label: $t('term.report.chartsetting.value'), type: ['number', 'text'], isRequired: true, description: $t('term.report.progressvaluedesc') },
    { name: 'target', label: $t('term.report.chartsetting.targetvalue'), type: ['number', 'text'], isRequired: false, isRecommended: true, description: $t('term.report.progresstargetdesc') },
    { name: 'status', label: $t('page.status'), type: ['text'], isRequired: false, description: $t('term.report.nodestatusdesc') }
  ],
  config: {
    showTitle: false,
    title: $t('term.report.resourceusage'),
    titleColor: '',
    nameColor: '',
    showValue: true,
    showTarget: false,
    textInside: false,
    itemCount: 5,
    barHeight: 8
  }
};
