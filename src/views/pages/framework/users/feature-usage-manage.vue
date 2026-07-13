<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span v-auth="['ADMIN']" class="action-item">
            <AuditConfig auditName="FEATURE-USAGE-AUDIT" :title="$t('term.framework.loginauditretentionperiod')"></AuditConfig>
          </span>
          <span class="action-item tsfont-download" @click="exportFeatureUsageAudit()">{{ $t('page.export') }}</span>
          <span class="action-item tsfont-chart" @click="openFeatureUsageStatisticsDialog()">{{ $t('page.statistics') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <div class="login-search">
          <CombineSearcher
            v-model="searchValue"
            v-bind="searchConfig"
            @change="changePage(1)"
          ></CombineSearcher>
        </div>
      </template>
      <div slot="content">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          :theadList="theadList"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template v-slot:userUuid="{ row }">
            <UserCard :uuid="row.userUuid" :hideAvatar="false"></UserCard>
          </template>
          <template v-slot:duration="{ row }">
            <span v-if="row.duration != null">
              {{ row.duration | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'millisecond' }) }}
            </span>
            <span v-else>-</span>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <FeatureUsageStatisticsDialog
      v-if="isShowFeatureUsageStatisticsDialog"
      :searchParam="statisticsSearchParam"
      @close="closeFeatureUsageStatisticsDialog"
    ></FeatureUsageStatisticsDialog>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';

export default {
  name: 'FeatureUsageManage',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    FeatureUsageStatisticsDialog: () => import('./feature-usage-statistics-dialog.vue')
  },
  mixins: [download],
  data() {
    return {
      searchValue: {
        // 默认查询近一天的功能使用统计，避免首次进入页面查询范围过大。
        dateRange: {
          timeRange: 1,
          timeUnit: 'day',
          startTime: null,
          endTime: null
        },
        moduleGroupList: [],
        featureNameList: []
      },
      searchConfig: {
        labelPosition: 'left',
        search: true,
        placeholder: this.$t('form.placeholder.pleaseinput', { target: this.$t('page.keyword') }),
        searchList: [
          {
            type: 'userselect',
            name: 'userUuid',
            label: this.$t('page.user'),
            groupList: ['user'],
            transfer: true,
            multiple: false
          },
          {
            type: 'select',
            name: 'moduleGroupList',
            label: this.$t('page.module'),
            multiple: true,
            search: true,
            url: '/api/rest/module/search',
            textName: 'groupName',
            valueName: 'group',
            transfer: true,
            onChange: moduleGroupList => {
              // 模块变化后刷新功能下拉的查询参数，并清空已选功能，避免条件不一致。
              const featureConfig = this.searchConfig.searchList.find(item => item.name == 'featureNameList');
              if (featureConfig) {
                featureConfig.params.moduleGroupList = moduleGroupList || [];
              }
              if (this.searchValue && this.searchValue.featureNameList) {
                this.$delete(this.searchValue, 'featureNameList');
              }
            }
          },
          {
            type: 'select',
            name: 'featureNameList',
            label: this.$t('page.feature'),
            multiple: true,
            search: true,
            dynamicUrl: '/api/rest/feature/search',
            params: { moduleGroupList: [], needPage: false },
            rootName: 'tbodyList',
            textName: 'featureName',
            valueName: 'featureName',
            transfer: true,
            dealDataByUrl: nodeList => this.getFeatureSelectList(nodeList)
          },
          {
            type: 'timeselect',
            name: 'dateRange',
            label: this.$t('page.date'),
            transfer: true,
            clearable: false
          }
        ]
      },
      searchParam: {
        keyword: '',
        userUuid: null,
        currentPage: 1,
        pageSize: 20,
        timeRange: null,
        timeUnit: '',
        startTime: null,
        endTime: null,
        moduleGroupList: [],
        featureNameList: []
      },
      theadList: [
        {
          key: 'userUuid',
          title: this.$t('page.user')
        },
        {
          key: 'moduleGroupName',
          title: this.$t('page.module')
        },
        {
          key: 'featureName',
          title: this.$t('page.feature')
        },
        {
          key: 'startTime',
          title: this.$t('page.starttime'),
          type: 'time'
        },
        {
          key: 'endTime',
          title: this.$t('page.endtime'),
          type: 'time'
        },
        {
          key: 'duration',
          title: this.$t('page.duration')
        }
      ],
      tableData: null,
      isShowFeatureUsageStatisticsDialog: false,
      statisticsSearchParam: null
    };
  },
  mounted() {
    this.searchFeatureList();
  },
  methods: {
    getSearchParam() {
      const {
        keyword = '',
        userUuid = null,
        dateRange = null,
        moduleGroupList = [],
        featureNameList = []
      } = this.searchValue || {};
      // CombineSearcher 的日期控件会返回相对时间或绝对时间，这里统一展开给后端使用。
      return {
        keyword,
        userUuid,
        timeRange: dateRange ? dateRange.timeRange : null,
        timeUnit: dateRange ? dateRange.timeUnit : null,
        startTime: dateRange ? dateRange.startTime : null,
        endTime: dateRange ? dateRange.endTime : null,
        moduleGroupList: moduleGroupList || [],
        featureNameList: featureNameList || []
      };
    },
    searchFeatureList() {
      this.searchParam = {
        ...this.searchParam,
        ...this.getSearchParam()
      };
      this.$api.framework.loginaudit.searchFeatureUsageAuditList(this.searchParam).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
        }
      });
    },
    changePage(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.searchFeatureList();
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchParam.currentPage = 1;
      this.searchFeatureList();
    },
    exportFeatureUsageAudit() {
      // 导出复用当前页面搜索条件，保证导出结果与列表筛选一致。
      this.download({
        url: 'api/binary/feature/usage/audit/export',
        params: this.getSearchParam()
      });
    },
    openFeatureUsageStatisticsDialog() {
      // 统计弹框复用当前页面搜索条件，确保统计口径与列表筛选一致。
      this.statisticsSearchParam = {
        ...this.getSearchParam(),
        currentPage: 1,
        pageSize: 20
      };
      this.isShowFeatureUsageStatisticsDialog = true;
    },
    closeFeatureUsageStatisticsDialog() {
      this.isShowFeatureUsageStatisticsDialog = false;
      this.statisticsSearchParam = null;
    },
    getFeatureSelectList(nodeList) {
      // 功能统计按模块+功能聚合，同名功能可能来自多个模块；下拉框里按功能名去重展示。
      const featureNameSet = new Set();
      const featureList = [];
      (nodeList || []).forEach(item => {
        if (item && item.featureName && !featureNameSet.has(item.featureName)) {
          featureNameSet.add(item.featureName);
          featureList.push(item);
        }
      });
      return featureList;
    }
  }
};
</script>
<style lang="less" scoped>
.login-search {
  width: 100%;
  min-width: 280px;
}
</style>
