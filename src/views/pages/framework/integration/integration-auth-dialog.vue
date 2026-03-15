<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
  >
    <template v-slot>
      <TsForm
        v-model="formData"
        :item-list="formConfig"
      ></TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" :loading="isSaving" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    integration: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      isSaving: false,
      dialogConfig: {
        title: this.$t('page.executeauthority'),
        width: 'small',
        isShow: true,
        maskClose: false
      },
      formData: {
        authorityList: this.integration.authorityList || []
      },
      formConfig: {
        authorityList: {
          type: 'userselect',
          label: this.$t('page.executeauthority'),
          multiple: true,
          groupList: ['user', 'team', 'role', 'common'],
          transfer: true,
          value: this.integration.authorityList || []
        }
      }
    };
  },
  methods: {
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      this.isSaving = true;
      this.$api.framework.integration.saveIntegrationAuthority({
        uuid: this.integration.uuid,
        authorityList: this.formData.authorityList || []
      }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      }).finally(() => {
        this.isSaving = false;
      });
    }
  }
};
</script>
<style lang="less"></style>
