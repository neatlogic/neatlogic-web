<template>
  <TsDialog v-bind="dialogConfig" @on-close="handleClose">
    <template v-slot>
      <div class="padding">
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <TsRow :gutter="16">
          <Col span="12">
            <div class="compare-box bg-op radius-md padding">
              <div class="pb-sm compare-panel-header">
                <div class="fz-medium compare-panel-title">{{ sourceTitle }}</div>
              </div>
              <TsCodemirror
                :value="sourceValue"
                codeMode="json"
                :isReadOnly="true"
                height="280px"
              ></TsCodemirror>
            </div>
          </Col>
          <Col span="12">
            <div class="compare-box bg-op radius-md padding">
              <div class="pb-sm compare-panel-header">
                <TsFormSelect
                  v-model="snapshotTargetType"
                  :dataList="snapshotCompareTargetDataList"
                  transfer
                  clearable
                  placeholder="请选择对比对象"
                ></TsFormSelect>
                <TsFormSelect
                  v-if="snapshotTargetType !== 'baseline'"
                  v-model="targetSnapshotId"
                  :dataList="targetSnapshotDataList"
                  transfer
                  clearable
                  placeholder="请选择目标快照"
                ></TsFormSelect>
              </div>
              <TsCodemirror
                :value="targetValue"
                codeMode="json"
                :isReadOnly="true"
                height="280px"
              ></TsCodemirror>
            </div>
          </Col>
        </TsRow>
        <div v-if="summary" class="summary-grid compare-summary-gap pt-md">
          <div class="summary-item bg-op">
            <div class="text-grey">总字段</div>
            <div class="summary-value">{{ summary.totalCount || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">差异项</div>
            <div class="summary-value">{{ summary.diffCount || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">高风险</div>
            <div class="summary-value text-danger">{{ summary.highCount || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">中风险</div>
            <div class="summary-value text-warning">{{ summary.mediumCount || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">结果</div>
            <div class="summary-value">{{ summary.compareResult || '-' }}</div>
          </div>
        </div>
        <div class="pt-md">
          <TsTable
            :key="tableRenderKey"
            v-bind="diffData"
            :theadList="theadList"
            :loading="loadingShow"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
          >
            <template v-slot:isBlocked="{ row }">
              <span>{{ row.isBlocked ? '是' : '否' }}</span>
            </template>
            <template v-slot:sourceValue="{ row }">
              <span class="ellipsis-text">{{ formatCell(row.sourceValue) }}</span>
            </template>
            <template v-slot:targetValue="{ row }">
              <span class="ellipsis-text">{{ formatCell(row.targetValue) }}</span>
            </template>
            <template v-slot:aiRiskReason="{ row }">
              <span v-if="isAiGenerating(row)" class="ai-inline-loading">
                <i class="ivu-icon ivu-icon-ios-loading ivu-load-loop"></i>
              </span>
              <span v-else class="ellipsis-text">{{ formatAiText(row, 'aiRiskReason') }}</span>
            </template>
            <template v-slot:aiRepairSuggestion="{ row }">
              <span v-if="isAiGenerating(row)" class="ai-inline-loading">
                <i class="ivu-icon ivu-icon-ios-loading ivu-load-loop"></i>
              </span>
              <span v-else class="ellipsis-text">{{ formatAiText(row, 'aiRepairSuggestion') }}</span>
            </template>
          </TsTable>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="handleClose">关闭</Button>
      <Button
        v-if="compareTaskId && diffData.tbodyList && diffData.tbodyList.length"
        type="primary"
        :loading="aiActionLoading"
        :disabled="!canTriggerAiAnalysis"
        @click="triggerAiAnalysis()"
      >AI分析</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror.vue')
  },
  props: {
    snapshotId: {
      type: Number,
      default: null
    },
    resourceLabel: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loadingShow: false,
      snapshotTargetType: 'baseline',
      sourceData: null,
      targetData: null,
      sourceSnapshot: null,
      summary: null,
      fullDiffList: [],
      diffData: {
        tbodyList: [],
        rowNum: 0,
        currentPage: 1,
        pageSize: 20
      },
      targetSnapshotId: null,
      peerSnapshotList: [],
      targetSnapshotDataList: [],
      compareTaskId: null,
      aiActionLoading: false,
      pollingTimer: null,
      isClosed: false,
      pollingRequesting: false,
      theadList: [
        { key: 'layer', title: '层级' },
        { key: 'label', title: '字段' },
        { key: 'status', title: '状态' },
        { key: 'riskLevel', title: '风险' },
        { key: 'isBlocked', title: '阻断' },
        { key: 'sourceValue', title: '源值' },
        { key: 'targetValue', title: '目标值' },
        { key: 'reason', title: '说明' },
        { key: 'aiRiskReason', title: 'AI风险说明' },
        { key: 'aiRepairSuggestion', title: 'AI修复建议' }
      ]
    };
  },
  mounted() {
    this.isClosed = false;
    this.loadCompareData();
  },
  beforeDestroy() {
    this.isClosed = true;
    this.clearPolling();
  },
  methods: {
    handleClose() {
      this.isClosed = true;
      this.clearPolling();
      this.$emit('close');
    },
    loadCompareData() {
      let request = null;
      this.clearPolling();
      this.compareTaskId = null;
      this.fullDiffList = [];
      this.loadingShow = true;
      if (this.snapshotTargetType !== 'baseline') {
        if (!this.targetSnapshotId) {
          this.$Message.warning('请选择目标快照');
          this.loadingShow = false;
          return;
        }
        request = this.$api.inspect.applicationInspect.compareConfigSnapshotPeer({
          snapshotId: this.snapshotId,
          targetSnapshotId: this.targetSnapshotId
        });
      } else if (this.snapshotId) {
        request = this.$api.inspect.applicationInspect.compareConfigSnapshot({
          snapshotId: this.snapshotId
        });
      }
      if (!request) {
        this.loadingShow = false;
        return;
      }
      request.then(res => {
        if (this.isClosed) {
          return;
        }
        if (res && res.Status === 'OK') {
          this.summary = res.Return.summary || {};
          this.sourceData = res.Return.sourceData || {};
          this.targetData = res.Return.targetData || {};
          this.sourceSnapshot = res.Return.sourceSnapshot || null;
          this.compareTaskId = res.Return.task ? res.Return.task.id : null;
          this.fullDiffList = res.Return.diffList || [];
          this.updateDiffPage(1, this.diffData.pageSize || 20);
          if (this.snapshotId) {
            this.ensurePeerSnapshotOptions();
          }
          if (this.hasAiGeneratingRows(this.fullDiffList) && this.compareTaskId) {
            this.startPolling();
          }
        }
      }).finally(() => {
        if (!this.isClosed) {
          this.loadingShow = false;
        }
      });
    },
    startPolling() {
      this.clearPolling();
      if (!this.compareTaskId) {
        return;
      }
      this.pollingTimer = setInterval(() => {
        this.refreshCompareTask();
      }, 3000);
    },
    clearPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
      this.pollingRequesting = false;
    },
    triggerAiAnalysis() {
      if (!this.compareTaskId || !this.canTriggerAiAnalysis) {
        return;
      }
      this.aiActionLoading = true;
      this.$api.inspect.applicationInspect.triggerCompareConfigTaskAiAnalysis({
        taskId: this.compareTaskId
      }).then(res => {
        if (this.isClosed) {
          return;
        }
        if (res && res.Status === 'OK') {
          this.startPolling();
          this.refreshCompareTask();
        }
      }).finally(() => {
        this.aiActionLoading = false;
      });
    },
    refreshCompareTask() {
      if (!this.compareTaskId) {
        this.clearPolling();
        return;
      }
      if (this.pollingRequesting) {
        return;
      }
      this.pollingRequesting = true;
      this.$api.inspect.applicationInspect.getCompareConfigTask({
        taskId: this.compareTaskId
      }).then(res => {
        if (this.isClosed) {
          this.clearPolling();
          return;
        }
        if (!res || res.Status !== 'OK') {
          return;
        }
        this.summary = res.Return.summary || this.summary;
        this.fullDiffList = res.Return.diffList || [];
        this.updateDiffPage(this.diffData.currentPage || 1, this.diffData.pageSize || 20);
        if (!this.hasAiGeneratingRows(this.fullDiffList)) {
          this.clearPolling();
        }
      }).catch(() => {
      }).finally(() => {
        this.pollingRequesting = false;
      });
    },
    ensurePeerSnapshotOptions() {
      if (!this.snapshotId || !this.sourceSnapshot) {
        return Promise.resolve();
      }
      return this.$api.inspect.applicationInspect.searchConfigSnapshot({
        appSystemId: this.sourceSnapshot.appSystemId,
        appModuleId: this.sourceSnapshot.appModuleId,
        envId: this.sourceSnapshot.envId,
        typeId: this.sourceSnapshot.typeId,
        schemaName: this.sourceSnapshot.schemaName,
        currentPage: 1,
        pageSize: 100
      }).then(res => {
        if (!res || res.Status !== 'OK') {
          return;
        }
        this.peerSnapshotList = (res.Return.tbodyList || []).filter(item => item.id !== this.snapshotId && item.resourceId !== this.sourceSnapshot.resourceId);
        if (this.snapshotTargetType !== 'baseline' && !this.targetSnapshotResourceDataList.find(item => item.value === this.snapshotTargetType)) {
          this.snapshotTargetType = this.targetSnapshotResourceDataList.length > 0 ? this.targetSnapshotResourceDataList[0].value : 'baseline';
        } else {
          this.syncTargetSnapshotOptions();
        }
      });
    },
    syncTargetSnapshotOptions() {
      this.targetSnapshotDataList = (this.peerSnapshotList || [])
        .filter(item => String(item.resourceId) === this.snapshotTargetType)
        .map(item => {
          return {
            value: item.id,
            text: `${item.resourceIp || item.resourceId || item.id} ${this.formatSnapshotTime(item.collectTime)}`
          };
        });
      if (!this.targetSnapshotDataList.find(item => item.value === this.targetSnapshotId)) {
        this.targetSnapshotId = this.targetSnapshotDataList.length > 0 ? this.targetSnapshotDataList[0].value : null;
      }
    },
    updateDiffPage(currentPage, pageSize) {
      const finalPageSize = pageSize || 20;
      const finalCurrentPage = currentPage || 1;
      const start = (finalCurrentPage - 1) * finalPageSize;
      const end = start + finalPageSize;
      this.diffData = {
        tbodyList: (this.fullDiffList || []).slice(start, end),
        rowNum: (this.fullDiffList || []).length,
        currentPage: finalCurrentPage,
        pageSize: finalPageSize
      };
    },
    changeCurrent(currentPage) {
      this.updateDiffPage(currentPage, this.diffData.pageSize);
    },
    changePageSize(pageSize) {
      this.updateDiffPage(1, pageSize);
    },
    formatCell(value) {
      if (value === null || value === undefined) {
        return '-';
      }
      if (typeof value === 'string') {
        return value;
      }
      return JSON.stringify(value);
    },
    isAiGenerating(row) {
      return row && ['pending', 'running'].includes(row.aiStatus);
    },
    isAiTriggerable(row) {
      return row && !['succeed', 'pending', 'running'].includes(row.aiStatus);
    },
    hasAiGeneratingRows(rowList) {
      return Array.isArray(rowList) && rowList.some(row => this.isAiGenerating(row));
    },
    hasAiTriggerableRows(rowList) {
      return Array.isArray(rowList) && rowList.some(row => this.isAiTriggerable(row));
    },
    formatAiText(row, key) {
      if (row && row.aiStatus === 'succeed') {
        return row[key] || '-';
      }
      return '-';
    },
    formatSnapshotTime(value) {
      if (!value) {
        return '-';
      }
      if (this.$options.filters && this.$options.filters.formatDate) {
        return this.$options.filters.formatDate(value);
      }
      return value;
    }
  },
  computed: {
    dialogConfig() {
      return {
        type: 'slider',
        title: '配置比对',
        maskClose: true,
        isShow: true,
        width: 'huge',
        hasFooter: true
      };
    },
    snapshotCompareTargetDataList() {
      return [{ value: 'baseline', text: '当前基线' }].concat(this.targetSnapshotResourceDataList);
    },
    targetSnapshotResourceDataList() {
      let resourceMap = {};
      (this.peerSnapshotList || []).forEach(item => {
        if (item && item.resourceId && !resourceMap[item.resourceId]) {
          resourceMap[item.resourceId] = {
            value: String(item.resourceId),
            text: item.resourceIp || item.resourceId
          };
        }
      });
      return Object.values(resourceMap);
    },
    sourceTitle() {
      if (this.snapshotId && this.sourceSnapshot && this.sourceSnapshot.collectTime) {
        let sourceIp = this.resourceLabel || (this.sourceSnapshot && this.sourceSnapshot.resourceIp) || '当前节点';
        return `${sourceIp} ${this.formatSnapshotTime(this.sourceSnapshot.collectTime)}`;
      }
      return this.resourceLabel || '当前节点';
    },
    sourceValue() {
      return this.sourceData ? JSON.stringify(this.sourceData.layerData || this.sourceData, null, 2) : '{}';
    },
    targetValue() {
      return this.targetData ? JSON.stringify(this.targetData.layerData || this.targetData, null, 2) : '{}';
    },
    tableRenderKey() {
      return [
        this.compareTaskId || 'no-task',
        this.diffData.currentPage || 1,
        this.diffData.pageSize || 20,
        this.diffData.rowNum || 0
      ].join('_');
    },
    canTriggerAiAnalysis() {
      return !!this.compareTaskId &&
        !this.aiActionLoading &&
        !this.hasAiGeneratingRows(this.fullDiffList) &&
        this.hasAiTriggerableRows(this.fullDiffList);
    }
  },
  watch: {
    snapshotTargetType(val, oldVal) {
      if (!this.snapshotId || val === oldVal) {
        return;
      }
      if (val === 'baseline') {
        this.targetSnapshotId = null;
        this.summary = null;
        this.compareTaskId = null;
        this.clearPolling();
        this.fullDiffList = [];
        this.diffData = {
          tbodyList: [],
          rowNum: 0,
          currentPage: 1,
          pageSize: 20
        };
        this.targetData = null;
        this.loadCompareData();
      } else {
        this.syncTargetSnapshotOptions();
      }
    },
    targetSnapshotId(val, oldVal) {
      if (this.snapshotTargetType !== 'baseline' && val && val !== oldVal) {
        this.loadCompareData();
      }
    }
  }
};
</script>
<style lang="less" scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.compare-summary-gap {
  margin-top: 16px;
}
.compare-panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 40px;
}
.compare-panel-title {
  line-height: 32px;
}
.summary-item {
  padding: 12px 16px;
  border-radius: 8px;
}
.summary-value {
  font-size: 20px;
  font-weight: 600;
  padding-top: 4px;
}
.ellipsis-text {
  display: inline-block;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ai-inline-loading {
  display: inline-flex;
  align-items: center;
  color: #2d8cf0;
  font-size: 16px;
}
</style>
