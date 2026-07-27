<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-if="config.showMore !== 0" v-slot:action>更多</template>
    <div class="portal-mini-list">
      <div v-for="item in list" :key="item.title" class="announcement-row mb-sm">
        <Tag>{{ item.tag }}</Tag>
        <div class="row-main">
          <div class="row-title overflow">{{ item.title }}</div>
          <div class="row-sub text-grey mt-xs">{{ item.time }}</div>
        </div>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'AnnouncementPanel',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    title: { type: String, default: '公告栏' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      sourceList: [
        { tag: '通知', title: '服务台维护通知', time: '今天 09:00' }
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
.announcement-row {
  min-height: 46px;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}
</style>
