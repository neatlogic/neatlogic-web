import { createChartRule } from './chart-rule-factory';
import { $t } from '@/resources/init.js';

export const drawBar = createChartRule({
  name: 'drawBar',
  label: $t('term.report.chartsetting.barchart'),
  icon: 'tsfont-chart-bar'
});

export const drawBarH = createChartRule({
  name: 'drawBarH',
  label: $t('term.report.chartsetting.horizontalbarchart'),
  icon: 'tsfont-chart-bar'
});

export const drawLine = createChartRule({
  name: 'drawLine',
  label: $t('term.report.chartsetting.linechart'),
  icon: 'tsfont-chart-line'
});

export default [drawBar, drawBarH, drawLine];
