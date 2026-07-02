import { createChartRule } from './chart-rule-factory';

export const drawBar = createChartRule({
  name: 'drawBar',
  label: '柱状图',
  icon: 'tsfont-chart-bar'
});

export const drawBarH = createChartRule({
  name: 'drawBarH',
  label: '横向柱状图',
  icon: 'tsfont-chart-bar'
});

export const drawLine = createChartRule({
  name: 'drawLine',
  label: '折线图',
  icon: 'tsfont-chart-line'
});

export default [drawBar, drawBarH, drawLine];
