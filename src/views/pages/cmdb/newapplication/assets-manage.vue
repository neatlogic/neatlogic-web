<template>
  <div class="assets-manage-wrap padding">
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
          :fixedHeader="false"
          :theadList="item.theadList"
          v-bind="filterTypeFields(item)"
          @changeCurrent="(currentPage) => changeCurrent(currentPage, item, index)"
          @changePageSize="(pageSize) => changePageSize(pageSize,item, index)"
        >
          <template v-slot:ip="{ row }">
            <span v-if="!$utils.isEmpty(row.ip)" class="text-href" @click="toCientityView(row.ip)">
              <span>{{ row.ip.ip }}</span>
              <span v-if="row.ip.port">:{{ row.ip.port }}</span>
            </span>
            <span v-else></span>
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
          <template v-slot:fcu="{ row }">
            <UserCard v-bind="row.fcu" :hideAvatar="true"></UserCard>
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
            <span v-else>-</span>
          </template>
          <template v-slot:appModule="{ row }">
            <div v-if="!$utils.isEmpty(row.appModule)" class="text-href" @click="toCientityView(row.appModule)">
              <span class="tsfont-ci-o"></span>
              <span>{{ row.appModule.name }}</span>
            </div>
          </template>
          <template v-slot:appEnvironment="{ row }">
            <div v-if="!$utils.isEmpty(row.appEnvironment)" class="text-href" @click="toGlobalAttrManage()">
              {{ row.appEnvironment.value }}
            </div>
          </template>
          <template v-slot:appSystem="{row}">
            <!-- 应用系统 -->
            <div v-if="!$utils.isEmpty(row.appSystem)" class="text-href" @click="toCientityView(row.appSystem)">
              <span :class="row.appSystem.ciIcon"></span>
              <span>{{ row.appSystem.name }}</span>
            </div>
          </template>
          <template v-slot:businessGroupList="{ row }">
            <div v-if="!$utils.isEmpty(row.businessGroupList)">
              <Tag v-for="(b, bindex) in row.businessGroupList" :key="bindex">
                {{ b.name }}
              </Tag>
            </div>
            <div v-else></div>
          </template>
          <template v-slot:state="{row}">
            <!-- 资产状态 -->
            <div v-if="!$utils.isEmpty(row.state)" class="text-href" @click="toCientityView(row.state)">
              {{ row.state.name }}
            </div>
          </template>
          <template v-slot:ownerList="{ row }">
            <div v-if="!$utils.isEmpty(row.ownerList)">
              <Tag v-for="(o, oindex) in row.ownerList" :key="oindex">
                {{ o.name }}
              </Tag>
            </div>
            <div v-else></div>
          </template>
          <template v-slot:ci="{row}">
            <!-- 模型 -->
            <div v-if="!$utils.isEmpty(row.ci)" class="text-href" @click="toCiView(row.ci)">
              <span class="tsfont-ci-o"></span>
              <span>{{ row.ci.name }}</span>
            </div>
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
          <template v-slot:fcd="{ row }">
            <div v-if="row.fcd">{{ row.fcd | formatDate }}</div>
          </template>
          <template v-slot:lcd="{ row }">
            <div v-if="row.lcd">{{ row.lcd | formatDate }}</div>
          </template>
          <!-- <template v-slot:clusterName="{row}">
            所在集群 
            <span v-if="row" class="text-href" @click="gotoCluster(row)">{{ row.clusterName }}</span>
          </template> -->
        </TsTable>
      </div>
    </div>
    <NoData v-else></NoData>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
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
      envId: '',
      envList: [],
      tableList: [],
      tableData: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      },
      theadList: [
        { key: 'ip', title: this.$t('page.ipaddress')},
        { key: 'name', title: this.$t('page.name')},
        { key: 'monitorStatus', title: this.$t('term.inspect.monitoringstate')},
        { key: 'inspectStatus', title: this.$t('term.autoexec.inspectstatus')},
        { key: 'stateName', title: this.$t('term.autoexec.assetstatus')},
        { key: 'envName', title: this.$t('term.inspect.envname')},
        { key: 'clusterName', title: this.$t('term.inspect.clustername')},
        { key: 'dataCenterName', title: this.$t('term.inspect.datacenter')},
        { key: 'networkArea', title: this.$t('page.networkarea')},
        { key: 'ownerList', title: this.$t('page.owner')},
        { key: 'bgList', title: this.$t('term.autoexec.subordinatedepartment')},
        { key: 'maintenanceWindow', title: this.$t('term.deploy.maintenancewindow')}
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
    restoreHistory(historyData) {
      this.envId = historyData['envId'];
    },
    filterTypeFields(row) {
      // 过滤类型字段，修复控制台报错问题
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
        viewName: row && row.viewName ? row.viewName : null,
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };
      this.$addHistoryData('envId', this.envId);
      if (this.$utils.isEmpty(this.appSystemId) && this.$utils.isEmpty(this.appModuleId)) {
        this.tableList = [];
        return false;
      }
      this.loadingShow = true;
      this.$api.cmdb.applicationManage.getAppResourceList(params).then(res => {
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
    gotoCluster(row) {
      // 集群跳转
      if (row && !this.$utils.isEmptyObj(row)) {
        this.$router.push({ path: './ci/' + row.clusterTypeId + '/cientity-view/' + row.clusterId });
      }
    },
    toCientityView(row) {
      // 应用清单详情
      if (row && !this.$utils.isEmptyObj(row)) {
        this.$router.push({ path: './ci/' + row.ciId + '/cientity-view/' + row.id });
      }
    },
    toCiView(ci) {
      if (ci && !this.$utils.isEmptyObj(ci)) {
        this.$router.push({ path: '/ci-view/' + ci.id });
      }
    },
    toInspectStatusDetail(row) {
      // 巡检状态详情
      if (row && !this.$utils.isEmptyObj(row)) {
        if (this.moduleName == 'inspect') {
          // inspect模块
          this.$router.push({ path: './assets-detail-' + row.id});
        } else {
          // cmdb模块
          if (this.$AuthUtils.hasRole('INSPECT_BASE')) {
            this.$router.push({ path: './inspect-status-detail-' + row.id});
          }
        }
      }
    },
    toGlobalAttrManage() {
      //全局属性管理
      window.open(HOME + '/cmdb.html#/global-attr-manage', '_blank');
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
.assets-manage-wrap {
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
