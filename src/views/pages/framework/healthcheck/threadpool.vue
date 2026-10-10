<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <template v-if="activeTab === 'snapshot'">
            <div class="action-item tsfont-fangbingduwangguan" :class="{ disable: collecting }" @click="capture(false)">{{ text('capture') }}</div>
            <div class="action-item tsfont-refresh" :class="{ disable: collecting }" @click="capture(true)">{{ text('continuous') }}</div>
            <div v-if="collecting" class="action-item">{{ progress }}/{{ targetCount }}</div>
            <div v-if="collecting" class="action-item text-action" @click="cancelCapture">{{ $t('page.cancel') }}</div>
            <div v-if="samples.length" class="action-item tsfont-download" @click="exportReport">{{ text('exportReport') }}</div>
          </template>
          <template v-else>
            <div class="action-item">
              <div class="flex-start">
                <span class="mr-xs">{{ $t('term.framework.onlycurrenttenantthread') }}</span>
                <TsFormSwitch
                  v-model="currentTenantOnly"
                  width="auto"
                  :true-value="1"
                  :false-value="0"
                  @on-change="refreshPool"
                ></TsFormSwitch>
              </div>
            </div>
            <div class="action-item">
              <div class="flex-start">
                <span class="mr-xs">{{ $t('page.autorefresh') }}</span>
                <TsFormSwitch
                  v-model="autoRefresh"
                  width="auto"
                  :true-value="true"
                  :false-value="false"
                ></TsFormSwitch>
              </div>
            </div>
            <div class="action-item tsfont-refresh" :class="{ disable: poolLoading }" @click="refreshPool">{{ $t('page.refresh') }}</div>
          </template>
        </div>
      </template>
      <template v-slot:topRight>
        <div v-if="activeTab === 'snapshot' && snapshot" class="action-group text-grey">
          <span class="action-item">{{ $t('page.serverid') }} {{ snapshot.serverId }}</span>
          <span class="action-item">{{ snapshot.capturedAt | formatDate }}</span>
          <span class="action-item">{{ text('captureDuration') }} {{ snapshot.captureDurationMs }} {{ $t('page.ms') }}</span>
        </div>
        <div v-if="activeTab === 'pool' && poolUpdatedAt" class="text-grey">{{ text('updatedAt') }} {{ poolUpdatedAt | formatDate }}</div>
      </template>
      <template v-slot:content>
        <!-- 嵌套页签明确归属，避免顶部切换同时隐藏分析页签内容。 -->
        <Tabs v-model="activeTab" name="threadPoolTabs" :animated="false">
          <TabPane :label="text('snapshotAnalysis')" name="snapshot" tab="threadPoolTabs">
            <div v-if="captureNotice" class="bg-grey padding-md radius-md mb-md text-warning">{{ text(captureNotice) }}</div>
            <div v-if="samples.length > 1" class="action-group mb-md">
              <span
                v-for="(sample, index) in samples"
                :key="sample.snapshotId"
                class="action-item text-action"
                :class="{ 'text-primary': selectedIndex === index }"
                @click="selectedIndex = index"
              >{{ text('sampleNumber', { number: index + 1 }) }} · {{ sample.capturedAt | formatDate }}</span>
            </div>
            <ThreadSnapshotAnalysis
              v-if="snapshot"
              :snapshot="snapshot"
              :samples="samples"
              :comparison="comparison"
              :selectedIndex="selectedIndex"
              @select-thread="openThread"
              @select-sample="selectedIndex = $event"
              @export-text="exportText"
            ></ThreadSnapshotAnalysis>
            <div v-else class="bg-op padding-lg radius-md">
              <div class="text-title mb-sm">{{ text('welcome') }}</div>
              <div class="text-grey mb-md">{{ text('welcomeHint') }}</div>
              <div class="text-grey">{{ text('samplingHint') }}</div>
            </div>
          </TabPane>
          <TabPane :label="text('livePool')" name="pool" tab="threadPoolTabs">
            <ThreadPoolStatus :pool="pool" :currentTenantOnly="currentTenantOnly" @analyze="analyzeTask"></ThreadPoolStatus>
          </TabPane>
        </Tabs>
      </template>
    </TsContain>
    <ThreadSnapshotDetail
      v-if="detailId"
      :threadId="detailId"
      :samples="samples"
      :selectedIndex="selectedIndex"
      @select-sample="selectedIndex = $event"
      @select-thread="detailId = $event"
      @close="detailId = null"
    ></ThreadSnapshotDetail>
  </div>
</template>
<script>
import { compareSnapshots } from './thread-snapshot-analysis';

