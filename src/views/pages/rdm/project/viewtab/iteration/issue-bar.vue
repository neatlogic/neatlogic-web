<template>
  <div ref="container"></div>
</template>
<script>
import { Bar } from '@antv/g2plot';

export default {
  name: '',
  components: {},
  props: {
    data: {type: Array}
  },
  data() {
    return {
      localData: this.$utils.deepClone(this.data),
      plot: null
    };
  },
  beforeCreate() {},
  created() {
   
  },
  beforeMount() {},
  mounted() {
    this.createPlot();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.plot) {
      this.plot.destroy();
      this.plot = null;
    }
  },
  destroyed() {},
  methods: {
    createPlot() {
      if (this.plot) {
        this.plot.destroy();
        this.plot = null;
      }
      if (this.$refs.container) {
        this.plot = new Bar(this.$refs.container, {
          height: 100,
          yAxis: false,
          xAxis: false,
          yField: 'yField',
          xField: 'count',
          seriesField: 'appTypeName',
          legend: {
            position: 'bottom-left'
          },
          label: {
            position: 'middle',
            content: (item) => {
              return item.count;
            },
            style: {
              fill: '#fff'
            }
          },
          color: ({appTypeName}) => {
            //g2plot的限制，只能获取seriesField的值
            const dd = this.finalData.find(d => d.appTypeName === appTypeName);
            if (dd) {
              return dd.appTypeColor;
            }
          },
          //isPercent: true,
          isStack: true,
          data: this.finalData
        });
        this.plot.render();
      }
    }
  },
  filter: {},
  computed: {
    finalData() {
      const dataList = [];
      if (this.localData && this.localData.length > 0) {
        this.localData.forEach(d => {
          const existsData = dataList.find(dd => dd.appType === d.appType);
          
          if (!existsData) {
            dataList.push({...d, yField: '任务'});
          } else {
            existsData.count += d.count;
          }
        });
      }
      return dataList;
    }
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
