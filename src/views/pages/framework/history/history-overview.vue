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
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TimeSelect: () => import('@/resources/components/TimeSelect/TimeSelect'),
    HistoryMessage: () => import('./history-message'),
    HistoryNotice: () => import('./history-notice'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
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
