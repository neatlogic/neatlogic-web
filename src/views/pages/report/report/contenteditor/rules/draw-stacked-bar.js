import { createChartRule } from './chart-rule-factory';

export const drawStackedBar = createChartRule({
  name: 'drawStackedBar',
  label: '堆积柱状图',
  icon: 'tsfont-chart-bar'
});

export const drawStackedBarH = createChartRule({
  name: 'drawStackedBarH',
  label: '横向堆积柱状图',
  icon: 'tsfont-chart-bar'
});

export default [drawStackedBar, drawStackedBarH];
