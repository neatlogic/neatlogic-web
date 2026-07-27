<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-if="config.showMore !== 0" v-slot:action>本周</template>
    <div class="portal-mini-list">
      <div v-for="item in list" :key="item.date + item.title" class="calendar-row mb-sm">
        <span class="calendar-date radius-lg flex-center text-bold" :class="getToneClass(item.tone)">{{ item.date }}</span>
        <div class="row-main">
          <div class="row-title overflow">{{ item.title }}</div>
          <div class="row-sub text-grey mt-xs">{{ item.window }}</div>
        </div>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'ChangeCalendar',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    title: { type: String, default: '变更日历' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      sourceList: [
        { date: '07/30', title: '核心网络变更', window: '22:00-23:00', tone: 'blue' }
      ]
    };
  },
  methods: {
    getToneClass(tone) {
      return {
        blue: 'text-primary bg-selected',
        orange: 'text-warning bg-warning-grey',
        green: 'text-success bg-success-grey'
      }[tone] || 'text-primary bg-selected';
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
.calendar-row {
  min-height: 46px;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}
.calendar-date {
  width: 50px;
  height: 34px;
}
</style>
