<template>
  <div class="mt-md">
    <TsContain hideHeader>
      <template v-slot:content>
        <Tabs v-model="currentTab" :animated="false">
          <TabPane :label="$t('page.param')" name="parameterSettings"></TabPane>
          <TabPane :label="$t('page.config')" name="config"></TabPane>
        </Tabs>
        <div>
          <div v-if="currentTab == 'parameterSettings'">
            <ParameterSettingsManage></ParameterSettingsManage>
          </div>
          <div v-if="currentTab == 'config'">
            <ConfigManage></ConfigManage>
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
    ConfigManage: () => import('./config-manage.vue')
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
<style lang="less" scoped>
</style>
