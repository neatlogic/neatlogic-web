
<template>
  <TsDialog
    type="slider"
    :isShow="isShow"
    width="large"
    :title="$t('page.detail')"
    :hasFooter="false"
    maskClose
    @on-close="close"
  >
    <template v-if="!$utils.isEmpty(currentValue.filter) || !$utils.isEmpty(currentValue.selectNodeList)">
      <div v-if="!$utils.isEmpty(currentValue.filter)" class="pb-md">
        <FilterSearch
          :defaultValue="searchVal"
          :defaultSearchValue="defaultSearchValue"
          class="search"
          @changeValue="changeValue"
        ></FilterSearch>
      </div>
      <div v-if="!loadingShow">
        <TsTable
          ref="table"
          v-bind="tableData"
          :showPager="showPager"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
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
    </template>
    <template v-else-if="!$utils.isEmpty(currentValue.inputNodeList)">
      <span
        v-for="(item,index) in inputNodeList"
        :key="index"
        class="item border-color bg-op overflow"
        :title="targetText(item)"
      >{{ targetText(item) }}</span>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    FilterSearch: () => import('@/views/pages/autoexec/components/common/filter-search.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  filters: {
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    currentValue: Object
  },
  data() {
    return {
      searchVal: {},
      defaultSearchValue: null,
      theadList: [
        { title: this.$t('page.port'), key: 'ip'},
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
      loadingShow: true,
      defaultValue: [],
      inputNodeList: [],
      searchParams: {},
      showPager: true
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('close', false);
    },
    init() {
      let currentValue = this.$utils.deepClone(this.currentValue);
      this.searchVal = {};
      this.defaultSearchValue = null;
      this.defaultValue = [];
      this.showPager = true;
      if (!this.$utils.isEmpty(currentValue.filter)) {
        let filter = currentValue.filter;
        this.defaultSearchValue = filter;
        this.searchVal = filter;
        this.searchNodeList();
      } else if (!this.$utils.isEmpty(currentValue.selectNodeList)) {
        this.defaultValue = currentValue.selectNodeList.map(item => {
          return item.id;
        });
        this.showPager = false;
        this.searchNodeList();
      } else {
        this.inputNodeList = currentValue.inputNodeList || [];
      }
    },
    searchNodeList() {
      this.loadingShow = true;
      let data = {};
      if (this.defaultValue.length) {
        this.$set(data, 'defaultValue', this.defaultValue);
      }
      if (!this.$utils.isEmpty(this.searchVal)) {
        Object.assign(data, this.searchVal);
      }
      Object.assign(data, this.searchParams);
      this.$api.common.getNodeList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.$set(this.tableData, 'theadList', this.theadList);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changeCurrent(currentPage) {
      this.searchParams.currentPage = currentPage;
      this.searchNodeList();
    },
    changePageSize(pageSize) {
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = pageSize;
      this.searchNodeList();
    },
    changeValue(val) {
      this.searchVal = this.$utils.deepClone(val);
      this.searchParams.currentPage = 1;
      this.searchNodeList();
    }
  },
  computed: {
    targetText() {
      return data => {
        return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
      };
    }
  },
  watch: {
    currentValue: {
      handler(val) {
        if (!this.$utils.isEmptyObj(val)) {
          this.init();
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.item{
  display: inline-block;
  padding: 0 4px;
  line-height: 30px;
  border:1px solid;
  margin-bottom: 10px;
  margin-right: 10px;
  border-radius: 4px;
}
</style>
