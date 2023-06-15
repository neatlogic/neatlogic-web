<template>
  <div>
    <TsContain :enableCollapse="true">
      <template v-if="$hasBack()" v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-auth="['ADMIN']" class="action-item">
            <AuditConfig auditName="CMDB-TRANSACTION" :title="$t('term.cmdb.transactionauditperiod')"></AuditConfig>
          </span>
        </div>
      </template>
      <div slot="topRight">
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="searchTransaction()"></CombineSearcher>
      </div>
      <template v-slot:sider>
        <ciTypeList :needDefaultCiId="false" :ciId="searchParam.ciId" @click="switchCi"></ciTypeList>
      </template>
      <div slot="content" class="ci-content border-color">
        <Loading v-if="isLoading" :loading-show="isLoading" type="fix"></Loading>
        <TsTable
          :multiple="true"
          v-bind="transactionData"
          :theadList="theadList"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template v-slot:detail="{ row }">
            <span style="cursor:pointer" class="tsfont-task" @click="showHistoryDetail(row)"></span>
          </template>
          <template v-slot:ciName="{ row }">
            <div>
              <span>{{ row.ciLabel }}</span>
              <span class="text-grey">({{ row.ciName }})</span>
            </div>
          </template>
          <template v-slot:error="{ row }">
            <Poptip
              v-if="row.error"
              trigger="hover"
              title="异常"
              word-wrap
              width="400"
              :transfer="true"
              :content="row.error"
              placement="left"
            >
              <span class="text-error tsfont-warning-s"></span>
            </Poptip>
          </template>
          <template v-slot:status="{ row }">
            <span v-if="row.status === 'commited'" class="text-success">{{ row.statusText }}</span>
            <span v-else class="text-grey">{{ row.statusText }}</span>
          </template>
          <template v-slot:createTime="{ row }">
            <Poptip v-if="row.createTime" trigger="hover" :transfer="true">
              <div style="cursor:help">
                <span>{{ row.createTime | formatDate }}</span>
                <span class="fz10 tsfont-taskperson"></span>
              </div>
              <div slot="content">
                <UserCard :uuid="row.createUser"></UserCard>
              </div>
            </Poptip>
          </template>
          <template v-slot:commitTime="{ row }">
            <Poptip v-if="row.commitTime" trigger="hover" :transfer="true">
              <div style="cursor:help">
                <span>{{ row.commitTime | formatDate }}</span>
                <span class="fz10 tsfont-taskperson"></span>
              </div>
              <div slot="content">
                <UserCard :uuid="row.commitUser"></UserCard>
              </div>
            </Poptip>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-if="!(row.action === 'delete' && row.status === 'commited')" class="tsfont-formtextarea" @click="toCiEntity(row.ciEntityId, row.ciId)">配置项详情</li>
                <li
                  v-if="row.status === 'uncommit'"
                  class="tsfont-check-o"
                  :class="row.authData && row.authData.transactionmanage ? '' : 'disable'"
                  @click="commitTransaction(row)"
                >{{ $t('page.submit') }}</li>
                <li
                  v-if="row.status === 'commited' && row.action !== 'insert'"
                  class="tsfont-revover"
                  :class="!row.authData || !row.authData.cientityrecover ? 'disable' : ''"
                  @click="recoverCiEntity(row)"
                >{{ $t('page.recover') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <HistoryDetail
      v-if="isHistoryDetailShow"
      :transactionId="currentTransactionId"
      :ciEntityId="currentCiEntityId"
      :ciId="currentCiId"
      @close="closeHistoryDetail"
    ></HistoryDetail>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ciTypeList: resolve => require(['../components/ci/ci-type-list.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    HistoryDetail: resolve => require(['../cientity/history-detail.vue'], resolve),
    AuditConfig: resolve => require(['@/views/components/auditconfig/auditconfig.vue'], resolve)
  },
  props: {},
  data() {
    return {
      ciId: null,
      isHistoryDetailShow: false,
      currentTransactionId: null,
      currentCiEntityId: null,
      currentCiId: null,
      fromPath: '',
      leftHeight: 0,
      transactionData: {},
      ciData: {},
      isLoading: true,
      searchVal: {},
      searchParam: { needAction: true },
      searchConfig: {
        search: false,
        searchList: [
          { type: 'text', name: 'transactionId', label: this.$t('term.cmdb.transactionid') },
          { type: 'text', name: 'transactionGroupId', label: this.$t('term.cmdb.transactiongroupid') },
          { type: 'select', name: 'status', url: '/api/rest/universal/enum/get', params: { enumClass: 'neatlogic.framework.cmdb.enums.TransactionStatus' }, label: this.$t('page.status'), transfer: true },
          {
            type: 'select',
            name: 'inputFrom',
            dataList: [
              { value: 'page', text: this.$t('page.frompage') },
              { value: 'import', text: this.$t('page.fromexcel') },
              { value: 'itsm', text: this.$t('page.fromitsm') },
              { value: 'autoexec', text: this.$t('page.autocollect') }
            ],
            label: this.$t('page.updatefrom'),
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
            label: this.$t('page.errorornot'),
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
          },
          {
            type: 'daterange',
            name: 'commitTimeRange',
            label: this.$t('page.commitdate'),
            format: 'yyyy-MM-dd',
            transfer: true
          },
          {
            type: 'daterange',
            name: 'recoverTimeRange',
            label: this.$t('page.restoredate'),
            format: 'yyyy-MM-dd',
            transfer: true
          }
        ]
      },
      theadList: [
        /*{
          key: 'selection'
        },*/
        { key: 'detail', title: this.$t('page.detail') },
        { key: 'ciName', title: this.$t('page.model') },
        { key: 'ciEntityName', title: this.$t('term.cmdb.cientity') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'actionText', title: this.$t('page.action') },
        { key: 'inputFromText', title: this.$t('page.updatefrom') },
        { key: 'createTime', title: this.$t('page.createtime') },
        { key: 'commitTime', title: this.$t('page.committime') },
        { key: 'error', title: this.$t('page.exception') },
        { key: 'action' }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.params.transactionGroupId) {
      this.searchVal.transactionGroupId = this.$route.params.transactionGroupId;
    }
  },
  beforeMount() {},
  mounted() {
    this.searchTransaction();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    restoreHistory(historyData) {
      this.searchParam = historyData['searchParam'];
      this.searchVal = historyData['searchVal'];
    },
    toCiEntity(id, ciId) {
      this.$router.push({ path: '/ci/' + ciId + '/cientity-view/' + id });
    },
    changeCurrent(currentPage) {
      this.searchTransaction(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchTransaction(1);
    },
    async recoverCiEntity(row) {
      console.log(JSON.stringify(row, null, 2));
      if (!row.authData || !row.authData.cientityrecover) {
        return;
      }
      let brotherTransactionCount = 0;
      if (row.id && row.transactionGroupId) {
        await this.$api.cmdb.transaction.getBrotherTransactionCount(row.id, row.transactionGroupId).then(res => {
          brotherTransactionCount = res.Return;
        });
      }
      let content = this.$t('dialog.content.recoverconfirm', { target: this.$t('term.cmdb.cientity') });
      if (brotherTransactionCount > 0) {
        content = this.$t('dialog.content.invokerecoverconfirm', { count: brotherTransactionCount });
      }
      this.$createDialog({
        title: this.$t('dialog.title.recoverconfirm'),
        content: content,
        btnType: 'success',
        'on-ok': vnode => {
          this.$api.cmdb.transaction.recoverTransaction(row.id).then(res => {
            this.$Message.success(this.$t('message.recoversuccess'));
            vnode.isShow = false;
            this.searchTransaction();
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    async commitTransaction(row) {
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
          this.$api.cmdb.transaction.commitTransaction(row.id).then(res => {
            this.$Message.success(this.$t('message.commitsuccess'));
            vnode.isShow = false;
            this.searchTransaction();
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    showHistoryDetail(transaction) {
      this.currentTransactionId = transaction.id;
      this.currentCiEntityId = transaction.ciEntityId;
      this.currentCiId = transaction.ciId;
      this.isHistoryDetailShow = true;
    },
    closeHistoryDetail(needRefresh) {
      this.isHistoryDetailShow = false;
      this.currentTransactionId = null;
      this.currentCiEntityId = null;
      this.currentCiId = null;
      if (needRefresh) {
        this.searchTransaction();
      }
    },
    searchTransaction(currentPage) {
      this.isLoading = true;
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      const data = { ...this.searchParam, ...this.searchVal };
      this.$addHistoryData('searchParam', this.searchParam);
      this.$addHistoryData('searchVal', this.searchVal);
      this.$api.cmdb.transaction
        .searchTransaction(data)
        .then(res => {
          res.Return.tbodyList.forEach(element => {
            if (element.status === 'commited') {
              element.isDisabled = true;
            }
          });
          this.transactionData = res.Return;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    switchCi: function(ciType, ci) {
      if (this.searchParam.ciId == ci.id) {
        this.$set(this.searchParam, 'ciId', null);
      } else {
        this.$set(this.searchParam, 'ciId', ci.id);
      }
      this.searchTransaction();
    },
    getLeftHeight: function() {
      window.setTimeout(() => {
        if (this.$refs.lefter) {
          this.leftHeight = this.$refs.lefter.offsetHeight;
        }
      }, 500);
    },
    toCiList: function() {
      if (this.fromPath) {
        if (this.fromPath != '/ci-manage' && this.fromPath != '/cientity-manage') {
          this.fromPath = '';
        }
      }
      let path = this.fromPath ? this.fromPath : '/cientity-manage';
      this.$router.push({
        path: path
      });
    }
  },
  filter: {},
  computed: {
    fromPageName() {
      return this.$route.meta.fromPage && this.$route.meta.fromPage.title ? this.$route.meta.fromPage.title : '配置项列表';
    }
  },
  watch: {},
  beforeRouteEnter(to, from, next) {
    to.meta.fromPage = { path: from.fullPath, title: from.meta.title };
    next();
  }
};
</script>
<style lang="less" scoped></style>
