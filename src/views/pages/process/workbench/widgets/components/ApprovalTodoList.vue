<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-if="config.showMore !== 0" v-slot:action>全部</template>
    <div class="portal-mini-list">
      <div v-for="item in list" :key="item.title" class="approval-row mb-sm">
        <div class="row-main">
          <div class="row-title overflow">{{ item.title }}</div>
          <div class="row-sub text-grey mt-xs">{{ item.owner }} · {{ item.time }}</div>
        </div>
        <Tag v-if="config.showStatus !== 0">{{ item.status }}</Tag>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'ApprovalTodoList',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    title: { type: String, default: '审批待办' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      sourceList: [
        { title: '变更方案审批', owner: '王工', time: '10分钟前', status: '待审批' }
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
.approval-row {
  min-height: 46px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 68px;
  gap: 10px;
  align-items: center;
}
</style>
