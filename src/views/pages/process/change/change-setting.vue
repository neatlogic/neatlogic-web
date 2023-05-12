<template>
  <div class="changeSetting">
    <Tabs value="SettingParameter">
      <TabPane :label="$t('term.process.soptemp')" name="SettingParameter">
        <SopSetting ref="sopSetting"></SopSetting>
      </TabPane>
      <TabPane :label="$t('term.process.changeparams')" name="SettingTemplate">
        <ParamSetting></ParamSetting>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  name: 'ChangeSetting',
  components: {
    SopSetting: resolve => require(['./setting/sop-setting.vue'], resolve),
    ParamSetting: resolve => require(['./setting/param-setting.vue'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {};
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
    openSopTemplate(id) {
      this.$refs.sopSetting.editTemplate(id);
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
.changeSetting {
  width: 100%;
  height: 100%;
  // padding-top: 8px;
  /deep/ .ivu-tabs-nav .ivu-tabs-tab {
    padding: 18px 16px;
  }
}
</style>
