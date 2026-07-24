<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-slot:action>更多</template>
    <div class="operation-list">
      <div v-for="item in list" :key="item.user + item.time" class="operation-row mb-md">
        <div class="avatar bg-selected text-primary flex-center text-bold">{{ item.user.substr(0, 1) }}</div>
        <div class="row-main">
          <div class="row-title overflow"><strong>{{ item.user }}</strong> {{ item.action }}</div>
          <div class="row-sub text-grey mt-xs">{{ item.time }}</div>
        </div>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'RecentOperationList',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '最近操作' },
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
.operation-row {
  min-height: 46px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
</style>
