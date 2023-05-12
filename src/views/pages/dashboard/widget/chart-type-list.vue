<template>
  <div style="height: 100%; width: 100%; position: relative;">
    <div
      v-for="item in chartList"
      :key="item.text"
      class="item"
      :class="{ active: item.isActive }"
      @click="chartListSwitch(item)"
    >
      <i class="icon" :class="item.icon"></i>
      <span>{{ item.text }}</span>
    </div>
    <Loading
      v-if="isLoading"
      :loading-show="isLoading"
      class="loadingclass"
      type="fix"
    ></Loading>
  </div>
</template>

<script>
export default {
  name: 'DataTypeList',
  props: {
    chartType: String
  },
  data() {
    return {
      isLoading: false,
      chartList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getChartList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeChartTypeActive(chartType) {
      const activeChart = this.chartList.find(d => {
        if (Array.isArray(d.chartTypeList)) {
          return d.chartTypeList.some(a => a.value === chartType);
        } else return d.chartType === chartType;
      });
      activeChart &&
        this.$nextTick(() => {
          this.chartListSwitch(activeChart);
        });
    },
    getData() {
      const item = this.chartList.find(d => d.isActive);
      let type;
      if (item) {
        type = item.chartTypeList.find(d => d.isDefault);
      }
      if (type) return type.value;
      else return this.chartType;
    },
    getChartList() {
      // 左侧列表
      this.isLoading = true;
      this.$api.dashboard.dashboard.chartList({}).then(res => {
        if (res.Status === 'OK') {
          const dataList = res.Return;
          this.chartList.push(
            ...dataList.map(d => {
              d.isActive = false;
              return d;
            })
          );
          // chart type acitve
          if (this.chartType) {
            this.changeChartTypeActive(this.chartType);
          }

          this.isLoading = false;
        }
      });
    },
    chartListSwitch(item) {
      item.isActive = true;
      this.chartList
        .filter(d => d !== item)
        .forEach(d => {
          d.isActive = false;
        });
      this.$emit('chartTypeChange', item);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
