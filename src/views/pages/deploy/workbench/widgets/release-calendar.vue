<template>
  <WorkbenchCard
    :title="title"
    icon="tsfont-calendar"
    tone="warning"
    :subtitle="description"
  >
    <template v-slot:action>
      <a :href="versionHref" class="text-action">版本中心</a>
    </template>
    <WorkbenchMetricGroup :metrics="metricList" compact class="mb-md"></WorkbenchMetricGroup>
    <WorkbenchTimeline
      :items="timelineList"
      :limit="Math.max(1, Number(config.limit) || 5)"
    ></WorkbenchTimeline>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';
import WorkbenchMetricGroup from '@/views/components/portal/components/display/WorkbenchMetricGroup.vue';
import WorkbenchTimeline from '@/views/components/portal/components/display/WorkbenchTimeline.vue';

export default {
  name: 'DeployReleaseCalendar',
  components: {
    WorkbenchCard,
    WorkbenchMetricGroup,
    WorkbenchTimeline
  },
  props: {
    title: { type: String, default: '发布日程与维护窗口' },
    description: { type: String, default: '' },
    config: { type: Object, default: () => ({}) }
  },
  computed: {
    metricList() {
      return [
        { key: 'today', label: '今日发布', value: 3, tone: 'warning' },
        { key: 'window', label: '可用窗口', value: 2, tone: 'success' }
      ];
    },
    timelineList() {
      return [
        { id: 1, title: '订单中心 v4.8.2', description: '生产环境 · 灰度发布', time: '今天 22:00', tone: 'warning', href: this.versionHref },
        { id: 2, title: '用户中心 v3.6.0', description: '生产环境 · 滚动升级', time: '明天 01:00', tone: 'primary', href: this.versionHref },
        { id: 3, title: '维护窗口', description: '核心应用禁止变更', time: '周五 20:00', tone: 'danger' },
        { id: 4, title: '数据服务 v2.1.4', description: '预生产环境', time: '周六 10:00', tone: 'success', href: this.versionHref }
      ];
    },
    versionHref() {
      return `${HOME}/deploy.html#/version-center-manage`;
    }
  }
};
</script>
