<template>
  <div>
    <div class="bg-op padding-md radius-md mb-md">
      <div class="action-group">
        <span
          v-for="item in statistics"
          :key="item.value"
          class="action-item cursor"
          :class="{ 'text-primary': stateFilter === item.value }"
          @click="filterState(item.value)"
        >{{ item.label }} <b :class="item.value === 'BLOCKED' || item.value === 'deadlocked' ? 'text-error' : ''">{{ item.count }}</b></span>
      </div>
    </div>
    <div class="bg-op padding-md radius-md mb-md">
      <div class="text-title mb-sm">{{ text('diagnosisSummary') }}</div>
      <div v-if="!diagnostics.length && !comparison.persistentBlocked.length" class="text-grey mb-sm">{{ text('noConfirmedProblem') }}</div>
      <div v-for="(diagnostic, index) in diagnostics" :key="index" class="mb-sm">
        <Tag :color="severityColor(diagnostic.severity)">{{ text(diagnostic.severity || 'informational') }}</Tag>
        <b>{{ text(diagnostic.code) }}</b>
        <span class="ml-sm">{{ text('affectedThreads', { count: (diagnostic.threadIds || []).length }) }}</span>
        <span v-if="diagnostic.threadIds && diagnostic.threadIds.length" class="text-action ml-sm" @click="focusThreads(diagnostic.threadIds)">{{ text('showThreads') }}</span>
        <div v-if="diagnostic.lockName" class="text-grey ml-md mt-xs">{{ diagnostic.lockName }} · {{ text('owner') }} {{ diagnostic.ownerId || '—' }}</div>
        <div v-for="(evidence, evidenceIndex) in diagnostic.evidence" :key="evidenceIndex" class="analysis-stack text-grey ml-md mt-xs">{{ text('evidence') }}: {{ evidence }}</div>
      </div>
      <div v-if="comparison.persistentBlocked.length" class="mb-sm">
        <Tag color="warning">{{ text('suspect') }}</Tag><b>{{ text('persistentBlocked') }}</b>
        <span class="ml-sm">{{ text('affectedThreads', { count: comparison.persistentBlocked.length }) }}</span>
        <span class="text-action ml-sm" @click="focusThreads(comparison.persistentBlocked.map(item => item.id))">{{ text('showThreads') }}</span>
        <div class="text-grey ml-md mt-xs">{{ text('persistentEvidence') }}</div>
      </div>
      <div class="text-grey mt-sm">{{ text('diagnosisBoundary') }}</div>
      <div v-for="code in snapshot.warningCodes" :key="code" class="text-warning mt-xs">{{ text(code) }}</div>
    </div>
    <!-- 与顶部工作区使用不同归属，内部页签状态只由本层 Tabs 控制。 -->
    <Tabs v-model="contentTab" name="threadSnapshotTabs" :animated="false">
      <TabPane :label="text('threadList')" name="threads" tab="threadSnapshotTabs">
        <div class="action-group mb-md">
          <div class="action-item"><InputSearcher v-model="keyword" :width="260" @change="resetPage"></InputSearcher></div>
          <div class="action-item"><TsFormSelect
            v-model="stateFilter"
            :dataList="stateOptions"
            :placeholder="text('state')"
            :width="180"
            border="border"
            clearable
            transfer
            @change="resetPage"
          ></TsFormSelect></div>
          <div class="action-item"><TsFormSelect
            v-model="diagnosticFilter"
            :dataList="diagnosticOptions"
            :placeholder="text('diagnosisType')"
            :width="180"
            border="border"
            clearable
            transfer
            @change="resetPage"
          ></TsFormSelect></div>
          <div class="action-item">
            <div class="flex-start">
              <span class="mr-xs">{{ text('tenantTaskOnly') }}</span>
              <TsFormSwitch
                v-model="tenantOnly"
                width="auto"
                :true-value="true"
                :false-value="false"
                @on-change="resetPage"
              ></TsFormSwitch>
            </div>
          </div>
          <span v-if="focusedIds.length" class="action-item text-action" @click="clearFocus">{{ text('clearRelatedFilter') }}</span>
        </div>
        <div v-if="tenantOnly" class="text-grey mb-sm">{{ text('tenantFilterHint') }}</div>
        <TsTable
          :theadList="threadHeaders"
          :tbodyList="pagedThreads"
          :rowNum="filteredThreads.length"
          :currentPage="currentPage"
          :pageSize="pageSize"
          :sortOrder="sortOrder"
          :sortList="selectedInterval ? ['taskDuration', 'cpuTimeMs', 'cpuDeltaMs', 'cpuPercent'] : ['taskDuration', 'cpuTimeMs']"
          :sortMulti="false"
          keyName="id"
          @changeCurrent="currentPage = $event"
          @changePageSize="changePageSize"
          @updateSort="updateSort"
        >
          <template v-slot:name="{ row }"><div class="overflow" :title="row.name + ' (' + row.id + ')'"><span class="text-action" @click="$emit('select-thread', row.id)">{{ row.name }} <span class="text-grey">({{ row.id }})</span></span></div></template>
          <template v-slot:state="{ row }"><span :class="row.deadlocked || row.state === 'BLOCKED' ? 'text-error' : ''">{{ row.state }}</span></template>
          <template v-slot:diagnosis="{ row }"><span v-if="row.deadlocked" class="text-error">{{ text('deadlock') }} · </span><span>{{ text(row.waitType || 'other') }}</span></template>
          <template v-slot:firstBusinessFrame="{ row }"><div class="analysis-stack">{{ row.firstBusinessFrame || '—' }}</div></template>
          <template v-slot:task="{ row }"><span v-if="row.task">{{ row.task.name }}<div class="text-grey">{{ row.task.tenantUuid }}</div></span><span v-else>—</span></template>
          <template v-slot:taskDuration="{ row }">{{ milliseconds(row.task && row.task.timeCost) }}</template>
          <template v-slot:cpuTimeMs="{ row }">{{ milliseconds(row.cpuTimeMs) }}</template>
          <template v-slot:cpuDeltaMs="{ row }">{{ milliseconds(cpuMap[row.id] && cpuMap[row.id].cpuDeltaMs) }}</template>
          <template v-slot:cpuPercent="{ row }">{{ percent(cpuMap[row.id] && cpuMap[row.id].cpuPercent) }}</template>
        </TsTable>
        <div v-if="selectedInterval" class="text-grey mt-sm">{{ text('cpuHint', { duration: Math.round(selectedInterval.elapsedMs * 100) / 100 }) }}</div>
      </TabPane>
      <TabPane :label="text('chartAnalysis')" name="charts" tab="threadSnapshotTabs">
        <ThreadSnapshotCharts
          v-if="contentTab === 'charts'"
          :snapshot="snapshot"
          :lockGroups="lockGroups"
          :comparison="comparison"
          :selectedInterval="selectedInterval"
          @filter-state="filterChartState"
          @focus-threads="focusThreads"
          @select-thread="$emit('select-thread', $event)"
        ></ThreadSnapshotCharts>
      </TabPane>
      <TabPane :label="text('stackGroups')" name="stacks" tab="threadSnapshotTabs">
        <div class="text-grey mb-md">{{ text('stackGroupHint') }}</div>
        <TsTable
          :theadList="stackHeaders"
          :tbodyList="stackGroups"
          :showPager="false"
          keyName="id"
        >
          <template v-slot:count="{ row }"><span class="text-action" @click="focusThreads(row.threadIds)">{{ row.count }}</span></template>
          <template v-slot:waitType="{ row }">{{ text(row.waitType || 'other') }}</template>
          <template v-slot:stackTrace="{ row }">
            <Poptip
              :title="text('representativeStack')"
              width="650"
              placement="left"
              transfer
            >
              <span class="text-action">{{ text('viewStack') }}</span>
              <div slot="content" class="analysis-stack stack-preview">
                <div v-for="(frame, index) in row.stackTrace" :key="index" :class="frame.className.indexOf('neatlogic.') === 0 ? 'text-primary' : 'text-grey'">{{ frame.text }}</div>
              </div>
            </Poptip>
          </template>
          <template v-slot:members="{ row }"><span class="text-action" @click="focusThreads(row.threadIds)">{{ text('showThreads') }}</span><span class="text-action ml-sm" @click="$emit('select-thread', row.threadIds[0])">{{ text('representativeThread') }}</span></template>
        </TsTable>
      </TabPane>
      <TabPane :label="text('lockRelations')" name="locks" tab="threadSnapshotTabs">
        <div class="text-grey mb-md">{{ text('lockRelationHint') }}</div>
        <TsTable
          :theadList="lockHeaders"
          :tbodyList="lockGroups"
          :showPager="false"
          keyName="id"
        >
          <template v-slot:owner="{ row }"><span class="text-action" @click="$emit('select-thread', row.ownerId)">{{ row.ownerName || row.ownerId }} ({{ row.ownerId }})</span><span v-if="row.owner && row.owner.deadlocked" class="text-error ml-xs">{{ text('deadlock') }}</span></template>
          <template v-slot:lockName="{ row }"><div class="analysis-stack">{{ row.lockName }}</div></template>
          <template v-slot:count="{ row }"><span class="text-action" @click="focusThreads(row.threadIds)">{{ row.count }}</span></template>
          <template v-slot:threadIds="{ row }"><span
            v-for="id in row.threadIds"
            :key="id"
            class="text-action mr-sm"
            @click="$emit('select-thread', id)"
          >{{ id }}</span></template>
        </TsTable>
        <div v-if="snapshot.deadlockedThreadIds.length" class="bg-grey padding-md radius-md mt-md">
          <div class="text-error mb-sm">{{ text('deadlock') }}</div>
          <div v-for="id in snapshot.deadlockedThreadIds" :key="id" class="mb-xs">
            <span class="text-action" @click="$emit('select-thread', id)">{{ threadName(id) }} ({{ id }})</span>
            <span v-if="findThread(id) && findThread(id).lockOwnerId" class="ml-sm">→ <span class="text-action" @click="$emit('select-thread', findThread(id).lockOwnerId)">{{ findThread(id).lockOwnerName || findThread(id).lockOwnerId }} ({{ findThread(id).lockOwnerId }})</span></span>
          </div>
        </div>
      </TabPane>
      <TabPane :label="text('rawSnapshot')" name="raw" tab="threadSnapshotTabs"><ThreadSnapshotRaw :rawText="snapshot.rawText || ''" @export-text="$emit('export-text')"></ThreadSnapshotRaw></TabPane>
      <TabPane
        v-if="comparison.intervals.length"
        :label="text('samplingCompare')"
        name="compare"
        tab="threadSnapshotTabs"
      >
        <div class="text-grey mb-md">{{ text('compareHint') }}</div>
        <div v-for="(interval, index) in comparison.intervals" :key="interval.toSnapshotId" class="bg-op padding-md radius-md mb-md">
          <div class="text-title mb-sm">{{ text('intervalTitle', { from: index + 1, to: index + 2, duration: Math.round(interval.elapsedMs * 100) / 100 }) }}</div>
          <div class="action-group mb-md">
            <span class="action-item">{{ text('added') }} {{ interval.added.length }}</span>
            <span class="action-item">{{ text('exited') }} {{ interval.exited.length }}</span>
            <span class="action-item">{{ text('stateChanged') }} {{ interval.changes.filter(item => item.stateChanged).length }}</span>
            <span class="action-item">{{ text('stackChanged') }} {{ interval.changes.filter(item => item.stackChanged).length }}</span>
          </div>
          <div class="text-title mb-sm">{{ text('cpuRanking') }}</div>
          <TsTable
            :theadList="cpuHeaders"
            :tbodyList="interval.cpuMetrics"
            :showPager="false"
            keyName="id"
          >
            <template v-slot:name="{ row }"><span class="text-action" @click="openComparedThread(row.id, index + 1)">{{ row.name }} ({{ row.id }})</span></template>
            <template v-slot:cpuDeltaMs="{ row }">{{ milliseconds(row.cpuDeltaMs) }}</template>
            <template v-slot:cpuPercent="{ row }">{{ percent(row.cpuPercent) }}</template>
          </TsTable>
          <div v-if="!interval.cpuMetrics.length" class="text-grey mt-sm">{{ text('cpuNoComparable') }}</div>
          <div class="text-title mt-md mb-sm">{{ text('threadChanges') }}</div>
          <TsTable
            :theadList="changeHeaders"
            :tbodyList="interval.changes"
            :showPager="false"
            keyName="id"
          >
            <template v-slot:name="{ row }"><span class="text-action" @click="openComparedThread(row.id, index + 1)">{{ row.name }} ({{ row.id }})</span></template>
            <template v-slot:stateChanged="{ row }">{{ row.stateChanged ? row.fromState + ' → ' + row.toState : '—' }}</template>
            <template v-slot:stackChanged="{ row }">{{ $t(row.stackChanged ? 'page.yes' : 'page.no') }}</template>
          </TsTable>
          <div v-if="interval.added.length" class="mt-md"><span class="mr-sm">{{ text('added') }}:</span><span
            v-for="thread in interval.added"
            :key="thread.id"
            class="text-action mr-sm"
            @click="openComparedThread(thread.id, index + 1)"
          >{{ thread.name }} ({{ thread.id }})</span></div>
          <div v-if="interval.exited.length" class="mt-md"><span class="mr-sm">{{ text('exited') }}:</span><span
            v-for="thread in interval.exited"
            :key="thread.id"
            class="text-action mr-sm"
            @click="openComparedThread(thread.id, index)"
          >{{ thread.name }} ({{ thread.id }})</span></div>
        </div>
        <div class="text-title mb-sm">{{ text('queueTrend') }}</div>
        <TsTable
          :theadList="queueHeaders"
          :tbodyList="comparison.queueTrend"
          :showPager="false"
          keyName="snapshotId"
        ><template v-slot:capturedAt="{ row }">{{ row.capturedAt | formatDate }}</template></TsTable>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import { buildStackGroups, buildLockGroups } from './thread-snapshot-analysis';

