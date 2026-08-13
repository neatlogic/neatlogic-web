<template>
  <TsDialog
    :isShow="true"
    width="small"
    :title="$t('term.workbench.widgetauthorization', { name: componentData.label || componentData.name || '' })"
    :maskClose="false"
    @on-close="close"
  >
    <div class="workbench-component-auth">
      <div v-if="loading" class="padding-lg flex-center">
        <Loading :loadingShow="true"></Loading>
      </div>
      <div v-else-if="detailError" class="padding-lg text-center">
        <NoData :text="detailError"></NoData>
      </div>
      <template v-else>
        <div class="text-action pt-sm cursor-pointer" @click="loadComponentDetail">{{ $t('page.retry') }}</div>
        <div class="form-label pb-sm">{{ $t('term.workbench.authorizedusers') }}</div>
        <UserSelect
          v-model="authorityList"
          :groupList="['common', 'user', 'role', 'team']"
          :multiple="true"
          :transfer="true"
          border="border"
        ></UserSelect>
        <div v-if="saveError" class="text-error pt-sm">{{ saveError }}</div>
      </template>
    </div>
    <template v-slot:footer>
      <Button @click="close">{{ $t('page.cancel') }}</Button>
      <Button
        type="primary"
        :loading="saving"
        :disabled="loading || !!detailError"
        @click="save"
      >
        {{ $t('page.save') }}
      </Button>
    </template>
  </TsDialog>
</template>

<script>
import { WORKBENCH_TYPE_GLOBAL } from '../workbench-constants.js';

export default {
  name: 'PortalWorkbenchComponentAuthDialog',
  components: {
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue')
  },
  props: {
    componentData: {
      type: Object,
      default: () => ({})
    },
    moduleGroup: { type: String, default: '' },
    workbenchType: { type: String, default: WORKBENCH_TYPE_GLOBAL }
  },
  data() {
    return {
      authorityList: [],
      loading: true,
      saving: false,
      detailError: '',
      saveError: ''
    };
  },
  created() {
    this.loadComponentDetail();
  },
  methods: {
    close() {
      this.$emit('close');
    },
    loadComponentDetail() {
      this.loading = true;
      this.detailError = '';
      this.$api.common.getWorkbenchWidget(
        this.componentData.name,
        this.moduleGroup,
        this.workbenchType
      ).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || this.$t('term.workbench.widgetdetailloadfailed'));
        }
        const detail = res.Return || {};
        this.authorityList = (detail.authorityList || []).slice();
      }).catch(error => {
        this.detailError = (error && (error.Message || error.message)) || this.$t('term.workbench.widgetdetailloadfailed');
      }).finally(() => {
        this.loading = false;
      });
    },
    save() {
      if (this.loading || this.detailError || this.saving) {
        return;
      }
      this.saving = true;
      this.saveError = '';
      this.$api.common.saveWorkbenchWidgetAuthority(
        this.componentData.name,
        this.authorityList,
        this.moduleGroup,
        this.workbenchType
      ).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || this.$t('term.workbench.widgetauthorizationsavefailed'));
        }
        this.$Message.success(this.$t('message.savesuccess'));
        this.$emit('close', true);
      }).catch(error => {
        this.saveError = (error && (error.Message || error.message)) || this.$t('term.workbench.widgetauthorizationsavefailed');
      }).finally(() => {
        this.saving = false;
      });
    }
  }
};
</script>
