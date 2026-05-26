<template>
  <div ref="container" class="gauge-widget"></div>
</template>
<script>
import { Gauge } from '@antv/g2plot';
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
      lastPercent: null,
      chartConfig: {
        autoFit: true,
        animation: false,
        range: {
          color: ''
        },
        indicator: {
          pointer: {
            style: {
              stroke: '#D0D0D0'
            }
          },
          pin: {
            style: {
              stroke: '#D0D0D0'
            }
          }
        },
        statistic: {
          content: {
            style: {
              fontSize: '36px',
              lineHeight: '36px'
            }
          }
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
      this.data.push({'number': Math.random()});
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.setContainerOverflow();
        const percent = this.finalData;
        this.plot = new Gauge(this.$refs.container, {
          ...this.chartConfig,
          percent: percent
        });
        this.lastPercent = percent;
        this.plot.render();
        this.setContainerOverflow();
      }
    },
    changeData() {
      const percent = this.finalData;
      if (this.plot && percent !== this.lastPercent) {
        this.plot.changeData(percent);
        this.lastPercent = percent;
      }
    },
    setContainerOverflow() {
      if (this.$refs.container) {
        this.$refs.container.style.overflow = 'hidden';
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
<style lang="less" scoped>
.gauge-widget {
  overflow: hidden !important;
  width: 100%;
  height: 100%;
  ::v-deep div {
    overflow: hidden !important;
  }
}
</style>
