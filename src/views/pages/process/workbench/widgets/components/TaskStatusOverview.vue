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
        myTask: 0,
        todo: 0,
        doing: 0,
        risk: 0,
        done: 0
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
          myTask: this.normalizeCount(result.myTask),
          todo: this.normalizeCount(result.todo),
          doing: this.normalizeCount(result.doing),
          risk: this.normalizeCount(result.risk),
          done: this.normalizeCount(result.done)
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
      return {
        timeRange: Math.max(1, Number(startTimeCondition.timeRange) || 1),
        timeUnit: startTimeCondition.timeUnit || 'year'
      };
    },
    taskHref() {
      return `${HOME}/process.html#/task-overview-processingOfMineProcessTask`;
    },
    metricList() {
      return [
        { key: 'myTask', label: '我的待办', value: this.overview.myTask, tone: 'primary', icon: 'tsfont-task' },
        { key: 'todo', label: '可抢单', value: this.overview.todo, tone: 'warning', icon: 'tsfont-spinner' },
        { key: 'doing', label: '处理中', value: this.overview.doing, tone: 'primary', icon: 'tsfont-spinner' },
        { key: 'risk', label: '已超时', value: this.overview.risk, tone: 'danger', icon: 'tsfont-sla' }
      ];
    },
    distributionList() {
      return [
        { key: 'todo', label: '可抢单', value: this.overview.todo, tone: 'warning' },
        { key: 'doing', label: '处理中', value: this.overview.doing, tone: 'primary' },
        { key: 'risk', label: '已超时', value: this.overview.risk, tone: 'danger' },
        { key: 'done', label: '已完成', value: this.overview.done, tone: 'success' }
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
