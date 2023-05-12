<template>
  <div class="mq-overview">
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
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    MqSubscribeList: resolve => require(['./mq-subscribe-list.vue'], resolve),
    MqTopicList: resolve => require(['./mq-topic-list.vue'], resolve)
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
@import (reference) '~@/resources/assets/css/variable.less';
.mq-overview {
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
