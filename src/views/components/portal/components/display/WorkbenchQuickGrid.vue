<template>
  <div class="workbench-quick-grid" :style="gridStyle">
    <component
      :is="item.href ? 'a' : 'button'"
      v-for="item in visibleItems"
      :key="item.id || item.title"
      :href="item.href || undefined"
      :type="item.href ? undefined : 'button'"
      class="quick-item bg-block bg-hover-grey radius-md text-default"
      @click="$emit('select', item)"
    >
      <span :class="[getBackgroundClass(item.tone), getTextClass(item.tone), 'quick-icon radius-md flex-center']">
        <i :class="item.icon"></i>
      </span>
      <span class="quick-title overflow">{{ item.title }}</span>
      <span v-if="item.description" class="quick-description text-grey overflow">{{ item.description }}</span>
    </component>
  </div>
</template>

<script>
import { getToneBackgroundClass, getToneTextClass } from './display-utils.js';

export default {
  name: 'WorkbenchQuickGrid',
  props: {
    items: { type: Array, default: () => [] },
    limit: { type: Number, default: 0 },
    columnCount: { type: Number, default: 2 }
  },
  methods: {
    getTextClass(tone) {
      return getToneTextClass(tone);
    },
    getBackgroundClass(tone) {
      return getToneBackgroundClass(tone);
    }
  },
  computed: {
    visibleItems() {
      return this.limit > 0 ? this.items.slice(0, this.limit) : this.items;
    },
    gridStyle() {
      return {
        gridTemplateColumns: `repeat(${Math.max(1, this.columnCount)}, minmax(0, 1fr))`
      };
    }
  }
};
</script>

<style lang="less" scoped>
.workbench-quick-grid {
  display: grid;
  gap: 9px;
}
.quick-item {
  min-width: 0;
  min-height: 58px;
  padding: 8px;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  grid-template-rows: auto auto;
  gap: 2px 8px;
  align-items: center;
  border: 0;
  text-align: left;
  cursor: pointer;
}
.quick-icon {
  width: 30px;
  height: 30px;
  grid-row: 1 / span 2;
  font-size: 16px;
}
.quick-title {
  font-size: 12px;
  font-weight: 600;
}
.quick-description {
  font-size: 10px;
}
</style>
