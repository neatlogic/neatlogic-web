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
          <div class="pb-nm">
            <CombineSearcher
              v-model="searchVal"
              v-bind="searchConfig"
              :disabledList="disabledList"
            ></CombineSearcher>
          </div>
          <TsTable
            v-bind="tableData"
            :multiple="multiple"
            :theadList="theadList"
            :keyName="'id'"
            @changeCurrent="getDataList('currentPage',...arguments)"
            @changePageSize="getDataList('pageSize',...arguments)"
            @getSelected="getSelected"
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve)
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
      searchVal: {},
      selectedRowId: null,
      selectedRowData: null,
      searchConfig: {
        labelWidth: 100,
        // placeholder: '请输入节点ip、端口、名称',
        searchList: [
          {
            type: 'tree',
            name: 'typeIdList',
            label: '模型类型',
            multiple: true,
            url: '/api/rest/resourcecenter/resourcetype/tree',
            textName: 'label',
            valueName: 'id',
            search: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'appSystemIdList',
            label: '应用',
            multiple: true,
            value: null,
            dynamicUrl: '/api/rest/resourcecenter/appsystem/list/forselect',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            search: true,
            transfer: true,
            onChange: (val) => {
              let appSystemIdList = [];
              appSystemIdList = this.searchConfig.searchList.filter((item) => {
                return item.name == 'appModuleIdList';
              });
              if (!this.$utils.isEmpty(appSystemIdList)) {
                appSystemIdList[0].params.appSystemIdList = val;
              }
              if (val) {
                this.$nextTick(() => {
                  if (this.searchVal && this.searchVal.appModuleIdList) {
                    this.$delete(this.searchVal, 'appModuleIdList');
                    // this.changeValue();
                  }
                });
              }
            }
          },
          {
            type: 'select',
            name: 'appModuleIdList',
            label: '模块',
            multiple: true,
            dynamicUrl: '/api/rest/resourcecenter/appmodule/list',
            params: {appSystemIdList: null},
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            search: true,
            transfer: true
          },
          {
            type: 'checkbox',
            name: 'envIdList',
            label: '环境',
            multiple: true,
            url: '/api/rest/resourcecenter/appenv/list/forselect',
            params: {needPage: false},
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          },
          {
            type: 'select',
            name: 'protocolIdList',
            label: '连接协议',
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getProtocolDataList,
            multiple: true,
            search: true,
            clearable: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'tagIdList',
            label: '标签',
            multiple: true,
            dynamicUrl: '/api/rest/resourcecenter/tag/list/forselect',
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            search: true,
            transfer: true
          },
          {
            type: 'checkbox',
            name: 'stateIdList',
            label: '状态',
            multiple: true,
            url: '/api/rest/resourcecenter/state/list/forselect',
            params: { needPage: false},
            rootName: 'tbodyList',
            textName: 'description',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          }
        ]
      },
      disabledList: [] //不可更改的搜索条件
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
    },
    getSelected(id, row) {
      let selectedArr = this.tableData.tbodyList.filter(val => {
        return id.includes(val.id); // 获取所有选中列表
      });
      this.selectedRowId = id;
      this.selectedRowData = selectedArr;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
