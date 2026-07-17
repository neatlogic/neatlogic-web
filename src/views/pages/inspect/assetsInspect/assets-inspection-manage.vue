
<template>
  <div>
    <TsContain :enableCollapse="true">
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-auth="'INSPECT_EXECUTE'" class="action-item tsfont-apps" @click="batchInspection()">{{ $t('term.inspect.batchinspect') }}</span>
          <span v-auth="'INSPECT_SCHEDULE_EXECUTE'" class="action-item tsfont-sla" @click="openInspectionScheduleDialog()">{{ $t('term.inspect.scheduleinspect') }}</span>
          <template v-if="reportData && reportData.tbodyList && reportData.tbodyList.length > 0">
            <span v-if="!downloadLoading" class="action-item tsfont-download" @click="exportAsset">{{ $t('page.export') }}</span>
            <span v-if="downloadLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
              <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
              {{ $t('page.export') }}
            </span>
          </template>
        </div>
      </template>
      <template v-slot:topRight>
        <CombineSearcher
          ref="combineSearcher"
          v-model="searchValue"
          v-bind="searchConfig"
          @change="changeCombineSearcher"
          @change-label="changeLabelCombineSearcher"
        >
          <template v-slot:batchSearchList="{valueConfig,textConfig}">
            <div>
              <TsFormItem :label="$t('page.batchsearch')" :tooltip="$t('term.cmdb.resourcebatchsearchtooltip')" labelPosition="left">
                <TsFormRadio
                  v-model="valueConfig.searchField"
                  :dataList="searchFieldRadioDataList"
                ></TsFormRadio>
              </TsFormItem>
              <TsFormItem :label="$t('page.batchsearchvalue')" labelWidth="0px" labelPosition="left">
                <TsFormInput
                  v-model="valueConfig.batchSearchList"
                  type="textarea"
                  :placeholder="'192.168.0.1\n192.168.0.2\n192.168.0.*'"
                  :autoSize="{minRows: 4}"
                  @change="(val)=>{changeBatchSearchList(val,textConfig)}"
                >
                </TsFormInput>
              </TsFormItem>
            </div>
          </template>
        </CombineSearcher>
      </template>
      <template v-slot:sider>
        <div>
          <ResourceTypeTree
            v-model="searchParam.typeId"
            class="resource-type-tree"
            @load="handleResourceTypeLoad"
            @change="handleResourceTypeChange"
          >
            <template v-slot:empty>
              <span class="text-href" @click="gotoAssetManagePage()">{{ $t('term.cmdb.gotoresourcetypetreesetting') }}</span>
            </template>
          </ResourceTypeTree>
        </div>
      </template>
      <template v-slot:content>
        <TsTable
          ref="reportTable"
          v-bind="reportData"
          :loading="loadingShow"
          :theadList="theadList"
          @changeCurrent="searchInspectionReport"
          @changePageSize="changePageSize"
        >
          <template v-slot:ip="{ row }">
            <span class="text-href" @click.stop="gotoDetails(row)">
              <span>{{ row.ip }}</span>
              <span v-if="row.port">:{{ row.port }}</span>
            </span>
          </template>
          <template v-slot:monitorTime="{ row }">
            <!-- 监控状态 -->
            <span v-if="row.monitorStatusJson && row.monitorTime" :title="row.monitorTime | formatDate">
              <span :class="[row.monitorStatusJson.cssClass, { 'background-FATAL': row.monitorStatusJson.value == 'FATAL' }]" class="vertical mr-xs">{{ row.monitorStatusJson.text }}</span>
              <span class="text-title fz10">{{ getTimeDiffer(row.monitorTime) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}{{ $t('page.before') }}</span>
            </span>
            <span v-else>
              <span>-</span>
            </span>
          </template>
          <template v-slot:taskStatus="{ row }">
            <CommonStatus
              v-if="row.jobPhaseNodeVo"
              :statusName="row.jobPhaseNodeVo.statusName"
              :statusValue="row.jobPhaseNodeVo.status"
              type="text"
            ></CommonStatus>
            <span v-else>-</span>
          </template>
          <template v-slot:inspectTime="{ row }">
            <!-- 巡检状态 -->
            <span v-if="row.inspectStatusJson && row.inspectTime" :title="row.inspectTime | formatDate">
              <span :class="[row.inspectStatusJson.cssClass, { 'background-FATAL': row.inspectStatusJson.value == 'FATAL' }]" class="vertical mr-xs">{{ row.inspectStatusJson.text }}</span>
              <span class="text-title fz10">{{ getTimeDiffer(row.inspectTime) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}{{ $t('page.before') }}</span>
              <!-- 'cursor':'pointer','color': row.jobPhaseNodeVo.statusVo.color -->
            </span>
            <span v-else>
              <span>-</span>
            </span>
          </template>
          <template v-slot:action="{ row }">
            <!-- 是否是巡检页面 -->
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-setting" @click="openRuleThresholdDialog(row)">{{ $t('term.inspect.thresholdrule') }}</li>
                <li v-if="row.jobPhaseNodeVo && row.jobPhaseNodeVo.jobId" class="tsfont-history" @click="toTaskJob(row)">{{ $t('term.inspect.jobdetail') }}</li>
                <li class="tsfont-circulation-o" @click="gotoCiEntity(row)">{{ $t('term.cmdb.viewcientity') }}</li>
                <li v-auth="['INSPECT_EXECUTE']" class="tsfont-inspection" @click="doInspection(row)">{{ $t('term.inspect.inspect') }}</li>
                <li
                  v-if="selectedTreeName && selectedTreeName == 'AccessEndPoint'"
                  v-auth="['INSPECT_MODIFY']"
                  class="tsfont-script"
                  @click="openScriptEditDialog(row)"
                >{{ $t('term.inspect.scriptmanage') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <InspectionDialog
      v-if="isShowInspectionDialog"
      :searchData="searchValue"
      :searchResultList="searchResultList"
      :ciData="currentCi"
      :ciEntityData="currentCiEntity"
      @close="closeInspectionDialog"
    ></InspectionDialog>
    <InspectionScheduleDialog v-if="isShowInspectionScheduleDialog" :id="scheduleId" @close="isShowInspectionScheduleDialog = false"></InspectionScheduleDialog>
    <ScriptEditDialog
      v-if="isShowScriptEditDialog"
      :isEdit="isScriptEdit"
      :resourceId="resourceId"
      @close="closeScriptEditDialog"
    ></ScriptEditDialog>
    <RuleOfThresholdDialog
      v-if="isShowRuleThresholdDialog"
      :appSystemId="appSystemId"
      :resourceId="ruleRsourceId"
      @close="closeRuleOfThresholdDialog"
    ></RuleOfThresholdDialog>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    InspectionDialog: () => import('./inspection-dialog.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    InspectionScheduleDialog: () => import('./inspection-schedule-dialog.vue'),
    ScriptEditDialog: () => import('./components/script-edit-dialog'), // 脚本管理
    ResourceTypeTree: () => import('@/resources/components/ResourceTypeTree'),
    RuleOfThresholdDialog: () => import('@/views/pages/inspect/application/threshold/rule-of-threshold-dialog.vue')
  },
  filters: {},
  mixins: [download],
  props: {},
  data() {
    return {
      downloadLoading: false,
      isShowRuleThresholdDialog: false,
      appSystemId: null,
      ruleRsourceId: null,
      searchResultList: [],
      searchParam: {},
      searchValue: {
        searchField: 'ip'
      },
      reportData: {
        tbodyList: []
      },
      theadList: [
        {
          title: this.$t('page.ipaddress'),
          key: 'ip'
        },
        {
          title: this.$t('page.type'),
          key: 'typeLabel'
        },
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.description'),
          key: 'description'
        },
        {
          title: this.$t('term.inspect.monitoringstate'),
          key: 'monitorTime'
        },
        {
          title: this.$t('term.autoexec.inspectstatus'),
          key: 'inspectTime'
        },
        {
          title: this.$t('term.inspect.inspectionjobstatus'),
          key: 'taskStatus'
        },
        {
          title: this.$t('term.inspect.iplist'),
          key: 'allIp',
          type: 'tag',
          valueKey: 'ip'
        },
        {
          title: this.$t('term.autoexec.subordinatedepartment'),
          key: 'bgList',
          type: 'tag',
          valueKey: 'bgName'
        },
        {
          title: this.$t('page.owner'),
          key: 'ownerList',
          type: 'usercards'
        },
        {
          title: this.$t('term.autoexec.assetstatus'),
          key: 'stateName'
        },
        {
          title: this.$t('page.networkarea'),
          key: 'networkArea'
        },
        {
          title: this.$t('page.tag'),
          key: 'tagList',
          type: 'tag'
        },
        {
          title: this.$t('term.deploy.maintenancewindow'),
          key: 'maintenanceWindow'
        },
        {
          key: 'action'
        }
      ],
      isShowInspectionDialog: false,
      isShowInspectionScheduleDialog: false,
      isShowScriptEditDialog: false,
      selectedTreeName: '', // 左侧选中树名称
      currentCiEntityId: null,
      timmer: null,
      loadingShow: false,
      isScriptEdit: false, // 是否是脚本编辑
      resourceId: 0,
      resourceList: [],
      flattenResourceMap: {},
      searchFieldRadioDataList: [
        {
          value: 'ip',
          text: 'IP'
        },
        {
          value: 'name',
          text: this.$t('page.name')
        }
      ],
      searchConfig: {
        placeholder: this.$t('term.inspect.inputargetnameip'),
        searchList: [
          {
            type: 'select',
            name: 'appSystemIdList',
            label: this.$t('page.apply'),
            multiple: true,
            value: null,
            dynamicUrl: '/api/rest/resourcecenter/appsystem/list/forselect',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            search: true,
            transfer: true,
            onChange: val => {
              let appSystemIdList = [];
              appSystemIdList = this.searchConfig.searchList.filter(item => {
                return item.name == 'appModuleIdList';
              });
              if (!this.$utils.isEmpty(appSystemIdList)) {
                appSystemIdList[0].params.appSystemIdList = val;
              }
              if (val) {
                this.$nextTick(() => {
                  if (this.searchValue && this.searchValue.appModuleIdList) {
                    this.$delete(this.searchValue, 'appModuleIdList');
                    this.searchInspectionReport(1);
                  }
                });
              }
            }
          },
          {
            type: 'select',
            name: 'appModuleIdList',
            label: this.$t('page.module'),
            multiple: true,
            dynamicUrl: '/api/rest/resourcecenter/appmodule/list',
            params: { appSystemIdList: null },
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            search: true,
            transfer: true
          },
          {
            type: 'checkbox',
            name: 'envIdList',
            label: this.$t('page.environment'),
            multiple: true,
            url: '/api/rest/resourcecenter/appenv/list/forselect',
            params: { needPage: false },
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          },
          {
            type: 'checkbox',
            name: 'inspectStatusList',
            label: this.$t('term.autoexec.inspectstatus'),
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.common.constvalue.InspectStatus' },
            multiple: true,
            className: 'block-span'
          },
          {
            type: 'slot',
            label: this.$t('page.batchsearch'),
            labelWidth: '0px',
            labelPosition: 'left',
            name: 'batchSearchList'
          },
          {
            type: 'select',
            name: 'vendorIdList',
            label: this.$t('page.manufacturer'),
            multiple: true,
            url: '/api/rest/resourcecenter/vendor/list/forselect',
            params: { needPage: false },
            rootName: 'tbodyList',
            textName: 'description',
            valueName: 'id',
            search: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'tagIdList',
            label: this.$t('page.tag'),
            multiple: true,
            dynamicUrl: '/api/rest/resourcecenter/tag/list/forselect',
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            search: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'protocolIdList',
            label: this.$t('term.inspect.connectionagreement'),
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            multiple: true,
            rootName: 'tbodyList',
            search: true,
            clearable: true,
            transfer: true,
            dealDataByUrl: this.dealDataByUrl || null
          },
          {
            type: 'checkbox',
            name: 'inspectJobPhaseNodeStatusList',
            label: this.$t('page.jobstatus'),
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.autoexec.constvalue.JobNodeStatus' },
            multiple: true,
            className: 'block-span'
          },
          {
            type: 'checkbox',
            name: 'stateIdList',
            label: this.$t('term.autoexec.assetstatus'),
            multiple: true,
            url: '/api/rest/resourcecenter/state/list/forselect',
            params: { needPage: false },
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          }
        ]
      },
      scheduleId: null
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.scheduleId) {
      this.scheduleId = Number(this.$route.query.scheduleId);
    }
    if (this.$route.query.isShowInspectionScheduleDialog) {
      this.isShowInspectionScheduleDialog = this.$route.query.isShowInspectionScheduleDialog;
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.timmer) {
      clearTimeout(this.timmer);
      this.timmer = null;
    }
  },
  destroyed() {},
  methods: {
    dealDataByUrl(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];
      nodeList.forEach(v => {
        let text = '';
        if (v.port) {
          text = v.name + '(' + v.port + ')';
        } else {
          text = v.name;
        }
        columlist.push({ text: text, value: v.id });
      });
      return columlist;
    },
    openScriptEditDialog(row) {
      this.isShowScriptEditDialog = true;
      if (row) {
        this.resourceId = row.id;
        this.isScriptEdit = !!row.script;
      }
    },
    closeScriptEditDialog() {
      this.isShowScriptEditDialog = false;
    },
    batchInspection() {
      // 批量巡检
      this.isShowInspectionDialog = true;
      this.searchResultList = [];
      let keyList = [];
      let totalText = this.$refs.combineSearcher.totalText;
      keyList = Object.keys(totalText);
      this.searchConfig && this.searchConfig.searchList.forEach((v) => {
        if (!this.$utils.isEmpty(keyList) && v && v.name && keyList.includes(v.name)) {
          this.searchResultList.push(`${v.label}：${totalText[v.name] instanceof Array ? totalText[v.name].join('|') : totalText[v.name]}`);
        }
      });
    },
    doInspection(row) {
      this.isShowInspectionDialog = true;
      if (row) {
        this.currentCiEntityId = row.id;
      }
    },
    searchInspectionReport(currentPage) {
      if (!this.searchParam.typeId) {
        this.clearReportData();
        return;
      }
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      const param = { ...this.searchParam, ...this.searchValue };
      if (!this.$utils.isEmpty(param.batchSearchList)) {
        param.batchSearchList = param.batchSearchList.split('\n');
      } else {
        param.batchSearchList = [];
      }
      this.$addHistoryData('searchValue', this.searchValue);
      this.$addHistoryData('searchParam', this.searchParam);
      this.loadingShow = true;
      this.$api.inspect.assetsInspect
        .searchReport(param)
        .then(res => {
          this.reportData = res.Return;
          const idList = [];
          if (this.reportData.tbodyList && this.reportData.tbodyList.length > 0) {
            this.reportData.tbodyList.forEach(element => {
              if (element.jobPhaseNodeVo && element.jobPhaseNodeVo.status && (element.jobPhaseNodeVo.status === 'running' || element.jobPhaseNodeVo.status === 'pending')) {
                idList.push(element.id);
              }
            });
            if (idList.length > 0) {
              setTimeout(() => {
                this.refresh(idList);
              }, 3000);
            }
          }
        })
        .finally(res => { this.loadingShow = false; });
    },
    refresh(idList) {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      this.$api.inspect.assetsInspect
        .searchReport({
          needPage: false,
          idList: idList,
          typeId: this.searchParam.typeId
        })
        .then(res => {
          const jobList = res.Return.tbodyList;
          const newIdList = [];
          if (jobList && jobList.length > 0) {
            jobList.forEach(job => {
              const index = this.reportData.tbodyList.findIndex(d => d.id === job.id);
              if (index >= 0) {
                this.$set(this.reportData.tbodyList, index, job);
              }
              if (job.jobPhaseNodeVo && job.jobPhaseNodeVo.status && (job.jobPhaseNodeVo.status === 'running' || job.jobPhaseNodeVo.status === 'pending')) {
                newIdList.push(job.id);
              }
            });
            this.$refs['reportTable'] && this.$refs['reportTable'].$forceUpdate(); //状态层次太深，需要强制刷新
            if (newIdList.length > 0) {
              this.timmer = setTimeout(() => {
                this.refresh(newIdList);
              }, 5000);
            }
          }
        });
    },
    handleResourceTypeLoad({ treeData = [] } = {}) {
      this.resourceList = treeData || [];
      this.flattenResourceMap = {};
      this.flattenResourceList(this.resourceList);
      if (!this.resourceList.length) {
        this.clearReportData();
      }
    },
    handleResourceTypeChange({ selectedId, node, selected } = {}) {
      if (!selected || !selectedId) {
        this.$set(this.searchParam, 'typeId', null);
        this.selectedTreeName = '';
        this.clearReportData();
        return;
      }
      this.$set(this.searchParam, 'typeId', selectedId);
      this.selectedTreeName = node && node.name ? node.name : '';
      this.searchInspectionReport(1);
    },
    clearReportData() {
      this.reportData = {
        ...this.reportData,
        tbodyList: [],
        currentPage: 1,
        rowNum: 0
      };
      this.loadingShow = false;
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchInspectionReport(1);
    },
    closeInspectionDialog(needRefresh) {
      this.isShowInspectionDialog = false;
      this.currentCiEntityId = null;
      if (needRefresh) {
        this.searchInspectionReport();
      }
    },
    //扁平化资源数据，变成一个id为key的map
    flattenResourceList(children) {
      let resourceList = children || this.resourceList;
      if (resourceList && resourceList.length > 0) {
        resourceList.forEach(resource => {
          this.flattenResourceMap[resource.id] = resource;
          if (resource.children) {
            this.flattenResourceList(resource.children);
          }
        });
      }
    },
    restoreHistory(historyData) {
      if (historyData['searchParam']) {
        this.searchParam = historyData['searchParam'];
      }
      if (historyData['searchValue']) {
        this.searchValue = historyData['searchValue'];
      }
    },
    openInspectionScheduleDialog() {
      this.isShowInspectionScheduleDialog = true;
    },
    getTimeDiffer(time) {
      let data = '-';
      if (time) {
        data = Date.parse(new Date()) - time;
      }
      return data;
    },
    gotoDetails(row) {
      this.$router.push({ path: './assets-detail-' + row.id });
    },
    gotoCiEntity(row) {
      this.$router.push({ path: '/ci/' + row.typeId + '/cientity-view/' + row.id });
      //window.open(HOME + '/cmdb.html#/ci/' + row.typeId + '/cientity-view/' + row.id, '_blank');
    },
    toTaskJob(row) {
      this.$router.push({ path: '/job-detail?id=' + row.jobPhaseNodeVo.jobId + '&status=' + row.jobPhaseNodeVo.status });
      //window.open(HOME + '/autoexec.html#/job-detail?id=' + row.jobPhaseNodeVo.jobId + '&status=' + row.jobPhaseNodeVo.status, '_blank');
    },
    changeBatchSearchList(val, textConfig) {
      if (this.$utils.isEmpty(val)) {
        this.$delete(textConfig, 'batchSearchList');
      } else {
        this.$set(textConfig, 'batchSearchList', val.split('\n'));
      }
    },
    changeCombineSearcher(val) {
      if (this.$utils.isEmpty(val)) {
        this.$set(this.searchValue, 'searchField', 'ip');
      }
      this.searchInspectionReport(1);
    },
    changeLabelCombineSearcher(val) {
      if (!this.$utils.isEmpty(this.searchValue.batchSearchList)) {
        this.$set(val, 'batchSearchList', this.searchValue.batchSearchList.split('\n'));
      }
    },
    openRuleThresholdDialog(row) {
      if (row && row.id) {
        this.ruleRsourceId = row.id;
        this.appSystemId = row.appSystemId;
        this.isShowRuleThresholdDialog = true;
      }
    },
    closeRuleOfThresholdDialog() {
      this.isShowRuleThresholdDialog = false;
    },
    gotoAssetManagePage() {
      window.open(HOME + '/cmdb.html#/asset-manage', '_blank');
    },
    exportAsset() {
      let {batchSearchList = ''} = this.$utils.deepClone(this.searchValue) || {};
      let batchIpList = [];
      if (batchSearchList) {
        if (batchSearchList.includes(',')) {
          batchIpList = batchSearchList.split(',');
        } else {
          batchIpList = batchSearchList.split('\n');
        }
      }
      let data = {
        url: 'api/binary/inspect/resource/report/export',
        params: {
          ...this.searchParam,
          ...this.searchValue,
          batchSearchList: batchIpList
        },
        changeStatus: status => {
          if (status === 'start') {
            this.downloadLoading = true;
          } else if (status === 'success' || status === 'error') {
            this.downloadLoading = false;
          }
        }
      };
      this.download(data);
    }
  },
  computed: {
    currentCi() {
      if (this.searchParam && this.searchParam.typeId) {
        return this.flattenResourceMap[this.searchParam.typeId];
      }
      return null;
    },
    currentCiEntity() {
      if (this.currentCiEntityId && this.reportData && this.reportData.tbodyList) {
        return this.reportData.tbodyList.find(d => d.id === this.currentCiEntityId);
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
