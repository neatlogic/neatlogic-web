<template>
  <div>
    <Tabs v-model="tabSelectedName" class="block-tabs">
      <TabPane :label="$t('term.deploy.dbconfig')" name="dbconfig">
        <EnvDbConfigList
          v-if="tabSelectedName == 'dbconfig'"
          :params="params"
          :hasEditConfigAuth="hasEditConfigAuth"
          @close="close"
        ></EnvDbConfigList>
      </TabPane>
      <TabPane :label="$t('term.deploy.configurationfileadaptation')" name="configurationfileadaptation">
        <EnvAutoConfigList
          v-if="tabSelectedName == 'configurationfileadaptation'"
          :params="params"
          :hasEditConfigAuth="hasEditConfigAuth"
          @close="close"
        ></EnvAutoConfigList>
      </TabPane>
      <TabPane :label="$t('term.deploy.instancelist')" name="instancelist">
        <EnvInstanceList
          v-if="tabSelectedName == 'instancelist'"
          :params="params"
          :hasEditConfigAuth="hasEditConfigAuth"
          @close="close"
        ></EnvInstanceList>
      </TabPane>
      <TabPane :label="$t('term.deploy.envattr')" name="envattr">
        <EnvAttr
          v-if="tabSelectedName == 'envattr'"
          :params="params"
          :hasEditConfigAuth="hasEditConfigAuth"
          @close="close"
        >
        </EnvAttr>
      </TabPane>
      <div
        :is="'appConfigEnvTabHandler'"
        v-if="isHasAppConfigEnvTabHandler"
        :tabSelectedName="tabSelectedName"
        :appData="params"
      ></div>
    </Tabs>
  </div>
</template>
<script>
import ComponentManager from '@/resources/import/component-manager.js';
export default {
  name: '',
  components: {
    EnvInstanceList: () => import('./env/env-instance-list'), // 实例列表
    EnvAutoConfigList: () => import('./env/env-autoconfig-list'), // autoconfig
    EnvDbConfigList: () => import('./env/env-db-config-list'), // autoconfig
    EnvAttr: () => import('./env/env-attr'),
    ...ComponentManager.getDeployAppConfigEnvTabComponent()
  },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    hasEditConfigAuth: {
      // 是否有编辑配置权限
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tabSelectedName: 'dbconfig'
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
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {
    isHasAppConfigEnvTabHandler() {
      const Items = ComponentManager.getDeployAppConfigEnvTabComponent && ComponentManager.getDeployAppConfigEnvTabComponent();
      return !!Items['appConfigEnvTabHandler'];
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.autoconfig-box {
  height: calc(100vh - 50px - 50px - 32px - 16px);
  &.env-autoconfig-radius {
  border-radius: 0 10px 10px;
  }
  .autocfg-box {
    height: 148px;
  }
  .add-text-box {
    padding-top: 20px;
  }
}
</style>
