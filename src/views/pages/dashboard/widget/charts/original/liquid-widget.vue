<template>
  <div ref="container"></div>
</template>
<script>
import { Liquid } from '@antv/g2plot';
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
        shape: 'circle',
        outline: {
          border: 0,
          distance: 0
        },
        wave: {
          length: 128
        },
        pattern: { type: 'line' },
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
  beforeDestroy() {},
  destroyed() {},
  methods: {
    createRandomData() {
      this.data = [];
      this.data.push({'number': Math.random()});
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new Liquid(this.$refs.container, {
          ...this.chartConfig,
          percent: this.finalData
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
      let number = 0;
      if (this.data && this.data.length > 0) {
        this.data.forEach(d => {
          number += d.number;
        });
      }
      return number;
    }
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
