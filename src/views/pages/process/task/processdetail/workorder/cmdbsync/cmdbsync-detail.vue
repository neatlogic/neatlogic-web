<template>
  <div v-if="handlerStepInfo">
    <Alert v-if="!$utils.isEmpty(handlerStepInfo.errorList)" type="error">
      <template slot="desc">
        <div v-for="(e,eindex) in handlerStepInfo.errorList" :key="eindex">
          创建配置项失败：{{ e.error.length > 500 && !e.isMore? e.error.slice(0,500) : e.error }}
          <span v-if="e.error.length > 500" class="text-href pl-sm" @click="viewDetail(e)">{{ !e.isMore?$t('page.viewmore'):$t('page.packup') }}</span>
        </div>
      </template>
    </Alert>
    <TsTable v-if="handlerStepInfo.tbodyList && handlerStepInfo.tbodyList.length > 0" :theadList="theadList" :tbodyList="handlerStepInfo.tbodyList">
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
          </ul>
        </div>
      </template>
    </TsTable>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    HistoryDetail: resolve => require(['@/views/pages/cmdb/cientity/history-detail.vue'], resolve)
  },
  props: {
    handlerStepInfo: Object
  },
  data() {
    return {
      theadList: [
        { key: 'detail', title: this.$t('page.detail') },
        { key: 'ciName', title: this.$t('page.model') },
        { key: 'ciEntityName', title: this.$t('term.cmdb.cientity') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'actionText', title: this.$t('page.action') },
        { key: 'inputFromText', title: this.$t('page.updatefrom') },
        { key: 'createTime', title: this.$t('page.createtime') },
        { key: 'commitTime', title: this.$t('page.committime') },
        { key: 'error', title: this.$t('page.exception') }
      ],
      isHistoryDetailShow: false,
      currentTransactionId: null,
      currentCiEntityId: null,
      currentCiId: null
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
    toCiEntity(id, ciId) {
      window.open(HOME + '/cmdb.html#/ci/' + ciId + '/cientity-view/' + id, '_blank');
      // this.$router.push({ path: '/ci/' + ciId + '/cientity-view/' + id });
    },
    viewDetail(e) {
      this.$set(e, 'isMore', !e.isMore);
    },
    showHistoryDetail(transaction) {
      this.currentTransactionId = transaction.id;
      this.currentCiEntityId = transaction.ciEntityId;
      this.currentCiId = transaction.ciId;
      this.isHistoryDetailShow = true;
    },
    closeHistoryDetail() {
      this.isHistoryDetailShow = false;
      this.currentTransactionId = null;
      this.currentCiEntityId = null;
      this.currentCiId = null;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
