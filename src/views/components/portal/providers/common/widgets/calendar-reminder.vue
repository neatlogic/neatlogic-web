<template>
  <WorkbenchCard
    :title="title"
    :subtitle="today.week"
    icon="tsfont-calendar"
    tone="primary"
  >
    <WorkbenchSummary :summary="dateSummary" class="mb-sm"></WorkbenchSummary>
    <WorkbenchTimeline :items="visibleReminderList"></WorkbenchTimeline>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from './workbench-card.vue';
import WorkbenchSummary from '@/views/components/portal/components/display/WorkbenchSummary.vue';
import WorkbenchTimeline from '@/views/components/portal/components/display/WorkbenchTimeline.vue';

export default {
  name: 'CommonCalendarReminder',
  components: {
    WorkbenchCard,
    WorkbenchSummary,
    WorkbenchTimeline
  },
  props: {
    title: { type: String, default: '日历提醒' },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      reminderList: [
        { id: 1, time: '09:30', title: '检查今日待办与风险事项', description: '工作台例行检查', tone: 'primary' },
        { id: 2, time: '14:00', title: '处理待审批任务', description: '关注超时审批', tone: 'warning' },
        { id: 3, time: '17:30', title: '确认执行结果与异常', description: '完成当日收尾', tone: 'danger' },
        { id: 4, time: '明日', title: '查看后续工作安排', description: '提前识别冲突', tone: 'info' }
      ]
    };
  },
  computed: {
    today() {
      const date = new Date();
      const weekList = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return {
        day: String(date.getDate()).padStart(2, '0'),
        month: `${date.getFullYear()}年${date.getMonth() + 1}月`,
        week: weekList[date.getDay()]
      };
    },
    dateSummary() {
      return {
        value: this.today.day,
        label: this.today.month,
        description: `${this.visibleReminderList.length} 项工作提醒`,
        tone: 'primary',
        icon: 'tsfont-calendar'
      };
    },
    visibleReminderList() {
      return this.reminderList.slice(0, Math.max(1, Number(this.config.limit) || 4));
    }
  }
};
</script>
