<template>
  <div class="workbench-mini-trend">
    <div class="trend-summary">
      <div>
        <div :class="[textClass, 'trend-value']">{{ value }}</div>
        <div class="text-grey">{{ label }}</div>
      </div>
      <div v-if="description" :class="textClass">{{ description }}</div>
    </div>
    <svg
      class="trend-chart"
      viewBox="0 0 240 64"
      preserveAspectRatio="none"
      role="img"
    >
      <path :d="areaPath" :class="[textClass, 'trend-area']"></path>
      <polyline :points="pointString" :class="[textClass, 'trend-line']"></polyline>
      <circle
        v-for="point in normalizedPoints"
        :key="`${point.x}-${point.y}`"
        :cx="point.x"
        :cy="point.y"
        r="2"
        :class="[textClass, 'trend-point']"
      ></circle>
    </svg>
    <div class="trend-labels text-grey">
      <span v-for="point in visibleLabels" :key="point.key">{{ point.label }}</span>
    </div>
  </div>
</template>

<script>
import { getToneTextClass } from './display-utils.js';

export default {
  name: 'WorkbenchMiniTrend',
  props: {
    data: { type: Array, default: () => [] },
    value: { type: [String, Number], default: '' },
    label: { type: String, default: '' },
    description: { type: String, default: '' },
    tone: { type: String, default: 'primary' }
  },
  computed: {
    normalizedPoints() {
      const valueList = this.data.map(item => Number(item.value) || 0);
      if (!valueList.length) {
        return [];
      }
      const min = Math.min(...valueList);
      const max = Math.max(...valueList);
      const range = max - min || 1;
      const step = valueList.length > 1 ? 232 / (valueList.length - 1) : 0;
      return valueList.map((value, index) => ({
        x: 4 + index * step,
        y: 58 - ((value - min) / range) * 48
      }));
    },
    pointString() {
      return this.normalizedPoints.map(point => `${point.x},${point.y}`).join(' ');
    },
    areaPath() {
      if (!this.normalizedPoints.length) {
        return '';
      }
      return `M 4 62 L ${this.pointString.split(' ').join(' L ')} L ${this.normalizedPoints[this.normalizedPoints.length - 1].x} 62 Z`;
    },
    visibleLabels() {
      if (this.data.length <= 4) {
        return this.data.map((item, index) => ({ key: index, label: item.label }));
      }
      const middleIndex = Math.floor((this.data.length - 1) / 2);
      return [0, middleIndex, this.data.length - 1].map(index => ({
        key: index,
        label: this.data[index].label
      }));
    },
    textClass() {
      return getToneTextClass(this.tone);
    }
  }
};
</script>

<style lang="less" scoped>
.trend-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 11px;
}
.trend-value {
  font-size: 26px;
  line-height: 30px;
  font-weight: 800;
}
.trend-chart {
  width: 100%;
  height: 74px;
  margin-top: 4px;
  overflow: visible;
}
.trend-area {
  fill: currentColor;
  opacity: 0.28;
  stroke: none;
}
.trend-line {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}
.trend-point {
  fill: currentColor;
}
.trend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
}
</style>
