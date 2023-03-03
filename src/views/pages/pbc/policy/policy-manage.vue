<template>
  <div>
    <TsContain> 
      <template slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="addPolicy()">策略</div>
          <div class="action-item tsfont-time" @click="viewPolicyAudit()">查看执行记录</div>
        </div>
      </template>
      <template slot="topRight">
        <InputSearcher
          v-model="searchParam.keyword"
          @change="searchPolicy()"
        ></InputSearcher>
      </template>
      <template v-slot:content>
        <TsTable
          v-if="policyData"
          v-bind="policyData"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template v-slot:name="{ row }">
            <a href="javascript:void(0)" @click="editPolicy(row.id)">{{ row.name }}</a>
          </template>
          <template v-slot:isActive="{ row }">
            <span v-if="row.isActive" class="text-success">是</span>
            <span v-else class="text-grey">否</span>
          </template>
          <template v-slot:cronExpression="{ row }">
            <TsQuartz :value="row.cronExpression" showType="read"></TsQuartz>
          </template>
          <template v-slot:execCount="{ row }">
            <a v-if="row.execCount>0" href="javascript:void(0)" @click="showPolicyAudit(row.id)">
              <span v-if="row.execCount > 99">99+</span>
              <span v-else>{{ row.execCount }}</span>
            </a>
            <span v-else>-</span>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li
                  class="tsfont-play"
                  @click="executePolicy(row)"
                >执行</li>
                <li
                  class="tsfont-trash-o"
                  @click="deletePolicy(row)"
                >删除</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <PolicyEdit v-if="isPolicyEditShow" :id="currentId" @close="closePolicyDialog"></PolicyEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    PolicyEdit: resolve => require(['./policy-edit.vue'], resolve),
    TsQuartz: resolve => require(['@/resources/plugins/TsQuartz/TsQuartz.vue'], resolve)
  },
  props: {},
  data() {
    return {
      searchParam: {},
      isPolicyEditShow: false,
      currentId: null,
      policyData: {},
      theadList: [
        {key: 'name', title: '名称'},
        {key: 'isActive', title: '是否激活'},
        {key: 'corporationName', title: '机构'},
        {key: 'phaseText', title: '执行阶段'},
        {key: 'interfaceCount', title: '接口数量'},
        {key: 'execCount', title: '执行次数'},
        {key: 'cronExpression', title: '定时策略'},
        {key: 'description', title: '说明'},
        {key: 'lastExecDate', title: '最近执行时间', type: 'time'},
        {key: 'action' }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchPolicy();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    showPolicyAudit(id) {
      this.$router.push({name: 'policy-audit-manage', params: {policyId: id}});
    },
    viewPolicyAudit() {
      this.$router.push({path: '/policy-audit-manage'});
    },
    addPolicy() {
      this.isPolicyEditShow = true;
      this.currentId = null;
    },
    editPolicy(id) {
      this.isPolicyEditShow = true;
      this.currentId = id;
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchPolicy();
    },
    changePage(currentPage) {
      this.searchPolicy(currentPage);
    },
    searchPolicy(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.pbc.policy.searchPolicy(this.searchParam).then(res => {
        this.policyData = res.Return;
        this.policyData.theadList = this.theadList;
      });
    },
    closePolicyDialog(needRefresh) {
      this.isPolicyEditShow = false;
      if (needRefresh) {
        this.searchPolicy();
      }
    },
    executePolicy(policy) {
      this.$createDialog({
        title: '执行确认',
        content: '确定执行策略：' + policy.name + '？',
        'on-ok': vnode => {
          this.$api.pbc.policy
            .executePolicy(policy.id)
            .then(res => {
              this.$Message.success(this.$t('message.content.executesuccess'));
              vnode.isShow = false;
              this.searchPolicy();
            });
        },
        'on-cancel': vnode => { 
          vnode.isShow = false;
        }
      });
    },
    deletePolicy(policy) {
      this.$createDialog({
        title: '删除警告',
        content: '确定删除策略：' + policy.name + '？',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.pbc.policy
            .deletePolicy(policy.id)
            .then(res => {
              this.$Message.success(this.$t('message.content.deletesuccess'));
              vnode.isShow = false;
              this.searchPolicy();
            });
        },
        'on-cancel': vnode => { 
          vnode.isShow = false;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
