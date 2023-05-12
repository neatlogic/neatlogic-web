<template>
  <div>
    <div class="mb-xs">{{ title }}</div>
    <div ref="container"></div>
  </div>
</template>
<script>
import { Line } from '@antv/g2plot'; // 折线图
import { WidgetBase } from './chart-base.js';

export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {
  },
  data() {
    return {
      plot: null,
      lineChartConfig: {
        autoFit: true,
        xField: 'xField',
        yField: 'yField',
        color: this.getChartTheme('chart'),
        seriesField: 'categoryField' // 分类字段名称
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getChartData();
    this.createPlot();
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
        this.data.push({xField: this.$t('page.data') + i, yField: Math.floor(Math.random() * 100) + 1});
      }
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new Line(this.$refs.container, {
          ...this.lineChartConfig,
          ...this.chartBaseConfig,
          data: this.data
        });
        this.plot.render();
      }
    },
    async getChartData() {
      if (this.axiosParams) {
        this.data = [];
        await this.$api.deploy.version.getVersionChart(this.axiosParams).then((res) => {
          if (res.Status == 'OK') {
            this.data = this.handleGroupData(res.Return);
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
