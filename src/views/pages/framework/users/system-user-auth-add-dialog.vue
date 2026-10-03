<template>
  <TsDialog v-bind="dialogConfig" :showCloseIcon="!isSaving" @on-close="close()">
    <template v-slot>
      <Loading :loadingShow="isLoading"></Loading>
      <div v-if="loadFailed" class="text-grey">
        <span class="mr-md">{{ $t('term.framework.systemuserloadfailed') }}</span>
        <span class="text-action" @click="loadCandidates()">{{ $t('page.retry') }}</span>
      </div>
      <template v-else-if="!isLoading">
        <TsFormCheckbox
          v-if="candidateList.length"
          v-model="selectedUuids"
          :dataList="candidateList"
          valueName="uuid"
          textName="userName"
          :disabled="isSaving"
          vertical
        >
          <template v-slot:label="{ node }">
            <span>{{ node.userName }}</span>
            <span class="text-grey ml-sm">({{ node.userId }})</span>
          </template>
        </TsFormCheckbox>
        <NoData v-else></NoData>
      </template>
    </template>
    <template v-slot:footer>
      <Button :disabled="isSaving" @click="close()">{{ $t('page.cancel') }}</Button>
      <Button
        type="primary"
        :loading="isSaving"
        :disabled="isLoading || loadFailed || !selectedUuids.length"
        @click="save()"
      >{{ $t('page.save') }}</Button>
    </template>
  </TsDialog>
</template>

<script>
export default {
  name: 'SystemUserAuthAddDialog',
  components: {
    TsFormCheckbox: () => import('@/resources/plugins/TsForm/TsFormCheckbox.vue')
  },
  props: {
    authName: { type: String, required: true },
    authGroup: { type: String, required: true }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.$t('page.newtarget', {target: this.$t('page.member')}),
        width: 'medium',
        maskClose: false
      },
      isLoading: true,
      loadFailed: false,
      isSaving: false,
      candidateList: [],
      selectedUuids: []
    };
  },
  created() {
    this.loadCandidates();
  },
  methods: {
    //从全部注册用户排除完整直接成员，不受列表页的搜索关键词影响。
    async loadCandidates() {
      this.isLoading = true;
      this.loadFailed = false;
      this.selectedUuids = [];
      try {
        const [allRes, memberRes] = await Promise.all([
          this.$api.framework.auth.searchSystemUser({}),
          this.$api.framework.auth.searchSystemUser({ auth: this.authName })
        ]);
        if (allRes.Status == 'OK' && memberRes.Status == 'OK') {
          const memberUuids = new Set(memberRes.Return.tbodyList.map(user => user.uuid));
          this.candidateList = allRes.Return.tbodyList.filter(user => !memberUuids.has(user.uuid));
        } else {
          this.loadFailed = true;
        }
      } catch (error) {
        this.loadFailed = true;
      } finally {
        this.isLoading = false;
      }
    },
    //仅追加选中候选的当前权限，不覆盖这些用户的其他直接授权。
    async save() {
      if (this.isLoading || this.loadFailed || this.isSaving || !this.selectedUuids.length) {
        return;
      }
      this.isSaving = true;
      try {
        const res = await this.$api.common.saveAuthUser({
          auth: this.authName,
          authGroup: this.authGroup,
          userUuidList: [...this.selectedUuids],
          userType: 'system'
        });
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      } catch (error) {
        //请求错误由统一 HTTP 层提示，保留选择和弹窗供重试。
      } finally {
        this.isSaving = false;
      }
    },
    //成功与取消统一通知父组件，提交期间只有成功响应可以关闭。
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
