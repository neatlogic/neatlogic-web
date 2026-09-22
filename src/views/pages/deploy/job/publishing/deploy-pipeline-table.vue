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
      canExpand
      class="inner-table"
      @changeCurrent="(currentPage) => searchJob(currentPage, defaultSearchValue)"
      @changePageSize="changePageSize"
      @updateSort="updateSort"
    >
      <template v-slot:showChildren="{ row }">
        <span v-if="row.parentId == -1" class="text-href">
          <span :class="{ 'tsfont-minus-square': row['showChildren'], 'tsfont-plus-square': !row['showChildren'] }" @click="toggleChildJob(row, defaultSearchValue)"></span>
        </span>
        <span v-else>
          <!-- 勿删，仅为占位符，否则表格会默认显示 true -->
        </span>
      </template>
      <template v-slot:name="{ row }">
        <span
          class="text-href"
          :class="{ 'ml-nm': (!!row.parentId && row.parentId != -1) }"
          @contextmenu="newTab($event, row)"
          @click="toJobDetail(row)"
        ><span v-html="row.name"></span>
        </span>
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
      <template v-slot:expand="{ row }">
        <TsTable
          v-if="row._expand"
          :theadList="childTheadList"
          :tbodyList="row.children || []"
          :fixedHeader="false"
          :showPager="false"
          :showTotal="false"
          :showSizer="false"
          class="job-child-table"
          style="margin-left: 40px;"
        >
          <template v-slot:name="{ row: childRow }">
            <span
              class="text-href"
              @contextmenu="newTab($event, childRow)"
              @click="toJobDetail(childRow)"
            ><span v-html="childRow.name"></span>
            </span>
            <span>
              <Status v-if="childRow.reviewStatus != 'passed'" :statusValue="childRow.reviewStatus" :statusName="childRow.reviewStatusName"></Status>
            </span>
            <Tooltip
              v-if="childRow.warnCount > 0 || childRow.isHasIgnored > 0"
              transfer
              class="stepStatues com-status"
              placement="bottom"
              theme="light"
            >
              <span class="tsfont-warning-o text-warn"></span>
              <template v-slot:content>
                <div>
                  <div v-if="childRow.warnCount > 0">{{ $t('term.autoexec.loghaswarninfo') }}</div>
                  <div v-if="childRow.isHasIgnored > 0">{{ $t('term.deploy.phaseexistignorenode') }}</div>
                </div>
              </template>
            </Tooltip>
          </template>
          <template v-slot:routeName="{ row: childRow }">
            <span v-if="childRow.source == 'batchdeploy'">
              <span>{{ childRow.route && childRow.route.name }}</span>
            </span>
            <span v-else class="text-href" @click="toRoute(childRow)">
              <span>{{ childRow.route && childRow.route.name }}</span>
            </span>
          </template>
          <template v-slot:status="{ row: childRow }">
            <Status :statusValue="childRow.status" :statusName="childRow.statusName" type="text"></Status>
          </template>
          <template v-slot:startTime="{ row: childRow }">
            <div v-if="childRow.startTime" class="fz10">
              <span>{{ childRow.startTime | formatDate }}</span>
              <span class="text-grey ml-xs">{{ $t('page.begin') }}</span>
            </div>
            <div v-if="childRow.endTime" class="fz10">
              <span>{{ childRow.endTime | formatDate }}</span>
              <span class="text-grey ml-xs">{{ $t('page.finish') }}</span>
            </div>
          </template>
          <template v-slot:completionRate="{ row: childRow }">
            <Liquid :percent="childRow.completionRate" :size="7" :config="getConfig(childRow)" />
          </template>
        </TsTable>
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
      timmer: null,
      abortController: null, // 用于取消上一个请求
      defaultTbodyList: [],
      expandIdList: [], // 展开子作业的父节点Id
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
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchJob(1, this.defaultSearchValue);
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.stopPollingSerchJobData();
  },
  destroyed() {},
  methods: {
    async searchJobData(currentPage, searchValue) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      // 创建新的 controller
      const abortController = new AbortController(); // 创建用新的否则取消前一个请求会把当前的请求的也取消
      this.abortController = abortController;
      this.isLoading = true;
      const param = { ...this.searchParam, ...searchValue || {} };
      if (this.$utils.isSame(this.searchParam, this.defaultSearchParam)) {
        this.$emit('updateParam', 'searchParam', this.searchParam);
      }
      try {
        const res = await this.$api.deploy.job.searchJobList({
          ...param
        }, { signal: abortController.signal});
        const { tbodyList = [], ...restParams } = res.Return || {};

        this.defaultTbodyList = [...tbodyList]; // 子作业数据源
        const { keyword = '', hasParent = '' } = searchValue || {};
        const keywordList = keyword ? [keyword] : [];
        const keywordLower = (keyword || '').toLowerCase();
        const isParentMode = hasParent === 'false';
        const isSubMode = hasParent === 'true';
        let resultList = [];
        let highlightList = [];
        if (tbodyList.length == 0) {
          this.jobData = {
            ...(restParams || {}),
            tbodyList: tbodyList
          };
          return false;
        }
        tbodyList.forEach((tbodyItem) => {
          const children = tbodyItem.children || [];
          const id = tbodyItem.id || '';
          const parentItem = {
            ...tbodyItem,
            showChildren: false,
            _expand: false
          };

          resultList.push(parentItem);
          highlightList.push(parentItem);
          
          // 是否有子作业命中关键字
          const hasMatchChild = keywordLower && children.some(child => (child.name || '').toLowerCase().includes(keywordLower));

          // 是否需要展开子作业
          const shouldExpand = isSubMode || (hasMatchChild && this.$utils.isEmpty(hasParent)) || (id && this.expandIdList.includes(id));
          
          if (shouldExpand && children.length) {
            parentItem.showChildren = true;
            parentItem._expand = true;
            highlightList.push(...children);
          }
        });

        let targetList = highlightList.filter(item => item.name);

        if (isParentMode) {
          const parents = targetList.filter(item => item.parentId == -1);
          if (parents.length > 0) {
            targetList = parents;
          }
        } else if (isSubMode) {
          const subs = targetList.filter(item => item.parentId != -1);
          if (subs.length > 0) {
            targetList = subs;
          }
        }
        // 处理关键字高亮
        targetList.forEach(item => {
          item.name = this.$utils.highlightTextByKeywords(item.name, keywordList);
        });
        this.jobData = {
          ...restParams,
          tbodyList: resultList
        };

        // 返回是否需要继续轮询（关键）
        return resultList.length > 0;
      } catch (err) {
        if (err.name === 'CanceledError') {
          console.log(this.$t('term.deploy.postrequestcancelled'));
        }
      } finally {
        this.isLoading = false;
      }
    },
    searchJob(currentPage, searchValue, isAbortRequest = false) {
      this.stopPollingSerchJobData(isAbortRequest); // 防止重复启动

      if (!this.isNeedRefresh) {
        this.searchJobData(currentPage, searchValue);
        return false;
      }
      this.timmer = this.$utils.setInterval(async() => {
        const needContinue = await this.searchJobData(currentPage, searchValue);

        // 没有数据了，自动停
        if (!needContinue) {
          this.stopPollingSerchJobData();
        }
      }, 30 * 1000);
    },
    stopPollingSerchJobData(isAbortRequest = false) {
      if (this.timmer) {
        this.timmer.clear();
        this.timmer = null;
        if (this.abortController && isAbortRequest) {
          this.abortController.abort();
        }
      }
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchJob(1, this.defaultSearchValue);
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
    toggleChildJob(row, searchValue) {
      const { id = '' } = row || {};
      const { keyword } = searchValue || {};
      if (row['showChildren']) {
        this.$set(row, 'showChildren', false);
        this.$set(row, '_expand', false);
        this.expandIdList = this.expandIdList.filter((item) => item.id != id);
      } else {
        if (id) {
          this.expandIdList.push(id);
        }
        const pIndex = this.jobData.tbodyList.findIndex(d => d.id === id);
        const findChildItem = this.defaultTbodyList.find((v) => v.id === id);
        const { children = [] } = findChildItem || {};
        if (pIndex >= 0) {
          this.$set(row, 'showChildren', true);
          this.$set(row, '_expand', children.length > 0);
          children.forEach((item) => {
            if (item.name) {
              item.name = this.$utils.highlightTextByKeywords(item.name, keyword ? [keyword] : []);
            }
          });
        }
      }
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
    }
  },
  filter: {},
  computed: {
    // 子作业表格沿用主表字段，仅移除父作业的展开控制列。
    childTheadList() {
      return this.theadList.filter(item => item.key !== 'showChildren');
    },
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
.job-child-table {
  // 父表固定表头的样式会作用到嵌套表格，这里恢复子表的普通表头。
  ::v-deep .tstable-no-fixedHeader .table-main > thead > tr > th {
    height: auto;
    overflow: visible;
    padding: 9px !important;
    border-bottom: 1px solid var(--dividing-color, #e8e8e8) !important;
    line-height: inherit;

    > * {
      height: auto !important;
      overflow: visible;
      margin-top: initial !important;
      margin-bottom: initial !important;
      border-top: initial !important;
      border-bottom: initial !important;
    }
  }
}
</style>
