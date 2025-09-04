
<template>
  <div>
    <TsFormItem v-if="!$utils.isEmpty(preCondition)" :label="'前置过滤器'" labelPosition="left">
      <FilterSearch
        :defaultValue="preCondition"
        :readonly="true"
        :showSearchNumber="3"
      ></FilterSearch>
    </TsFormItem>
    <TsFormItem v-else-if="!$utils.isEmpty(globalPreCondition)" :label="'全局前置过滤器'" labelPosition="left">
      <FilterSearch
        :defaultValue="globalPreCondition"
        :readonly="true"
        :showSearchNumber="3"
      ></FilterSearch>
    </TsFormItem>
    <div class="pb-md">
      <FilterSearch
        :defaultValue="searchVal"
        :defaultSearchValue="defaultSearchValue"
        class="search"
        @changeValue="changeValue"
        @advancedModeSearch="advancedModeSearch"
      ></FilterSearch>
    </div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div v-if="!loadingShow">
      <TsTable
        ref="table"
        v-bind="tableData"
        @changeCurrent="getDataList('currentPage',...arguments)"
        @changePageSize="getDataList('pageSize',...arguments)"
      >
        <template v-slot:appModuleName="{row}">
          <span v-if="row.appModuleName || row.appModuleAbbrName">
            <span v-if="row.appModuleName">{{ row.appModuleName }}</span>
            <span v-if="row.appModuleAbbrName" class="text-tip">({{ row.appModuleAbbrName }})</span>
          </span>
          <span v-else>-</span>
        </template>
        <template v-slot:appSystemName="{row}">
          <span v-if="row.appSystemName || row.appSystemAbbrName">
            <span v-if="row.appSystemName">{{ row.appSystemName }}</span>
            <span v-if="row.appSystemAbbrName" class="text-tip">({{ row.appSystemAbbrName }})</span>
          </span>
          <span v-else>-</span>
        </template>
      </TsTable>
    </div>
  </div>
</template>
<script>
import FilterSearch from '@/views/pages/autoexec/components/common/filter-search.vue';
export default {
  name: '',
  components: {
    FilterSearch,
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  filters: {
  },
  props: {
    config: Object,
    preCondition: Object,
    globalPreCondition: Object //全局前置过滤器
  },
  data() {
    return {
      searchVal: {},
      complexModeSearchValue: {}, // 复杂模式搜索值
      theadList: [
        { title: this.$t('page.ip'), key: 'ip'},
        { title: this.$t('page.port'), key: 'port'},
        { title: this.$t('page.name'), key: 'name'},
        { title: this.$t('page.tag'), key: 'tagList', type: 'tag'},
        { title: this.$t('page.environment'), key: 'envName'},
        { title: this.$t('term.cmdb.citype'), key: 'typeLabel'},
        { title: this.$t('page.module'), key: 'appModuleName'},
        { title: this.$t('page.apply'), key: 'appSystemName'},
        { title: this.$t('term.autoexec.assetstatus'), key: 'stateName'},
        { title: this.$t('page.networkarea'), key: 'networkArea'},
        { title: this.$t('term.autoexec.subordinatedepartment'), key: 'bgList', type: 'usercards'},
        { title: this.$t('page.owner'), key: 'ownerList', type: 'usercards'},
        { title: this.$t('term.autoexec.maintenanceperiod'), key: 'maintenanceWindow'},
        { title: this.$t('page.description'), key: 'description'}
      ],
      tableData: null,
      currentPage: 1,
      pageSize: 10,
      loadingShow: true,
      defaultSearchValue: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchNodeList(param) {
      let data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize
      };
      if (param) {
        Object.assign(data, param);
      }
      this.$api.autoexec.action.getNodeList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.$set(this.tableData, 'theadList', this.theadList);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getDataList(type, value) {
      type == 'pageSize' && (this.pageSize = value);
      let param = {
        currentPage: type == 'currentPage' ? value : this.currentPage,
        pageSize: type == 'pageSize' ? value : this.pageSize
      };
      if (this.complexModeSearchValue && !this.$utils.isEmptyObj(this.complexModeSearchValue)) {
        // 复杂模式搜索
        this.advancedModeSearch({...this.complexModeSearchValue, ...param});
      } else {
        param = Object.assign(param, this.searchVal);
        this.searchNodeList(param);
      }
    },
    changeValue(val) {
      this.complexModeSearchValue = {};
      this.searchVal = this.$utils.deepClone(val);
      this.getDataList('currentPage', 1);
    },
    init() {
      if (this.config && this.config.filter) {
        let defaultSearchValue = this.config.filter;
        this.defaultSearchValue = defaultSearchValue;
        this.searchVal = defaultSearchValue;
        if (defaultSearchValue && defaultSearchValue.hasOwnProperty('conditionGroupList')) {
          this.complexModeSearchValue = this.$utils.deepClone(defaultSearchValue); // 复杂模式值回显搜索
        }
      }
      this.getDataList();
    },
    advancedModeSearch(searchVal) {
      // 复杂模式搜索
      let params = Object.assign({currentPage: 1, pageSize: 10}, searchVal);
      params.cmdbGroupType = this.opType;
      this.complexModeSearchValue = searchVal;
      this.loadingShow = true;
      this.$api.autoexec.action.searchResourceCustomList(params).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.$set(this.tableData, 'theadList', this.theadList);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  computed: {},
  watch: {
    config: {
      handler(val) {
        this.init();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.search{
  width: 80%;
}
</style>
