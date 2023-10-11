<template>
  <div>
    <TsDialog
      :title="$t('term.process.catalog')"
      type="slider"
      :isShow="true"
      width="large"
      @on-ok="okDialog()"
      @on-close="closeDialog()"
    >
      <template v-slot>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <TsRow>
          <Col span="8">
            <AppModuleTree :value="data" @update="updateTableList"></AppModuleTree>
          </Col>
          <Col span="16">
            <div v-if="tableList && tableList.length > 0 ">
              <div v-for="(item, index) in tableList" :key="index">
                <div class="h3 padding-sm">
                  <Checkbox
                    :true-value="true"
                    :false-value="false"
                    :value="!!item.isSelect"
                    @on-change="
                      val => {
                        $set(item, 'isSelect', !!val);
                      }
                    "
                  >
                    {{ item.type.label }}
                  </Checkbox>
                </div>
                <TsTable
                  :theadList="theadList"
                  v-bind="filterTypeFields(item)"
                  @changeCurrent="(currentPage) => changeCurrent(currentPage, item, index)"
                  @changePageSize="(pageSize) => changePageSize(pageSize,item, index)"
                >
                  <template v-slot:ip="{ row }">
                    <span>{{ row.ip }}</span>
                    <span v-if="row.port">:{{ row.port }}</span>
                  </template>
                  <template v-slot:monitorStatus="{ row }">
                    <!-- 监控状态 -->
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
                    <!-- 巡检状态 -->
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
                    <!-- 所在集群 -->
                    <span v-if="row">{{ row.clusterName }}</span>
                  </template>
                </TsTable>
              </div>
            </div>
            <NoData v-else></NoData>
          </Col>
        </TsRow>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppModuleTree: resolve => require(['./app-module-tree.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    GroupList: resolve => require(['@/resources/components/GroupList/GroupList.vue'], resolve)
  },
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loadingShow: true,
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
      ],
      tableList: [],
      appSystemId: null,
      appModuleId: null,
      envId: null,
      tableData: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      },
      typeIdList: [],
      nodeList: []
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      if (!this.$utils.isEmpty(this.data)) {
        this.typeIdList = this.data.typeIdList || [];
      } else {
        this.loadingShow = false;
      }
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
      if (this.$utils.isEmpty(this.appSystemId) || this.$utils.isEmpty(this.appModuleId) || this.$utils.isEmpty(this.envId)) {
        this.tableList = [];
        this.loadingShow = false;
        return false;
      }
      this.loadingShow = true;
      this.$api.cmdb.applicationManage.postAppmoduleResourceList(params).then(res => {
        if (res.Status == 'OK') {
          if (row && !this.$utils.isEmptyObj(row)) {
            // 内嵌列表翻页
            let tableList = (res.Return && res.Return.tableList) ? res.Return.tableList[0] : [];
            currentRow = Object.assign({}, row, tableList);
            this.$set(this.tableList, index, currentRow);
          } else {
            this.tableList = res.Return.tableList;
          }
          if (!this.$utils.isEmpty(this.tableList)) {
            this.nodeList = [];
            this.tableList.forEach(item => {
              if (this.typeIdList.includes(item.type.id)) {
                this.$set(item, 'isSelect', true);
                this.nodeList.push(...item.tbodyList);
              }
            });
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
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
    okDialog() {
      let selectList = [];
      let data = {
        appSystemId: this.appSystemId,
        appModuleId: this.appModuleId,
        envId: this.envId,
        ...this.returnValue
      };
      this.$set(data, 'typeIdList', []);
      if (!this.$utils.isEmpty(this.tableList)) {
        this.nodeList = [];
        this.tableList.forEach(item => {
          if (item.isSelect) {
            selectList.push(item);
            data.typeIdList.push(item.type.id);
            this.nodeList.push(...item.tbodyList);
          }
        });
      }
      if (this.$utils.isEmpty(selectList)) {
        this.$Notice.error({
          title: this.$t('term.framework.errorinfo'),
          desc: this.$t('term.dr.selectatleastmodel')
        });
        return;
      }
      this.closeDialog(data, this.nodeList);
    },
    closeDialog(data, nodeList) { 
      this.$emit('close', data, nodeList);
    },
    handleTimes(time) {
      let data = '-';
      if (time) {
        data = Date.parse(new Date()) - time;
      }
      return data;
    },
    updateTableList(data) {
      this.returnValue = data || {};
      this.appSystemId = data.appSystemId;
      this.appModuleId = data.appModuleId;
      this.envId = data.envId;
      this.getTableData();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
