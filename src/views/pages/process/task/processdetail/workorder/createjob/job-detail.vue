<template>
  <div v-if="handlerStepInfo">
    <div v-if="!$utils.isEmpty(handlerStepInfo.errorList)" type="error">
      <TsTable
        :theadList="columnList"
        :tbodyList="handlerStepInfo.errorList"
      >
        <template slot="status" slot-scope="{ row }">
          <div class="text-error">{{ row.status || $t('page.fail') }}</div>
        </template>
        <template slot="action" slot-scope="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-eye" @click="viewError(row)">{{ $t('page.viewtarget',{'target':$t('page.exception')}) }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <TsTable
      v-if="handlerStepInfo.jobList && handlerStepInfo.jobList.length > 0"
      :theadList="theadList"
      :tbodyList="handlerStepInfo.jobList"
      height="200px"
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
    </TsTable>
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
      ],
      columnList: [
        {
          key: 'jobName',
          title: this.$t('page.jobname')
        },
        {
          title: this.$t('page.status'),
          key: 'status'
        },
        {
          key: 'message',
          title: this.$t('term.framework.errorinfo'),
          maxLength: 50
        },
        {
          key: 'action'
        }
      ],
      isMore: false
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
    viewError(row) {
      this.$createDialog({
        title: this.$t('term.framework.errorinfo'),
        content: row.message,
        width: 'medium',
        hasFooter: false,
        maskClose: true
      });
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
<style lang="less" scoped>
.more-btn {
  position: absolute;
  right: 8px;
  top: 0px;
}
.td-div {
  word-break:break-all;
  white-space:break-spaces
}
</style>
