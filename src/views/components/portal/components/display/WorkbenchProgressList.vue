<template>
  <div class="workbench-progress-list">
    <div v-for="item in visibleItems" :key="item.id || item.title" class="progress-row">
      <div class="progress-head">
        <span class="overflow">{{ item.title }}</span>
        <span :class="getTextClass(item.tone)">{{ getPercent(item.progress) }}%</span>
      </div>
      <Progress
        :percent="getPercent(item.progress)"
        :status="item.tone === 'danger' || item.tone === 'red' ? 'wrong' : 'active'"
        :stroke-width="6"
        hide-info
      ></Progress>
      <div v-if="item.description" class="progress-description text-grey overflow">{{ item.description }}</div>
    </div>
    <NoData v-if="visibleItems.length === 0"></NoData>
  </div>
</template>

<script>
import { clampPercent, getToneTextClass } from './display-utils.js';

export default {
  name: 'WorkbenchProgressList',
  props: {
    items: { type: Array, default: () => [] },
    limit: { type: Number, default: 0 }
  },
  methods: {
    getPercent(value) {
      return clampPercent(value);
    },
    getTextClass(tone) {
      return getToneTextClass(tone);
    }
  },
  computed: {
    visibleItems() {
      return this.limit > 0 ? this.items.slice(0, this.limit) : this.items;
    }
  }
};
</script>

<style lang="less" scoped>
.progress-row {
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
}
.progress-head {
  margin-bottom: 5px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  font-size: 12px;
}
.progress-description {
  margin-top: 3px;
  font-size: 11px;
}
</style>
