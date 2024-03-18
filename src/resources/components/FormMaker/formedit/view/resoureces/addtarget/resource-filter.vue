
<template>
  <div class="bg-op radius-sm padding">
    <TsFormItem label="过滤器" labelWidth="80">
      <FilterSearch :defaultValue="searchVal" @changeValue="changeValue"></FilterSearch>
      <div v-if="tipText" class="text-tip tips padding-top">{{ tipText }}</div>
    </TsFormItem>
    <template v-if="!loadingShow">
      <TsTable
        ref="table"
        v-bind="tableData"
        height="500"
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
    </template>
  </div>
</template>
<script>
import FilterSearch from './filter-search.vue';
export default {
  name: 'Resourcefilter',
  components: {
    FilterSearch,
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
    
  },
  filters: {
  },
  props: {
    tipText: {
      type: String,
      default: null
    },
    currentValue: Object
  },
  data() {
    return {
      searchVal: {},
      theadList: [
        { title: 'ip', key: 'ip'},
        { title: '端口', key: 'port'},
        { title: '名称', key: 'name'},
        { title: '标签', key: 'tagList', type: 'tag'},
        { title: '环境', key: 'envName'},
        { title: '模型类型', key: 'typeLabel'},
        { title: '模块', key: 'appModuleName'},
        { title: '应用', key: 'appSystemName'},
        { title: '资产状态', key: 'stateName'},
        { title: '网络区域', key: 'networkArea'},
        { title: '所属部门', key: 'bgList', type: 'usercards'},
        { title: '所有者', key: 'ownerList', type: 'usercards'},
        { title: '维护期', key: 'maintenanceWindow'},
        { title: '描述', key: 'description'}
      ],
      tableData: null,
      currentPage: 1,
      pageSize: 10,
      loadingShow: true
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
    save() {
      return this.searchVal;
    },
    searchNodeList(param) {
      this.loadingShow = true;
      let data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize
      };
      if (param) {
        Object.assign(data, param);
      }
      this.$api.common.getNodeList(data).then(res => {
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
      param = Object.assign(param, this.searchVal);
      this.searchNodeList(param);
    },
    changeValue(val) {
      this.searchVal = this.$utils.deepClone(val);
      this.getDataList('currentPage', 1); 
    }
  },
  computed: {},
  watch: {
    currentValue: {
      handler(val) {
        if (!this.$utils.isEmptyObj(val)) {
          let data = this.$utils.deepClone(val);
          this.searchVal = data.filter || {};
        }
        this.searchNodeList(this.searchVal);
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
  display: inline-block;
}
.padding-top{
  padding-top: 8px;
}
</style>
