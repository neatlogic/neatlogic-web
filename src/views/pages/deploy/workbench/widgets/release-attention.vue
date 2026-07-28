<template>
  <WorkbenchCard
    :title="title"
    :icon="preset.icon"
    :tone="summary.tone"
    :subtitle="preset.summary"
  >
    <template v-slot:action>
      <a :href="preset.moreHref" class="text-action">查看全部</a>
    </template>
    <WorkbenchSummary :summary="summary" class="mb-sm"></WorkbenchSummary>
    <WorkbenchActionList
      :items="visibleList"
      :showStatus="config.showStatus !== 0"
      dense
    ></WorkbenchActionList>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/providers/common/widgets/workbench-card.vue';
import WorkbenchActionList from '@/views/components/portal/components/display/WorkbenchActionList.vue';
import WorkbenchSummary from '@/views/components/portal/components/display/WorkbenchSummary.vue';

const jobHref = `${HOME}/deploy.html#/job-manage`;
const versionHref = `${HOME}/deploy.html#/version-center-manage`;
const presetMap = {
  pending: {
    total: 6,
    summary: '个版本等待发布',
    icon: 'tsfont-time',
    color: 'text-warning',
    moreHref: versionHref,
    list: [
      { id: 1, name: '订单中心 v4.8.2', detail: '计划今日 22:00', status: '待审批', icon: 'tsfont-time', color: 'text-warning', href: versionHref },
      { id: 2, name: '用户中心 v3.6.0', detail: '计划明日 01:00', status: '已排期', icon: 'tsfont-calendar', color: 'text-primary', href: versionHref },
      { id: 3, name: '数据服务 v2.1.4', detail: '等待测试确认', status: '待确认', icon: 'tsfont-check', color: 'text-warning', href: versionHref }
    ]
  },
  running: {
    total: 3,
    summary: '项部署正在执行',
    icon: 'tsfont-spinner',
    color: 'text-primary',
    moreHref: jobHref,
    list: [
      { id: 1, name: '网关服务灰度发布', detail: '生产环境 · 第 3/5 批', status: '68%', icon: 'tsfont-spinner', color: 'text-primary', href: jobHref },
      { id: 2, name: '消息中心滚动升级', detail: '预生产环境', status: '42%', icon: 'tsfont-spinner', color: 'text-primary', href: jobHref },
      { id: 3, name: '前端静态资源发布', detail: '生产环境', status: '86%', icon: 'tsfont-spinner', color: 'text-primary', href: jobHref }
    ]
  },
  risk: {
    total: 4,
    summary: '项发布需要关注',
    icon: 'tsfont-warning-o',
    color: 'text-danger',
    moreHref: jobHref,
    list: [
      { id: 1, name: '库存服务发布', detail: '健康检查未通过', status: '失败', icon: 'tsfont-close-o', color: 'text-danger', href: jobHref },
      { id: 2, name: '结算服务升级', detail: '执行超过预计 18 分钟', status: '超时', icon: 'tsfont-time', color: 'text-warning', href: jobHref },
      { id: 3, name: '搜索服务变更', detail: '存在未确认依赖', status: '有风险', icon: 'tsfont-warning-o', color: 'text-danger', href: versionHref }
    ]
  }
};

export default {
  name: 'DeployReleaseAttention',
  components: {
    WorkbenchActionList,
    WorkbenchCard,
    WorkbenchSummary
  },
  props: {
    title: { type: String, default: '' },
    config: { type: Object, default: () => ({}) }
  },
  computed: {
    preset() {
      return presetMap[this.config.kind] || presetMap.pending;
    },
    visibleList() {
      return this.preset.list.slice(0, Math.max(1, Number(this.config.limit) || 5)).map(item => ({
        id: item.id,
        title: item.name,
        description: item.detail,
        status: item.status,
        icon: item.icon,
        tone: item.color === 'text-danger' ? 'danger' : (item.color === 'text-warning' ? 'warning' : 'primary'),
        progress: this.config.kind === 'running' ? Number.parseInt(item.status) : null,
        href: item.href
      }));
    },
    summary() {
      return {
        value: this.preset.total,
        label: this.preset.summary,
        tone: this.preset.color === 'text-danger' ? 'danger' : (this.preset.color === 'text-warning' ? 'warning' : 'primary'),
        icon: this.preset.icon
      };
    }
  }
};
</script>
