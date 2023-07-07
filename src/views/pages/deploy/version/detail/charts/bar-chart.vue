<template>
  <div>
    <div class="mb-xs">{{ title }}</div>
    <div ref="container"></div>
  </div>
</template>
<script>
import { Column } from '@antv/g2plot';
import { WidgetBase } from './chart-base.js';

export default {
  name: '', // 柱状图
  components: {},
  extends: WidgetBase,
  props: {
  },
  data() {
    return {
      plot: null,
      barChartConfig: {
        autoFit: true,
        isGroup: true,
        xField: 'xField',
        yField: 'yField',
        seriesField: 'categoryField', // 分组字段名称
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
  async mounted() {
    await this.getChartData();
    this.createPlot();
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
      for (var i = 1; i <= 10; i++) {
        this.data.push({yField: this.$t('page.data') + i, xField: Math.floor(Math.random() * 100) + 1});
      }
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new Column(this.$refs.container, {
          ...this.barChartConfig,
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
