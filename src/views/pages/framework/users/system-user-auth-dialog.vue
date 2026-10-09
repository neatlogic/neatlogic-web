<template>
  <TsDialog v-bind="dialogConfig" :showCloseIcon="!isSaving" @on-close="close()">
    <template v-slot:header>
      <span>{{ $t('term.framework.systemuserauth') }} · {{ systemUser.userName }} ({{ systemUser.userId }})</span>
    </template>
    <template v-slot>
      <Loading :loadingShow="isLoading"></Loading>
      <div v-if="loadFailed" class="text-grey">
        <span class="mr-md">{{ $t('term.framework.systemuserloadfailed') }}</span>
        <span class="text-action" @click="loadAuth()">{{ $t('page.retry') }}</span>
      </div>
      <CommonAuth
        v-else-if="!isLoading"
        ref="commonAuth"
        class="system-user-auth-list"
        :authList="authList"
        :authUserSelectList="authUserSelectList"
        :authRoleSelectList="authRoleSelectList"
        :authCodeSelectList="authCodeSelectList"
        :readOnly="isSaving"
      ></CommonAuth>
    </template>
    <template v-slot:footer>
      <Button :disabled="isSaving" @click="close()">{{ $t('page.cancel') }}</Button>
      <Button
        type="primary"
        :loading="isSaving"
        :disabled="isLoading || loadFailed"
        @click="save()"
      >{{ $t('page.save') }}</Button>
    </template>
  </TsDialog>
</template>

<script>
export default {
  name: 'SystemUserAuthDialog',
  components: {
    CommonAuth: () => import('./common/common-auth.vue')
  },
  props: {
    systemUser: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true,
        width: '80%',
        maskClose: false
      },
      isLoading: true,
      loadFailed: false,
      isSaving: false,
      authList: [],
      authUserSelectList: {},
      authCodeSelectList: {},
      authRoleSelectList: {}
    };
  },
  created() {
    this.loadAuth();
  },
  methods: {
    //目录和目标权限均加载成功后才创建 CommonAuth，避免遗留其他用户的勾选状态。
    async loadAuth() {
      this.isLoading = true;
      this.loadFailed = false;
      try {
        const [groupRes, userRes] = await Promise.all([
          this.$api.common.getAuthGrouplist({}),
          this.$api.common.getUserAuth({ userUuid: this.systemUser.uuid })
        ]);
        if (groupRes.Status == 'OK' && userRes.Status == 'OK') {
          this.authList = groupRes.Return.authGroupList;
          this.authUserSelectList = userRes.Return.userAuthObj || {};
          this.authRoleSelectList = userRes.Return.userRoleAuthObj || {};
          this.authCodeSelectList = userRes.Return.userCodeAuthObj || {};
        } else {
          this.loadFailed = true;
        }
      } catch (error) {
        this.loadFailed = true;
      } finally {
        this.isLoading = false;
      }
    },
    //仅保存页面授权，角色和代码权限由 CommonAuth 合并只读展示，不增加持久化记录。
    async save() {
      if (this.isSaving || this.isLoading || this.loadFailed || !this.$refs.commonAuth) {
        return;
      }
      this.isSaving = true;
      try {
        const res = await this.$api.common.saveAuth({
          action: 'cover',
          userUuidList: [this.systemUser.uuid],
          userAuthList: this.$utils.deepClone(this.$refs.commonAuth.authSelectList)
        });
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      } catch (error) {
        //请求错误由统一 HTTP 层提示，弹窗与勾选数据保留供重试。
      } finally {
        this.isSaving = false;
      }
    },
    //保存成功与取消统一通知父组件，提交过程中只允许成功响应关闭。
    close(isSaved = false) {
      if (this.isSaving && !isSaved) {
        return;
      }
      this.dialogConfig.isShow = false;
      this.$emit('close', isSaved);
    }
  }
};
</script>

<style lang="less" scoped>
//弹窗由 TsDialog 统一负责内容滚动，权限组件不再创建第二个滚动区域。
.common-auth.system-user-auth-list {
  height: auto;
  overflow: visible;
}
</style>
