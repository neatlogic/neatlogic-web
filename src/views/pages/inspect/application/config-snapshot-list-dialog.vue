<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="$emit('close')">
      <template v-slot>
        <div class="padding">
          <TsTable
            v-if="snapshotData.tbodyList && snapshotData.tbodyList.length > 0"
            v-bind="snapshotData"
            :theadList="theadList"
            :loading="loadingShow"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
          >
            <template v-slot:collectTime="{ row }">
              <span v-if="row.collectTime">{{ row.collectTime | formatDate }}</span>
              <span v-else>-</span>
            </template>
            <template v-slot:fcd="{ row }">
              <span v-if="row.fcd">{{ row.fcd | formatDate }}</span>
              <span v-else>-</span>
            </template>
            <template v-slot:status="{ row }">
              <span :class="getStatusClass(row.status)">{{ formatStatus(row.status) }}</span>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li
                    class="tsfont-eye"
                    :class="{ 'text-grey': isActionLoading(getRowActionKey('view', row)) }"
                    @click="viewSnapshot(row)"
                  >
                    {{ isActionLoading(getRowActionKey('view', row)) ? '查看中...' : '查看快照' }}
                  </li>
                  <li
                    v-if="canPromoteBaseline"
                    class="tsfont-publish"
                    :class="{ 'text-grey': isActionLoading(getRowActionKey('promote', row)) }"
                    @click="promoteBaseline(row)"
                  >
                    {{ isActionLoading(getRowActionKey('promote', row)) ? '生成中...' : '生成基线草稿' }}
                  </li>
                  <li class="tsfont-compare" @click="openCompareDialog(row)">对比</li>
                </ul>
              </div>
            </template>
          </TsTable>
          <NoData v-else-if="!loadingShow"></NoData>
        </div>
      </template>
    </TsDialog>
    <ConfigJsonDialog
      v-if="isShowDetailDialog"
      :title="detailDialogTitle"
      :value="detailDialogValue"
      :rawValue="detailDialogRawValue"
      :summary="detailDialogSummary"
      :aiCandidate="detailDialogAiCandidate"
      :editable="true"
      saveText="保存修改"
      @close="closeDetailDialog"
      @save="saveSnapshotDraft"
    ></ConfigJsonDialog>
    <ConfigCompareDialog
      v-if="isShowCompareDialog"
      :snapshotId="currentCompareSnapshotId"
      :resourceLabel="resourceLabel"
      @close="closeCompareDialog"
    ></ConfigCompareDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    ConfigJsonDialog: () => import('./config-json-dialog.vue'),
    ConfigCompareDialog: () => import('./config-compare-dialog.vue')
  },
  props: {
    appSystemId: {
      type: Number,
      default: null
    },
    appModuleId: {
      type: Number,
      default: null
    },
    envId: {
      type: [Number, String],
      default: null
    },
    typeId: {
      type: Number,
      default: null
    },
    resourceId: {
      type: Number,
      default: null
    },
    resourceLabel: {
      type: String,
      default: ''
    },
    schemaName: {
      type: String,
      default: 'os'
    },
    baselineName: {
      type: String,
      default: 'OS基线'
    }
  },
  data() {
    return {
      loadingShow: false,
      snapshotData: {
        tbodyList: [],
        rowNum: 0,
        currentPage: 1,
        pageSize: 10
      },
      theadList: [
        { key: 'id', title: '快照ID' },
        { key: 'collectTime', title: '采集时间' },
        { key: 'source', title: '来源' },
        { key: 'status', title: '状态' },
        { key: 'fcd', title: '入库时间' },
        { key: 'action', title: '' }
      ],
      snapshotDetailMap: {},
      editedDraftMap: {},
      isShowDetailDialog: false,
      currentDetailSnapshotId: null,
      detailDialogTitle: '',
      detailDialogValue: null,
      detailDialogRawValue: null,
      detailDialogSummary: null,
      detailDialogAiCandidate: null,
      isShowCompareDialog: false,
      currentCompareSnapshotId: null,
      actionLoadingMap: {}
    };
  },
  mounted() {
    this.loadSnapshotList();
  },
  methods: {
    loadSnapshotList() {
      this.loadingShow = true;
      this.$api.inspect.applicationInspect.searchConfigSnapshot({
        appSystemId: this.appSystemId,
        appModuleId: this.appModuleId,
        envId: this.envId || null,
        typeId: this.typeId,
        resourceId: this.resourceId,
        schemaName: this.schemaName,
        currentPage: this.snapshotData.currentPage,
        pageSize: this.snapshotData.pageSize
      }).then(res => {
        if (res && res.Status === 'OK') {
          this.snapshotData = {
            tbodyList: res.Return.tbodyList || [],
            rowNum: res.Return.rowNum || 0,
            currentPage: res.Return.currentPage || this.snapshotData.currentPage,
            pageSize: res.Return.pageSize || this.snapshotData.pageSize
          };
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changeCurrent(currentPage) {
      this.snapshotData.currentPage = currentPage;
      this.loadSnapshotList();
    },
    changePageSize(pageSize) {
      this.snapshotData.pageSize = pageSize;
      this.snapshotData.currentPage = 1;
      this.loadSnapshotList();
    },
    getRowActionKey(action, row) {
      return `${action}_${row && row.id ? row.id : 'unknown'}`;
    },
    isActionLoading(actionKey) {
      return !!this.actionLoadingMap[actionKey];
    },
    setActionLoading(actionKey, loading) {
      this.$set(this.actionLoadingMap, actionKey, loading);
    },
    getSnapshotDraft(rowId) {
      if (this.editedDraftMap[rowId]) {
        return this.editedDraftMap[rowId];
      }
      let snapshotDetail = this.snapshotDetailMap[rowId];
      return snapshotDetail ? snapshotDetail.baselineDraft : null;
    },
    loadSnapshotDetail(rowId) {
      if (this.snapshotDetailMap[rowId]) {
        return Promise.resolve(this.snapshotDetailMap[rowId]);
      }
      return this.$api.inspect.applicationInspect.getConfigSnapshot({ id: rowId }).then(res => {
        if (res && res.Status === 'OK') {
          this.$set(this.snapshotDetailMap, rowId, res.Return || {});
          return res.Return || {};
        }
        return null;
      });
    },
    viewSnapshot(row) {
      const actionKey = this.getRowActionKey('view', row);
      if (this.isActionLoading(actionKey)) {
        return;
      }
      this.setActionLoading(actionKey, true);
      this.loadSnapshotDetail(row.id).then(detail => {
        if (!detail) {
          return;
        }
        this.currentDetailSnapshotId = row.id;
        this.detailDialogTitle = `${this.resourceLabel} 快照 ${row.collectTime ? this.formatSnapshotTime(row.collectTime) : ''}`;
        this.detailDialogValue = this.getSnapshotDraft(row.id) || detail.baselineDraft || {};
        this.detailDialogRawValue = detail.rawSnapshot || {};
        this.detailDialogSummary = detail.baselineSummary || null;
        this.detailDialogAiCandidate = detail.aiCandidate || null;
        this.isShowDetailDialog = true;
      }).finally(() => {
        this.setActionLoading(actionKey, false);
      });
    },
    saveSnapshotDraft(value) {
      if (!this.currentDetailSnapshotId) {
        return;
      }
      let baselineData = null;
      try {
        baselineData = JSON.parse(value);
      } catch (e) {
        this.$Message.error('草稿内容不是合法的 JSON');
        return;
      }
      this.$set(this.editedDraftMap, this.currentDetailSnapshotId, baselineData);
      this.detailDialogValue = baselineData;
      if (this.snapshotDetailMap[this.currentDetailSnapshotId]) {
        this.$set(this.snapshotDetailMap[this.currentDetailSnapshotId], 'baselineDraft', baselineData);
      }
      this.$Message.success('修改已暂存');
    },
    closeDetailDialog() {
      this.isShowDetailDialog = false;
      this.currentDetailSnapshotId = null;
      this.detailDialogTitle = '';
      this.detailDialogValue = null;
      this.detailDialogRawValue = null;
      this.detailDialogSummary = null;
      this.detailDialogAiCandidate = null;
    },
    promoteBaseline(row) {
      if (!this.canPromoteBaseline) {
        this.$Message.warning('未绑定应用环境的节点不允许生成基线草稿');
        return;
      }
      const actionKey = this.getRowActionKey('promote', row);
      if (this.isActionLoading(actionKey)) {
        return;
      }
      this.$createDialog({
        title: '生成基线草稿',
        content: `确认基于快照 ${row.id} 生成基线草稿吗？`,
        btnType: 'primary',
        'on-ok': vnode => {
          if (this.isActionLoading(actionKey)) {
            return;
          }
          this.setActionLoading(actionKey, true);
          vnode.loading = true;
          vnode.okBtnDisable = true;
          this.loadSnapshotDetail(row.id).then(detail => {
            if (!detail) {
              return;
            }
            return this.$api.inspect.applicationInspect.saveConfigBaselineVersionFromSnapshot({
              snapshotId: row.id,
              baselineData: this.getSnapshotDraft(row.id) || detail.baselineDraft || {},
              name: this.baselineName
            }).then(res => {
              if (res && res.Status === 'OK') {
                this.$Message.success('基线草稿已生成');
                vnode.closeDailog && vnode.closeDailog();
                this.$emit('refresh');
              }
            });
          }).finally(() => {
            this.setActionLoading(actionKey, false);
            vnode.loading = false;
            vnode.okBtnDisable = false;
          });
        }
      });
    },
    openCompareDialog(row) {
      this.currentCompareSnapshotId = row.id;
      this.isShowCompareDialog = true;
    },
    closeCompareDialog() {
      this.currentCompareSnapshotId = null;
      this.isShowCompareDialog = false;
    },
    formatStatus(status) {
      if (status === 'succeed') {
        return '成功';
      }
      if (status === 'failed') {
        return '失败';
      }
      return status || '-';
    },
    getStatusClass(status) {
      if (status === 'succeed') {
        return 'text-success';
      }
      if (status === 'failed') {
        return 'text-error';
      }
      return '';
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
    canPromoteBaseline() {
      return !!this.envId;
    },
    dialogConfig() {
      return {
        type: 'slider',
        title: `${this.resourceLabel || '当前节点'} 快照列表`,
        maskClose: true,
        isShow: true,
        width: 'huge',
        hasFooter: false
      };
    }
  }
};
</script>
