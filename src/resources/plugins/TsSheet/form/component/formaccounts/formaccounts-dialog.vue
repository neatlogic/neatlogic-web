<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="save()"
      @on-close="close()"
    >
      <template v-slot>
        <div>
          <TsRow class="pb-sm">
            <Col :span="16"></Col>
            <Col :span="8">
              <InputSearcher
                v-model="keyword"
                placeholder="资产名称、资产IP"
                @change="searchTableData(1)"
              ></InputSearcher>
            </Col>
          </TsRow>
          <TsTable
            v-model="selectedIdList"
            v-bind="tableConfig"
            :theadList="theadList"
            :keyName="'_selectId'"
            :fixedHeader="false"
            multiple
            selectedRemain
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
            @getSelected="getSelected"
          >
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
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {
    value: Array
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: '选择帐号',
        width: 'large'
      },
      showDialog: false,
      keyword: '',
      theadList: [
        { key: 'selection' },
        { key: 'name', title: '资产名' },
        { key: 'ip', title: '资产IP' },
        { key: 'account', title: '帐号名称' },
        { key: 'accountName', title: '用户名' },
        { key: 'protocol', title: '连接协议' },
        { key: 'port', title: '端口' }
      ],
      tableConfig: {},
      searchParams: {},
      selectedIdList: [],
      selectedItemList: []
    };
  },
  beforeCreate() {},
  created() {
    this.searchTableData();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchTableData(currentPage) {
      let data = {
        keyword: this.keyword
      };
      if (currentPage) {
        this.searchParams.currentPage = currentPage;
      }
      Object.assign(data, this.searchParams);
      this.$api.cmdb.resourceentity.searchResourceAccountList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableConfig = res.Return || {};
          if (this.tableConfig.tbodyList && this.tableConfig.tbodyList.length > 0) {
            this.tableConfig.tbodyList.forEach(item => {
              this.$set(item, '_selectId', item.accountId + '_' + item.id);
            });
          }
        }
      });
    },
    changeCurrent(currentPage) {
      this.searchTableData(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParams.pageSize = pageSize;
      this.searchTableData(1);
    },
    getSelected(idList, row) {
      this.selectedItemList.push(...row);
      if (this.selectedItemList && this.selectedItemList.length) {
        this.selectedItemList = this.$utils.uniqueByField(this.selectedItemList, '_selectId');
      }
      let selectedArr = this.selectedItemList.filter(val => {
        return idList.includes(val._selectId);
      });
      this.selectedItemList = selectedArr || [];
    },
    save() {
      this.$emit('close', this.selectedItemList);
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {
    value: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.selectedItemList = this.$utils.deepClone(val);
          this.selectedIdList = this.$utils.mapArray(val, '_selectId');
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
