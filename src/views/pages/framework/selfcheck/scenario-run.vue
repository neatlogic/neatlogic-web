<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ pageTitle }}</span>
        <CommonStatus
          v-if="isRunMode && runData.status"
          class="ml-xs"
          :statusName="getStatusText(runData.status)"
          :statusValue="getCommonStatusValue(runData.status)"
          type="text"
        ></CommonStatus>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <Button
              v-auth="['SELF_CHECK_EXECUTE']"
              type="primary"
              :loading="executing"
              :disabled="isExecuteDisabled"
              @click="executeScenario"
            >{{ $t(isRunMode ? 'page.reexecute' : 'page.execute') }}</Button>
          </div>
          <div v-if="isAutoRefreshing" class="action-item">
            <span class="countdown-clock" :style="countdownClockStyle" :title="countdownText"></span>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="loading" type="fix"></Loading>
        <div class="padding-md mb-md">
          <div class="fz20 text-bold mb-sm">{{ pageTitle }}</div>
          <div v-if="!isRunMode && scenarioData.description" class="text-grey text-word-break mb-md">{{ scenarioData.description }}</div>
          <Row :gutter="24">
            <Col
              :xs="12"
              :sm="8"
              :lg="4"
              class="mb-sm"
            >
              <span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.stepview.total') }}</span>
              <span>{{ totalCount }}</span>
            </Col>
            <Col
              v-if="!isRunMode"
              :xs="12"
              :sm="8"
              :lg="4"
              class="mb-sm"
            >
              <span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.stepview.active') }}</span>
              <span>{{ activeCount }}</span>
            </Col>
            <template v-else>
              <Col
                :xs="12"
                :sm="8"
                :lg="4"
                class="mb-sm"
              >
                <span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.stepview.completed') }}</span>
                <span>{{ completedCount }}</span>
              </Col>
              <Col
                :xs="12"
                :sm="8"
                :lg="4"
                class="mb-sm"
              >
                <span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.stepview.success') }}</span>
                <span class="text-success">{{ successCount }}</span>
              </Col>
              <Col
                :xs="12"
                :sm="8"
                :lg="4"
                class="mb-sm"
              >
                <span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.stepview.failed') }}</span>
                <span class="text-error">{{ failedCount }}</span>
              </Col>
              <Col
                :xs="12"
                :sm="8"
                :lg="4"
                class="mb-sm"
              >
                <span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.duration') }}</span>
                <span>{{ runData.durationMs == null ? '-' : runData.durationMs + ' ms' }}</span>
              </Col>
            </template>
          </Row>
        </div>
        <div v-if="isRunMode && runData.errorMessage" class="bg-op radius-md padding-md mb-md text-error text-word-break">
          <span class="tsfont-warning-s mr-xs" aria-hidden="true"></span>{{ runData.errorMessage }}
        </div>
        <div class="bg-op radius-md padding-md">
          <div class="fz16 mb-sm">{{ $t(isRunMode ? 'term.framework.selfcheck.stepview.results' : 'term.framework.selfcheck.stepview.prepare') }}</div>
          <TsStepList :value="expandedItemId" :itemList="stepItemList" @input="selectItem">
            <template v-slot:header="{ item }">
              <div class="fz16 text-bold">{{ isRunMode ? item.itemName : item.name }}</div>
              <div class="text-grey mt-xs">{{ item.apiName || item.apiToken || '-' }}</div>
              <div v-if="item.apiName && item.apiToken" class="text-grey fz10 mt-xs">{{ item.apiToken }}</div>
            </template>
            <template v-slot:meta="{ item }">
              <template v-if="isRunMode">
                <CommonStatus :statusName="getStatusText(item.status)" :statusValue="getCommonStatusValue(item.status)" type="text"></CommonStatus>
                <span><span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.duration') }}</span>{{ item.durationMs == null ? '-' : item.durationMs + ' ms' }}</span>
                <span v-if="item.cleanupStatus">
                  <span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.cleanupstatus') }}</span>
                  <CommonStatus :statusName="getStatusText(item.cleanupStatus)" :statusValue="getCommonStatusValue(item.cleanupStatus)" type="text"></CommonStatus>
                </span>
              </template>
              <template v-else>
                <span><span class="text-grey mr-xs">{{ $t('page.isactive') }}</span><span :class="isActive(item) ? 'text-success' : 'text-grey'">{{ $t(isActive(item) ? 'page.yes' : 'page.no') }}</span></span>
                <span><span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.scriptstatus') }}</span><span :class="isScriptValid(item) ? 'text-success tsfont-check' : 'text-error tsfont-close'">{{ $t(isScriptValid(item) ? 'term.framework.selfcheck.valid' : 'term.framework.selfcheck.invalid') }}</span></span>
              </template>
            </template>
            <template v-slot:content="{ item }">
              <SelfCheckExecutionResult
                v-if="isRunMode"
                :key="item.id"
                :result="item"
                :stepMode="true"
              ></SelfCheckExecutionResult>
              <ScenarioItemPreview v-else :key="item.id" :item="item"></ScenarioItemPreview>
            </template>
          </TsStepList>
          <div v-if="!loading && !stepItemList.length" class="text-grey padding-md text-center">
            {{ $t(isRunMode && isAutoRefreshing ? 'term.framework.selfcheck.stepview.waiting' : 'page.nodata') }}
          </div>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
