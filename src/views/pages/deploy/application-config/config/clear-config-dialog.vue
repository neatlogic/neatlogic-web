<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog()"
    >
      <template v-slot>
        <div>
          <ul v-if="configType == 'app'">
            <li class="mb-xs">{{ $t('term.deploy.currentoperationwillclear') }}</li>
            <li class="pl-nm mb-xs">{{ $t('term.deploy.currentpipelineconfig') }}</li>
            <li class="pl-nm mb-xs">{{ $t('term.deploy.currentappauthconfig') }}</li>
            <li class="pl-nm mb-xs">{{ $t('term.deploy.allmoduleconfig') }}</li>
            <li class="pl-nm mb-xs">{{ $t('term.deploy.allenvconfig') }}</li>
            <li class="mt-xs">{{ $t('term.deploy.deleteconfirm') }}</li>
          </ul>
          <ul v-if="configType == 'module'">
            <li class="mb-xs">{{ $t('term.deploy.currentoperationwillclear') }}</li>
            <li class="pl-nm mb-xs">{{ $t('term.deploy.currentmoduledatareset') }}</li>
            <li class="pl-nm mb-xs">{{ $t('term.deploy.currentmoduleexecuteconfig') }}</li>
            <li class="pl-nm mb-xs">{{ $t('term.deploy.currentmoduleallenvconfig') }}</li>
            <li class="mt-xs">{{ $t('term.deploy.moduleenvdeleteconfirm') }}</li>
          </ul>
          <ul v-if="configType == 'env'">
            <li class="mb-xs">{{ $t('term.deploy.currentoperationwillclear') }}</li>
            <li class="pl-nm mb-xs">{{ $t('term.deploy.currentenvdatareset') }}</li>
            <li class="pl-nm mb-xs">{{ $t('term.deploy.currentenvfileconfig') }}</li>
            <li class="pl-nm mb-xs">{{ $t('term.deploy.currentenvdbconfig') }}</li>
            <li class="mt-xs">{{ $t('term.deploy.envdeleteconfirm') }}</li>
          </ul>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="closeDialog()">{{ $t('page.cancel') }}</Button>
        <Button type="error" @click="okDialog()">{{ $t('page.delete') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    clearConfigParams: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      dialogSetting: {
        title: this.$t('page.clearconfig'),
        isShow: true,
        type: 'modal'
      },
      configType: ''
    };
  },
  beforeCreate() {},
  created() {
    if (this.clearConfigParams && !this.$utils.isEmptyObj(this.clearConfigParams)) {
      const {configType} = this.clearConfigParams;
      this.configType = configType;
    }
  },
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
      if (this.clearConfigParams && !this.$utils.isEmptyObj(this.clearConfigParams)) {
        let {appSystemId, appModuleId, envId, configType } = this.clearConfigParams;
        if (configType == 'app') {
          // 应用
          this.clearConfigApp(
            {
              appSystemId
            },
            this.clearConfigParams
          );
        } else if (configType == 'module') {
          // 模块
          this.clearConfigModule(
            {
              appSystemId,
              appModuleId
            },
            this.clearConfigParams
          );
        } else if (configType == 'env') {
          // 环境
          this.clearConfigEnv(
            {
              appSystemId,
              appModuleId,
              envId
            },
            this.clearConfigParams
          );
        }
      }
    },
    clearConfigApp(params, node) {
      // 清空配置（应用）
      if (params) {
        this.$api.deploy.applicationConfig.clearConfigApp(params).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.updatesuccess'));
            node.isConfig = !node.isConfig;
            this.closeDialog(true, this.configType);
          }
        });
      }
    },
    clearConfigModule(params, node) {
      // 清空配置（模块）
      if (params) {
        this.$api.deploy.applicationConfig.clearConfigModule(params).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.updatesuccess'));
            node.isConfig = !node.isConfig;
            this.closeDialog(true, this.configType);
          }
        });
      }
    },
    clearConfigEnv(params, node) {
      // 清空配置（环境）
      if (params) {
        this.$api.deploy.applicationConfig.clearConfigEnv(params).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.updatesuccess'));
            node.isConfig = !node.isConfig;
            this.closeDialog(true, this.configType);
          }
        });
      }
    },
    closeDialog(needRefresh = false, configType) {
      this.$emit('close', needRefresh, configType);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
