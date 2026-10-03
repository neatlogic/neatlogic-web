<template>
  <div class="pt-nm">
    <div class="flex-between mb-md">
      <div class="action-group">
        <span class="action-item tsfont-plus" :class="{ 'text-disabled': isBusy || loadFailed }" @click="openAdd()">{{ $t('page.newtarget', {target: $t('page.member')}) }}</span>
        <span
          v-if="visibleMembers.length"
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
      <TsFormInput
        v-model="keyword"
        width="300px"
        :disabled="isBusy"
        :placeholder="$t('form.placeholder.keyword')"
        clearable
      ></TsFormInput>
    </div>
    <Loading :loadingShow="isLoading"></Loading>
    <div v-if="loadFailed" class="text-grey">
      <span class="mr-md">{{ $t('term.framework.systemuserloadfailed') }}</span>
      <span class="text-action" @click="loadMembers()">{{ $t('page.retry') }}</span>
    </div>
    <TsCard
      v-else-if="!isLoading"
      keyName="uuid"
      :cardList="visibleMembers"
      :padding="false"
      :boxShadow="false"
      :sm="12"
      :lg="8"
      :xl="6"
      :xxl="4"
    >
      <template v-slot="{ row }">
        <div class="flex-between mb-sm">
          <TsFormCheckbox
            v-model="selectedUuids"
            :dataList="[row]"
            valueName="uuid"
            textName="userName"
            :disabled="isBusy"
          ></TsFormCheckbox>
          <span
            class="tsfont-close text-action"
            :class="{ 'text-disabled': isBusy }"
            :title="$t('page.delete')"
            @click="confirmRemove([row.uuid])"
          ></span>
        </div>
        <div class="text-grey overflow" :title="row.userId">{{ $t('page.userid') }}：{{ row.userId }}</div>
      </template>
    </TsCard>
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
        <span>{{ $t('dialog.content.deleteconfirm', {target: $t('term.framework.selectedtarget')}) }}</span>
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
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
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
    //读取完整直接授权成员，计数与本地关键词过滤彼此独立。
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
      if (this.isBusy) {
        return;
      }
      if (this.isAllSelected) {
        this.selectedUuids = [];
      } else {
        this.selectedUuids = this.visibleMembers.map(user => user.uuid);
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
    //单个和批量移除共用确认弹窗，快照只包含当前完整成员中的 UUID。
    confirmRemove(uuids) {
      if (this.isBusy || this.loadFailed) {
        return;
      }
      this.removeUuids = this.memberList.filter(user => uuids.includes(user.uuid)).map(user => user.uuid);
      this.removeDialogConfig.isShow = true;
    },
    //按系统用户边界移除直接授权，失败保留选择与确认弹窗供重试。
    async removeMembers() {
      if (this.isDeleting || !this.removeUuids.length) {
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
      return this.visibleMembers.filter(user => this.selectedUuids.includes(user.uuid)).map(user => user.uuid);
    },
    //由当前可见集合判断全选，避免独立标记与勾选状态不同步。
    isAllSelected() {
      return this.visibleMembers.length > 0 && this.selectedVisibleUuids.length == this.visibleMembers.length;
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
