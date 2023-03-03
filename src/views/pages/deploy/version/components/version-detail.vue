<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/version-center-manage')">{{ $getFromPage('版本中心') }}</span>
      </template>
      <template v-slot:topLeft>{{ title }}</template>
      <template v-slot:content>
        <Tabs v-model="tabValue" :animated="false">
          <TabPane label="发布状态" name="deployStatus">
            <DeployStatusOverview v-if="tabValue == 'deployStatus'" :envId="envId" :versionId="versionId"></DeployStatusOverview>
          </TabPane>
          <TabPane label="单元测试" name="unitTest">
            <UnitTestOverview v-if="tabValue == 'unitTest'" :versionId="versionId"></UnitTestOverview>
          </TabPane>
          <TabPane label="代码扫描" name="codeScan">
            <CodeScanOverview v-if="tabValue == 'codeScan'" :versionId="versionId"></CodeScanOverview>
          </TabPane>
        </Tabs>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    DeployStatusOverview: resolve => require(['./deploy-status-overview'], resolve),
    UnitTestOverview: resolve => require(['./unit-test-overview'], resolve), // 单元测试
    CodeScanOverview: resolve => require(['./code-scan-overview'], resolve) // 代码扫描
  },
  props: {},
  data() {
    return {
      tabValue: 'deployStatus',
      title: '',
      envId: null,
      versionId: null
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query || {};
    if (query && !this.$utils.isEmptyObj(query)) {
      this.title = query.title;
      query.envId && (this.envId = parseInt(query.envId));
      this.versionId = parseInt(query.versionId);
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
