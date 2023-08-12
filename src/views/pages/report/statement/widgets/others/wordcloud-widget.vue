<template>
  <div ref="container"></div>
</template>
<script>
import { WordCloud } from '@antv/g2plot';
import { WidgetBase } from '../widget-base.js';
import * as themes from '../../widgetthemes/index.js';

export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {},
  data() {
    return {
      plot: null,
      chartConfig: {
        autoFit: true,
        wordField: 'wordField',
        weightField: 'weightField',
        colorField: 'colorField',
        theme: this.canvas.config.theme && themes[this.canvas.config.theme]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
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
        this.data.push({ wordField: this.$t('page.data') + i, colorField: this.$t('page.data') + i, weightField: Math.floor(Math.random() * 100) });
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
          const dd = data.find(dd => dd.wordField == d.wordField && dd.colorField == d.colorField);
          if (dd) {
            dd.weightField += d.weightField;
          } else {
            data.push(d);
          }
        });
      }
      return data;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
