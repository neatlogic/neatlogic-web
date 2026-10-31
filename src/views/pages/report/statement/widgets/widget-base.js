import * as themes from '../widgetthemes/index.js';
import { getDatasourceType } from '@/resources/api/report/statement/datasource';

function mergeWidgetConfig(defaultConfig, currentConfig) {
  const result = Array.isArray(defaultConfig) ? [...defaultConfig] : { ...(defaultConfig || {}) };
  Object.keys(currentConfig || {}).forEach(key => {
    const currentValue = currentConfig[key];
    const defaultValue = result[key];
    if (
      currentValue &&
      typeof currentValue === 'object' &&
      !Array.isArray(currentValue) &&
      defaultValue &&
      typeof defaultValue === 'object' &&
      !Array.isArray(defaultValue)
    ) {
      result[key] = mergeWidgetConfig(defaultValue, currentValue);
    } else {
      result[key] = currentValue;
    }
  });
  return result;
}

export const WidgetBase = {
  props: {
    width: { type: Number },
    height: { type: Number },
    canvas: { type: Object },
    widget: { type: Object }, //组件数据
    widgetComponent: { type: Object } //组件定义
  },
  data() {
    return {
      data: [],
      tableData: {},
      timer: null,
      // 只保留请求失效、销毁和首次绘制所需状态。
      dataRequestId: 0,
      isWidgetDestroyed: false,
      isPlotInitialized: false,
      oldConfig: null,
      oldChartConfig: null,
      chartConfig: {}
    };
  },
  methods: {
    createPlot() {
      //创建组件，由子组件覆盖
    },
    changeData(data) {
      //刷新组件数据，由子组件继承
    },
    async createRandomData() {
      //生成随机数据，返回data，由子组件继承
    },
    getChartThemeName() {
      if (this.canvas && this.canvas.config && this.canvas.config.theme) {
        return this.canvas.config.theme;
      }
      return this.$store && this.$store.getters.themeType === 'dark' ? 'THEME_DARK' : 'THEME_LIGHT';
    },
    getChartTheme() {
      return themes[this.getChartThemeName()];
    },
    setChartTheme() {
      const theme = this.getChartTheme();
      if (theme) {
        this.$set(this.chartConfig, 'theme', theme);
      } else {
        this.$delete(this.chartConfig, 'theme');
      }
    },
    async getData(isFirstGetData) {
      // 新请求替代旧请求，绑定未就绪或组件已销毁时不再取数。
      const requestId = ++this.dataRequestId;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this.isWidgetDestroyed || !this.isDynamicDataReady(this.widget)) {
        return false;
      }
      const data = [];
      const params = {
        dataSourceId: this.widget.datasourceId,
        // 展示页直接兼容旧配置，不依赖编辑页先补齐并保存来源类型。
        datasourceType: getDatasourceType(this.widget.datasourceType),
        conditionList: this.widget.conditionList,
        sortList: this.widget.sortList,
        limit: this.widget.limit || 0 //必须要要给个0，否则会用pagesize分页
      };
      const fields = this.$utils.deepClone(this.widget.fields);
      // 同时核对实时来源和绑定，覆盖 Vue watcher 尚未执行的微任务窗口。
      const isCurrent = () => !this.isWidgetDestroyed && requestId === this.dataRequestId && this.isDynamicDataReady(this.widget) &&
        this.widget.datasourceId === params.dataSourceId && getDatasourceType(this.widget.datasourceType) === params.datasourceType && this.$utils.isSame(this.widget.fields, fields);
      // 编辑预览、展示页及定时刷新共用报表数据源入口。
      return this.$api.report.statement.searchDatasourceData(params).then(res => {
        if (!isCurrent()) {
          return false;
        }
        this.tableData = res.Return;
        if (res.Return.tbodyList && res.Return.tbodyList.length > 0) {
          res.Return.tbodyList.forEach(element => {
            const d = {};
            if (this.widgetComponent.fields && this.widgetComponent.fields.length > 0) {
              const widgetFields = this.widget.fields || [];
              this.widgetComponent.fields.forEach(field => {
                const f = widgetFields.find(d => d.name === field.name);
                if (f) {
                  // 优先使用字段 ID 对应的数据；行中不存在该字段时，兼容数据仓库的 field_ 前缀格式。
                  d[field.name] = Object.prototype.hasOwnProperty.call(element, f.datasourceField)
                    ? element[f.datasourceField]
                    : element['field_' + f.datasourceField];
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
          if (this.isPlotInitialized) {
            this.changeData();
          } else {
            // 原首请求失效时，最新请求仍负责完成首次绘制。
            this.$nextTick(() => {
              if (isCurrent() && !this.isPlotInitialized) {
                this.createPlot();
                this.isPlotInitialized = true;
              }
            });
          }
        }
        if (isCurrent() && this.widget.dataInterval > 0) {
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
          this.timer = setTimeout(() => {
            // 已进入任务队列的旧定时器也不能查询新来源或失效绑定。
            if (isCurrent()) {
              this.timer = null;
              this.getData();
            }
          }, this.widget.dataInterval * 1000);
        }
        return true;
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
    },
    isDynamicDataReady(widget) {
      if (!widget || widget.dataType !== 'dynamic' || !widget.datasourceId) {
        return false;
      }
      if (!this.widgetComponent.fields || this.widgetComponent.fields.length === 0) {
        return true;
      }
      const widgetFields = widget.fields || [];
      // 只要求必填字段完成绑定，可选字段未绑定时不阻塞动态数据加载。
      return this.widgetComponent.fields
        .filter(field => field.isRequired !== false)
        .every(field => {
          const bindField = widgetFields.find(item => item.name === field.name);
          return bindField && bindField.datasourceField;
        });
    }
  },
  beforeDestroy() {
    // 先失效在途回调，避免销毁后重新绘制或启动刷新。
    this.isWidgetDestroyed = true;
    this.dataRequestId += 1;
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
    'canvas.config.theme': function() {
      this.setChartTheme();
      if (this.changeCusTheme) {
        this.changeCusTheme(this.getChartThemeName());
      }
      this.createPlot();
    },
    systemThemeType: function() {
      if (!this.canvas || !this.canvas.config || !this.canvas.config.theme) {
        this.setChartTheme();
        if (this.changeCusTheme) {
          this.changeCusTheme(this.getChartThemeName());
        }
        this.createPlot();
      }
    },
    widget: {
      handler: async function(val, oldVal) {
        const widget = val;
        if (widget && !this.isWidgetDestroyed) {
          //合并图形配置
          // 深度合并图形配置，避免旧报表的局部配置覆盖掉组件默认嵌套配置。
          this.chartConfig = mergeWidgetConfig(this.chartConfig, widget.config || {});
          this.setChartTheme();
          if (this.changeCusTheme) {
            this.changeCusTheme(this.getChartThemeName());
          }
          if (!this.oldChartConfig) {
            //旧配置为空代表是首次加载
            this.oldChartConfig = this.$utils.deepClone(this.chartConfig);
            // 首次配置在 await 前保存，旧请求恢复执行时不能覆盖最新配置。
            const config = {};
            config['fields'] = widget.fields;
            config['datasourceId'] = widget.datasourceId;
            // 来源类型属于取数配置，同 ID 切换来源也应触发刷新。
            config['datasourceType'] = getDatasourceType(widget.datasourceType);
            config['conditionList'] = widget.conditionList;
            config['sortList'] = widget.sortList;
            config['limit'] = widget.limit;
            config['dataInterval'] = widget.dataInterval;
            config['dataType'] = widget.dataType;
            this.oldConfig = this.$utils.deepClone(config);
            const initialConfig = this.oldConfig;
            let requestId = this.dataRequestId;
            // 首次 await 与 nextTick 都检查快照，避免旧 watcher 继续绘制或进入末尾分支。
            const isCurrent = () => !this.isWidgetDestroyed && requestId === this.dataRequestId && this.widget && this.$utils.isSame(this.oldConfig, initialConfig) &&
              this.widget.dataType === initialConfig.dataType && this.widget.datasourceId === initialConfig.datasourceId && getDatasourceType(this.widget.datasourceType) === initialConfig.datasourceType && this.$utils.isSame(this.widget.fields, initialConfig.fields);
            if (widget.dataType === 'static' && widget.fields && widget.fields.length > 0) {
              this.data = [];
              widget.fields.forEach(element => {
                const d = {};
                d[element.name] = element.value;
                this.data.push(d);
              });
            } else if (this.isDynamicDataReady(widget)) {
              const dataRequest = this.getData(true);
              requestId = this.dataRequestId;
              if (await dataRequest === false) {
                return;
              }
            } else {
              await this.createRandomData();
            }
            if (!isCurrent()) {
              return;
            }
            this.$nextTick(() => {
              //等待容器加载完毕再异步重绘
              if (isCurrent()) {
                this.createPlot();
                this.isPlotInitialized = true;
              }
            });
          } else if (!this.$utils.isSame(this.oldChartConfig, this.chartConfig)) {
            //如果不是首次加载，则可以同步重绘
            this.createPlot();
            this.oldChartConfig = this.$utils.deepClone(this.chartConfig);
          }

          //和数据相关的变化才会触发更新
          const config = {};
          config['fields'] = widget.fields;
          config['datasourceId'] = widget.datasourceId;
          // 与首次加载快照使用相同缺省规则，避免旧配置产生额外请求。
          config['datasourceType'] = getDatasourceType(widget.datasourceType);
          config['conditionList'] = widget.conditionList;
          config['sortList'] = widget.sortList;
          config['limit'] = widget.limit;
          config['dataInterval'] = widget.dataInterval;
          config['dataType'] = widget.dataType;
          if (!this.$utils.isSame(this.oldConfig, config)) {
            const previousConfig = this.oldConfig;
            const dataConfig = this.$utils.deepClone(config);
            this.oldConfig = dataConfig;
            // 数据配置变化立即失效旧请求并停止刷新，后续请求仍使用原分支。
            const requestId = ++this.dataRequestId;
            if (this.timer) {
              clearTimeout(this.timer);
              this.timer = null;
            }
            const sourceChanged = previousConfig && (previousConfig.datasourceType !== config.datasourceType || previousConfig.datasourceId !== config.datasourceId);
            if (previousConfig && previousConfig.dataType === 'dynamic' && (sourceChanged || !this.isDynamicDataReady(widget))) {
              this.data = [];
              this.tableData = {};
              if (this.isPlotInitialized) {
                this.changeData();
              }
            }
            if (widget.dataType === 'static' && widget.fields && widget.fields.length > 0) {
              this.data = [];
              widget.fields.forEach(element => {
                const d = {};
                d[element.name] = element.value;
                this.data.push(d);
              });
              if (this.isPlotInitialized) {
                this.changeData();
              }
            } else if (this.isDynamicDataReady(widget)) {
              this.getData();
            } else {
              this.createRandomData();
              if (this.isPlotInitialized) {
                this.changeData();
              }
            }
            if (!this.isDynamicDataReady(widget) && !this.isPlotInitialized) {
              // 初始取数失效后若切到静态/样例，也需由当前配置补齐首次绘制。
              this.$nextTick(() => {
                if (!this.isWidgetDestroyed && requestId === this.dataRequestId && this.widget && this.widget.dataType === dataConfig.dataType &&
                  this.widget.datasourceId === dataConfig.datasourceId && getDatasourceType(this.widget.datasourceType) === dataConfig.datasourceType && this.$utils.isSame(this.widget.fields, dataConfig.fields)) {
                  this.createPlot();
                  this.isPlotInitialized = true;
                }
              });
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
