<template>
  <div class="application-detail padding">
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
        <div class="h3 padding-sm">{{ item.type.label }}</div>
        <TsTable
          :theadList="theadList"
          v-bind="filterTypeFields(item)"
          @changeCurrent="(currentPage) => changeCurrent(currentPage, item, index)"
          @changePageSize="(pageSize) => changePageSize(pageSize,item, index)"
        >
          <template v-slot:ip="{ row }">
            <span class="text-href" @click="toCientityView(row)">
              <span>{{ row.ip }}</span>
              <span v-if="row.port">:{{ row.port }}</span>
            </span>
          </template>
          <template v-slot:monitorStatus="{ row }">
            <!-- ηζ§ηΆζ -->
            <span v-if="row.monitorStatusJson && row.monitorTime" :title="row.monitorTime | formatDate">
              <span :class="[row.monitorStatusJson.cssClass, {'background-FATAL': row.monitorStatusJson.value== 'FATAL'}]" class="vertical cursor">{{ row.monitorStatusJson.text }} </span>
              <span class="text-title">
                {{ handleTimes(row.monitorTime) | formatTimeCost({unitNumber: 1, language: 'zh',unit: 'minute'}) }} {{ $t('page.before') }}
              </span>
            </span>
            <span v-else>
              <span>-</span>
            </span>
          </template>
          <template v-slot:inspectStatus="{ row }">
            <!-- ε·‘ζ£ηΆζ -->
            <span v-if="row.inspectStatusJson && row.inspectTime" :title="row.inspectTime | formatDate">
              <span :class="[row.inspectStatusJson.cssClass, {'background-FATAL': row.inspectStatusJson.value== 'FATAL'}]" class="vertical cursor" @click="toInspectStatusDetail(row)">{{ row.inspectStatusJson.text }} </span>
              <span class="text-title">
                {{ handleTimes(row.inspectTime) | formatTimeCost({unitNumber: 1, language: 'zh',unit: 'minute'}) }} {{ $t('page.before') }}
              </span> 
            </span>
            <span v-else>-</span>
          </template>
          <template v-slot:bgList="{ row }">
            <GroupList :dataList="row.bgList" type="tag" textName="bgName"></GroupList>
          </template>
          <template v-slot:ownerList="{ row }">
            <GroupList :dataList="row.ownerList" type="tag" textName="userName"></GroupList>
          </template>
          <template v-slot:clusterName="{row}">
            <!-- ζε¨ιηΎ€ -->
            <span v-if="row" class="text-href" @click="gotoCluster(row)">{{ row.clusterName }}</span>
          </template>
          <template v-slot:action="{row}">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-history" @click="toJobDetail(row)">δ½δΈθ―¦ζ</li>
                <li v-auth="'INSPECT_EXECUTE'" class="tsfont-inspection" @click="doInspection(row)">ε·‘ζ£</li>
                <li class="tsfont-setting" @click="openRuleThresholdDialog(row)">ιεΌθ§ε</li>
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
    GroupList: resolve => require(['@/resources/components/GroupList/GroupList.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InspectionDialog: resolve => require(['../assetsInspect/inspection-dialog.vue'], resolve), // εδΈͺε·‘ζ£
    RuleOfThresholdDialog: resolve => require(['@/views/pages/inspect/application/threshold/rule-of-threshold-dialog.vue'], resolve)
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
      },
      theadList: [
        { key: 'ip', title: 'IPε°ε'},
        { key: 'name', title: 'εη§°'},
        { key: 'monitorStatus', title: this.$t('term.inspect.monitoringstate')},
        { key: 'inspectStatus', title: this.$t('term.autoexec.inspectstatus')},
        { key: 'stateName', title: this.$t('term.autoexec.assetstatus')},
        { key: 'envName', title: 'εΊη¨η―ε’'},
        { key: 'clusterName', title: 'ζε¨ιηΎ€'},
        { key: 'dataCenterName', title: 'ζ°ζ?δΈ­εΏ'},
        { key: 'networkArea', title: 'η½η»εΊε'},
        { key: 'ownerList', title: 'ζζθ'},
        { key: 'bgList', title: 'ζε±ι¨ι¨'},
        { key: 'maintenanceWindow', title: 'η»΄ζ€ηͺε£'},
        { key: 'action'}
      ]
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
      // ζεΌζ°ηδ½δΈθ―¦ζ
      if (row && row.jobPhaseNodeVo) {
        this.$router.push({path: '/job-detail?id=' + row.jobPhaseNodeVo.jobId + '&status=' + row.jobPhaseNodeVo.status});
      }
    },
    doInspection(row) {
      // ε·‘ζ£
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
      // θΏζ»€η±»εε­ζ?΅οΌδΏ?ε€ζ§εΆε°ζ₯ιι?ι’
      let currentRow = this.$utils.deepClone(row);
      if (currentRow && currentRow.hasOwnProperty('type')) {
        delete currentRow.type;
      }
      return currentRow;
    },
    changeCurrent(currentPage, item, index) {
      this.tableData.currentPage = currentPage;
      this.getTableData(item, index);
    },
    changePageSize(pageSize, item, index) {
      this.tableData.pageSize = pageSize;
      this.getTableData(item, index);
    },
    async initData() {
      await this.getEnvList();
      await this.getTableData();
    },
    async getEnvList() {
      this.loadingShow = true;
      await this.$api.cmdb.applicationManage.getEnvironmenteList().then(res => {
        if (res.Status == 'OK') {
          this.envList = res.Return.tbodyList || [];
          this.envList.unshift({
            name: 'ζζη―ε’',
            id: ''
          });
          this.envList.push({
            name: 'ζͺιη½?η―ε’',
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
      this.$api.inspect.applicationInspect.getapplicationInspectList(params).then(res => {
        if (res.Status == 'OK') {
          if (row && !this.$utils.isEmptyObj(row)) {
            // εε΅εθ‘¨ηΏ»ι‘΅
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
    gotoCluster(row) {
      // ιηΎ€θ·³θ½¬
      if (row && !this.$utils.isEmptyObj(row)) {
        this.$router.push({ path: './ci/' + row.clusterTypeId + '/cientity-view/' + row.clusterId });
      }
    },
    toCientityView(row) {
      // εΊη¨ζΈεθ―¦ζ
      if (row && !this.$utils.isEmptyObj(row)) {
        this.$router.push({ path: './ci/' + row.typeId + '/cientity-view/' + row.id });
      }
    },
    toInspectStatusDetail(row) {
      // ε·‘ζ£ηΆζθ―¦ζ
      if (row && !this.$utils.isEmptyObj(row)) {
        if (this.moduleName == 'inspect') {
          // inspectζ¨‘ε
          this.$router.push({ path: './assets-detail-' + row.id});
        } else {
          // cmdbζ¨‘ε
          this.$router.push({ path: './inspect-status-detail-' + row.id});
        }
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
      console.log(row);
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
.application-detail {
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
