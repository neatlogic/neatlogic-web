<template>
  <div>
    <TsContain :enableCollapse="true" topLeftWidth="82%" topRightWidth="18%">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back('/discovery-manage')">{{ $getFromPage() }}</span>
      </template>
      <template slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="addSyncCiCollection">{{ $t('page.config') }}</div>
          <div class="action-item tsfont-time" @click="toSyncAudit">{{ $t('term.cmdb.viewcollectrecord') }}</div>
          <div class="action-item tsfont-play-o" :class="{ disable: !hasInitiative }" @click="batchRun">{{ $t('term.cmdb.batchexecute') }}</div>
          <div class="action-item">
            <TsFormSwitch
              v-model="searchParam.isShowPhysicalType"
              :trueValue="1"
              :falseValue="0"
              :showStatus="true"
              :trueText="$t('term.cmdb.showphysicalcollectionconfig')"
              :falseText="$t('term.cmdb.hidephysicalcollectionconfig')"
              @on-change="searchSyncCiCollection(1)"
            ></TsFormSwitch>
          </div>
          <div class="action-item">
            <TsFormSwitch
              v-model="searchParam.collectMode"
              trueValue="initiative"
              :falseValue="null"
              :showStatus="true"
              :trueText="$t('term.cmdb.onlyinitiativecollect')"
              :falseText="$t('term.cmdb.onlyinitiativecollect')"
              @on-change="searchSyncCiCollection(1)"
            ></TsFormSwitch>
          </div>
        </div>
      </template>
      <template slot="topRight">
        <InputSearcher v-model="searchParam.keyword" @change="searchSyncCiCollection(1)"></InputSearcher>
      </template>
      <template v-slot:sider>
        <CollectionTypeList :currentCollection="searchParam.collectionName" :currentCollectionType="searchParam.collectionType" @change="changeCollection"></CollectionTypeList>
      </template>
      <div slot="content">
        <div ref="tableMain">
          <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
          <TsTable
            v-if="syncCiCollectionData && syncCiCollectionData.tbodyList && syncCiCollectionData.tbodyList.length > 0"
            :selectedRemain="true"
            :multiple="true"
            :theadList="theadList"
            v-bind="syncCiCollectionData"
            @changePageSize="changePageSize"
            @changeCurrent="changeCurrent"
            @getSelected="getSelectedSync"
          >
            <template v-slot:collectionName="{ row }">
              <a href="javascript:void(0)" @click="openCollectionData(row.collectionName)">
                <span>{{ row.collectionName }}</span>
                <span v-if="row.parentKey" class="text-grey fz10 ml-xs">{{ $t('term.cmdb.parentattr') }}:{{ row.parentKey }}</span>
              </a>
            </template>
            <template v-slot:isAutoCommit="{ row }">
              <span v-if="row.isAutoCommit" class="text-success">{{ $t('page.yes') }}</span>
              <span v-else class="text-error">{{ $t('page.no') }}</span>
            </template>
            <template v-slot:fcu="{ row }">
              <UserCard v-if="row.fcu" :uuid="row.fcu"></UserCard>
            </template>
            <template v-slot:lcu="{ row }">
              <UserCard v-if="row.lcu" :uuid="row.lcu"></UserCard>
            </template>
            <template v-slot:ciLabel="{ row }">
              <a href="javascript:void(0)" @click="toCi(row.ciId)">{{ row.ciLabel }}({{ row.ciName }})</a>
            </template>
            <template v-slot:syncPolicyList="{ row }">
              <div v-if="row.syncPolicyList && row.syncPolicyList.length > 0">
                <span
                  v-for="(policy, index) in row.syncPolicyList"
                  :key="index"
                  class="cursor"
                  :class="{
                    'mr-xs': index < row.syncPolicyList.length - 1,
                    'text-href': !!policy.isActive,
                    'text-grey': !policy.isActive
                  }"
                  @click.stop="editSchedulePolicy(row.id, policy.id)"
                >
                  <Tooltip :transfer="true">
                    <span class="tsfont-timer">{{ policy.name }}</span>
                    <div slot="content">
                      <div v-for="(cron, cindex) in policy.cronList" :key="cindex">
                        <TsQuartz :value="cron.cron" showType="read"></TsQuartz>
                      </div>
                    </div>
                  </Tooltip>
                </span>
              </div>
              <div v-else>-</div>
            </template>
            <template v-slot:execCount="{ row }">
              <a v-if="row.execCount > 0" href="javascript:void(0)" @click="showSyncAudit(row.id)">
                <span v-if="row.execCount > 99">99+</span>
                <span v-else>{{ row.execCount }}</span>
              </a>
              <span v-else>-</span>
            </template>
            <template v-slot:status="{ row }">
              <span v-if="row.status === 'doing'">
                <Progress
                  hide-info
                  :percent="99"
                  status="active"
                  style="width: 50px"
                />
              </span>
              <span v-else-if="row.status === 'pausing'">
                <Progress
                  hide-info
                  :percent="99"
                  status="active"
                  stroke-color="orange"
                  style="width: 50px"
                />
              </span>
              <span v-else>
                <span v-if="!row.error" :class="{ 'text-success': row.status === 'done', 'text-error': row.status === 'paused' }">{{ row.statusText }}</span>
                <span v-else class="text-error">
                  <span>{{ row.statusText }}</span>
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
                </span>
              </span>
            </template>
            <template v-slot:collectModeText="{ row }">
              <span v-if="row.collectMode == 'initiative'" class="text-info">{{ row.collectModeText }}</span>
              <span v-else>{{ row.collectModeText }}</span>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li v-if="row.collectMode == 'initiative' && row.status === 'doing' && row.lastAuditId" class="tsfont-pause" @click="pauseSync(row.lastAuditId)">{{ $t('page.pause') }}</li>
                  <li v-if="row.collectMode == 'initiative' && row.status === 'paused' && row.lastAuditId" class="tsfont-restart" @click="resumeSync(row.lastAuditId)">{{ $t('page.recover') }}</li>
                  <li v-if="row.collectMode == 'initiative' && !['doing', 'pausing'].includes(row.status)" class="tsfont-play-o" @click="execCiCollection(row)">{{ $t('page.execute') }}</li>
                  <li v-if="row.collectMode == 'initiative'" class="tsfont-timer" @click="addSchedulePolicy(row)">{{ $t('term.pbc.cromexpression') }}</li>
                  <li v-if="!['doing', 'pausing'].includes(row.status)" class="tsfont-edit" @click="editCiCollection(row)">{{ $t('page.edit') }}</li>
                  <li v-if="!['doing', 'pausing'].includes(row.status)" class="tsfont-trash-o" @click="deleteCiCollection(row)">{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
          <NoData v-else></NoData>
        </div>
      </div>
    </TsContain>
    <SyncEdit
      v-if="isEditDialogShow"
      :id="currentCiCollectionId"
      :collection="searchParam.collectionName"
      @close="closeEditDialog"
    ></SyncEdit>
    <SyncPolicyEdit
      v-if="isEditSyncPolicyShow"
      :id="currentSyncPolicyId"
      :ciCollectionId="currentCiCollectionId"
      @close="closeSyncPolicyDialog"
    ></SyncPolicyEdit>
    <CollectionData v-if="isCollectionDataShow" :collection="currentCollection" @close="closeCollectionData"></CollectionData>
    <LaunchConfirmDialog v-if="isLaunchShow" :collection="currentCollection" @close="closeLaunchDialog"></LaunchConfirmDialog>
  </div>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';

export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    SyncEdit: () => import('./sync-edit.vue'),
    SyncPolicyEdit: () => import('./syncpolicy-edit.vue'),
    CollectionData: () => import('./collection-data.vue'),
    CollectionTypeList: () => import('./collection-type-list.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsQuartz: () => import('@/resources/plugins/TsQuartz/TsQuartz.vue'),
    LaunchConfirmDialog: () => import('@/views/pages/cmdb/sync/launch-confirm-dialog.vue')
  },
  directives: { clipboard },
  props: {},
  data() {
    return {
      timmer: null,
      isLaunchShow: false,
      isLoading: false,
      contentHeight: '100',
      isEditDialogShow: false,
      isEditSyncPolicyShow: false,
      isCollectionDataShow: false,
      currentCollection: null,
      currentCiCollectionId: null,
      currentSyncPolicyId: null,
      searchParam: { isShowPhysicalType: 1 },
      selectedSync: [],
      syncCiCollectionData: {
        keyName: 'id',
        value: [],
        tbodyList: []
      },
      theadList: [
        { key: 'selection' },
        { key: 'ciLabel', title: this.$t('term.cmdb.ci') },
        { key: 'collectionName', title: this.$t('term.cmdb.collection') },
        { key: 'collectModeText', title: this.$t('term.cmdb.collectmode') },
        { key: 'isAutoCommit', title: this.$t('term.cmdb.autocommit') },
        { key: 'syncPolicyList', title: this.$t('term.cmdb.schedulepolicy') },
        { key: 'execCount', title: this.$t('term.cmdb.executecount') },
        { key: 'status', title: this.$t('page.status') },
        /*{ key: 'fcu', title: '创建者' },
        { key: 'fcd', title: '创建时间', type: 'time' },
        { key: 'lcu', title: '修改者' },
        { key: 'lcd', title: '修改时间', type: 'time' },*/
        { key: 'description', title: this.$t('page.description') },
        { key: 'lastSyncDate', title: this.$t('term.cmdb.lastcollecttime'), type: 'time', tooltip: this.$t('term.cmdb.lastcollecttimetip') },
        {
          key: 'action',
          type: 'action'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (!this.$isBack()) {
      const collection = this.$route.params['collection'] || '';
      const collectionType = this.$route.params['collectionType'] || '';
      if (collection) {
        this.searchParam.collectionName = collection;
      } else {
        this.searchParam.collectionType = collectionType;
      }
    }
  },
  beforeMount() {},
  mounted() {
    this.initHeight();
    this.searchSyncCiCollection();
    let _this = this;
    window.addEventListener('resize', _this.initHeight);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    let _this = this;
    window.removeEventListener('resize', _this.initHeight);
    this.clearTimer();
  },
  destroyed() {},
  methods: {
    resumeSync(id) {
      this.$api.cmdb.sync.resumeSyncCiCollection(id).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.searchSyncCiCollection();
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
              this.searchSyncCiCollection();
            }
          });
        }
      });
    },
    clipboardSuccess() {
      this.$Message.success(this.$t('message.copysuccess'));
    },
    closeLaunchDialog(idList) {
      this.isLaunchShow = false;
      this.currentCollection = null;
      if (idList) {
        this.refreshSyncCiCollection(idList);
      }
    },
    batchRun() {
      if (this.selectedSync.length > 0) {
        this.$createDialog({
          title: this.$t('term.cmdb.executeconfirm'),
          content: this.$t('term.cmdb.batchcollectconfirm', { count: this.selectedSync.length }),
          'on-ok': vnode => {
            const idList = this.selectedSync.map(element => {
              return element.id;
            });
            this.$api.cmdb.sync.launchSyncCiCollectionBatch(idList).then(res => {
              if (res.Status == 'OK') {
                vnode.isShow = false;
                this.$Message.success(this.$t('message.executesuccess'));
                this.searchSyncCiCollection();
              }
            });
          }
        });
      }
    },
    getSelectedSync(value, selectedList) {
      this.selectedSync = selectedList;
    },
    changeCurrent(currentPage) {
      this.searchSyncCiCollection(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchSyncCiCollection(1);
    },
    changeCollection(type, name) {
      if (name) {
        //点击了名称
        if (this.searchParam.collectionName === name) {
          this.$set(this.searchParam, 'collectionName', '');
        } else {
          this.$set(this.searchParam, 'collectionName', name);
        }
        this.$set(this.searchParam, 'collectionType', '');
      } else {
        //点击了分类
        if (this.searchParam.collectionType === type) {
          this.$set(this.searchParam, 'collectionType', '');
        } else {
          this.$set(this.searchParam, 'collectionType', type);
        }
        this.$set(this.searchParam, 'collectionName', '');
      }
      this.searchSyncCiCollection(1);
    },
    toCi(ciId) {
      this.$router.push('/ci-view/' + ciId);
    },
    openCollectionData(collection) {
      this.currentCollection = collection;
      this.isCollectionDataShow = true;
    },
    showSyncAudit(id) {
      this.$router.push({ name: 'sync-audit-manage', params: { ciCollectionId: id } });
    },
    editCiCollection(row) {
      this.currentCiCollectionId = row.id;
      this.isEditDialogShow = true;
    },
    addSchedulePolicy(row) {
      this.currentCiCollectionId = row.id;
      this.isEditSyncPolicyShow = true;
    },
    editSchedulePolicy(ciCollectionId, policyId) {
      this.currentCiCollectionId = ciCollectionId;
      this.currentSyncPolicyId = policyId;
      this.isEditSyncPolicyShow = true;
    },
    deleteCiCollection(row) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('term.cmdb.deletecollectmappingconfirm', { collection: row.collectionName, ci: row.ciLabel }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.sync.deleteSyncCiCollection(row.id).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.searchSyncCiCollection(1);
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    execCiCollection(row) {
      this.currentCollection = row;
      this.isLaunchShow = true;
    },
    addSyncCiCollection() {
      this.currentCiCollectionId = null;
      this.isEditDialogShow = true;
    },
    restoreHistory(historyData) {
      this.searchParam = historyData['searchParam'];
    },
    searchSyncCiCollection(currentPage) {
      this.isLoading = true;
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$addHistoryData('searchParam', this.searchParam);
      this.$api.cmdb.sync
        .searchSyncCiCollection(this.searchParam)
        .then(res => {
          res.Return.tbodyList.forEach(element => {
            //禁用被动采集的
            if (element.collectMode === 'passive') {
              element.isDisabled = true;
            }
          });
          this.syncCiCollectionData = Object.assign(this.syncCiCollectionData, res.Return);
          const idList = [];
          res.Return.tbodyList.forEach(element => {
            if (element.status === 'doing' || element.status === 'pausing') {
              idList.push(element.id);
            }
          });
          if (idList.length > 0) {
            this.refreshSyncCiCollection(idList);
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    clearTimer() {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
    },
    refreshSyncCiCollection(idList) {
      this.clearTimer();
      this.$api.cmdb.sync.searchSyncCiCollection({ idList: idList }).then(res => {
        const idList = [];
        res.Return.tbodyList.forEach(element => {
          if (element.status === 'doing' || element.status === 'pausing') {
            idList.push(element.id);
          }
          const row = this.syncCiCollectionData.tbodyList.find(d => d.id === element.id);
          if (row) {
            this.$set(row, 'lastAuditId', element.lastAuditId);
            this.$set(row, 'status', element.status);
            this.$set(row, 'statusText', element.statusText);
            this.$set(row, 'execCount', element.execCount);
            this.$set(row, 'lastSyncDate', element.lastSyncDate);
            this.$set(row, 'error', element.error);
          }
        });
        if (idList.length > 0) {
          this.timmer = setTimeout(() => {
            this.refreshSyncCiCollection(idList);
          }, 3000);
        }
      });
    },
    closeSyncPolicyDialog(needRefresh) {
      this.isEditSyncPolicyShow = false;
      this.currentSyncPolicyId = null;
      this.currentCiCollectionId = null;
      if (needRefresh) {
        this.searchSyncCiCollection();
      }
    },
    closeEditDialog(needRefresh) {
      this.isEditDialogShow = false;
      if (needRefresh) {
        this.searchSyncCiCollection();
      }
    },
    closeCollectionData() {
      this.currentCollection = null;
      this.isCollectionDataShow = false;
    },
    toSyncAudit() {
      this.$router.push({ path: '/sync-audit-manage' });
    },
    initHeight() {
      this.contentHeight = window.innerHeight - (this.$refs.tableMain ? this.$refs.tableMain.getBoundingClientRect().top : 0) - 16 - 4;
    }
  },
  filter: {},
  computed: {
    hasInitiative() {
      for (let i = 0; i < this.selectedSync.length; i++) {
        if (this.selectedSync[i]['collectMode'] === 'initiative') {
          return true;
        }
      }
      return false;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
