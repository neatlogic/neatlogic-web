<template>
  <div class="story-overview border-color radius-lg bg-op mb-md">
    <div class="overview-header border-color" @click="toggleCollapse">
      <div class="text-title">
        <span :class="isCollapsed ? 'tsfont-right' : 'tsfont-down'"></span>
        <span class="ml-xs">需求概览</span>
      </div>
      <div class="action-group" @click.stop>
        <span v-if="activeStatus" class="action-item">
          <span class="text-grey">当前状态：</span>
          <span :style="{ color: activeStatus.color }">{{ activeStatus.label || activeStatus.name }}</span>
          <span class="tsfont-close ml-xs text-action" @click="clearStatus"></span>
        </span>
        <span class="action-item tsfont-refresh" @click="refresh">刷新</span>
      </div>
    </div>
    <div v-show="!isCollapsed" class="overview-body">
      <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
      <div v-if="errorMessage" class="text-grey text-center pt-md pb-md">{{ errorMessage }}</div>
      <template v-else>
        <div class="metric-grid">
          <div v-for="metric in metricList" :key="metric.key" class="metric-item border-color">
            <div class="text-grey fz10">{{ metric.label }}</div>
            <div class="metric-value" :class="metric.className">{{ metric.value }}</div>
          </div>
        </div>
        <div class="chart-grid">
          <div class="chart-panel border-color">
            <div class="chart-title">需求状态比例</div>
            <div class="status-chart-layout">
              <div v-if="hasStatusData" ref="statusChart" class="chart-container"></div>
              <NoData v-else class="chart-empty"></NoData>
              <div class="status-list">
                <div
                  v-for="status in statusList"
                  :key="status.id"
                  class="status-item"
                  :class="{ 'active': activeStatusId === status.id }"
                  @click="selectStatus(status)"
                >
                  <span class="status-dot" :style="{ background: status.color || chartTheme.iconColor }"></span>
                  <span class="status-name overflow">{{ status.label || status.name }}</span>
                  <span class="text-grey">{{ status.issueCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="chart-panel border-color">
            <div class="chart-title">优先级分布</div>
            <div v-if="priorityList.length > 0" ref="priorityChart" class="chart-container"></div>
            <NoData v-else class="chart-empty"></NoData>
          </div>
          <div class="chart-panel border-color">
            <div class="chart-title">近7个月需求/逾期趋势</div>
            <div v-if="trendList.length > 0" ref="trendChart" class="chart-container"></div>
            <NoData v-else class="chart-empty"></NoData>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import { Pie, Column } from '@antv/g2plot';
import themes from '@/views/pages/dashboard/widget/charts/theme';
import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';

export default {
  name: '',
  components: {},
  props: {
    projectId: { type: Number },
    app: { type: Object },
    catalog: { type: Number }
  },
  data() {
    return {
      isCollapsed: false,
      isLoading: false,
      errorMessage: '',
      overviewData: {},
      activeStatusId: null,
      statusPlot: null,
      priorityPlot: null,
      trendPlot: null,
      themeObserver: null,
      themeClass: this.getCurrentThemeClass()
    };
  },
  mounted() {
    this.initThemeObserver();
    this.refresh();
  },
  beforeDestroy() {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('chartThemeChange', this.handleChartThemeChange);
    }
    this.destroyPlot();
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
      if (!this.isCollapsed) {
        this.$nextTick(() => {
          this.renderCharts();
        });
      }
    },
    refresh() {
      if (!this.projectId || !this.app || !this.app.id) {
        return;
      }
      this.isLoading = true;
      this.errorMessage = '';
      this.$api.rdm.issue
        .getIssueOverview({
          projectId: this.projectId,
          appId: this.app.id,
          catalog: this.catalog
        })
        .then(res => {
          this.overviewData = res.Return || {};
          this.$nextTick(() => {
            this.renderCharts();
          });
        })
        .catch(() => {
          this.errorMessage = '需求概览加载失败';
          this.destroyPlot();
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    selectStatus(status) {
      this.activeStatusId = this.activeStatusId === status.id ? null : status.id;
      this.$emit('status-change', this.activeStatusId ? [this.activeStatusId] : []);
    },
    clearStatus() {
      const hasActiveStatus = this.activeStatusId !== null;
      this.activeStatusId = null;
      if (hasActiveStatus) {
        this.$emit('status-change', []);
      }
    },
    renderCharts() {
      if (this.isCollapsed) {
        return;
      }
      this.renderStatusChart();
      this.renderPriorityChart();
      this.renderTrendChart();
    },
    renderStatusChart() {
      if (this.statusPlot) {
        this.statusPlot.destroy();
        this.statusPlot = null;
      }
      if (!this.$refs.statusChart || !this.hasStatusData) {
        return;
      }
      const chartTheme = this.chartTheme;
      this.statusPlot = new Pie(this.$refs.statusChart, {
        height: 180,
        appendPadding: 0,
        data: this.statusChartData,
        angleField: 'issueCount',
        colorField: 'label',
        radius: 0.9,
        innerRadius: 0.62,
        legend: false,
        label: false,
        statistic: {
          title: {
            content: '总数',
            style: {
              color: chartTheme.textColor,
              fontSize: '18px',
              fontWeight: 400
            }
          },
          content: {
            content: this.statusChartTotal.toString(),
            style: {
              color: chartTheme.textColor,
              fontSize: '24px',
              fontWeight: 500
            }
          }
        },
        pieStyle: {
          stroke: 'transparent',
          lineWidth: 0
        },
        theme: this.getChartThemeConfig(),
        tooltip: {
          domStyles: this.getTooltipDomStyles(),
          formatter: data => {
            return { name: data.label, value: data.issueCount };
          }
        },
        color: ({ label }) => this.getStatusColor(label)
      });
      this.statusPlot.on('element:click', event => {
        const data = event && event.data && event.data.data;
        if (data) {
          this.selectStatus(data);
        }
      });
      this.statusPlot.render();
    },
    renderPriorityChart() {
      if (this.priorityPlot) {
        this.priorityPlot.destroy();
        this.priorityPlot = null;
      }
      if (!this.$refs.priorityChart || this.priorityList.length === 0) {
        return;
      }
      const chartTheme = this.chartTheme;
      this.priorityPlot = new Column(this.$refs.priorityChart, {
        height: 180,
        appendPadding: 0,
        data: this.priorityList,
        xField: 'name',
        yField: 'issueCount',
        legend: false,
        theme: this.getChartThemeConfig(),
        label: {
          position: 'top',
          style: {
            fill: chartTheme.textColor,
            stroke: 'transparent',
            lineWidth: 0
          }
        },
        columnStyle: {
          stroke: 'transparent',
          lineWidth: 0
        },
        xAxis: {
          label: {
            autoHide: true,
            autoRotate: false,
            style: this.getAxisLabelStyle()
          },
          title: {
            style: this.getAxisLabelStyle()
          },
          line: this.getAxisLineConfig(),
          tickLine: this.getAxisTickConfig()
        },
        yAxis: {
          min: 0,
          nice: true,
          label: {
            style: this.getAxisLabelStyle()
          },
          title: {
            style: this.getAxisLabelStyle()
          },
          grid: this.getAxisGridConfig()
        },
        tooltip: {
          domStyles: this.getTooltipDomStyles()
        },
        color: data => data.color || chartTheme.primaryColor
      });
      this.priorityPlot.render();
    },
    renderTrendChart() {
      if (this.trendPlot) {
        this.trendPlot.destroy();
        this.trendPlot = null;
      }
      if (!this.$refs.trendChart || this.trendChartData.length === 0) {
        return;
      }
      const chartTheme = this.chartTheme;
      this.trendPlot = new Column(this.$refs.trendChart, {
        height: 180,
        appendPadding: 0,
        data: this.trendChartData,
        xField: 'month',
        yField: 'count',
        seriesField: 'type',
        isGroup: true,
        theme: this.getChartThemeConfig(),
        columnStyle: {
          stroke: 'transparent',
          lineWidth: 0
        },
        legend: {
          position: 'top-right',
          text: {
            style: this.getChartTextStyle()
          },
          itemName: {
            style: this.getChartTextStyle()
          }
        },
        xAxis: {
          label: {
            autoHide: true,
            autoRotate: false,
            style: this.getAxisLabelStyle()
          },
          title: {
            style: this.getAxisLabelStyle()
          },
          line: this.getAxisLineConfig(),
          tickLine: this.getAxisTickConfig()
        },
        yAxis: {
          min: 0,
          nice: true,
          label: {
            style: this.getAxisLabelStyle()
          },
          title: {
            style: this.getAxisLabelStyle()
          },
          grid: this.getAxisGridConfig()
        },
        tooltip: {
          domStyles: this.getTooltipDomStyles()
        },
        color: ({ type }) => {
          return type === '逾期' ? chartTheme.warningColor : chartTheme.primaryColor;
        }
      });
      this.trendPlot.render();
    },
    destroyPlot() {
      [this.statusPlot, this.priorityPlot, this.trendPlot].forEach(plot => {
        if (plot) {
          plot.destroy();
        }
      });
      this.statusPlot = null;
      this.priorityPlot = null;
      this.trendPlot = null;
    },
    initThemeObserver() {
      if (typeof window === 'undefined') {
        return;
      }
      window.addEventListener('chartThemeChange', this.handleChartThemeChange);
      if (window.MutationObserver) {
        this.themeObserver = new MutationObserver(() => {
          this.handleChartThemeChange();
        });
        this.themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class']
        });
      }
    },
    handleChartThemeChange() {
      this.themeClass = this.getCurrentThemeClass();
      this.$nextTick(() => {
        this.renderCharts();
      });
    },
    getCurrentThemeClass() {
      if (typeof window === 'undefined') {
        return 'theme-default';
      }
      if (document.documentElement.classList.contains('theme-dark') || document.body.classList.contains('theme-dark')) {
        return 'theme-dark';
      }
      if (this.$el && this.$el.closest('.theme-dark')) {
        return 'theme-dark';
      }
      return localStorage.getItem('themeClass') || 'theme-default';
    },
    getChartTextStyle() {
      return {
        fill: this.chartTheme.textColor,
        color: this.chartTheme.textColor,
        stroke: 'transparent',
        fontSize: 12
      };
    },
    getAxisLabelStyle() {
      return this.getChartTextStyle();
    },
    getStatusColor(label) {
      const status = this.statusChartData.find(item => item.label === label);
      return status ? status.color : this.chartTheme.primaryColor;
    },
    getDashboardChartTheme(param) {
      const list = ThemeUtils.getValueListByType('dashboard');
      const chartTheme = list.find(item => item.param === param);
      return chartTheme ? chartTheme.value : [];
    },
    getThemeTextColor() {
      const legendStyle = this.dashboardTheme?.legend?.text?.style || {};
      const labelStyle = this.dashboardTheme?.axis?.x?.label?.style || {};
      const yLabelStyle = this.dashboardTheme?.axis?.y?.label?.style || {};
      const labelDefaultStyle = this.dashboardTheme?.label?.style || {};
      if (legendStyle.fill) {
        return legendStyle.fill;
      }
      if (labelStyle.fill) {
        return labelStyle.fill;
      }
      if (yLabelStyle.fill) {
        return yLabelStyle.fill;
      }
      return labelDefaultStyle.fill || this.dashboardTheme?.defaultColor;
    },
    getThemeDividingColor() {
      return this.dashboardTheme?.axis?.y?.grid?.line?.style?.stroke || this.dashboardTheme?.axis?.x?.line?.style?.stroke || this.getThemeTextColor();
    },
    getThemeTooltipStyle() {
      return this.dashboardTheme?.components?.tooltip?.domStyles?.['g2-tooltip'] || {};
    },
    getAxisLineConfig() {
      return {
        style: {
          stroke: this.chartTheme.dividingColor,
          lineWidth: 1
        }
      };
    },
    getAxisTickConfig() {
      return {
        style: {
          stroke: this.chartTheme.dividingColor,
          lineWidth: 1
        }
      };
    },
    getAxisGridConfig() {
      return {
        line: {
          style: {
            stroke: this.chartTheme.dividingColor,
            lineWidth: 1,
            lineDash: [4, 4],
            opacity: 0.55
          }
        }
      };
    },
    getTooltipDomStyles() {
      const chartTheme = this.chartTheme;
      const dashboardTooltipStyle = this.getThemeTooltipStyle();
      return {
        'g2-tooltip': {
          ...dashboardTooltipStyle,
          color: chartTheme.textColor
        },
        'g2-tooltip-title': {
          color: chartTheme.textColor
        },
        'g2-tooltip-list-item': {
          color: chartTheme.textColor
        },
        'g2-tooltip-name': {
          color: chartTheme.textColor
        },
        'g2-tooltip-value': {
          color: chartTheme.textColor
        }
      };
    },
    getChartThemeConfig() {
      return {
        ...this.dashboardTheme,
        backgroundStyle: {
          fill: 'transparent'
        },
        axis: {
          x: {
            label: {
              style: this.getAxisLabelStyle()
            },
            title: {
              style: this.getAxisLabelStyle()
            }
          },
          y: {
            label: {
              style: this.getAxisLabelStyle()
            },
            title: {
              style: this.getAxisLabelStyle()
            },
            grid: this.getAxisGridConfig()
          }
        },
        legend: {
          text: {
            style: this.getChartTextStyle()
          },
          itemName: {
            style: this.getChartTextStyle()
          }
        },
        components: {
          tooltip: {
            domStyles: this.getTooltipDomStyles()
          }
        }
      };
    }
  },
  computed: {
    dashboardTheme() {
      return this.themeClass === 'theme-dark' ? themes.dark : themes.default;
    },
    dashboardChartColorList() {
      // 让定制主题调色板随浅色/深色皮肤切换重新取值。
      this.themeClass;
      return this.getDashboardChartTheme('chart');
    },
    chartTheme() {
      const chartColorList = this.dashboardChartColorList;
      return {
        textColor: this.getThemeTextColor(),
        titleColor: this.dashboardTheme?.title?.fill || this.getThemeTextColor(),
        dividingColor: this.getThemeDividingColor(),
        primaryColor: chartColorList[3] || this.dashboardTheme.defaultColor,
        warningColor: chartColorList[2] || this.dashboardTheme.defaultColor,
        iconColor: this.getThemeTextColor()
      };
    },
    metricList() {
      const totalCount = this.overviewData.totalCount || 0;
      return [
        { key: 'total', label: '需求总数', value: totalCount },
        { key: 'overdue', label: '逾期需求总数', value: this.overviewData.overdueCount || 0, className: 'text-error' },
        { key: 'complete', label: '完成率', value: this.completeRateText, className: 'text-success' },
        { key: 'risk', label: '高风险需求数', value: this.overviewData.highRiskCount || 0, className: 'text-warning' }
      ];
    },
    completeRateText() {
      const completeRate = this.overviewData.completeRate || 0;
      return (completeRate * 100).toFixed(2) + '%';
    },
    statusList() {
      return this.overviewData.statusList || [];
    },
    priorityList() {
      return this.overviewData.priorityList || [];
    },
    trendList() {
      return this.overviewData.trendList || [];
    },
    statusChartData() {
      return this.statusList
        .filter(item => (item.issueCount || 0) > 0)
        .map(item => ({
          id: item.id,
          label: item.label || item.name,
          color: item.color,
          issueCount: item.issueCount || 0
        }));
    },
    statusChartTotal() {
      return this.statusChartData.reduce((sum, item) => sum + (item.issueCount || 0), 0);
    },
    trendChartData() {
      const dataList = [];
      this.trendList.forEach(item => {
        dataList.push({ month: item.month, type: '需求', count: item.totalCount || 0 });
        dataList.push({ month: item.month, type: '逾期', count: item.overdueCount || 0 });
      });
      return dataList;
    },
    hasStatusData() {
      return this.statusChartData.length > 0;
    },
    activeStatus() {
      return this.statusList.find(status => status.id === this.activeStatusId);
    }
  },
  watch: {
    projectId() {
      this.clearStatus();
      this.refresh();
    },
    app: {
      handler() {
        this.clearStatus();
        this.refresh();
      },
      deep: false
    },
    catalog() {
      this.clearStatus();
      this.refresh();
    }
  }
};
</script>
<style lang="less" scoped>
.story-overview {
  position: relative;
  border: 1px solid;
}
.overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid;
  cursor: pointer;
}
.overview-body {
  position: relative;
  padding: 12px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 10px;
}
.metric-item {
  min-height: 62px;
  padding: 10px 12px;
  border: 1px solid;
  border-radius: 6px;
}
.metric-value {
  margin-top: 6px;
  font-size: 22px;
  line-height: 26px;
  font-weight: 600;
}
.chart-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr 1.25fr;
  gap: 10px;
  margin-top: 10px;
}
.chart-panel {
  min-width: 0;
  min-height: 230px;
  padding: 10px;
  border: 1px solid;
  border-radius: 6px;
}
.chart-title {
  margin-bottom: 8px;
  font-weight: 600;
}
.chart-container {
  height: 180px;
}
.chart-empty {
  height: 180px;
}
.status-chart-layout {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 150px;
  gap: 8px;
  align-items: center;
}
.status-list {
  min-width: 0;
}
.status-item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 4px;
  border-radius: 4px;
  cursor: pointer;
}
.status-item:hover,
.status-item.active {
  background: rgba(64, 128, 255, 0.08);
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-name {
  min-width: 0;
}
@media screen and (max-width: 1280px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
@media screen and (max-width: 960px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}
</style>
