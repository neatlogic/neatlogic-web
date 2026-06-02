<template>
  <div class="feishu-sync-manage">
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="openEditDialog()">同步配置</span>
      </template>
      <template v-slot:topRight>
        <InputSearcher v-model="searchParams.keyword" @change="searchData()"></InputSearcher>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <TsTable
          :theadList="theadList"
          v-bind="tableConfig"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template v-slot:name="{row}">
            <span class="text-href" @click="openEditDialog(row)">{{ row.name }}</span>
          </template>
          <template v-slot:isActive="{row}">
            <i-switch
              :value="row.isActive === 1"
              size="large"
              @on-change="updateStatus(row, $event)"
            ></i-switch>
          </template>
          <template v-slot:lastSyncStatus="{row}">
            <span :class="row.lastSyncStatus === 'failed' ? 'text-error' : 'text-success'">
              {{ statusText(row.lastSyncStatus) }}
            </span>
          </template>
          <template v-slot:action="{row}">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-sync" @click="execute(row)">同步</li>
                <li class="tsfont-time" @click="openAuditDialog(row)">记录</li>
                <li class="tsfont-trash-s" @click="deleteConfig(row)">删除</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>

    <!-- 新增/编辑同步配置表单拆到独立组件，父页面只负责打开弹框和刷新列表。 -->
    <FeishuSyncEdit
      v-if="isEditDialogShow"
      :config-data="currentEditConfig"
      @close="closeEditDialog"
    ></FeishuSyncEdit>

    <TsDialog
      v-if="isAuditDialogShow"
      :isShow.sync="isAuditDialogShow"
      title="同步记录"
      width="large"
      :hasFooter="false"
    >
      <template v-slot>
        <TsTable
          :theadList="auditTheadList"
          v-bind="auditTableConfig"
          @changeCurrent="changeAuditCurrent"
          @changePageSize="changeAuditPageSize"
        >
          <template v-slot:status="{row}">
            <span :class="row.status === 'failed' ? 'text-error' : 'text-success'">{{ statusText(row.status) }}</span>
          </template>
          <template v-slot:action="{row}">
            <span v-if="row.status === 'failed'" class="text-action tsfont-refresh" @click="retry(row)">重试</span>
          </template>
        </TsTable>
      </template>
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: 'FeishuSyncManage',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsDialog: () => import('@/resources/plugins/TsDialog/TsDialog.vue'),
    FeishuSyncEdit: () => import('./feishu-sync-edit.vue')
  },
  data() {
    return {
      isLoading: false,
      isEditDialogShow: false,
      isAuditDialogShow: false,
      currentConfig: null,
      // 当前编辑对象单独保存，避免弹框组件直接修改表格行数据。
      currentEditConfig: null,
      searchParams: { keyword: '', currentPage: 1, pageSize: 20 },
      auditSearchParams: { configId: null, currentPage: 1, pageSize: 10 },
      theadList: [
        { title: '名称', key: 'name' },
        // { title: 'Wiki Space', key: 'spaceName' },
        { title: '知识圈', key: 'knowledgeCircleName' },
        { title: '启用', key: 'isActive' },
        { title: '最近同步状态', key: 'lastSyncStatus' },
        { title: '最近同步时间', key: 'lastSyncTime', type: 'time' },
        { title: '', key: 'action' }
      ],
      auditTheadList: [
        { title: '方向', key: 'direction' },
        { title: '状态', key: 'status' },
        { title: '总数', key: 'totalCount' },
        { title: '成功', key: 'successCount' },
        { title: '失败', key: 'failedCount' },
        { title: '错误', key: 'error' },
        { title: '开始时间', key: 'startTime', type: 'time' },
        { title: '', key: 'action' }
      ],
      tableConfig: { tbodyList: [], rowNum: 0, pageSize: 20, currentPage: 1 },
      auditTableConfig: { tbodyList: [], rowNum: 0, pageSize: 10, currentPage: 1 }
    };
  },
  created() {
    this.searchData();
  },
  methods: {
    searchData() {
      this.isLoading = true;
      this.$api.knowledge.feishu.searchConfig(this.searchParams).then(res => {
        if (res.Status === 'OK') {
          const { tbodyList, rowNum, pageSize, currentPage } = res.Return || {};
          this.tableConfig = { tbodyList, rowNum, pageSize, currentPage };
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    openEditDialog(row) {
      // 传入副本给编辑弹框，兼容旧数据中没有 userAccessToken 的配置。
      this.currentEditConfig = row ? { ...row, userAccessToken: '' } : null;
      this.isEditDialogShow = true;
    },
    closeEditDialog(needRefresh) {
      // 弹框保存成功后统一回到父页面刷新列表，保持数据入口单一。
      this.isEditDialogShow = false;
      this.currentEditConfig = null;
      if (needRefresh) {
        this.searchData();
      }
    },
    updateStatus(row, value) {
      this.$api.knowledge.feishu.updateStatus({ id: row.id, isActive: value ? 1 : 0 }).then(res => {
        if (res.Status === 'OK') {
          row.isActive = value ? 1 : 0;
        }
      });
    },
    execute(row) {
      this.$api.knowledge.feishu.execute({ configId: row.id, direction: 'from_feishu' }).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success('同步已完成');
          this.searchData();
        }
      });
    },
    deleteConfig(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: row.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.knowledge.feishu.deleteConfig({ id: row.id }).then(res => {
            if (res.Status === 'OK') {
              vnode.isShow = false;
              this.searchData();
            }
          });
        }
      });
    },
    openAuditDialog(row) {
      this.currentConfig = row;
      this.auditSearchParams = { configId: row.id, currentPage: 1, pageSize: 10 };
      this.isAuditDialogShow = true;
      this.searchAudit();
    },
    searchAudit() {
      this.$api.knowledge.feishu.searchAudit(this.auditSearchParams).then(res => {
        if (res.Status === 'OK') {
          const { tbodyList, rowNum, pageSize, currentPage } = res.Return || {};
          this.auditTableConfig = { tbodyList, rowNum, pageSize, currentPage };
        }
      });
    },
    retry(row) {
      this.$api.knowledge.feishu.retry({ auditId: row.id }).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success('重试已完成');
          this.searchAudit();
          this.searchData();
        }
      });
    },
    changeCurrent(currentPage) {
      this.searchParams.currentPage = currentPage;
      this.searchData();
    },
    changePageSize(pageSize) {
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = pageSize;
      this.searchData();
    },
    changeAuditCurrent(currentPage) {
      this.auditSearchParams.currentPage = currentPage;
      this.searchAudit();
    },
    changeAuditPageSize(pageSize) {
      this.auditSearchParams.currentPage = 1;
      this.auditSearchParams.pageSize = pageSize;
      this.searchAudit();
    },
    statusText(status) {
      const map = { succeed: '成功', failed: '失败', running: '执行中' };
      return map[status] || '-';
    }
  }
};
</script>
