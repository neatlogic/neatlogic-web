<template>
  <div class="app-manage-wrap">
    <Tabs
      v-model="tabValue"
      :animated="false"
      class="block-tabs"
      @on-click="tabClick"
    >
      <TabPane :label="$t('term.deploy.applicationinformation')" name="appConfig">
        <AppInfoManage
          v-if="tabValue == 'appConfig'"
          :appSystemId="appSystemId"
          :hasEditConfigAuth="hasEditConfigAuth"
          :hideFucntionExcludeAppModuleRunner="hideFucntionExcludeAppModuleRunner"
          @updateAuth="updateAuth"
        ></AppInfoManage>
      </TabPane>
      <TabPane v-if="!hideFucntionExcludeAppModuleRunner" :label="$t('term.deploy.continuousintegration')" name="integrated">
        <IntegratedManage v-if="tabValue == 'integrated'" :appSystemId="appSystemId"></IntegratedManage>
      </TabPane>
      <TabPane v-if="hasEditPipelineAuth" :label="$t('term.deploy.superpipeline')" name="pipeline">
        <AppPipeline
          v-if="tabValue == 'pipeline'"
          type="appsystem"
          :appSystemId="appSystemId"
        ></AppPipeline>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppInfoManage: resolve => require(['./app/app-info-manage'], resolve), // 应用信息
    IntegratedManage: resolve => require(['./integrated/integrated-manage'], resolve), // 持续集成
    AppPipeline: resolve => require(['./app/app-pipeline'], resolve) //超级流水线
  },
  props: {
    appSystemId: {
      type: Number,
      default: null
    },
    hasEditConfigAuth: {
      // 是否有编辑配置权限
      type: Boolean,
      default: false
    },
    authList: {
      // 权限列表
      type: Array,
      default: function() {
        return [];
      }
    },
    hasEditPipelineAuth: {
      // 是否有超级流水线权限
      type: Boolean,
      default: false
    },
    hideFucntionExcludeAppModuleRunner: {
      // codehub新增应用配置入口，为了维护应用和模块，应用权限以及模块对应的runner组,发布其他功能全部屏蔽
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tabValue: 'appConfig'
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
    tabClick(tabValue) {
      this.$addHistoryData('tabValue', tabValue);
    },
    restoreHistory(historyData) {
      this.tabValue = historyData['tabValue'] || 'appConfig';
    },
    updateAuth() {
      this.$emit('updateAuth');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
