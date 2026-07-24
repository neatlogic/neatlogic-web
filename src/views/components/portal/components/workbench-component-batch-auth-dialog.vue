<template>
  <TsDialog
    :isShow="true"
    title="批量授权"
    width="small"
    :maskClose="false"
    @on-close="close"
  >
    <div class="workbench-component-batch-auth">
      <div class="text-tip pb-md">已选择 {{ componentList.length }} 个组件</div>
      <div class="form-label pb-sm">授权对象</div>
      <UserSelect
        v-model="authorityList"
        :groupList="['common', 'user', 'role', 'team']"
        :multiple="true"
        :transfer="true"
        border="border"
      ></UserSelect>
      <div class="text-warning pt-sm">
        批量授权会覆盖所选组件的原有授权；未选择授权对象时，保存将清空原有授权。
      </div>
      <div v-if="saveError" class="text-error pt-sm">{{ saveError }}</div>
    </div>
    <template v-slot:footer>
      <Button @click="close">{{ $t('page.cancel') }}</Button>
      <Button
        type="primary"
        :loading="saving"
        :disabled="!componentList.length"
        @click="save"
      >
        {{ $t('page.save') }}
      </Button>
    </template>
  </TsDialog>
</template>

<script>
export default {
  name: 'PortalWorkbenchComponentBatchAuthDialog',
  components: {
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue')
  },
  props: {
    componentList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      authorityList: [],
      saving: false,
      saveError: ''
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    save() {
      if (this.saving || !this.componentNameList.length) {
        return;
      }
      if (!this.authorityList.length) {
        this.$createDialog({
          title: '清空授权确认',
          content: `确定清空所选 ${this.componentNameList.length} 个组件的原有授权吗？`,
          btnType: 'error',
          'on-ok': vnode => {
            vnode.isShow = false;
            this.submit();
          }
        });
        return;
      }
      this.submit();
    },
    submit() {
      this.saving = true;
      this.saveError = '';
      this.$api.common.batchSaveWorkbenchWidgetAuthority(
        this.componentNameList,
        this.authorityList
      ).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '组件批量授权保存失败');
        }
        this.$Message.success(this.$t('message.savesuccess'));
        this.$emit('close', true);
      }).catch(error => {
        this.saveError = (error && (error.Message || error.message)) || '组件批量授权保存失败';
      }).finally(() => {
        this.saving = false;
      });
    }
  },
  computed: {
    componentNameList() {
      return this.componentList.map(item => item.name).filter(Boolean);
    }
  }
};
</script>
