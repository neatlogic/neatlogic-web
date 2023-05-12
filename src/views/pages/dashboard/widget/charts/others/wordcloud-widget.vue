<template>
  <div ref="container"></div>
</template>
<script>
import { WordCloud } from '@antv/g2plot';
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
        wordField: 'wordField',
        weightField: 'weightField',
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
  beforeDestroy() {},
  destroyed() {},
  methods: {
    createRandomData() {
      this.data = [];
      for (var i = 1; i <= 50; i++) {
        this.data.push({wordField: this.$t('page.data') + i, colorField: this.$t('page.data') + i, weightField: Math.floor(Math.random() * 100) });
      }
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new WordCloud(this.$refs.container, {
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
