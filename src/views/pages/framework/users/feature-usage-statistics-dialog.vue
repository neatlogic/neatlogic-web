<template>
  <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
    <template v-slot>
      <TsTable
        v-if="tableData"
        v-bind="tableData"
        :theadList="theadList"
        @changeCurrent="changePage"
        @changePageSize="changePageSize"
      >
        <template v-slot:duration="{ row }">
          <span v-if="row.duration != null">
            {{ row.duration | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'millisecond' }) }}
          </span>
          <span v-else>-</span>
        </template>
      </TsTable>
    </template>
    <template v-slot:footer>
      <Button type="primary" @click="exportFeatureUsageAudit">{{ $t('page.export') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  mixins: [download],
  props: {
    searchParam: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      // searchValue: {
      //   // 默认查询近一天的功能使用统计，避免首次进入页面查询范围过大。
      //   dateRange: {
      //     timeRange: 1,
      //     timeUnit: 'day',
      //     startTime: null,
      //     endTime: null
      //   },
      //   moduleGroupList: [],
      //   featureNameList: []
      // },
      // searchConfig: {
      //   search: true,
      //   placeholder: this.$t('form.placeholder.pleaseinput', { target: this.$t('page.keyword') }),
      //   searchList: [
      //     {
      //       type: 'userselect',
      //       name: 'userUuid',
      //       label: this.$t('page.user'),
      //       groupList: ['user'],
      //       transfer: true,
      //       multiple: false
      //     },
      //     {
      //       type: 'select',
      //       name: 'moduleGroupList',
      //       label: this.$t('page.module'),
      //       multiple: true,
      //       search: true,
      //       url: '/api/rest/module/search',
      //       textName: 'groupName',
      //       valueName: 'group',
      //       transfer: true,
      //       onChange: moduleGroupList => {
      //         // 模块变化后刷新功能下拉的查询参数，并清空已选功能，避免条件不一致。
      //         const featureConfig = this.searchConfig.searchList.find(item => item.name == 'featureNameList');
      //         if (featureConfig) {
      //           featureConfig.params.moduleGroupList = moduleGroupList || [];
      //         }
      //         if (this.searchValue && this.searchValue.featureNameList) {
      //           this.$delete(this.searchValue, 'featureNameList');
      //         }
      //       }
      //     },
      //     {
      //       type: 'select',
      //       name: 'featureNameList',
      //       label: '功能',
      //       multiple: true,
      //       search: true,
      //       dynamicUrl: '/api/rest/feature/search',
      //       params: { moduleGroupList: [], needPage: false },
      //       rootName: 'tbodyList',
      //       textName: 'featureName',
      //       valueName: 'featureName',
      //       transfer: true,
      //       dealDataByUrl: nodeList => this.getFeatureSelectList(nodeList)
      //     },
      //     {
      //       type: 'timeselect',
      //       name: 'dateRange',
      //       label: this.$t('page.date'),
      //       transfer: true,
      //       clearable: false
      //     }
      //   ]
      // },
      // searchParam: {
      //   keyword: '',
      //   userUuid: null,
      //   currentPage: 1,
      //   pageSize: 20,
      //   timeRange: null,
      //   timeUnit: '',
      //   startTime: null,
      //   endTime: null,
      //   moduleGroupList: [],
      //   featureNameList: []
      // },
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: '统计',
        width: 'large',
        hasFooter: true,
        maskClose: true
      },
      localSearchParam: {
        currentPage: 1,
        pageSize: 20
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
          key: 'duration',
          title: '使用时长'
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
    this.localSearchParam = {
      currentPage: 1,
      pageSize: 20,
      ...(this.searchParam || {})
    };
    this.searchFeatureList();
  },
  methods: {
    // getSearchParam() {
    //   const {
    //     keyword = '',
    //     userUuid = null,
    //     dateRange = null,
    //     moduleGroupList = [],
    //     featureNameList = []
    //   } = this.searchValue || {};
    //   // CombineSearcher 的日期控件会返回相对时间或绝对时间，这里统一展开给后端使用。
    //   return {
    //     keyword,
    //     userUuid,
    //     timeRange: dateRange ? dateRange.timeRange : null,
    //     timeUnit: dateRange ? dateRange.timeUnit : null,
    //     startTime: dateRange ? dateRange.startTime : null,
    //     endTime: dateRange ? dateRange.endTime : null,
    //     moduleGroupList: moduleGroupList || [],
    //     featureNameList: featureNameList || []
    //   };
    // },
    closeDialog() {
      this.$emit('close');
    },
    searchFeatureList() {
      // this.searchParam = {
      //   ...this.searchParam,
      //   ...this.getSearchParam()
      // };
      this.$api.framework.loginaudit.searchFeatureList(this.localSearchParam).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
        }
      });
    },
    changePage(currentPage) {
      if (currentPage) {
        this.localSearchParam.currentPage = currentPage;
      } else {
        this.localSearchParam.currentPage = 1;
      }
      this.searchFeatureList();
    },
    changePageSize(pageSize) {
      this.localSearchParam.pageSize = pageSize;
      this.localSearchParam.currentPage = 1;
      this.searchFeatureList();
    },
    exportFeatureUsageAudit() {
      // 导出复用当前页面搜索条件，保证导出结果与列表筛选一致。
      this.download({
        url: 'api/binary/feature/usage/audit/export',
        params: this.localSearchParam
      });
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
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.login-search {
  width: 100%;
  min-width: 280px;
}
</style>
