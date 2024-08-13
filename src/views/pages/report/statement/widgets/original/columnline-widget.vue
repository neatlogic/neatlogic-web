<template>
  <div ref="container"></div>
</template>
<script>
import { DualAxes } from '@antv/g2plot';
import { WidgetBase } from '../widget-base.js';
import * as themes from '../../widgetthemes/index.js';

export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {
  },
  data() {
    return {
      plot: null,
      chartConfig: {
        autoFit: true,
        legend: { visible: true, position: 'bottom' },
        xAxis: {
          grid: {
            visible: false
          },
          label: {
            style: {
              fill: this.canvas.config.theme && themes[this.canvas.config.theme]?.components?.axis?.common?.label?.style?.fill || this.labelColor
            }
          } 
        },
        yAxis: [
          {
            max: 100,
            min: 0,
            grid: {
              visible: false
            },
            label: {
              style: {
                fill: this.canvas.config.theme && themes[this.canvas.config.theme]?.components?.axis?.common?.label?.style?.fill || this.labelColor
              }
            }
          },
          {
            max: 100,
            min: 0,
            visible: false
          }
        ],
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
        meta: {
          yField: {
            alias: '数量'
          }
        },
        lineSeriesField: 'seriesField',
        theme: this.canvas.config.theme && themes[this.canvas.config.theme]
      },
      labelColor: '#8C8C8C'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    createRandomData() {
      this.data = [];
      this.uvData = [];
      this.transformData = [];
      for (var i = 1; i <= 10; i++) {
        this.uvData.push({xField: this.$t('page.group') + i, yField: Math.floor(Math.random() * 100) + 1});
        for (var j = 1; j <= 3; j++) {
          this.transformData.push({ xField: this.$t('page.group') + i, yField: Math.floor(Math.random() * 100) + 1, seriesField: this.$t('page.group') + j });
        }
      }
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new DualAxes(this.$refs.container, {
          ...this.chartConfig,
          data: this.finalData
        });
        this.plot.render();
      }
    },
    changeData() {
      if (this.plot) {
        this.plot.changeData(this.finalData);
      }
    },
    sortByTime(data) {
      return data.sort((a, b) => new Date(a.xField) - new Date(b.xField));
    },
    changeCusTheme(val) {
      // 自定义主题颜色更新
      if (val) {
        this.chartConfig.xAxis.label.style.fill = this.canvas.config.theme && themes[this.canvas.config.theme]?.components?.axis?.common?.label?.style?.fill || this.labelColor;
        this.chartConfig.yAxis[0].label.style.fill = this.canvas.config.theme && themes[this.canvas.config.theme]?.components?.axis?.common?.label?.style?.fill || this.labelColor;
      } else {
        this.chartConfig.xAxis.label.style.fill = this.labelColor;
        this.chartConfig.yAxis[0].label.style.fill = this.labelColor;
      }
    }
  },
  filter: {},
  computed: {
    finalData() {
      let columnData = [];
      let lineData = [];
      if (this.data && this.data.length > 0) {
        const seriesFieldList = this.$utils.uniqueArr(this.$utils.mapArray(this.data, 'seriesField'));
        const timeFieldList = this.$utils.uniqueArr(this.$utils.mapArray(this.data, 'xField'));
        const columnDataList = this.data.filter(d => d.type == 'column');
        const columseriesFieldList = this.$utils.uniqueArr(this.$utils.mapArray(columnDataList, 'seriesField'));
        const lineDataList = this.data.filter(d => d.type == 'line');
        //需要补齐的数据（日期x轴，状态折线数据）
        seriesFieldList.forEach(seriesField => {
          timeFieldList.forEach(time => {
            const columnItem = columnDataList.find(d => d.xField == time);
            if (!columnItem && columseriesFieldList.indexOf(seriesField) > -1) {
              columnData.push({ xField: time, yField: 0, seriesField: seriesField, type: 'column' });
            } 
            const lineItem = lineDataList.find(d => d.xField == time && d.seriesField == seriesField);
            if (!lineItem) {
              lineData.push({ xField: time, yField: 0, seriesField: seriesField, type: 'line' });
            }
          });
        });
        if (columnDataList.length > 0) {
          //数据合并汇聚
          columnDataList.forEach(d => {
            const dd = columnData.find(dd => dd.xField == d.xField);
            if (dd) {
              dd.yField += d.yField;
            } else {
              columnData.push(d);
            }
          });
          // 时间排序
          columnData = this.sortByTime(columnData);
        }
        if (lineDataList.length > 0) {
          //折线数据合并汇聚
          lineDataList.forEach(d => {
            const item = lineData.find(dd => dd.xField == d.xField && dd.seriesField == d.seriesField);
            if (item) {
              item.yField += d.yField;
            } else {
              lineData.push(d);
            }
          });
          // 时间排序
          lineData = this.sortByTime(lineData);
        }
      } else {
        columnData = this.uvData;
        lineData = this.transformData;
      }
      return [columnData, lineData];
    }
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
