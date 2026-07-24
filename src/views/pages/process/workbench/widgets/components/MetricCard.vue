<template>
  <div class="metric-card bg-op text-default radius-lg padding" :class="{ 'is-state': loading || error || empty }">
    <div v-if="loading" class="metric-state flex-center text-grey">
      <span class="tsfont-loading"></span>
      <span>Loading...</span>
    </div>
    <div v-else-if="error" class="metric-state flex-center text-danger">
      <span class="tsfont-warning-o"></span>
      <span>{{ error }}</span>
    </div>
    <NoData v-else-if="empty"></NoData>
    <template v-else>
      <div>
        <div class="metric-name text-grey">{{ displayMetric.name }}</div>
        <div class="metric-value mt-md">{{ displayMetric.value }}</div>
        <div class="metric-trend mt-sm" :class="toneTextClass">{{ displayMetric.trend }}</div>
      </div>
      <div class="metric-icon flex-center" :class="[toneTextClass, toneBackgroundClass]">
        <i :class="displayMetric.icon"></i>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'MetricCard',
  props: {
    metric: { type: Object, default: () => ({}) },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '' },
    showTitle: { type: Boolean, default: true },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' }
  },
  computed: {
    empty() {
      return this.metric == null ||
        this.metric.value === null ||
        this.metric.value === undefined ||
        this.metric.value === '';
    },
    displayMetric() {
      const metric = { ...(this.metric || {}) };
      if (this.showTitle === false) {
        metric.name = '';
      } else if (this.title) {
        metric.name = this.title;
      }
      if (this.config.showTrend === 0) {
        metric.trend = '';
      }
      if (this.config.tone) {
        metric.tone = this.config.tone;
      }
      return metric;
    },
    toneTextClass() {
      return {
        blue: 'text-primary',
        green: 'text-success',
        orange: 'text-warning',
        red: 'text-danger'
      }[this.displayMetric.tone] || 'text-primary';
    },
    toneBackgroundClass() {
      return {
        blue: 'bg-selected',
        green: 'bg-success-grey',
        orange: 'bg-warning-grey',
        red: 'bg-error-grey'
      }[this.displayMetric.tone] || 'bg-selected';
    }
  }
};
</script>

<style lang="less" scoped>
.metric-card {
  height: 100%;
  box-sizing: border-box;
  min-height: 110px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px;
  align-items: center;
  &.is-state {
    grid-template-columns: minmax(0, 1fr);
  }
  .metric-state {
    gap: 6px;
    font-size: 12px;
  }
  .metric-name {
    font-size: 13px;
    font-weight: 700;
  }
  .metric-value {
    font-size: 28px;
    line-height: 34px;
    font-weight: 800;
  }
  .metric-trend {
    font-size: 12px;
  }
  .metric-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    font-size: 26px;
  }
}
</style>
