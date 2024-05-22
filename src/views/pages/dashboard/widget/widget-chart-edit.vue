<template>
  <div class="chart-edit-container">
    <div class="left dividing-color">
      <ChartTypeList
        ref="chartTypeList"
        class="chart-type-list"
        :chart-type="chartType"
        @chartTypeChange="chartTypeChange"
      ></ChartTypeList>
    </div>
    <div class="main">
      <Split v-model="split" mode="vertical" @on-move-end="splitMoveEnd">
        <div slot="top" class="preview bg-grey">
          <WidgetPreview ref="preview" :echodata="previewEchoData" :dataFormConfig="dataFormConfig"></WidgetPreview>
        </div>
        <div slot="bottom" class="operation">
          <div class="options dividing-color">
            <div
              v-for="item in operationList"
              :key="item.text"
              class="item"
              :class="{ active: item.isActive }"
              @click="operationSwitch(item)"
            >{{ item.text }}</div>
          </div>
          <div class="content">
            <WidgetSetting
              v-show="operationList[0].isActive"
              ref="widgetSetting"
              :widgetdata="widgetData"
              @filterDataChange="filterDataChange"
            ></WidgetSetting>
            <!-- 基础设置 -->
            <DataFilter
              v-show="operationList[1].isActive"
              ref="dataFilter"
              :editAdd="editAdd"
              @filterDataChange="filterDataChange"
            ></DataFilter>
            <!-- 数据过滤 -->
            <DataFormat
              v-show="operationList[2].isActive"
              ref="dataFormat"
              :editAdd="editAdd"
              :chartConfig="chartConfig"
              :dataFormConfig="dataFormConfig"
              @backtotick="backtotick"
              @formatDataChange="formatDataChange"
            ></DataFormat>
            <!-- 格式展示 -->
            <!-- <DataHref v-show="operationList[3].isActive" ref="dataHref"></DataHref> -->
          </div>
        </div>
      </Split>
    </div>
    <div v-if="false" style="width: 360px;">
      <pre>
baseData:
{{ baseData }}
chartType:
{{ chartType }}
chartData:
{{ chartData }}
chartConfig:
{{ chartConfig }}
conditionConfig:
{{ conditionConfig }}
</pre>
    </div>
  </div>
</template>

<script>
import DataFilter from './data-filter';
import DataFormat from './data-format';
// import DataHref from './data-href';
import ChartTypeList from './chart-type-list';
import WidgetSetting from './widget-setting';

