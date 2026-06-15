import { $t } from '@/resources/init.js';

export default {
  name: 'treemap',
  label: '矩形树图',
  type: 'treemap',
  icon: 'tsfont-chart-treemap',
  widgetType: 'basic',
  hasCustomConfig: true,
  width: 420,
  height: 260,
  padding: 5,
  needData: true,
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }],
  fields: [
    { name: 'nameField', label: '节点名称', type: ['text', 'date', 'datetime', 'time'], isRequired: true },
    { name: 'valueField', label: '数值', type: 'number', isRequired: true },
    { name: 'categoryField', label: '一级分类', type: ['text', 'date', 'datetime', 'time'], isRequired: false, description: '可选。绑定后按分类分组展示；不绑定时按单层结构展示。' }
  ],
  config: {
    appendPadding: [14, 14, 42, 14],
    color: ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16'],
    legend: {
      visible: true,
      position: 'bottom',
      itemName: {
        style: {
          fill: 'rgba(233,251,255,0.86)'
        }
      }
    },
    label: {
      visible: true,
      style: {
        fill: '#ffffff'
      }
    },
    drilldown: {
      enabled: false
    },
    hierarchyConfig: {
      tile: 'treemapSquarify'
    },
    rectStyle: {
      lineWidth: 1,
      stroke: 'rgba(255,255,255,0.65)'
    },
    tooltip: {
      showMarkers: false,
      showTitle: false
    }
  }
};
