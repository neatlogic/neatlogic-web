<template>
  <MetricCard
    :metric="metric"
    :config="config"
    :title="title"
    :showTitle="showTitle"
    :loading="loading"
    :error="error"
  ></MetricCard>
</template>

<script>
import MetricCard from './MetricCard.vue';

export default {
  name: 'SatisfactionMetric',
  components: { MetricCard },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '满意度' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      metric: { value: '98%', trend: '本月提升 2%', tone: 'green', icon: 'tsfont-stars' }
    };
  }
};
</script>
