<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <Tabs v-model="tabValue" :animated="false" class="block-tabs">
          <TabPane :label="$t('term.framework.versionupdate')" name="versionUpdate">
            <div class="padding">
              <VersionUpdateManage></VersionUpdateManage>
            </div>
          </TabPane>
          <TabPane :label="$t('term.framework.sqlupdate')" name="sqlUpdate">
            <div class="padding">
              <SqlUpdateManage v-if="tabValue == 'sqlUpdate'"></SqlUpdateManage>
            </div>
          </TabPane>
        </Tabs>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    VersionUpdateManage: resolve => require(['./version-update-manage'], resolve),
    SqlUpdateManage: resolve => require(['./sql-update-manage'], resolve)
  },
  mixins: [],
  props: { moduleId: { type: String } },
  data() {
    return {
      tabValue: '',
      dialogConfig: {
        title: this.$t('term.framework.updaterecord'),
        type: 'slider',
        width: 'large',
        isShow: true,
        hasFooter: false
      }
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
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
