<template>
  <div class="tagent-add-wrap">
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ serviceName }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group text-right">
          <span class="action-item">
            <Button
              type="primary"
              ghost
              icon="tsfont tsfont-save"
              :title="canSaveJob ? $t('term.autoexec.servicehasexpired') : ''"
              :disabled="canSaveJob"
              @click="saveService"
            >{{ $t('page.save') }}</Button>
          </span>
          <span class="action-item last">
            <Button
              type="primary"
              :title="canSaveJob ? $t('term.autoexec.servicehasexpired') : ''"
              icon="tsfont tsfont-run"
              :disabled="canSaveJob"
              @click="saveExecuteService"
            >{{ $t('term.autoexec.immediateexecution') }}</Button>
          </span>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <FormReferenceServiceEdit v-if="formUuid == 'form'" ref="formReferenceServiceEdit" :defaultData="serviceConfig"></FormReferenceServiceEdit>
          <NoFormReferenceServiceEdit v-else-if="formUuid == 'noform'" ref="noFormReferenceServiceEdit" :defaultData="serviceConfig">
          </NoFormReferenceServiceEdit>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'CreateJob',
  components: {
    FormReferenceServiceEdit: () => import('./form-reference-service-edit.vue'),
    NoFormReferenceServiceEdit: () => import('./no-form-reference-service-edit.vue')
  },
  data() {
    return {
      loadingShow: false,
      serviceId: null,
      serviceName: '',
      formUuid: '',
      serviceConfig: {}
    };
  },
  methods: {
    async initData() {
      this.formUuid = '';
      this.serviceConfig = {};
      this.loadingShow = true;
      try {
        if (!this.serviceId) return;
        const res = await this.$api.autoexec.catalogManage.getSeriveInfo({ id: this.serviceId });
        if (res.Status !== 'OK') return;
        const service = this.$utils.deepClone(res.Return);
        this.serviceConfig = service;
        this.formUuid = service.formUuid ? 'form' : 'noform';
        if (service.combopId) {
          const response = await this.$api.autoexec.action.getCombopExecutableList({ defaultValue: [service.combopId] });
          if (response.Status === 'OK') this.$set(this.serviceConfig, 'combopName', (response.Return.tbodyList[0] || {}).name || '');
        }
      } finally {
        this.loadingShow = false;
      }
    },
    saveService() {
      if (this.formUuid == 'form') {
        this.$refs.formReferenceServiceEdit && this.$refs.formReferenceServiceEdit.saveService();
      } else if (this.formUuid == 'noform') {
        this.$refs.noFormReferenceServiceEdit && this.$refs.noFormReferenceServiceEdit.saveService();
      }
    },
    saveExecuteService() {
      if (this.formUuid == 'form') {
        this.$refs.formReferenceServiceEdit && this.$refs.formReferenceServiceEdit.saveExecuteService();
      } else if (this.formUuid == 'noform') {
        this.$refs.noFormReferenceServiceEdit && this.$refs.noFormReferenceServiceEdit.saveExecuteService();
      }
    }
  },
  computed: {
    canSaveJob() {
      return this.loadingShow || !!this.serviceConfig.configExpired;
    }
  },
  watch: {
    '$route.query.id': {
      immediate: true,
      handler(id) {
        this.serviceId = id ? parseInt(id) : null;
        this.serviceName = this.$route.query.name || '';
        this.initData();
      }
    }
  }
};
</script>
