<template>
  <div class="history">
    <div style="margin-bottom:10px">操作记录</div>
    <div v-if="transactionData.tbodyList && transactionData.tbodyList.length > 0">
      <Timeline :pending="transactionData.pageCount > transactionData.currentPage">
        <TimelineItem
          v-for="(transaction, index) in transactionData.tbodyList"
          :key="index"
          :class="transaction.status == 'recover' ? 'recover' : ''"
          :color="getColor(transaction.ciEntityTransactionVo.action)"
        >
          <div style="cursor:pointer;font-size:12px" @click="showHistory(transaction.id)">
            <div>
              <span>{{ transaction.createUserName }}</span>
              <span class="text-grey ml-xs mr-xs">于</span>
              <span>{{ transaction.commitTime | formatDate }}</span>
              <span class="text-grey ml-xs">创建</span>
            </div>
            <div v-if="transaction.inputFromText">
              <span class="text-grey mr-xs">来自</span>
              <span>{{ transaction.inputFromText }}</span>
            </div>
            <div v-if="transaction.ciEntityTransactionVo.updateAttrCount || transaction.ciEntityTransactionVo.updateRelCount">
              <span class="text-grey mr-xs">修改</span>
              <span v-if="transaction.ciEntityTransactionVo.updateAttrCount">属性</span>
              <span v-if="transaction.ciEntityTransactionVo.updateAttrCount" class="ml-xs text-primary">
                <b>{{ transaction.ciEntityTransactionVo.updateAttrCount }}</b>
              </span>
              <span v-if="transaction.ciEntityTransactionVo.updateRelCount">关系</span>
              <span v-if="transaction.ciEntityTransactionVo.updateRelCount" class="ml-xs text-primary">
                <b>{{ transaction.ciEntityTransactionVo.updateRelCount }}</b>
              </span>
            </div>
            <Divider v-if="transaction.status == 'recover'" style="margin:3px 0px;" />
            <div v-if="transaction.status == 'recover'">
              <span>{{ transaction.recoverUserName }}</span>
              <span class="text-grey ml-xs mr-xs">于</span>
              <span>{{ transaction.recoverTime | formatDate }}</span>
              <span class="text-grey ml-xs">恢复</span>
            </div>
            <Divider v-if="transaction.description" style="margin:3px 0px;font-size:12px" orientation="start">备注</Divider>
            <div v-if="transaction.description" class="text-grey">
              <span v-if="transaction.description.length > 50">
                <Tooltip max-width="200" :transfer="true" placement="left-start">
                  <div>{{ transaction.description.substr(0, 50) }}...</div>
                  <div slot="content">{{ transaction.description }}</div></Tooltip>
              </span>
              <span v-else>{{ transaction.description }}</span>
            </div>
          </div>
        </TimelineItem>
        <TimelineItem v-if="transactionData.pageCount > transactionData.currentPage" color="grey"><a href="javascript:void(0)" @click="nextPage">查看更多</a></TimelineItem>
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
@import (reference) '~@/resources/assets/css/my-theme.less';
.theme(@timeline-color){
  .history{
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
