<template>
  <div>
    <div v-if="currenthandlerStepInfo">
      <Alert v-if="!$utils.isEmpty(currenthandlerStepInfo.errorList)" type="error">
        <template slot="desc">
          <div v-for="(e,eindex) in currenthandlerStepInfo.errorList" :key="eindex">
            {{ $t('term.autoexec.targetjoberror',{target: e.jobName}) }}：{{ e.error.length > 500 && !e.isMore? e.error.slice(0,500) : e.error }}
            <span v-if="e.error.length > 500" class="text-href pl-sm" @click="viewDetail(e)">{{ !e.isMore?$t('page.viewmore'):$t('page.packup') }}</span>
          </div>
        </template>
      </Alert>
      <div v-if="canShowTable" class="mb-sm">
        {{ $t('term.process.totaljobnumtarget', {target: currenthandlerStepInfo.jobList.length}) }} ，
        <span class="text-info">{{ $t('term.process.runningcounttarget', {target: runningCount}) }}</span>，
        <span class="text-success">{{ $t('term.process.completedcounttarget', {target: completedCount}) }}</span>，
        <span class="text-danger">{{ $t('term.process.failedcounttarget', {target: failedCount}) }}</span>
      </div>
      <TsTable
        v-if="canShowTable"
        :loading="loadingShow"
        :theadList="theadList"
        :tbodyList="currenthandlerStepInfo.jobList"
      >
        <template slot="name" slot-scope="{ row }">
          <span class="text-href" @click="gotoJopDetail(row)">
            {{ row.name }}
          </span>
        </template>
        <template slot="status" slot-scope="{ row }">
          <Status :statusValue="row.status" :statusName="row.statusName" type="text"></Status>
        </template>
        <template v-slot:startTime="{ row }">
          <div v-if="row.startTime" class="fz10">
            <span>{{ row.startTime | formatDate }}</span>
            <span class="text-grey ml-xs">{{ $t('page.begin') }}</span>
          </div>
          <div v-if="row.endTime" class="fz10">
            <span>{{ row.endTime | formatDate }}</span>
            <span class="text-grey ml-xs">{{ $t('page.finish') }}</span>
          </div>
        </template>
        <template slot="completionRate" slot-scope="{ row }">
          <Liquid :percent="row.completionRate" :size="7" :config="getConfig(row)" />
        </template>
        <template slot="costTime" slot-scope="{ row }">
          <span>{{ !$utils.isEmpty(row.costTime) && row.costTime.indexOf('-') != -1 ? '' : row['costTime'] }}</span>
        </template>
      </TsTable>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    Status: () => import('@/resources/components/Status/CommonStatus.vue'),
    Liquid: () => import('@/resources/components/SimpleGraph/Liquid.vue')
  },
  inject: ['processTaskData'],
  props: {
    handlerStepInfo: Object
  },
  data() {
    return {
      currenthandlerStepInfo: this.handlerStepInfo,
      intervalId: null,
      loadingShow: false,
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.status'),
          key: 'status'
        },
        {
          title: this.$t('page.timecost'),
          key: 'costTime'
        },
        {
          title: this.$t('page.startstoptime'),
          key: 'startTime',
          keyend: 'endTime'
        },
        {
          title: this.$t('term.autoexec.executionsituation'),
          key: 'completionRate'
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
  methods: {
    gotoJopDetail(job) { //查看作业
      window.open(HOME + '/autoexec.html#/job-detail?id=' + job.id, '_blank');
    },
    viewDetail(e) {
      this.$set(e, 'isMore', !e.isMore);
    },
    getTaskStepInfo() {
      let {processTaskId = '', processTaskStepId = ''} = this.taskData || {};
      const data = {
        processTaskId: processTaskId,
        processTaskStepId: processTaskStepId
      };
      this.$api.process.processtask.getTaskMessage(data)
        .then(res => {
          if (res.Status === 'OK') {
            const { processTask = {} } = res.Return || {};
            const { currentProcessTaskStep = {}} = processTask;
            const {handlerStepInfo = null} = currentProcessTaskStep;
            this.currenthandlerStepInfo = handlerStepInfo;
            this.intervalRefreshData(handlerStepInfo);
          }
        });
    },
    intervalRefreshData(handlerStepInfo) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      if (!this.$utils.isEmpty(handlerStepInfo) && handlerStepInfo.jobList && handlerStepInfo.jobList.length > 0 && handlerStepInfo.jobList.some(job => job.status === 'running' || job.status === 'pending')) {
        this.intervalId = setInterval(this.getTaskStepInfo, 15 * 1000);
      } else {
        this.clearIntervalIfSet(); // 清除定时器
      }
    },
    clearIntervalIfSet() {
      this.loadingShow = false;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.loadingShow = false;
      }
      setTimeout(() => {
        // 当this.loadingShow为false后，将在三秒后自动刷新当前路由，以避免同时进行的刷新带来的不佳体验。
        // this.$store.commit('setAutoexecJobListData', true);
      }, 2 * 1000);
    }
  },
  filter: {},
  computed: {
    getConfig() {
      return row => {
        let config = {};
        config.status = row.status;
        row.status == 'running' ? (config.status = 'active') : row.status == 'error' ? (config.status = 'wrong') : '';
        return config;
      };
    },
    taskData() {
      return this.processTaskData();
    },
    canShowTable() {
      return !!(this.currenthandlerStepInfo.jobList && this.currenthandlerStepInfo.jobList.length > 0);
    },
    completedCount() {
      if (this.canShowTable) {
        let completedCount = this.currenthandlerStepInfo.jobList.filter(v => v.status == 'completed').length;
        return completedCount; 
      } 
      return 0;
    },
    runningCount() {
      if (this.canShowTable) {
        let runningCount = this.currenthandlerStepInfo.jobList.filter(v => v.status == 'running').length;
        return runningCount; 
      } 
      return 0;
    },
    failedCount() {
      if (this.canShowTable) {
        let failedCount = this.currenthandlerStepInfo.jobList.filter(v => v.status == 'failed').length;
        return failedCount; 
      } 
      return 0;
    }
  },
  watch: {
    handlerStepInfo: {
      handler(val) {
        this.currenthandlerStepInfo = val;
        if (!this.$utils.isEmpty(this.currenthandlerStepInfo)) {
          if (this.canShowTable && this.currenthandlerStepInfo.jobList.some((v) => v.status == 'running' || v.status == 'pending')) {
            setTimeout(() => {
              this.loadingShow = true;
              this.getTaskStepInfo();
            }, 5 * 1000);
          }
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
