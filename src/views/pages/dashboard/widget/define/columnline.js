import { $t } from '@/resources/init.js';

export default {
  name: 'columnline',
  label: '柱线混合图',
  type: 'columnline',
  icon: 'tsfont-chart-polyline',
  widgetType: 'basic',
  hasCustomConfig: true,
  width: 5,
  height: 5,
  padding: 10,
  needData: true, 
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }],
  fields: [
    { name: 'type', label: '图形分类字段', type: 'text', isRequired: true },
    { name: 'xField', label: $t('term.report.axis.xfield'), type: 'date', isRequired: true },
    { name: 'yField', label: $t('term.report.axis.yfield'), type: 'number', isRequired: true },
    { name: 'seriesField', label: $t('term.report.chartsetting.groupfield'), type: 'text', isRequired: false }
  ],
  config: {
    legend: { visible: true, position: 'bottom' }, 
    geometryOptions: [
      {
        geometry: 'column',
        columnWidthRatio: 0.4,
        label: {
          visible: true
        }
      },
      {
        geometry: 'line',
        seriesField: 'seriesField',
        point: {
          visible: true
        },
        label: {
          visible: true
        }
      }
    ],
    xField: 'xField',
    yField: ['yField', 'yField'],
    lineSeriesField: 'seriesField'
  }
};
