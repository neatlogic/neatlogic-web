<template>
  <!-- 父级通过 v-if 卸载详情，保留原位节点，避免传送指令遗留可见抽屉。 -->
  <Drawer
    :value="true"
    :transfer="false"
    :title="text('threadDetail')"
    width="720px"
    draggable
    @on-close="$emit('close')"
  >
    <div v-if="samples.length > 1" class="action-group mb-md">
      <span
        v-for="(sample, index) in samples"
        :key="sample.snapshotId"
        class="action-item text-action"
        :class="{ 'text-primary': selectedIndex === index }"
        @click="$emit('select-sample', index)"
      >{{ text('sampleNumber', { number: index + 1 }) }}</span>
    </div>
    <div v-if="thread">
      <div class="text-title mb-sm">{{ thread.name }}</div>
      <div class="action-group mb-md">
        <span class="action-item">{{ text('threadId') }} {{ thread.id }}</span>
        <span class="action-item">{{ text('state') }} {{ thread.state }}</span>
        <span class="action-item">{{ text('priority') }} {{ thread.priority }}</span>
        <span class="action-item">{{ text('daemon') }} {{ $t(thread.daemon ? 'page.yes' : 'page.no') }}</span>
      </div>
      <div v-if="thread.deadlocked" class="text-error mb-md">{{ text('deadlock') }}</div>
      <div class="bg-grey padding-md radius-md mb-md">
        <div class="mb-xs">{{ text('cpuTime') }}: {{ cpuTime(thread.cpuTimeMs) }}</div>
        <div class="mb-xs">{{ text('waitType') }}: {{ text(thread.waitType || 'other') }}</div>
        <div v-if="thread.waitEvidence" class="detail-stack text-grey">{{ thread.waitEvidence }}</div>
        <div class="mt-xs">{{ text('blockedCount') }}: {{ thread.blockedCount }} · {{ text('waitedCount') }}: {{ thread.waitedCount }}</div>
      </div>
      <div class="text-title mb-sm">{{ text('relatedTask') }}</div>
      <div v-if="thread.task" class="bg-grey padding-md radius-md mb-md">
        <div class="mb-xs">{{ $t('page.task') }}: {{ thread.task.name }}</div>
        <div class="mb-xs">{{ $t('page.tenant') }}: {{ thread.task.tenantUuid }}</div>
        <div class="mb-xs">{{ text('startTime') }}: {{ thread.task.startTime | formatDate }}</div>
        <div>{{ text('taskDuration') }}: {{ cpuTime(thread.task.timeCost) }}</div>
      </div>
      <div v-else class="text-grey mb-md">{{ text('unassociated') }}</div>
      <div class="text-title mb-sm">{{ text('waitingLock') }}</div>
      <div class="detail-stack mb-sm">{{ thread.lockName || '—' }}</div>
      <div class="mb-md">
        {{ text('owner') }}:
        <span v-if="thread.lockOwnerId && thread.lockOwnerId !== '-1'" class="text-action" @click="$emit('select-thread', thread.lockOwnerId)">{{ thread.lockOwnerName || thread.lockOwnerId }} ({{ thread.lockOwnerId }})</span>
        <span v-else>—</span>
      </div>
      <div class="text-title mb-sm">{{ text('ownedLocks') }}</div>
      <div v-for="lock in thread.ownedMonitorNames" :key="'monitor-' + lock" class="detail-stack mb-xs">{{ text('monitorLock') }}: {{ lock }}</div>
      <div v-for="lock in thread.ownedSynchronizerNames" :key="'sync-' + lock" class="detail-stack mb-xs">{{ text('synchronizerLock') }}: {{ lock }}</div>
      <div v-if="!thread.ownedMonitorNames.length && !thread.ownedSynchronizerNames.length" class="text-grey">{{ text('noneRecorded') }}</div>
      <div class="text-title mt-md mb-sm">{{ text('completeStack') }}</div>
      <div class="action-group mb-sm"><span class="action-item text-action" @click="copyStack">{{ $t('page.copy') }}</span></div>
      <div class="bg-grey padding-md radius-md">
        <div
          v-for="(frame, index) in thread.stackTrace"
          :key="index"
          class="detail-stack mb-xs"
          :class="frame.className.indexOf('neatlogic.') === 0 ? 'text-primary text-bold' : 'text-grey'"
        >{{ frame.text }}</div>
      </div>
    </div>
    <div v-else class="text-grey">{{ text('threadAbsent') }}</div>
  </Drawer>
</template>
<script>
export default {
  name: 'ThreadSnapshotDetail',
  props: {
    threadId: { type: String, required: true }, samples: { type: Array, default: () => [] }, selectedIndex: { type: Number, default: 0 }
  },
  methods: {
    // 保持 CPU 及耗时的缺失值可辨识，零毫秒正常展示。
    text(key, values) { return this.$t('term.framework.threadsnapshot.' + key, values); },
    cpuTime(value) { return Number.isFinite(value) ? Math.round(value * 100) / 100 + ' ' + this.$t('page.ms') : this.text('unavailable'); },
    // 复制完整调用栈，业务栈帧高亮不改变实际内容。
    copyStack() { this.$utils.copyText(null, this.thread.stackTrace.map(frame => frame.text).join('\n')); }
  },
  computed: {
    thread() {
      const sample = this.samples[this.selectedIndex];
      return sample && sample.threads.find(item => String(item.id) === this.threadId);
    }
  }
};
</script>
<style scoped lang="less">
/* 详情保留完整类名和锁名称，长内容换行避免抽屉横向溢出。 */
.detail-stack { overflow-wrap: anywhere; font-family: monospace; white-space: pre-wrap; }
</style>