export default {
  name: 'ThreadPool',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    ThreadPoolStatus: () => import('./thread-pool-status.vue'),
    ThreadSnapshotAnalysis: () => import('./thread-snapshot-analysis.vue'),
    ThreadSnapshotDetail: () => import('./thread-snapshot-detail.vue')
  },
  data() {
    return {
      activeTab: 'snapshot', samples: [], selectedIndex: 0, detailId: null,
      collecting: false, progress: 0, targetCount: 1, captureNotice: '', captureToken: 0,
      sampleTimer: null, sampleResolve: null, poolTimer: null, pageActive: true,
      currentTenantOnly: 1, autoRefresh: true, pool: null, poolLoading: false, poolUpdatedAt: null
    };
  },
  created() {
    this.refreshPool();
  },
  activated() {
    this.pageActive = true;
    this.schedulePool();
  },
  deactivated() { this.stopPage(); },
  beforeDestroy() { this.stopPage(); },
  methods: {
    // 页面文案集中使用框架语言资源。
    text(key, values) { return this.$t('term.framework.threadsnapshot.' + key, values); },
    // 轮询仅在上次请求完成后安排，避免请求积压。
    schedulePool() {
      clearTimeout(this.poolTimer);
      if (this.pageActive && this.autoRefresh && !this.poolLoading) {
        this.poolTimer = setTimeout(() => this.refreshPool(), 3000);
      }
    },
    // 租户仅过滤任务；服务器容量由接口完整保留。
    async refreshPool() {
      if (this.poolLoading || !this.pageActive) return;
      clearTimeout(this.poolTimer);
      this.poolLoading = true;
      const tenantScope = this.currentTenantOnly;
      try {
        const res = await this.$api.framework.healthcheck.getThreadpoolStatus({ isShowCurrentTenant: tenantScope });
        if (this.pageActive && tenantScope === this.currentTenantOnly) {
          this.pool = res.Return;
          this.poolUpdatedAt = Date.now();
        }
      } catch (error) {
        // 接口统一处理错误，下一轮仍继续刷新。
      } finally {
        this.poolLoading = false;
        if (this.pageActive && tenantScope !== this.currentTenantOnly) this.refreshPool();
        else this.schedulePool();
      }
    },
    // 等待可立即取消，取消之后不会再发送下一个采集请求。
    waitSample() {
      return new Promise(resolve => {
        this.sampleResolve = resolve;
        this.sampleTimer = setTimeout(() => {
          this.sampleResolve = null;
          resolve();
        }, 5000);
      });
    },
    // 单次采集成功后才替换旧证据；连续采样串行执行并保留已成功样本。
    async capture(continuous, task) {
      if (this.collecting || !this.pageActive) return;
      const token = ++this.captureToken;
      this.collecting = true;
      this.progress = 0;
      this.targetCount = continuous ? 3 : 1;
      this.captureNotice = '';
      const nextSamples = [];
      try {
        for (let index = 0; index < this.targetCount; index++) {
          if (index) await this.waitSample();
          if (token !== this.captureToken || !this.pageActive) return;
          const res = await this.$api.framework.healthcheck.captureThreadSnapshot();
          if (token !== this.captureToken || !this.pageActive) return;
          const sample = res.Return;
          if (!sample || !Array.isArray(sample.threads)) throw new Error('Invalid thread snapshot');
          if (nextSamples.length) {
            const result = compareSnapshots([...nextSamples, sample]);
            if (!result.compatible) {
              this.captureNotice = result.reason === 'invalidTime' ? 'invalidTime' : 'processChanged';
              return;
            }
          }
          nextSamples.push(sample);
          this.samples = nextSamples.slice();
          this.selectedIndex = nextSamples.length - 1;
          this.progress = nextSamples.length;
          if (task) {
            const thread = sample.threads.find(item => String(item.id) === String(task.id) && item.task && item.task.startTime === task.startTime && item.task.name === task.name && item.task.tenantUuid === task.tenantUuid);
            if (thread) this.openThread(thread.id);
            else this.captureNotice = 'taskEnded';
          }
        }
      } catch (error) {
        if (token === this.captureToken && this.pageActive) this.captureNotice = nextSamples.length ? 'samplingFailed' : 'captureFailed';
      } finally {
        if (token === this.captureToken) this.collecting = false;
      }
    },
    // 取消使在途请求失效，已采集的成功结果仍保留。
    cancelCapture() {
      this.captureToken++;
      clearTimeout(this.sampleTimer);
      if (this.sampleResolve) this.sampleResolve();
      this.sampleResolve = null;
      this.collecting = false;
      this.captureNotice = 'samplingCancelled';
    },
    // 离开页面停止后台工作，保持快照证据不受实时刷新影响。
    stopPage() {
      this.pageActive = false;
      clearTimeout(this.poolTimer);
      if (this.collecting) this.cancelCapture();
    },
    // 从任务入口采集新证据，并校验任务是否仍属于同一线程。
    analyzeTask(task) {
      if (this.collecting) return;
      this.activeTab = 'snapshot';
      this.capture(false, task);
    },
    openThread(id) { this.detailId = String(id); },
    // 下载内容来自原始采集数据，避免页面筛选影响证据。
    download(content, extension, type) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'thread-snapshot-' + this.snapshot.serverId + '-' + this.snapshot.capturedAt + '.' + extension;
      link.click();
      URL.revokeObjectURL(url);
    },
    exportText() { this.download(this.snapshot.rawText || '', 'txt', 'text/plain;charset=utf-8'); },
    exportReport() {
      this.download(JSON.stringify({ selectedSnapshotId: this.snapshot.snapshotId, samples: this.samples, comparison: this.comparison, samplingStatus: this.collecting ? 'collecting' : (this.captureNotice || 'complete') }, null, 2), 'json', 'application/json;charset=utf-8');
    }
  },
  computed: {
    snapshot() { return this.samples[this.selectedIndex] || null; },
    comparison() { return compareSnapshots(this.samples); }
  },
  watch: {
    autoRefresh() { this.schedulePool(); }
  }
};
</script>
