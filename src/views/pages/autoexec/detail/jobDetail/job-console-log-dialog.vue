<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <TsContain :hideHeader="true" :hasContentPadding="false">
      <template v-slot:sider>
        <div class="radius-md mr-md">
          <ul>
            <li
              v-for="(runner, index) in runnerList"
              :key="index"
              class="text-action radius-sm padding overflow mb-nm"
              :class="{ 'bg-grey-select': currentRunner == runner }"
              @click="selectRunner(runner)"
            >
              <div>{{ runner.name }}</div>
              <div>{{ runner.host + ':' + runner.port }}</div>
            </li>
          </ul>
        </div>
      </template>
      <template v-slot:content>
        <Tabs
          v-model="tabValue"
          class="block-tabs"
          :animated="false"
          name="tab"
        >
          <TabPane
            :label="$t('term.autoexec.standardoutput')"
            name="consoleLog"
            class="tab-content"
            tab="tab"
          >
            <div v-if="isReady && currentRunner && tabValue == 'consoleLog'" class="padding">
              <ConsoleLog
                ref="consoleLog"
                :jobData="jobData"
                :runnerData="currentRunner"
                mode="dialog"
              ></ConsoleLog>
            </div>
          </TabPane>
          <TabPane
            :label="$t('term.autoexec.runrecord')"
            name="record"
            class="tab-content"
            tab="tab"
          >
            <div class="padding">
              <ConsoleRecords v-if="isReady && currentRunner && tabValue == 'record'" :jobData="jobData" :runnerData="currentRunner"></ConsoleRecords>
            </div>
          </TabPane>
        </Tabs>
      </template>
    </TsContain>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    ConsoleLog: () => import('@/views/pages/autoexec/detail/logcomponents/job-log.vue'),
    ConsoleRecords: () => import('./console-records.vue')
  },
  props: {
    jobData: { type: Object }
  },
  data() {
    return {
      dialogConfig: {
        type: 'slider',
        maskClose: true,
        isShow: true,
        width: 'large',
        title: this.$t('term.autoexec.controlpanel'),
        hasFooter: false
      },
      isReady: true, //刷新后用于重置组件，让组件可以重新开始所有刷新
      runnerList: [],
      tabValue: 'consoleLog',
      currentRunner: null
    };
  },
  beforeCreate() {},
  created() {
    this.getJobRunner();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    selectRunner(runner) {
      if (this.currentRunner !== runner) {
        this.isReady = false;
        this.currentRunner = runner;
        this.$nextTick(() => {
          this.isReady = true;
        });
      }
    },
    getJobRunner() {
      this.$api.autoexec.job.getJobRunner(this.jobData.id).then(res => {
        this.runnerList = res.Return;
        if (this.runnerList && this.runnerList.length > 0) {
          this.currentRunner = this.runnerList[0];
        }
      });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
