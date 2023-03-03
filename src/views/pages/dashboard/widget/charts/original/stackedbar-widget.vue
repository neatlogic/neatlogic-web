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
  props: {
  },
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
          xField: {alias: 'X轴字段'},
          yField: {alias: 'Y轴字段'}
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
      for (var i = 0; i < 10; i++) {
        this.data.push({yField: '数据' + Math.floor(i / 2), xField: Math.floor(Math.random() * 100) + 1, seriesField: '分组' + (i % 2) });
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
          data: this.data
        });
        this.plot.render();
      }
    },
    changeData() {
      this.plot.changeData(this.data);
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less"></style>
