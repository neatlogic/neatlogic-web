<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <div class="mb-nm">
            <TsRow>
              <Col :span="12"></Col>
              <Col :span="12"><CombineSearcher v-model="searchValue" v-bind="searchConfig" @change="searchJob(1)"></CombineSearcher>
              </Col>
            </TsRow>
          </div>
          <div>
            <TsTable
              :theadList="theadList"
              v-bind="jobData"
              :loading="isLoading"
              @changeCurrent="searchJob"
              @changePageSize="changePageSize"
            >
              <template v-slot:showChildren="{ row }">
                <span v-if="row.source === 'batchdeploy' || row.source === 'deployschedulepipeline'" class="text-href">
                  <span v-if="!row.loading" :class="{ 'tsfont-minus-square': row['showChildren'], 'tsfont-plus-square': !row['showChildren'] }" @click="toggleChildJob(row)"></span>
                  <Icon
                    v-else
                    type="ios-loading"
                    size="16"
                    class="loading"
                  ></Icon>
                </span>
              </template>
              <template v-slot:name="{ row }">
                <span
                  v-if="row.source === 'deploy' || row.source === 'deployschedulegeneral'"
                  class="text-href"
                  :class="{ 'ml-nm': !!row.parentId }"
                  @click="toJobDetail(row)"
                >{{ row.name }}</span>
                <span v-else-if="row.source === 'batchdeploy' || row.source === 'deployschedulepipeline'" class="text-href" @click="toBatchJobDetail(row)">
                  {{ row.name }}
                </span>
                <span><Status v-if="row.reviewStatus != 'passed'" :statusValue="row.reviewStatus" :statusName="row.reviewStatusName"></Status></span>
                <Tooltip
                  v-if="row.warnCount > 0 || row.isHasIgnored > 0"
                  transfer
                  class="stepStatues com-status"
                  placement="bottom"
                  theme="light"
                >
                  <span class="tsfont-warning-o text-warn"></span>
                  <template v-slot:content>
                    <div>
                      <div v-if="row.warnCount > 0">{{ $t('term.autoexec.loghaswarninfo') }}</div>
                      <div v-if="row.isHasIgnored > 0">{{ $t('term.deploy.phaseexistignorenode') }}</div>
                    </div>
                  </template>
                </Tooltip>
              </template>
              <template slot="operationType" slot-scope="{ row }">
                <span class="text-href" @click="toOperationDetail(row)">
                  <span>{{ row.operationTypeName }}</span>
                  <span v-if="row.operationName">({{ row.operationName }})</span>
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
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    Liquid: resolve => require(['@/resources/components/SimpleGraph/Liquid.vue'], resolve),
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve)
  },
  props: {
    id: { type: Number },
    invokeIdList: Array //定时作业引用id
  },
  data() {
    return {
      isLoading: false,
      jobData: {},
      searchValue: {},
      searchConfig: { search: true,
        labelPosition: 'top',
        searchList: [
          {
            type: 'select',
            name: 'envId',
            label: this.$t('page.environment'),
            url: '/api/rest/resourcecenter/appenv/list/forselect',
            params: { needPage: false },
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true
          },
          {
            type: 'daterange',
            name: 'startTimeRange',
            label: this.$t('term.autoexec.executiontime'),
            format: 'yyyy-MM-dd',
            transfer: true,
            placeholder: this.$t('term.deploy.pleaseselecttimeperiod')
          },
          {
            type: 'userselect',
            name: 'execUserList',
            label: this.$t('term.deploy.executor'),
            groupList: ['user'],
            multiple: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'statusList',
            label: this.$t('page.jobstatus'),
            multiple: true,
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'JobStatus' },
            transfer: true
          }
        ]
      },
      searchParam: {pipelineId: this.id, invokeIdList: this.invokeIdList},
      dialogConfig: {
        title: this.$t('term.deploy.joblist'),
        type: 'slider',
        maskClose: true,
        isShow: true,
        width: 'large',
        hasFooter: false
      },
      theadList: [
        { key: 'showChildren' },
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.scene'),
          key: 'scenarioName'
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
          title: this.$t('page.executeuser'),
          key: 'execUserVo',
          type: 'user',
          uuid: 'uuid'
        },
        {
          title: this.$t('page.source'),
          key: 'sourceName'
        },
        {
          title: this.$t('page.plantime'),
          key: 'planStartTime',
          type: 'time'
        },
        {
          title: this.$t('page.startstoptime'),
          key: 'startTime',
          keyend: 'endTime'
        },
        {
          title: this.$t('term.autoexec.triggertype'),
          key: 'triggerTypeName'
        },
        {
          title: this.$t('term.autoexec.executionsituation'),
          key: 'completionRate'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchJob(1);
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
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchJob(1);
    },
    toggleChildJob(row, isShow) {
      if (row['showChildren']) {
        this.$set(row, 'showChildren', false);
        for (let i = this.jobData.tbodyList.length - 1; i >= 0; i--) {
          const element = this.jobData.tbodyList[i];
          if (element.parentId === row.id) {
            this.jobData.tbodyList.splice(i, 1);
          }
        }
      } else {
        this.getChildrenJob(row);
      }
    },
    getChildrenJob(parentRow) {
      this.$set(parentRow, 'loading', true);
      this.$api.deploy.job.searchJobList({ parentId: parentRow.id }).then(res => {
        const jobList = res.Return.tbodyList;
        if (jobList && jobList.length > 0) {
          const pIndex = this.jobData.tbodyList.findIndex(d => d === parentRow);
          if (pIndex >= 0) {
            this.$set(parentRow, 'showChildren', true);
            this.$set(parentRow, 'loading', false);
            this.jobData.tbodyList.splice(pIndex + 1, 0, ...jobList);
          }
        }
      });
    },
    searchJob(currentPage) {
      this.isLoading = true;
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      const param = { ...this.searchParam, ...this.searchValue };
      this.$api.deploy.job
        .searchJobList(param)
        .then(res => {
          this.jobData = res.Return;
          if (this.jobData.tbodyList && this.jobData.tbodyList.length > 0) {
            this.jobData.tbodyList.forEach(element => {
              if (element.source === 'batchdeploy' || element.source === 'deployschedulepipeline') {
                this.$set(element, '_expander', true);
              } else {
                this.$set(element, '_expander', false);
              }
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    close() {
      this.$emit('close');
    },
    toJobDetail(row) {
      this.$router.push({
        path: '/job-detail',
        query: { id: row.id }
      });
    },
    toBatchJobDetail(row) {
      if (row && row.id) {
        this.$router.push({
          path: '/batch-job-detail',
          query: { id: row.id }
        });
      }
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
</style>
