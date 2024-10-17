<template>
  <div>
    <div v-if="needSearch" class="clearfix">
      <div class="search">
        <CombineSearcher
          v-model="searchVal"
          style="width: 400px; display: inline-block"
          v-bind="searchConfig"
          @change="searchTransaction(1)"
        ></CombineSearcher>
      </div>
    </div>
    <div v-if="transactionData && transactionData.tbodyList && transactionData.tbodyList.length > 0" class="mt-md">
      <TsTable
        v-if="transactionData"
        v-bind="transactionData"
        multiple
        @changeCurrent="changePage"
        @changePageSize="changePageSize"
        @getSelected="getSelected"
      >
        <template slot="ciEntityName" slot-scope="{ row }">
          <a href="javascript:void(0)" @click="compare(row)">
            <span v-if="row.action != 'insert'">{{ row.ciEntityName || $t('term.cmdb.nonamecientity') }}</span>
            <span v-else>{{ $t('term.cmdb.newcientity') }}</span>
          </a>
        </template>
        <template slot="actionText" slot-scope="{ row }">
          <span :class="row.action == 'insert' ? 'text-success' : row.action == 'delete' ? 'text-error' : 'text-primary'">{{ row.actionText }}</span>
        </template>
        <template slot="createTime" slot-scope="{ row }">{{ row.createTime | formatDate }}</template>
        <template slot="error" slot-scope="{ row }">
          <span v-if="row.error" class="text-grey">{{ row.error }}</span>
        </template>
        <template slot="action" slot-scope="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-check-o" :class="row.authData && row.authData.transactionmanage ? '' : 'disable'" @click="commitTransation(row)">{{ $t('page.submit') }}</li>
              <li class="tsfont-trash-o" :class="row.authData && row.authData.transactionmanage ? '' : 'disable'" @click="deleteTransaction(row)">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <div v-if="!transactionData.tbodyList || transactionData.tbodyList.length == 0">
      <NoData v-if="!isLoading"></NoData>
      <Loading :loadingShow="isLoading" type="fix"></Loading>
    </div>
    <HistoryDetail
      v-if="isHistoryDetailShow"
      :transactionId="currentTransactionId"
      :ciEntityId="currentCiEntityId"
      :ciId="ciId"
      @close="closeHistoryDetail"
    ></HistoryDetail>
  </div>
</template>
<script>
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue';

export default {
  name: '',
  components: {
    CombineSearcher,
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    HistoryDetail: () => import('./history-detail.vue')
  },
  props: {
    ciId: { type: Number },
    ciEntityId: { type: Number },
    needCheck: { type: Boolean, default: false },
    needAction: { type: Boolean, default: false },
    needSearch: { type: Boolean, default: true }
  },
  data() {
    return {
      isLoading: true,
      isHistoryDetailShow: false,
      currentTransactionId: null,
      currentCiEntityId: null,
      transactionData: {},
      selectedTransactionList: [], //已选择事务
      theadList: [
        {
          key: 'ciEntityName',
          title: this.$t('term.cmdb.cientity')
        },
        { key: 'actionText', title: this.$t('page.action') },
        { key: 'inputFromText', title: this.$t('page.inputfrom') },
        { key: 'createUserName', title: this.$t('page.creator') },
        { key: 'createTime', title: this.$t('page.createdate') },
        { key: 'description', title: this.$t('page.memo') },
        { key: 'error', title: this.$t('page.exception') },
        { key: 'action' }
      ],
      searchVal: {
      
      },
      searchParam: { currentPage: 1,
        pageSize: 20,
        status: 'uncommit',
        needAction: true},
      searchConfig: {
        search: false,
        labelPosition: 'left',
        labelWidth: 70,
        searchList: [
          {
            type: 'select',
            name: 'inputFrom',
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.common.constvalue.InputFrom' },
            label: this.$t('page.inputfrom'),
            transfer: true
          },
          {
            type: 'select',
            name: 'action',
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.cmdb.enums.TransactionActionType' },
            label: this.$t('page.action'),
            transfer: true
          },
          {
            type: 'radio',
            name: 'hasError',
            label: this.$t('page.exception'),
            dataList: [
              { value: 0, text: this.$t('page.noexception') },
              { value: 1, text: this.$t('page.hasexception') }
            ],
            transfer: true
          },
          {
            type: 'daterange',
            name: 'createTimeRange',
            label: this.$t('page.actiondate'),
            format: 'yyyy-MM-dd',
            transfer: true
          }
        ]
      }
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
    batchCommit() {
      if (this.selectedTransactionList && this.selectedTransactionList.length > 0) {
        //TODO
      }
    },
    async commitTransation(row) {
      if (!row.authData || !row.authData.transactionmanage) {
        return;
      }
      let brotherTransactionCount = 0;
      if (row.id && row.transactionGroupId) {
        await this.$api.cmdb.transaction.getBrotherTransactionCount(row.id, row.transactionGroupId).then(res => {
          brotherTransactionCount = res.Return;
        });
      }
      let content = this.$t('dialog.content.commitconfirm', { target: this.$t('term.cmdb.transaction') });
      if (brotherTransactionCount > 0) {
        content = this.$t('dialog.content.invokecommitconfirm', { count: brotherTransactionCount });
      }
      this.$createDialog({
        title: this.$t('dialog.title.commitconfirm'),
        content: content,
        'on-ok': vnode => {
          this.$api.cmdb.transaction
            .commitTransaction(row.id)
            .then(res => {
              this.$Message.success(this.$t('message.commitsuccess'));
              vnode.isShow = false;
              // 提交之后返回上一级更新数据
              this.searchTransaction();
            })
            .catch(error => {
              vnode.isShow = false;
              this.searchTransaction();
            });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    getSelected(indexList, itemList) {
      this.selectedTransactionList = itemList;
    },
    deleteTransaction(row) {
      if (!row.authData || !row.authData.transactionmanage) {
        return;
      }
      let content = this.$t('dialog.content.deleteconfirm', { target: this.$t('term.cmdb.transaction') });
      if (row.brotherTransactionCount > 1) {
        content = this.$t('dialog.content.invokedeleteconfirm', { count: brotherTransactionCount });
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: content,
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.transaction.deleteTransaction(this.ciId, row.id).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.searchTransaction();
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    compare(row) {
      this.currentCiEntityId = row.ciEntityId;
      this.currentTransactionId = row.id;
      this.isHistoryDetailShow = true;
    },
    closeHistoryDetail() {
      this.currentCiEntityId = null;
      this.currentTransactionId = null;
      this.isHistoryDetailShow = false;
    },
    changePage(page) {
      this.searchParam.currentPage = page;
      this.searchTransaction();
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchTransaction();
    },
    searchTransaction(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.cmdb.transaction.searchTransaction({ ...this.searchParam, ...this.searchVal }).then(res => {
        this.transactionData = res.Return;
        this.transactionData.theadList = this.theadList;
        this.isLoading = false;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    ciId: {
      handler(val) {
        if (val) {
          this.searchParam.ciId = val;
          this.searchTransaction();
        }
      },
      immediate: true
    },
    ciEntityId: {
      handler(val) {
        if (val) {
          this.searchParam.ciEntityId = val;
          this.searchTransaction();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.clearfix {
  position: relative;
  margin-bottom: 10px;
  height: 30px;
  .batch {
    position: absolute;
    left: 0px;
  }
  .search {
    position: absolute;
    right: 0;
  }
}
</style>
