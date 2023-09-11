<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsDialog
      title="选择节点"
      type="slider"
      :isShow="true"
      :multiple="multiple"
      width="large"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsTable
            v-bind="tableData"
            :multiple="multiple"
            :theadList="theadList"
            @changeCurrent="getDataList('currentPage',...arguments)"
            @changePageSize="getDataList('pageSize',...arguments)"
          >
            <template slot="" slot-scope="{row}">
              {{ row }}
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loadingShow: false,
      theadList: [
        { key: 'selection' },
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
      tableData: {},
      searchVal: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getNodeList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getNodeList() {
      let data = {};
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
    okDialog() {
      this.closeDialog();
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
