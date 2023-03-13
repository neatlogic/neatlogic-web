<template>
  <div class="history">
    <div style="margin-bottom:10px">{{ $t('page.actionaudit') }}</div>
    <div v-if="transactionData.tbodyList && transactionData.tbodyList.length > 0">
      <Timeline :pending="transactionData.pageCount > transactionData.currentPage">
        <TimelineItem
          v-for="(transaction, index) in transactionData.tbodyList"
          :key="index"
          :class="transaction.status == 'recover' ? 'recover' : ''"
          :color="getColor(transaction.ciEntityTransactionVo.action)"
        >
          <div style="cursor:pointer;font-size:12px" @click="showHistory(transaction.id)">
            <div style="white-space:nowrap">
              <span>{{ transaction.createUserName }}</span>
              <span class="ml-xs">{{ transaction.commitTime | formatDate('yyyy-mm-dd hh:mm') }}</span>
            </div>
            <div v-if="transaction.inputFromText">
              <span class="text-grey mr-xs">{{ $t('page.from') }}</span>
              <span>{{ transaction.inputFromText }}</span>
            </div>
            <div v-if="transaction.ciEntityTransactionVo.updateAttrCount || transaction.ciEntityTransactionVo.updateRelCount">
              <span class="text-grey mr-xs">{{ $t('page.change') }}</span>
              <span v-if="transaction.ciEntityTransactionVo.updateAttrCount">{{ $t('page.attribute') }}</span>
              <span v-if="transaction.ciEntityTransactionVo.updateAttrCount" class="ml-xs mr-xs text-primary">
                <b>{{ transaction.ciEntityTransactionVo.updateAttrCount }}</b>
              </span>
              <span v-if="transaction.ciEntityTransactionVo.updateRelCount">{{ $t('page.relation') }}</span>
              <span v-if="transaction.ciEntityTransactionVo.updateRelCount" class="ml-xs text-primary">
                <b>{{ transaction.ciEntityTransactionVo.updateRelCount }}</b>
              </span>
            </div>
            <Divider
              v-if="transaction.status == 'recover'"
              orientation="start"
              style="margin:3px 0px;"
            ><span style="font-size:12px;" class="text-grey">{{ $t('page.recover') }}</span></Divider>
            <div v-if="transaction.status == 'recover'">
              <span>{{ transaction.recoverUserName }}</span>
              <span class="ml-xs">{{ transaction.recoverTime | formatDate('yyyy-mm-dd hh:mm') }}</span>
            </div>
            <Divider v-if="transaction.description" style="margin:3px 0px;font-size:12px" orientation="start">{{ $t('page.memo') }}</Divider>
            <div v-if="transaction.description" class="text-grey">
              <span v-if="transaction.description.length > 50">
                <Tooltip max-width="200" :transfer="true" placement="left-start">
                  <div>{{ transaction.description.substr(0, 50) }}...</div>
                  <div slot="content">{{ transaction.description }}</div>
                </Tooltip>
              </span>
              <span v-else>{{ transaction.description }}</span>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem v-if="transactionData.pageCount > transactionData.currentPage" color="grey"><a href="javascript:void(0)" @click="nextPage">{{ $t('page.more') }}</a></TimelineItem>
      </Timeline>
    </div>
    <div v-else>
      <NoData></NoData>
    </div>
    <HistoryDetail
      v-if="isHistoryDetailShow"
      :transactionId="currentTransactionId"
      :ciEntityId="ciEntityId"
      :ciId="ciId"
      @close="closeHistoryDetail"
    ></HistoryDetail>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    HistoryDetail: resolve => require(['./history-detail.vue'], resolve)
  },
  props: {
    ciId: { type: Number },
    ciEntityId: { type: Number }
  },
  data() {
    return {
      currentTransactionId: null,
      isHistoryDetailShow: false,
      searchParam: { pageSize: 10, statusList: ['commited', 'recover'] },
      transactionData: {}
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
    showHistory(transactionId) {
      this.isHistoryDetailShow = true;
      this.currentTransactionId = transactionId;
    },
    closeHistoryDetail(needRefresh) {
      this.isHistoryDetailShow = false;
      if (needRefresh) {
        this.searchTransaction();
        this.$emit('refresh');
      }
    },
    nextPage() {
      if (this.transactionData.currentPage < this.transactionData.pageCount) {
        this.$set(this.searchParam, 'currentPage', this.searchParam.currentPage + 1);
        this.searchTransaction();
      }
    },
    getColor(action) {
      if (action == 'insert') {
        return 'green';
      } else if (action == 'update') {
        return 'blue';
      } else if (action == 'delete') {
        return 'red';
      }
    },
    searchTransaction() {
      this.$api.cmdb.transaction.searchTransaction(this.searchParam).then(res => {
        const data = res.Return;
        if (data.currentPage == 1) {
          this.transactionData = data;
        } else {
          this.$set(this.transactionData, 'currentPage', data.currentPage);
          this.$set(this.transactionData, 'pageCount', data.pageCount);
          this.$set(this.transactionData, 'pageSize', data.pageSize);
          this.$set(this.transactionData, 'rowNum', data.rowNum);
          data.tbodyList.forEach(element => {
            this.transactionData['tbodyList'].push(element);
          });
        }
        this.$set(this.searchParam, 'currentPage', res.Return.currentPage);
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    ciEntityId: {
      handler: function(val) {
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
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@timeline-color) {
  .history {
    .title {
      font-size: 16px;
      padding-bottom: 10px;
    }
    .history-card {
      background: transparent;
    }
    .time-border {
      border-width: 2px;
      border-radius: 100%;
      border-style: solid;
      height: 20px;
      width: 20px;
      font-size: 12px;
      background: transparent;
    }
    /deep/ .recover .ivu-timeline-item-head {
      background-color: #f66 !important;
    }
    /deep/ .ivu-timeline-item-tail {
      border: 1px dashed @timeline-color !important;
      border-width: 1px !important;
    }
    /deep/ .ivu-timeline-item-head {
      border-width: 2px;
    }
  }
}
html {
  .theme(@default-border);
  &.theme-dark {
    .theme(@dark-border);
  }
}
</style>
