<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-slot:action>全部已读</template>
    <div class="notice-list">
      <div v-for="item in list" :key="item.text" class="notice-row mb-sm">
        <span class="notice-dot bg-primary mt-sm"></span>
        <div class="row-main">
          <div class="row-title overflow">【{{ item.type }}】{{ item.text }}</div>
          <div class="row-sub text-grey mt-xs">{{ item.time }}</div>
        </div>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'SystemNoticeList',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '系统通知' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      sourceList: [
        { type: '系统', text: '服务台将在今晚进行例行维护', time: '今天 09:30' }
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
    }
  }
};
</script>

<style lang="less" scoped>
@import './portal-list.less';
.notice-row {
  min-height: 38px;
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}
.notice-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
</style>
