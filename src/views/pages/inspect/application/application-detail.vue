<template>
  <div class="application-detail">
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsContain border="border">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/application-manage')">{{ $getFromPage('应用巡检') }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ moduleName }}</span>
      </template>
      <template v-slot:topRight>
        <Button v-auth="'INSPECT_EXECUTE'" type="primary" @click="handleBatchInspect">巡检</Button>
      </template>
      <template v-slot:content>
        <Tabs 
          class="block-tabs"
          :animated="false"
          @on-click="handleTab"
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
                @changeCurrent="handleTableData(...arguments, '', item, index)"
                @changePageSize="handleTableData(1, ...arguments,item, index)"
                @operation="operation"
              >
                <template v-slot:bgList="{ row }">
                  <GroupList :dataList="row.bgList" type="tag" textName="bgName"></GroupList>
                </template>
                <template v-slot:ip="{ row }">
                  <span class="text-href" @click="operation(row, 'view')">
                    <span>{{ row.ip }}</span><span v-if="row.port">:{{ row.port }}</span>
                  </span>
                </template>
                <template v-slot:monitorStatus="{ row }">
                  <!-- 监控状态 -->
                  <span v-if="row.monitorStatusJson && row.monitorTime" :title="row.monitorTime | formatDate">
                    <span :class="[row.monitorStatusJson.cssClass, {'background-FATAL': row.monitorStatusJson.value== 'FATAL'}]" class="vertical">{{ row.monitorStatusJson.text }} </span>
                    <span class="text-title">
                      {{ handleTimes(row.monitorTime) | formatTimeCost({unitNumber: 1, language: 'zh',unit: 'minute'}) }} 之前
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
                      {{ handleTimes(row.inspectTime) | formatTimeCost({unitNumber: 1, language: 'zh',unit: 'minute'}) }} 之前
                    </span> 
                  </span>
                  <span v-else>-</span>
                </template>
                <template v-slot:jobStatus="{ row }">
                  <!-- 巡检作业状态 -->
                  <span v-if="row.jobPhaseNodeVo && row.jobPhaseNodeVo.statusVo">
                    <span :style="{'color': row.jobPhaseNodeVo.statusVo.color}">{{ row.jobPhaseNodeVo.statusVo.text }} </span>
                  </span>
                  <span v-else>-</span>
                </template>
                <template v-slot:ownerList="{ row }">
                  <GroupList :dataList="row.ownerList" type="tag" textName="userName"></GroupList>
                </template>
                <template slot="action" slot-scope="{ row }" v-auth="'INSPECT_EXECUTE'">
                  <div class="tstable-action">
                    <ul class="tstable-action-ul">
                      <li class="tsfont-restart" @click="executeOneInspect(row)">巡检</li>
                    </ul>
                  </div>
                </template>
              </TsTable>
            </div>
          </div>
        </div>
        <NoData v-else></NoData>
      </template>
    </TsContain>

    <!-- 批量巡检 -->
    <TsDialog
      v-bind="dialogSetting"
      @on-cancel="handleCancel"
      @on-close="handleCancel"
      @on-ok="handleOk"
    >
      <ul>
        <li class="mt-md">
          <TsFormCheckbox
            v-model="checkboxModel"
            :dataList="checkboxAllList"
            @on-change="handleCheckboxAll"
          ></TsFormCheckbox>
        </li>
        <li v-for="(item, index) in dialogList" :key="index">
          <div class="h4 mb-md mt-md">{{ item.env.name }}</div>
          <span v-if="handleEmptyCiVoList(item.ciVoList)" class="text-tip">
            当前环境未找到关联配置项，请编辑相关配置项，填写【应用环境】信息
          </span>
          <TsFormCheckbox
            v-else
            v-model="item.value"
            :dataList="item.ciVoList"
            valueName="id"
            textName="label"
            class="checkbox-list-box"
            @on-change="handleChange(...arguments, item, index)"
          ></TsFormCheckbox>
        </li>
      </ul>
    </TsDialog>

    <!-- 无组合工具列表 -->
    <TsDialog
      title="提示"
      okText="继续"
      :isShow="isShowCompobList"
      :hasFooter="hasFooter"
      @on-cancel="handleCompobCancel"
      @on-close="handleCompobCancel"
      @on-ok="handleContinue"
    >
      <ul>
        <li v-for="(item, index) in noCompobIdList" :key="index" class="flex-start">
          {{ item.label }}<span v-if="item.toolName" class="text-grey">({{ item.toolName }})</span>未配置<span class="text-href" @click="goInspect">巡检工具</span>
        </li>
      </ul>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    GroupList: resolve => require(['@/resources/components/GroupList/GroupList.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormCheckbox: resolve => require(['@/resources/plugins/TsForm/TsFormCheckbox'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      flagNumber: 0, // 执行成功，标识数量
      defaultDialogList: [],
      noCompobIdList: [], // 无组合工具id列表
      isShowCompobList: false,
      hasFooter: true,
      dialogSetting: {
        isShow: false,
        title: '应用巡检',
        okText: '执行',
        okBtnDisable: false,
        loading: false
      },
      checkboxModel: ['all'],
      dialogList: [],
      checkboxAllList: [{
        text: '全选',
        value: 'all'
      }],
      isLoading: true,
      moduleName: '巡检模块', // 模块名称
      id: this.$route.params['id'],
      envId: '',
      tabList: [], // tab列表
      leftData: [],
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
        { key: 'jobStatus', title: '巡检作业状态', type: 'text' },
        { key: 'stateName', title: '资产状态', type: 'text' },
        { key: 'envName', title: '应用环境', type: 'text' },
        { key: 'clusterName', title: '所在集群', type: 'linktext', textValue: 'viewcluster' },
        { key: 'dataCenterName', title: '数据中心', type: 'text' },
        { key: 'networkArea', title: '网络区域', type: 'text' },
        { key: 'ownerList', title: '所有者'},
        { key: 'bgList', title: '所属部门'},
        { key: 'maintenanceWindow', title: '维护窗口', type: 'text' },
        { key: 'action'}
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
    handleEmptyCiVoList(ciVoList) {
      // 过滤空的ciVoList
      let isShow = false;
      if (ciVoList && ciVoList.length == 1 && !ciVoList[0].id) {
        isShow = true;
      }
      return isShow;
    },
    executeOneInspect(row) {
      // 执行单个巡检
      if (!row) {
        return false;
      }
      // 单个巡检
      let id = row.id;
      let params = {
        roundCount: 64, 
        combopId: '', 
        source: 'inspectapp', 
        param: {}, 
        name: row.name, 
        typeLabel: row.typeLabel,
        typeName: row.typeName,
        invokeId: id,
        executeConfig: {
          executeNodeConfig: 
          {
            selectNodeList: [
              {
                id: id,
                ip: row.ip,
                name: row.name,
                port: row.port
              }
            ]
          }
        }};
      this.$api.inspect.applicationInspect.getCombopIdByTypeId({ciId: null, resourceId: id}).then((res) => {
        if (res && res.Status == 'OK') {
          let data = res.Return;
          if (data.isHasBindCombop == 1) {
            // 有执行权限
            params.combopId = data.combop.id;
            this.$api.inspect.applicationInspect.executeInspect(params).then((res) => {
              if (res.Status == 'OK') {
                this.$Message.success('巡检成功');
              }
            });
          } else {
            this.isShowCompobList = true;
            this.hasFooter = false;
            this.noCompobIdList = [
              {
                id: row.id,
                label: row.typeLabel,
                toolName: row.typeName
              }
            ];
          }
        }
      });
    },
    goInspect() {
      // 打开巡检定义页面
      window.open(HOME + '/inspect.html#/definition-manage?isDefinitionShow=true', '_blank');
    },
    handleContinue() {
      // 继续执行
      let _this = this;
      let formatList = [];
      let paramFormatList = [];
      _this.defaultDialogList.forEach(item => {
        item.ciVoList && item.ciVoList.forEach((ci, index) => {
          if (ci && ci.id && ci.combopId) {
            let obj = {
              id: ci.id,
              label: ci.label,
              pid: item.env.id,
              plabel: item.env.name,
              combopId: ci.combopId
            };
            formatList.push(obj);
          }
        });
      });
      formatList.forEach(a => {
        const parent = paramFormatList.find(current => current.executeConfig.executeNodeConfig.filter.typeIdList[0] === a.id);
        if (parent) {
          parent.executeConfig.executeNodeConfig.filter.envIdList.push(a.pid);
        } else {
          let obj = {
            combopId: a.combopId,
            name: a.label,
            source: 'inspectapp',
            invokeId: a.id ? a.id : null,
            roundCount: 64,
            param: {},
            executeConfig: {
              executeNodeConfig: {
                filter: {
                  typeIdList: [a.id],
                  envIdList: [a.pid],
                  appModuleIdList: [_this.id]
                }
              }
            }
          };
          paramFormatList.push(obj);
        }
      });
      let paramList = this.$utils.deepClone(paramFormatList);
      let flag = 0;
      paramList && paramList.forEach((item) => {
        this.$api.inspect.applicationInspect.executeInspect(item).then((res) => {
          if (res.Status == 'OK') {
            flag++;
            if (flag == paramList.length) {
              this.$Message.success('巡检成功');
              this.dialogSetting.isShow = false;
              this.isShowCompobList = false;
            }
          }
        });
      });
    },
    handleChange(value, selectedItem, row, index) {
      let ciVoList = this.$utils.deepClone(row.ciVoList);
      let filterCiVoList = [];
      let allListNumber = null; // 总条数
      let selectedListNumber = null; // 选中数量
      if (row.sign == 'all' || row.sign == 'cancel') {
        filterCiVoList = ciVoList && ciVoList.filter((val) => {
          return val.id;
        });
      }
      if (value && value.length != row.ciVoList.length && row.sign == 'all' && value.includes('')) {
        // 取消单个
        row.value = row.value.filter((val) => val);
        row.sign = 'cancel';
        this.$set(this.dialogList, index, row);
        this.checkboxModel = [];
      } else if (value && value.length == 1 && value.includes('') && row.sign == 'all') {
        // 点击所有，全选
        row.value = this.getIdByCiVoList(row.ciVoList);
        row.sign = 'all';
        this.$set(this.dialogList, index, row);
      } else if (value && value.length == filterCiVoList.length && row.sign == 'all' && !value.includes('')) {
        // 点击所有取消
        row.value = [];
        row.sign = 'cancel';
        this.$set(this.dialogList, index, row);
        this.checkboxModel = [];
      } else if (value && value.length == filterCiVoList.length && row.sign == 'cancel' && !value.includes('')) {
        row.value = this.getIdByCiVoList(row.ciVoList);
        row.sign = 'all';
        this.$set(this.dialogList, index, row);
      } else if (value && row.sign == 'cancel' && value.includes('')) {
        row.value = this.getIdByCiVoList(row.ciVoList);
        row.sign = 'all';
        this.$set(this.dialogList, index, row);
      }
      this.dialogList && this.dialogList.forEach((val) => {
        allListNumber += val.ciVoList.length; // 所有的数量
        selectedListNumber += val.value.length;
      });
      if (allListNumber == selectedListNumber) {
        this.checkboxModel = ['all']; // 全选勾选
      }
    },
    handleCheckboxAll(val) {
      if (val && val.length > 0) {
        this.dialogList && this.dialogList.forEach((item) => {
          item.value = this.getIdByCiVoList(item.ciVoList);
          item.sign = 'all';
        });
      } else {
        this.dialogList && this.dialogList.forEach((item) => {
          item.value = [];
          item.sign = 'cancel';
        });
      }
    },
    handleBatchInspect() {
      // 处理巡检
      if (!this.id) {
        return false;
      }
      this.checkboxModel = ['all'];
      this.$set(this.dialogSetting, 'isShow', true);
      this.$set(this.dialogSetting, 'loading', true);
      let params = {
        appModuleId: this.id
      };
      this.$api.inspect.applicationInspect.getResourceTypeList(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$set(this.dialogSetting, 'loading', false);
          this.dialogList = res.Return;
          this.dialogList && this.dialogList.forEach((item, index) => {
            item.ciVoList.unshift({
              label: '所有',
              id: ''
            });
            item.sign = 'all';
            item.value = this.getIdByCiVoList(item.ciVoList);
          });
          this.dialogSetting.okBtnDisable = this.dialogList && this.dialogList.every((item) => {
            // 解决每个环境都没有关联，禁用执行按钮
            return (item.ciVoList && item.ciVoList.length == 1 && !item.ciVoList[0].id);
          });
        }
      }).catch(err => {
        this.$set(this.dialogSetting, 'loading', false);
      });
    },
    getIdByCiVoList(ciVoList) {
      let idList = [];
      ciVoList && ciVoList.forEach((item) => {
        idList.push(item.id);
      });
      return idList;
    },
    handleOk() {
      // 执行操作
      let _this = this;
      this.flagNumber = 0;
      let filterEmptyList = this.$utils.deepClone(this.dialogList);
      if (filterEmptyList && filterEmptyList.length > 0) {
        let emptyList = filterEmptyList.filter((val) => {
          return !_this.$utils.isEmpty(val.value);
        });
        if (emptyList && emptyList.length == 0) {
          this.$Message.warning('请勾选至少一类巡检目标后执行');
          return false;
        }
      }
      let newList = [];
      filterEmptyList && filterEmptyList.forEach((item) => {
        item.value = item.value.filter((itemFilter) => {
          return itemFilter;
        });
        item && item.ciVoList.forEach((innerItem) => {
          if (innerItem && innerItem.id && item.value.includes(innerItem.id)) {
            this.$api.inspect.applicationInspect.getCombopIdByTypeId({ciId: innerItem.id, resourceId: null}).then((innerRes) => {
              if (innerRes.Status == 'OK') {
                let returnValue = innerRes.Return;
                if (returnValue && returnValue.isHasBindCombop == 1) {
                  innerItem.combopId = returnValue.combop ? returnValue.combop.id : null;
                  this.defaultDialogList = this.$utils.deepClone(filterEmptyList);
                  this.flagNumber++;
                } else {
                  this.isShowCompobList = true;
                  this.noCompobIdList.push({
                    id: innerItem.id,
                    label: innerItem.label,
                    toolName: innerItem.name
                  });
                  this.defaultDialogList = this.$utils.deepClone(filterEmptyList);
                }
              }
            });
          }
        });
      });
    },
    handleCancel() {
      this.dialogSetting.isShow = false;
    },
    handleCompobCancel() {
      this.noCompobIdList = [];
      this.isShowCompobList = false;
    },
    async init() {
      this.moduleName = this.$route.query.name;
      await this.getTabList();
      await this.getTableList(this.id, this.envId);
    },
    async getTabList() {
      // 获取tab列表
      this.isLoading = true;
      await this.$api.cmdb.applicationManage.getEnvironmenteList().then(res => {
        if (res.Status == 'OK') {
          let tabList = res.Return.tbodyList || [];
          this.tabList = tabList;
          this.envId = (tabList.length > 0 && tabList[0]) ? tabList[0].id : '';      
          this.isLoading = false;
        }
      });
    },
    handleTimes(time) {
      // 处理时间
      let data = '-';
      if (time) {
        data = Date.parse(new Date()) - time;
      }
      return data;
    },
    handleTableData(currentPage, pageSize, row, index) {
      // 处理分页处理
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
      this.isLoading = true;
      this.$api.inspect.applicationInspect.getapplicationInspectList(data).then(res => {
        if (res.Status == 'OK') {
          let tableList = (res.Return && res.Return.tableList) ? res.Return.tableList[0] : [];
          currentRow = Object.assign({}, row, tableList);
          this.$set(this.leftData, index, currentRow);
          this.isLoading = false;
        }
      });
    },
    operation(row) {
      this.$router.push({ 
        path: './assets-detail-' + row.id, 
        query: { backPage: 'applicationInspection'}}); // 修复应用巡检报告-查看报告后，点击返回，返回的是资产巡检报告页面问题
    },
    async getTableList(id, envId) {
      // 获取列表数据
      let data = {
        appModuleId: id,
        envId: envId || this.envId
      };
      this.isLoading = true;
      await this.$api.inspect.applicationInspect.getapplicationInspectList(data).then(res => {
        if (res.Status == 'OK') {
          this.leftData = [];
          let tableList = res.Return.tableList || [];          
          tableList.forEach(v => {
            this.leftData.push(
              Object.assign({isShow: false}, v)
            );
          });
          if (!this.$utils.isEmpty(this.leftData)) {
            this.leftData[0].isShow = true;
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      });
    },
    goAnchor(selector, row) {
      document.querySelector(selector).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest'});
      // [可选] "start"，"center"，"end"或"nearest"。默认为"center"。
      this.leftData.forEach(v => {
        v.isShow = false;
      });
      row.isShow = true;
    },
    async handleTab(name) {
      // 处理tab点击
      let envId = null;
      if (!this.$utils.isEmpty(this.tabList)) {
        this.tabList.forEach(v => {
          if (v.name == name) {
            envId = v.id;
          }
        });
        this.envId = envId;
        await this.getTableList(this.id, envId);
      }
    },
    filterType(row) {
      // 过滤类型字段，修复控制台类型传递不对，报错问题
      let currentValue = this.$utils.deepClone(row);
      if (!this.$utils.isEmptyObj(currentValue)) { 
        delete currentValue.type;
      }
      return currentValue;
    }
  },
  computed: {},
  watch: {
    flagNumber(val) {
      if (!this.isShowCompobList && val) {
        let ciVoListNumber = 0;
        let dialogList = this.$utils.deepClone(this.dialogList);
        dialogList && dialogList.forEach((item) => {
          item && item.value && item.value.forEach((innerItem, index) => {
            if (!innerItem) {
              item.value.splice(index, 1);
            }
          });
          ciVoListNumber += item.value ? item.value.length : [];
        });
        if (ciVoListNumber == val) {
          this.handleContinue();
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/my-theme.less';
.checkbox-list-box {
  /deep/ .ivu-checkbox-group-item {
    margin-bottom: 10px;
  }
}
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
  height: calc(100vh - 50px - 50px - 32px - 16px);
  padding: 16px;
  overflow: auto;
  /deep/.tstable-main{
    max-height:100%!important;
  }
  .title{
    margin:10px;
    font-size: 16px;
  }
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
