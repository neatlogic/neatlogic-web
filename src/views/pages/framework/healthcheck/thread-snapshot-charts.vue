<template>
  <div>
    <div class="text-grey mb-md">{{ text('chartScope') }}</div>
    <TsRow :gutter="16">
      <Col :xs="24" :md="12">
        <div class="bg-op padding-md radius-md mb-md">
          <div class="text-title mb-xs">{{ text('stateDistribution') }}</div>
          <div class="text-grey mb-sm">{{ text('stateChartHint') }}</div>
          <div v-if="stateData.length" ref="states" class="snapshot-chart"></div>
          <div v-else class="snapshot-chart flex-center text-grey">{{ text('noThreadChart') }}</div>
          <div v-if="failedCharts.includes('states')" class="text-warning">{{ text('chartRenderFailed') }}</div>
        </div>
      </Col>
      <Col :xs="24" :md="12">
        <div class="bg-op padding-md radius-md mb-md">
          <div class="text-title mb-xs">{{ text('lockImpactChart') }}</div>
          <div class="text-grey mb-sm">{{ text('lockChartHint') }}</div>
          <div v-if="lockData.length" ref="locks" class="snapshot-chart"></div>
          <div v-else class="snapshot-chart flex-center text-grey">{{ text('noLockChart') }}</div>
          <div v-if="failedCharts.includes('locks')" class="text-warning">{{ text('chartRenderFailed') }}</div>
        </div>
      </Col>
    </TsRow>
    <TsRow v-if="selectedInterval || trendData.length" :gutter="16">
      <Col v-if="selectedInterval" :xs="24" :md="12">
        <div class="bg-op padding-md radius-md mb-md">
          <div class="text-title mb-xs">{{ text('cpuDeltaChart') }}</div>
          <div class="text-grey mb-sm">{{ text('cpuChartHint', { duration: number(selectedInterval.elapsedMs) }) }}</div>
          <div v-if="cpuData.length" ref="cpu" class="snapshot-chart"></div>
          <div v-else class="snapshot-chart flex-center text-grey">{{ text(cpuComparable ? 'noCpuIncrease' : 'cpuNoComparable') }}</div>
          <div v-if="failedCharts.includes('cpu')" class="text-warning">{{ text('chartRenderFailed') }}</div>
        </div>
      </Col>
      <Col v-if="trendData.length" :xs="24" :md="12">
        <div class="bg-op padding-md radius-md mb-md">
          <div class="text-title mb-xs">{{ text('poolTrendChart') }}</div>
          <div class="text-grey mb-sm">{{ text('poolTrendChartHint') }}</div>
          <div ref="trend" class="snapshot-chart"></div>
          <div v-if="failedCharts.includes('trend')" class="text-warning">{{ text('chartRenderFailed') }}</div>
        </div>
      </Col>
    </TsRow>
  </div>
</template>
<script>
import { Pie, Bar, Line } from '@antv/g2plot';
import themes from '@/views/pages/dashboard/widget/charts/theme';
import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';

const THREAD_STATES = ['NEW', 'RUNNABLE', 'BLOCKED', 'WAITING', 'TIMED_WAITING', 'TERMINATED'];

