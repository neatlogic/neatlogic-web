<template>
  <div :class="[backgroundClass, 'workbench-comparison radius-md padding-sm']">
    <div class="comparison-heading">
      <div class="overflow">
        <div class="comparison-label text-grey overflow">{{ label }}</div>
        <div :class="[textClass, 'comparison-value overflow']">
          {{ current }}<span class="comparison-unit">{{ unit }}</span>
        </div>
      </div>
      <div :class="[deltaClass, 'comparison-delta radius-sm']">{{ deltaText }}</div>
    </div>
    <div v-if="target !== null && target !== undefined" class="comparison-progress">
      <div class="progress-caption text-grey">
        <span>目标 {{ target }}{{ unit }}</span>
        <span>{{ achievement }}%</span>
      </div>
      <div class="progress-track bg-block radius-sm">
        <span :class="[textClass, 'progress-value radius-sm']" :style="{ width: `${achievement}%` }"></span>
      </div>
    </div>
    <div v-if="description" class="comparison-description text-grey overflow">{{ description }}</div>
  </div>
</template>

<script>
import { clampPercent, getToneBackgroundClass, getToneTextClass } from './display-utils.js';

export default {
  name: 'WorkbenchComparison',
  props: {
    label: { type: String, default: '' },
    current: { type: [String, Number], default: 0 },
    previous: { type: [String, Number], default: null },
    target: { type: [String, Number], default: null },
    unit: { type: String, default: '' },
    tone: { type: String, default: 'primary' },
    positiveDirection: { type: String, default: 'up' },
    description: { type: String, default: '' }
  },
  computed: {
    textClass() {
      return getToneTextClass(this.tone);
    },
    backgroundClass() {
      return getToneBackgroundClass(this.tone);
    },
    delta() {
      const current = Number(this.current);
      const previous = Number(this.previous);
      return Number.isFinite(current) && Number.isFinite(previous) ? current - previous : null;
    },
    deltaText() {
      if (this.delta === null) {
        return '暂无对比';
      }
      const prefix = this.delta > 0 ? '+' : '';
      return `较上期 ${prefix}${this.delta}${this.unit}`;
    },
    deltaClass() {
      if (this.delta === null || this.delta === 0) {
        return 'text-grey bg-block';
      }
      const isPositive = this.positiveDirection === 'down' ? this.delta < 0 : this.delta > 0;
      return isPositive ? 'text-success bg-success-grey' : 'text-danger bg-error-grey';
    },
    achievement() {
      const current = Number(this.current);
      const target = Number(this.target);
      if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) {
        return 0;
      }
      return Math.round(clampPercent(current / target * 100));
    }
  }
};
</script>

<style lang="less" scoped>
.workbench-comparison {
  min-width: 0;
}
.comparison-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
}
.comparison-label {
  font-size: 11px;
}
.comparison-value {
  margin-top: 4px;
  font-size: 26px;
  line-height: 30px;
  font-weight: 800;
}
.comparison-unit {
  margin-left: 3px;
  font-size: 12px;
  font-weight: 500;
}
.comparison-delta {
  padding: 3px 7px;
  font-size: 10px;
  white-space: nowrap;
}
.comparison-progress {
  margin-top: 10px;
}
.progress-caption {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
}
.progress-track {
  height: 5px;
  margin-top: 5px;
  overflow: hidden;
}
.progress-value {
  display: block;
  height: 100%;
  background: currentColor;
}
.comparison-description {
  margin-top: 8px;
  font-size: 10px;
}
</style>
