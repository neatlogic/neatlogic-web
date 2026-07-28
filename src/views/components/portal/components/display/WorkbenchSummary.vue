<template>
  <div :class="[backgroundClass, 'workbench-summary radius-md padding-sm']">
    <div class="summary-main overflow">
      <span :class="[textClass, 'summary-value']">{{ summary.value }}</span>
      <span class="summary-label text-grey">{{ summary.label }}</span>
      <div v-if="summary.description" class="summary-description text-grey overflow mt-xs">
        {{ summary.description }}
      </div>
    </div>
    <div v-if="summary.icon" :class="[textClass, 'summary-icon flex-center']">
      <i :class="summary.icon"></i>
    </div>
  </div>
</template>

<script>
import { getToneBackgroundClass, getToneTextClass } from './display-utils.js';

export default {
  name: 'WorkbenchSummary',
  props: {
    summary: { type: Object, default: () => ({}) }
  },
  computed: {
    textClass() {
      return getToneTextClass(this.summary.tone);
    },
    backgroundClass() {
      return getToneBackgroundClass(this.summary.tone);
    }
  }
};
</script>

<style lang="less" scoped>
.workbench-summary {
  min-height: 58px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36px;
  gap: 10px;
  align-items: center;
  box-sizing: border-box;
}
.summary-main {
  min-width: 0;
}
.summary-value {
  margin-right: 6px;
  font-size: 24px;
  line-height: 28px;
  font-weight: 800;
}
.summary-label,
.summary-description {
  font-size: 12px;
}
.summary-icon {
  font-size: 25px;
  opacity: 0.9;
}
</style>
