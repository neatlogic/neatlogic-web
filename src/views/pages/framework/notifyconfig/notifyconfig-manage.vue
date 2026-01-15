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
<style lang="less" scoped>
</style>
