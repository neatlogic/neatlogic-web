<template>
  <div ref="container"></div>
</template>
<script>
import { Column } from '@antv/g2plot';
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
        xField: 'xField',
        yField: 'yField',
        legend: { visible: true, position: 'bottom' },
        color: this.getChartTheme('chart'),
        statistic: {
          visible: true
        },
        meta: {
          xField: {
            alias: this.widget.config.xAxis?.title?.text || this.$t('term.report.axis.xaxistitle')
          },
          yField: {
            alias: this.widget.config.yAxis?.title?.text || this.$t('term.report.axis.yaxistitle')
          }
        }
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
        this.data.push({xField: this.$t('page.data') + i, yField: Math.floor(Math.random() * 100) + 1});
      }
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new Column(this.$refs.container, {
          ...this.chartConfig,
          data: this.finalData
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
      const data = [];
      if (this.data && this.data.length > 0) {
        //数据合并汇聚
        this.data.forEach(d => {
          const dd = data.find(dd => dd.xField == d.xField);
          if (dd) {
            dd.yField += d.yField;
          } else {
            data.push(d);
          }
        });
      }
      return data;
    }
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
