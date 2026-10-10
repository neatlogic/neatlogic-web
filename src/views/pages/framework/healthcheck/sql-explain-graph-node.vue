<template>
  <div class="sql-plan-graph-node border-base radius-md bg-op padding-sm text-default">
    <div class="flex-between mb-xs">
      <strong class="text-title">{{ data.labels.kind }}</strong>
      <Tag v-if="data.accessType">{{ data.accessType }}</Tag>
    </div>
    <Tooltip
      :content="data.table || data.title || '—'"
      transfer
      placement="top"
      max-width="420"
      class="sql-plan-node-title"
    >
      <strong class="overflow">{{ data.table || data.title || '—' }}</strong>
    </Tooltip>
    <template v-if="data.kind === 'table'">
      <Tooltip
        :content="displayValue(data.index)"
        transfer
        placement="top"
        max-width="420"
        class="sql-plan-node-title mt-xs"
      >
        <span class="text-tip overflow">{{ data.labels.index }}：{{ displayValue(data.index) }}</span>
      </Tooltip>
      <div class="text-tip mt-xs">{{ data.labels.rows }}：{{ displayValue(data.rows) }}</div>
      <div class="text-tip mt-xs">{{ data.labels.filtered }}：{{ displayPercent(data.filtered) }}</div>
    </template>
    <Tooltip
      v-if="data.flags && data.flags.length"
      :content="data.flags.join('; ')"
      transfer
      placement="top"
      max-width="420"
      class="sql-plan-node-title mt-xs"
    >
      <span class="text-info overflow">{{ data.flags.join(' · ') }}</span>
    </Tooltip>
    <div class="text-action fz10 mt-xs" @mousedown.stop @click.stop="showRaw">{{ data.labels.raw }}</div>
  </div>
</template>
<script>
export default {
  name: 'SqlExplainGraphNode',
  inject: ['getNode', 'getGraph'],
  data() {
    return { data: { labels: {} } };
  },
  created() {
    // X6独立挂载Vue节点，显示文案由宿主翻译后传入，避免依赖新的Vue根实例。
    this.data = this.getNode().getData();
  },
  methods: {
    displayValue(value) {
      // 数值0是有效的估算值，缺失字段才显示占位符。
      return value === null || value === undefined || value === '' ? '—' : String(value);
    },
    displayPercent(value) {
      return value === null || value === undefined || value === '' ? '—' : String(value) + '%';
    },
    showRaw() {
      // 原始子树交由宿主展示，不把JSON或事件监听挂在全局。
      this.getGraph().trigger('sql-plan:raw', { data: this.data });
    }
  }
};
</script>
<style lang="less" scoped>
/* 节点必须填满X6分配的尺寸；长字段由提示层展开。 */
.sql-plan-graph-node {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.sql-plan-node-title {
  display: block;
  ::v-deep .ivu-tooltip-rel {
    display: block;
  }
  .overflow {
    display: block;
  }
}
</style>
