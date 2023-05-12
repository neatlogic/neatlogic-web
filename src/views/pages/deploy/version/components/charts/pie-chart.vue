<template>
  <div>
    <div class="mb-xs">{{ title }}</div>
    <div ref="container"></div>
  </div>
</template>
<script>
import { Pie } from '@antv/g2plot'; // 饼图
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
      pieChartConfig: {
        autoFit: true,
        angleField: 'yField', // 显示value的值
        colorField: 'xField', // 显示的中文名,
        color: this.getChartTheme('chart'),
        radius: 1,
        innerRadius: 0.5,
        statistic: {
          title: false,
          content: {
            content: '' // 中间说明文字不显示
          }
        },
        label: {
          // 布局标签
          type: 'outer',
          content: '{name}{value}'
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
  beforeDestroy() {},
  destroyed() {},
  methods: {
    createRandomData() {
      this.data = [];
      for (var i = 1; i <= 5; i++) {
        this.data.push({colorField: this.$t('page.data') + i, angleField: Math.floor(Math.random() * 100) + 1});
      }
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new Pie(this.$refs.container, {
          data: this.data,
          ...this.pieChartConfig,
          ...this.chartBaseConfig
        });
        this.plot.render();
      }
    },
    async getChartData() {
      if (this.axiosParams) {
        this.data = [];
        await this.$api.deploy.version.getVersionChart(this.axiosParams).then((res) => {
          if (res.Status == 'OK') {
            let chartDataList = res.Return ? res.Return.data : [];
            chartDataList && chartDataList && chartDataList.forEach((item) => {
              this.data.push({
                xField: item.name,
                yField: item.value
              });
            });
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
