<template>
  <div class="height-100">
    <NoData v-if="chartType && chartData && (!chartData.dataList || !chartData.dataList.length)"></NoData>
    <component
      :is="chartType"
      v-else-if="chartType"
      ref="chart"
      class="height-100"
      :style="setCanvasstyle(chartData)"
      :chartdata="chartData"
      :widgetuuid="widgetuuid"
      action="preview"
      @changeComponent="changeComponent"
    ></component>
    <div v-else class="text-tip text-center" style="line-height:3;">{{ $t('page.nodata') }}</div>
    <Loading
      v-if="isLoading"
      :loading-show="isLoading"
      class="loadingclass"
      type="fix"
    ></Loading>
  </div>
</template>
<script>
import * as components from './charts';
export default {
  name: 'WidgetPreviewVue',
  components: {
    ...components
  },
  props: ['echodata', 'charttype', 'widgetdata', 'dataFormConfig'],
  // dataFormConfig 格式展示数据列表，请求接口的时候，用来做较验
  data() {
    return {
      isLoading: false,
      uuid: '',
      widgetuuid: this.$utils.setUuid(),
      chartType: '',
      chartKey: this.$utils.setUuid(),
      chartData: {
        configObj: {},
        dataList: []
      }
    };
  },
  mounted() {
    this.changeData(this.echodata);
  },
  methods: {
    demoPlay(chartType, dataList, chartConfig) {
      if (!chartType) return;
      this.chartType = chartType;
      this.isLoading = false;
      if (this.$refs.chart) {
        this.$nextTick(() => {
          this.$refs.chart.demoPlay(dataList, chartConfig);
        });
      }
    },
    getType() {
      return this.chartType;
    },
    getData() {
      return this.chartData;
    },
    destory() {
      this.chartType = '';
      this.chartData = null;
    },
    changeComponent() {},
    changeData(data) {
      this.chartType = '';
      if (!data) return;
      // 做相关验证 chartconfig不能为空
      if (!Object.values(data.chartConfig).length) return;
      this.isLoading = true;
      this.chartType = data.chartType;
      let temList = this.$utils.deepClone(data);
      if (this.dataFormConfig.list.length > 0) {
        // 页面第一次进来的时候，是没有这个数据的，只有在选择的时候才会有
        let indexList = [];
        this.dataFormConfig.list.forEach((v, i) => {
          if (v.name === 'subgroupfield') {
            if (!v.isShow) {
              this.dataFormConfig.subgroupfieldValue = '';
            }
            indexList.push(i);
          }
        });
        if (indexList.length === 0) {
          this.dataFormConfig.subgroupfieldValue = '';
        }
      }
      temList.chartConfig.subgroupfield = this.dataFormConfig.subgroupfieldValue;
      this.$api.dashboard.dashboard.getWidgetData({...temList}).then(res => {
        if (res.Status === 'OK') {
          this.isLoading = false;
          const chartdata = res.Return;
          this.chartData = chartdata;
          if (data.chartType === 'tablechart') {
            this.chartData.dataList = this.chartData.tableDataList;
          }

          if (!this.chartData.configObj) {
            this.chartData.configObj = {
              unit: ''
            };
          } else {
            if (!this.chartData.configObj.unit) {
              this.chartData.configObj.unit = '';
            }
          }

          this.$nextTick(() => {
            this.$refs.chart && this.$refs.chart.loadData();
          });
        }
      });
    },
    resize() {
      if (this.$refs.chart) {
        this.$refs.chart.resize();
      }
    }
  },
  computed: {
    setCanvasstyle() {
      return function(chartData) {
        return chartData && (!chartData.dataList || !chartData.dataList.length) ? 'display;none' : '';
      };
    }
  }
};
</script>

<style lang="less" scoped>
.height-100{
  height: 100%;
}
</style>
