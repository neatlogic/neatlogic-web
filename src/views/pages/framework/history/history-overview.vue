<template>
  <TsContain class="history-overview" border="border">
    <div slot="topLeft">
      <Tabs v-model="activeTab">
        <TabPane
          v-for="tab in tabList"
          :key="tab.value"
          :label="tab.label"
          :name="tab.value"
          @on-click="(val)=>{ activeTab == val }"
        ></TabPane>
      </Tabs>
    </div>
    <template slot="topRight">
      <TsRow>
        <Col :span="6">
          <TimeSelect v-model="timeParams" :clearable="false" />
        </Col>
        <Col :span="18">
          <InputSearcher
            v-model="keyword"
            @change="triggerSearch = true"
          ></InputSearcher>
        </Col>
      </TsRow>
    </template>

    <template slot="content">
      <Component
        :is="activeTab"
        :timeParams="timeParams"
        :keyword="keyword"
        :triggerSearch.sync="triggerSearch"
      />
    </template>
  </TsContain>
</template>

<script>
export default {
  name: 'HistoryOverview',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TimeSelect: resolve => require(['@/resources/components/TimeSelect/TimeSelect'], resolve),
    HistoryMessage: resolve => require(['./history-message'], resolve),
    HistoryNotice: resolve => require(['./history-notice'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  data() {
    return {
      activeTab: this.$route.query.activeTab || 'HistoryMessage',
      tabList: [
        { value: 'HistoryMessage', label: this.$t('page.notify') },
        { value: 'HistoryNotice', label: this.$t('page.sysnotice') }
      ],
      triggerSearch: false,
      keyword: '',
      timeParams: {
        timeRange: 1,
        timeUnit: 'week'
      }
    };
  }
};
</script>

<style lang="less" scoped>
</style>