export default {
  name: 'ThreadSnapshotCharts',
  props: {
    snapshot: { type: Object, required: true },
    lockGroups: { type: Array, default: () => [] },
    comparison: { type: Object, required: true },
    selectedInterval: { type: Object, default: null }
  },
  data() {
    return { failedCharts: [] };
  },
  created() {
    // 图表实例不放入响应式数据，避免框架递归观察绘图引擎。
    this.chartPlots = {};
    this.chartObserver = null;
    this.chartRefreshPending = false;
    this.chartActive = true;
  },
  mounted() {
    this.startCharts();
  },
  activated() {
    this.startCharts();
  },
  deactivated() {
    this.stopCharts();
  },
  beforeDestroy() {
    this.stopCharts();
  },
  methods: {
    // 图表文案与现有分析标签共用语言资源。
    text(key, values) { return this.$t('term.framework.threadsnapshot.' + key, values); },
    // 激活时重新绑定尺寸监听，隐藏标签页不继续占用绘图资源。
    startCharts() {
      this.chartActive = true;
      window.removeEventListener('resize', this.resizeCharts);
      window.addEventListener('resize', this.resizeCharts);
      window.removeEventListener('chartThemeChange', this.scheduleCharts);
      window.addEventListener('chartThemeChange', this.scheduleCharts);
      if (!this.chartObserver && window.ResizeObserver) this.chartObserver = new window.ResizeObserver(this.resizeCharts);
      this.scheduleCharts();
    },
    // 离开页面销毁实例及所有尺寸监听，避免残留画布和定时工作。
    stopCharts() {
      this.chartActive = false;
      window.removeEventListener('resize', this.resizeCharts);
      window.removeEventListener('chartThemeChange', this.scheduleCharts);
      if (this.chartObserver) this.chartObserver.disconnect();
      this.chartObserver = null;
      this.destroyCharts();
    },
    // 多个采样属性同时改变时，只在 DOM 更新后绘制一次。
    scheduleCharts() {
      if (this.chartRefreshPending || !this.chartActive) return;
      this.chartRefreshPending = true;
      this.$nextTick(() => {
        this.chartRefreshPending = false;
        if (this.chartActive && !this._isDestroyed) this.renderCharts();
      });
    },
    // 重建前释放旧图表，保证主题、样本和联动数据一致。
    destroyCharts() {
      Object.values(this.chartPlots).forEach(plot => plot.destroy());
      this.chartPlots = {};
    },
    // 容器变化后使用真实宽度重排，未显示的容器不强制设置零宽度。
    resizeCharts() {
      Object.keys(this.chartPlots).forEach(key => {
        const element = this.$refs[key];
        if (element && element.clientWidth > 0) this.chartPlots[key].changeSize(element.clientWidth, 280);
      });
    },
    // 各图独立失败时保留其他图和列表证据，不创建替代统计数据。
    createPlot(key, PlotType, options, onClick) {
      const element = this.$refs[key];
      if (!element) return;
      try {
        const plot = new PlotType(element, { height: 280, autoFit: true, animation: false, theme: this.chartTheme, ...options });
        this.chartPlots[key] = plot;
        if (onClick) {
          plot.on('element:click', event => {
            const datum = event.data && event.data.data;
            if (datum) onClick(datum);
          });
        }
        plot.render();
        if (this.chartObserver) this.chartObserver.observe(element);
      } catch (error) {
        if (this.chartPlots[key]) this.chartPlots[key].destroy();
        delete this.chartPlots[key];
        this.failedCharts.push(key);
      }
    },
    // 保留 G2 的浮层类以应用定位和主题样式，内容通过 textContent 安全写入。
    tooltipContent(title, rows) {
      const container = document.createElement('div');
      container.className = 'g2-tooltip bg-op text-grey padding-sm radius-md';
      const heading = document.createElement('div');
      heading.className = 'text-title mb-xs';
      heading.textContent = title;
      container.appendChild(heading);
      rows.forEach(row => {
        const line = document.createElement('div');
        line.textContent = row;
        container.appendChild(line);
      });
      return container;
    },
    // 单核比例为同一区间有效 CPU 增量派生值，不将高消耗解释为故障。
    cpuTooltip(items) {
      const datum = items[0] && items[0].data;
      if (!datum) return this.tooltipContent(this.text('cpuDelta'), []);
      return this.tooltipContent(datum.name + ' (' + datum.id + ')', [
        this.text('cpuDelta') + ': ' + this.number(datum.cpuDeltaMs) + ' ' + this.$t('page.ms'),
        this.text('cpuPercent') + ': ' + this.number(datum.cpuPercent) + '%'
      ]);
    },
    // 坐标轴短标签只用于可读性，提示中保留完整持有者和锁证据。
    shortLabel(value) { const label = String(value); return label.length > 34 ? label.slice(0, 31) + '…' : label; },
    // 锁轴同时保留持有者与锁身份哈希，区分同一持有者的不同锁组。
    lockLabel(group) {
      const lock = String(group.lockName || '—');
      const separator = lock.lastIndexOf('@');
      const identity = separator >= 0 ? lock.slice(separator) : '';
      const className = (separator >= 0 ? lock.slice(0, separator) : lock).split('.').pop();
      const label = className.length > 18 ? className.slice(0, 18) + '…' : className;
      return group.ownerId + ' · ' + label + identity;
    },
    // 当前依赖的线性刻度算法忽略 minTickInterval，显式使用整数步长避免重复刻度。
    countTickInterval(data) {
      const maximum = Math.max(0, ...data.map(item => item.count));
      return Math.max(1, Math.ceil(maximum / 5));
    },
    number(value) { return Number.isFinite(value) ? Math.round(value * 100) / 100 : this.text('unavailable'); },
    // 趋势轴按实际采集时刻绘制，刻度和提示以用户浏览器本地时间展示。
    sampleTime(value) {
      const timestamp = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
      const date = new Date(timestamp);
      if (!Number.isFinite(date.getTime())) return '—';
      return date.toLocaleTimeString([], { hour12: false });
    },
    // 四类图表使用服务器完整样本，过滤联动交由主分析组件处理。
    renderCharts() {
      this.destroyCharts();
      this.failedCharts = [];
      if (this.chartObserver) this.chartObserver.disconnect();
      if (this.stateData.length) {
        this.createPlot('states', Pie, {
          data: this.stateData, angleField: 'count', colorField: 'state', radius: 0.8, innerRadius: 0.62,
          statistic: { title: false, content: false },
          legend: { position: 'bottom', itemName: { style: { fill: this.textColor } } },
          // 颜色按状态固定映射，缺少某种状态时不会改变其他状态的颜色。
          color: datum => this.palette[THREAD_STATES.indexOf(datum.state) % this.palette.length],
          label: { type: 'inner', content: datum => String(datum.count), style: { fill: this.textColor } },
          tooltip: { customContent: (title, items) => {
            const datum = items[0] && items[0].data;
            return this.tooltipContent(datum ? datum.state : title, datum ? [this.text('threadCount') + ': ' + datum.count] : []);
          } }
        }, datum => this.$emit('filter-state', datum.state));
      }
      if (this.lockData.length) {
        this.createPlot('locks', Bar, {
          data: this.lockData, xField: 'count', yField: 'id', color: this.palette[3] || this.palette[0],
          padding: 'auto', maxBarWidth: 22, legend: false,
          meta: { count: { min: 0, tickInterval: this.countTickInterval(this.lockData), alias: this.text('waitingThreads') } },
          xAxis: { label: { formatter: value => String(value) } },
          yAxis: { label: { formatter: value => {
            const group = this.lockData.find(item => item.id === value);
            return group ? this.lockLabel(group) : value;
          } } },
          tooltip: { customContent: (title, items) => {
            const datum = items[0] && items[0].data;
            return this.tooltipContent(this.text('lockImpactChart'), datum ? [
              this.text('owner') + ': ' + datum.label,
              this.text('waitingLock') + ': ' + datum.lockName,
              this.text('waitingThreads') + ': ' + datum.count
            ] : []);
          } }
        }, datum => this.$emit('focus-threads', datum.threadIds));
      }
      if (this.cpuData.length) {
        this.createPlot('cpu', Bar, {
          data: this.cpuData, xField: 'cpuDeltaMs', yField: 'id', color: this.palette[4] || this.palette[0],
          padding: 'auto', maxBarWidth: 22, legend: false,
          meta: { cpuDeltaMs: { min: 0, alias: this.text('cpuDelta') + ' (' + this.$t('page.ms') + ')' } },
          yAxis: { label: { formatter: value => {
            const thread = this.cpuData.find(item => item.id === value);
            return thread ? this.shortLabel(thread.name + ' (' + thread.id + ')') : value;
          } } },
          tooltip: { customContent: (title, items) => this.cpuTooltip(items) }
        }, datum => this.$emit('select-thread', datum.id));
      }
      if (this.trendData.length) {
        this.createPlot('trend', Line, {
          data: this.trendData, xField: 'capturedAt', yField: 'count', seriesField: 'series',
          color: [this.palette[3] || this.palette[0], this.palette[2] || this.palette[0]],
          legend: { position: 'bottom', itemName: { formatter: value => this.text(value), style: { fill: this.textColor } } },
          point: { size: 4, shape: 'circle' }, smooth: false,
          // 时间刻度在度量层格式化原始时间戳，避免默认日期掩码丢失时分秒。
          meta: { capturedAt: { type: 'time', nice: false, ticks: this.comparison.queueTrend.map(sample => sample.capturedAt), formatter: value => this.sampleTime(value) }, count: { min: 0, tickInterval: this.countTickInterval(this.trendData), alias: this.text('taskCountChart') } },
          yAxis: { label: { formatter: value => String(value) } },
          tooltip: { shared: true, customContent: (title, items) => {
            const datum = items[0] && items[0].data;
            return this.tooltipContent(this.sampleTime(datum ? datum.capturedAt : title), items.map(item => this.text(item.data.series) + ': ' + item.data.count));
          } }
        });
      }
    }
  },
  computed: {
    themeType() { return this.$store.getters.themeType; },
    chartTheme() { return this.themeType === 'dark' || this.themeType === 'theme-dark' ? themes.dark : themes.default; },
    textColor() { return this.chartTheme.legend.text.style.fill; },
    palette() {
      // 优先沿用用户配置的 dashboard 图表调色板，缺失时使用公共主题色。
      this.themeType;
      const config = ThemeUtils.getValueListByType('dashboard').find(item => item.param === 'chart');
      return config && Array.isArray(config.value) && config.value.length ? config.value : (this.chartTheme.color || themes.default.color);
    },
    stateData() {
      const counts = {};
      this.snapshot.threads.forEach(thread => { counts[thread.state] = (counts[thread.state] || 0) + 1; });
      return THREAD_STATES.filter(state => counts[state]).map(state => ({ state, count: counts[state] }));
    },
    lockData() {
      return this.lockGroups.filter(group => group.count > 0).slice().sort((a, b) => b.count - a.count).slice(0, 10).map(group => ({
        ...group, label: (group.ownerName || group.ownerId) + ' (' + group.ownerId + ')'
      }));
    },
    cpuComparable() {
      return !!this.selectedInterval && this.selectedInterval.cpuMetrics.some(metric => Number.isFinite(metric.cpuDeltaMs) && metric.cpuDeltaMs >= 0 && Number.isFinite(metric.cpuPercent));
    },
    cpuData() {
      if (!this.selectedInterval) return [];
      return this.selectedInterval.cpuMetrics.filter(metric => Number.isFinite(metric.cpuDeltaMs) && metric.cpuDeltaMs > 0 && Number.isFinite(metric.cpuPercent)).slice().sort((a, b) => b.cpuDeltaMs - a.cpuDeltaMs).slice(0, 10);
    },
    trendData() {
      const samples = this.comparison.queueTrend || [];
      if (samples.length < 2) return [];
      return samples.flatMap(sample => [
        { capturedAt: sample.capturedAt, series: 'activeCount', count: sample.activeCount },
        { capturedAt: sample.capturedAt, series: 'queueSize', count: sample.queueSize }
      ]).filter(point => Number.isFinite(point.capturedAt) && Number.isFinite(point.count));
    }
  },
  watch: {
    snapshot() { this.scheduleCharts(); },
    lockGroups() { this.scheduleCharts(); },
    comparison() { this.scheduleCharts(); },
    selectedInterval() { this.scheduleCharts(); },
    themeType() { this.scheduleCharts(); },
    '$i18n.locale'() { this.scheduleCharts(); }
  }
};
</script>
<style scoped lang="less">
/* 绘图画布需要确定高度；列布局、背景和间距复用公共组件与主题样式。 */
.snapshot-chart { height: 280px; }
</style>
