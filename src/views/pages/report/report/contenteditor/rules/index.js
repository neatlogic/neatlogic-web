import drawTable from './draw-table';
import chartRuleList from './draw-bar';
import drawPie from './draw-pie';
import stackedBarRuleList from './draw-stacked-bar';

export const ruleList = [
  drawTable,
  ...chartRuleList,
  drawPie,
  ...stackedBarRuleList
];

export const ruleMap = ruleList.reduce((map, rule) => {
  map[rule.name] = rule;
  return map;
}, {});
