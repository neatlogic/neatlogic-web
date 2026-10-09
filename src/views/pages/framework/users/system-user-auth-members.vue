<template>
  <div class="system-user-auth-members">
    <div class="member-toolbar">
      <div class="member-toolbar-left action-group">
        <span class="action-item tsfont-plus" :class="{ 'text-disabled': isBusy || loadFailed }" @click="openAdd()">{{ $t('page.newtarget', {target: $t('page.member')}) }}</span>
      </div>
      <div class="member-toolbar-right">
        <div class="action-group">
          <span
            v-if="editableVisibleMembers.length"
            class="action-item"
            :class="[isAllSelected ? 'tsfont-check-square-o' : 'tsfont-minus-square', { 'text-disabled': isBusy }]"
            @click="toggleSelectAll()"
          >{{ isAllSelected ? $t('page.unselectall') : $t('page.selectall') }}</span>
          <span
            v-if="selectedVisibleUuids.length"
            class="action-item tsfont-trash-o"
            :class="{ 'text-disabled': isBusy }"
            @click="confirmRemove(selectedVisibleUuids)"
          >{{ $t('page.batchdelete') }}</span>
        </div>
        <div class="member-search">
          <span class="tsfont-search text-grey" aria-hidden="true"></span>
          <TsFormInput
            v-model="keyword"
            width="400px"
            :disabled="isBusy"
            :placeholder="$t('page.keyword')"
            clearable
          ></TsFormInput>
        </div>
      </div>
    </div>
    <Loading :loadingShow="isLoading"></Loading>
    <div v-if="loadFailed" class="text-grey">
      <span class="mr-md">{{ $t('term.framework.systemuserloadfailed') }}</span>
      <span class="text-action" @click="loadMembers()">{{ $t('page.retry') }}</span>
    </div>
    <div v-else-if="!isLoading" class="member-card-content">
      <TsRow>
        <Col
          v-for="row in visibleMembers"
          :key="row.uuid"
          :sm="6"
          :md="6"
          :xs="24"
          :xxl="4"
        >
          <div class="system-user-member bg-block radius-md">
            <div class="member-detail-left">
              <div class="member-avatar">
                <TsAvatar :userName="row.userName" size="40"></TsAvatar>
              </div>
            </div>
            <div class="member-detail-right">
              <div class="member-detail-item">
                <span class="text-grey">ID</span>
                <span class="member-detail-value overflow" :title="row.userId">{{ row.userId }}</span>
              </div>
              <div class="member-detail-item">
                <span class="text-grey">{{ $t('page.name') }}</span>
                <span class="member-name member-detail-value overflow" :title="row.userName">{{ row.userName }}</span>
              </div>
            </div>
            <div class="member-actions">
              <Tooltip
                theme="light"
                max-width="300"
                :disabled="!row.isCodeAuth"
                :content="$t('term.framework.codeauthreadonly')"
                transfer
              >
                <TsFormCheckbox
                  :value="isEditableMember(row) ? selectedVisibleUuids : []"
                  :dataList="[row]"
                  valueName="uuid"
                  textName="userName"
                  :disabled="isBusy || !isEditableMember(row)"
                  @change="updateSelection($event)"
                >
                  <template v-slot:label>
                    <span class="member-checkbox-name">{{ row.userName }}</span>
                  </template>
                </TsFormCheckbox>
              </Tooltip>
              <span
                v-if="isEditableMember(row)"
                class="tsfont-close item-del text-action"
                :class="{ 'text-disabled': isBusy }"
                :title="$t('page.delete')"
                @click="confirmRemove([row.uuid])"
              ></span>
            </div>
          </div>
        </Col>
        <NoData v-if="!visibleMembers.length"></NoData>
      </TsRow>
    </div>
    <SystemUserAuthAddDialog
      v-if="showAdd"
      :authName="authName"
      :authGroup="authGroup"
      @close="closeAdd"
    ></SystemUserAuthAddDialog>
    <TsDialog
      v-if="removeUuids.length"
      v-bind="removeDialogConfig"
      :showCloseIcon="!isDeleting"
      @on-close="closeRemove()"
    >
      <template v-slot>
        <span>{{ $t('dialog.content.deleteconfirm', {target: $t('term.framework.pageauth')}) }}</span>
      </template>
      <template v-slot:footer>
        <Button :disabled="isDeleting" @click="closeRemove()">{{ $t('page.cancel') }}</Button>
        <Button type="error" :loading="isDeleting" @click="removeMembers()">{{ $t('page.delete') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: 'SystemUserAuthMembers',
  components: {
    TsAvatar: () => import('@/resources/components/TsAvatar/TsAvatar.vue'),
    TsFormCheckbox: () => import('@/resources/plugins/TsForm/TsFormCheckbox.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    SystemUserAuthAddDialog: () => import('./system-user-auth-add-dialog.vue')
  },
  props: {
    authName: { type: String, required: true },
    authGroup: { type: String, required: true }
  },
  data() {
    return {
      memberList: [],
      keyword: '',
      selectedUuids: [],
      isLoading: true,
      loadFailed: false,
      showAdd: false,
      isDeleting: false,
      removeUuids: [],
      removeDialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.$t('dialog.title.deleteconfirm'),
        width: 'small',
        maskClose: false
      }
    };
  },
  created() {
    this.loadMembers();
  },
  methods: {
    //代码授权优先于页面来源，历史双重来源同样禁止选择和移除。
    isEditableMember(user) {
      return !user.isCodeAuth && user.isPageAuth !== false;
    },
    //选择仅保留当前可见的页面授权成员，过滤旧状态或组件传入的只读 UUID。
    updateSelection(uuids) {
      if (this.isBusy || this.loadFailed) {
        return;
      }
      this.selectedUuids = this.editableVisibleMembers.filter(user => uuids.includes(user.uuid)).map(user => user.uuid);
    },
    //读取页面与代码授权成员，计数与本地关键词过滤彼此独立。
    async loadMembers() {
      if (this.showAdd || this.isDeleting) {
        return;
      }
      this.isLoading = true;
      this.loadFailed = false;
      this.selectedUuids = [];
      try {
        const res = await this.$api.framework.auth.searchSystemUser({ auth: this.authName });
        if (res.Status == 'OK') {
          this.memberList = res.Return.tbodyList;
          this.$emit('count', res.Return.rowNum);
        } else {
          this.loadFailed = true;
        }
      } catch (error) {
        this.loadFailed = true;
      } finally {
        this.isLoading = false;
      }
    },
    //仅切换当前可见成员的选择，不把搜索隐藏的成员纳入批量操作。
    toggleSelectAll() {
      if (this.isBusy || this.loadFailed) {
        return;
      }
      if (this.isAllSelected) {
        this.selectedUuids = [];
      } else {
        this.selectedUuids = this.editableVisibleMembers.map(user => user.uuid);
      }
    },
    //新增弹窗独立获取候选，打开期间阻止列表同时写入授权。
    openAdd() {
      if (!this.isBusy && !this.loadFailed) {
        this.showAdd = true;
      }
    },
    //保存成功后重新读取成员并更新页签人数，取消保留当前成员。
    closeAdd(isSaved) {
      this.showAdd = false;
      if (isSaved) {
        this.loadMembers();
      }
    },
    //单个和批量移除共用确认弹窗，代码来源及双重来源均不能成为移除目标。
    confirmRemove(uuids) {
      if (this.isBusy || this.loadFailed) {
        return;
      }
      this.removeUuids = this.memberList.filter(user => this.isEditableMember(user) && uuids.includes(user.uuid)).map(user => user.uuid);
      this.removeDialogConfig.isShow = true;
    },
    //按系统用户边界移除直接授权，失败保留选择与确认弹窗供重试。
    async removeMembers() {
      if (this.isDeleting || this.isLoading || this.loadFailed || this.showAdd || !this.removeUuids.length) {
        return;
      }
      //提交前再次按当前来源过滤，避免确认期间的旧目标或只读 UUID 被写入请求。
      this.removeUuids = this.memberList.filter(user => this.isEditableMember(user) && this.removeUuids.includes(user.uuid)).map(user => user.uuid);
      if (!this.removeUuids.length) {
        this.closeRemove();
        return;
      }
      this.isDeleting = true;
      try {
        const res = await this.$api.framework.auth.deleltAuthUser({
          auth: this.authName,
          userUuidList: [...this.removeUuids],
          userType: 'system'
        });
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.deletesuccess'));
          this.closeRemove(true);
        }
      } catch (error) {
        //统一 HTTP 层提示错误，此处保持确认和选择状态。
      } finally {
        this.isDeleting = false;
      }
      if (!this.removeUuids.length) {
        await this.loadMembers();
      }
    },
    //成功关闭后统一清理移除目标，提交期间禁止取消。
    closeRemove(isSaved = false) {
      if (this.isDeleting && !isSaved) {
        return;
      }
      this.removeDialogConfig.isShow = false;
      this.removeUuids = [];
    }
  },
  computed: {
    //关键词仅作用于显示层，完整成员仍用于新增去重和权限人数。
    visibleMembers() {
      const keyword = this.keyword.trim().toLowerCase();
      return this.memberList.filter(user => !keyword || [user.userName, user.userId].some(value => String(value || '').toLowerCase().includes(keyword)));
    },
    //批量移除只收集当前搜索可见的已选成员。
    selectedVisibleUuids() {
      return this.editableVisibleMembers.filter(user => this.selectedUuids.includes(user.uuid)).map(user => user.uuid);
    },
    //全选和批量移除只覆盖页面来源，代码来源始终只读。
    editableVisibleMembers() {
      return this.visibleMembers.filter(user => this.isEditableMember(user));
    },
    //由当前可见集合判断全选，避免独立标记与勾选状态不同步。
    isAllSelected() {
      return this.editableVisibleMembers.length > 0 && this.selectedVisibleUuids.length == this.editableVisibleMembers.length;
    },
    //任何弹窗打开时都阻止列表变更，避免新增和移除相互覆盖。
    isBusy() {
      return this.isLoading || this.showAdd || this.isDeleting || this.removeUuids.length > 0;
    }
  },
  watch: {
    //搜索变更立即清除隐藏成员的选择，恢复搜索也不会恢复旧选择。
    keyword() {
      this.selectedUuids = this.selectedVisibleUuids;
    }
  }
};
</script>

