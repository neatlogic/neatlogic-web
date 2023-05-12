/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div>
    <TsContain :isSiderHide="isSiderHide" :enableCollapse="true" border="border">
      <template v-slot:topLeft>
        <div class="action-group">
          <span :class="isExpandCollapse ? 'tsfont-up' : 'tsfont-down'" class="action-item" @click="handleExpandCollapse()">
            <span v-if="isExpandCollapse">{{ $t('page.clickandputaway') }}</span>
            <span v-else>{{ $t('page.clicktoexpand') }}</span>
          </span>
          <span class="action-item tsfont-rotate-right" @click="handleRefresh()">{{ $t('page.refresh') }}</span>
          <span v-if="!downloadLoading" v-download="downloadUrl" class="action-item tsfont-download">{{ $t('page.export') }}</span>
          <span v-if="downloadLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
            <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
            {{ $t('page.export') }}
          </span>
          <span class="action-item tsfont-mail-unread-o" @click="sendEmail">{{ $t('page.mail') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <CombineSearcher
          ref="combineSearcher"
          v-model="searchVal"
          v-bind="searchConfig"
          @confirm="searchCondition"
          @change-label="changeLabelCombineSearcher"
        >   
          <template v-slot:batchSearchList="{valueConfig}">
            <div>
              <TsFormItem :label="$t('page.batchsearch')" labelPosition="left">
                <TsFormRadio
                  v-model="valueConfig.searchField"
                  :dataList="[{value: 'ip',text: 'IP'},{value: 'name',text: $t('page.name')}]"
                ></TsFormRadio>
              </TsFormItem>
              <TsFormItem :label="$t('page.batchsearchvalue')" labelWidth="0px" labelPosition="left">
                <TsFormInput
                  v-model="valueConfig.batchSearchList"
                  type="textarea"
                  :placeholder="'192.168.0.1\n192.168.0.2\n192.168.0.3'"
                  :autoSize="{minRows: 4}"
                >
                </TsFormInput>
              </TsFormItem>
            </div>
          </template>
          <template slot="action">
            <div class="action-group">
              <div class="action-item">
                <Button @click="closeCombineSearchPanel">{{ $t('page.cancel') }}</Button>
              </div>
              <div class="action-item">
                <Button
                  ghost
                  type="primary"
                  @click="saveAsNewCatagory"
                >{{ $t('page.saveasnewcategory') }}</Button>
              </div>
              <div v-if="categoryId" class="action-item">
                <!-- 编辑时才出现 -->
                <Button
                  ghost
                  type="primary"
                  @click="updateNewClass"
                >{{ $t('page.save') }}</Button>
              </div>
              <div class="action-item">
                <Button type="primary" @click="searchTableData">{{ $t('page.search') }}</Button>
              </div>
            </div>
          </template>
        </CombineSearcher>
      </template>
      <template v-slot:sider>
        <div>
          <Tree
            :data="treeData"
            :render="renderContent"
            class="ts-tree"
            @on-select-change="handleTreeSelectedChange"
          ></Tree>
        </div>
      </template>
      <template v-slot:content>
        <Loading
          :loadingShow="loadingShow"
          type="fix"
        ></Loading>
        <TsTable
          v-if="!loadingShow"
          v-bind="tableConfig"
          canExpand
          class="inner-table"
          @changeCurrent="getTableData"
          @changePageSize="getTableData(1, ...arguments)"
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
              <span :class="[row.monitorStatusJson.cssClass, { 'background-FATAL': row.monitorStatusJson.value == 'FATAL' }]" class="mr-xs">{{ row.monitorStatusJson.text }}</span>
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
              <span :class="[row.inspectStatusJson.cssClass, { 'background-FATAL': row.inspectStatusJson.value == 'FATAL' }]" class="mr-xs">{{ row.inspectStatusJson.text }}</span>
              <span class="text-title">{{ handleTime(row.inspectTime) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}{{ $t('page.before') }}</span>
            </span>
            <span v-else>
              <span>-</span>
            </span>
          </template>
          <template v-slot:showInnerTable="{ row, index }">
            <span :class="{ 'tsfont-right': !row._expand, 'tsfont-down open': row._expand }" class="table-icon" @click.stop="openInnerTable(row, index)"></span>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-setting" @click="openRuleThresholdDialog(row)">{{ $t('term.inspect.thresholdrule') }}</li>
                <li class="tsfont-history" @click="openJobDetail(row)">{{ $t('term.inspect.jobdetail') }}</li>
                <li class="tsfont-ci" @click="toCientityView(row)">{{ $t('term.cmdb.viewcientity') }}</li>
              </ul>
            </div>
          </template>
          <template v-slot:expand="{ row }">
            <ExpandTable v-if="row._expand" style="margin-left: 40px;" :inspectResultList="getInnerTbodyList(row.inspectResult)"></ExpandTable>
          </template>
        </TsTable>
      </template>
    </TsContain>

    <SendEmail
      v-if="isShowSendEmail"
      :params="{
        isNeedAlertDetail: 1,
        inspectStatusList: inspectStatusList,
        ...searchVal,
        ...selectType
      }"
      @closeSendEmailDialog="closeSendEmailDialog"
    ></SendEmail>
    <RuleOfThresholdDialog
      v-if="isShowRuleThresholdDialog"
      :appSystemId="appSystemId"
      :resourceId="resourceId"
      @close="closeRuleOfThresholdDialog"
    ></RuleOfThresholdDialog>
    <CategoryEditDialog
      v-if="isShowCategoryEditDialog"
      @save="saveCategoryMenu"
      @close="closeCategoryEditDialog"
    ></CategoryEditDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '', // 最新问题
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    ExpandTable: resolve => require(['./component/expand-table.vue'], resolve),
    SendEmail: resolve => require(['./component/send-email.vue'], resolve),
    RuleOfThresholdDialog: resolve => require(['@/views/pages/inspect/application/threshold/rule-of-threshold-dialog.vue'], resolve),
    CategoryEditDialog: resolve => require(['./category-edit-dialog'], resolve)
  },
  directives: { download },
  filters: {},
  props: {},
  data() {
    return {
      isShowCategoryEditDialog: false,
      loadingShow: true, // 加载中动画
      isSiderHide: false, // 隐藏侧边栏
      downloadLoading: false,
      isShowSendEmail: false,
      isShowRuleThresholdDialog: false,
      resourceId: null,
      appSystemId: null,
      treeData: [],
      categoryId: this.$route.params['recentIssuesId'] ? parseInt(this.$route.params['recentIssuesId']) : null, // 新分类id
      conditionList: [],
      selectType: {
        typeId: null
      },
      searchVal: {
        searchField: 'ip'
      },
      showInnerTableList: [],
      contentHeight: '100',
      isExpandCollapse: true, // 处理展开收起，默认展开
      resourceIdList: [], // 资产id列表
      recordExpandCollapseList: [], // 收起列表
      inspectStatusList: [], // 巡检状态
      tableConfig: {
        keyName: 'id',
        theadList: [
          {
            title: '',
            key: 'showInnerTable'
          },
          {
            title: this.$t('page.ip'),
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
            title: '',
            key: 'action'
          }
        ],
        tbodyList: [],
        pageSize: 20,
        currentPage: 1,
        rowNum: null
      },
      searchConfig: {
        placeholder: this.$t('term.inspect.inputargetnameip'),
        searchMode: 'clickBtnSearch', // 点击搜索按钮搜索
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
            onChange: (val) => {
              let appSystemIdList = [];
              appSystemIdList = this.searchConfig.searchList.filter(item => {
                return item.name == 'appModuleIdList';
              });
              if (!this.$utils.isEmpty(appSystemIdList)) {
                appSystemIdList[0].params.appSystemIdList = val;
              }
              if (val) {
                this.$nextTick(() => {
                  if (this.searchVal && this.searchVal.appModuleIdList) {
                    this.$delete(this.searchVal, 'appModuleIdList');
                    this.getTableData(1);
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
            params: { enumClass: 'InspectStatus' },
            dealDataByUrl: (nodeList) => this.dealInspectStatusDataByUrl(nodeList),
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
            label: this.$t('page.protocol'),
            multiple: true,
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getProtocolDataList,
            transfer: true,
            className: 'block-span'
          },
          {
            type: 'checkbox',
            name: 'inspectJobPhaseNodeStatusList',
            label: this.$t('page.jobstatus'),
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'JobNodeStatus' },
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
            textName: 'description',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async init() {
      await this.getInspectStatusList();
      if (this.categoryId) {
        await this.getNewClassCondition();
      }
      await this.getTreeType();
      this.getTableData(null, null);
    },
    async getInspectStatusList() {
      // 获取巡检状态列表
      this.inspectStatusList = [];
      await this.$api.common.getSelectLit({enumClass: 'InspectStatus'}).then((res) => {
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
    searchTableData() {
      this.$refs.combineSearcher.refreshTextConfig();
      this.closeCombineSearchPanel();
      this.getTableData(1);
    },
    searchCondition(searchVal) {
      if (searchVal && this.$utils.isEmptyObj(searchVal)) {
        this.searchVal.searchField = 'ip'; // 设置默认值
      }
      this.getTableData(1);
    },
    closeCombineSearchPanel() {
      // 关闭搜索面板
      this.$refs.combineSearcher.handleToggleOpen(); // 关闭搜索面板
    },
    dealInspectStatusDataByUrl(nodeList) {
      // 处理巡检状态下拉列表数据
      let dataList = [];
      if (nodeList && nodeList.length > 0) {
        dataList = nodeList.filter(val => {
          return val && val.value != 'normal'; // 过滤非正常状态
        });
      }
      return dataList;
    },
    saveAsNewCatagory() {
      // 另存为新分类
      this.closeCombineSearchPanel();
      this.isShowCategoryEditDialog = true;
    },
    closeCategoryEditDialog() {
      this.isShowCategoryEditDialog = false;
    },
    saveCategoryMenu(newClassData) {
      // 保存新分类，成功后跳转到新分类
      this.$api.inspect.assetsInspect.saveProblemClassification({conditionConfig: {treeId: this.selectType.typeId, searchCondition: this.searchVal}, ...newClassData}).then(res => {
        if (res.Status == 'OK') {
          let id = res.Return;
          this.$router.push({path: '/recent-issues-' + id});
          // 刷新左侧菜单
          this.$store.dispatch('leftMenu/getRecentIssuesMenuData');
        }
      });
    },
    updateNewClass() {
      // 保存新分类
      let params = {
        id: this.categoryId,
        conditionConfig: {
          treeId: this.selectType.typeId,
          searchCondition: this.searchVal
        }
      };
      this.$api.inspect.assetsInspect.updateNewClassificationCondition(params).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.searchTableData();
        }
      });
    },
    async getNewClassCondition() {
      // 获取新分类搜索条件
      if (this.categoryId) {
        await this.$api.inspect.assetsInspect.getProblemClassificationById({id: this.categoryId}).then((res) => {
          if (res && res.Status == 'OK') {
            let dataInfo = res.Return;
            if (dataInfo && dataInfo.hasOwnProperty('conditionConfig')) {
              let conditionConfig = dataInfo.conditionConfig || {};
              this.$set(this.selectType, 'typeId', conditionConfig.treeId);
              this.searchVal = conditionConfig.searchCondition;
              if (this.searchVal && this.searchVal.appSystemIdList) {
                this.searchConfig.searchList.forEach((v) => {
                  if (v.name == 'appModuleIdList') {
                    this.$set(v, 'params', {appSystemIdList: this.searchVal.appSystemIdList});
                  }
                });
              }
            }
          }
        });
      }
    },
    handleExpandCollapse() {
      // 处理展开收起
      this.isExpandCollapse = !this.isExpandCollapse;
      this.$addHistoryData('isExpandCollapse', this.isExpandCollapse);
      if (this.tableConfig && this.tableConfig.tbodyList.length > 0) {
        this.tableConfig.tbodyList.forEach((item, index) => {
          item._expand = this.isExpandCollapse;
          this.$set(this.tableConfig.tbodyList, index, item);
          if (this.isExpandCollapse) {
            this.showInnerTableList.push(item.id);
          }
        });
        let isExpand = this.recordExpandCollapseList.includes(this.tableConfig.currentPage);
        if (isExpand) {
          // 收起删除
          for (let i = 0; i < this.recordExpandCollapseList.length; i++) {
            if (this.recordExpandCollapseList[i] == this.tableConfig.currentPage) {
              this.recordExpandCollapseList.splice(i, 1);
              break;
            }
          }
        }
      }
      if (!this.isExpandCollapse) {
        this.showInnerTableList = []; // 收起，置空值
        let isExpand = this.recordExpandCollapseList.includes(this.tableConfig.currentPage);
        if (isExpand) {
          // 收起删除
          for (let i = 0; i < this.recordExpandCollapseList.length; i++) {
            if (this.recordExpandCollapseList[i] == this.tableConfig.currentPage) {
              this.recordExpandCollapseList.splice(i, 1);
              break;
            }
          }
        } else {
          this.recordExpandCollapseList.push(this.tableConfig.currentPage);
        }
      }
    },
    handleRefresh() {
      // 处理刷新
      this.getTableData(1, null);
    },
    getInnerTbodyList(inspectResult) {
      let tbodyList = [];
      if (inspectResult && !this.$utils.isEmpty(inspectResult)) {
        tbodyList = inspectResult;
      }
      return tbodyList;
    },
    openInnerTable(row, index) {
      // 展开收起内嵌表格
      this.showInnerTableList = this.$utils.isEmpty(this.showInnerTableList) ? [] : this.showInnerTableList;
      if (row['_expand']) {
        row._expand = false;
        this.$set(this.tableConfig.tbodyList, index, row);
        this.showInnerTableList.find((item, index) => {
          if (item == row[this.tableConfig.keyName]) {
            this.showInnerTableList.splice(index, 1);
            return true;
          }
        });
      } else {
        row._expand = true;
        this.showInnerTableList.push(row[this.tableConfig.keyName]);
        this.$set(this.tableConfig.tbodyList, index, row);
      }
    },
    handleTime(time) {
      let data = '-';
      if (time) {
        data = Date.parse(new Date()) - time;
      }
      return data;
    },
    getText(obj, name) {
      if (obj && obj.hasOwnProperty(name)) {
        return obj[name];
      } else {
        return '';
      }
    },
    verticals() {
      this.isSiderHide = !this.isSiderHide;
    },
    async getTreeType() {
      //获取树形类型
      await this.$api.cmdb.asset.getResourceTreeType().then(res => {
        let data = res.Return;
        if (this.selectType && this.selectType.typeId) {
          this.setTreeDataSelect(this.selectType.typeId, data);
        } else if (data[0]) {
          data[0].selected = true;
          data[0].expand = true;
          this.selectType = {
            typeId: data[0].id
          };
        }
        this.treeData = data;
      });
    },
    setTreeDataSelect(typeId, data, parentData) {
      // 设置树勾选
      if (data && data.length > 0) {
        data.forEach(d => {
          d._parent = parentData;
          if (d.id == typeId) {
            d.selected = true;
            this.setTreeDataExpand(d);
          } else {
            if (d.children) {
              this.setTreeDataSelect(typeId, d.children, d);
            }
          }
        });
      }
    },
    setTreeDataExpand(data) {
      data.expand = true;
      if (data._parent) {
        this.setTreeDataExpand(data._parent);
      }
    },
    getTableData(currentPage, pageSize, isFirst = true) {
      //获取表格数据
      if (!this.selectType.typeId) {
        return;
      }
      let params = { ...this.searchVal, ...this.selectType };
      params.currentPage = currentPage || this.tableConfig.currentPage;
      params.pageSize = pageSize || this.tableConfig.pageSize;
      if (params && !params.hasOwnProperty('inspectStatusList')) {
        params.inspectStatusList = this.inspectStatusList;
      }
      if (!this.$utils.isEmpty(params.batchSearchList)) {
        params.batchSearchList = params.batchSearchList.split('\n');
      } else {
        params.batchSearchList = [];
      }
      this.tableConfig.pageSize = pageSize || this.tableConfig.pageSize;
      this.$addHistoryData('searchVal', this.searchVal);
      this.$addHistoryData('selectType', this.selectType);
      this.$addHistoryData('currentPage', params.currentPage);
      this.$addHistoryData('pageSize', params.pageSize);
      this.$addHistoryData('recordExpandCollapseList', this.recordExpandCollapseList);
      this.$addHistoryData('isExpandCollapse', this.isExpandCollapse);
      this.loadingShow = true;
      this.$api.inspect.assetsInspect.searchReport(params).then(res => {
        if (res.Status == 'OK') {
          this.tableConfig = Object.assign(this.tableConfig, res.Return);
          this.resourceIdList = [];
          if (this.tableConfig && this.tableConfig.tbodyList.length > 0) {
            this.tableConfig.tbodyList.forEach(item => {
              this.resourceIdList.push(item.id);
            });
          }
          this.getInnerTableList(this.resourceIdList); // 获取内嵌表格数据
          if (isFirst) {
            isFirst = !this.recordExpandCollapseList.includes(this.tableConfig.currentPage); // 切换页码，回显数据是展开还是收起状态
            this.isExpandCollapse = !!isFirst;
          }
          if (this.tableConfig && !this.$utils.isEmpty(this.tableConfig.tbodyList) && isFirst) {
            this.showInnerTableList = [];
            this.isExpandCollapse = true;
            this.tableConfig.tbodyList.forEach(val => {
              val._expand = true;
              this.showInnerTableList.push(val.id);
            });
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getInnerTableList(resourceIdList) {
      this.$api.inspect.inspectJob.getRecentIssuesInnerTableList({ resourceIdList: resourceIdList }).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return;
          this.tableConfig.tbodyList.forEach(item => {
            Object.keys(obj).forEach(n => {
              if (item.id == n) {
                this.$set(item, 'inspectResult', obj[n] ? Object.values(obj[n]) : []);
              }
            });
          });
        }
      });
    },
    restoreHistory(historyData) {
      this.searchVal = historyData['searchVal'];
      this.selectType = historyData['selectType'];
      this.tableConfig.currentPage = historyData['currentPage'];
      this.tableConfig.pageSize = historyData['pageSize'];
      this.recordExpandCollapseList = historyData['recordExpandCollapseList'];
      this.isExpandCollapse = historyData['isExpandCollapse'];
    },
    renderContent(h, { root, node, data }) {
      //渲染树的lable名称
      return h('span', {
        staticClass: '',
        domProps: {
          innerHTML: data.label
        }
      });
    },
    handleTreeSelectedChange(nodeList, node) {
      //选中类型
      this.selectType = {
        typeId: node.id
      };
      this.getTableData(1, null);
    },
    toAssetsDetail(row) {
      // 跳转巡检报告页面
      this.$router.push({
        path: './assets-detail-' + row.id,
        query: {
          backPage: 'recentIssues'
        }
      });
    },
    toCientityView(row) {
      // 跳转查看配置项页面
      this.$router.push({path: '/ci/' + row.typeId + '/cientity-view/' + row.id});
    },
    openJobDetail(row) {
      // 打开新的工作详情
      let jobPhaseNodeVo = row.jobPhaseNodeVo || '';
      this.$router.push({path: '/job-detail?id=' + (jobPhaseNodeVo ? jobPhaseNodeVo.jobId : '') + '&status=' + (jobPhaseNodeVo ? jobPhaseNodeVo.status : '')});
    },
    sendEmail() {
      // 发送邮件
      this.isShowSendEmail = true;
    },
    closeSendEmailDialog() {
      this.isShowSendEmail = false;
    },
    openRuleThresholdDialog(row) {
      if (row && row.id) {
        this.resourceId = row.id;
        this.appSystemId = row.appSystemId;
        this.isShowRuleThresholdDialog = true;
      }
    },
    closeRuleOfThresholdDialog() {
      this.isShowRuleThresholdDialog = false;
    },
    changeLabelCombineSearcher(val) {
      if (!this.$utils.isEmpty(this.searchVal.batchSearchList)) {
        this.$set(val, 'batchSearchList', this.searchVal.batchSearchList.split('\n'));
      }
    }
  },
  computed: {
    downloadUrl() {
      return {
        url: 'api/binary/inspect/new/problem/report/export',
        method: 'post',
        params: {
          isNeedAlertDetail: 1,
          inspectStatusList: this.inspectStatusList,
          ...this.searchVal,
          ...this.selectType
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
  watch: {}
};
</script>
<style lang="less" scoped>
.vertical {
  vertical-align: inherit;
  font-size: 12px;
}
.combine-searcher-text-align {
  /deep/ .tag-item {
    line-height: 0 !important;
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
</style>
