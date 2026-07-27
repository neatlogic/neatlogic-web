<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <div class="distribution">
      <div class="donut" :style="donutStyle">
        <div class="donut-inner bg-op text-grey">
          <div>总计</div>
          <strong class="text-title">{{ total }}</strong>
        </div>
      </div>
      <div class="distribution-list">
        <div v-for="item in list" :key="item.name" class="distribution-row">
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
  name: 'ServiceDistribution',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '服务分布' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      sourceList: [
        { name: '基础服务', value: 12, percent: '100%', color: 'var(--primary-color)' }
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
.distribution {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
}
.donut {
  width: 118px;
  height: 118px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.donut-inner {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  strong {
    font-size: 20px;
  }
}
.distribution-row {
  height: 30px;
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) 36px 46px;
  gap: 8px;
  align-items: center;
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
}
</style>
