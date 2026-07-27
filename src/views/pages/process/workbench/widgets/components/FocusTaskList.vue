<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-if="config.showMore !== 0" v-slot:action>更多</template>
    <div class="focus-list">
      <div v-for="item in list" :key="item.no" class="focus-row mb-sm">
        <div class="row-main">
          <div class="row-title overflow">{{ item.title }}</div>
          <div class="row-sub text-grey mt-xs">{{ item.no }}</div>
        </div>
        <div class="progress-wrap">
          <span class="progress-bar bg-tip-grey">
            <i :class="getProgressClass(item.tone)" :style="{ width: item.progress }"></i>
          </span>
          <span class="text-grey">{{ item.progress }}</span>
        </div>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'FocusTaskList',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    title: { type: String, default: '我的关注' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      sourceList: [
        { no: 'INC202607270001', title: '办公网络间歇性中断', progress: '65%', tone: 'orange' }
      ]
    };
  },
  methods: {
    getProgressClass(tone) {
      return {
        red: 'bg-error',
        orange: 'bg-warning',
        green: 'bg-success'
      }[tone] || 'bg-primary';
    }
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
.focus-list {
  min-height: 0;
}
.focus-row {
  min-height: 48px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 12px;
  align-items: center;
}
.progress-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36px;
  gap: 8px;
  align-items: center;
}
.progress-bar {
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
