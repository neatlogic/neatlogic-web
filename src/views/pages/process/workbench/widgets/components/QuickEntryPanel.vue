<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-if="config.showCustom !== 0" v-slot:action>自定义</template>
    <div class="quick-entry-grid" :style="gridStyle">
      <div
        v-for="item in list"
        :key="item.name"
        class="quick-entry-item bg-hover-grey radius-lg flex-center text-center cursor-pointer"
        @click="$emit('select', item)"
      >
        <span class="quick-entry-icon bg-selected text-primary radius-md flex-center mb-sm"><i :class="item.icon"></i></span>
        <div class="quick-entry-name">{{ item.name }}</div>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'QuickEntryPanel',
  components: { PortalCard },
  props: {
    items: { type: Array, default: () => [] },
    title: { type: String, default: '快捷入口' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' }
  },
  computed: {
    isEmpty() {
      return !this.list.length;
    },
    list() {
      const limit = Number(this.config.limit) || this.items.length;
      return this.items.slice(0, limit);
    },
    gridStyle() {
      return {
        gridTemplateColumns: `repeat(${this.config.columnCount || 3}, minmax(0, 1fr))`
      };
    }
  }
};
</script>

<style lang="less" scoped>
.quick-entry-grid {
  height: 100%;
  min-height: 0;
  display: grid;
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  align-content: start;
}
.quick-entry-item {
  min-height: 68px;
  color: inherit;
  flex-direction: column;
}
.quick-entry-icon {
  width: 34px;
  height: 34px;
}
.quick-entry-name {
  font-size: 12px;
  line-height: 16px;
}
</style>
