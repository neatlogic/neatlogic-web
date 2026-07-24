<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <div class="team-load-list">
      <div v-for="item in list" :key="item.name" class="team-row mb-sm">
        <div class="row-main">
          <div class="row-title overflow">{{ item.name }}</div>
          <div class="row-sub text-grey mt-xs">当前 {{ item.total }} 单 · 负载 {{ item.busy }}</div>
        </div>
        <span class="load-bar bg-tip-grey">
          <i :style="{ width: item.busy, backgroundColor: item.color }"></i>
        </span>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'TeamLoad',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '团队负载' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      sourceList: []
    };
  },
  computed: {
    isEmpty() {
      return !this.list.length;
    },
    list() {
      const limit = Number(this.config.limit) || this.sourceList.length;
      return this.sourceList.slice(0, limit);
    }
  }
};
</script>

<style lang="less" scoped>
@import './portal-list.less';
.team-load-list {
  min-height: 0;
}
.team-row {
  min-height: 44px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px;
  gap: 12px;
  align-items: center;
}
.load-bar {
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  i {
    display: block;
    height: 100%;
    border-radius: inherit;
  }
}
</style>
