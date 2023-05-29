<template>
  <div class="tactics-setting bg-grey" :style="{ width: rightWidth + 'px' }">
    <Tabs v-model="tabValue">
      <TabPane label="参数" name="SettingParameter">
        <SettingParameter :id="id" :handler="handler"></SettingParameter>
      </TabPane>
      <TabPane label="模板" name="SettingTemplate">
        <SettingTemplate :id="id"></SettingTemplate>
      </TabPane>
      <TabPane label="其他" name="SettingOther">
        <SettingOther :id="id" :userList="config.userList"></SettingOther>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    SettingParameter: resolve => require(['./setting/setting-parameter'], resolve),
    SettingTemplate: resolve => require(['./setting/setting-template'], resolve),
    SettingOther: resolve => require(['./setting/setting-other'], resolve)
  },
  props: {
    rightWidth: {
      type: Number,
      default: 340
    },
    id: {
      type: Number,
      default: null
    },
    handler: {
      type: String,
      default: null
    },
    config: {
      type: Object,
      default: () => {
        return {};
      }
    },
    defaultTab: {
      type: String,
      default: 'SettingParameter'
    }
  },
  data() {
    return {
      tabValue: 'SettingParameter'
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
  watch: {
    defaultTab: {
      handler(val) {
        if (val) {
          this.tabValue = val;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.tactics-setting {
  height: calc(100vh - 60px);
  padding: @space-xs 0;
}
</style>
