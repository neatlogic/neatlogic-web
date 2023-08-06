<template>
  <div class="notifyconfig-manage">
    <TsContain hideHeader>
      <template v-slot:content>
        <Tabs v-model="currentTab" class="block-tabs" :animated="false">
          <TabPane 
            v-for="tab in tabList" 
            :key="tab.value" 
            :label="tab.text"
            :name="tab.value"
          >
            <div class="padding">
              <div v-if="currentTab == 'mail'">
                <MailServerEdit></MailServerEdit>
              </div>
              <div v-if="currentTab == 'wechat'">
                <WechatEdit></WechatEdit>
              </div>
            </div>
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
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    MailServerEdit: resolve => require(['./mailserver-edit.vue'], resolve),
    WechatEdit: resolve => require(['./wechat-edit.vue'], resolve)
  },
  props: {},
  data() {
    return {
      currentTab: 'mail',
      tabList: [
        {
          value: 'mail',
          text: '邮件'
        },
        {
          value: 'wechat',
          text: '企业微信'
        }
      ]
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
@import (reference) '~@/resources/assets/css/variable.less';
.notifyconfig-manage {
  padding-top: 16px;
  .order-tabs-title {
    width: 100%;
    height: 56px;
    line-height: 54px;
    // border-bottom: 1px solid;
    li {
      display: inline-block;
      text-align: center;
      padding: 0 16px;
      cursor: pointer;
      &.active {
        border-bottom: 2px solid;
        .title-box {
          display: inline-block;
        }
      }
    }
  }
}
</style>
