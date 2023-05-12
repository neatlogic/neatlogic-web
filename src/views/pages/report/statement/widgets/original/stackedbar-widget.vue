<template>
  <div ref="container"></div>
</template>
<script>
import { Bar } from '@antv/g2plot';
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
        isStack: true,
        autoFit: true,
        xField: 'xField',
        yField: 'yField',
        seriesField: 'seriesField',
        legend: { visible: true, position: 'bottom' },
        meta: {
          xField: {alias: this.$t('term.report.axis.xfield')},
          yField: {alias: this.$t('term.report.axis.yfield')}
        },
        statistic: {
          visible: true
        },
        theme: this.canvas.config.theme && themes[this.canvas.config.theme]
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
        this.data.push({yField: this.$t('page.data') + Math.floor(i / 2), xField: Math.floor(Math.random() * 100) + 1, seriesField: this.$t('page.group') + (i % 2) });
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
