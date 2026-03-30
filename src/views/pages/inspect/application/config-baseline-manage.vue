<template>
  <div class="inspection-assets-manage-wrap padding">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div v-if="envList && envList.length > 0" class="pb-sm li-box">
      <Row :gutter="16">
        <Col
          v-for="item in envList"
          :key="item.id"
          :xs="12"
          :sm="8"
          :md="6"
          :lg="4"
          :xl="3"
          :xxl="2"
        >
          <div
            v-if="item.name"
            class="li-item text-action"
            :class="envId == item.id ? 'li-active li-text border-primary' : 'border-base bg-op'"
            @click="selectedEnv(item.name)"
          >{{ item.name }}</div>
        </Col>
      </Row>
    </div>
    <div class="bg-op radius-md padding mb-md">
      <div class="flex-between pb-sm">
        <div>
          <div class="h3">基线列表</div>
          <div class="text-tip margin-top-xs">操作系统入口：{{ entryViewDisplayText }}</div>
        </div>
        <div v-auth="'INSPECT_MODIFY'" class="action-group">
          <span class="action-item tsfont-setting" @click="openAiSettingDialog">配置设置</span>
        </div>
      </div>
      <NoData v-if="!baselineData.tbodyList || baselineData.tbodyList.length === 0"></NoData>
      <TsTable
        v-else
        v-bind="baselineData"
        :theadList="baselineTheadList"
        :loading="loadingShow"
      >
        <template v-slot:name="{ row }">
          <span>{{ getBaselineDisplayName(row) }}</span>
        </template>
        <template v-slot:currentActivatedTime="{ row }">
          <span v-if="row.currentActivatedTime">{{ row.currentActivatedTime | formatDate }}</span>
          <span v-else>-</span>
        </template>
        <template v-slot:currentStatus="{ row }">
          <span :class="getBaselineStatusClass(row.currentStatus)">{{ formatBaselineStatus(row.currentStatus) }}</span>
        </template>
        <template v-slot:envId="{ row }">
          <span>{{ getEnvName(row.envId) }}</span>
        </template>
        <template v-slot:appModuleId="{ row }">
          <span>{{ getAppModuleName(row.appModuleId) }}</span>
        </template>
        <template v-slot:currentPublisher="{ row }">
          <UserCard v-if="row.currentPublisherVo && row.currentPublisherVo.uuid" :uuid="row.currentPublisherVo.uuid" :hideAvatar="true"></UserCard>
          <span v-else>-</span>
        </template>
        <template v-slot:action="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-list" @click="openVersionDialog(row)">版本管理</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <div v-if="tableList && tableList.length > 0">
      <div v-for="(item, index) in tableList" :key="index">
        <div class="h3 padding-sm">{{ item.viewLabel }}</div>
        <TsTable
          v-bind="filterTypeFields(item)"
          @changeCurrent="(currentPage) => changeCurrent(currentPage, item, index)"
          @changePageSize="(pageSize) => changePageSize(pageSize, item, index)"
        >
          <template v-slot:ip="{ row }">
            <span class="text-href">
              <span>{{ row.ip.ip }}</span>
              <span v-if="row.ip.port">:{{ row.ip.port }}</span>
            </span>
          </template>
          <template v-slot:allIpList="{ row }">
            <div v-if="!$utils.isEmpty(row.allIpList)">
              <Tag
                v-for="(v, vindex) in row.allIpList"
                :key="vindex"
                class="cursor-pointer"
                @click.native="toCientityView(v)"
              >
                {{ v.name }}
              </Tag>
            </div>
            <div v-else></div>
          </template>
          <template v-slot:lcu="{ row }">
            <UserCard v-bind="row.lcu" :hideAvatar="true"></UserCard>
          </template>
          <template v-slot:lcd="{ row }">
            <div v-if="row.lcd">{{ row.lcd | formatDate }}</div>
          </template>
          <template v-slot:fcu="{ row }">
            <UserCard v-bind="row.fcu" :hideAvatar="true"></UserCard>
          </template>
          <template v-slot:fcd="{ row }">
            <div v-if="row.fcd">{{ row.fcd | formatDate }}</div>
          </template>
          <template v-slot:inspect="{ row }">
            <span v-if="row.inspect && row.inspect.time" :title="row.inspect.time | formatDate">
              <span :class="[row.inspect.cssClass, {'background-FATAL': row.inspect.value == 'FATAL'}]" class="vertical">{{ row.inspect.text }}</span>
              <span class="text-title">
                {{ handleTimes(row.inspect.time) | formatTimeCost({unitNumber: 1, language: 'zh',unit: 'minute'}) }} {{ $t('page.before') }}
              </span>
            </span>
            <span v-else>-</span>
          </template>
          <template v-slot:monitor="{ row }">
            <span v-if="row.monitor && row.monitor.time" :title="row.monitor.time | formatDate">
              <span :class="[row.monitor.cssClass, {'background-FATAL': row.monitor.value == 'FATAL'}]" class="vertical">{{ row.monitor.text }}</span>
              <span class="text-title">
                {{ handleTimes(row.monitor.time) | formatTimeCost({unitNumber: 1, language: 'zh',unit: 'minute'}) }} {{ $t('page.before') }}
              </span>
            </span>
            <span v-else>-</span>
          </template>
          <template v-slot:taskStatus="{ row }">
            <CommonStatus
              v-if="row.taskStatus"
              :statusName="row.taskStatus.text"
              :statusValue="row.taskStatus.value"
              type="text"
            ></CommonStatus>
            <span v-else>-</span>
          </template>
          <template v-slot:vendor="{ row }">
            <Tag
              v-if="!$utils.isEmpty(row.vendor)"
              class="cursor-pointer"
              @click.native="toCientityView(row.vendor)"
            >
              {{ row.vendor.name }}
            </Tag>
            <span v-else></span>
          </template>
          <template v-slot:ci="{ row }">
            <div v-if="!$utils.isEmpty(row.ci)" class="text-href" @click="toCiView(row.ci)">
              <span :class="row.ci.icon"></span>
              <span>{{ row.ci.label }}</span>
            </div>
            <span v-else></span>
          </template>
          <template v-slot:appModule="{ row }">
            <div v-if="!$utils.isEmpty(row.appModule)" class="text-href" @click="toCientityView(row.appModule)">
              <span :class="row.appModule.ciIcon"></span>
              <span>{{ row.appModule.name }}</span>
            </div>
            <span v-else></span>
          </template>
          <template v-slot:appEnvironment="{ row }">
            <Tag
              v-if="!$utils.isEmpty(row.appEnvironment)"
              class="cursor-pointer"
              @click.native="toGlobalAttrManage()"
            >
              {{ row.appEnvironment.value }}
            </Tag>
            <span v-else></span>
          </template>
          <template v-slot:appSystem="{ row }">
            <div v-if="!$utils.isEmpty(row.appSystem)" class="text-href" @click="toCientityView(row.appSystem)">
              <span :class="row.appSystem.ciIcon"></span>
              <span>{{ row.appSystem.name }}</span>
            </div>
            <span v-else></span>
          </template>
          <template v-slot:ownerList="{ row }">
            <div v-if="!$utils.isEmpty(row.ownerList)">
              <Tag
                v-for="(o, oindex) in row.ownerList"
                :key="oindex"
                class="cursor-pointer"
                @click.native="toCientityView(o)"
              >
                {{ o.name }}
              </Tag>
            </div>
            <div v-else></div>
          </template>
          <template v-slot:businessGroupList="{ row }">
            <div v-if="!$utils.isEmpty(row.businessGroupList)">
              <Tag
                v-for="(b, bindex) in row.businessGroupList"
                :key="bindex"
                class="cursor-pointer"
                @click.native="toCientityView(b)"
              >
                {{ b.name }}
              </Tag>
            </div>
            <div v-else></div>
          </template>
          <template v-slot:state="{ row }">
            <Tag
              v-if="!$utils.isEmpty(row.state)"
              class="cursor-pointer"
              @click.native="toCientityView(row.state)"
            >
              {{ row.state.name }}
            </Tag>
            <span v-else></span>
          </template>
          <template v-slot:dataCenter="{ row }">
            <Tag
              v-if="!$utils.isEmpty(row.dataCenter)"
              class="cursor-pointer"
              @click.native="toCientityView(row.dataCenter)"
            >
              {{ row.dataCenter.name }}
            </Tag>
            <span v-else></span>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul v-if="isEntryViewRow(row)" class="tstable-action-ul">
                <li class="tsfont-eye" @click="viewSnapshot(row)">快照列表</li>
              </ul>
              <span v-else>-</span>
            </div>
          </template>
        </TsTable>
      </div>
    </div>
    <NoData v-else></NoData>
    <ConfigBaselineVersionDialog
      v-if="isShowVersionDialog"
      :baselineId="currentBaselineRow && currentBaselineRow.id"
      :baselineName="getBaselineDisplayName(currentBaselineRow)"
      @close="closeVersionDialog"
      @refresh="getBaselineList"
      @deleted="handleBaselineDeleted"
    ></ConfigBaselineVersionDialog>
    <ConfigAiSettingDialog
      v-if="isShowAiSettingDialog"
      @close="closeAiSettingDialog"
      @refresh="handleAiSettingRefresh"
    ></ConfigAiSettingDialog>
    <ConfigSnapshotListDialog
      v-if="isShowSnapshotListDialog"
      :appSystemId="appSystemId"
      :appModuleId="getScopeAppModuleId(currentSnapshotRow)"
      :envId="getScopeEnvId(currentSnapshotRow)"
      :typeId="currentSnapshotRow && (currentSnapshotRow.typeId || currentSnapshotRow.ci && currentSnapshotRow.ci.id)"
      :resourceId="currentSnapshotRow && currentSnapshotRow.id"
      :resourceLabel="getResourceLabel(currentSnapshotRow)"
      :baselineName="getBaselineName(currentSnapshotRow)"
      schemaName="os"
      @close="closeSnapshotListDialog"
      @refresh="getBaselineList"
    ></ConfigSnapshotListDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    ConfigBaselineVersionDialog: () => import('./config-baseline-version-dialog.vue'),
    ConfigAiSettingDialog: () => import('./config-ai-setting-dialog.vue'),
    ConfigSnapshotListDialog: () => import('./config-snapshot-list-dialog.vue')
  },
  props: {
    appSystemId: {
      type: Number,
      default: null
    },
    appModuleId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loadingShow: false,
      envId: '',
      envList: [],
      tableList: [],
      entryViewName: '',
      entryViewOptionList: [],
      baselineData: {
        tbodyList: [],
        rowNum: 0,
        currentPage: 1,
        pageSize: 20
      },
      baselineTheadList: [
        { key: 'name', title: '基线名称' },
        { key: 'schemaName', title: '维度' },
        { key: 'envId', title: '应用环境' },
        { key: 'appModuleId', title: '应用模块' },
        { key: 'currentVersion', title: '生效版本' },
        { key: 'currentStatus', title: '状态' },
        { key: 'currentFieldCount', title: '生效字段数' },
        { key: 'currentActivatedTime', title: '生效时间' },
        { key: 'currentPublisher', title: '发布人' },
        { key: 'action', title: '' }
      ],
      tableData: {
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      },
      isShowSnapshotListDialog: false,
      currentSnapshotRow: null,
      isShowVersionDialog: false,
      currentBaselineRow: null,
      isShowAiSettingDialog: false,
      actionLoadingMap: {}
    };
  },
  async created() {
    await this.initData();
  },
  methods: {
    async initData() {
      this.tableData.currentPage = 1;
      await this.getEnvList();
      await this.getEntrySetting();
      await this.getBaselineList();
      await this.getTableData();
    },
    async getEntrySetting() {
      await this.$api.inspect.applicationInspect.getConfigAiSetting().then(res => {
        if (res && res.Status === 'OK') {
          this.entryViewOptionList = res.Return.viewOptionList || [];
          this.entryViewName = res.Return.effectiveViewName || '';
        }
      });
    },
    async getEnvList() {
      this.loadingShow = true;
      await this.$api.cmdb.applicationManage.getEnvironmenteList().then(res => {
        if (res.Status == 'OK') {
          this.envList = res.Return?.tbodyList || [];
          this.envList.unshift({
            name: this.$t('term.inspect.allenv'),
            id: ''
          });
          this.envList.push({
            name: this.$t('term.inspect.noconfigenv'),
            id: -2
          });
          this.envId = this.envId || '';
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    async getBaselineList() {
      if (this.$utils.isEmpty(this.appSystemId) && this.$utils.isEmpty(this.appModuleId)) {
        this.baselineData = {
          tbodyList: [],
          rowNum: 0,
          currentPage: 1,
          pageSize: 20
        };
        return;
      }
      await this.$api.inspect.applicationInspect.searchConfigBaseline({
        appSystemId: this.appSystemId,
        appModuleId: this.appModuleId,
        envId: this.envId || null,
        schemaName: 'os'
      }).then(res => {
        if (res && res.Status === 'OK') {
          let tbodyList = res.Return.tbodyList || [];
          this.baselineData = {
            tbodyList: tbodyList,
            rowNum: tbodyList.length,
            currentPage: 1,
            pageSize: 20
          };
        }
      });
    },
    getTableData(row, index) {
      let currentRow = {};
      let params = {
        appSystemId: this.appSystemId,
        appModuleId: this.appModuleId,
        envId: this.envId,
        viewName: this.entryViewName || null,
        typeId: row && row.type ? row.type.id : null,
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };
      if (this.$utils.isEmpty(this.appSystemId) && this.$utils.isEmpty(this.appModuleId)) {
        this.tableList = [];
        return false;
      }
      if (!this.entryViewName) {
        this.tableList = [];
        return false;
      }
      this.loadingShow = true;
      this.$api.inspect.applicationInspect.getNewapplicationInspectList(params).then(res => {
        if (res.Status == 'OK') {
          if (row && !this.$utils.isEmptyObj(row)) {
            let tableList = (res.Return && res.Return.tableList) ? res.Return.tableList[0] : [];
            this.markTableRowViewName(tableList);
            currentRow = Object.assign({}, row, tableList);
            this.$set(this.tableList, index, currentRow);
          } else {
            let tableList = res.Return.tableList || [];
            tableList.forEach(item => this.markTableRowViewName(item));
            this.tableList = tableList;
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    filterTypeFields(row) {
      let currentRow = this.$utils.deepClone(row);
      if (currentRow && currentRow.hasOwnProperty('type')) {
        delete currentRow.type;
      }
      if (currentRow && currentRow.hasOwnProperty('theadList')) {
        currentRow.theadList.push({
          title: '',
          key: 'action'
        });
      }
      return currentRow;
    },
    changeCurrent(currentPage, item, index) {
      this.tableData.currentPage = currentPage;
      this.getTableData(item, index);
    },
    changePageSize(pageSize, item, index) {
      this.tableData.pageSize = pageSize;
      this.tableData.currentPage = 1;
      this.getTableData(item, index);
    },
    selectedEnv(name) {
      let envId = null;
      this.envList.forEach(v => {
        if (v.name == name) {
          envId = v.id;
        }
      });
      this.envId = envId;
      this.tableData.currentPage = 1;
      this.getBaselineList();
      this.getTableData();
    },
    handleTimes(time) {
      let data = '-';
      if (time) {
        data = Date.parse(new Date()) - time;
      }
      return data;
    },
    toCientityView(row) {
      if (row && !this.$utils.isEmptyObj(row)) {
        window.open(HOME + '/inspect.html#/ci/' + row.ciId + '/cientity-view/' + row.id, '_blank');
      }
    },
    toGlobalAttrManage() {
      window.open(HOME + '/cmdb.html#/global-attr-manage', '_blank');
    },
    toCiView(ci) {
      if (ci && !this.$utils.isEmptyObj(ci)) {
        window.open(HOME + '/cmdb.html#/ci-view/' + ci.id, '_blank');
      }
    },
    getResourceLabel(row) {
      let ip = row && row.ip ? row.ip.ip : '';
      let port = row && row.ip && row.ip.port ? ':' + row.ip.port : '';
      return (row && row.name ? row.name + ' ' : '') + ip + port;
    },
    getBaselineName(row) {
      return this.buildBaselineDisplayName(
        row && row.appSystem && row.appSystem.name ? row.appSystem.name : this.currentAppSystemName,
        row && row.appModule ? (row.appModule.name || row.appModule.abbrName || row.appModule.id) : null,
        row && row.appEnvironment ? (row.appEnvironment.value || row.appEnvironment.name || row.appEnvironment.id) : null
      );
    },
    getBaselineDisplayName(row) {
      if (!row) {
        return '-';
      }
      return this.buildBaselineDisplayName(this.currentAppSystemName, this.getAppModuleName(row.appModuleId), this.getEnvName(row.envId));
    },
    buildBaselineDisplayName(appSystemName, appModuleName, envName) {
      let nameList = [
        appSystemName || '应用系统',
        appModuleName && appModuleName !== '-' ? appModuleName : '全部模块',
        envName && envName !== '-' ? envName : '全部环境'
      ];
      return nameList.join('-');
    },
    markTableRowViewName(table) {
      if (!table || !table.tbodyList || !table.viewName) {
        return;
      }
      table.tbodyList.forEach(item => {
        this.$set(item, '_viewName', table.viewName);
      });
    },
    isEntryViewRow(row) {
      if (!row || !this.entryViewName) {
        return false;
      }
      return row._viewName === this.entryViewName;
    },
    getScopeAppModuleId(row) {
      if (row && row.appModule && row.appModule.id) {
        return row.appModule.id;
      }
      return this.appModuleId || null;
    },
    getScopeEnvId(row) {
      if (row && row.appEnvironment && row.appEnvironment.id) {
        return row.appEnvironment.id;
      }
      return this.envId || null;
    },
    getAppModuleName(appModuleId) {
      if (!appModuleId) {
        return '-';
      }
      return this.appModuleNameMap[appModuleId] || appModuleId;
    },
    getEnvName(envId) {
      if (!envId && envId !== 0) {
        return '-';
      }
      return this.envNameMap[envId] || envId;
    },
    viewSnapshot(row) {
      if (!this.isEntryViewRow(row)) {
        return;
      }
      this.currentSnapshotRow = row;
      this.isShowSnapshotListDialog = true;
    },
    openVersionDialog(row) {
      this.currentBaselineRow = row;
      this.isShowVersionDialog = true;
    },
    openAiSettingDialog() {
      this.isShowAiSettingDialog = true;
    },
    closeSnapshotListDialog() {
      this.currentSnapshotRow = null;
      this.isShowSnapshotListDialog = false;
    },
    closeAiSettingDialog() {
      this.isShowAiSettingDialog = false;
    },
    handleAiSettingRefresh() {
      this.getEntrySetting().then(() => {
        this.getTableData();
      });
      this.getBaselineList();
    },
    closeVersionDialog() {
      this.currentBaselineRow = null;
      this.isShowVersionDialog = false;
      this.getBaselineList();
    },
    handleBaselineDeleted() {
      this.closeVersionDialog();
      this.getBaselineList();
    },
    formatBaselineStatus(status) {
      const statusMap = {
        draft: '草稿',
        pending_approval: '待审批',
        approved: '已审批',
        active: '已发布',
        rejected: '已拒绝'
      };
      return statusMap[status] || '-';
    },
    getBaselineStatusClass(status) {
      const classMap = {
        draft: 'text-grey',
        pending_approval: 'text-warning',
        approved: 'text-info',
        active: 'text-success',
        rejected: 'text-error'
      };
      return classMap[status] || '';
    },
    getRowActionKey(action, row) {
      return `${action}_${row && row.id ? row.id : 'unknown'}`;
    },
    isActionLoading(actionKey) {
      return !!this.actionLoadingMap[actionKey];
    },
    setActionLoading(actionKey, loading) {
      this.$set(this.actionLoadingMap, actionKey, loading);
    }
  },
  computed: {
    resourceOptions() {
      let list = [];
      this.tableList.forEach(table => {
        let tbodyList = table.tbodyList || [];
        tbodyList.forEach(row => {
          list.push({
            value: row.id,
            text: this.getResourceLabel(row)
          });
        });
      });
      return list;
    },
    appModuleNameMap() {
      let result = {};
      this.tableList.forEach(table => {
        (table.tbodyList || []).forEach(row => {
          if (row.appModule && row.appModule.id) {
            result[row.appModule.id] = row.appModule.name || row.appModule.abbrName || row.appModule.id;
          }
        });
      });
      return result;
    },
    envNameMap() {
      let result = {};
      this.tableList.forEach(table => {
        (table.tbodyList || []).forEach(row => {
          if (row.appEnvironment && row.appEnvironment.id) {
            result[row.appEnvironment.id] = row.appEnvironment.value || row.appEnvironment.name || row.appEnvironment.id;
          }
        });
      });
      return result;
    },
    currentAppSystemName() {
      for (let i = 0; i < this.tableList.length; i++) {
        let table = this.tableList[i];
        let row = (table.tbodyList || []).find(item => item && item.appSystem && item.appSystem.name);
        if (row) {
          return row.appSystem.name;
        }
      }
      return this.currentSnapshotRow && this.currentSnapshotRow.appSystem && this.currentSnapshotRow.appSystem.name
        ? this.currentSnapshotRow.appSystem.name
        : (this.currentBaselineRow && this.currentBaselineRow.appSystemName ? this.currentBaselineRow.appSystemName : '应用系统');
    },
    entryViewDisplayText() {
      if (!this.entryViewName) {
        return '未设置';
      }
      let option = this.entryViewOptionList.find(item => item.value === this.entryViewName);
      return option ? option.text : this.entryViewName;
    }
  },
  watch: {
    appSystemId() {
      this.initData();
    },
    appModuleId() {
      this.initData();
    }
  }
};
</script>
<style lang="less" scoped>
.inspection-assets-manage-wrap {
  .li-box {
    margin-bottom: -10px;
  }
  .li-item {
    padding: 6px 16px;
    border-radius: 4px;
    text-align: center;
    margin-bottom: 10px;
  }
}
</style>
