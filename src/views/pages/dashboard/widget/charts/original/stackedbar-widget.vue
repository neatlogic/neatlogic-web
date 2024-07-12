<template>
  <div ref="container"></div>
</template>
<script>
import { Bar } from '@antv/g2plot';
import { WidgetBase } from '../widget-base.js';

export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {},
  data() {
    return {
      plot: null,
      chartConfig: {
        isStack: true,
        autoFit: true,
        xField: 'xField',
        yField: 'yField',
        seriesField: 'seriesField',
        legend: { visible: true, position: 'bottom' },
        meta: {
          xField: { alias: this.$t('term.report.axis.xaxistitle') },
          yField: { alias: this.$t('term.report.axis.yaxistitle') }
        },
        color: this.getChartTheme('chart'),
        statistic: {
          visible: true
        }
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
      for (var i = 0; i < 10; i++) {
        this.data.push({ yField: this.$t('page.data') + Math.floor(i / 2), xField: Math.floor(Math.random() * 100) + 1, seriesField: this.$t('page.group') + (i % 2) });
      }
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new Bar(this.$refs.container, {
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
    }
  },
  filter: {},
  computed: {
    finalData() {
      let data = [];
      if (this.data && this.data.length > 0) {
        //数据合并汇聚
        this.data.forEach(d => {
          const dd = data.find(dd => dd.yField == d.yField && dd.seriesField == d.seriesField);
          if (dd) {
            dd.xField += d.xField;
          } else {
            data.push(d);
          }
        });
      }
      data = data.filter(d => d.xField > 0);
      return data;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
