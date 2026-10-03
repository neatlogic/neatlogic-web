<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close()">
      <template v-slot>
        <Loading :loadingShow="isLoading"></Loading>
        <div v-if="loadFailed" class="text-grey">
          <span class="mr-md">{{ $t('term.framework.systemuserloadfailed') }}</span>
          <span class="text-action" @click="loadUsers()">{{ $t('page.retry') }}</span>
        </div>
        <TsTable
          v-else-if="!isLoading"
          keyName="uuid"
          :theadList="theadList"
          :tbodyList="userList"
        >
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-permission icon" @click.stop="authorize(row)">{{ $t('page.auth') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.close') }}</Button>
      </template>
    </TsDialog>
    <SystemUserAuthDialog
      v-if="selectedUser"
      :key="selectedUser.uuid"
      :systemUser="selectedUser"
      @close="closeAuth()"
    ></SystemUserAuthDialog>
  </div>
</template>

<script>
export default {
  name: 'SystemUserListDialog',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    SystemUserAuthDialog: () => import('./system-user-auth-dialog.vue')
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.$t('term.framework.systemuserauth'),
        width: 'medium',
        maskClose: false
      },
      theadList: [
        { key: 'userName', title: this.$t('page.username') },
        { key: 'userId', title: this.$t('page.userid') },
        { key: 'action', title: '', align: 'right' }
      ],
      userList: [],
      selectedUser: null,
      isLoading: true,
      loadFailed: false
    };
  },
  created() {
    this.loadUsers();
  },
  methods: {
    //每次打开重新读取工厂注册用户，失败时允许原地重试。
    async loadUsers() {
      this.isLoading = true;
      this.loadFailed = false;
      try {
        const res = await this.$api.framework.user.searchSystemUser();
        if (res.Status == 'OK') {
          this.userList = res.Return.tbodyList;
        } else {
          this.loadFailed = true;
        }
      } catch (error) {
        this.loadFailed = true;
      } finally {
        this.isLoading = false;
      }
    },
    //直接使用后端用户对象，授权目标以稳定 UUID 标识。
    authorize(user) {
      this.selectedUser = user;
    },
    //销毁编辑弹窗，使下次打开重新加载权限和勾选状态。
    closeAuth() {
      this.selectedUser = null;
    },
    //统一关闭列表并通知父页面清理弹窗状态。
    close() {
      this.dialogConfig.isShow = false;
      this.$emit('close');
    }
  }
};
</script>
