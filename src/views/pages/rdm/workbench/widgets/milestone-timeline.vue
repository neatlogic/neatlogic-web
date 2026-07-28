<template>
  <WorkbenchCard
    :title="title"
    icon="tsfont-formtime"
    tone="warning"
    subtitle="近期里程碑和交付风险"
  >
    <template v-slot:action>
      <a :href="projectHref" class="text-action">项目列表</a>
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
  name: 'RdmMilestoneTimeline',
  components: {
    WorkbenchCard,
    WorkbenchMetricGroup,
    WorkbenchTimeline
  },
  props: {
    title: { type: String, default: '里程碑与交付风险' },
    config: { type: Object, default: () => ({}) }
  },
  computed: {
    metricList() {
      return [
        { key: 'upcoming', label: '临近里程碑', value: 4, tone: 'warning' },
        { key: 'blocked', label: '阻塞事项', value: 2, tone: 'danger' }
      ];
    },
    timelineList() {
      return [
        { id: 1, title: '客户门户 Beta', description: '仍有 2 个高优先级缺陷', time: '明天', tone: 'danger', href: this.projectHref },
        { id: 2, title: '统一认证联调', description: '接口联调完成度 86%', time: '3 天后', tone: 'primary', href: this.projectHref },
        { id: 3, title: '移动端体验验收', description: '等待产品确认', time: '周五', tone: 'warning', href: this.projectHref },
        { id: 4, title: '数据迁移上线', description: '风险评审已通过', time: '下周一', tone: 'success', href: this.projectHref }
      ];
    },
    projectHref() {
      return `${HOME}/rdm.html#/project-manage`;
    }
  }
};
</script>
