<template>
  <div>
    <TsContain>
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
        }
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
        endTime: null
      },
      theadList: [
        {
          key: 'moduleGroup',
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
      const { keyword = '', userUuid = null, dateRange = null } = this.searchValue || {};
      // CombineSearcher 的日期控件会返回相对时间或绝对时间，这里统一展开给后端 feature/search 使用。
      return {
        keyword,
        userUuid,
        timeRange: dateRange ? dateRange.timeRange : null,
        timeUnit: dateRange ? dateRange.timeUnit : null,
        startTime: dateRange ? dateRange.startTime : null,
        endTime: dateRange ? dateRange.endTime : null
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
