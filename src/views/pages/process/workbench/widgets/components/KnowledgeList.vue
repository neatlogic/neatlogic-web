<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-if="config.showMore !== 0" v-slot:action>{{ actionText }}</template>
    <div class="portal-mini-list">
      <div
        v-for="item in list"
        :key="item.title"
        class="knowledge-row mb-sm cursor-pointer"
        @click="$emit('select', item)"
      >
        <div class="row-main">
          <div class="row-title overflow">{{ item.title }}</div>
          <div class="row-sub text-grey mt-xs">{{ item.category }} · {{ item.count }} 次浏览</div>
        </div>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'KnowledgeList',
  components: { PortalCard },
  props: {
    items: { type: Array, default: () => [] },
    title: { type: String, default: '' },
    actionText: { type: String, default: '知识库' },
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
    }
  }
};
</script>

<style lang="less" scoped>
@import './portal-list.less';
.knowledge-row {
  cursor: pointer;
  min-height: 46px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
}
</style>
