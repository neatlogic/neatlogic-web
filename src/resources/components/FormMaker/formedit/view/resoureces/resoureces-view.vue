
<template>
  <TsDialog
    type="slider"
    :isShow="isShow"
    width="large"
    title="详情"
    :hasFooter="false"
    @on-close="close"
  >
    <template v-if="currentValue.type == 'filter'||currentValue.type == 'node'">
      <div v-if="currentValue.type == 'filter'" class="pb-md">
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
    </template>
    <template v-else-if="currentValue.type == 'input'">
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
    FilterSearch: resolve => require(['./addtarget/filter-search.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
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
      loadingShow: true,
      defaultValue: [],
      inputNodeList: []
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
      if (currentValue.type == 'filter') {
        let filter = currentValue.filter;
        this.defaultSearchValue = filter;
        this.searchVal = filter;
        this.searchNodeList();
      } else if (currentValue.type == 'node') {
        this.defaultValue = currentValue.selectNodeList.map(item => {
          return item.id;
        });
        this.searchNodeList();
      } else {
        this.inputNodeList = currentValue.inputNodeList;
      }
    },
    searchNodeList(param) {
      this.loadingShow = true;
      let data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize
      };
      if (this.defaultValue.length) {
        this.$set(data, 'defaultValue', this.defaultValue);
      }
      if (!this.$utils.isEmptyObj(this.searchVal)) {
        Object.assign(data, this.searchVal);
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
