import { createChartRule } from './chart-rule-factory';
import { getDataSourceColumnList, getDataSourceFormItem } from './rule-util';
import { $t } from '@/resources/init.js';

function getFieldFormItem(label, value, dataName, context) {
  const columnList = getDataSourceColumnList(dataName, context);
  return {
    type: 'select',
    label,
    value,
    dataList: columnList.map(column => ({ value: column, text: column })),
    allowCreate: true,
    search: true,
    desc: columnList.length > 0 ? $t('term.report.selectfromdatasourcefield') : $t('term.report.nofieldmanualinput')
  };
}

export default createChartRule({
  name: 'drawPie',
  label: $t('term.report.chartsetting.piechart'),
  icon: 'tsfont-chart-pie',
  extraFormConfig(config, context) {
    return {
      data: getDataSourceFormItem(config, context, { minColumnCount: 2 }),
      typeField: getFieldFormItem($t('term.report.chartsetting.classifyfield'), config.typeField || 'typeField', config.data, context),
      valueField: getFieldFormItem($t('term.report.numberfield'), config.valueField || 'valueField', config.data, context),
      xLabel: { type: 'text', label: $t('term.report.categoryfielddesc'), value: config.xLabel, isHidden: true },
      yLabel: { type: 'text', label: $t('term.report.valuefielddesc'), value: config.yLabel, isHidden: true },
      tick: { type: 'number', label: $t('term.report.chartsetting.tickcount'), value: config.tick, isHidden: true }
    };
  }
});