export default {
  name: 'WidgetChartEdit',
  components: {
    DataFilter,
    DataFormat,
    // DataHref,
    ChartTypeList,
    WidgetSetting,
    WidgetPreview: () => import('./widget-preview')
  },
  props: {
    baseData: Object, // 基础数据
    chartType: String, // 图形类型
    chartData: Object, // 图形数据
    chartConfig: Object, // 图形相关配置
    conditionConfig: Object, // 条件搜索数据
    widgetData: Object, // widget data
    editAdd: String // 编辑或添加
  },
  data() {
    return {
      dataFormConfig: {
        list: [] //格式展示数据列表，请求接口的时候，用来做较验
      },
      split: 0.6,
      previewEchoData: null,
      operationList: [
        {
          text: this.$t('term.dashboard.basicsetting'),
          isActive: true
        },
        {
          text: this.$t('term.dashboard.datafilter'),
          isActive: false
        },
        {
          text: this.$t('term.dashboard.formatdisplay'),
          isActive: false
        }
        // {
        //   text: '链接',
        //   isActive: false
        // }
      ],
      demoDataList: [
        {
          type: this.$t('page.type') + '1',
          value: 38
        },
        {
          type: this.$t('page.type') + '2',
          value: 52
        },
        {
          type: this.$t('page.type') + '3',
          value: 61
        },
        {
          type: this.$t('page.type') + '4',
          value: 145
        },
        {
          type: this.$t('page.type') + '5',
          value: 48
        },
        {
          type: this.$t('page.type') + '6',
          value: 38
        },
        {
          type: this.$t('page.type') + '7',
          value: 38
        },
        {
          type: this.$t('page.type') + '8',
          value: 38
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.conditionConfig && this.conditionConfig.conditionGroupList) {
      // conditionconfig回显
      this.$refs.dataFilter.conditionConfigEcho(this.conditionConfig);
    }
    if (this.chartData && this.chartData.configObj) {
      // chartconfig 回显
      this.$refs.dataFormat.chartConfigEcho(this.chartData.configObj, this.chartType);
    }
    this.changePreview('init', 'init');
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    filterDataChange(data, init) {
      // 搜索
      this.changePreview(data, init);
    },
    formatDataChange(action) {
      // 搜索
      this.changePreview(action);
    },
    backtotick() {
      let chartEdit = this.$refs.chartTypeList;
      // 重新加载一次，只有在添加的时候，才会
      if (chartEdit.chartType) {
        this.$nextTick(() => {
          chartEdit.changeChartTypeActive(chartEdit.chartType);
        });
      }
    },
    getHandlerValue() {
      let handler;
      if (this.baseData) handler = this.baseData.handler;
      else if (this.widgetData) handler = this.widgetData.handler;
      return handler;
    },
    previewDataValid(action) {
      let conditionConfig = this.$refs.dataFilter.getData(action);
      let chartConfig = this.$refs.dataFormat.getData(action);
      let chartType = this.$refs.chartTypeList.getData(action);
      // let isGo = true;
      if (action && action.chartConfig) {
        chartConfig = action.chartConfig;
      }

      if (!chartConfig) return false;
      // let isEmpty = Object.keys(chartConfig).some(k => {
      //   if (k === 'subgroupfield' || k === 'subgroupfieldtext') return false;
      //   if (Array.isArray(chartConfig[k]) && !chartConfig[k].length) return true;
      //   else if (!chartConfig[k]) return true;
      //   return false;
      // });
      // if (isEmpty) isGo = false;

      if (chartConfig.hasOwnProperty('type')) {
        if (chartConfig.type === 'column') {
          // 柱形图特殊处理下
          if (chartConfig.subgroupfield) {
            chartType = 'stackcolumnchart';
          } else {
            chartType = 'columnchart';
          }
        } else if (chartConfig.type === 'bar') {
          if (chartConfig.subgroupfield) {
            chartType = 'stackbarchart';
          } else {
            chartType = 'barchart';
          }
        } else if (chartConfig.type === 'donut') {
          // 饼图处理
          chartType = 'donutchart';
        } else if (chartConfig.type === 'pie') {
          chartType = 'piechart';
        }
      }

      // if (!isGo) {
      // if (this.$refs.preview) {
      //   if (this.$refs.preview) {
      //     this.$refs.preview.demoPlay(chartType, this.demoDataList, chartConfig);
      //   }
      //   return false;
      // }

      return {
        conditionConfig,
        chartConfig,
        chartType: chartType,
        handler: this.getHandlerValue()
      };
    },
    changePreview(action, init) {
      const validPreviewData = this.previewDataValid(action);
      if (!validPreviewData) return;
      if (init === 'init') {
        if (this.chartType === 'numberchart') {
          validPreviewData.chartConfig = this.chartConfig;
          validPreviewData.chartType = this.chartType;
          validPreviewData.conditionConfig = this.conditionConfig;
          validPreviewData.handler = this.getHandlerValue();
        } else {
          let init = this.previewDataValid('init');
          validPreviewData.chartConfig = init.chartConfig;
          validPreviewData.chartType = init.chartType;
          validPreviewData.conditionConfig.conditionGroupList = this.conditionConfig.conditionGroupList;
        }
        // 第一次打开弹窗的时候,初始化赋值
      }

      let isSubmit = true;
      if (this.dataFormConfig.list.length > 0) {
        Object.keys(validPreviewData.chartConfig).forEach(n => {
          this.dataFormConfig.list.forEach(v => {
            if (v.isRequire && v.name === n && !validPreviewData.chartConfig[n]) {
              isSubmit = false;
            }
          });
        });
        // 以上方法为，是否有必填项没填写
      }

      if (isSubmit) {
        if (this.$refs.preview) {
          this.$nextTick(() => {
            this.$refs.preview.changeData({
              ...validPreviewData
            });
          });
        } else {
          this.$nextTick(() => {
            this.previewEchoData = validPreviewData;
          });
        }
      }
    },
    splitMoveEnd() {
      this.$refs.preview.resize();
    },
    chartTypeChange(item) {
      // 切换chartType
      this.$refs.dataFormat.changeChartType(item, this.getHandlerValue());
      // 清空预览窗口
      if (this.$refs.preview) {
        this.$refs.preview.destory();
      }
      // 开启demo演示
      const chartType = this.$refs.chartTypeList.getData();
      if (this.$refs.preview) {
        this.$refs.preview.demoPlay(chartType, this.demoDataList);
      }
    },
    operationSwitch(item) {
      item.isActive = true;
      this.operationList
        .filter(d => d !== item)
        .forEach(d => {
          d.isActive = false;
        });
    },
    validData() {
      let filtervalid = this.$refs.dataFilter.validData();
      let formatvalid = this.$refs.dataFormat.validData();
      let widgetSetting = this.$refs.widgetSetting.validData();

      if (filtervalid && !filtervalid.valid) {
        this.$Message.warning(filtervalid.msg);
        return false;
      }
      if (formatvalid && !formatvalid.valid) {
        this.$Message.warning(formatvalid.msg);
        return false;
      }
      if (widgetSetting && !widgetSetting.valid) {
        this.$Message.warning(widgetSetting.msg);
        return false;
      }
      return true;
    },
    getData() {
      const conditionConfig = this.$refs.dataFilter.getData();
      const chartConfig = this.$refs.dataFormat.getData();
      // 应该从preview里拿最终数据
      const chartData = this.$refs.preview.getData();
      const chartType = this.$refs.preview.getType();
      return {
        chartType: chartType,
        conditionConfig: conditionConfig || {},
        chartConfig: chartConfig || {},
        chartData: chartData || {}
      };
    },
    getFilterData() {
      const o = {
        uuid: 'b384c056cba04574adc21a849ddba3b6',
        widgetList: [
          {
            chartType: 'barchart',
            h: 4,
            handler: 'neatlogic.module.process.dashboard.handler.ProcessTaskDashboardHandler',
            i: 0,
            name: this.$t('page.component') + '1',
            refreshInterval: 3,
            uuid: 'aaaa',
            chartConfig: {
              groupField: 'priority',
              groupFieldText: this.$t('page.priority'),
              aggregate: 'count',
              subGroupField: '',
              valueField: '',
              displaycolumn: ['owner', 'title'],
              sort: 'createTime',
              limit: 10
            },
            conditionConfig: {},
            w: 5,
            x: 0,
            y: 0
          }
        ]
      };
      const filterData = this.$refs.dataFilter.getData();
      return filterData;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>

