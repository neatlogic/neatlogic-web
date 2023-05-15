<template>
  <div>
    <TsDialog
      title="通知策略设置"
      type="modal"
      :isShow.sync="isshowDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Tabs v-model="tabValue" :animated="false" @on-click="changeTab">
            <TabPane label="触发时机" name="triggerTiming">
          
            </TabPane>

            <TabPane label="模板参数映射" name="templateParameter mapping">
           
            </TabPane>
          </Tabs>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      isshowDialog: true
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
    okDialog() {

    },
    closeDialog() {

    },
    changeTab() {

    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
