<template>
  <WorkbenchCard
    :title="title"
    icon="tsfont-chart-progress"
    tone="primary"
    subtitle="待办、处理中和即将超时情况"
  >
    <template v-slot:action>
      <a :href="taskHref" class="text-action">进入工作中心</a>
    </template>
    <WorkbenchMetricGroup :metrics="metricList"></WorkbenchMetricGroup>
    <div
      v-if="config.showTrend !== 0"
      class="overview-detail mt-md"
    >
      <WorkbenchDistribution
        title="工单状态分布"
        :items="distributionList"
      ></WorkbenchDistribution>
      <WorkbenchComparison
        label="目标时间内响应率"
        :current="92"
        :previous="89"
        :target="95"
        unit="%"
        tone="success"
        description="较上期提升 3 个百分点"
      ></WorkbenchComparison>
    </div>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';
import WorkbenchComparison from '@/views/components/portal/components/display/WorkbenchComparison.vue';
import WorkbenchDistribution from '@/views/components/portal/components/display/WorkbenchDistribution.vue';
import WorkbenchMetricGroup from '@/views/components/portal/components/display/WorkbenchMetricGroup.vue';

export default {
  name: 'ProcessTaskStatusOverview',
  components: {
    WorkbenchCard,
    WorkbenchComparison,
    WorkbenchDistribution,
    WorkbenchMetricGroup
  },
  props: {
    title: { type: String, default: '工单状态概览' },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      metricList: [
        { key: 'todo', label: '我的待办', value: 16, trend: '4 单待接单', tone: 'primary', icon: 'tsfont-task' },
        { key: 'doing', label: '处理中', value: 12, trend: '较昨日 +2', tone: 'success', icon: 'tsfont-spinner' },
        { key: 'risk', label: 'SLA风险', value: 3, trend: '1 单已超时', tone: 'danger', icon: 'tsfont-sla' }
      ],
      distributionList: [
        { key: 'todo', label: '待响应', value: 6, tone: 'warning' },
        { key: 'doing', label: '处理中', value: 12, tone: 'primary' },
        { key: 'done', label: '已完成', value: 24, tone: 'success' },
        { key: 'risk', label: '风险', value: 3, tone: 'danger' }
      ]
    };
  },
  computed: {
    taskHref() {
      return `${HOME}/process.html#/task-overview-processingOfMineProcessTask`;
    }
  }
};
</script>

<style lang="less" scoped>
.overview-detail {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(180px, 0.8fr);
  gap: 12px;
}
@media screen and (max-width: 1200px) {
  .overview-detail {
    grid-template-columns: 1fr;
  }
}
</style>
