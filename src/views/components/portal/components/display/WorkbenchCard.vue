<template>
  <section
    :class="[
      'workbench-card bg-op text-default radius-lg',
      { 'is-dense': dense, 'has-accent': tone }
    ]"
    :style="cardStyle"
  >
    <div v-if="showHeader" class="card-header">
      <div v-if="icon" :class="[iconClass, backgroundClass, 'card-icon radius-md flex-center']">
        <i :class="icon"></i>
      </div>
      <div class="card-heading overflow">
        <div class="card-title overflow">{{ title }}</div>
        <div v-if="subtitle" class="card-subtitle text-grey overflow mt-xs">{{ subtitle }}</div>
      </div>
      <div v-if="$slots.action" class="card-action"><slot name="action"></slot></div>
    </div>
    <div v-if="loading" class="card-state flex-center text-grey">
      <i class="tsfont-spinner"></i>
      <span>{{ loadingText }}</span>
    </div>
    <div v-else-if="error" class="card-state flex-center text-danger">
      <i class="tsfont-warning-o"></i>
      <span>{{ error }}</span>
      <span v-if="$listeners.retry" class="text-action" @click="$emit('retry')">重试</span>
    </div>
    <div v-else-if="empty" class="card-state flex-center">
      <NoData :text="emptyText"></NoData>
    </div>
    <div v-else class="card-body"><slot></slot></div>
  </section>
</template>

<script>
import { getToneBackgroundClass, getToneTextClass } from './display-utils.js';

export default {
  name: 'WorkbenchCard',
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '' },
    tone: { type: String, default: '' },
    dense: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
    empty: { type: Boolean, default: false },
    loadingText: { type: String, default: '加载中...' },
    emptyText: { type: String, default: '' }
  },
  computed: {
    showHeader() {
      return !!(this.title || this.subtitle || this.icon || this.$slots.action);
    },
    iconClass() {
      return getToneTextClass(this.tone);
    },
    backgroundClass() {
      return getToneBackgroundClass(this.tone);
    },
    cardStyle() {
      const colorMap = {
        primary: 'var(--primary-color, #00bcd4)',
        info: 'var(--info-color, #2d8cf0)',
        success: 'var(--success-color, #19be6b)',
        warning: 'var(--warning-color, #ff9900)',
        danger: 'var(--error-color, #ed4014)'
      };
      return {
        '--workbench-accent': colorMap[this.tone] || 'var(--primary-color, #00bcd4)'
      };
    }
  }
};
</script>

<style lang="less" scoped>
.workbench-card {
  position: relative;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  &.has-accent::before {
    position: absolute;
    top: 0;
    left: 16px;
    right: 16px;
    height: 2px;
    border-radius: 0 0 2px 2px;
    background: var(--workbench-accent);
    opacity: 0.32;
    content: '';
  }
  &.is-dense {
    padding: 12px;
    .card-header {
      margin-bottom: 8px;
    }
  }
}
.card-header {
  flex: none;
  min-height: 32px;
  margin-bottom: 12px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
}
.card-icon {
  width: 30px;
  height: 30px;
  font-size: 16px;
}
.card-heading {
  min-width: 0;
}
.card-title {
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
}
.card-subtitle {
  font-size: 11px;
  line-height: 15px;
}
.card-action {
  min-width: 0;
  font-size: 12px;
}
.card-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}
.card-state {
  flex: 1;
  min-height: 96px;
  flex-direction: column;
  gap: 7px;
  font-size: 12px;
}
@media screen and (max-width: 1200px) {
  .workbench-card {
    padding: 12px;
  }
  .card-subtitle {
    display: none;
  }
}
</style>
