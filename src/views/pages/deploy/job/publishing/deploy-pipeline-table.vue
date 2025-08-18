<template>
  <div class="job-content">
    <TsTable
      v-bind="jobData"
      :theadList="theadList"
      :loading="isLoading"
      :sortList="sortList"
      :sortOrder="sortOrder"
      :sortMulti="false"
      :fixedHeader="fixedHeader"
      @changeCurrent="searchJob"
      @changePageSize="changePageSize"
      @updateSort="updateSort"
    >
      <template v-slot:showChildren="{ row }">
        <span v-if="row.parentId == -1" class="text-href">
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
          class="text-href"
          :class="{ 'ml-nm': (!!row.parentId && row.parentId != -1) }"
          @contextmenu="newTab($event, row)"
          @click="toJobDetail(row)"
        >{{ row.name }}</span>
        <span>
          <Status v-if="row.reviewStatus != 'passed'" :statusValue="row.reviewStatus" :statusName="row.reviewStatusName"></Status>
        </span>
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
      <!-- <template slot="operationType" slot-scope="{ row }">
              <span class="text-href" @click="toOperationDetail(row)">
                <span>{{ row.operationTypeName }}</span>
                <span v-if="row.operationName">({{ row.operationName }})</span>
              </span>
            </template> -->
      <template slot="routeName" slot-scope="{ row }">
        <span v-if="row.source == 'batchdeploy'">
          <span>{{ row.route && row.route.name }}</span>
        </span>
        <span v-else class="text-href" @click="toRoute(row)">
          <span>{{ row.route && row.route.name }}</span>
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
    isNeedRefresh: {
      type: Boolean,
      default: true
    },
    defaultSearchParam: { type: Object },
    defaultSearchValue: { type: Object },
    sortList: { type: Array },
    sortOrder: { type: Array },
    fixedHeader: { type: Boolean, default: true }
  },
  data() {
    return {
      searchParam: this.defaultSearchParam || {},
      isLoading: false,
      jobData: null,
      jobEndStatusList: ['completed', 'aborted', 'ignored', 'failed'], //终点状态节点列表，非终点状态列表的需要定时刷新。
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
          title: this.$t('page.sourcecategory'),
          key: 'routeName'
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
      ],
      timmer: null
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
  beforeDestroy() {
    this.clearTimmer();
  },
  destroyed() {},
  methods: {
    searchJob(currentPage) {
      this.clearTimmer();
      this.isLoading = true;
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      const param = { ...this.searchParam, ...(this.defaultSearchValue || {}) };
      if (this.$utils.isSame(this.searchParam, this.defaultSearchParam)) {
        this.$emit('updateParam', 'searchParam', this.searchParam);
      }
      this.$api.deploy.job
        .searchJobList(param)
        .then(res => {
          this.jobData = res.Return;
          const idList = [];
          if (this.jobData.tbodyList && this.jobData.tbodyList.length > 0) {
            this.jobData.tbodyList.forEach(element => {
              if (element.source === 'batchdeploy' || element.source === 'deployschedulepipeline') {
                this.$set(element, '#expander', true);
                if (this.defaultSearchValue && this.defaultSearchValue.keyword) { //keyword搜索时，匹配到的父作业也需要将子作业展开
                  this.toggleChildJob(element);
                }
              } else {
                this.$set(element, '#expander', false);
              }
              if (this.isNeedRefresh && !this.jobEndStatusList.includes(element.status)) {
                idList.push(element.id);
              }
            });
            if (this.isNeedRefresh && idList.length > 0) {
              this.timmer = setTimeout(() => {
                this.refresh(idList);
              }, 5000);
            }
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchJob(1);
    },
    updateSort(sort) {
      this.sortOrder = [];
      this.sortOrder.push(sort);
      this.$addHistoryData('sortOrder', this.sortOrder);
      this.$emit('updateParam', 'sortOrder', this.sortOrder);
      for (let key in sort) {
        this.$set(this.searchParam, 'sortOrder', {'key': key, 'type': sort[key]});
      }
      this.searchJob();
    },
    toggleChildJob(row) {
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
    newTab(e, row) {
      //鼠标右键打开新标签页
      let base = this.$router.options.base;
      let params = '';
      let redirectPage = 'job-detail';

      if (row && row.id) {
        params = `?id=${row.id}`;
      }
      if (row.source === 'batchdeploy' || row.source === 'deployschedulepipeline') {
        redirectPage = 'batch-job-detail';
      }
      let replaceStr = `<a href="${base}#${redirectPage}${params}" class="cursor">${row.name}</a>`;
      e.currentTarget.innerHTML = replaceStr;
    },
    toJobDetail(row) {
      if (row.source === 'batchdeploy' || row.source === 'deployschedulepipeline') {
        const {parentId = ''} = row || {};
        if (parentId != -1) {
          this.$router.push({
            path: '/job-detail',
            query: { id: row.id }
          });
        } else {
          this.$router.push({
            path: '/batch-job-detail',
            query: { id: row.id }
          });
        }
      } else {
        this.$router.push({
          path: '/job-detail',
          query: { id: row.id }
        });
      }
    },
    toRoute(row) {
      let routeConfig = row.route?.config;
      if (routeConfig == null) {
        return;
      }
      if (row.source == 'deploy') {
        window.open(HOME + '/deploy.html#/application-config-pipeline-detail?appSystemId=' + routeConfig.appSystemId, '_blank');
      } else if (row.source == 'batchdeploy') {
        return;
      } else if (row.source == 'deployschedulegeneral' || row.source == 'deployschedulepipeline') {
        window.open(HOME + '/deploy.html#/schedule-job-edit?id=' + routeConfig.id, '_blank');
      } else if (row.source == 'deployci' || row.source == 'deploycipipeline') {
        window.open(HOME + '/deploy.html#/config-add?appSystemId=' + routeConfig.appSystemId + '&id=' + routeConfig.id, '_blank');
      }
    },
    refresh(idList) {
      this.clearTimmer();
      this.$api.deploy.job.searchJobList({ needPage: false, idList: idList }).then(res => {
        const jobList = res.Return.tbodyList;
        const newIdList = [];
        if (jobList && jobList.length > 0 && this.jobData.tbodyList && this.jobData.tbodyList.length > 0) {
          jobList.forEach(job => {
            const element = this.jobData.tbodyList.find(d => d.id === job.id);
            if (element) {
              this.$set(element, 'status', job.status);
              this.$set(element, 'statusName', job.statusName);
            }
          });
          this.jobData.tbodyList.forEach(job => {
            if (!this.jobEndStatusList.includes(job.status)) {
              newIdList.push(job.id);
            }
          });
          if (newIdList.length > 0) {
            this.timmer = setTimeout(() => {
              this.refresh(newIdList);
            }, 5000);
          }
        }
      });
    },
    clearTimmer() {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
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
.job-content {
  position: relative;
}
</style>
