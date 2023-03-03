<template>
  <div class="application-detail">
    <Loading :loadingShow="showLoading" type="fix"></Loading>
    <TsContain border="border">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/application-manage')">{{ $getFromPage('应用清单') }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ name }}</span>
      </template>
      <template v-slot:content>
        <Tabs 
          class="block-tabs"
          :animated="false"
          @on-click="changeTabValue"
        >
          <TabPane
            v-for="tab in tabList"
            :key="tab.id"
            :label="tab.name"
            :name="tab.name"
          >
          </TabPane>
        </Tabs>

        <div v-if="leftData.length >0 " class="boxBg bg-op">
          <div class="m-application">
            <div v-for="(tab, index) in leftData" :key="index" @click="goAnchor('#anchor'+index,tab)">
              <div class="curli" :class="{'tsbg-block':tab.isShow}">{{ tab.type.label }}</div>
            </div>
          </div>

          <div class="m-application-tabDta">
            <div v-for="(item, index) in leftData" :key="index">
              <div :id="'anchor'+index" class="title">{{ item.type.label }}</div>
              <TsTable
                :theadList="theadList"
                v-bind="filterType(item)"
                @changeCurrent="getTableDatas(...arguments, '', item, index)"
                @changePageSize="getTableDatas(1, ...arguments,item, index)"
                @operation="operation"
              >
                <template v-slot:bgList="{ row }">
                  <GroupList :dataList="row.bgList" type="tag" textName="bgName"></GroupList>
                </template>
                <template v-slot:ip="{ row }">
                  <span class="text-href" @click="gotoDetail(row)">
                    <span>{{ row.ip }}</span>
                    <span v-if="row.port">:{{ row.port }}</span>
                  </span>
                </template>
                <template v-slot:monitorStatus="{ row }">
                  <!-- 监控状态 -->
                  <span v-if="row.monitorStatusJson && row.monitorTime" :title="row.monitorTime | formatDate">
                    <span :class="[row.monitorStatusJson.cssClass, {'background-FATAL': row.monitorStatusJson.value== 'FATAL'}]" class="vertical">{{ row.monitorStatusJson.text }} </span>
                    <span class="text-title">
                      {{ times(row.monitorTime) | formatTimeCost({unitNumber: 1, language: 'zh',unit: 'minute'}) }} 之前
                    </span>
                  </span>
                  <span v-else>
                    <span>-</span>
                  </span>
                </template>
                <template v-slot:inspectStatus="{ row }">
                  <!-- 巡检状态 -->
                  <span v-if="row.inspectStatusJson && row.inspectTime" :title="row.inspectTime | formatDate">
                    <span :class="[row.inspectStatusJson.cssClass, {'background-FATAL': row.inspectStatusJson.value== 'FATAL'}]" class="vertical">{{ row.inspectStatusJson.text }} </span>
                    <span class="text-title">
                      {{ times(row.inspectTime) | formatTimeCost({unitNumber: 1, language: 'zh',unit: 'minute'}) }} 之前
                    </span> 
                  </span>
                  <span v-else>-</span>
                </template>
                <template v-slot:ownerList="{ row }">
                  <GroupList :dataList="row.ownerList" type="tag" textName="userName"></GroupList>
                </template>
                <template v-slot:clusterName="{row}">
                  <!-- 所在集群 -->
                  <span v-if="row" class="text-href" @click="gotoCluster(row)">{{ row.clusterName }}</span>
                </template>
              </TsTable>
            </div>
          </div>
        </div>
        <NoData v-else></NoData>
      </template>
    </TsContain>
  </div>
