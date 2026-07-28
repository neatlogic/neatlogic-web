<template>
  <WorkbenchCard
    :title="title"
    icon="tsfont-chart-progress"
    tone="success"
    subtitle="按类型查看资产覆盖率和健康程度"
  >
    <template v-slot:action>
      <a :href="assetHref" class="text-action">资产清单</a>
    </template>
    <WorkbenchMetricGroup :metrics="metricList" compact></WorkbenchMetricGroup>
    <WorkbenchProgressList
      :items="distributionList"
      :limit="Math.max(1, Number(config.limit) || 5)"
      class="mt-md"
    ></WorkbenchProgressList>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';
import WorkbenchMetricGroup from '@/views/components/portal/components/display/WorkbenchMetricGroup.vue';
import WorkbenchProgressList from '@/views/components/portal/components/display/WorkbenchProgressList.vue';

export default {
  name: 'CmdbAssetDistribution',
  components: {
    WorkbenchCard,
    WorkbenchMetricGroup,
    WorkbenchProgressList
  },
  props: {
    title: { type: String, default: '资产类型与健康分布' },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      metricList: [
        { key: 'total', label: '资产总量', value: 1286, tone: 'primary', icon: 'tsfont-ci' },
        { key: 'healthy', label: '健康资产', value: '96%', tone: 'success', icon: 'tsfont-check-o' },
        { key: 'stale', label: '信息过期', value: 12, tone: 'warning', icon: 'tsfont-time' }
      ],
      distributionList: [
        { id: 1, title: '服务器', description: '486 台 · 9 台需关注', progress: 94, tone: 'success' },
        { id: 2, title: '数据库', description: '128 个实例 · 2 个异常', progress: 98, tone: 'success' },
        { id: 3, title: '网络设备', description: '236 台 · 5 台离线', progress: 92, tone: 'warning' },
        { id: 4, title: '应用系统', description: '82 个 · 3 个未更新', progress: 96, tone: 'primary' }
      ]
    };
  },
  computed: {
    assetHref() {
      return `${HOME}/cmdb.html#/asset-manage`;
    }
  }
};
</script>
