import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';
export const WidgetBase = {
  props: {
    presetData: { type: Object }, //预设数据，用于替换内置变量
    widgetComponent: { type: Object }, //组件配置
    widget: { type: Object } //组件数据
  },
  data() {
    return {
      data: [],
      tableData: {},
      timer: null,
      oldConfig: null,
      oldChartConfig: null,
      chartConfig: {}
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
    async createRandomData() {
      //生成随机数据，返回data，由子组件继承
    },
    async getData(isFirstGetData) {
      const data = [];
      const conditionList = this.widget.conditionList;
      //有预设值需要把预设值设进条件列表中，后台进行替换
      if (this.presetData) {
        if (conditionList && conditionList.length > 0) {
          conditionList.forEach(condition => {
            condition.presetData = this.presetData;
          });
        }
      }
      const params = {
        dataSourceId: this.widget.datasourceId,
        conditionList: conditionList,
        sortList: this.widget.sortList,
        limit: this.widget.limit
      };
      await this.$api.framework.datawarehouse.searchData(params).then(res => {
        this.tableData = res.Return;
        if (res.Return.tbodyList && res.Return.tbodyList.length > 0) {
          res.Return.tbodyList.forEach(element => {
            const d = {};
            if (this.widgetComponent.fields && this.widgetComponent.fields.length > 0) {
              this.widgetComponent.fields.forEach(field => {
                const f = this.widget.fields.find(d => d.name === field.name);
                if (f) {
                  d[field.name] = element['field_' + f.datasourceField];
                }
              });
            } else {
              res.Return.theadList.forEach(head => {
                if (head.name) {
                  //有name的字段才是数据源的数据字段
                  d[head.name] = element[head.key];
                }
              });
            }
            data.push(d);
          });
        }
        this.data = data;
        if (!isFirstGetData) {
          //第一次加载由于组件还没加载完毕，所以不需要调用changeData
          this.changeData();
        }
        if (this.widget.dataInterval > 0) {
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
          this.timer = setTimeout(() => {
            this.getData();
          }, this.widget.dataInterval * 1000);
        }
      });
    }
  },
  beforeDestroy() {
    if (this.plot) {
      this.plot.destroy();
      this.plot = null;
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },
  watch: {
    'canvas.config.theme': function(val) {
      if (val) {
        this.$set(this.chartConfig, 'theme', themes[this.canvas.config.theme]);
      } else {
        this.$delete(this.chartConfig, 'theme');
      }
      this.createPlot();
    },
    widget: {
      handler: async function(val, oldVal) {
        const widget = val;
        //console.log(JSON.stringify(widget, null, 2));
        if (widget) {
          //合并图形配置
          Object.assign(this.chartConfig, widget.config);
          if (!this.oldChartConfig) {
            //旧配置为空代表是首次加载
            this.oldChartConfig = this.$utils.deepClone(this.chartConfig);
            if (widget.dataType === 'static' && widget.fields && widget.fields.length > 0) {
              this.data = [];
              widget.fields.forEach(element => {
                const d = {};
                d[element.name] = element.value;
                this.data.push(d);
              });
            } else if (widget.dataType === 'dynamic' && widget.datasourceId && (!this.widgetComponent.fields || this.widgetComponent.fields.length == 0 || (widget.fields && widget.fields.length == this.widgetComponent.fields.length && widget.fields.filter(d => !d.datasourceField).length == 0))) {
              await this.getData(true);
            } else {
              await this.createRandomData();
            }
            this.$nextTick(() => {
              //等待容器加载完毕再异步重绘
              this.createPlot();
            });
            //保存数据相关配置，必须要复制一个对象
            const config = {};
            config['fields'] = widget.fields;
            config['datasourceId'] = widget.datasourceId;
            config['conditionList'] = widget.conditionList;
            config['sortList'] = widget.sortList;
            config['limit'] = widget.limit;
            config['dataInterval'] = widget.dataInterval;
            config['dataType'] = widget.dataType;
            this.oldConfig = this.$utils.deepClone(config);
          } else if (!this.$utils.isSame(this.oldChartConfig, this.chartConfig)) {
            //如果不是首次加载，则可以同步重绘
            this.createPlot();
            this.oldChartConfig = this.$utils.deepClone(this.chartConfig);
          }

          //和数据相关的变化才会触发更新
          const config = {};
          config['fields'] = widget.fields;
          config['datasourceId'] = widget.datasourceId;
          config['conditionList'] = widget.conditionList;
          config['sortList'] = widget.sortList;
          config['limit'] = widget.limit;
          config['dataInterval'] = widget.dataInterval;
          config['dataType'] = widget.dataType;
          if (!this.$utils.isSame(this.oldConfig, config)) {
            if (widget.dataType === 'static' && widget.fields && widget.fields.length > 0) {
              this.data = [];
              widget.fields.forEach(element => {
                const d = {};
                d[element.name] = element.value;
                this.data.push(d);
              });
              this.changeData();
            } else if (widget.dataType === 'dynamic' && widget.datasourceId && (!this.widgetComponent.fields || this.widgetComponent.fields.length == 0 || (widget.fields && widget.fields.length == this.widgetComponent.fields.length && widget.fields.filter(d => !d.datasourceField).length == 0))) {
              this.getData();
            } else {
              this.createRandomData();
              this.changeData();
            }
            this.oldConfig = this.$utils.deepClone(config);
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
