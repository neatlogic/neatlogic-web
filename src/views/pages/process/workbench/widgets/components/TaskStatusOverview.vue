<template>
  <WorkbenchCard
    :title="title"
    icon="tsfont-chart-progress"
    tone="primary"
    :subtitle="description"
    :loading="loading"
    :error="error"
    @retry="loadData"
  >
    <template v-slot:action>
      <a :href="taskHref" class="text-action">进入我的待办</a>
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
    </div>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';
import WorkbenchDistribution from '@/views/components/portal/components/display/WorkbenchDistribution.vue';
import WorkbenchMetricGroup from '@/views/components/portal/components/display/WorkbenchMetricGroup.vue';

const PORTAL_WIDGET_NAME = 'personalProcessTaskOverview';
const PORTAL_WIDGET_HANDLER = 'process.personalProcessTaskOverview';

export default {
  name: 'ProcessTaskStatusOverview',
  components: {
    WorkbenchCard,
    WorkbenchDistribution,
    WorkbenchMetricGroup
  },
  props: {
    title: { type: String, default: '工单状态概览' },
    description: { type: String, default: '' },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      overview: {
        myTaskCount: 0,
        pendingCount: 0,
        runningCount: 0,
        timeoutCount: 0,
        succeedCount: 0
      }
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.loading = true;
      this.error = '';
      this.$api.common.searchWorkbenchWidgetData({
        portalWidgetName: PORTAL_WIDGET_NAME,
        handler: PORTAL_WIDGET_HANDLER,
        param: this.queryTimeRange
      }).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '个人工单状态概览加载失败');
        }
        const result = res.Return || {};
        this.overview = {
          myTaskCount: this.normalizeCount(result.myTaskCount),
          pendingCount: this.normalizeCount(result.pendingCount),
          runningCount: this.normalizeCount(result.runningCount),
          timeoutCount: this.normalizeCount(result.timeoutCount),
          succeedCount: this.normalizeCount(result.succeedCount)
        };
      }).catch(error => {
        this.error = (error && (error.Message || error.message)) || '个人工单状态概览加载失败';
      }).finally(() => {
        this.loading = false;
      });
    },
    normalizeCount(value) {
      return Math.max(0, Number(value) || 0);
    }
  },
  computed: {
    queryTimeRange() {
      const startTimeCondition = this.config.startTimeCondition || {};
      if (startTimeCondition.startTime || startTimeCondition.endTime) {
        return {
          startTime: startTimeCondition.startTime || null,
          endTime: startTimeCondition.endTime || null
        };
      }
      return {
        timeRange: Math.max(1, Number(startTimeCondition.timeRange) || 1),
        timeUnit: startTimeCondition.timeUnit || 'week'
      };
    },
    taskHref() {
      return `${HOME}/process.html#/task-overview-processingOfMineProcessTask`;
    },
    metricList() {
      return [
        { key: 'myTaskCount', label: '我的待办', value: this.overview.myTaskCount, tone: 'primary', icon: 'tsfont-task' },
        { key: 'pendingCount', label: '可抢单', value: this.overview.pendingCount, tone: 'warning', icon: 'tsfont-spinner' },
        { key: 'runningCount', label: '处理中', value: this.overview.runningCount, tone: 'primary', icon: 'tsfont-spinner' },
        { key: 'timeoutCount', label: '已超时', value: this.overview.timeoutCount, tone: 'danger', icon: 'tsfont-sla' }
      ];
    },
    distributionList() {
      return [
        { key: 'pendingCount', label: '可抢单', value: this.overview.pendingCount, tone: 'warning' },
        { key: 'runningCount', label: '处理中', value: this.overview.runningCount, tone: 'primary' },
        { key: 'timeoutCount', label: '已超时', value: this.overview.timeoutCount, tone: 'danger' },
        { key: 'succeedCount', label: '已完成', value: this.overview.succeedCount, tone: 'success' }
      ];
    }
  },
  watch: {
    queryTimeRange: {
      deep: true,
      handler() {
        this.loadData();
      }
    }
  }
};
</script>

<style lang="less" scoped>
.overview-detail {
  min-width: 0;
}
</style>
