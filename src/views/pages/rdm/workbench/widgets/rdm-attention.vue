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

const taskHref = `${HOME}/rdm.html#/task-list/doing`;
const projectHref = `${HOME}/rdm.html#/project-manage`;
const presetMap = {
  task: {
    total: 16,
    summary: '项任务需要处理',
    icon: 'tsfont-task',
    color: 'text-primary',
    moreHref: taskHref,
    list: [
      { id: 1, name: '登录流程异常处理', detail: '客户门户项目 · 今天到期', status: '进行中', icon: 'tsfont-task', color: 'text-primary', href: taskHref },
      { id: 2, name: '接口性能优化', detail: '平台升级项目 · 明天到期', status: '待处理', icon: 'tsfont-time', color: 'text-warning', href: taskHref },
      { id: 3, name: '权限模型评审', detail: '统一认证项目 · 3 天后到期', status: '评审中', icon: 'tsfont-check', color: 'text-primary', href: taskHref }
    ]
  },
  project: {
    total: 6,
    summary: '个项目正在推进',
    icon: 'tsfont-heart-s',
    color: 'text-success',
    moreHref: projectHref,
    list: [
      { id: 1, name: '客户门户升级', detail: '完成度 78% · 进度正常', status: '健康', icon: 'tsfont-check', color: 'text-success', href: projectHref },
      { id: 2, name: '统一认证改造', detail: '完成度 62% · 1 项风险', status: '关注', icon: 'tsfont-warning-o', color: 'text-warning', href: projectHref },
      { id: 3, name: '移动端重构', detail: '完成度 45% · 进度落后', status: '有风险', icon: 'tsfont-close-o', color: 'text-danger', href: projectHref }
    ]
  },
  risk: {
    total: 5,
    summary: '项风险需要关注',
    icon: 'tsfont-warning-o',
    color: 'text-danger',
    moreHref: taskHref,
    list: [
      { id: 1, name: '支付回调偶发失败', detail: '缺陷已逾期 2 天', status: '逾期', icon: 'tsfont-close-o', color: 'text-danger', href: taskHref },
      { id: 2, name: '门户 Beta 版本', detail: '里程碑距今 1 天', status: '临近', icon: 'tsfont-time', color: 'text-warning', href: projectHref },
      { id: 3, name: '数据迁移验收', detail: '存在 2 项阻塞问题', status: '阻塞', icon: 'tsfont-warning-o', color: 'text-danger', href: projectHref }
    ]
  }
};

export default {
  name: 'RdmAttention',
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
      return presetMap[this.config.kind] || presetMap.task;
    },
    visibleList() {
      return this.preset.list.slice(0, Math.max(1, Number(this.config.limit) || 5)).map(item => ({
        id: item.id,
        title: item.name,
        description: item.detail,
        status: item.status,
        icon: item.icon,
        tone: item.color === 'text-danger' ? 'danger' : (item.color === 'text-warning' ? 'warning' : (item.color === 'text-success' ? 'success' : 'primary')),
        href: item.href
      }));
    },
    summary() {
      return {
        value: this.preset.total,
        label: this.preset.summary,
        tone: this.preset.color === 'text-danger' ? 'danger' : (this.preset.color === 'text-warning' ? 'warning' : (this.preset.color === 'text-success' ? 'success' : 'primary')),
        icon: this.preset.icon
      };
    }
  }
};
</script>