import { isFailedItem, isSucceededItem, isCompletedItem, getPreferredItem } from './selfcheck-run-utils.js';

export default {
  name: 'SelfCheckScenarioRun',
  components: {
    TsContain: () => import('@/resources/components/TsContain/TsContain.vue'),
    TsStepList: () => import('@/resources/components/TsStepList/TsStepList.vue'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    ScenarioItemPreview: () => import('./scenario-item-preview.vue'),
    SelfCheckExecutionResult: () => import('./execution-result.vue')
  },
  data() {
    return {
      loading: false,
      executing: false,
      scenarioData: { itemList: [] },
      runData: {},
      runItemList: [],
      expandedItemId: null,
      hasManualSelection: false,
      pageVersion: 0,
      runRequestId: 0,
      pollTimer: null,
      countdownTimer: null,
      refreshInterval: 2000,
      refreshStartTime: null,
      refreshCountdown: 0
    };
  },
  created() {
    this.loadPage();
  },
  beforeDestroy() {
    this.pageVersion++;
    clearTimeout(this.pollTimer);
    this.clearRefreshCountdown();
  },
  methods: {
    /** 切换场景或运行记录时清空选择，并使旧请求失效。 */
    loadPage() {
      this.pageVersion++;
      clearTimeout(this.pollTimer);
      this.clearRefreshCountdown();
      this.expandedItemId = null;
      this.hasManualSelection = false;
      this.scenarioData = { itemList: [] };
      this.runData = {};
      this.runItemList = [];
      this.loading = false;
      this.executing = false;
      if (this.isRunMode) {
        this.getRun();
      } else {
        this.getScenario();
      }
    },
    /** 只接收当前页面的配置响应，默认展开首个启用项。 */
    async getScenario() {
      const scenarioId = this.$route.query.scenarioId;
      const pageVersion = this.pageVersion;
      if (!scenarioId) {
        return;
      }
      this.loading = true;
      try {
        const res = await this.$api.framework.selfcheck.getScenario({ id: scenarioId });
        if (pageVersion === this.pageVersion && res.Status === 'OK') {
          this.scenarioData = res.Return || { itemList: [] };
          const firstActive = (this.scenarioData.itemList || []).find(this.isActive);
          this.expandedItemId = firstActive ? firstActive.id : null;
        }
      } catch (error) {
        // 请求错误由公共 API 层提示，页面保持当前数据。
      } finally {
        if (pageVersion === this.pageVersion) {
          this.loading = false;
        }
      }
    },
    /** 轮询只更新后端运行快照；并发请求或切页后忽略旧响应。 */
    async getRun() {
      clearTimeout(this.pollTimer);
      this.clearRefreshCountdown();
      const runId = this.$route.query.runId;
      const pageVersion = this.pageVersion;
      const requestId = ++this.runRequestId;
      if (!runId) {
        return;
      }
      if (!this.runData.id && !this.runData.runId) {
        this.loading = true;
      }
      try {
        const res = await this.$api.framework.selfcheck.getRun({ runId });
        if (pageVersion !== this.pageVersion || requestId !== this.runRequestId) {
          return;
        }
        if (res.Status === 'OK') {
          const result = res.Return || {};
          this.runData = result.run || result;
          this.runItemList = result.itemList || this.runData.itemList || [];
          if (!this.hasManualSelection) {
            const preferred = getPreferredItem(this.runItemList);
            this.expandedItemId = preferred ? preferred.id : null;
          }
          if (this.isAutoRefreshing) {
            this.startRefreshCountdown();
            this.pollTimer = setTimeout(() => this.getRun(), this.refreshInterval);
          }
        }
      } catch (error) {
        // 公共 API 层显示错误，保留已有快照，不覆盖当前结果。
      } finally {
        if (pageVersion === this.pageVersion && requestId === this.runRequestId) {
          this.loading = false;
        }
      }
    },
    /** 用户展开或收起后保留选择，轮询不再自动切换步骤。 */
    selectItem(id) {
      this.hasManualSelection = true;
      this.expandedItemId = id;
    },
    /** 基于当前场景创建新运行；历史结果使用后端场景标识，启用和并发约束交由后端校验。 */
    async executeScenario() {
      if (this.executing || this.loading || this.isAutoRefreshing || (this.isRunMode && !this.runData.scenarioId)) {
        return;
      }
      if (!this.isRunMode && this.scenarioData.status !== 'ENABLED') {
        this.$Message.warning(this.$t('term.framework.selfcheck.onlyenabledcanrun'));
        return;
      }
      const pageVersion = this.pageVersion;
      const scenarioId = this.isRunMode ? this.runData.scenarioId : this.scenarioData.id;
      this.executing = true;
      try {
        const res = await this.$api.framework.selfcheck.createRun({ scenarioId });
        if (pageVersion === this.pageVersion && res.Status === 'OK') {
          this.$router.replace({ name: 'scenario-run', query: { scenarioId, runId: res.Return.runId } });
        }
      } catch (error) {
        // 创建失败沿用公共错误提示，并恢复执行按钮。
      } finally {
        if (pageVersion === this.pageVersion) {
          this.executing = false;
        }
      }
    },
    /** 沿用后端激活开关，不创建额外的显示字段。 */
    isActive(item) {
      return item.isActive === 1 || item.isActive === true;
    },
    /** 脚本有效性由后端配置快照直接决定。 */
    isScriptValid(item) {
      return item.isScriptValid === 1 || item.isScriptValid === true;
    },
    /** 使用已有状态多语言资源。 */
    getStatusText(status) {
      return this.$t(`term.framework.selfcheck.status.${String(status || 'UNKNOWN').toLowerCase()}`);
    },
    /** 将业务状态映射为公共状态组件的视觉状态。 */
    getCommonStatusValue(status) {
      if (status === 'SUCCEED' || status === 'SUCCESS') {
        return 'succeed';
      }
      if (status === 'PENDING') {
        return 'pending';
      }
      if (status === 'RUNNING') {
        return 'running';
      }
      if (status === 'ABORTED' || status === 'SKIPPED') {
        return 'aborted';
      }
      if (!status || status === 'NOT_REQUIRED') {
        return 'grey';
      }
      return 'failed';
    },
    /** 按自动刷新间隔更新公共倒计时钟。 */
    startRefreshCountdown() {
      this.clearRefreshCountdown();
      this.refreshStartTime = Date.now();
      this.refreshCountdown = this.refreshInterval;
      this.countdownTimer = this.$utils.setInterval(() => {
        this.refreshCountdown = Math.max(this.refreshInterval - (Date.now() - this.refreshStartTime), 0);
      }, 200);
    },
    /** 销毁轮询倒计时，避免切换记录后遗留计时器。 */
    clearRefreshCountdown() {
      if (this.countdownTimer) {
        this.countdownTimer.clear();
        this.countdownTimer = null;
      }
      this.refreshStartTime = null;
      this.refreshCountdown = 0;
    }
  },
  computed: {
    isRunMode() {
      return !!this.$route.query.runId;
    },
    pageIdentity() {
      return `${this.$route.query.scenarioId || ''}:${this.$route.query.runId || ''}`;
    },
    pageTitle() {
      if (this.isRunMode) {
        return this.runData.scenarioName || this.$t('term.framework.selfcheck.rundetail');
      }
      return this.scenarioData.name || this.$t('term.framework.selfcheck.scenario');
    },
    stepItemList() {
      return this.isRunMode ? this.runItemList : (this.scenarioData.itemList || []);
    },
    totalCount() {
      return this.isRunMode && this.runData.itemCount != null ? this.runData.itemCount : this.stepItemList.length;
    },
    activeCount() {
      return (this.scenarioData.itemList || []).filter(this.isActive).length;
    },
    completedCount() {
      return this.runItemList.filter(isCompletedItem).length;
    },
    successCount() {
      if (this.runData.status && !this.isAutoRefreshing && this.runData.successCount != null) {
        return this.runData.successCount;
      }
      return this.runItemList.filter(item => isCompletedItem(item) && isSucceededItem(item)).length;
    },
    failedCount() {
      if (this.runData.status && !this.isAutoRefreshing && this.runData.failedCount != null) {
        return this.runData.failedCount;
      }
      return this.runItemList.filter(item => isCompletedItem(item) && isFailedItem(item)).length;
    },
    isAutoRefreshing() {
      return this.isRunMode && (this.runData.status === 'PENDING' || this.runData.status === 'RUNNING');
    },
    isExecuteDisabled() {
      if (this.loading || this.executing || this.isAutoRefreshing) {
        return true;
      }
      return this.isRunMode ? !this.runData.scenarioId : this.scenarioData.status !== 'ENABLED';
    },
    countdownText() {
      const second = Math.max(Math.ceil(this.refreshCountdown / 1000), 0);
      return this.$t('term.framework.selfcheck.refreshcountdown', { target: second });
    },
    countdownClockStyle() {
      const ratio = this.refreshInterval > 0 ? 1 - this.refreshCountdown / this.refreshInterval : 0;
      return { '--countdown-progress': `${Math.max(0, Math.min(ratio, 1)) * 100}` };
    }
  },
  watch: {
    pageIdentity() {
      this.loadPage();
    }
  }
};
</script>
