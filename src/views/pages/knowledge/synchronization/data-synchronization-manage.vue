<template>
  <div class="mt-md">
    <TsContain hideHeader>
      <template v-slot:content>
        <Tabs v-model="currentTab" :animated="false">
          <TabPane :label="$t('term.knowledge.feishu')" name="feishu"></TabPane>
        </Tabs>
        <div>
          <div v-if="currentTab == 'feishu'">
            <FeishuSyncManage></FeishuSyncManage>
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
    FeishuSyncManage: () => import('./feishu/feishu-sync-manage.vue')
  },
  props: {},
  data() {
    return {
      currentTab: 'feishu'
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
