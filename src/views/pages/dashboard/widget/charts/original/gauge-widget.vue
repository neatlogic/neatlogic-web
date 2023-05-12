<template>
  <div ref="container"></div>
</template>
<script>
import { Gauge } from '@antv/g2plot';
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
        }
      },
      color: this.getChartTheme('chart')
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
        this.plot = new Gauge(this.$refs.container, {
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
