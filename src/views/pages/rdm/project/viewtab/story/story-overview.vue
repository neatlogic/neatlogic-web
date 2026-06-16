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
        <div class="overview-grid" :style="{ '--overview-panel-count': overviewPanelCount }">
          <div v-for="metric in metricList" :key="metric.key" class="overview-panel metric-panel border-color">
            <div class="chart-title text-grey">{{ metric.label }}</div>
            <div class="metric-value" :class="metric.className">{{ metric.value }}</div>
          </div>
          <div v-if="statusChart.isConfigured && statusChart.hasData" class="overview-panel chart-panel border-color">
            <div class="chart-title">需求状态比例</div>
            <div class="status-chart-layout">
              <div ref="statusChart" class="chart-container"></div>
              <div class="status-list">
                <div
                  v-for="status in statusChart.list"
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
          <div v-if="priorityChart.isConfigured && priorityChart.list.length > 0" class="overview-panel chart-panel border-color">
            <div class="chart-title">优先级分布</div>
            <div ref="priorityChart" class="chart-container"></div>
          </div>
          <div v-if="trendChart.isConfigured && trendChart.hasData" class="overview-panel chart-panel border-color">
            <div class="chart-title">近7个月需求/逾期趋势</div>
            <div ref="trendChart" class="chart-container"></div>
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

const STAT_KEY = {
  TOTAL: 'story_total',
  OVERDUE: 'story_overdue',
  COMPLETE_RATE: 'story_complete_rate',
  HIGH_RISK: 'story_high_risk',
  STATUS_DISTRIBUTION: 'story_status_distribution',
  PRIORITY_DISTRIBUTION: 'story_priority_distribution',
  TREND: 'story_trend'
};

function getFieldValue(data, key) {
  if (!data || !key) {
    return null;
  }
  const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
  const keyList = [key, key.toLowerCase(), key.toUpperCase(), snakeKey, snakeKey.toUpperCase()];
  for (let i = 0; i < keyList.length; i++) {
    const currentKey = keyList[i];
    if (data[currentKey] !== undefined) {
      return data[currentKey];
    }
  }
  return null;
}

function getFirstCountValue(data) {
  if (!data) {
    return null;
  }
  const countKey = Object.keys(data).find(key => key && key.toLowerCase().includes('count'));
  return countKey ? data[countKey] : null;
}

function getNumberValue(data, key) {
  let value = getFieldValue(data, key);
  if (value === null && key === 'issueCount') {
    value = getFirstCountValue(data);
  }
  return Number(value || 0);
}

function getStatValue(stat, defaultValue) {
  if (stat && stat.value !== undefined && stat.value !== null) {
    return stat.value;
  }
  return defaultValue;
}

function getStatDataList(stat, fallbackList) {
  if (stat) {
    const dataList = stat.dataList || stat.datalist || stat.list;
    if (Array.isArray(dataList) && dataList.length > 0) {
      return dataList;
    }
  }
  return fallbackList || [];
}

function normalizeDistributionList(dataList) {
  return (dataList || []).map(item => {
    return {
      ...item,
      id: getFieldValue(item, 'id'),
      name: getFieldValue(item, 'name'),
      label: getFieldValue(item, 'label'),
      color: getFieldValue(item, 'color'),
      issueCount: getNumberValue(item, 'issueCount')
    };
  });
}

