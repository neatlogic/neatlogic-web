<template>
  <div class="workbench-ranking-list">
    <component
      :is="item.href ? 'a' : 'div'"
      v-for="(item, index) in visibleItems"
      :key="item.id || item.key || item.label"
      :href="item.href || undefined"
      class="ranking-row text-default"
    >
      <span :class="['ranking-index radius-sm flex-center', index < 3 ? getBackgroundClass(item.tone) : 'bg-block']">
        {{ index + 1 }}
      </span>
      <div class="ranking-main overflow">
        <div class="ranking-heading">
          <span class="overflow">{{ item.label || item.title }}</span>
          <span :class="getTextClass(item.tone)">{{ item.value }}{{ item.unit || '' }}</span>
        </div>
        <div class="ranking-track bg-block radius-sm">
          <span
            :class="[getTextClass(item.tone), 'ranking-progress radius-sm']"
            :style="{ width: `${getPercent(item.value)}%` }"
          ></span>
        </div>
      </div>
    </component>
    <NoData v-if="visibleItems.length === 0"></NoData>
  </div>
</template>

<script>
import { getToneBackgroundClass, getToneTextClass } from './display-utils.js';

export default {
  name: 'WorkbenchRankingList',
  props: {
    items: { type: Array, default: () => [] },
    limit: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  methods: {
    getTextClass(tone) {
      return getToneTextClass(tone);
    },
    getBackgroundClass(tone) {
      return getToneBackgroundClass(tone);
    },
    getPercent(value) {
      const max = this.resolvedMax || 1;
      return Math.max(0, Math.min(100, (Number(value) || 0) / max * 100));
    }
  },
  computed: {
    visibleItems() {
      const items = this.limit > 0 ? this.items.slice(0, this.limit) : this.items;
      return items.filter(Boolean);
    },
    resolvedMax() {
      if (this.max > 0) {
        return this.max;
      }
      return this.visibleItems.reduce((max, item) => Math.max(max, Number(item.value) || 0), 0);
    }
  }
};
</script>

<style lang="less" scoped>
.ranking-row {
  min-height: 43px;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 9px;
  align-items: center;
  text-decoration: none;
}
.ranking-index {
  width: 22px;
  height: 22px;
  font-size: 10px;
}
.ranking-main {
  min-width: 0;
}
.ranking-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  font-size: 11px;
}
.ranking-track {
  height: 4px;
  margin-top: 6px;
  overflow: hidden;
}
.ranking-progress {
  display: block;
  height: 100%;
  background: currentColor;
}
</style>
