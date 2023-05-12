<template>
  <div ref="container"></div>
</template>
<script>
import { Choropleth } from '@antv/l7plot';
import { WidgetBase } from '../widget-base.js';

export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {},
  data() {
    return {
      plot: null,
      chartConfig: {
        autoFit: true
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
    async createRandomData() {
      this.data = [];
      await this.$api.report.reportdata.searchDistrict({ parent: 100000 }).then(res => {
        this.data = res.Return;
        /*this.data.forEach(element => {
          if (element.level === 'district') {
            element.value = Math.random() * 1000;
          }
        });*/
      });
    },
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      console.log(this.data);
      if (this.$refs.container) {
        this.plot = new Choropleth(this.$refs.container, {
          ...this.chartConfig, source: {
            data: this.data,
            joinBy: {
              sourceField: 'adcode',
              geoField: 'adcode'
            }
          }
        });
      }
    },
    changeData() {
      console.log(JSON.stringify(this.data, null, 2));
      // this.polt.changeView({ adcode, level }, { source: { data } });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
