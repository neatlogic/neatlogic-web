import {$t} from '@/resources/init.js';

export default { 
  name: 'bar', 
  label: $t('term.dashboard.barchart'), 
  type: 'bar', 
  icon: 'tsfont-storage', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 500, 
  height: 200, 
  padding: 5, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.xfield'), type: 'number', isRequired: true }, 
    { name: 'yField', label: $t('term.report.axis.yfield'), type: 'text', isRequired: true } 
  ], 
  config: { 
    legend: { visible: true, position: 'bottom' }, 
    barWidthRatio: 0.5, 
    color: '', 
    yAxis: { 
      label: { 
        autoHide: true, 
        autoEllipsis: true 
      }, 
      title: { text: '' } 
    }, 
    xAxis: { title: { text: '' } },
    label: {
      position: 'right',
      visible: true,
      offset: 0, // 设置偏移量为0，柱状图和文本标签距离不需要太远
      layout: [
        {
          type: 'limit-in-plot' // 限制文本标签在图形范围内，可以防止文本标签于图表组件如坐标轴发生重叠遮挡
        }
      ]
    } 
  } 
};
