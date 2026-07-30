<template>
  <WorkbenchCard
    :title="title"
    :subtitle="description"
    icon="tsfont-bell-on"
    tone="warning"
    :empty="displayNoticeList.length === 0"
  >
    <template v-slot:action>
      <a :href="historyHref" class="text-action">更多</a>
    </template>
    <WorkbenchActionList :items="displayNoticeList" dense></WorkbenchActionList>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from './workbench-card.vue';
import WorkbenchActionList from '@/views/components/portal/components/display/WorkbenchActionList.vue';

export default {
  name: 'FrameworkSystemNotice',
  components: {
    WorkbenchCard,
    WorkbenchActionList
  },
  props: {
    title: { type: String, default: '系统通知' },
    description: { type: String, default: '' },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      noticeList: [
        { id: 1, title: '平台将在今晚进行例行维护', time: '今天 18:00', tone: 'warning' },
        { id: 2, title: '新的服务目录与审批流程已发布', time: '昨天 15:20', tone: 'success' },
        { id: 3, title: '请及时处理即将到期的待办事项', time: '07-26 09:30', tone: 'danger' }
      ]
    };
  },
  computed: {
    visibleNoticeList() {
      return this.noticeList.slice(0, Math.max(1, Number(this.config.limit) || 4));
    },
    displayNoticeList() {
      return this.visibleNoticeList.map(notice => ({
        ...notice,
        icon: notice.tone === 'danger' ? 'tsfont-warning-o' : 'tsfont-bell-on',
        status: notice.time,
        href: this.historyHref
      }));
    },
    historyHref() {
      return `${HOME}/framework.html#/history-overview?activeTab=HistoryNotice`;
    }
  }
};
</script>
