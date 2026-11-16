<template>
  <TsDialog
    type="modal"
    :isShow="true"
    :title="$t(isEdit ? 'dialog.title.edittarget' : 'dialog.title.addtarget', {target: $t('page.instance')})"
    :okText="$t('page.confirm')"
    :loading="saving"
    @on-ok="save"
    @on-close="$emit('close', false)"
  >
    <InstanceForm
      ref="form"
      :params="params"
      :isEdit="isEdit"
      :instanceData="instanceData"
    ></InstanceForm>
  </TsDialog>
</template>
<script>
import handleTimeMixin from '../app/components/handleTimeMixin.js';
export default {
  components: {InstanceForm: () => import('./env-instance-form.vue')},
  mixins: [handleTimeMixin],
  props: {params: Object, isEdit: Boolean, instanceData: Object},
  data() { return {saving: false}; },
  methods: {
    // 应用配置页确认后按原接口保存模型字段或实例关联。
    async save() {
      if (this.saving) return;
      const result = this.$refs.form.read();
      if (!result) return;
      const data = {...result.value, ...this.params};
      if (data.maintenanceWindow) data.maintenanceWindow = this.setMaintenanceWindowValue(data.maintenanceWindow);
      if (this.isEdit) data.id = this.instanceData.id;
      this.saving = true;
      try {
        const res = await this.$api.deploy.applicationConfig.saveEnvInstance(data);
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', true);
        }
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>
