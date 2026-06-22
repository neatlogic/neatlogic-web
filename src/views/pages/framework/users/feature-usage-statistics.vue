<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span v-auth="['ADMIN']" class="action-item">
            <AuditConfig auditName="FEATURE-USAGE-AUDIT" :title="$t('term.framework.loginauditretentionperiod')"></AuditConfig>
          </span>
          <!-- <span class="action-item tsfont-download" @click="exportLoginAudit()">{{ $t('page.export') }}</span> -->
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
        ></TsTable>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'FeatureUsageStatistics',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue')
  },
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
              // 模块变化后，刷新功能下拉框的查询参数，并清空已选功能，避免保留不属于当前模块的功能。
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
            label: '功能',
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
          key: 'moduleGroupName',
          title: '模块'
        },
        {
          key: 'featureName',
          title: '功能名称'
        },
        {
          key: 'usedCount',
          title: '使用次数'
        }
      ],
      tableData: null
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
      // CombineSearcher 的日期控件会返回相对时间或绝对时间，这里统一展开给后端 feature/search 使用。
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
      this.$api.framework.loginaudit.searchFeatureList(this.searchParam).then(res => {
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
