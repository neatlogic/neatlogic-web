<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-if="config.showCustom !== 0" v-slot:action>自定义</template>
    <div class="quick-grid" :style="gridStyle">
      <div
        v-for="item in list"
        :key="item.name"
        class="quick-item bg-hover-grey radius-lg padding-xs cursor-pointer text-center"
        @click="handleClick(item)"
      >
        <div class="quick-icon bg-selected text-primary radius-md flex-center"><i :class="item.icon"></i></div>
        <div class="quick-name mt-sm">{{ item.name }}</div>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'QuickActionGrid',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '快捷操作' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      sourceList: []
    };
  },
  methods: {
    handleClick(item) {
      this.$router.push(item.path);
    }
  },
  computed: {
    isEmpty() {
      return !this.list.length;
    },
    list() {
      const limit = Number(this.config.limit) || this.sourceList.length;
      return this.sourceList.slice(0, limit);
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
.quick-grid {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  align-content: start;
  .quick-icon {
    width: 42px;
    height: 42px;
    font-size: 22px;
  }
  .quick-name {
    color: inherit;
    font-size: 12px;
  }
}
</style>
