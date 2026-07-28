<template>
  <div class="workbench-timeline">
    <component
      :is="item.href ? 'a' : 'div'"
      v-for="item in visibleItems"
      :key="item.id || `${item.time}-${item.title}`"
      :href="item.href || undefined"
      class="timeline-row text-default"
    >
      <div class="timeline-track">
        <span :class="[getBackgroundClass(item.tone), 'timeline-dot']"></span>
      </div>
      <div class="timeline-main overflow">
        <div class="timeline-title overflow">{{ item.title }}</div>
        <div v-if="item.description" class="text-grey overflow mt-xs">{{ item.description }}</div>
      </div>
      <div :class="[getTextClass(item.tone), 'timeline-time']">{{ item.time }}</div>
    </component>
    <NoData v-if="visibleItems.length === 0"></NoData>
  </div>
</template>

<script>
import { getToneBackgroundClass, getToneTextClass } from './display-utils.js';

export default {
  name: 'WorkbenchTimeline',
  props: {
    items: { type: Array, default: () => [] },
    limit: { type: Number, default: 0 }
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
    }
  }
};
</script>

<style lang="less" scoped>
.timeline-row {
  min-height: 46px;
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
  font-size: 12px;
}
.timeline-track {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  &::after {
    position: absolute;
    top: 15px;
    bottom: -3px;
    width: 1px;
    background: var(--border-color);
    content: '';
  }
}
.timeline-row:last-child .timeline-track::after {
  display: none;
}
.timeline-dot {
  position: relative;
  z-index: 1;
  width: 9px;
  height: 9px;
  margin-top: 4px;
  border-radius: 50%;
}
.timeline-main {
  min-width: 0;
}
.timeline-title {
  line-height: 18px;
}
.timeline-time {
  max-width: 72px;
  line-height: 18px;
  white-space: nowrap;
}
</style>
