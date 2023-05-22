<template>
  <div class="grid" :style="{ '--count': finalData.length }">
    <div v-for="(d, index) in finalData" :key="index">
      <div :ref="d.appType + 'Container'" style="text-align: center"></div>
      <div style="text-align: center">{{ d.appTypeName }}</div>
    </div>
  </div>
</template>
<script>
import { RingProgress } from '@antv/g2plot';

export default {
  name: '',
  components: {},
  props: {
    data: { type: Array }
  },
  data() {
    return {
      plots: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.plots.length > 0) {
      this.plots.forEach(p => {
        p.destroy();
        p = null;
      });
      this.plots = [];
    }
  },
  destroyed() {},
  methods: {
    init() {
      if (this.plots.length > 0) {
        this.plots.forEach(p => {
          p.destroy();
          p = null;
        });
        this.plots = [];
      }
      if (this.finalData && this.finalData.length > 0) {
        this.finalData.forEach(data => {
          const plot = new RingProgress(this.$refs[data.appType + 'Container'][0], {
            height: 100,
            width: 100,
            autoFit: true,
            percent: data.count && data.doneCount ? data.doneCount / data.count : 0,
            innerRadius: 0.85,
            radius: 0.98,
            color: ['#25b864', '#E8EDF3'],
            statistic: {
              title: {
                style: { color: '#25b864', fontSize: '12px', lineHeight: '14px' },
                formatter: () => this.$t('page.completed')
              }
            }
          });
          plot.render();
          this.plots.push(plot);
        });
      }
    }
  },
  filter: {},
  computed: {
    finalData() {
      const dataList = [];
      if (this.data && this.data.length > 0) {
        this.data.forEach(d => {
          let existsData = dataList.find(dd => dd.appType === d.appType);
          if (!existsData) {
            existsData = d;
            dataList.push(existsData);
          } else {
            existsData.count += d.count;
          }
          if (d.isEnd) {
            existsData.doneCount = d.count;
          }
        });
      }
      return dataList;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(var(--count, 1), minmax(100px, 1fr));
  gap: 10px;
}
</style>
