<template>
  <WorkbenchCard
    :title="title"
    icon="tsfont-chart-line"
    tone="success"
    :subtitle="description"
  >
    <template v-slot:action>
      <a :href="resultHref" class="text-action">巡检结果</a>
    </template>
    <WorkbenchMiniTrend
      :data="trendList"
      value="97.2%"
      label="本周巡检通过率"
      description="问题数 -12%"
      tone="success"
    ></WorkbenchMiniTrend>
    <WorkbenchMetricGroup
      v-if="config.showMetrics !== 0"
      :metrics="metricList"
      compact
      class="mt-sm"
    ></WorkbenchMetricGroup>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';
import WorkbenchMetricGroup from '@/views/components/portal/components/display/WorkbenchMetricGroup.vue';
import WorkbenchMiniTrend from '@/views/components/portal/components/display/WorkbenchMiniTrend.vue';

export default {
  name: 'InspectQualityTrend',
  components: {
    WorkbenchCard,
    WorkbenchMetricGroup,
    WorkbenchMiniTrend
  },
  props: {
    title: { type: String, default: '问题趋势与通过率' },
    description: { type: String, default: '' },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      trendList: [
        { label: '周一', value: 18 },
        { label: '周二', value: 16 },
        { label: '周三', value: 14 },
        { label: '周四', value: 15 },
        { label: '周五', value: 11 },
        { label: '周六', value: 9 },
        { label: '周日', value: 8 }
      ],
      metricList: [
        { key: 'checked', label: '已巡检资产', value: 436, tone: 'primary' },
        { key: 'issue', label: '未关闭问题', value: 9, tone: 'danger' }
      ]
    };
  },
  computed: {
    resultHref() {
      return `${HOME}/inspect.html#/inspect-result`;
    }
  }
};
</script>
