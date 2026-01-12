<template>
  <div class="mt-md">
    <TsContain hideHeader>
      <template v-slot:content>
        <Tabs v-model="currentTab" :animated="false">
          <TabPane :label="$t('page.param')" name="parameterSettings"></TabPane>
          <TabPane :label="$t('page.middleware')" name="middleware"></TabPane>
        </Tabs>
        <div>
          <div v-if="currentTab == 'parameterSettings'">
            <ParameterSettingsManage></ParameterSettingsManage>
          </div>
          <div v-if="currentTab == 'middleware'">
            <MiddlewareManage></MiddlewareManage>
          </div>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ParameterSettingsManage: () => import('./parametersettings-manage.vue'),
    MiddlewareManage: () => import('./middleware-manage.vue')
  },
  props: {},
  data() {
    return {
      currentTab: 'parameterSettings'
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scope>
</style>
