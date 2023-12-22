<template>
  <div>
    <TsContain :enableCollapse="true">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span v-auth="['ADMIN']"><AuditConfig auditName="CISYNC-AUDIT"></AuditConfig></span>
      </template>
      <div slot="topRight">
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="searchSyncAudit()"></CombineSearcher>
      </div>
      <div slot="sider">
        <TsUlList
          v-if="syncCiCollectionData.tbodyList"
          :value="ciCollectionId"
          valueName="id"
          textName="ciLabel"
          :isToggle="true"
          v-bind="syncCiCollectionData"
          @on-click="changeCiCollectionId"
          @updatePage="searchSyncCiCollection"
        >
          <template slot-scope="{ row }">
            <div class="grid text-action">
              <div style="text-align:center;" class="pt-xs">
                <span class="h3" :class="'tsfont-' + row.collectionName"></span>
              </div>
              <div style="position:relative" class="overflow">
                <div class="text-grey" :title="row.collectionName">
                  {{ row.collectionName }}
                </div>
                <div class="overflow">
                  <span :title="row.ciLabel + '(' + row.ciName + ')'">{{ row.ciLabel }}({{ row.ciName }})</span>
                </div>
                <div style="position:absolute;top:0px;right:0px;width:36px;text-align:center">
                  <Badge v-if="row.execCount" :count="row.execCount" type="primary"></Badge>
                </div>
              </div>
            </div>
          </template>
        </TsUlList>
      </div>
      <div slot="content" class="ci-content border-color">
        <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
        <TsTable
          v-if="syncAuditData"
          v-bind="syncAuditData"
          :fixedHeader="false"
          @changeCurrent="searchSyncAudit"
          @changePageSize="changeSyncAuditPageSize"
        >
          <template v-slot:timeCost="{ row }">
            <div>{{ row.timeCost | formatTimeCost({ textUnit: 'minute' }) }}</div>
          </template>
          <template v-slot:status="{ row }">
            <div>
              <div v-if="row.status == 'done'" class="text-success">
                {{ row.statusText }}
              </div>
              <div v-else-if="row.status == 'doing'" style="width:42px">
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
          <template v-slot:transactionCount="{ row }">
            <a v-if="row.transactionCount > 0" href="javascript:void(0)" @click="showCiEntityTransaction(row.transactionGroupId)">{{ row.transactionCount }}</a>
            <span v-else>-</span>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-trash-o" @click="deleteSyncAudit(row)">删除</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsUlList: resolve => require(['@/resources/components/TsUlList/TsUlList.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    AuditConfig: resolve => require(['@/views/components/auditconfig/auditconfig.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isLoading: false,
      searchVal: {},
      sessionName: 'sync-audit-manage',
      syncCiCollectionData: {},
      syncAuditData: {},
      searchCiCollectionParam: { collectMode: 'initiative', pageSize: 20 },
      currentPage: 1, //日志当前页
      pageSize: 20, //日志每页数量
      ciCollectionId: null, //左边选择的集合id
      doingIdList: [],
      theadList: [{ key: 'status', title: '状态' }, { key: 'error', title: '异常' }, { key: 'inputFromText', title: '发起方式' }, { key: 'startTime', title: '开始时间', type: 'time' }, { key: 'endTime', title: '结束时间', type: 'time' }, { key: 'timeCost', title: '耗时' }, { key: 'dataCount', title: '处理数据量' }, { key: 'transactionCount', title: '更新配置项' }, { key: 'action' }],
      searchConfig: {
        timer: null,
        search: false,
        searchList: [
          {
            type: 'select',
            name: 'status',
            dataList: [
              { value: 'doing', text: '同步中' },
              { value: 'done', text: '已完成' }
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
    if (this.$route.params.ciCollectionId) {
      this.ciCollectionId = this.$route.params.ciCollectionId;
    }
    this.searchSyncCiCollection();
    this.searchSyncAudit();
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
    deleteSyncAudit(row) {
      this.$createDialog({
        title: '警告',
        content: '确定删除选中执行记录？',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.sync.deleteSyncAudit(row.id).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.searchSyncAudit();
            this.searchSyncCiCollection();
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    changeSyncAuditPageSize(pageSize) {
      this.pageSize = pageSize;
      this.searchSyncAudit();
    },
    changeCiCollectionId(id) {
      if (this.ciCollectionId != id) {
        this.ciCollectionId = id;
      } else {
        this.ciCollectionId = null;
      }
      this.searchSyncAudit();
    },
    searchSyncCiCollection(currentPage) {
      if (currentPage) {
        this.searchCiCollectionParam.currentPage = currentPage;
      } else {
        this.searchCiCollectionParam.currentPage = 1;
      }
      this.$api.cmdb.sync.searchSyncCiCollection(this.searchCiCollectionParam).then(res => {
        this.syncCiCollectionData = res.Return;
        this.$set(this.syncCiCollectionData, 'dataList', res.Return.tbodyList);
        if (this.ciCollectionId) {
          this.syncCiCollectionData.dataList.forEach(element => {
            if (element.id == this.ciCollectionId) {
              this.$set(element, '_isSelected', true);
            }
          });
        }
      });
    },
    searchSyncAudit(currentPage) {
      this.clearTimer();
      if (currentPage) {
        this.currentPage = currentPage;
      } else {
        this.currentPage = 1;
      }
      let data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        ciCollectionId: this.ciCollectionId
      };
      Object.assign(data, this.searchVal);
      this.isLoading = true;
      this.$api.cmdb.sync
        .searchSyncAudit(data)
        .then(res => {
          this.syncAuditData = res.Return;
          this.syncAuditData.theadList = this.theadList;
          //检查是否有进行中采集，如果有启动定时刷新
          this.doingIdList = [];
          if (this.syncAuditData.tbodyList) {
            this.syncAuditData.tbodyList.forEach(element => {
              if (element.status == 'doing') {
                this.doingIdList.push(element.id);
              }
            });
          }
          if (this.doingIdList.length > 0) {
            this.checkAuditStatusInterval();
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    checkAuditStatusInterval() {
      this.clearTimer();
      if (this.doingIdList && this.doingIdList.length > 0) {
        this.$api.cmdb.sync.searchSyncAudit({ idList: this.doingIdList }).then(res => {
          this.doingIdList = [];
          if (res.Return && res.Return.length > 0) {
            res.Return.forEach(element => {
              const oldElement = this.syncAuditData.tbodyList.find(a => a.id == element.id);
              if (element.status == 'doing') {
                this.doingIdList.push(element.id);
              }
              if (oldElement) {
                this.$set(oldElement, 'status', element.status);
                this.$set(oldElement, 'statusText', element.statusText);
                this.$set(oldElement, 'endTime', element.endTime);
                this.$set(oldElement, 'timeCost', element.timeCost);
                this.$set(oldElement, 'dataCount', element.dataCount);
                this.$set(oldElement, 'transactionCount', element.transactionCount);
                this.$set(oldElement, 'error', element.error);
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
.grid {
  width: 100%;
  display: grid;
  grid-template-columns: 30px auto;
}
</style>
