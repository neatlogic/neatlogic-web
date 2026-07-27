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
  name: 'TodoMetric',
  components: { MetricCard },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '待办指标' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      metric: { value: 12, trend: '其中 4 单待接单', tone: 'blue', icon: 'tsfont-task' }
    };
  }
};
</script>
