<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-if="config.showCustom !== 0" v-slot:action>自定义</template>
    <div class="support-grid" :style="gridStyle">
      <div v-for="item in list" :key="item.name" class="support-item bg-tip-grey padding-xs radius-lg flex-center text-center">
        <span :class="[item.icon, 'bg-selected text-primary radius-md flex-center mb-sm']"></span>
        <div>{{ item.name }}</div>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'SupportPanel',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '帮助与支持' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      sourceList: [
        { name: '使用指南', icon: 'tsfont-question-o' }
      ]
    };
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
        gridTemplateColumns: `repeat(${this.config.columnCount || 2}, minmax(0, 1fr))`
      };
    }
  }
};
</script>

<style lang="less" scoped>
.support-grid {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  align-content: start;
}
.support-item {
  color: inherit;
  flex-direction: column;
  span {
    width: 34px;
    height: 34px;
  }
}
</style>
