<template>
  <div class="workbench-distribution">
    <div v-if="title || totalLabel" class="distribution-header">
      <span class="distribution-title overflow">{{ title }}</span>
      <span class="text-grey">{{ totalLabel }}</span>
    </div>
    <div v-if="normalizedItems.length" class="distribution-track bg-block radius-sm">
      <span
        v-for="item in normalizedItems"
        :key="item.key || item.label"
        :title="`${item.label} ${item.value} (${item.percent}%)`"
        :style="{ width: `${item.percent}%`, background: getColor(item.tone) }"
        class="distribution-segment"
      ></span>
    </div>
    <div class="distribution-legend">
      <component
        :is="item.href ? 'a' : 'div'"
        v-for="item in normalizedItems"
        :key="item.key || item.label"
        :href="item.href || undefined"
        class="legend-item text-default"
      >
        <span :style="{ background: getColor(item.tone) }" class="legend-dot radius-sm"></span>
        <span class="legend-label text-grey overflow">{{ item.label }}</span>
        <span class="legend-value">{{ item.value }}<small v-if="showPercent" class="text-grey"> {{ item.percent }}%</small></span>
      </component>
    </div>
    <NoData v-if="normalizedItems.length === 0"></NoData>
  </div>
</template>

<script>
import { getToneColor } from './display-utils.js';

export default {
  name: 'WorkbenchDistribution',
  props: {
    title: { type: String, default: '' },
    items: { type: Array, default: () => [] },
    showPercent: { type: Boolean, default: true }
  },
  methods: {
    getColor(tone) {
      return getToneColor(tone);
    }
  },
  computed: {
    total() {
      return this.items.reduce((total, item) => total + Math.max(0, Number(item.value) || 0), 0);
    },
    totalLabel() {
      return this.total ? this.$t('term.workbench.total', { count: this.total }) : '';
    },
    normalizedItems() {
      if (!this.total) {
        return [];
      }
      return this.items
        .map(item => {
          const value = Math.max(0, Number(item.value) || 0);
          return {
            ...item,
            value,
            percent: Math.round(value / this.total * 100)
          };
        })
        .filter(item => item.value > 0);
    }
  }
};
</script>

<style lang="less" scoped>
.distribution-header {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}
.distribution-title {
  font-weight: 600;
}
.distribution-track {
  height: 10px;
  display: flex;
  overflow: hidden;
}
.distribution-segment {
  min-width: 2px;
  height: 100%;
  transition: width 0.2s ease;
}
.distribution-legend {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(108px, 1fr));
  gap: 8px 12px;
}
.legend-item {
  min-width: 0;
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  gap: 6px;
  align-items: center;
  font-size: 11px;
  text-decoration: none;
}
.legend-dot {
  width: 8px;
  height: 8px;
}
.legend-value {
  white-space: nowrap;
}
.legend-value small {
  font-size: 9px;
}
</style>
