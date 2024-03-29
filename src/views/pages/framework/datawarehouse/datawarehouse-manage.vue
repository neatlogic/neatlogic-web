<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="addReportDataSource()">{{ $t('page.datasource') }}</span>
          <span class="tsfont-upload action-item" @click="uploadAction()">{{ $t('page.import') }}</span>
          <span
            v-if="!isExportDataWareHouse"
            :class="{ 'text-disabled': !selectList || selectList.length == 0 }"
            class="tsfont-download action-item"
            @click="exportList()"
          >{{ $t('page.export') }}</span>
          <span v-else class="action-item">
            <Icon type="ios-loading" size="16" class="loading">{{ $t('term.codehub.exporting') }}</Icon>
          </span>
          <span v-auth="['ADMIN']" class="action-item"><AuditConfig :title="$t('term.framework.saveexpire')" auditName="DATAWAREHOUSE-AUDIT"></AuditConfig></span>
        </div>
      </template>
      <template slot="topRight">
        <InputSearcher v-model="searchParam.keyword" @change="searchReportDataSource(1)"></InputSearcher>
      </template>
      <template slot="topRight"></template>
      <div slot="content">
        <TsTable
          v-if="reportDataSourceData"
          v-bind="reportDataSourceData"
          :theadList="theadList"
          keyName="id"
          selectedRemain
          @getSelected="getSelected"
          @changeCurrent="updatePage"
          @changePageSize="updatePagesize"
        >
          <template v-slot:isActive="{ row }">
            <span v-if="row.isActive" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template v-slot:cronExpression="{ row }">
            <TsQuartz v-if="row.cronExpression" :value="row.cronExpression" showType="read"></TsQuartz>
          </template>
          <template v-slot:status="{ row }">
            <div>
              <div v-if="row.status == 'doing'" style="width: 42px">
                <Progress
                  :percent="99"
                  :stroke-width="10"
                  status="active"
                  :hide-info="true"
                />
              </div>
              <div v-else>{{ row.statusText }}</div>
            </div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul v-if="row.status != 'doing'" class="tstable-action-ul">
                <li class="tsfont-formstaticlist" @click="showReportDataSyncAudit(row)">{{ $t('term.framework.syncreport') }}</li>
                <li class="tsfont-play" @click="runReportDataSource(row)">{{ $t('term.framework.syncdata') }}</li>
                <li class="tsfont-db" @click="showReportData(row)">{{ $t('page.viewtarget', { target: $t('page.data') }) }}</li>
                <li v-if="$utils.isUserHasAuth('DATA_WAREHOUSE_MODIFY')" class="tsfont-filter-o" @click="editCondition(row)">{{ $t('dialog.title.edittarget', { target: $t('page.condition') }) }}</li>
                <!--<li class="tsfont-cloud" @click="editReportDataSource(row)">编辑同步策略</li>-->
                <li v-if="$utils.isUserHasAuth('DATA_WAREHOUSE_MODIFY')" class="tsfont-batch-upload" @click="editReportDataSource(row)">{{ $t('dialog.title.edittarget', { target: $t('page.datasource') }) }}</li>
                <li class="tsfont-trash-o" @click="deleteReportDataSource(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <!--<DataWarehouseEdit v-if="isShow" :id="currentDataSourceId" @close="closeEditDialog"></DataWarehouseEdit>-->
    <DataWarehouseEdit v-if="isEditShow" :id="currentDataSourceId" @close="closeImportDialog"></DataWarehouseEdit>
    <DataWarehouseAudit v-if="isAuditShow" :id="currentDataSourceId" @close="closeAuditDialog"></DataWarehouseAudit>
    <DataWarehouseData v-if="isDataShow" :id="currentDataSourceId" @close="closeDataDialog"></DataWarehouseData>
    <DataWarehouseConditionEdit v-if="isConditionShow" :id="currentDataSourceId" @close="closeConditionDialog"></DataWarehouseConditionEdit>
    <UploadDialog
      ref="uploadDialog"
      :actionUrl="actionUrl"
      :formatList="formatList"
      :showSuccessNotice="false"
      :isValid="true"
      @on-success="searchReportDataSource(1)"
    />
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    //DataWarehouseEdit: resolve => require(['./datawarehouse-edit.vue'], resolve),
    DataWarehouseConditionEdit: resolve => require(['./datawarehouse-condition-edit.vue'], resolve),
    DataWarehouseEdit: resolve => require(['./datawarehouse-edit.vue'], resolve),
    DataWarehouseAudit: resolve => require(['./datawarehouse-audit.vue'], resolve),
    DataWarehouseData: resolve => require(['./datawarehouse-data.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsQuartz: resolve => require(['@/resources/plugins/TsQuartz/TsQuartz'], resolve),
    AuditConfig: resolve => require(['@/views/components/auditconfig/auditconfig.vue'], resolve),
    UploadDialog: resolve => require(['@/resources/components/UploadDialog/UploadDialog.vue'], resolve)
  },
  mixins: [download],
  props: {},
  data() {
    return {
      isExportDataWareHouse: false,
      doingIdList: [],
      currentDataSourceId: null,
      reportDataSourceData: {},
      searchParam: { keyword: '' },
      isShow: false,
      isEditShow: false,
      isAuditShow: false,
      isDataShow: false,
      isConditionShow: false,
      theadList: [
        {
          key: 'selection',
          multiple: true
        },
        { key: 'name', title: this.$t('page.uniquekey') },
        { key: 'label', title: this.$t('page.name') },
        { key: 'isActive', title: this.$t('page.enable') },
        { key: 'moduleName', title: this.$t('term.framework.belongmodule') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'dataCount', title: this.$t('page.datacapacity') },
        { key: 'cronExpression', title: this.$t('term.framework.cronexpression') },
        { key: 'description', title: this.$t('page.explain') },
        { key: 'action' }
      ],
      timer: null,
      selectList: [],
      actionUrl: BASEURLPREFIX + '/api/binary/datawarehouse/datasource/import', //导入地址
      formatList: ['pak'] //导入文件格式
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchReportDataSource();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    runReportDataSource(row) {
      this.$createDialog({
        title: this.$t('dialog.title.syncconfirm'),
        content: this.$t('dialog.content.syncconfirm', { target: row.label }),
        'on-ok': vnode => {
          this.$api.framework.datawarehouse.execDataSource(row.id).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.searchReportDataSource();
            }
          });
        }
      });
    },
    editCondition(row) {
      this.isConditionShow = true;
      this.currentDataSourceId = row.id;
    },
    refreshReportDataSource() {
      this.clearTimer();
      if (this.doingIdList && this.doingIdList.length > 0) {
        this.$api.framework.datawarehouse.getDataSourceStatusByIds(this.doingIdList).then(res => {
          this.doingIdList = [];
          if (res.Return && res.Return.length > 0) {
            res.Return.forEach(element => {
              const oldElement = this.reportDataSourceData.tbodyList.find(a => a.id == element.id);
              if (element.status == 'doing') {
                this.doingIdList.push(element.id);
              }
              if (oldElement) {
                this.$set(oldElement, 'statusText', element.statusText);
                this.$set(oldElement, 'status', element.status);
                this.$set(oldElement, 'dataCount', element.dataCount);
              }
            });
          }
          if (this.doingIdList.length > 0) {
            this.timer = setTimeout(() => {
              this.refreshReportDataSource();
            }, 3000);
          }
        });
      }
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },
    searchReportDataSource(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.framework.datawarehouse.searchDataSource(this.searchParam).then(res => {
        this.reportDataSourceData = res.Return;
        this.reportDataSourceData.tbodyList.forEach(element => {
          if (element.status == 'doing') {
            this.doingIdList.push(element.id);
          }
        });
        this.refreshReportDataSource();
      });
    },
    editReportDataSource(row) {
      this.isEditShow = true;
      this.currentDataSourceId = row.id;
    },
    addReportDataSource() {
      this.isEditShow = true;
      this.currentDataSourceId = null;
    },
    /*editReportDataSource(row) {
      this.currentDataSourceId = row.id;
      this.isShow = true;
    },*/
    showReportDataSyncAudit(row) {
      this.currentDataSourceId = row.id;
      this.isAuditShow = true;
    },
    showReportData(row) {
      this.currentDataSourceId = row.id;
      this.isDataShow = true;
    },
    deleteReportDataSource(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.datasource') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.datawarehouse.deleteDataSource(row.id).then(res => {
            if (res.Status == 'OK') {
              this.searchReportDataSource();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    updatePage(currentPage) {
      this.searchReportDataSource(currentPage);
    },
    updatePagesize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchReportDataSource();
    },
    closeEditDialog(needRefresh) {
      this.isShow = false;
      if (needRefresh) {
        this.searchReportDataSource();
      }
    },
    closeImportDialog(needRefresh) {
      this.isEditShow = false;
      if (needRefresh) {
        this.searchReportDataSource();
      }
    },
    closeAuditDialog() {
      this.isAuditShow = false;
    },
    closeDataDialog() {
      this.isDataShow = false;
    },
    closeConditionDialog() {
      this.isConditionShow = false;
    },
    getSelected(indexList, itemList) {
      this.selectList = indexList;
    },
    exportList() {
      if (!this.selectList || this.selectList.length == 0) {
        return;
      }
      let param = {
        url: 'api/binary/datawarehouse/datasource/export',
        params: {
          idList: this.selectList
        },
        changeStatus: status => {
          if (status == 'start') {
            this.isExportDataWareHouse = true;
          } else if (status == 'success' || status == 'error') {
            this.isExportDataWareHouse = false;
          }
        }
      };
      this.download(param);
    },
    uploadAction() {
      this.$refs.uploadDialog.showDialog();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
