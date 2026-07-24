<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <div class="distribution-block">
      <div class="mini-donut" :style="donutStyle">
        <div class="mini-donut-inner bg-op text-grey">
          <div>总计</div>
          <strong class="text-title">{{ total }}</strong>
        </div>
      </div>
      <div class="distribution-mini-list">
        <div v-for="item in list" :key="item.name" class="distribution-mini-row">
          <span class="dot" :style="{ backgroundColor: item.color }"></span>
          <span class="overflow">{{ item.name }}</span>
          <strong>{{ item.value }}</strong>
          <span class="text-grey">{{ item.percent }}</span>
        </div>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'TaskTypeDistribution',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    title: { type: String, default: '工单类型分布' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
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
    },
    total() {
      return this.sourceList.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    },
    donutStyle() {
      let start = 0;
      const colors = this.list.map(item => {
        const percent = parseInt(item.percent, 10) || 0;
        const segment = `${item.color} ${start}% ${start + percent}%`;
        start += percent;
        return segment;
      });
      return {
        background: `conic-gradient(${colors.join(', ')})`
      };
    }
  }
};
</script>

<style lang="less" scoped>
.distribution-block {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
}
.mini-donut {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mini-donut-inner {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  strong {
    font-size: 18px;
  }
}
.distribution-mini-row {
  height: 30px;
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) 34px 44px;
  gap: 8px;
  align-items: center;
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
}
</style>