export default {
  name: 'ThreadSnapshotAnalysis',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    ThreadSnapshotRaw: () => import('./thread-snapshot-raw.vue'),
    ThreadSnapshotCharts: () => import('./thread-snapshot-charts.vue')
  },
  props: {
    snapshot: { type: Object, required: true }, samples: { type: Array, default: () => [] },
    comparison: { type: Object, required: true }, selectedIndex: { type: Number, default: 0 }
  },
  data() {
    return { contentTab: 'threads', keyword: '', stateFilter: '', diagnosticFilter: '', tenantOnly: false, focusedIds: [], currentPage: 1, pageSize: 20, orderKey: '', orderDirection: '' };
  },
  methods: {
    // 表头及诊断代码共用语言资源，技术状态值保持 JVM 原文。
    text(key, values) { return this.$t('term.framework.threadsnapshot.' + key, values); },
    header(key, title, sort) { return { key, title: this.text(title), ...(sort ? { sort: true } : {}) }; },
    milliseconds(value) { return Number.isFinite(value) ? Math.round(value * 100) / 100 + ' ' + this.$t('page.ms') : this.text('unavailable'); },
    percent(value) { return Number.isFinite(value) ? value.toFixed(2) + '%' : this.text('unavailable'); },
    severityColor(severity) { return { confirmed: 'error', suspect: 'warning', informational: 'primary' }[severity] || 'default'; },
    // 从摘要或分组进入相关线程时清除其他筛选，保证完整上下文可见。
    focusThreads(ids) { this.focusedIds = ids.map(String); this.keyword = ''; this.stateFilter = ''; this.diagnosticFilter = ''; this.tenantOnly = false; this.contentTab = 'threads'; this.resetPage(); },
    clearFocus() { this.focusedIds = []; this.resetPage(); },
    filterState(state) { this.stateFilter = state; this.focusedIds = []; this.contentTab = 'threads'; this.resetPage(); },
    // 图表统计整个快照，点击状态时清除旧筛选以展示该状态的全部线程。
    filterChartState(state) { this.keyword = ''; this.diagnosticFilter = ''; this.tenantOnly = false; this.filterState(state); },
    resetPage() { this.currentPage = 1; },
    changePageSize(size) { this.pageSize = size; this.resetPage(); },
    // 排序采用快照原始字段，不额外重建线程显示模型。
    sortValue(thread) {
      if (this.orderKey === 'taskDuration') return thread.task && Number.isFinite(thread.task.timeCost) ? thread.task.timeCost : null;
      if (this.orderKey === 'cpuTimeMs') return Number.isFinite(thread.cpuTimeMs) ? thread.cpuTimeMs : null;
      const cpu = this.cpuMap[thread.id];
      return cpu && Number.isFinite(cpu[this.orderKey]) ? cpu[this.orderKey] : null;
    },
    updateSort(sort) {
      const key = Object.keys(sort).find(name => ['taskDuration', 'cpuTimeMs', 'cpuDeltaMs', 'cpuPercent'].includes(name) && ['ASC', 'DESC'].includes(sort[name]));
      this.orderKey = key || ''; this.orderDirection = key ? sort[key] : ''; this.resetPage();
    },
    findThread(id) { return this.snapshot.threads.find(thread => String(thread.id) === String(id)); },
    threadName(id) { const thread = this.findThread(id); return thread ? thread.name : id; },
    // 对比视图中的退出线程需要打开前一个样本才能看到退出前证据。
    openComparedThread(id, index) { this.$emit('select-sample', index); this.$emit('select-thread', id); }
  },
  computed: {
    diagnostics() { return this.snapshot.diagnostics || []; },
    statistics() {
      return [{ value: '', label: this.text('totalThreads'), count: this.snapshot.threads.length },
        ...['RUNNABLE', 'BLOCKED', 'WAITING', 'TIMED_WAITING'].map(state => ({ value: state, label: state, count: this.snapshot.threads.filter(thread => thread.state === state).length })),
        { value: 'deadlocked', label: this.text('deadlockThreads'), count: this.snapshot.deadlockedThreadIds.length }];
    },
    stateOptions() { return [{ value: 'deadlocked', text: this.text('deadlockThreads') }, ...['NEW', 'RUNNABLE', 'BLOCKED', 'WAITING', 'TIMED_WAITING', 'TERMINATED'].map(state => ({ value: state, text: state }))]; },
    diagnosticOptions() { return ['deadlock', 'blocked', 'taskWait', 'timerWait', 'connectionWait', 'networkRead', 'other'].map(type => ({ value: type, text: this.text(type) })); },
    selectedInterval() { return this.comparison.intervals.find(interval => interval.toSnapshotId === this.snapshot.snapshotId) || null; },
    cpuMap() { return this.selectedInterval ? this.selectedInterval.cpuMetrics.reduce((map, item) => { map[item.id] = item; return map; }, {}) : {}; },
    filteredThreads() {
      const keyword = this.keyword.trim().toLowerCase();
      const filtered = this.snapshot.threads.filter(thread => {
        if (this.stateFilter === 'deadlocked' && !thread.deadlocked) return false;
        if (this.stateFilter && this.stateFilter !== 'deadlocked' && thread.state !== this.stateFilter) return false;
        if (this.diagnosticFilter === 'deadlock' && !thread.deadlocked) return false;
        if (this.diagnosticFilter === 'blocked' && thread.state !== 'BLOCKED') return false;
        if (this.diagnosticFilter && !['deadlock', 'blocked'].includes(this.diagnosticFilter) && thread.waitType !== this.diagnosticFilter) return false;
        if (this.tenantOnly && (!thread.task || thread.task.tenantUuid !== this.snapshot.currentTenantUuid)) return false;
        if (this.focusedIds.length && !this.focusedIds.includes(String(thread.id))) return false;
        return !keyword || [thread.name, thread.id, ...(thread.stackTrace || []).map(frame => frame.text)].join('\n').toLowerCase().includes(keyword);
      });
      return filtered.sort((a, b) => {
        if (this.orderKey) {
          const left = this.sortValue(a);
          const right = this.sortValue(b);
          if (left === null && right !== null) return 1;
          if (right === null && left !== null) return -1;
          if (left !== right) return this.orderDirection === 'ASC' ? left - right : right - left;
        }
        const rank = thread => (thread.deadlocked ? 2 : 0) + (thread.state === 'BLOCKED' ? 1 : 0);
        return rank(b) - rank(a) || String(a.name).localeCompare(String(b.name));
      });
    },
    pagedThreads() { return this.filteredThreads.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); },
    stackGroups() { return buildStackGroups(this.snapshot); },
    lockGroups() { return buildLockGroups(this.snapshot); },
    sortOrder() { return [{ taskDuration: this.orderKey === 'taskDuration' ? this.orderDirection : '', cpuTimeMs: this.orderKey === 'cpuTimeMs' ? this.orderDirection : '', cpuDeltaMs: this.orderKey === 'cpuDeltaMs' ? this.orderDirection : '', cpuPercent: this.orderKey === 'cpuPercent' ? this.orderDirection : '' }]; },
    threadHeaders() {
      const headers = [this.header('name', 'threadName'), this.header('state', 'state'), this.header('diagnosis', 'diagnosisType'), this.header('firstBusinessFrame', 'businessFrame'), this.header('task', 'relatedTask'), this.header('taskDuration', 'taskDuration', true), this.header('cpuTimeMs', 'cpuTime', true)];
      if (this.selectedInterval) headers.push(this.header('cpuDeltaMs', 'cpuDelta', true), this.header('cpuPercent', 'cpuPercent', true));
      return headers;
    },
    stackHeaders() { return [this.header('state', 'state'), this.header('count', 'threadCount'), this.header('waitType', 'waitType'), this.header('stackTrace', 'representativeStack'), this.header('members', 'memberThreads')]; },
    lockHeaders() { return [this.header('owner', 'owner'), this.header('lockName', 'waitingLock'), this.header('count', 'waitingThreads'), this.header('threadIds', 'memberThreads')]; },
    cpuHeaders() { return [this.header('name', 'threadName'), this.header('cpuDeltaMs', 'cpuDelta'), this.header('cpuPercent', 'cpuPercent')]; },
    changeHeaders() { return [this.header('name', 'threadName'), this.header('stateChanged', 'stateChanged'), this.header('stackChanged', 'stackChanged')]; },
    queueHeaders() { return [this.header('capturedAt', 'sampleTime'), this.header('queueSize', 'queueSize'), this.header('activeCount', 'activeCount'), this.header('maxThreadCount', 'capacity')]; }
  },
  watch: {
    // 搜索输入即时过滤，任何输入变化都同步回到第一页。
    keyword() { this.resetPage(); },
    snapshot() {
      this.resetPage();
      this.focusedIds = [];
      if (!this.selectedInterval && ['cpuDeltaMs', 'cpuPercent'].includes(this.orderKey)) { this.orderKey = ''; this.orderDirection = ''; }
      if (!this.comparison.intervals.length && this.contentTab === 'compare') this.contentTab = 'threads';
    }
  }
};
</script>
<style scoped lang="less">
/* 调用栈和证据包含长类名，需要换行；弹层堆栈独立滚动。 */
.analysis-stack { overflow-wrap: anywhere; white-space: pre-wrap; font-family: monospace; }
.stack-preview { max-height: 50vh; overflow: auto; }
</style>