<style lang="less" scoped>
.system-user-auth-members {
  height: 100%;
  .member-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;
    margin-bottom: 16px;
    line-height: 32px;
    .member-toolbar-left {
      height: 32px;
    }
    .member-toolbar-right {
      display: flex;
      align-items: center;
      width: 700px;
      gap: 20px;
      > .action-group {
        flex: 1;
        text-align: right;
      }
    }
    .member-search {
      position: relative;
      width: 400px;
      height: 32px;
      .tsfont-search {
        position: absolute;
        top: 0;
        left: 8px;
        z-index: 1;
        pointer-events: none;
      }
      ::v-deep .ivu-input {
        padding-left: 26px;
      }
    }
  }
  .member-card-content {
    height: calc(100vh - 186px);
    overflow: auto;
    padding-bottom: 60px;
  }
}
.system-user-member {
  position: relative;
  min-height: 112px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid transparent;
  .member-detail-left {
    width: 74px;
    height: 78px;
    display: flex;
    align-items: center;
    float: left;
    text-align: center;
    .member-avatar {
      width: 60px;
    }
  }
  .member-detail-right {
    padding-left: 64px;
    padding-top: 15px;
    .member-detail-item {
      display: flex;
      gap: 8px;
      > .text-grey {
        flex-shrink: 0;
      }
      .member-detail-value {
        flex: 1;
        min-width: 0;
      }
    }
  }
  //与用户、角色页签一致，选择与移除控件置于卡片右上角，名称独立展示。
  .member-actions {
    position: absolute;
    right: 8px;
    top: 6px;
    display: grid;
    grid-template-columns: 30px 14px;
    align-items: center;
    z-index: 9;
    .item-del {
      opacity: 0;
      cursor: pointer;
    }
  }
  &:hover .item-del {
    opacity: 1;
  }
}
.member-checkbox-name {
  //保留勾选框的可访问名称，将可见用户名放到 Tooltip 外以限定提示范围。
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
