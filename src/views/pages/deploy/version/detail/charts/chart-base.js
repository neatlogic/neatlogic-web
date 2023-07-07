import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';
export const WidgetBase = {
  props: {
    chartConfig: { type: Object }, //组件配置
    axiosParams: { type: Object }, // 接口请求的参数
    title: {
      type: String, // 图标顶部标题说明
      default: ''
    }
  },
  data() {
    return {
      data: [],
      chartBaseConfig: {
        // 基础图标配置
        ...this.chartConfig,
        width: 250,
        height: 250,
        legend: {
          layout: 'horizontal',
          position: 'bottom'
        }
      }
    };
  },
  methods: {
    getChartTheme(param) {
      let list = ThemeUtils.getValueListByType('dashboard');
      let temList = [];
      list.forEach(v => {
        if (v.param === param) {
          temList = v.value;
        }
      });
      return temList;
    },
    createPlot() {
      //创建组件，由子组件覆盖
    },
    changeData(data) {
      //刷新组件数据，由子组件继承
    },
    handleGroupData(chartData) {
      // 处理分组数据，返回数据格式：[{xField: 1, yField: 2, categoryField: '分类名称'}]
      let chartDataList = chartData ? chartData.data : [];
      let legend = chartData ? chartData.legend : {}; // 标签快名称
      let legendList = Object.keys(legend) || [];
      let tempList = [];
      chartDataList && chartDataList && chartDataList.forEach((item) => {
        // 处理分组的数据
        if (item.buildTime) {
          legendList.forEach((v) => {
            tempList.push({
              xField: this.$utils.getDateByFormat(item.buildTime, 'MM-dd HH:mm'),
              yField: item[v],
              categoryField: legend[v]
            });
          });
        }
      });
      return tempList;
    }
  },
  beforeDestroy() {
    if (this.plot) {
      this.plot.destroy();
      this.plot = null;
    }
  },
  watch: {}
};
