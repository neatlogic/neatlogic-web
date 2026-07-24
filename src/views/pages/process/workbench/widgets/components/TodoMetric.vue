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
    return { loading: false, error: '', metric: null };
  }
};
</script>
