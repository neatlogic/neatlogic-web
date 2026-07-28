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

const issueHref = `${HOME}/inspect.html#/recent-issues-`;
const jobHref = `${HOME}/inspect.html#/job-manage`;
const assetHref = `${HOME}/inspect.html#/assets-inspection-manage`;
const presetMap = {
  issue: {
    total: 9,
    summary: '个近期问题待处理',
    icon: 'tsfont-warning-o',
    color: 'text-danger',
    moreHref: issueHref,
    list: [
      { id: 1, name: '磁盘使用率超过 90%', detail: '生产数据库 DB-01', status: '严重', icon: 'tsfont-warning-o', color: 'text-danger', href: issueHref },
      { id: 2, name: '证书将在 7 天内到期', detail: 'API 网关集群', status: '预警', icon: 'tsfont-time', color: 'text-warning', href: issueHref },
      { id: 3, name: '备份任务连续失败', detail: '文件服务器 FS-03', status: '异常', icon: 'tsfont-close-o', color: 'text-danger', href: issueHref }
    ]
  },
  running: {
    total: 4,
    summary: '项巡检正在执行',
    icon: 'tsfont-spinner',
    color: 'text-primary',
    moreHref: jobHref,
    list: [
      { id: 1, name: '生产主机日常巡检', detail: '已完成 68/100 台', status: '68%', icon: 'tsfont-spinner', color: 'text-primary', href: jobHref },
      { id: 2, name: '数据库专项巡检', detail: '已完成 8/12 个实例', status: '66%', icon: 'tsfont-spinner', color: 'text-primary', href: jobHref },
      { id: 3, name: '网络设备配置核查', detail: '已完成 34/40 台', status: '85%', icon: 'tsfont-spinner', color: 'text-primary', href: jobHref }
    ]
  },
  asset: {
    total: 12,
    summary: '台资产存在异常',
    icon: 'tsfont-ci',
    color: 'text-warning',
    moreHref: assetHref,
    list: [
      { id: 1, name: '生产数据库 DB-01', detail: '3 个严重问题', status: '高风险', icon: 'tsfont-db', color: 'text-danger', href: assetHref },
      { id: 2, name: '应用服务器 APP-08', detail: '2 个性能问题', status: '需处理', icon: 'tsfont-ip-object', color: 'text-warning', href: assetHref },
      { id: 3, name: '负载均衡 LB-02', detail: '1 个配置问题', status: '需确认', icon: 'tsfont-ci', color: 'text-warning', href: assetHref }
    ]
  }
};

export default {
  name: 'InspectAttention',
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
      return presetMap[this.config.kind] || presetMap.issue;
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
