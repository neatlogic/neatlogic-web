<template>
  <div ref="container"></div>
</template>
<script>
import { Liquid } from '@antv/g2plot';
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
        shape: 'circle',
        outline: {
          border: 0,
          distance: 0
        },
        wave: {
          length: 128
        },
        pattern: { type: 'line' },
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
          percent: this.customData
        });
        this.plot.render();
      }
    },
    changeData() {
      this.plot.changeData(this.customData);
    }
  },
  filter: {},
  computed: {
    customData() {
      if (this.data && this.data.length > 0) {
        return this.data[0]['number'];
      }
      return null;
    }
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
