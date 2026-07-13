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
              <div style="text-align: center" class="pt-xs">
                <span class="h3" :class="'tsfont-' + row.collectionName"></span>
              </div>
              <div style="position: relative" class="overflow">
                <div class="text-grey" :title="row.collectionName">
                  {{ row.collectionName }}
                </div>
                <div class="overflow">
                  <span :title="row.ciLabel + '(' + row.ciName + ')'">{{ row.ciLabel }}({{ row.ciName }})</span>
                </div>
                <div style="position: absolute; top: 0px; right: 0px; width: 36px; text-align: center">
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
              <div v-else-if="row.status == 'doing'" style="width: 42px">
                <Progress
                  :percent="99"
                  :stroke-width="10"
                  status="active"
                  :hide-info="true"
                />
              </div>
              <div v-else-if="row.status == 'pausing'" style="width: 42px">
                <Progress
                  :percent="99"
                  :stroke-width="10"
                  stroke-color="orange"
                  status="active"
                  :hide-info="true"
                />
              </div>
              <div v-else-if="row.status == 'paused'" class="text-error">
                {{ row.statusText }}
              </div>
            </div>
          </template>
          <template v-slot:error="{ row }">
            <Poptip
              v-if="row.error"
              trigger="hover"
              :title="$t('page.exception')"
              word-wrap
              width="500"
              :transfer="true"
            >
              <span class="text-error tsfont-warning-s"></span>
              <div slot="content">
                <div style="max-height: 400px; overflow: auto">{{ row.error }}</div>
                <div style="text-align: right">
                  <Button v-clipboard="row.error" v-clipboard:success="clipboardSuccess" size="small">{{ $t('page.copy') }}</Button>
                </div>
              </div>
            </Poptip>
          </template>
          <template v-slot:errorDataCount="{ row }">
            <span v-if="row.errorDataCount" class="text-error cursor" @click="viewErrorData(row)">{{ row.errorDataCount }}</span>
            <span v-else class="text-grey">-</span>
          </template>
          <template v-slot:dataCount="{ row }">
            <span v-if="row.dataCount" class="text-grey">{{ row.dataCount }}</span>
            <span v-else class="text-grey">-</span>
          </template>
          <template v-slot:transactionCount="{ row }">
            <a v-if="row.transactionCount > 0" href="javascript:void(0)" @click="showCiEntityTransaction(row.transactionGroupId)">{{ row.transactionCount }}</a>
            <span v-else class="text-grey">-</span>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-if="row.status === 'doing'" class="tsfont-pause" @click="pauseSync(row.id)">{{ $t('page.pause') }}</li>
                <li v-if="row.status === 'paused'" class="tsfont-restart" @click="resumeSync(row.id)">{{ $t('page.recover') }}</li>
                <li v-if="!['doing', 'pausing'].includes(row.status)" class="tsfont-trash-o" @click="deleteSyncAudit(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
  </div>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';

export default {
  name: '',
  components: {
    TsUlList: () => import('@/resources/components/TsUlList/TsUlList.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue')
  },
  directives: { clipboard },
  props: {},
  data() {
    return {
      isLoading: false,
      searchVal: {},
      searchParam: {},
      sessionName: 'sync-audit-manage',
      syncCiCollectionData: {},
      syncAuditData: {},
      searchCiCollectionParam: { collectMode: 'initiative', pageSize: 20 },
      currentPage: 1, //日志当前页
      pageSize: 20, //日志每页数量
      ciCollectionId: null, //左边选择的集合id
      doingIdList: [],
      theadList: [
        {
          key: 'status',
          title: this.$t('page.status')
        },
        {
          key: 'ciCollectionName',
          title: this.$t('term.cmdb.collection')
        },
        { key: 'error', title: this.$t('page.exception') },
        { key: 'inputFromText', title: this.$t('term.cmdb.inputfrom') },
        { key: 'startTime', title: this.$t('page.starttime'), type: 'time' },
        { key: 'endTime', title: this.$t('page.endtime'), type: 'time' },
        { key: 'timeCost', title: this.$t('term.cmdb.timecost') },
        { key: 'errorDataCount', title: this.$t('term.cmdb.errordatacount') },
        { key: 'dataCount', title: this.$t('term.cmdb.datacount') },
        { key: 'transactionCount', title: this.$t('term.cmdb.updatedcientity') },
        { key: 'action' }
      ],
      searchConfig: {
        timer: null,
        search: false,
        searchList: [
          {
            type: 'select',
            name: 'status',
            dataList: [
              { value: 'doing', text: this.$t('term.cmdb.syncing') },
              { value: 'paused', text: this.$t('term.cmdb.paused') },
              { value: 'done', text: this.$t('term.cmdb.done') }
            ],
            label: this.$t('page.status'),
            transfer: true,
            labelPosition: 'top'
          },
          {
            type: 'radio',
            name: 'hasError',
            label: this.$t('term.cmdb.errorstatus'),
            dataList: [
              { value: 'false', text: this.$t('term.cmdb.noerror') },
              { value: 'true', text: this.$t('term.cmdb.haserror') }
            ],
            transfer: true,
            labelPosition: 'top'
          },
          {
            type: 'daterange',
            name: 'startTimeRange',
            label: this.$t('page.starttime'),
            transfer: true,
            format: 'yyyy-MM-dd',
            labelPosition: 'top'
          },
          {
            type: 'daterange',
            name: 'endTimeRange',
            label: this.$t('page.endtime'),
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
    resumeSync(id) {
      this.$api.cmdb.sync.resumeSyncCiCollection(id).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.searchSyncAudit();
        }
      });
    },
    pauseSync(id) {
      this.$createDialog({
        title: this.$t('dialog.title.pausecomfirm'),
        content: this.$t('dialog.content.pausecomfirm', { target: this.$t('term.cmdb.collect') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.sync.pauseSyncCiCollection(id).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              vnode.isShow = false;
              this.searchSyncAudit();
            }
          });
        }
      });
    },
    viewErrorData(row) {
      this.$router.push({ path: '/discovery-data/' + row.ciCollectionName, query: { hasError: 1 } });
    },
    clipboardSuccess() {
      this.$Message.success(this.$t('message.copysuccess'));
    },
    deleteSyncAudit(row) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('term.cmdb.deleteauditconfirm'),
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
      this.searchParam.pageSize = pageSize;
      this.searchSyncAudit(1);
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
        this.searchParam.currentPage = currentPage;
      }
      this.searchParam.ciCollectionId = this.ciCollectionId;
      this.isLoading = true;
      this.$api.cmdb.sync
        .searchSyncAudit({ ...this.searchParam, ...this.searchVal })
        .then(res => {
          this.syncAuditData = res.Return;
          this.syncAuditData.theadList = this.theadList;
          //检查是否有进行中采集，如果有启动定时刷新
          this.doingIdList = [];
          if (this.syncAuditData.tbodyList) {
            this.syncAuditData.tbodyList.forEach(element => {
              if (['doing', 'pausing'].includes(element.status)) {
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
              if (['doing', 'pausing'].includes(element.status)) {
                this.doingIdList.push(element.id);
              }
              if (oldElement) {
                this.$set(oldElement, 'status', element.status);
                this.$set(oldElement, 'statusText', element.statusText);
                this.$set(oldElement, 'endTime', element.endTime);
                this.$set(oldElement, 'timeCost', element.timeCost);
                this.$set(oldElement, 'errorDataCount', element.errorDataCount);
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
<style lang="less">
.grid {
  width: 100%;
  display: grid;
  grid-template-columns: 30px auto;
}
</style>
