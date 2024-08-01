import {$t} from '@/resources/init.js';

export default { 
  name: 'column', 
  label: $t('term.report.chartsetting.columnchart'), 
  type: 'column', 
  icon: 'tsfont-chart-bar', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 500, 
  height: 200, 
  padding: 5, 
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }], 
  fields: [ 
    { name: 'xField', label: $t('term.report.axis.xfield'), type: 'text', isRequired: true }, 
    { name: 'yField', label: $t('term.report.axis.yfield'), type: 'number', isRequired: true } 
  ], 
  config: { 
    legend: { visible: true, position: 'bottom' }, 
    columnWidthRatio: 0.5, 
    color: '', 
    yAxis: { title: { text: '' } }, 
    xAxis: { 
      label: { 
        autoHide: true, 
        autoEllipsis: true 
      }, 
      title: { text: '' } 
    },
    label: {
      visible: true,
      position: 'top',
      offset: 0, // 设置偏移量为0，柱状图和文本标签距离不需要太远
      layout: [
        {
          type: 'limit-in-plot' // 限制文本标签在图形范围内，可以防止文本标签于图表组件如坐标轴发生重叠遮挡
        }
      ]
    }
  } 
};
