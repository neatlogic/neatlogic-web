import { createChartRule } from './chart-rule-factory';
import { getDataSourceColumnList, getDataSourceFormItem } from './rule-util';

function getFieldFormItem(label, value, dataName, context) {
  const columnList = getDataSourceColumnList(dataName, context);
  return {
    type: 'select',
    label,
    value,
    dataList: columnList.map(column => ({ value: column, text: column })),
    allowCreate: true,
    search: true,
    desc: columnList.length > 0 ? '从当前数据源字段中选择，也可手工输入' : '未识别到字段，可手工输入'
  };
}

export default createChartRule({
  name: 'drawPie',
  label: '饼图',
  icon: 'tsfont-chart-pie',
  extraFormConfig(config, context) {
    return {
      data: getDataSourceFormItem(config, context, { minColumnCount: 2 }),
      typeField: getFieldFormItem('分类字段', config.typeField || 'typeField', config.data, context),
      valueField: getFieldFormItem('数值字段', config.valueField || 'valueField', config.data, context),
      xLabel: { type: 'text', label: '分类字段说明', value: config.xLabel, isHidden: true },
      yLabel: { type: 'text', label: '数值字段说明', value: config.yLabel, isHidden: true },
      tick: { type: 'number', label: '刻度数量', value: config.tick, isHidden: true }
    };
  }
});
