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
                :placeholder="$t('term.inspect.assetname')+'、'+ $t('term.inspect.assetip')"
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
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    value: Array
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.$t('dialog.title.choosetarget', {'target': this.$t('page.account')}),
        width: 'large'
      },
      showDialog: false,
      keyword: '',
      theadList: [
        { key: 'selection' },
        { key: 'name', title: this.$t('term.inspect.assetname') },
        { key: 'ip', title: this.$t('term.inspect.assetip') },
        { key: 'account', title: this.$t('page.account') },
        { key: 'accountName', title: this.$t('page.username') },
        { key: 'protocol', title: this.$t('term.inspect.connectionagreement') },
        { key: 'port', title: this.$t('page.port') }
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
