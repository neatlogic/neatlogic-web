<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <div class="health-ring">
      <div class="ring flex-center" :style="ringStyle">
        <div class="ring-inner bg-op flex-center">
          <div class="ring-percent">{{ healthData.percent }}%</div>
          <div class="ring-label text-grey mt-xs">整体健康度</div>
        </div>
      </div>
      <div class="health-list">
        <div v-for="item in healthData.list" :key="item.name" class="health-row">
          <span class="dot" :style="{ backgroundColor: item.color }"></span>
          <span>{{ item.name }}</span>
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
  name: 'HealthRing',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '工单健康状态' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      healthData: {
        percent: 96,
        // 案例数据，后续接入接口后替换
        list: [
          { name: '正常', value: 48, percent: '96%', color: 'var(--success-color)' }
        ]
      }
    };
  },
  computed: {
    isEmpty() {
      return !(this.healthData.list || []).length;
    },
    ringStyle() {
      const percent = Number(this.healthData.percent) || 0;
      return {
        background: `conic-gradient(var(--success-color) 0 ${percent}%, var(--table-hover-color) ${percent}% 100%)`
      };
    }
  }
};
</script>

<style lang="less" scoped>
.health-ring {
  min-height: 206px;
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  .ring {
    width: 160px;
    height: 160px;
    border-radius: 50%;
  }
  .ring-inner {
    width: 108px;
    height: 108px;
    border-radius: 50%;
    flex-direction: column;
  }
  .ring-percent {
    font-size: 28px;
    font-weight: 800;
  }
  .ring-label {
    font-size: 12px;
  }
  .health-row {
    height: 34px;
    display: grid;
    grid-template-columns: 12px minmax(0, 1fr) 48px 48px;
    gap: 8px;
    align-items: center;
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  }
}
</style>
