<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="$emit('close')">
      <template v-slot>
        <div class="padding">
          <TsTable
            v-bind="versionData"
            :theadList="theadList"
            :loading="loadingShow"
          >
            <template v-slot:isCurrentActive="{ row }">
              <span>{{ row.isCurrentActive ? '是' : '否' }}</span>
            </template>
            <template v-slot:status="{ row }">
              <span>{{ formatStatus(row.status) }}</span>
            </template>
            <template v-slot:approvalStatus="{ row }">
              <span>{{ formatApprovalStatus(row.approvalStatus) }}</span>
            </template>
            <template v-slot:approverVo="{ row }">
              <UserCard v-if="row.approverVo && row.approverVo.uuid" :uuid="row.approverVo.uuid" :hideAvatar="true"></UserCard>
              <span v-else>-</span>
            </template>
            <template v-slot:fcd="{ row }">
              <span v-if="row.fcd">{{ row.fcd | formatDate }}</span>
              <span v-else>-</span>
            </template>
            <template v-slot:approvedTime="{ row }">
              <span v-if="row.approvedTime">{{ row.approvedTime | formatDate }}</span>
              <span v-else>-</span>
            </template>
            <template v-slot:activatedTime="{ row }">
              <span v-if="row.activatedTime">{{ row.activatedTime | formatDate }}</span>
              <span v-else>-</span>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-eye" @click="viewVersion(row)">查看</li>
                  <li v-if="row.status === 'draft' || row.status === 'rejected'" class="tsfont-edit" @click="editVersion(row)">编辑草稿</li>
                  <li v-if="row.status === 'draft' || row.status === 'rejected'" class="tsfont-setting" :class="{ 'text-grey': isActionLoading(row.id, 'submit') }" @click="submitApproval(row)">
                    {{ isActionLoading(row.id, 'submit') ? '提交中...' : '提交审核' }}
                  </li>
                  <li v-if="row.status === 'pending_approval' && row.approvalStatus === 'pending'" class="tsfont-check" @click="auditVersion(row, 'approved')">审批通过</li>
                  <li v-if="row.status === 'pending_approval' && row.approvalStatus === 'pending'" class="tsfont-close" @click="auditVersion(row, 'rejected')">审批驳回</li>
                  <li v-if="row.status === 'approved'" class="tsfont-publish" :class="{ 'text-grey': isActionLoading(row.id, 'publish') }" @click="publishVersion(row)">
                    {{ isActionLoading(row.id, 'publish') ? '发布中...' : '发布' }}
                  </li>
                  <li v-if="!row.isCurrentActive && (row.status === 'approved' || row.status === 'active')" class="tsfont-history" :class="{ 'text-grey': isActionLoading(row.id, 'rollback') }" @click="rollbackVersion(row)">
                    {{ isActionLoading(row.id, 'rollback') ? '回退中...' : '回退到此版本' }}
                  </li>
                  <li v-if="!row.isCurrentActive" v-auth="'INSPECT_MODIFY'" class="tsfont-trash-o text-error" :class="{ 'text-grey': isActionLoading(row.id, 'delete') }" @click="deleteVersion(row)">
                    {{ isActionLoading(row.id, 'delete') ? '删除中...' : '删除版本' }}
                  </li>
                </ul>
              </div>
            </template>
          </TsTable>
          <NoData v-if="!versionData.tbodyList || versionData.tbodyList.length === 0"></NoData>
        </div>
      </template>
    </TsDialog>
    <ConfigJsonDialog
      v-if="isShowJsonDialog"
      :title="jsonDialogTitle"
      :value="jsonDialogValue"
      :summary="jsonDialogSummary"
      :aiCandidate="jsonDialogAiCandidate"
      :editable="jsonDialogEditable"
      :saveLoading="jsonDialogSaveLoading"
      @close="closeJsonDialog"
      @save="saveDraftVersion"
    ></ConfigJsonDialog>
    <TsDialog
      v-if="isShowAuditDialog"
      v-bind="auditDialogConfig"
      @on-ok="submitAudit"
      @on-close="closeAuditDialog"
    >
      <template v-slot>
        <div class="padding">
          <TsFormInput
            v-model="auditForm.comment"
            type="textarea"
            :maxlength="500"
            :autoSize="{ minRows: 4, maxRows: 8 }"
            placeholder="请输入审批意见"
          ></TsFormInput>
          <div class="text-tip margin-top">
            审批意见将随本次{{ auditActionText }}一起保存
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    ConfigJsonDialog: () => import('./config-json-dialog.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  props: {
    baselineId: {
      type: Number,
      default: null
    },
    baselineName: {
      type: String,
      default: '基线'
    }
  },
  data() {
    return {
      loadingShow: false,
      versionData: {
        tbodyList: [],
        rowNum: 0,
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        { key: 'version', title: '版本号' },
        { key: 'status', title: '状态' },
        { key: 'isCurrentActive', title: '当前生效' },
        { key: 'fieldCount', title: '字段数' },
        { key: 'approvalStatus', title: '审批' },
        { key: 'approverVo', title: '审批人' },
        { key: 'fcd', title: '创建时间' },
        { key: 'approvedTime', title: '审批时间' },
        { key: 'activatedTime', title: '生效时间' },
        { key: 'action', title: '' }
      ],
      isShowJsonDialog: false,
      jsonDialogTitle: '',
      jsonDialogValue: null,
      jsonDialogSummary: null,
      jsonDialogAiCandidate: null,
      jsonDialogEditable: false,
      jsonDialogSaveLoading: false,
      jsonDialogVersionId: null,
      isShowAuditDialog: false,
      auditLoading: false,
      auditForm: {
        id: null,
        status: '',
        comment: ''
      },
      actionLoadingMap: {}
    };
  },
  mounted() {
    this.getVersionList();
  },
  methods: {
    getVersionList() {
      if (!this.baselineId) {
        return;
      }
      this.loadingShow = true;
      this.$api.inspect.applicationInspect.searchConfigBaselineVersion({
        baselineId: this.baselineId
      }).then(res => {
        if (res && res.Status === 'OK') {
          let tbodyList = res.Return.tbodyList || [];
          this.versionData = {
            tbodyList: tbodyList,
            rowNum: tbodyList.length,
            currentPage: 1,
            pageSize: 20
          };
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    viewVersion(row) {
      this.openVersionDialog(row, false);
    },
    editVersion(row) {
      this.openVersionDialog(row, true);
    },
    openVersionDialog(row, editable) {
      this.jsonDialogTitle = `${this.baselineName} ${row.version || ''} ${this.formatStatus(row.status)}`;
      this.jsonDialogValue = row.baselineData || '{}';
      this.jsonDialogSummary = row.changeLog ? this.parseJson(row.changeLog) : null;
      this.jsonDialogAiCandidate = row.aiCandidateData ? this.parseJson(row.aiCandidateData) : null;
      this.jsonDialogEditable = editable;
      this.jsonDialogVersionId = row.id;
      this.isShowJsonDialog = true;
    },
    saveDraftVersion(value) {
      if (!this.jsonDialogVersionId) {
        return;
      }
      let baselineData = null;
      try {
        baselineData = JSON.parse(value);
      } catch (e) {
        this.$Message.error('草稿内容不是合法的 JSON');
        return;
      }
      this.jsonDialogSaveLoading = true;
      this.$api.inspect.applicationInspect.saveConfigBaselineVersionDraft({
        id: this.jsonDialogVersionId,
        baselineData: baselineData
      }).then(res => {
        if (res && res.Status === 'OK') {
          let version = res.Return.version || {};
          this.jsonDialogValue = version.baselineData || '{}';
          this.jsonDialogSummary = version.changeLog ? this.parseJson(version.changeLog) : null;
          this.jsonDialogAiCandidate = version.aiCandidateData ? this.parseJson(version.aiCandidateData) : null;
          this.$Message.success('草稿已保存');
          this.getVersionList();
        }
      }).finally(() => {
        this.jsonDialogSaveLoading = false;
      });
    },
    submitApproval(row) {
      if (this.isActionLoading(row.id, 'submit')) {
        return;
      }
      this.$createDialog({
        title: '提交审核',
        content: `确认提交 ${row.version || ''} 进入审核吗？`,
        btnType: 'primary',
        'on-ok': vnode => {
          if (this.isActionLoading(row.id, 'submit')) {
            return;
          }
          this.setActionLoading(row.id, 'submit', true);
          vnode.loading = true;
          vnode.okBtnDisable = true;
          this.$api.inspect.applicationInspect.submitConfigBaselineVersion({ id: row.id }).then(res => {
            if (res && res.Status === 'OK') {
              this.$Message.success('已提交审核');
              vnode.closeDailog && vnode.closeDailog();
              this.getVersionList();
            }
          }).finally(() => {
            this.setActionLoading(row.id, 'submit', false);
            vnode.loading = false;
            vnode.okBtnDisable = false;
          });
        }
      });
    },
    auditVersion(row, status) {
      this.auditForm = {
        id: row.id,
        status: status,
        comment: ''
      };
      this.isShowAuditDialog = true;
    },
    publishVersion(row) {
      if (this.isActionLoading(row.id, 'publish')) {
        return;
      }
      this.$createDialog({
        title: '发布版本',
        content: `确认发布版本 ${row.version || ''} 吗？`,
        btnType: 'primary',
        'on-ok': vnode => {
          if (this.isActionLoading(row.id, 'publish')) {
            return;
          }
          this.setActionLoading(row.id, 'publish', true);
          vnode.loading = true;
          vnode.okBtnDisable = true;
          this.$api.inspect.applicationInspect.publishConfigBaselineVersion({ id: row.id }).then(res => {
            if (res && res.Status === 'OK') {
              this.$Message.success('版本已发布');
              vnode.closeDailog && vnode.closeDailog();
              this.getVersionList();
              this.$emit('refresh');
            }
          }).finally(() => {
            this.setActionLoading(row.id, 'publish', false);
            vnode.loading = false;
            vnode.okBtnDisable = false;
          });
        }
      });
    },
    rollbackVersion(row) {
      if (this.isActionLoading(row.id, 'rollback')) {
        return;
      }
      this.$createDialog({
        title: '回退版本',
        content: `确认回退到版本 ${row.version || ''} 吗？`,
        btnType: 'error',
        'on-ok': vnode => {
          if (this.isActionLoading(row.id, 'rollback')) {
            return;
          }
          this.setActionLoading(row.id, 'rollback', true);
          vnode.loading = true;
          vnode.okBtnDisable = true;
          this.$api.inspect.applicationInspect.rollbackConfigBaselineVersion({ id: row.id }).then(res => {
            if (res && res.Status === 'OK') {
              this.$Message.success('版本已回退');
              vnode.closeDailog && vnode.closeDailog();
              this.getVersionList();
              this.$emit('refresh');
            }
          }).finally(() => {
            this.setActionLoading(row.id, 'rollback', false);
            vnode.loading = false;
            vnode.okBtnDisable = false;
          });
        }
      });
    },
    deleteVersion(row) {
      if (this.isActionLoading(row.id, 'delete')) {
        return;
      }
      this.$createDialog({
        title: '删除版本',
        content: `确认删除版本 ${row.version || ''} 吗？该版本的审批记录和相关比对结果都会一起删除。`,
        btnType: 'error',
        'on-ok': vnode => {
          if (this.isActionLoading(row.id, 'delete')) {
            return;
          }
          this.setActionLoading(row.id, 'delete', true);
          vnode.loading = true;
          vnode.okBtnDisable = true;
          this.$api.inspect.applicationInspect.deleteConfigBaselineVersion({
            id: row.id
          }).then(res => {
            if (res && res.Status === 'OK') {
              this.$Message.success('版本已删除');
              vnode.closeDailog && vnode.closeDailog();
              if (res.Return && res.Return.baselineDeleted) {
                this.$emit('deleted');
              } else {
                this.getVersionList();
              }
            }
          }).finally(() => {
            this.setActionLoading(row.id, 'delete', false);
            vnode.loading = false;
            vnode.okBtnDisable = false;
          });
        }
      });
    },
    closeJsonDialog() {
      this.isShowJsonDialog = false;
      this.jsonDialogTitle = '';
      this.jsonDialogValue = null;
      this.jsonDialogSummary = null;
      this.jsonDialogAiCandidate = null;
      this.jsonDialogEditable = false;
      this.jsonDialogSaveLoading = false;
      this.jsonDialogVersionId = null;
    },
    closeAuditDialog() {
      if (this.auditLoading) {
        return;
      }
      this.isShowAuditDialog = false;
      this.auditForm = {
        id: null,
        status: '',
        comment: ''
      };
    },
    submitAudit() {
      let comment = this.auditForm.comment ? this.auditForm.comment.trim() : '';
      if (!comment) {
        this.$Message.warning('请输入审批意见');
        return;
      }
      this.auditLoading = true;
      this.$api.inspect.applicationInspect.auditConfigBaselineVersion({
        id: this.auditForm.id,
        stage: 'approval',
        status: this.auditForm.status,
        comment: comment
      }).then(res => {
        if (res && res.Status === 'OK') {
          this.$Message.success(`审批已${this.auditActionText}`);
          this.auditLoading = false;
          this.closeAuditDialog();
          this.getVersionList();
        }
      }).finally(() => {
        this.auditLoading = false;
      });
    },
    parseJson(value) {
      if (!value) {
        return null;
      }
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return null;
        }
      }
      return value;
    },
    formatStatus(status) {
      const statusMap = {
        draft: '草稿',
        pending_approval: '待审批',
        approved: '已审批',
        active: '已发布',
        rejected: '已拒绝'
      };
      return statusMap[status] || '-';
    },
    formatApprovalStatus(status) {
      const statusMap = {
        pending: '待审批',
        approved: '已通过',
        rejected: '已驳回'
      };
      return statusMap[status] || '-';
    },
    getActionLoadingKey(id, action) {
      return `${id || 'unknown'}_${action}`;
    },
    isActionLoading(id, action) {
      return !!this.actionLoadingMap[this.getActionLoadingKey(id, action)];
    },
    setActionLoading(id, action, loading) {
      this.$set(this.actionLoadingMap, this.getActionLoadingKey(id, action), loading);
    }
  },
  computed: {
    dialogConfig() {
      return {
        type: 'slider',
        title: `${this.baselineName} 版本管理`,
        maskClose: true,
        isShow: true,
        width: 'huge',
        hasFooter: false
      };
    },
    auditActionText() {
      return this.auditForm.status === 'approved' ? '通过' : '驳回';
    },
    auditDialogConfig() {
      return {
        type: 'modal',
        title: '审批',
        maskClose: false,
        isShow: true,
        width: 'medium',
        hasFooter: true,
        loading: this.auditLoading,
        okText: `确认${this.auditActionText}`
      };
    }
  }
};
</script>
