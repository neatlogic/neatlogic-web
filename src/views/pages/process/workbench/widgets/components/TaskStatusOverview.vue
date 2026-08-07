<template>
  <WorkbenchCard
    :title="showTitle ? title : ''"
    icon="tsfont-chart-progress"
    tone="primary"
    :subtitle="description"
    :loading="loading"
    :error="error"
    @retry="loadData"
  >
    <template v-slot:action>
      <a :href="taskHref" class="text-action">{{ $t('term.workbench.entermytodos') }}</a>
    </template>
    <WorkbenchMetricGroup :metrics="metricList"></WorkbenchMetricGroup>
    <div
      v-if="config.showTrend !== 0"
      class="overview-detail mt-md"
    >
      <WorkbenchDistribution
        :title="$t('term.workbench.workorderstatusdistribution')"
        :items="distributionList"
      ></WorkbenchDistribution>
    </div>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';
import WorkbenchDistribution from '@/views/components/portal/components/display/WorkbenchDistribution.vue';
import WorkbenchMetricGroup from '@/views/components/portal/components/display/WorkbenchMetricGroup.vue';
import { $t } from '@/resources/init.js';
import {
  PERSONAL_PROCESS_TASK_OVERVIEW_HANDLER,
  PERSONAL_PROCESS_TASK_OVERVIEW_WIDGET_NAME
} from '../utils/process-widget-constants.js';

export default {
  name: 'ProcessTaskStatusOverview',
  components: {
    WorkbenchCard,
    WorkbenchDistribution,
    WorkbenchMetricGroup
  },
  props: {
    title: { type: String, default: () => $t('term.workbench.personalworkorderstatusoverview') },
    description: { type: String, default: '' },
    showTitle: { type: Boolean, default: true },
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
        portalWidgetName: PERSONAL_PROCESS_TASK_OVERVIEW_WIDGET_NAME,
        handler: PERSONAL_PROCESS_TASK_OVERVIEW_HANDLER,
        param: this.queryTimeRange
      }).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || this.$t('term.workbench.statusoverviewloadfailed'));
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
        this.error = (error && (error.Message || error.message)) || this.$t('term.workbench.statusoverviewloadfailed');
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
        { key: 'myTaskCount', label: this.$t('term.workbench.mytodos'), value: this.overview.myTaskCount, tone: 'primary', icon: 'tsfont-task' },
        { key: 'pendingCount', label: this.$t('term.workbench.availabletoclaim'), value: this.overview.pendingCount, tone: 'warning', icon: 'tsfont-spinner' },
        { key: 'runningCount', label: this.$t('term.workbench.processing'), value: this.overview.runningCount, tone: 'primary', icon: 'tsfont-spinner' },
        { key: 'timeoutCount', label: this.$t('term.workbench.timedout'), value: this.overview.timeoutCount, tone: 'danger', icon: 'tsfont-sla' }
      ];
    },
    distributionList() {
      return [
        { key: 'pendingCount', label: this.$t('term.workbench.availabletoclaim'), value: this.overview.pendingCount, tone: 'warning' },
        { key: 'runningCount', label: this.$t('term.workbench.processing'), value: this.overview.runningCount, tone: 'primary' },
        { key: 'timeoutCount', label: this.$t('term.workbench.timedout'), value: this.overview.timeoutCount, tone: 'danger' },
        { key: 'succeedCount', label: this.$t('page.completed'), value: this.overview.succeedCount, tone: 'success' }
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
