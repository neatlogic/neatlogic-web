<template>
  <div class="application-detail">
    <div v-if="!app" class="padding text-grey">{{ $t('term.cmdb.applicationmatrix.selectdetail') }}</div>
    <Tabs
      v-else
      v-model="tabValue"
      :animated="false"
      :class="{ 'block-tabs': blockTabs }"
    >
      <TabPane :label="$t('term.inspect.assetlist')" name="assetsList">
        <AssetsManage
          v-if="tabValue === 'assetsList'"
          :key="refreshVersion"
          :compact="compact"
          :appSystemId="app.id"
          :appModuleId="module ? module.id : null"
        ></AssetsManage>
      </TabPane>
      <TabPane v-if="!module" :label="$t('term.deploy.applicationinformation')" name="applicationInfo">
        <AppInfo v-if="tabValue === 'applicationInfo'" :key="refreshVersion" :appSystemId="app.id"></AppInfo>
      </TabPane>
      <TabPane v-else :label="$t('term.deploy.moduleinformation')" name="moduleInfo">
        <ModuleInfo
          v-if="tabValue === 'moduleInfo'"
          :key="refreshVersion"
          :isShowTitle="false"
          :appSystemId="app.id"
          :appModuleId="module.id"
        ></ModuleInfo>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  name: 'ApplicationDetail',
  components: {
    AppInfo: () => import('@/views/pages/deploy/application-config/config/app/app-info.vue'),
    ModuleInfo: () => import('@/views/pages/deploy/application-config/config/module/module-info.vue'),
    AssetsManage: () => import('./assets-manage.vue')
  },
  props: {
    // 原列表保持块状页签，独立详情页使用 Tabs 默认样式。
    blockTabs: { type: Boolean, default: true },
    compact: { type: Boolean, default: false },
    app: { type: Object, default: null },
    module: { type: Object, default: null }
  },
  data() {
    return { tabValue: 'assetsList', refreshVersion: 0 };
  },
  methods: {
    // 编辑或设置变更后重新读取真实属性、环境和资产数据。
    refresh() {
      this.refreshVersion++;
    },
    // 切换应用或模块时返回资产页，防止保留不适用的属性页签。
    resetTab() {
      this.tabValue = 'assetsList';
    }
  },
  watch: {
    'app.id': 'resetTab',
    'module.id': 'resetTab'
  }
};
</script>
<style lang="less" scoped>
// 公共容器中限制详情自身滚动，防止长资产列表撑开页面布局。
.application-detail {
  height: 100%;
  overflow-y: auto;
}
</style>
