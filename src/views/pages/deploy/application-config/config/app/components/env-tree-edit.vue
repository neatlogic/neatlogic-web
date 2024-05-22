<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div v-if="isEdit">{{ $t('dialog.title.edittarget', {target: $t('page.environment')}) }}</div>
        <div v-else>{{ $t('dialog.title.addtarget', {target: $t('page.environment')}) }}</div>
      </template>
      <template v-slot>
        <div>
          <TsForm
            ref="form"
            v-model="envConfig"
            :labelWidth="80"
            :item-list="formConfig"
          >
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 应用权限编辑
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      envConfig: {},
      formConfig: {
        envIdList: {
          label: this.$t('page.environment'),
          type: 'select',
          validateList: ['required'],
          valueName: 'id',
          textName: 'name',
          multiple: true,
          transfer: true,
          params: {...this.params, isHasEnv: 0},
          url: 'api/rest/deploy/app/config/env/list'
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      let params = {
        appSystemId: this.params.appSystemId,
        appModuleId: this.params.appModuleId,
        ...this.envConfig
      };
      this.$api.deploy.applicationConfig.saveEnvTree(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          let {envIdList} = this.envConfig;
          this.closeDialog(true, envIdList);
        }
      });
    },
    closeDialog(needRefresh = false, envIdList) {
      this.$emit('close', needRefresh, envIdList && envIdList.length > 0 ? envIdList[0] : null); // 新增环境，应用配置树，默认选中第一个环境
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
