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

const presetMap = {
  abnormal: {
    total: 7,
    summary: '项资产需要关注',
    icon: 'tsfont-warning-o',
    valueClass: 'text-danger',
    moreHref: `${HOME}/cmdb.html#/asset-manage`,
    list: [
      { id: 1, name: '生产数据库 DB-01', detail: '采集失败 · 12 分钟前', status: '采集失败', icon: 'tsfont-close-o', color: 'text-danger', href: `${HOME}/cmdb.html#/asset-manage` },
      { id: 2, name: '网关服务器 GW-02', detail: '连续 3 次离线', status: '离线', icon: 'tsfont-warning-o', color: 'text-warning', href: `${HOME}/cmdb.html#/asset-manage` },
      { id: 3, name: '缓存集群 Redis-A', detail: '信息超过 30 天未更新', status: '过期', icon: 'tsfont-time', color: 'text-warning', href: `${HOME}/cmdb.html#/cientity-manage` }
    ]
  },
  change: {
    total: 3,
    summary: '项变更等待处理',
    icon: 'tsfont-change',
    valueClass: 'text-warning',
    moreHref: `${HOME}/cmdb.html#/transaction-manage`,
    list: [
      { id: 1, name: '应用服务器扩容', detail: '影响 4 个配置项', status: '待确认', icon: 'tsfont-time', color: 'text-warning', href: `${HOME}/cmdb.html#/transaction-manage` },
      { id: 2, name: '数据库主备关系调整', detail: '计划今日 22:00', status: '待执行', icon: 'tsfont-change', color: 'text-primary', href: `${HOME}/cmdb.html#/transaction-manage` },
      { id: 3, name: '网络设备下线', detail: '等待关系校验', status: '有风险', icon: 'tsfont-warning-o', color: 'text-danger', href: `${HOME}/cmdb.html#/transaction-manage` }
    ]
  }
};

export default {
  name: 'CmdbAssetAttention',
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
      return presetMap[this.config.kind] || presetMap.abnormal;
    },
    visibleList() {
      return this.preset.list.slice(0, Math.max(1, Number(this.config.limit) || 5)).map(item => ({
        id: item.id,
        title: item.name,
        description: item.detail,
        status: item.status,
        icon: item.icon,
        tone: item.color === 'text-danger' ? 'danger' : (item.color === 'text-warning' ? 'warning' : 'primary'),
        href: item.href
      }));
    },
    summary() {
      return {
        value: this.preset.total,
        label: this.preset.summary,
        tone: this.preset.valueClass === 'text-danger' ? 'danger' : 'warning',
        icon: this.preset.icon
      };
    }
  }
};
</script>