function normalizeTrendList(dataList) {
  return (dataList || []).map(item => {
    return {
      ...item,
      month: getFieldValue(item, 'month'),
      totalCount: getNumberValue(item, 'totalCount'),
      overdueCount: getNumberValue(item, 'overdueCount')
    };
  });
}

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
      themeClass: this.getCurrentThemeClass(),
      overviewRequestId: 0,
      statKeyList: [
        STAT_KEY.TOTAL,
        STAT_KEY.OVERDUE,
        STAT_KEY.COMPLETE_RATE,
        STAT_KEY.HIGH_RISK,
        STAT_KEY.STATUS_DISTRIBUTION,
        STAT_KEY.PRIORITY_DISTRIBUTION,
        STAT_KEY.TREND
      ]
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
      const requestId = ++this.overviewRequestId;
      this.isLoading = true;
      this.errorMessage = '';
      this.$api.rdm.issue
        .getIssueOverview({
          projectId: this.projectId,
          appId: this.app.id,
          catalog: this.catalog,
          statKeyList: this.statKeyList
        })
        .then(res => {
          if (requestId !== this.overviewRequestId) {
            return;
          }
          this.overviewData = res.Return || {};
        })
        .catch(() => {
          if (requestId !== this.overviewRequestId) {
            return;
          }
          this.errorMessage = '需求概览加载失败';
          this.overviewData = {};
          this.destroyPlot();
        })
        .finally(() => {
          if (requestId !== this.overviewRequestId) {
            return;
          }
          this.isLoading = false;
          this.$nextTick(() => {
            this.renderCharts();
          });
        });
    },
    selectStatus(status) {
      this.activeStatusId = this.activeStatusId === status.id ? null : status.id;
      this.$emit('filter-change', { [this.statusChart.filterField]: this.activeStatusId ? [this.activeStatusId] : [] });
    },
    clearStatus() {
      const hasActiveStatus = this.activeStatusId !== null;
      this.activeStatusId = null;
      if (hasActiveStatus) {
        this.$emit('filter-change', { [this.statusChart.filterField]: [] });
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
      if (!this.$refs.statusChart || !this.statusChart.hasData) {
        return;
      }
      const chartTheme = this.chartTheme;
      this.statusPlot = new Pie(this.$refs.statusChart, {
        height: 138,
        appendPadding: 0,
        data: this.statusChart.data,
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
            content: this.statusChart.total.toString(),
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
      if (!this.$refs.priorityChart || this.priorityChart.list.length === 0) {
        return;
      }
      const chartTheme = this.chartTheme;
      this.priorityPlot = new Column(this.$refs.priorityChart, {
        height: 138,
        appendPadding: 0,
        data: this.priorityChart.list,
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
          title: null,
          line: this.getAxisLineConfig(),
          tickLine: this.getAxisTickConfig()
        },
        yAxis: {
          min: 0,
          nice: true,
          label: {
            style: this.getAxisLabelStyle()
          },
          title: null,
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
      if (!this.$refs.trendChart || this.trendChart.data.length === 0) {
        return;
      }
      const chartTheme = this.chartTheme;
      this.trendPlot = new Column(this.$refs.trendChart, {
        height: 138,
        appendPadding: 0,
        data: this.trendChart.data,
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
          title: null,
          line: this.getAxisLineConfig(),
          tickLine: this.getAxisTickConfig()
        },
        yAxis: {
          min: 0,
          nice: true,
          label: {
            style: this.getAxisLabelStyle()
          },
          title: null,
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
      const status = this.statusChart.data.find(item => item.label === label);
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
    },
    getStatResult(statKey) {
      const statResultList = this.overviewData.statResultList || [];
      return statResultList.find(item => item.statKey === statKey && item.configured !== false);
    },
    hasStatResultList() {
      return Array.isArray(this.overviewData.statResultList);
    },
    isStatConfigured(statKey, legacyKey) {
      return !this.hasStatResultList() || !!this.getStatResult(statKey) || this.overviewData[legacyKey] !== undefined;
    },
    getStatValue(statKey, legacyKey, defaultValue) {
      return getStatValue(this.getStatResult(statKey), this.overviewData[legacyKey] === undefined ? defaultValue : this.overviewData[legacyKey]);
    },
    getStatDataList(statKey, legacyKey) {
      return getStatDataList(this.getStatResult(statKey), this.overviewData[legacyKey]);
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
      return [
        {
          key: 'overdue',
          isConfigured: this.isStatConfigured(STAT_KEY.OVERDUE, 'overdueCount'),
          label: '逾期需求总数',
          value: this.getStatValue(STAT_KEY.OVERDUE, 'overdueCount', 0),
          className: 'text-error'
        },
        {
          key: 'complete',
          isConfigured: this.isStatConfigured(STAT_KEY.COMPLETE_RATE, 'completeRate'),
          label: '完成率',
          value: (Number(this.getStatValue(STAT_KEY.COMPLETE_RATE, 'completeRate', 0)) * 100).toFixed(2) + '%',
          className: 'text-success'
        },
        {
          key: 'risk',
          isConfigured: this.isStatConfigured(STAT_KEY.HIGH_RISK, 'highRiskCount'),
          label: '高风险需求数',
          value: this.getStatValue(STAT_KEY.HIGH_RISK, 'highRiskCount', 0),
          className: 'text-warning'
        }
      ].filter(metric => metric.isConfigured);
    },
    statusChart() {
      const stat = this.getStatResult(STAT_KEY.STATUS_DISTRIBUTION);
      const list = normalizeDistributionList(this.getStatDataList(STAT_KEY.STATUS_DISTRIBUTION, 'statusList'));
      const data = list
        .filter(item => (item.issueCount || 0) > 0)
        .map(item => ({
          id: item.id,
          label: item.label || item.name,
          color: item.color,
          issueCount: item.issueCount || 0
        }));
      return {
        isConfigured: this.isStatConfigured(STAT_KEY.STATUS_DISTRIBUTION, 'statusList'),
        filterField: (stat && stat.filterField) || 'status',
        list: list,
        data: data,
        total: data.reduce((sum, item) => sum + (item.issueCount || 0), 0),
        hasData: data.length > 0
      };
    },
    priorityChart() {
      return {
        isConfigured: this.isStatConfigured(STAT_KEY.PRIORITY_DISTRIBUTION, 'priorityList'),
        list: normalizeDistributionList(this.getStatDataList(STAT_KEY.PRIORITY_DISTRIBUTION, 'priorityList'))
      };
    },
    trendChart() {
      const list = normalizeTrendList(this.getStatDataList(STAT_KEY.TREND, 'trendList'));
      const dataList = [];
      list.forEach(item => {
        dataList.push({ month: item.month, type: '需求', count: item.totalCount || 0 });
        dataList.push({ month: item.month, type: '逾期', count: item.overdueCount || 0 });
      });
      return {
        isConfigured: this.isStatConfigured(STAT_KEY.TREND, 'trendList'),
        list: list,
        data: dataList,
        hasData: dataList.some(item => (item.count || 0) > 0)
      };
    },
    activeStatus() {
      return this.statusChart.list.find(status => status.id === this.activeStatusId);
    },
    overviewPanelCount() {
      let count = this.metricList.length;
      if (this.statusChart.isConfigured && this.statusChart.hasData) {
        count++;
      }
      if (this.priorityChart.isConfigured && this.priorityChart.list.length > 0) {
        count++;
      }
      if (this.trendChart.isConfigured && this.trendChart.hasData) {
        count++;
      }
      return count || 1;
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
  padding: 8px 12px;
}
.overview-grid {
  display: grid;
  grid-template-columns: repeat(var(--overview-panel-count), minmax(0, 1fr));
  gap: 8px;
}
.overview-panel {
  min-width: 0;
  min-height: 176px;
  overflow: hidden;
  border: 1px solid;
  border-radius: 6px;
}
.metric-panel {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
}
.metric-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 44px;
  line-height: 50px;
  font-weight: 600;
}
.chart-panel {
  padding: 10px;
}
.chart-title {
  margin-bottom: 4px;
  font-weight: 600;
}
.chart-container {
  height: 138px;
}
.status-chart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(72px, 96px);
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
@media screen and (max-width: 960px) {
  .overview-grid {
    grid-template-columns: repeat(var(--overview-panel-count), 200px);
    overflow-x: auto;
  }
  .overview-panel {
    min-width: 200px;
  }
  .metric-value {
    font-size: 38px;
    line-height: 44px;
  }
}
</style>
