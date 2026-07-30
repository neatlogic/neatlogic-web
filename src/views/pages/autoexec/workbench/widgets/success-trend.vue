<template>
  <WorkbenchCard
    :title="title"
    icon="tsfont-chart-line"
    tone="success"
    :subtitle="description"
  >
    <template v-slot:action>
      <a :href="jobHref" class="text-action">执行记录</a>
    </template>
    <WorkbenchMiniTrend
      :data="trendList"
      value="96.8%"
      label="执行成功率"
      description="较上周 +1.4%"
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
  name: 'AutoexecSuccessTrend',
  components: {
    WorkbenchCard,
    WorkbenchMetricGroup,
    WorkbenchMiniTrend
  },
  props: {
    title: { type: String, default: '近7日执行成功率' },
    description: { type: String, default: '' },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      trendList: [
        { label: '周一', value: 92 },
        { label: '周二', value: 95 },
        { label: '周三', value: 94 },
        { label: '周四', value: 97 },
        { label: '周五', value: 96 },
        { label: '周六', value: 98 },
        { label: '周日', value: 97 }
      ],
      metricList: [
        { key: 'executed', label: '执行次数', value: 268, tone: 'primary' },
        { key: 'failed', label: '失败次数', value: 8, tone: 'danger' }
      ]
    };
  },
  computed: {
    jobHref() {
      return `${HOME}/autoexec.html#/job-manage`;
    }
  }
};
</script>
