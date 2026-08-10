<template>
  <div :class="['workbench-metrics', { 'is-compact': compact }]">
    <component
      :is="metric.href ? 'a' : 'div'"
      v-for="metric in metrics"
      :key="metric.key || metric.label"
      :href="metric.href || undefined"
      class="metric-item bg-block radius-md padding-sm"
    >
      <div class="metric-head">
        <span class="metric-label text-grey overflow">{{ metric.label }}</span>
        <i v-if="metric.icon" :class="[metric.icon, getTextClass(metric.tone)]"></i>
      </div>
      <div :class="[getTextClass(metric.tone), 'metric-value overflow']">
        {{ metric.value }}<span v-if="metric.unit" class="metric-unit">{{ metric.unit }}</span>
      </div>
      <div v-if="metric.delta !== undefined && metric.delta !== null" :class="[getDeltaClass(metric), 'metric-trend overflow']">
        {{ getDeltaPrefix(metric) }}{{ metric.delta }}{{ metric.deltaUnit || '' }}
      </div>
      <div v-else-if="metric.trend" :class="[getTextClass(metric.tone), 'metric-trend overflow']">{{ metric.trend }}</div>
      <div v-if="metric.target !== undefined && metric.target !== null" class="metric-target text-grey overflow">
        {{ $t('page.target') }} {{ metric.target }}{{ metric.unit || '' }}
      </div>
    </component>
  </div>
</template>

<script>
import { getToneTextClass } from './display-utils.js';

export default {
  name: 'WorkbenchMetricGroup',
  props: {
    metrics: { type: Array, default: () => [] },
    compact: { type: Boolean, default: false }
  },
  methods: {
    getTextClass(tone) {
      return getToneTextClass(tone);
    },
    getDeltaClass(metric) {
      if (metric.deltaTone) {
        return getToneTextClass(metric.deltaTone);
      }
      if (metric.deltaDirection === 'down') {
        return 'text-danger';
      }
      if (metric.deltaDirection === 'up') {
        return 'text-success';
      }
      return getToneTextClass(metric.tone);
    },
    getDeltaPrefix(metric) {
      if (metric.deltaDirection === 'up') {
        return '↑ ';
      }
      if (metric.deltaDirection === 'down') {
        return '↓ ';
      }
      return '';
    }
  }
};
</script>

<style lang="less" scoped>
.workbench-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 8px;
  &.is-compact {
    grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
    .metric-item {
      padding: 8px;
    }
    .metric-value {
      font-size: 20px;
    }
  }
}
.metric-item {
  min-width: 0;
  color: inherit;
  text-decoration: none;
}
.metric-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px;
  font-size: 12px;
}
.metric-value {
  margin-top: 7px;
  font-size: 24px;
  line-height: 28px;
  font-weight: 800;
}
.metric-unit {
  margin-left: 3px;
  font-size: 12px;
  font-weight: 500;
}
.metric-trend {
  margin-top: 4px;
  font-size: 11px;
}
.metric-target {
  margin-top: 3px;
  font-size: 10px;
}
</style>
