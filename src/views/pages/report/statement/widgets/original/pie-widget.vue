<template>
  <div ref="container"></div>
</template>
<script>
import { Pie } from '@antv/g2plot';
import { WidgetBase } from '../widget-base.js';
import * as themes from '../../widgetthemes/index.js';

const STATISTIC_TEXT_TYPES = ['title', 'content'];
const STATISTIC_STYLE_NAMES = ['color', 'fill'];
const DEFAULT_STATISTIC_TEXT_COLORS = ['#4b535e', 'rgba(44,53,66,0.85)', '#595959'];

export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {},
  data() {
    return {
      plot: null,
      chartConfig: {
        autoFit: true,
        angleField: 'angleField',
        colorField: 'colorField',
        theme: this.canvas.config.theme && themes[this.canvas.config.theme]
      }
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
      for (var i = 1; i <= 5; i++) {
        this.data.push({ colorField: this.$t('page.data') + i, angleField: Math.floor(Math.random() * 100) + 1 });
      }
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new Pie(this.$refs.container, {
          ...this.getThemedChartConfig(),
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
    getThemedChartConfig() {
      const chartConfig = this.$utils.deepClone(this.chartConfig);
      const theme = this.getChartTheme();
      if (!theme) {
        return chartConfig;
      }
      const statisticColor = this.getStatisticTextColor(theme);
      if (statisticColor) {
        this.setStatisticTextColor(chartConfig, statisticColor);
      }
      return chartConfig;
    },
    getStatisticTextColor(theme) {
      return theme.StatisticText?.content?.style?.color || theme.StatisticText?.content?.style?.fill || theme.labels?.style?.fill || theme.components?.legend?.common?.itemName?.style?.fill;
    },
    setStatisticTextColor(chartConfig, color) {
      chartConfig.statistic = { ...chartConfig.statistic };
      STATISTIC_TEXT_TYPES.forEach(type => {
        chartConfig.statistic[type] = {
          ...chartConfig.statistic[type],
          style: { ...chartConfig.statistic[type]?.style }
        };
        STATISTIC_STYLE_NAMES.forEach(styleName => {
          if (this.isDefaultTextColor(chartConfig.statistic[type].style[styleName])) {
            chartConfig.statistic[type].style[styleName] = color;
          }
        });
      });
    },
    isDefaultTextColor(color) {
      if (!color) {
        return true;
      }
      return DEFAULT_STATISTIC_TEXT_COLORS.includes(String(color).toLowerCase());
    }
  },
  filter: {},
  computed: {
    finalData() {
      const data = [];
      if (this.data && this.data.length > 0) {
        //数据合并汇聚
        this.data.forEach(d => {
          const dd = data.find(dd => dd.colorField == d.colorField);
          if (dd) {
            dd.angleField += d.angleField;
          } else {
            data.push(d);
          }
        });
      }
      return data;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
