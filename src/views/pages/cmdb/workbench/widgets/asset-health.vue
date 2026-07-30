<template>
  <WorkbenchCard
    :title="title"
    icon="tsfont-ci"
    tone="success"
    :subtitle="description"
  >
    <template v-if="config.showAction !== 0" v-slot:action>
      <a :href="assetHref" class="text-action">查看资产</a>
    </template>
    <WorkbenchMetricGroup :metrics="metricList" compact></WorkbenchMetricGroup>
    <WorkbenchActionList :items="attentionList" dense class="mt-sm"></WorkbenchActionList>
  </WorkbenchCard>
</template>

<script>
import WorkbenchActionList from '@/views/components/portal/components/display/WorkbenchActionList.vue';
import WorkbenchMetricGroup from '@/views/components/portal/components/display/WorkbenchMetricGroup.vue';
import WorkbenchCard from '@/views/components/portal/providers/framework/widgets/workbench-card.vue';

export default {
  name: 'CmdbAssetHealth',
  components: {
    WorkbenchActionList,
    WorkbenchCard,
    WorkbenchMetricGroup
  },
  props: {
    title: { type: String, default: '资产健康概览' },
    description: { type: String, default: '' },
    config: { type: Object, default: () => ({}) }
  },
  computed: {
    metricList() {
      return [
        { key: 'total', label: '资产总量', value: 1286, tone: 'primary', icon: 'tsfont-ci' },
        { key: 'abnormal', label: '异常资产', value: 7, tone: 'danger', icon: 'tsfont-warning-o' },
        { key: 'change', label: '待处理变更', value: 3, tone: 'warning', icon: 'tsfont-change' }
      ];
    },
    attentionList() {
      return [{
        id: 'stale',
        title: '配置项信息长期未更新',
        description: '12 个配置项超过 30 天未更新',
        status: '需关注',
        tone: 'warning',
        icon: 'tsfont-time',
        href: this.entityHref
      }];
    },
    assetHref() {
      return `${HOME}/cmdb.html#/asset-manage`;
    },
    entityHref() {
      return `${HOME}/cmdb.html#/cientity-manage`;
    }
  }
};
</script>
