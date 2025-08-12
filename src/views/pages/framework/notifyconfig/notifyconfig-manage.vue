<template>
  <div class="mt-md">
    <TsContain hideHeader>
      <template v-slot:content>
        <Tabs v-model="currentTab" :animated="false">
          <TabPane :label="$t('page.mail')" name="mail"></TabPane>
          <TabPane :label="$t('page.wechat')" name="wechat"></TabPane>
        </Tabs>
        <div>
          <div v-if="currentTab == 'mail'">
            <MailServerManage></MailServerManage>
          </div>
          <div v-if="currentTab == 'wechat'">
            <WechatEdit></WechatEdit>
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
    TsContain: () => import('@/resources/components/TsContain/TsContain.vue'),
    MailServerManage: () => import('./mailserver-manage.vue'),
    WechatEdit: () => import('./wechat-edit.vue')
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
