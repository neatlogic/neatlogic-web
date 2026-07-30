<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
    icon="tsfont-sla"
    tone="danger"
    :subtitle="description"
  >
    <template v-if="config.showMore !== 0" v-slot:action>
      <a :href="workcenterHref" class="text-action">优先处理</a>
    </template>
    <WorkbenchSummary :summary="summary" class="mb-sm"></WorkbenchSummary>
    <WorkbenchActionList
      :items="list"
      :showStatus="config.showStatus !== 0"
      dense
      @select="toDetail"
    ></WorkbenchActionList>
  </PortalCard>
</template>

<script>
import WorkbenchActionList from '@/views/components/portal/components/display/WorkbenchActionList.vue';
import WorkbenchSummary from '@/views/components/portal/components/display/WorkbenchSummary.vue';
import PortalCard from './PortalCard.vue';

export default {
  name: 'SlaRiskList',
  components: {
    PortalCard,
    WorkbenchActionList,
    WorkbenchSummary
  },
  props: {
    widget: { type: Object },
    title: { type: String, default: 'SLA 风险' },
    description: { type: String, default: '' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      sourceList: [
        { id: 'mock-sla-1', level: '超时', title: '核心业务系统访问异常', remain: '已超时 18 分钟', remainMinutes: -18 },
        { id: 'mock-sla-2', level: '高', title: '生产账号权限申请', remain: '25 分钟', remainMinutes: 25 },
        { id: 'mock-sla-3', level: '中', title: '办公网络连接不稳定', remain: '55 分钟', remainMinutes: 55 }
      ]
    };
  },
  methods: {
    toDetail(item) {
      const path = `/task-detail?processTaskId=${item.id}`;
      if (MODULEID === 'process') {
        this.$router.push(path);
      } else {
        window.location.href = `${HOME}/process.html#${path}`;
      }
    }
  },
  computed: {
    summary() {
      const overdueCount = this.list.filter(item => item.remainMinutes < 0).length;
      return {
        value: this.list.length,
        label: '单存在SLA风险',
        description: overdueCount ? `${overdueCount} 单已经超时` : '请按剩余时间优先处理',
        tone: overdueCount ? 'danger' : 'warning',
        icon: 'tsfont-sla'
      };
    },
    isEmpty() {
      return !this.list.length;
    },
    list() {
      const limit = Number(this.config.limit) || this.sourceList.length;
      const warnMinutes = Number(this.config.warnMinutes) || 60;
      return this.sourceList
        .filter(item => item.remainMinutes <= warnMinutes)
        .sort((a, b) => a.remainMinutes - b.remainMinutes)
        .slice(0, limit)
        .map(item => ({
          ...item,
          description: `剩余 ${item.remain}`,
          status: item.level,
          tone: item.remainMinutes < 0 ? 'danger' : 'warning',
          icon: item.remainMinutes < 0 ? 'tsfont-close-o' : 'tsfont-time'
        }));
    },
    workcenterHref() {
      return `${HOME}/process.html#/task-overview-processingOfMineProcessTask`;
    }
  }
};
</script>
