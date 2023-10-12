<template>
  <div class="notifyconfig-manage">
    <TsContain hideHeader>
      <template v-slot:content>
        <Tabs v-model="currentTab" class="block-tabs" :animated="false">
          <TabPane :label="$t('page.mail')" name="mail">
            <div v-if="currentTab == 'mail'" class="padding">
              <MailServerEdit></MailServerEdit>
            </div>
          </TabPane>
          <TabPane :label="$t('page.wechat')" name="wechat">
            <div v-if="currentTab == 'wechat'" class="padding">
              <WechatEdit></WechatEdit>
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
      currentTab: 'mail'
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