</template>
<script>
import GroupList from '@/resources/components/GroupList/GroupList.vue';
export default {
  name: '',
  components: {
    GroupList,
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  filters: {},
  props: ['inspectId'],
  data() {
    return {
      showLoading: true,
      name: '自动化模块',
      activeName: 'Mysql',
      id: this.$route.params['id'],
      versionStatus: '',
      envId: '',
      tabList: [],
      leftData: [],
      isNewAccountShow: false,
      searchParams: {
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        { key: 'ip', title: 'IP地址'},
        { key: 'name', title: '名称'},        
        { key: 'description', title: '描述', type: 'text' },
        { key: 'monitorStatus', title: '监控状态', type: 'text' },
        { key: 'inspectStatus', title: '巡检状态', type: 'text' },
        { key: 'stateName', title: '资产状态', type: 'text' },
        { key: 'envName', title: '应用环境', type: 'text' },
        { key: 'clusterName', title: '所在集群' },
        { key: 'dataCenterName', title: '数据中心', type: 'text' },
        { key: 'networkArea', title: '网络区域', type: 'text' },
        { key: 'ownerList', title: '所有者'},
        { key: 'bgList', title: '所属部门'},
        { key: 'maintenanceWindow', title: '维护窗口', type: 'text' }
      ],
      tableData: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      }
    };
  },
  beforeCreate() {},
  async created() {
    await this.init();
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
    filterType(row) {
      // 过滤类型字段，修复控制台报错问题
      let currentRow = this.$utils.deepClone(row);
      if (currentRow && currentRow.hasOwnProperty('type')) {
        delete currentRow.type;
      }
      return currentRow;
    },
    async init() {
      this.name = this.$route.query.name;
      await this.getTableData();
      await this.ResourceListfn(this.id, this.envId);
    },
    async getTableData() {
      this.showLoading = true;
      await this.$api.cmdb.applicationManage.getEnvironmenteList().then(res => {
        if (res.Status == 'OK') {
          this.tabList = res.Return.tbodyList || [];
          let addData = {
            name: '所有', id: ''
          };
          this.tabList.unshift(addData);
          this.envId = '';      
          this.showLoading = false;
        }
      });
    },
    times(time) {
      let data = '-';
      if (time) {
        data = Date.parse(new Date()) - time;
      }
      return data;
    },
    getTableDatas(currentPage, pageSize, row, index) {
      let data = {
        keyword: this.keyword,
        typeId: row.type.id,
        envId: this.envId,
        appModuleId: this.id,
        currentPage: currentPage,
        pageSize: pageSize || this.tableData.pageSize
      };
      this.tableData.pageSize = pageSize || this.tableData.pageSize;
      let currentRow = {};
      this.showLoading = true;
      this.$api.cmdb.applicationManage.postAppmoduleResourceList(data).then(res => {
        if (res.Status == 'OK') {
          let tableList = (res.Return && res.Return.tableList) ? res.Return.tableList[0] : [];
          currentRow = Object.assign({}, row, tableList);
          this.$set(this.leftData, index, currentRow);
          this.showLoading = false;
        }
      });
    },
    gotoCluster(row) {
      // 集群跳转
      if (row && !this.$utils.isEmptyObj(row)) {
        this.$router.push({ path: './ci/' + row.clusterTypeId + '/cientity-view/' + row.clusterId });
      }
    },
    gotoDetail(row) {
      // 应用清单详情
      if (row && !this.$utils.isEmptyObj(row)) {
        this.$router.push({ path: './ci/' + row.typeId + '/cientity-view/' + row.id });
      }
    },
    async ResourceListfn(id, envId) {
      let data = {
        appModuleId: id,
        envId: String(envId)
      };
      this.showLoading = true;
      await this.$api.cmdb.applicationManage.postAppmoduleResourceList(data).then(res => {
        if (res.Status == 'OK') {
          this.leftData = [];
          let resdata = res.Return.tableList || [];          
          resdata.forEach(v => {
            this.leftData.push(
              Object.assign({isShow: false}, v)
            );
          });
          if (!this.$utils.isEmpty(this.leftData)) {
            this.leftData[0].isShow = true;
          }
          this.showLoading = false;
        } else {
          this.showLoading = false;
        }
      });
    },
    closeNewAccount(needFresh) {
      this.isNewAccountShow = false;
      if (needFresh) {
        this.getTableData(1);
      }
    },
    goAnchor(selector, row) {
      document.querySelector(selector).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest'});
      // [可选] "start"，"center"，"end"或"nearest"。默认为"center"。
      this.leftData.forEach(v => {
        v.isShow = false;
      });
      row.isShow = true;
      // console.log(row);
    },
    addAccount() {
      this.id = null;
      this.isNewAccountShow = true;
    },
    editAccount(id) {
      this.$router.push({ path: './application-detail-' + id });
    },
    async changeTabValue(name) {
      let envId = null;
      this.tabList.forEach(v => {
        if (v.name == name) {
          envId = v.id;
        }
      });
      this.envId = envId;
      await this.ResourceListfn(this.id, envId);
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/my-theme.less';
.application-detail {
  position: relative;
  height: 100%;
  /deep/.tscontain-body{
    overflow: hidden!important;
  }
  .action-title {
    width: 220px;
    display: inline-flex;
    flex-direction: column;
  }
}
.boxBg{
  border-radius: 0 10px 10px 10px;
}
.m-application{
  position:absolute;
  padding: 16px;
  left:16px;
  .tsbg-block{
    border-radius: 6px!important;
  }
  .curli{
    width: 110px;
    height: 32px;
    border-radius: 0px;
    line-height: 32px;
    text-align: left;
    padding-left:10px;
    position: relative;
    cursor: pointer;
  }
  /deep/.ivu-menu-item-group-title{
    display: none;
  }
  /deep/.ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu){
    background: initial!important;
  }
  /deep/.ivu-menu-item{
    padding:0!important;
  }
}
.m-application-tabDta{
  margin-left: 142px;
  // max-height: 600px;
  height: calc(100vh - 50px - 50px - 32px - 16px);
  // background: @default-op;
  padding: 16px;
  overflow: auto;
  .title{
    margin:10px;
    font-size: 16px;
  }
}
/deep/.tstable-main{
  max-height:100%!important;
}
.block-tabs{
  /deep/.ivu-tabs-bar{
    margin-bottom: 0px!important;
  }
  /deep/.ivu-tabs-nav .ivu-tabs-tab{
    width: 84px;
    text-align: center;
  }
}
</style>
