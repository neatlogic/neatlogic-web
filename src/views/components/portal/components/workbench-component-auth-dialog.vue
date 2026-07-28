<template>
  <TsDialog
    :isShow="true"
    :title="'组件授权 - ' + (componentData.label || componentData.name || '')"
    width="small"
    :maskClose="false"
    @on-close="close"
  >
    <div class="workbench-component-auth">
      <div v-if="loading" class="padding-lg flex-center">
        <Loading :loadingShow="true"></Loading>
      </div>
      <div v-else-if="detailError" class="padding-lg text-center">
        <NoData :text="detailError"></NoData>
        <div class="text-action pt-sm cursor-pointer" @click="loadComponentDetail">重试</div>
      </div>
      <template v-else>
        <div class="form-label pb-sm">授权用户</div>
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
          throw new Error((res && res.Message) || '组件授权信息加载失败');
        }
        const detail = res.Return || {};
        this.authorityList = (detail.authorityList || []).slice();
      }).catch(error => {
        this.detailError = (error && (error.Message || error.message)) || '组件授权信息加载失败';
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
          throw new Error((res && res.Message) || '组件授权保存失败');
        }
        this.$Message.success(this.$t('message.savesuccess'));
        this.$emit('close', true);
      }).catch(error => {
        this.saveError = (error && (error.Message || error.message)) || '组件授权保存失败';
      }).finally(() => {
        this.saving = false;
      });
    }
  }
};
</script>
