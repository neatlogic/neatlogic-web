<template>
  <div>
    <Tabs v-model="tabActive" class="block-tabs">
      <TabPane :label="$t('term.deploy.dbconfig')">
        <EnvDbConfigList
          v-if="tabActive == 0"
          :params="params"
          :hasEditConfigAuth="hasEditConfigAuth"
          @close="close"
        ></EnvDbConfigList>
      </TabPane>
      <TabPane :label="$t('term.deploy.configurationfileadaptation')">
        <EnvAutoConfigList
          v-if="tabActive == 1"
          :params="params"
          :hasEditConfigAuth="hasEditConfigAuth"
          @close="close"
        ></EnvAutoConfigList>
      </TabPane>
      <TabPane :label="$t('term.deploy.instancelist')">
        <EnvInstanceList
          v-if="tabActive == 2"
          :params="params"
          :hasEditConfigAuth="hasEditConfigAuth"
          @close="close"
        ></EnvInstanceList>
      </TabPane>
      <TabPane :label="$t('term.deploy.envattr')">
        <EnvAttr
          v-if="tabActive == 3"
          :params="params"
          :hasEditConfigAuth="hasEditConfigAuth"
          @close="close"
        >
        </EnvAttr>
      </TabPane>
      <div :is="'appConfigEnvTabHandler'" v-if="isHasAppConfigEnvTabHandler" :appData="params"></div>
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
      tabActive: 0
    };
  },
  beforeCreate() {},
  created() {
    this.tabActive = 0;
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
