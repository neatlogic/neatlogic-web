<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog()"
    >
      <template v-slot>
        <div>
          <ul v-if="configType == 'app'">
            <li class="mb-xs">当前操作将清理：</li>
            <li class="pl-nm mb-xs">1）当前应用流水线配置</li>
            <li class="pl-nm mb-xs">2）当前应用权限配置</li>
            <li class="pl-nm mb-xs">3）所有模块配置</li>
            <li class="pl-nm mb-xs">4）所有环境配置</li>
            <li class="mt-xs">且清理后不支持撤销，需重新配置，是否继续？</li>
          </ul>
          <ul v-if="configType == 'module'">
            <li class="mb-xs">当前操作将清理：</li>
            <li class="pl-nm mb-xs">1）当前模块的流水线相关的重载数据</li>
            <li class="pl-nm mb-xs">2）当前模块的执行器配置</li>
            <li class="pl-nm mb-xs">3）当前模块下所有环境的配置</li>
            <li class="mt-xs">且清理后，当前模块及模块的所有环境，均继承应用配置；清理后不支持撤销，是否继续？</li>
          </ul>
          <ul v-if="configType == 'env'">
            <li class="mb-xs">当前操作将清理：</li>
            <li class="pl-nm mb-xs">1）当前环境的流水线的相关重载数据</li>
            <li class="pl-nm mb-xs">2）当前环境的配置文件适配数据</li>
            <li class="pl-nm mb-xs">3）当前环境的DB配置</li>
            <li class="mt-xs">且清理后，当前环境配置均继承模块配置；清理后不支持撤销，是否继续？</li>
          </ul>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="closeDialog()">取消</Button>
        <Button type="error" @click="okDialog()">删除</Button>
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
        title: '清空配置',
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
            this.$Message.success('清空配置成功');
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
            this.$Message.success('清空配置成功');
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
            this.$Message.success('清空配置成功');
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
