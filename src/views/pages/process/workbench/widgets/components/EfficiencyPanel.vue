<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <div class="efficiency-grid">
      <div v-for="item in metricList" :key="item.name" class="efficiency-item radius-lg bg-tip-grey flex-center text-center">
        <div class="efficiency-value" :class="getToneClass(item.tone)">{{ item.value }}</div>
        <div class="text-grey">{{ item.name }}</div>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'EfficiencyPanel',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '处理效率' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      panelData: {
        list: []
      }
    };
  },
  methods: {
    getToneClass(tone) {
      return {
        blue: 'text-primary',
        green: 'text-success',
        orange: 'text-warning'
      }[tone] || 'text-primary';
    }
  },
  computed: {
    isEmpty() {
      return !this.metricList.length;
    },
    metricList() {
      return this.panelData.list || [];
    }
  }
};
</script>

<style lang="less" scoped>
.efficiency-grid {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
}
.efficiency-item {
  flex-direction: column;
}
.efficiency-value {
  font-size: 24px;
  font-weight: 800;
}
</style>
