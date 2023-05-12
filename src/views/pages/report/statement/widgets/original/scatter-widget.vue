<template>
  <div ref="container"></div>
</template>
<script>
import { Scatter } from '@antv/g2plot';
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
  beforeDestroy() {},
  destroyed() {},
  methods: {
    createRandomData() {
      this.data = [];
      for (var i = 1; i <= 10; i++) {
        for (var j = 1; j <= 3; j++) {
          this.data.push({
            xField: Math.floor(Math.random() * 100) + 1,
            yField: Math.floor(Math.random() * 100) + 1,
            sizeField: Math.floor(Math.random() * 100) + 1,
            colorField: this.$t('page.data') + j
          });
        }
      }
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new Scatter(this.$refs.container, {
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
