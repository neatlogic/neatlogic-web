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
          :hasAuthConfigAuth="hasAuthConfigAuth"
          :hideFucntionExcludeAppModuleRunner="hideFucntionExcludeAppModuleRunner"
          @updateAuth="updateAuth"
        ></AppInfoManage>
      </TabPane>
      <TabPane v-if="!hideFucntionExcludeAppModuleRunner" :label="$t('term.deploy.continuousintegration')" name="integrated">
        <IntegratedManage
          v-if="tabValue == 'integrated'"
          :appSystemId="appSystemId"
          :hasEditConfigAuth="hasEditConfigAuth"
        ></IntegratedManage>
      </TabPane>
      <TabPane v-if="hasEditPipelineAuth" :label="$t('term.deploy.superpipeline')" name="pipeline">
        <AppPipeline
          v-if="tabValue == 'pipeline'"
          type="appsystem"
          :appSystemId="appSystemId"
        ></AppPipeline>
      </TabPane>
      <slot
        name="extraTab"
        :tabValue="tabValue"
        :appSystemId="appSystemId"
        :hasEditConfigAuth="hasEditConfigAuth"
      ></slot>
    </Tabs>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppInfoManage: () => import('./app/app-info-manage'), // 应用信息
    IntegratedManage: () => import('./integrated/integrated-manage'), // 持续集成
    AppPipeline: () => import('./app/app-pipeline') //超级流水线
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
    hasAuthConfigAuth: {
      // 是否有“权限”的权限
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
    },
    activeTabValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tabValue: this.activeTabValue || 'appConfig'
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
      this.$emit('updateTab', tabValue);
      this.$addHistoryData('tabValue', tabValue);
    },
    restoreHistory(historyData) {
      this.tabValue = historyData['tabValue'] || 'appConfig';
      this.$emit('updateTab', this.tabValue);
    },
    updateAuth() {
      this.$emit('updateAuth');
    }
  },
  filter: {},
  computed: {},
  watch: {
    activeTabValue(tabValue) {
      if (tabValue && tabValue !== this.tabValue) {
        this.tabValue = tabValue;
      }
    }
  }
};
</script>
<style lang="less" scoped>
</style>
