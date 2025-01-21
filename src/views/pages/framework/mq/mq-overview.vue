<template>
  <div class="mt-md">
    <TsContain hideHeader>
      <template v-slot:content>
        <Tabs
          v-model="currentTab"
          class="block-tabs"
          :animated="false"
        >
          <TabPane
            v-for="tab in tabList"
            :key="tab.value"
            :label="tab.text"
            :name="tab.value"
          >
            <div class="padding">
              <div v-if="currentTab == 'subscribe'">
                <MqSubscribeList></MqSubscribeList>
              </div>
              <div v-else-if="currentTab == 'topic'">
                <MqTopicList></MqTopicList>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </template>
      <div slot="content" style="padding-top:20px">
        <div v-if="currentTab == 'subscribe'">
          <MqSubscribeList></MqSubscribeList>
        </div>
        <div v-else-if="currentTab == 'topic'">
          <MqTopicList></MqTopicList>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    MqSubscribeList: () => import('./mq-subscribe-list.vue'),
    MqTopicList: () => import('./mq-topic-list.vue')
  },
  props: {},
  data() {
    return {
      currentTab: 'subscribe',
      tabList: [
        { value: 'subscribe', text: this.$t('term.framework.subscibe') },
        { value: 'topic', text: this.$t('term.framework.topic') }
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
</style>
