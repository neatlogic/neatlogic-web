<template>
  <TsDialog
    :isShow="true"
    width="small"
    :title="$t('term.workbench.batchauthorization')"
    :maskClose="false"
    @on-close="close"
  >
    <div class="workbench-component-batch-auth">
      <div class="text-tip pb-md">{{ $tc('term.workbench.selectedwidgetcount', componentList.length, { count: componentList.length }) }}</div>
      <div class="form-label pb-sm">{{ $t('term.workbench.authorizationtargets') }}</div>
      <UserSelect
        v-model="authorityList"
        :groupList="['common', 'user', 'role', 'team']"
        :multiple="true"
        :transfer="true"
        border="border"
      ></UserSelect>
      <div class="text-warning pt-sm">
        {{ $t('term.workbench.batchauthorizationwarning') }}
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
          btnType: 'error',
          title: this.$t('term.workbench.clearauthorization'),
          content: this.$tc('term.workbench.clearauthorizationcontent', this.componentNameList.length, { count: this.componentNameList.length }),
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
          throw new Error((res && res.Message) || this.$t('term.workbench.widgetbatchauthorizationsavefailed'));
        }
        this.$Message.success(this.$t('message.savesuccess'));
        this.$emit('close', true);
      }).catch(error => {
        this.saveError = (error && (error.Message || error.message)) || this.$t('term.workbench.widgetbatchauthorizationsavefailed');
      }).finally(() => {
        this.saving = false;
      });
    }
  },
  computed: {
    componentNameList() {
      return this.componentList
        .map(item => item.name)
        .filter(Boolean);
    }
  }
};
</script>
