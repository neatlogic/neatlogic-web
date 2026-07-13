import { $t } from '@/resources/init.js';

export default {
  name: 'treemap',
  label: $t('term.report.treemap'),
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
    { name: 'nameField', label: $t('term.report.nodename'), type: ['text', 'date', 'datetime', 'time'], isRequired: true },
    { name: 'valueField', label: $t('term.report.chartsetting.value'), type: 'number', isRequired: true },
    { name: 'categoryField', label: $t('term.report.primarycategory'), type: ['text', 'date', 'datetime', 'time'], isRequired: false, description: $t('term.report.treemapcategorydesc') }
  ],
  config: {
    appendPadding: [14, 14, 42, 14],
    color: ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16'],
    legend: {
      visible: true,
      position: 'bottom',
      itemName: {
        style: {
          fill: ''
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
