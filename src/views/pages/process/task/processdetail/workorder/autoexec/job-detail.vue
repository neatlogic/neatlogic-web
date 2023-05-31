<template>
  <div v-if="handlerStepInfo">
    <Alert v-if="!$utils.isEmpty(handlerStepInfo.errorList)" type="error">
      <template slot="desc">
        <div v-for="(e,eindex) in handlerStepInfo.errorList" :key="eindex">{{ $t('term.autoexec.targetjoberror',{target: e.jobName}) }}：{{ e.error }}</div>
      </template>
    </Alert>
    <TsTable v-if="handlerStepInfo.jobList && handlerStepInfo.jobList.length > 0" :theadList="theadList" :tbodyList="handlerStepInfo.jobList">
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
    </TsTable>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    Liquid: resolve => require(['@/resources/components/SimpleGraph/Liquid.vue'], resolve)
  },
  props: {
    handlerStepInfo: Object
  },
  data() {
    return {
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
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
