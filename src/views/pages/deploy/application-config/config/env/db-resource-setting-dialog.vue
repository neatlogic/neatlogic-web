<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      :loading="saving"
      :title="isNewData? $t('dialog.title.addtarget', {target: $t('page.database')}): $t('dialog.title.edittarget', {target: $t('page.database')})"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <ResourceForm ref="resourceForm" :isNewData="isNewData" :dbResourceData="dbResourceData"></ResourceForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ResourceForm: () => import('./db-resource-form.vue')
  },
  props: {
    isNewData: { // 是否新增数据
      type: Boolean,
      default: false
    },
    dbResourceData: Object,
    params: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {saving: false, dialogSetting: {isShow: true, type: 'modal', width: 'medium'}};
  },
  methods: {
    // 原入口继续使用环境数据库资源保存接口。
    async okDialog() {
      if (this.saving) return;
      const value = this.$refs.resourceForm.read();
      if (!value) return;
      const {ciId, name, ip, port} = value;
      const {appSystemId, appModuleId, envId} = this.params;
      const data = {appSystemId, appModuleId, envId, ciId, name, ip, port};
      if (!this.isNewData) data.id = this.dbResourceData.id;
      this.saving = true;
      try {
        const res = await this.$api.deploy.env.saveEnvDbResource(data);
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(res.Return.id);
        }
      } finally {
        this.saving = false;
      }
    },
    closeDialog(id) { this.$emit('close', id); }
  }
};
</script>
