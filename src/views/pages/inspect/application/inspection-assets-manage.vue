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
    <div v-if="tableList && tableList.length > 0 ">
      <div v-for="(item, index) in tableList" :key="index">
        <div class="h3 padding-sm">{{ item.viewLabel }}</div>
        <TsTable
          v-bind="filterTypeFields(item)"
          @changeCurrent="(currentPage) => changeCurrent(currentPage, item, index)"
          @changePageSize="(pageSize) => changePageSize(pageSize,item, index)"
        >
          <template v-slot:ip="{ row }">
            <span class="text-href" @click.stop="gotoDetails(row)">
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
          <template v-slot:lcu="{row}">
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
          <template v-slot:monitor="{ row }">
            <!-- 监控状态 -->
            <span v-if="row.monitor && row.monitor.time" :title="row.monitor.time | formatDate">
              <span :class="[row.monitor.cssClass, {'background-FATAL': row.monitor.value== 'FATAL'}]" class="vertical">{{ row.monitor.text }} </span>
              <span class="text-title">
                {{ handleTimes(row.monitor.time) | formatTimeCost({unitNumber: 1, language: 'zh',unit: 'minute'}) }} {{ $t('page.before') }}
              </span>
            </span>
            <span v-else></span>
          </template>
          <template v-slot:inspect="{ row }">
            <!-- 巡检状态 -->
            <span v-if="row.inspect && row.inspect.time" :title="row.inspect.time | formatDate">
              <span :class="[row.inspect.cssClass, {'background-FATAL': row.inspect.value== 'FATAL'}]" class="vertical cursor" @click="toInspectStatusDetail(row)">{{ row.inspect.text }} </span>
              <span class="text-title">
                {{ handleTimes(row.inspect.time) | formatTimeCost({unitNumber: 1, language: 'zh',unit: 'minute'}) }} {{ $t('page.before') }}
              </span>
            </span>
            <span v-else>
              <span>-</span>
            </span>
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
          <template v-slot:appModule="{ row }">
            <div v-if="!$utils.isEmpty(row.appModule)" class="text-href" @click="toCientityView(row.appModule)">
              <span :class="row.appModule.ciIcon"></span>
              <span>{{ row.appModule.name }}</span>
            </div>
          </template>
          <template v-slot:appEnvironment="{ row }">
            <Tag
              v-if="!$utils.isEmpty(row.appEnvironment)"
              class="cursor-pointer"
              @click.native="toGlobalAttrManage()"
            >
              {{ row.appEnvironment.value }}
            </Tag>
          </template>
          <template v-slot:appSystem="{row}">
            <!-- 应用系统 -->
            <div v-if="!$utils.isEmpty(row.appSystem)" class="text-href" @click="toCientityView(row.appSystem)">
              <span :class="row.appSystem.ciIcon"></span>
              <span>{{ row.appSystem.name }}</span>
            </div>
          </template>
          <template v-slot:ownerList="{ row }">
            <div v-if="!$utils.isEmpty(row.ownerList)">
              <Tag
                v-for="(o, oindex) in row.ownerList"
                :key="oindex"
                class="cursor-pointer"
                @click.native="toCientityView(o);"
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
          <template v-slot:state="{row}">
            <!-- 资产状态 -->
            <Tag
              v-if="!$utils.isEmpty(row.state)"
              class="cursor-pointer"
              @click.native="toCientityView(row.state)"
            >
              {{ row.state.name }}
            </Tag>
          </template>
          <template v-slot:dataCenter="{ row }">
            <!-- 数据中心 -->
            <Tag
              v-if="!$utils.isEmpty(row.dataCenter)"
              class="cursor-pointer"
              @click.native="toCientityView(row.dataCenter)"
            >
              {{ row.dataCenter.name }}
            </Tag>
            <span v-else></span>
          </template>
          <template v-slot:ci="{row}">
            <!-- 模型 -->
            <div v-if="!$utils.isEmpty(row.ci)" class="text-href" @click="toCiView(row.ci)">
              <span :class="row.ci.icon"></span>
              <span>{{ row.ci.label }}</span>
            </div>
          </template>
          <template v-slot:action="{row}">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-if="row && row.jobPhaseNodeVo && row.jobPhaseNodeVo.jobId" class="tsfont-history" @click="toJobDetail(row)">{{ $t('term.inspect.jobdetail') }}</li>
                <li v-auth="'INSPECT_EXECUTE'" class="tsfont-inspection" @click="doInspection(row)">{{ $t('term.inspect.inspect') }}</li>
                <li class="tsfont-setting" @click="openRuleThresholdDialog(row)">{{ $t('term.inspect.thresholdrule') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </div>
    <NoData v-else></NoData>
    <InspectionDialog
      v-if="isShowInspectionDialog"
      :ciEntityData="currentCiEntity"
      @close="closeInspectionDialog"
    ></InspectionDialog>
    <RuleOfThresholdDialog
      v-if="isShowRuleThresholdDialog"
      :appSystemId="appSystemId"
      :resourceId="resourceId"
      @close="closeRuleOfThresholdDialog"
    ></RuleOfThresholdDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InspectionDialog: () => import('../assetsInspect/inspection-dialog.vue'), // 单个巡检
    RuleOfThresholdDialog: () => import('./threshold/rule-of-threshold-dialog.vue'), //阈值规则
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue')
    
  },
  filters: {},
  props: {
    appSystemId: {
      type: Number,
      default: null
    },
    appModuleId: {
      type: Number,
      default: null
    },
    moduleName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loadingShow: false,
      isShowInspectionDialog: false,
      isShowRuleThresholdDialog: false,
      envId: '',
      resourceId: null,
      currentCiEntity: null,
      envList: [],
      tableList: [],
      tableData: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      }
      // theadList: [
      //   { key: 'ip', title: this.$t('page.ipaddress')},
      //   { key: 'name', title: this.$t('page.name')},
      //   { key: 'monitorStatus', title: this.$t('page.monitoringstate')},
      //   { key: 'inspectStatus', title: this.$t('page.inspectstatus')},
      //   { key: 'stateName', title: this.$t('page.assetstatus')},
      //   { key: 'envName', title: this.$t('term.inspect.envname')},
      //   { key: 'clusterName', title: this.$t('page.clustername')},
      //   { key: 'dataCenterName', title: this.$t('page.datacenter')},
      //   { key: 'networkArea', title: this.$t('page.networkarea')},
      //   { key: 'ownerList', title: this.$t('page.owner')},
      //   { key: 'bgList', title: this.$t('page.subordinatedepartment')},
      //   { key: 'maintenanceWindow', title: this.$t('page.maintenancewindow')},
      //   { key: 'action'}
      // ]
    };
  },
  beforeCreate() {},
  async created() {
    await this.initData();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toJobDetail(row) {
      // 打开新的作业详情
      if (row && row.jobPhaseNodeVo) {
        window.open(HOME + '/inspect.html#/job-detail?id=' + row.jobPhaseNodeVo.jobId + '&status=' + row.jobPhaseNodeVo.status, '_blank');
       
        // this.$router.push({path: '/job-detail?id=' + row.jobPhaseNodeVo.jobId + '&status=' + row.jobPhaseNodeVo.status});
      }
    },
    doInspection(row) {
      // 巡检
      this.isShowInspectionDialog = true;
      if (row) {
        this.currentCiEntity = row;
      }
    },
    closeInspectionDialog() {
      this.isShowInspectionDialog = false;
      this.currentCiEntity = null;
    },
    restoreHistory(historyData) {
      this.envId = historyData['envId'];
    },
    filterTypeFields(row) {
      // 过滤类型字段，修复控制台报错问题
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
    async initData() {
      this.tableData.currentPage = 1;
      await this.getEnvList();
      await this.getTableData();
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
    getTableData(row, index) {
      let currentRow = {};
      let params = {
        appSystemId: this.appSystemId,
        appModuleId: this.appModuleId,
        envId: this.envId,
        typeId: row && row.type ? row.type.id : null,
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };
      this.$addHistoryData('envId', this.envId);
      if (this.$utils.isEmpty(this.appSystemId) && this.$utils.isEmpty(this.appModuleId)) {
        this.tableList = [];
        return false;
      }
      this.loadingShow = true;
      this.$api.inspect.applicationInspect.getNewapplicationInspectList(params).then(res => {
        if (res.Status == 'OK') {
          if (row && !this.$utils.isEmptyObj(row)) {
            // 内嵌列表翻页
            let tableList = (res.Return && res.Return.tableList) ? res.Return.tableList[0] : [];
            currentRow = Object.assign({}, row, tableList);
            this.$set(this.tableList, index, currentRow);
          } else {
            this.tableList = res.Return.tableList;
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    toCientityView(row) {
      // 应用清单详情
      if (row && !this.$utils.isEmptyObj(row)) {
        window.open(HOME + '/inspect.html#/ci/' + row.ciId + '/cientity-view/' + row.id, '_blank');
      
        // this.$router.push({ path: './ci/' + row.typeId + '/cientity-view/' + row.id });
      }
    },
    toInspectStatusDetail(row) {
      // 巡检状态详情
      if (row && !this.$utils.isEmptyObj(row)) {
        window.open(HOME + '/inspect.html#/assets-detail-' + row.id, '_blank');
      }
    },
    gotoDetails(row) {
      window.open(HOME + '/inspect.html#/assets-detail-' + row.id, '_blank');
    },
    toGlobalAttrManage() {
      //全局属性管理
      window.open(HOME + '/cmdb.html#/global-attr-manage', '_blank');
    },
    toCiView(ci) {
      if (ci && !this.$utils.isEmptyObj(ci)) {
        window.open(HOME + '/cmdb.html#/ci-view/' + ci.id, '_blank');
      }
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
      this.getTableData();
    },
    handleTimes(time) {
      let data = '-';
      if (time) {
        data = Date.parse(new Date()) - time;
      }
      return data;
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
  computed: {},
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
  .li-item {
    padding: 6px 16px;
    border-radius: 4px;
    text-align: center;
    margin-bottom: 10px;
  }
 }
}

</style>
