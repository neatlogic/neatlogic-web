<template>
  <WorkbenchCard
    :title="title"
    :icon="preset.icon"
    :tone="summary.tone"
    :subtitle="preset.summary"
  >
    <template v-slot:action>
      <a :href="jobListHref" class="text-action">全部作业</a>
    </template>
    <WorkbenchSummary :summary="summary" class="mb-sm"></WorkbenchSummary>
    <WorkbenchActionList
      :items="visibleJobList"
      :showStatus="config.showStatus !== 0"
      dense
    ></WorkbenchActionList>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/providers/common/widgets/workbench-card.vue';
import WorkbenchActionList from '@/views/components/portal/components/display/WorkbenchActionList.vue';
import WorkbenchSummary from '@/views/components/portal/components/display/WorkbenchSummary.vue';

const presetMap = {
  running: {
    total: 4,
    summary: '项任务正在执行',
    icon: 'tsfont-spinner',
    color: 'text-primary',
    list: [
      { id: 'mock-running-1', name: '生产集群健康检查', status: '68%', time: '开始于 10:30', icon: 'tsfont-spinner', color: 'text-primary' },
      { id: 'mock-running-2', name: '服务器补丁安装', status: '42%', time: '开始于 10:18', icon: 'tsfont-spinner', color: 'text-primary' },
      { id: 'mock-running-3', name: '日志归档与清理', status: '81%', time: '开始于 09:55', icon: 'tsfont-spinner', color: 'text-primary' }
    ]
  },
  failed: {
    total: 3,
    summary: '项失败作业待处理',
    icon: 'tsfont-close-o',
    color: 'text-danger',
    list: [
      { id: 'mock-failed-1', name: '数据库备份校验', status: '执行失败', time: '失败于 09:45', icon: 'tsfont-close-o', color: 'text-danger' },
      { id: 'mock-failed-2', name: '网络配置核对', status: '参数错误', time: '失败于 08:20', icon: 'tsfont-warning-o', color: 'text-warning' },
      { id: 'mock-failed-3', name: '证书批量更新', status: '超时', time: '失败于 昨日', icon: 'tsfont-time', color: 'text-warning' }
    ]
  },
  approval: {
    total: 2,
    summary: '项任务等待审批',
    icon: 'tsfont-time',
    color: 'text-warning',
    list: [
      { id: 'mock-approval-1', name: '生产主机重启', status: '高风险', time: '提交于 10:05', icon: 'tsfont-warning-o', color: 'text-danger' },
      { id: 'mock-approval-2', name: '数据库参数调整', status: '待审批', time: '提交于 08:20', icon: 'tsfont-time', color: 'text-warning' }
    ]
  }
};

export default {
  name: 'AutoexecJobAttention',
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
      return presetMap[this.config.kind] || presetMap.running;
    },
    visibleJobList() {
      return this.preset.list.slice(0, Math.max(1, Number(this.config.limit) || 5)).map(job => ({
        id: job.id,
        title: job.name,
        description: job.time,
        status: job.status,
        icon: job.icon,
        tone: this.preset.color === 'text-danger' ? 'danger' : (this.preset.color === 'text-warning' ? 'warning' : 'primary'),
        progress: this.config.kind === 'running' ? Number.parseInt(job.status) : null,
        href: `${HOME}/autoexec.html#/job-detail?id=${job.id}`
      }));
    },
    summary() {
      return {
        value: this.preset.total,
        label: this.preset.summary,
        tone: this.preset.color === 'text-danger' ? 'danger' : (this.preset.color === 'text-warning' ? 'warning' : 'primary'),
        icon: this.preset.icon
      };
    },
    jobListHref() {
      return `${HOME}/autoexec.html#/job-manage`;
    }
  }
};
</script>
