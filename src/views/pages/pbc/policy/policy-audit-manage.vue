<template>
  <div>
    <TsContain :enableCollapse="true">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">
          {{ $getFromPage() }}
        </span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-auth="['ADMIN']" class="action-item"><AuditConfig auditName="PBC-AUDIT"></AuditConfig></span>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="searchPolicyAudit()"></CombineSearcher>
        </div>
      </template>
      <template v-slot:sider>
        <div class="pl-md pr-md">
          <TsUlList
            v-if="policyData.tbodyList"
            :value="policyId"
            valueName="id"
            textName="name"
            :isToggle="true"
            v-bind="policyData"
            @on-click="changePolicyId"
            @updatePage="searchPolicy"
          >
            <template slot-scope="{ row }">
              <div style="position:relative" class="pl-sm pr-sm">
                <div style="position:absolute;top:0px;right:0px;">
                  <Badge v-if="row.execCount" :count="row.execCount" type="primary"></Badge>
                </div>
                <div class="text-grey">
                  {{ row.name }}
                </div>
              </div>
            </template>
          </TsUlList>
        </div>
      </template>
      <template v-slot:content>
        <TsTable
          v-if="policyAuditData"
          :theadList="theadList"
          v-bind="policyAuditData"
          :fixedHeader="false"
          @changeCurrent="searchPolicyAudit"
          @changePageSize="changePolicyAuditPageSize"
        >
          <template v-slot:timeCost="{ row }">
            <div>{{ row.timeCost | formatTimeCost }}</div>
          </template>
          <template v-slot:status="{ row }">
            <div>
              <div v-if="row.status != 'running'">
                <span :class="row.status == 'success' ? 'text-success' : row.status == 'failed' ? 'text-danger' : 'text-grey'">{{ row.statusText }}</span>
              </div>
              <div v-else-if="row.status == 'running'" style="width:42px">
                <Progress
                  :percent="99"
                  :stroke-width="10"
                  status="active"
                  :hide-info="true"
                />
              </div>
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
              placement="right"
            >
              <span class="text-error tsfont-warning-s"></span>
            </Poptip>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-zirenwu" @click="viewPolicyAudit(row)">详情</li>
                <li class="tsfont-trash-o" @click="deletePolicyAudit(row)">删除</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <PolicyAuditView v-if="isAuditDetailShow" :id="currentAuditId" @close="closePolicyAudit()"></PolicyAuditView>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsUlList: resolve => require(['@/resources/components/TsUlList/TsUlList.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    PolicyAuditView: resolve => require(['./policy-audit-view.vue'], resolve),
    AuditConfig: resolve => require(['@/views/components/auditconfig/auditconfig.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isAuditDetailShow: false,
      searchVal: {},
      currentAuditId: null, //当前选中记录id
      sessionName: 'policy-audit-manage',
      leftWidth: 200,
      policyData: {},
      policyAuditData: {},
      searchPolicyParam: { collectMode: 'initiative', inpageSize: 20 },
      currentPage: 1, //日志当前页
      pageSize: 20, //日志每页数量
      policyId: null, //左边选择的集合id
      doingIdList: [],
      timer: null,
      theadList: [
        {
          key: 'status',
          title: '状态'
        },
        { key: 'error', title: '异常' },
        { key: 'inputFromText', title: '发起方式' },
        { key: 'startTime', title: '开始时间', type: 'time' },
        { key: 'endTime', title: '结束时间', type: 'time' },
        { key: 'timeCost', title: '耗时' },
        //{ key: 'dataCount', title: '数据量' },
        { key: 'action' }
      ],
      searchConfig: {
        search: false,
        searchList: [
          {
            type: 'select',
            name: 'status',
            dataList: [
              { value: 'pending', text: '已就绪' },
              { value: 'running', text: '执行中' },
              { value: 'success', text: '已成功' },
              { value: 'failed', text: '已失败' }
            ],
            label: '状态',
            transfer: true,
            labelPosition: 'top'
          },
          {
            type: 'radio',
            name: 'hasError',
            label: '异常状态',
            dataList: [
              { value: 'false', text: '无异常' },
              { value: 'true', text: '有异常' }
            ],
            transfer: true,
            labelPosition: 'top'
          },
          {
            type: 'daterange',
            name: 'startTimeRange',
            label: '开始时间',
            transfer: true,
            format: 'yyyy-MM-dd',
            labelPosition: 'top'
          },
          {
            type: 'daterange',
            name: 'endTimeRange',
            label: '结束时间',
            transfer: true,
            format: 'yyyy-MM-dd',
            labelPosition: 'top'
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.$route.params.policyId) {
      this.policyId = this.$route.params.policyId;
    }
    this.searchPolicy();
    this.searchPolicyAudit();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.clearTimer();
  },
  destroyed() {},
  methods: {
    closePolicyAudit() {
      this.isAuditDetailShow = false;
      this.currentAuditId = null;
    },
    viewPolicyAudit(row) {
      this.currentAuditId = row.id;
      this.isAuditDetailShow = true;
    },
    deletePolicyAudit(row) {
      this.$createDialog({
        title: '警告',
        content: '确定删除选中执行记录？',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.pbc.policy.deletePolicyAudit(row.id).then(res => {
            this.$Message.success(this.$t('message.content.deletesuccess'));
            vnode.isShow = false;
            this.searchPolicy();
            this.searchPolicyAudit();
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    changePolicyAuditPageSize(pageSize) {
      this.pageSize = pageSize;
      this.searchPolicyAudit();
    },
    changePolicyId(id) {
      if (this.policyId != id) {
        this.policyId = id;
      } else {
        this.policyId = null;
      }
      this.searchPolicyAudit();
    },
    toPolicyList() {
      this.$router.push({ path: '/policy-manage' });
    },
    searchPolicy(currentPage) {
      if (currentPage) {
        this.searchPolicyParam.currentPage = currentPage;
      } else {
        this.searchPolicyParam.currentPage = 1;
      }
      this.$api.pbc.policy.searchPolicy(this.searchPolicyParam).then(res => {
        this.policyData = res.Return;
        this.$set(this.policyData, 'dataList', res.Return.tbodyList);
        if (this.policyId) {
          this.policyData.dataList.forEach(element => {
            if (element.id == this.policyId) {
              this.$set(element, '_isSelected', true);
            }
          });
        }
      });
    },
    searchPolicyAudit(currentPage) {
      this.clearTimer();
      if (currentPage) {
        this.currentPage = currentPage;
      } else {
        this.currentPage = 1;
      }
      let data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        policyId: this.policyId
      };
      Object.assign(data, this.searchVal);
      this.$api.pbc.policy.searchPolicyAudit(data).then(res => {
        this.policyAuditData = res.Return;
        //检查是否有进行中采集，如果有启动定时刷新
        this.doingIdList = [];
        if (this.policyAuditData.tbodyList) {
          this.policyAuditData.tbodyList.forEach(element => {
            if (element.status == 'running') {
              this.doingIdList.push(element.id);
            }
          });
        }
        if (this.doingIdList.length > 0) {
          this.checkAuditStatusInterval();
        }
      });
    },
    checkAuditStatusInterval() {
      this.clearTimer();
      if (this.doingIdList && this.doingIdList.length > 0) {
        this.$api.pbc.policy.searchPolicyAudit({ idList: this.doingIdList }).then(res => {
          this.doingIdList = [];
          if (res.Return && res.Return.tbodyList && res.Return.tbodyList.length > 0) {
            res.Return.tbodyList.forEach(element => {
              const oldElement = this.policyAuditData.tbodyList.find(a => a.id == element.id);
              if (element.status == 'running') {
                this.doingIdList.push(element.id);
              }
              if (oldElement) {
                this.$set(oldElement, 'status', element.status);
                this.$set(oldElement, 'statusText', element.statusText);
                this.$set(oldElement, 'endTime', element.endTime);
                this.$set(oldElement, 'timeCost', element.timeCost);
                this.$set(oldElement, 'dataCount', element.dataCount);
              }
            });
          }
          if (this.doingIdList.length > 0) {
            this.timer = setTimeout(() => {
              this.checkAuditStatusInterval();
            }, 3000);
          }
        });
      }
    },
    showCiEntityTransaction(transactionGroupId) {
      this.$router.push({ name: 'transaction-manage', params: { transactionGroupId: transactionGroupId } });
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scope>
.div-right {
  padding-right: 10px;
}
.padl16 {
  margin-left: 16px;
  padding-left: 0 !important;
  padding-right: 10px;
}
</style>
