import { createChartRule } from './chart-rule-factory';
import { $t } from '@/resources/init.js';

export const drawStackedBar = createChartRule({
  name: 'drawStackedBar',
  label: $t('term.report.chartsetting.stackedcolumnchart'),
  icon: 'tsfont-chart-bar'
});

export const drawStackedBarH = createChartRule({
  name: 'drawStackedBarH',
  label: $t('term.report.chartsetting.horizontalstackedcolumnchart'),
  icon: 'tsfont-chart-bar'
});

export default [drawStackedBar, drawStackedBarH];
