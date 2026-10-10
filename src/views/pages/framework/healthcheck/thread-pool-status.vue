<template>
  <div>
    <div class="bg-op padding-md radius-md mb-md">
      <div class="action-group mb-sm">
        <span class="action-item">{{ $t('page.serverid') }} <b>{{ metric('serverId') }}</b></span>
        <span class="action-item">{{ $t('term.framework.maxthread') }} <b>{{ metric('maxThreadCount') }}</b></span>
        <span class="action-item">{{ $t('term.framework.currentthread') }} <b class="text-primary">{{ metric('mainPoolSize') }}</b></span>
        <span class="action-item">{{ $t('term.framework.currenttask') }} <b class="text-success">{{ metric('mainActiveCount') }}</b></span>
        <span class="action-item">{{ $t('term.framework.queued') }} <b :class="metric('mainQueueSize') > 0 ? 'text-warning' : ''">{{ metric('mainQueueSize') }}</b></span>
      </div>
      <div class="text-grey">{{ text('poolScope') }}</div>
    </div>
    <div v-if="pool && !tasks.length" class="bg-grey padding-md radius-md mb-md">
      {{ text(currentTenantOnly ? 'tenantIdle' : 'poolIdle') }}
      <span v-if="currentTenantOnly && pool.mainActiveCount">{{ text('otherTasks', { count: pool.mainActiveCount }) }}</span>
    </div>
    <TsTable
      :theadList="headers"
      :tbodyList="pagedTasks"
      :rowNum="tasks.length"
      :currentPage="currentPage"
      :pageSize="pageSize"
      keyName="id"
      @changeCurrent="currentPage = $event"
      @changePageSize="changePageSize"
    >
      <template v-slot:startTime="{ row }">{{ row.startTime | formatDate }}</template>
      <template v-slot:timeCost="{ row }">{{ duration(row.timeCost) }}</template>
      <template v-slot:action="{ row }"><span class="text-action" @click="$emit('analyze', row)">{{ text('analyzeThread') }}</span></template>
    </TsTable>
    <div v-if="pool" class="bg-op padding-md radius-md mt-md">
      <div class="text-title mb-sm">{{ text('poolDistribution') }}</div>
      <div class="text-grey mb-sm">{{ text('poolDotsHint') }}</div>
      <div class="pool-dots">
        <Tooltip
          v-for="thread in visibleThreads"
          :key="thread.id"
          :content="thread.name + ' · ' + thread.id"
          transfer
        >
          <span class="pool-dot cursor" :class="taskMap[String(thread.id)] ? 'bg-success' : 'bg-info'" @click="analyzeDot(thread)"></span>
        </Tooltip>
        <span v-for="index in Math.min(pool.mainQueueSize || 0, 100)" :key="'queue-' + index" class="pool-dot bg-warning"></span>
      </div>
      <div v-if="(pool.threadList || []).length > 500 || pool.mainQueueSize > 100" class="text-grey mt-sm">{{ text('dotsLimited') }}</div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ThreadPoolStatus',
  components: { TsTable: () => import('@/resources/components/TsTable/TsTable.vue') },
  props: { pool: { type: Object, default: null }, currentTenantOnly: { type: Number, default: 1 } },
  data() { return { currentPage: 1, pageSize: 20 }; },
  methods: {
    // 文案及零值指标统一处理，尚未加载时显示占位符。
    text(key, values) { return this.$t('term.framework.threadsnapshot.' + key, values); },
    metric(key) { return this.pool ? (this.pool[key] || 0) : '—'; },
    duration(value) { return Number.isFinite(value) ? Math.round(value) + ' ' + this.$t('page.ms') : '—'; },
    // 修改分页大小时回到第一页。
    changePageSize(size) { this.pageSize = size; this.currentPage = 1; },
    // 空闲线程圆点仅展示状态，只有仍执行任务的线程可以进入任务诊断。
    analyzeDot(thread) { if (this.taskMap[String(thread.id)]) this.$emit('analyze', this.taskMap[String(thread.id)]); }
  },
  computed: {
    tasks() { return this.pool && this.pool.threadTaskList || []; },
    pagedTasks() { return this.tasks.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); },
    visibleThreads() { return (this.pool && this.pool.threadList || []).slice(0, 500); },
    taskMap() { return this.tasks.reduce((map, task) => { map[String(task.id)] = task; return map; }, {}); },
    headers() {
      return [
        { key: 'name', title: this.$t('page.task') }, { key: 'id', title: this.text('threadId') },
        { key: 'tenantUuid', title: this.$t('page.tenant') }, { key: 'priority', title: this.text('priority') },
        { key: 'startTime', title: this.text('startTime') }, { key: 'timeCost', title: this.text('taskDuration') },
        { key: 'action', title: this.$t('page.action') }
      ];
    }
  },
  watch: {
    tasks() { if ((this.currentPage - 1) * this.pageSize >= this.tasks.length) this.currentPage = 1; }
  }
};
</script>
<style scoped lang="less">
/* 圆点布局是现有线程池的专属辅助视图，颜色沿用主题公共类。 */
.pool-dots { display: flex; flex-wrap: wrap; gap: 8px; }
.pool-dot { display: inline-block; width: 20px; height: 20px; border-radius: 50%; }
</style>
