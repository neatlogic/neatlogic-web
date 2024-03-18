
<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsTable
      v-if="!loadingShow"
      ref="table"
      v-bind="tableData"
      multiple
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
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  filters: {
    
  },
  props: {
    config: Object,
    defaultSearchValue: { //默认搜索条件，不可改变
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loadingShow: false,
      keyword: '',
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
      pageSize: 20,
      defaultValue: []

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
    getDataList(type, value) {
      this.loadingShow = true;
      let data = {
        currentPage: type == 'currentPage' ? value : this.currentPage,
        pageSize: type == 'pageSize' ? value : this.pageSize,
        defaultValue: this.defaultValue
      };
      this.$api.autoexec.action.getNodeList(data).then(res => {
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
        if (val && val.selectNodeList) {
          this.defaultValue = val.selectNodeList.map(item => {
            return item.id;
          });
          this.getDataList();
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
.item{
  width: 100%;
  margin-bottom: 10px;
  display: inline-block;
  position: relative;
  height: 32px;
  line-height: 30px;
  padding: 0 4px;
  border: 1px solid;
  text-align: center;
  border-radius: 6px;
}
</style>
