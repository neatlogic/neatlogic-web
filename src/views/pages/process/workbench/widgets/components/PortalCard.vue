<template>
  <div class="portal-card bg-op text-default radius-lg padding">
    <div v-if="title || $slots.action" class="portal-card-header align-center mb-md">
      <div class="portal-card-title">{{ title }}</div>
      <div class="portal-card-action text-primary"><slot name="action"></slot></div>
    </div>
    <div v-if="loading" class="portal-card-state flex-center text-grey">
      <span class="tsfont-loading"></span>
      <span>Loading...</span>
    </div>
    <div v-else-if="error" class="portal-card-state flex-center text-danger">
      <span class="tsfont-warning-o"></span>
      <span>{{ error }}</span>
    </div>
    <NoData v-else-if="empty"></NoData>
    <div v-else class="portal-card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PortalCard',
  props: {
    title: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
    empty: { type: Boolean, default: false }
  }
};
</script>

<style lang="less" scoped>
.portal-card {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
  min-width: 0;
  display: flex;
  flex-direction: column;
  .portal-card-header {
    flex: none;
    height: 24px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .portal-card-title {
    font-size: 14px;
    font-weight: 700;
  }
  .portal-card-action {
    font-size: 12px;
  }
  .portal-card-body {
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }
  .portal-card-state {
    flex: 1;
    min-height: 0;
    gap: 6px;
    font-size: 12px;
  }
}
</style>
