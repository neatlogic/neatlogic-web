
<template>
  <div class="radius-sm padding" :class="{'bg-op':bgOp}">
    <template v-if="readonly">
      <FilterSearch
        :defaultValue="defaultValue"
        :showSearchNumber="showSearchNumber"
        :readonly="true"
        class="search"
        @clickMoreBtn="() => $emit('clickMoreBtn')"
      ></FilterSearch>
    </template>
    <template v-else>
      <TsFormItem :label="$t('page.filter')" labelWidth="80">
        <FilterSearch
          :defaultValue="defaultValue"
          :defaultSearchValue="defaultSearchValue"
          @changeValue="changeValue"
          @advancedModeSearch="advancedModeSearch"
        ></FilterSearch>
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
    </template>
  </div>
</template>
<script>
import FilterSearch from '../filter-search.vue';
import {mutations} from '@/views/pages/autoexec/detail/actionDetail/actionState.js';
export default {
  name: '',
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
    defaultValue: {//搜索条件
      type: Object,
      default: null
    },
    defaultSearchValue: { //默认搜索条件，不可改变
      type: Object,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    },
    showSearchNumber: Number,
    bgOp: {
      type: Boolean,
      default: true
    }
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
      disabledList: []
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
      let data = this.searchVal || {};
      if (!this.$utils.isEmpty(this.defaultSearchValue)) {
        Object.assign(data, this.defaultSearchValue);
      }
      return data;
    },
    getComplexModeSearchValue() {
      // 获取复杂模式搜索值
      return this.complexModeSearchValue;
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
      if (!this.$utils.isEmpty(this.defaultSearchValue)) {
        Object.assign(data, this.defaultSearchValue);
      }
      data.cmdbGroupType = this.opType;
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
  computed: {
    opType() { 
      return mutations.getOpType();
    }
  },
  watch: {
    defaultValue: {
      handler(val) {
        if (val) {
          if (val && val.hasOwnProperty('conditionGroupList')) {
            this.advancedModeSearch(val); // 复杂模式值回显搜索
          } else {
            if (this.$utils.isEmptyObj(val) && this.defaultSearchValue && this.defaultSearchValue.hasOwnProperty('conditionGroupList')) {
              this.advancedModeSearch(this.defaultSearchValue); // 复杂模式值回显搜索
            } else {
              this.searchVal = this.$utils.deepClone(val);
              this.searchNodeList(val);
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.search{
  width: 100%;
  display: inline-block;
  /deep/ .btn-filter {
    top: 7px;// 修复漏洞图标对不齐问题
  }
}
.padding-top{
  padding-top: 8px;
}
</style>
