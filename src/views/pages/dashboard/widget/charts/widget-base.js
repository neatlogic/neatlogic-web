import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';

const CHART_TEXT_THEME = {
  field: { param: 'chart-field-text', light: '#8C8C8C', dark: '#ffffff' },
  dataLabel: { param: 'chart-data-label-text', light: '#121212', dark: '#ffffff' }
};
const AXIS_TEXT_PATHS = ['label.style.fill', 'title.style.fill'];
const LEGEND_TEXT_PATHS = ['legend.text.style.fill', 'legend.itemName.style.fill', 'legend.pageNavigator.text.style.fill'];

export const WidgetBase = {
  props: {
    presetData: { type: Object }, //预设数据，用于替换内置变量
    widgetComponent: { type: Object }, //组件配置
    widget: { type: Object }, //组件数据
    height: { type: Number, default: 0 } //组件高度
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
      const item = ThemeUtils.getValueListByType('dashboard').find(v => v.param === param);
      return item ? item.value : [];
    },
    getThemeColor(config) {
      const color = this.getChartTheme(config.param);
      const fallback = this.systemThemeType === 'dark' || localStorage.themeClass === 'theme-dark' ? config.dark : config.light;
      if (Array.isArray(color)) {
        return color[0] || fallback;
      }
      return color || fallback;
    },
    getFieldTextColor() {
      return this.getThemeColor(CHART_TEXT_THEME.field);
    },
    getDataLabelTextColor() {
      return this.getThemeColor(CHART_TEXT_THEME.dataLabel);
    },
    getPolarChartPadding() {
      // 极坐标图在小组件中使用 auto padding 会被标签和图例挤出画布，因此按容器和图例方位预留空间。
      if (this.chartConfig?.padding != null && this.chartConfig.padding !== 'auto') {
        return this.chartConfig.padding;
      }
      const container = this.$refs.container;
      const width = container?.clientWidth || 0;
      const height = container?.clientHeight || this.height || 0;
      const minSize = Math.max(Math.min(width || height, height || width), 1);
      const basePadding = Math.max(Math.min(Math.round(minSize * 0.1), 24), 12);
      const padding = [basePadding, basePadding, basePadding, basePadding];
      const legend = this.chartConfig?.legend;
      if (legend && legend !== false && legend.visible !== false) {
        const position = legend.position || 'bottom';
        const horizontalSpace = Math.max(Math.min(Math.round(height * 0.22), 64), 40);
        const verticalSpace = Math.max(Math.min(Math.round(width * 0.18), 100), 64);
        if (position.startsWith('top')) {
          padding[0] = horizontalSpace;
        } else if (position.startsWith('bottom')) {
          padding[2] = horizontalSpace;
        } else if (position.startsWith('left')) {
          padding[3] = verticalSpace;
        } else if (position.startsWith('right')) {
          padding[1] = verticalSpace;
        }
      }
      return padding;
    },
    getByPath(target, path) {
      if (!target || !path) {
        return undefined;
      }
      return path.split('.').reduce((obj, key) => {
        return obj == null ? undefined : obj[key];
      }, target);
    },
    setByPath(target, path, value) {
      if (!target || !path || !value) {
        return;
      }
      const keyList = path.split('.');
      let current = target;
      keyList.forEach((key, index) => {
        if (index === keyList.length - 1) {
          this.$set(current, key, value);
        } else {
          if (!current[key] || typeof current[key] !== 'object') {
            this.$set(current, key, {});
          }
          current = current[key];
        }
      });
    },
    isEmptyColor(color) {
      if (color == null || color === '') {
        return true;
      }
      if (Array.isArray(color)) {
        return color.length === 0;
      }
      if (typeof color === 'object') {
        const colorList = Object.values(color);
        return colorList.length === 0 || colorList.every(item => this.isEmptyColor(item));
      }
      return false;
    },
    setDefaultChartColor() {
      if (this.chartConfig && Object.prototype.hasOwnProperty.call(this.chartConfig, 'color') && this.isEmptyColor(this.widget?.config?.color)) {
        this.$set(this.chartConfig, 'color', this.getChartTheme('chart'));
      }
    },
    setThemeStyleIfEmpty(chartPath, value, configPath) {
      if (this.isEmptyColor(this.getByPath(this.widget?.config, configPath || chartPath))) {
        this.setByPath(this.chartConfig, chartPath, value);
      }
    },
    setDefaultAxisStyle(axisName) {
      const axisConfig = this.chartConfig?.[axisName];
      if (axisConfig === false) {
        return;
      }
      const textColor = this.getFieldTextColor();
      const setAxisItemStyle = (chartPrefix, configPrefix) => {
        AXIS_TEXT_PATHS.forEach(path => {
          this.setThemeStyleIfEmpty(`${chartPrefix}.${path}`, textColor, `${configPrefix}.${path}`);
        });
      };
      if (Array.isArray(axisConfig)) {
        axisConfig.forEach((axis, index) => {
          if (axis !== false) {
            setAxisItemStyle(`${axisName}.${index}`, `${axisName}.${index}`);
          }
        });
      } else {
        setAxisItemStyle(axisName, axisName);
      }
    },
    setDefaultDataLabelStyle() {
      const textColor = this.getDataLabelTextColor();
      if (this.chartConfig?.label && this.chartConfig.label !== false) {
        this.setThemeStyleIfEmpty('label.style.fill', textColor);
      }
      if (Array.isArray(this.chartConfig?.geometryOptions)) {
        this.chartConfig.geometryOptions.forEach((geometry, index) => {
          if (geometry?.label && geometry.label !== false) {
            this.setThemeStyleIfEmpty(`geometryOptions.${index}.label.style.fill`, textColor);
          }
        });
      }
    },
    setDefaultLegendStyle() {
      if (!this.chartConfig?.legend || this.chartConfig.legend === false) {
        return;
      }
      const textColor = this.getFieldTextColor();
      LEGEND_TEXT_PATHS.forEach(path => {
        this.setThemeStyleIfEmpty(path, textColor);
      });
    },
    setDefaultChartTextStyle() {
      this.setDefaultDataLabelStyle();
      this.setDefaultLegendStyle();
      if (this.chartConfig?.xAxis !== undefined || this.chartConfig?.xField) {
        this.setDefaultAxisStyle('xAxis');
      }
      if (this.chartConfig?.yAxis !== undefined || this.chartConfig?.yField) {
        this.setDefaultAxisStyle('yAxis');
      }
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
    setStaticData() {
      this.data = [];
      if (this.widget.fields && this.widget.fields.length > 0) {
        this.widget.fields.forEach(element => {
          const data = {};
          data[element.name] = element.value;
          this.data.push(data);
        });
      }
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
        limit: this.widget.limit || 0 //必须要要给个0，否则会用pagesize分页
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
        this.data = data.sort((a, b) => this.changeString(a.xField) - this.changeString(b.xField));
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
    },
    changeString(a) { //字符串转时间戳
      if (a) {
        if (this.$utils.isValidDateTime(a)) {
          return new Date(a).getTime();
        } else if (this.$utils.isValidTimeString(a)) {
          const pad = num => num.toString().padStart(2, '0');
          const [h1, m1, s1 = '00'] = a.split(':').map(pad);
          return `${h1}${m1}${s1}`; 
        } else if (typeof a === 'string') {
          return a.charCodeAt(0);
        }
        return a;
      }
      return a;
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
  computed: {
    systemThemeType() {
      return this.$store && this.$store.getters.themeType;
    }
  },
  watch: {
    systemThemeType: function() {
      this.setDefaultChartColor();
      this.setDefaultChartTextStyle();
      this.createPlot();
    },
    widget: {
      handler: async function(val, oldVal) {
        const widget = val;
        if (widget) {
          //合并图形配置
          Object.assign(this.chartConfig, this.$utils.deepClone(widget.config));
          this.setDefaultChartColor();
          this.setDefaultChartTextStyle();
          if (!this.oldChartConfig) {
            //旧配置为空代表是首次加载
            this.oldChartConfig = this.$utils.deepClone(this.chartConfig);
            if (widget.dataType === 'static' && widget.fields && widget.fields.length > 0) {
              this.setStaticData();
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
              this.setStaticData();
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
