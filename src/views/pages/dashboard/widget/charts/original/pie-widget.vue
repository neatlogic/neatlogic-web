<template>
  <div ref="container"></div>
</template>
<script>
import { Pie } from '@antv/g2plot';
import { WidgetBase } from '../widget-base.js';

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
        angleField: 'angleField',
        colorField: 'colorField',
        color: this.getChartTheme('chart')
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
  },
  destroyed() {},
  methods: {
    createRandomData() {
      this.data = [];
      for (var i = 1; i <= 5; i++) {
        this.data.push({colorField: this.$t('page.data') + i, angleField: Math.floor(Math.random() * 100) + 1});
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
      const statisticColor = this.getFieldTextColor();
      if (statisticColor) {
        chartConfig.statistic = { ...chartConfig.statistic };
        ['title', 'content'].forEach(type => {
          chartConfig.statistic[type] = {
            ...chartConfig.statistic[type],
            style: { ...chartConfig.statistic[type]?.style }
          };
          ['color', 'fill'].forEach(styleName => {
            const path = `statistic.${type}.style.${styleName}`;
            if (this.isEmptyColor(this.getByPath(this.widget?.config, path))) {
              chartConfig.statistic[type].style[styleName] = statisticColor;
            }
          });
        });
      }
      return chartConfig;
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
  watch: {
  }
};
</script>
<style lang="less"></style>
