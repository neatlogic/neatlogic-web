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
    </Tabs>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    EnvInstanceList: resolve => require(['./env/env-instance-list'], resolve), // 实例列表
    EnvAutoConfigList: resolve => require(['./env/env-autoconfig-list'], resolve), // autoconfig
    EnvDbConfigList: resolve => require(['./env/env-db-config-list'], resolve) // autoconfig
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
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
