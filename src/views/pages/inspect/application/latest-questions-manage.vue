<template>
  <div class="latest-question-manage-box padding">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="action-group text-right pb-sm">
      <span :class="isExpandCollapse ? 'tsfont-up' : 'tsfont-down'" class="action-item" @click="handleExpandCollapseAll()">
        <span v-if="isExpandCollapse">{{ $t('page.packup') }}</span>
        <span v-else>{{ $t('page.expand') }}</span>
      </span>
      <span class="action-item tsfont-rotate-right" @click="handleRefresh()">{{ $t('page.refresh') }}</span>
      <span v-if="!downloadLoading" v-download="downloadUrl" class="action-item tsfont-download">{{ $t('page.export') }}</span>
      <span v-if="downloadLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
        <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
        {{ $t('page.export') }}
      </span>
      <span class="action-item tsfont-mail-unread-o" @click="sendEmail">{{ $t('page.mail') }}</span>
    </div>
    <div v-if="envList && envList.length > 0" class="li-box">
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
    <div v-if="tableList && tableList.length > 0 ">
      <div v-for="(item, tIndex) in tableList" :key="tIndex">
        <div class="h3 padding-sm">{{ item.type.label }}</div>
        <div>
          <TsTable
            v-if="!loadingShow"
            v-bind="filterTypeFields(item)"
            :theadList="theadList"
            :fixedHeader="false"
            keyName="id"
            canExpand
            class="inner-table"
            @changeCurrent="(currentPage) => changeCurrent(currentPage, item, tIndex)"
            @changePageSize="(pageSize) => changePageSize(pageSize, item, tIndex)"
          >
            <template v-slot:ip="{ row }">
              <span class="text-href" @click.stop="toAssetsDetail(row)">
                <span>{{ row.ip }}</span>
                <span v-if="row.port">:{{ row.port }}</span>
              </span>
            </template>
            <template v-slot:monitorTime="{ row }">
              <!-- 监控状态 -->
              <span v-if="row.monitorStatusJson && row.monitorTime" :title="row.monitorTime | formatDate">
                <span :class="[row.monitorStatusJson.cssClass, { 'background-FATAL': row.monitorStatusJson.value == 'FATAL' }]" class="mr-xs cursor">{{ row.monitorStatusJson.text }}</span>
                <span class="text-title">{{ handleTime(row.monitorTime) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}{{ $t('page.before') }}</span>
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
                <span :class="[row.inspectStatusJson.cssClass, { 'background-FATAL': row.inspectStatusJson.value == 'FATAL' }]" class="mr-xs cursor" @click.stop="toAssetsDetail(row)">{{ row.inspectStatusJson.text }}</span>
                <span class="text-title">{{ handleTime(row.inspectTime) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}{{ $t('page.before') }}</span>
              </span>
              <span v-else>
                <span>-</span>
              </span>
            </template>
            <template v-slot:expandCollapseArrow="{ row ,index}">
              <span :class="{ 'tsfont-right': !row._expand, 'tsfont-down open': row._expand }" class="table-icon" @click.stop="openInnerTable(row, tIndex, index)"></span>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-setting" @click="openRuleThresholdDialog(row)">{{ $t('term.inspect.thresholdrule') }}</li>
                  <li v-if="row && row.jobPhaseNodeVo && row.jobPhaseNodeVo.jobId" class="tsfont-history" @click="toJobDetail(row)">{{ $t('term.inspect.jobdetail') }}</li>
                  <li class="tsfont-ci" @click="toCientityView(row)">{{ $t('term.cmdb.viewcientity') }}</li>
                </ul>
              </div>
            </template>
            <template v-slot:expand="{ row }">
              <ExpandTable v-if="row._expand" style="margin-left: 40px;" :inspectResultList="getInnerTbodyList(row.inspectResult)"></ExpandTable>
            </template>
          </TsTable>
        </div>
      </div>
    </div>
    <NoData v-else></NoData>
    <SendEmail
      v-if="isShowSendEmail"
      :params="{
        isNeedAlertDetail: 1,
        appSystemId: appSystemId,
        inspectStatusList: inspectStatusList
      }"
      @closeSendEmailDialog="closeSendEmailDialog"
    ></SendEmail>
    <RuleOfThresholdDialog
      v-if="isShowRuleThresholdDialog"
      :appSystemId="appSystemId"
      :resourceId="resourceId"
      @close="closeRuleOfThresholdDialog"
    ></RuleOfThresholdDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    ExpandTable: () => import('@/views/pages/inspect/recentIssues/component/expand-table.vue'),
    SendEmail: () => import('@/views/pages/inspect/recentIssues/component/send-email.vue'),
    RuleOfThresholdDialog: () => import('@/views/pages/inspect/application/threshold/rule-of-threshold-dialog.vue')
  },
  directives: { download },
  props: {
    appSystemId: {
      // 应用Id
      type: Number,
      default: null
    },
    appModuleId: {
      // 模块Id
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loadingShow: true,
      isExpandCollapse: true, // 处理展开收起，默认展开
      isShowSendEmail: false,
      downloadLoading: false,
      isShowRuleThresholdDialog: false,
      typeName: '',
      envId: null, // 环境ID
      envList: [], // 环境列表
      expandCollapseIdList: [], // 展开收起Id列表，下榻页面，返回显示用
      isBack: false,
      tableList: [],
      tableConfig: {
        tbodyList: [],
        pageSize: 20,
        currentPage: 1,
        rowNum: null
      },
      theadList: [
        {
          title: '',
          key: 'expandCollapseArrow' // 展开收起箭头
        },
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
          title: '',
          key: 'action'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async initData() {
      await this.getEnvList();
      await this.getInspectStatusList();
      await this.getTableData();
    },
    async getEnvList() {
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
          this.envId = this.envId || ''; // 有环境id，就取环境ID的值，否则默认选择所有环境（用于下榻页面返回）
        }
      });
    },
    async getInspectStatusList() {
      // 获取巡检状态列表
      this.inspectStatusList = [];
      await this.$api.common.getSelectList({enumClass: 'InspectStatus'}).then((res) => {
        if (res.Status == 'OK') {
          let nodeList = res.Return || [];
          if (nodeList && nodeList.length > 0) {
            nodeList.forEach(item => {
              if (item && item.value != 'normal') {
                this.inspectStatusList.push(item.value);
              }
            });
          }
        }
      });
    },
    getTableData(row, index) {
      //获取表格数据
      let params = {
        appSystemId: this.appSystemId,
        appModuleId: this.appModuleId,
        envId: this.envId,
        inspectStatusList: this.inspectStatusList,
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize
      };
      this.$addHistoryData('isExpandCollapse', this.isExpandCollapse);
      this.$addHistoryData('expandCollapseIdList', this.expandCollapseIdList);
      this.$addHistoryData('envId', this.envId);
      this.loadingShow = true;
      this.$api.inspect.applicationInspect.getapplicationInspectList(params).then(res => {
        if (res.Status == 'OK') {
          if (row && !this.$utils.isEmptyObj(row)) {
            // 内嵌列表翻页
            let tableList = (res.Return && res.Return.tableList) ? ((res.Return.tableList.length > index) ? res.Return.tableList[index] : res.Return.tableList[0]) : [];
            let currentRow = Object.assign({}, row, tableList);
            this.tableConfig.pageSize = tableList ? tableList.pageSize : 20;
            this.tableConfig.currentPage = tableList ? tableList.currentPage : 1;
            this.$set(this.tableList, index, currentRow);
          } else {
            this.tableList = res.Return ? res.Return.tableList : [];
            this.tableConfig.pageSize = 20;
            this.tableConfig.currentPage = 1;
          }
          let resourceIdList = [];
          if (this.tableList && !this.$utils.isEmpty(this.tableList)) {
            this.tableList.forEach(item => {
              if (item && item.tbodyList && !this.$utils.isEmpty(item.tbodyList)) {
                item.tbodyList.forEach((v) => {
                  if (v && v.id) {
                    resourceIdList.push(v.id);
                  }
                });
              }
            });
          }
          if (this.$utils.isEmpty(this.expandCollapseIdList) && this.isExpandCollapse) {
            // 首次需要把id存起来，下榻页面返回需要使用
            this.expandCollapseIdList = resourceIdList;
            this.$addHistoryData('expandCollapseIdList', this.expandCollapseIdList);
          }
          this.getInnerTableList(resourceIdList); // 获取内嵌表格数据
        }
      }).catch(() => {
        this.loadingShow = false;
      });
    },
    getInnerTableList(resourceIdList) {
      // 获取内嵌表格数据
      this.loadingShow = true;
      if (resourceIdList && !this.$utils.isEmpty(resourceIdList)) {
        this.$api.inspect.inspectJob.getRecentIssuesInnerTableList({ resourceIdList: resourceIdList }).then(res => {
          if (res.Status == 'OK') {
            let obj = res.Return;
            this.tableList.forEach(item => {
              if (item && item.tbodyList && !this.$utils.isEmpty(item.tbodyList)) {
                item.tbodyList.forEach((v) => {
                  Object.keys(obj).forEach(n => {
                    if (v.id == n) {
                      this.$set(v, 'inspectResult', obj[n] ? Object.values(obj[n]) : []);
                    }
                  });
                });
              }
            });
            if (this.tableList && !this.$utils.isEmpty(this.tableList)) {
              this.tableList.forEach(val => {
                if (val && val.tbodyList && !this.$utils.isEmpty(val.tbodyList)) {
                  val.tbodyList.forEach((v) => {
                    if (v && v.hasOwnProperty('inspectResult') && !this.$utils.isEmpty(v.inspectResult)) {
                      if (this.isBack) { // 下榻页面返回，恢复之前展开收起状态
                        v['_expand'] = !this.$utils.isEmpty(this.expandCollapseIdList) ? this.expandCollapseIdList.includes(v.id) : this.isExpandCollapse;
                      } else {
                        v['_expand'] = this.isExpandCollapse;
                      }
                    }
                  });
                }
              });
            }
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      } else {
        this.loadingShow = false;
      }
    },
    changeCurrent(currentPage, item, index) {
      this.tableConfig.currentPage = currentPage;
      this.getTableData(item, index);
    },
    changePageSize(pageSize, item, index) {
      this.tableConfig.pageSize = pageSize;
      this.getTableData(item, index);
    },
    restoreHistory(historyData) {
      // 下榻页面，返回搜索条件保持一致
      this.isBack = true;
      this.envId = historyData['envId'];
      this.expandCollapseIdList = historyData['expandCollapseIdList'];
      this.isExpandCollapse = historyData['isExpandCollapse'];
    },
    selectedEnv(name) {
      let envId = null;
      this.envList.forEach(v => {
        if (v.name == name) {
          envId = v.id;
        }
      });
      this.envId = envId;
      this.getTableData();
    },
    filterTypeFields(row) {
      // 过滤类型字段，修复控制台报错问题
      let currentRow = this.$utils.deepClone(row);
      if (currentRow && currentRow.hasOwnProperty('type')) {
        delete currentRow.type;
      }
      return currentRow;
    },
    handleTime(time) {
      let data = '-';
      if (time) {
        data = Date.parse(new Date()) - time;
      }
      return data;
    },
    handleExpandCollapseAll() {
      // 处理展开收起所有(内嵌表格)
      this.isExpandCollapse = !this.isExpandCollapse;
      let expandCollapseIdList = [];
      if (this.tableList && !this.$utils.isEmpty(this.tableList)) {
        this.tableList.forEach(item => {
          if (item && item.tbodyList && !this.$utils.isEmpty(item.tbodyList)) {
            item.tbodyList.forEach((v) => {
              v['_expand'] = this.isExpandCollapse;
              if (this.isExpandCollapse) {
                // 展开，需要存储展开的id
                expandCollapseIdList.push(v.id);
              } else {
                expandCollapseIdList = [];
              }
            });
          }
        });
      }
      this.expandCollapseIdList = expandCollapseIdList;
      this.$addHistoryData('isExpandCollapse', this.isExpandCollapse);
      this.$addHistoryData('expandCollapseIdList', expandCollapseIdList);
    },
    openInnerTable(row, tIndex, rowIndex) {
      // 展开收起内嵌表格
      if (row['_expand']) {
        row._expand = false;
        this.$set(this.tableList[tIndex]['tbodyList'], rowIndex, row);
        this.isExpandCollapse = false;
        this.expandCollapseIdList && this.expandCollapseIdList.forEach((id, index) => {
          if (id == row.id) {
            this.expandCollapseIdList.splice(index, 1);
          }
        });
      } else {
        row._expand = true;
        this.$set(this.tableList[tIndex]['tbodyList'], rowIndex, row);
        this.isExpandCollapse = true;
        if (!this.expandCollapseIdList.includes(row.id)) {
          // id没有时，才push进去
          this.expandCollapseIdList.push(row.id);
        }
      }
      this.$addHistoryData('expandCollapseIdList', this.expandCollapseIdList);
      this.$addHistoryData('isExpandCollapse', this.isExpandCollapse);
    },
    getInnerTbodyList(inspectResult) {
      // 处理内嵌表格数据
      let tbodyList = [];
      if (inspectResult && !this.$utils.isEmpty(inspectResult)) {
        tbodyList = inspectResult;
      }
      return tbodyList;
    },
    handleRefresh() {
      // 处理刷新
      this.tableConfig.currentPage = 1;
      this.getTableData();
    },
    sendEmail() {
      // 发送邮件
      this.isShowSendEmail = true;
    },
    closeSendEmailDialog() {
      this.isShowSendEmail = false;
    },
    toAssetsDetail(row) {
      // 跳转巡检报告页面
      this.$router.push({
        path: './assets-detail-' + row.id
      });
    },
    toJobDetail(row) {
      // 工作详情
      this.$router.push({path: '/job-detail?id=' + row.jobPhaseNodeVo.jobId + '&status=' + row.jobPhaseNodeVo.status});
    },
    toCientityView(row) {
      // 跳转查看配置项页面
      this.$router.push({path: '/ci/' + row.typeId + '/cientity-view/' + row.id});
    },
    openRuleThresholdDialog(row) {
      if (row && row.id) {
        this.resourceId = row.id;
        this.isShowRuleThresholdDialog = true;
      }
    },
    closeRuleOfThresholdDialog() {
      this.isShowRuleThresholdDialog = false;
    }
  },
  filter: {},
  computed: {
    downloadUrl() {
      return {
        url: 'api/binary/inspect/new/problem/report/export',
        method: 'post',
        params: {
          isNeedAlertDetail: 1,
          appSystemId: this.appSystemId,
          inspectStatusList: this.inspectStatusList
        },
        changeStatus: status => {
          if (status == 'start') {
            this.downloadLoading = true;
          } else if (status == 'success' || status == 'error') {
            this.downloadLoading = false;
          }
        }
      };
    }
  },
  watch: {
    appModuleId(id) {
      if (id) {
        this.expandCollapseIdList = [];
        this.isExpandCollapse = true;
        this.isBack = false;
        this.initData();
      }
    },
    appSystemId(id) {
      if (id && this.$utils.isEmpty(this.appModuleId)) {
        this.expandCollapseIdList = [];
        this.isExpandCollapse = true;
        this.isBack = false;
        this.initData();
      }
    }
  }
};
</script>
<style lang="less" scoped>
.latest-question-manage-box {
  .li-box {
    margin-bottom: -10px;
  .li-item {
    padding: 6px 16px;
    border-radius: 4px;
    text-align: center;
    margin-bottom: 10px;
  }
 }
 .table-icon {
  cursor: pointer;
  font-size: 14px;
  visibility: hidden;
  padding: 1px 3px;
  &.open {
    visibility: visible;
  }
}
tr:hover {
  .table-icon {
    visibility: visible;
  }
 }
}
</style>
