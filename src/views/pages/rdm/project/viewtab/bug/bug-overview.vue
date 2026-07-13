<template>
  <div class="bug-overview border-color radius-lg bg-op mb-md">
    <div class="overview-header border-color" @click="toggleCollapse">
      <div class="text-title">
        <span :class="isCollapsed ? 'tsfont-right' : 'tsfont-down'"></span>
        <span class="ml-xs">{{ $t('term.rdm.bugoverview') }}</span>
      </div>
      <div class="action-group" @click.stop>
        <span v-if="activeFilter" class="action-item">
          <span class="text-grey">{{ $t('term.rdm.currentfilter') }}</span>
          <span :style="{ color: activeFilter.color }">{{ activeFilter.label }}</span>
          <span class="tsfont-close ml-xs text-action" @click="clearFilter"></span>
        </span>
        <span class="action-item tsfont-refresh" @click="refresh">{{ $t('page.refresh') }}</span>
      </div>
    </div>
    <div v-show="!isCollapsed" class="overview-body">
      <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
      <div v-if="errorMessage" class="text-grey text-center pt-md pb-md">{{ errorMessage }}</div>
      <template v-else>
        <div class="overview-row overview-top-row" :style="{ '--overview-panel-count': topPanelCount }">
          <div v-for="metric in metricList" :key="metric.key" class="overview-panel metric-panel border-color">
            <div class="chart-title text-grey">{{ metric.label }}</div>
            <div class="metric-value" :class="metric.className">{{ metric.value }}</div>
          </div>
          <div v-if="statusChart.isConfigured && statusChart.hasData" class="overview-panel chart-panel border-color">
            <div class="chart-title">{{ $t('term.rdm.bugstatusratio') }}</div>
            <div class="status-chart-layout">
              <div ref="statusChart" class="chart-container"></div>
              <div class="status-list">
                <div
                  v-for="status in statusChart.list"
                  :key="status.id"
                  class="status-item"
                  :class="{ 'active': isActiveFilter(statusChart, status) }"
                  @click="selectChartItem(statusChart, status)"
                >
                  <span class="status-dot" :style="{ background: status.color || chartTheme.iconColor }"></span>
                  <span class="status-name overflow">{{ status.label || status.name }}</span>
                  <span class="text-grey">{{ status.issueCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="hasBottomChart" class="overview-row overview-chart-row" :style="{ '--overview-panel-count': bottomPanelCount }">
          <div v-if="hasSeverityChart" class="overview-panel chart-panel border-color">
            <div class="chart-title">{{ $t('term.rdm.severitydistribution') }}</div>
            <div ref="severityChart" class="chart-container"></div>
          </div>
          <div v-if="hasSourceChart" class="overview-panel chart-panel border-color">
            <div class="chart-title">{{ $t('term.rdm.bugsourcedistribution') }}</div>
            <div ref="sourceChart" class="chart-container"></div>
          </div>
          <div v-if="hasTrendChart" class="overview-panel chart-panel border-color">
            <div class="chart-title">{{ $t('term.rdm.newoverduetrend7months') }}</div>
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
  TOTAL: 'bug_total',
  OPEN: 'bug_open',
  OVERDUE: 'bug_overdue',
  REOPEN_TOTAL: 'bug_reopen_total',
  STATUS_DISTRIBUTION: 'bug_status_distribution',
  SEVERITY_DISTRIBUTION: 'bug_severity_distribution',
  SOURCE_DISTRIBUTION: 'bug_source_distribution',
  TREND: 'bug_trend'
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

function getStatDataList(stat) {
  if (stat) {
    const dataList = stat.dataList || stat.datalist || stat.list;
    if (Array.isArray(dataList) && dataList.length > 0) {
      return dataList;
    }
  }
  return [];
}

function normalizeDistributionList(dataList) {
  return (dataList || []).map(item => {
    const label = getFieldValue(item, 'label') || getFieldValue(item, 'name');
    return {
      ...item,
      id: getFieldValue(item, 'id'),
      name: getFieldValue(item, 'name'),
      label: label,
      value: getFieldValue(item, 'value') || getFieldValue(item, 'id'),
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
  props: {
    projectId: { type: Number },
    app: { type: Object }
  },
  data() {
    return {
      isCollapsed: false,
      isLoading: false,
      errorMessage: '',
      overviewData: {},
      activeFilter: null,
      statusPlot: null,
      severityPlot: null,
      sourcePlot: null,
      trendPlot: null,
      themeObserver: null,
      themeClass: this.getCurrentThemeClass(),
      overviewRequestId: 0,
      statKeyList: [
        STAT_KEY.TOTAL,
        STAT_KEY.OPEN,
        STAT_KEY.OVERDUE,
        STAT_KEY.REOPEN_TOTAL,
        STAT_KEY.STATUS_DISTRIBUTION,
        STAT_KEY.SEVERITY_DISTRIBUTION,
        STAT_KEY.SOURCE_DISTRIBUTION,
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
          this.errorMessage = this.$t('term.rdm.bugoverviewloadfailed');
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
    selectChartItem(chart, item) {
      const value = item.value === undefined || item.value === null ? item.id : item.value;
      const isActive = this.activeFilter && this.activeFilter.field === chart.filterField && this.activeFilter.value === value;
      const filterObj = {};
      if (this.activeFilter) {
        filterObj[this.activeFilter.field] = [];
      }
      if (isActive) {
        this.activeFilter = null;
      } else {
        this.activeFilter = {
          field: chart.filterField,
          value: value,
          label: item.label || item.name,
          color: item.color
        };
        filterObj[chart.filterField] = [value];
      }
      this.$emit('filter-change', filterObj);
    },
    clearFilter() {
      if (this.activeFilter) {
        const filterObj = { [this.activeFilter.field]: [] };
        this.activeFilter = null;
        this.$emit('filter-change', filterObj);
      }
    },
    isActiveFilter(chart, item) {
      const value = item.value === undefined || item.value === null ? item.id : item.value;
      return !!this.activeFilter && this.activeFilter.field === chart.filterField && this.activeFilter.value === value;
    },
    renderCharts() {
      if (this.isCollapsed) {
        return;
      }
      this.renderStatusChart();
      this.renderSeverityChart();
      this.renderSourceChart();
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
          title: { content: this.$t('term.rdm.total'), style: { color: chartTheme.textColor, fontSize: '18px', fontWeight: 400 } },
          content: { content: this.statusChart.total.toString(), style: { color: chartTheme.textColor, fontSize: '24px', fontWeight: 500 } }
        },
        pieStyle: {
          stroke: 'transparent',
          lineWidth: 0
        },
        theme: this.getChartThemeConfig(),
        tooltip: {
          domStyles: this.getTooltipDomStyles(),
          formatter: data => ({ name: data.label, value: data.issueCount })
        },
        color: ({ label }) => this.getStatusColor(label)
      });
      this.statusPlot.on('element:click', event => {
        const data = event && event.data && event.data.data;
        if (data) {
          this.selectChartItem(this.statusChart, data);
        }
      });
      this.statusPlot.render();
    },
    renderSeverityChart() {
      this.renderColumnChart('severityPlot', 'severityChart', this.severityChart, ({ name }) => this.getDistributionColor(this.severityChart, name));
    },
    renderSourceChart() {
      this.renderColumnChart('sourcePlot', 'sourceChart', this.sourceChart, ({ name }) => this.getDistributionColor(this.sourceChart, name));
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
        columnStyle: { stroke: 'transparent', lineWidth: 0 },
        legend: {
          position: 'top-right',
          text: { style: this.getChartTextStyle() },
          itemName: { style: this.getChartTextStyle() }
        },
        xAxis: this.getXAxisConfig(),
        yAxis: this.getYAxisConfig(),
        tooltip: { domStyles: this.getTooltipDomStyles() },
        color: ({ type }) => type === this.$t('term.rdm.overdue') ? chartTheme.warningColor : chartTheme.primaryColor
      });
      this.trendPlot.render();
    },
    renderColumnChart(plotName, refName, chart, colorHandler) {
      if (this[plotName]) {
        this[plotName].destroy();
        this[plotName] = null;
      }
      if (!this.$refs[refName] || chart.list.length === 0) {
        return;
      }
      const chartTheme = this.chartTheme;
      this[plotName] = new Column(this.$refs[refName], {
        height: 138,
        appendPadding: 0,
        data: chart.list,
        xField: 'name',
        yField: 'issueCount',
        legend: false,
        theme: this.getChartThemeConfig(),
        label: {
          position: 'top',
          style: { fill: chartTheme.textColor, stroke: 'transparent', lineWidth: 0 }
        },
        columnStyle: { stroke: 'transparent', lineWidth: 0 },
        xAxis: this.getXAxisConfig(),
        yAxis: this.getYAxisConfig(),
        tooltip: { domStyles: this.getTooltipDomStyles() },
        color: colorHandler || (data => data.color || chartTheme.primaryColor)
      });
      this[plotName].on('element:click', event => {
        const data = event && event.data && event.data.data;
        if (data) {
          this.selectChartItem(chart, data);
        }
      });
      this[plotName].render();
    },
    destroyPlot() {
      [this.statusPlot, this.severityPlot, this.sourcePlot, this.trendPlot].forEach(plot => {
        if (plot) {
          plot.destroy();
        }
      });
      this.statusPlot = null;
      this.severityPlot = null;
      this.sourcePlot = null;
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
    getDistributionColor(chart, name) {
      const data = chart.list.find(item => item.name === name);
      return data && data.color ? data.color : this.chartTheme.primaryColor;
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
      return { style: { stroke: this.chartTheme.dividingColor, lineWidth: 1 } };
    },
    getAxisTickConfig() {
      return { style: { stroke: this.chartTheme.dividingColor, lineWidth: 1 } };
    },
    getAxisGridConfig() {
      return {
        line: { style: { stroke: this.chartTheme.dividingColor, lineWidth: 1, lineDash: [4, 4], opacity: 0.55 } }
      };
    },
    getXAxisConfig() {
      return {
        label: { autoHide: true, autoRotate: false, style: this.getAxisLabelStyle() },
        title: null,
        line: this.getAxisLineConfig(),
        tickLine: this.getAxisTickConfig()
      };
    },
    getYAxisConfig() {
      return {
        min: 0,
        nice: true,
        label: { style: this.getAxisLabelStyle() },
        title: null,
        grid: this.getAxisGridConfig()
      };
    },
    getTooltipDomStyles() {
      const chartTheme = this.chartTheme;
      const dashboardTooltipStyle = this.getThemeTooltipStyle();
      return {
        'g2-tooltip': { ...dashboardTooltipStyle, color: chartTheme.textColor },
        'g2-tooltip-title': { color: chartTheme.textColor },
        'g2-tooltip-list-item': { color: chartTheme.textColor },
        'g2-tooltip-name': { color: chartTheme.textColor },
        'g2-tooltip-value': { color: chartTheme.textColor }
      };
    },
    getChartThemeConfig() {
      return {
        ...this.dashboardTheme,
        backgroundStyle: { fill: 'transparent' },
        axis: {
          x: { label: { style: this.getAxisLabelStyle() }, title: null },
          y: { label: { style: this.getAxisLabelStyle() }, title: null, grid: this.getAxisGridConfig() }
        },
        legend: {
          text: { style: this.getChartTextStyle() },
          itemName: { style: this.getChartTextStyle() }
        },
        components: {
          tooltip: { domStyles: this.getTooltipDomStyles() }
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
    isStatConfigured(statKey) {
      return !this.hasStatResultList() || !!this.getStatResult(statKey);
    },
    getStatValue(statKey, defaultValue) {
      return getStatValue(this.getStatResult(statKey), defaultValue);
    },
    getStatDataList(statKey) {
      return getStatDataList(this.getStatResult(statKey));
    }
  },
  computed: {
    dashboardTheme() {
      return this.themeClass === 'theme-dark' ? themes.dark : themes.default;
    },
    dashboardChartColorList() {
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
          key: 'total',
          isConfigured: this.isStatConfigured(STAT_KEY.TOTAL),
          label: this.$t('term.rdm.bugcount'),
          value: this.getStatValue(STAT_KEY.TOTAL, 0)
        },
        {
          key: 'open',
          isConfigured: this.isStatConfigured(STAT_KEY.OPEN),
          label: this.$t('term.rdm.openbugcount'),
          value: this.getStatValue(STAT_KEY.OPEN, 0),
          className: 'text-primary'
        },
        {
          key: 'overdue',
          isConfigured: this.isStatConfigured(STAT_KEY.OVERDUE),
          label: this.$t('term.rdm.overduebugcount'),
          value: this.getStatValue(STAT_KEY.OVERDUE, 0),
          className: 'text-error'
        },
        {
          key: 'reopen',
          isConfigured: this.isStatConfigured(STAT_KEY.REOPEN_TOTAL),
          label: this.$t('term.rdm.reopenbugcount'),
          value: this.getStatValue(STAT_KEY.REOPEN_TOTAL, 0),
          className: 'text-warning'
        }
      ].filter(metric => metric.isConfigured);
    },
    statusChart() {
      const stat = this.getStatResult(STAT_KEY.STATUS_DISTRIBUTION);
      const list = normalizeDistributionList(this.getStatDataList(STAT_KEY.STATUS_DISTRIBUTION));
      const data = list
        .filter(item => (item.issueCount || 0) > 0)
        .map(item => ({
          id: item.id,
          label: item.label || item.name,
          value: item.id,
          color: item.color,
          issueCount: item.issueCount || 0
        }));
      return {
        isConfigured: this.isStatConfigured(STAT_KEY.STATUS_DISTRIBUTION),
        filterField: (stat && stat.filterField) || 'status',
        list: list,
        data: data,
        total: data.reduce((sum, item) => sum + (item.issueCount || 0), 0),
        hasData: data.length > 0
      };
    },
    severityChart() {
      const stat = this.getStatResult(STAT_KEY.SEVERITY_DISTRIBUTION);
      return {
        isConfigured: this.isStatConfigured(STAT_KEY.SEVERITY_DISTRIBUTION),
        filterField: (stat && (stat.filterField || (stat.filterAttrId ? 'attr_' + stat.filterAttrId : ''))) || '',
        list: normalizeDistributionList(this.getStatDataList(STAT_KEY.SEVERITY_DISTRIBUTION))
      };
    },
    sourceChart() {
      const stat = this.getStatResult(STAT_KEY.SOURCE_DISTRIBUTION);
      return {
        isConfigured: this.isStatConfigured(STAT_KEY.SOURCE_DISTRIBUTION),
        filterField: (stat && (stat.filterField || (stat.filterAttrId ? 'attr_' + stat.filterAttrId : ''))) || '',
        list: normalizeDistributionList(this.getStatDataList(STAT_KEY.SOURCE_DISTRIBUTION))
      };
    },
    trendChart() {
      const list = normalizeTrendList(this.getStatDataList(STAT_KEY.TREND));
      const dataList = [];
      list.forEach(item => {
        dataList.push({ month: item.month, type: this.$t('term.rdm.new'), count: item.totalCount || 0 });
        dataList.push({ month: item.month, type: this.$t('term.rdm.overdue'), count: item.overdueCount || 0 });
      });
      return {
        isConfigured: this.isStatConfigured(STAT_KEY.TREND),
        list: list,
        data: dataList,
        hasData: dataList.some(item => (item.count || 0) > 0)
      };
    },
    hasSeverityChart() {
      return this.severityChart.isConfigured && this.severityChart.list.length > 0;
    },
    hasSourceChart() {
      return this.sourceChart.isConfigured && this.sourceChart.list.length > 0;
    },
    hasTrendChart() {
      return this.trendChart.isConfigured && this.trendChart.hasData;
    },
    hasBottomChart() {
      return this.hasSeverityChart || this.hasSourceChart || this.hasTrendChart;
    },
    topPanelCount() {
      let count = this.metricList.length;
      if (this.statusChart.isConfigured && this.statusChart.hasData) {
        count++;
      }
      return count || 1;
    },
    bottomPanelCount() {
      let count = 0;
      if (this.hasSeverityChart) {
        count++;
      }
      if (this.hasSourceChart) {
        count++;
      }
      if (this.hasTrendChart) {
        count++;
      }
      return count || 1;
    }
  },
  watch: {
    projectId() {
      this.clearFilter();
      this.refresh();
    },
    app: {
      handler() {
        this.clearFilter();
        this.refresh();
      },
      deep: false
    }
  }
};
</script>
<style lang="less" scoped>
.bug-overview {
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
.overview-row {
  display: grid;
  grid-template-columns: repeat(var(--overview-panel-count), minmax(0, 1fr));
  gap: 8px;
}
.overview-row + .overview-row {
  margin-top: 8px;
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
.overview-chart-row .chart-container {
  height: 160px;
}
.status-chart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(72px, 96px);
  gap: 8px;
  align-items: center;
  min-height: 138px;
}
.status-list {
  min-width: 0;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 2px;
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
  .overview-row {
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
