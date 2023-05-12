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
    <loading :loadingShow="loadingShow" type="fix"></loading>
    <TsContain :isSiderHide="isSiderHide" :enableCollapse="true" border="border">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/job-manage')">{{ $t('term.deploy.joblist') }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item tsfont-formtime">{{ parseInt(topNavTextObj.startTime) | formatDate }}</span>
          <span class="action-item text-grey">
            <UserCard :uuid="topNavTextObj.execUser" hideAvatar></UserCard>
          </span>
          <span :class="isExpandCollapse ? 'tsfont-up' : 'tsfont-down'" class="action-item" @click="handleExpandCollapse()">
            <span v-if="isExpandCollapse">{{ $t('page.packup') }}</span>
            <span v-else>{{ $t('page.expand') }}</span>
          </span>
          <span class="action-item tsfont-rotate-right" @click="handleRefresh()">{{ $t('page.refresh') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="getTableData(1)"></CombineSearcher>
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
        <TsTable
          v-if="!loadingShow"
          v-bind="tableConfig"
          :loading="loading"
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
              <span class="mr-xs" :class="[row.monitorStatusJson.cssClass, { 'background-FATAL': row.monitorStatusJson.value == 'FATAL' }]">{{ row.monitorStatusJson.text }}</span>
              <span class="text-grey">{{ handleTime(row.monitorTime) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}{{ $t('page.before') }}</span>
            </span>
            <span v-else>
              <span>-</span>
            </span>
          </template>
          <template v-slot:taskStatus="{ row }">
            <div class="text-action" @click="openJobDetail(row)">
              <CommonStatus
                v-if="row.jobPhaseNodeVo"
                :statusName="row.jobPhaseNodeVo.statusName"
                :statusValue="row.jobPhaseNodeVo.status"
                type="text"
              ></CommonStatus>
              <span v-else>-</span>
            </div>
          </template>
          <template v-slot:inspectTime="{ row }">
            <!-- 巡检状态 -->
            <span v-if="row.inspectStatusJson && row.inspectTime" :title="row.inspectTime | formatDate">
              <span class="mr-xs" :class="[row.inspectStatusJson.cssClass, { 'background-FATAL': row.inspectStatusJson.value == 'FATAL' }]">{{ row.inspectStatusJson.text }}</span>
              <span class="text-grey">{{ handleTime(row.inspectTime) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}{{ $t('page.before') }}</span>
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
                <li class="tsfont-circulation-o" @click="toCientityView(row)">{{ $t('term.cmdb.viewcientity') }}</li>
              </ul>
            </div>
          </template>
          <template v-slot:expand="{ row }">
            <ExpandTable v-if="row._expand" style="margin-left: 40px;" :tbodyList="getInnerTbodyList(row.inspectResult)"></ExpandTable>
          </template>
        </TsTable>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'QuestionReport', // 问题报告
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    ExpandTable: resolve => require(['./components/expand-table.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      loadingShow: true, // 加载中动画
      isSiderHide: false, // 隐藏侧边栏
      selectType: {
        typeId: ''
      },
      loading: false, // 表格中加载
      treeData: [],
      searchVal: {},
      showInnerTableList: [],
      jobId: null, // 巡检作业ID
      isExpandCollapse: true, // 展开收起，默认展开
      recordExpandCollapseList: [], // 记录展开收起列表数据
      resourceIdList: [], // 内嵌资源id列表
      topNavTextObj: {
        startTime: '', // 作业执行开始时间
        execUser: '' // 执行用户
      },
      searchConfig: {
        placeholder: this.$t('term.inspect.inputargetnameip'),
        searchList: [
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
          },
          {
            type: 'checkbox',
            name: 'inspectStatusList',
            label: this.$t('term.autoexec.inspectstatus'),
            dataList: [],
            multiple: true,
            className: 'block-span'
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
            type: 'select',
            name: 'appSystemIdList',
            label: this.$t('page.system'),
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
          }
        ]
      },
      tableConfig: {
        keyName: 'id',
        value: [],
        theadList: [
          {
            title: '',
            key: 'showInnerTable'
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
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    let query = this.$route.query;
    if (query && !this.$utils.isEmptyObj(query)) {
      Object.assign(this.topNavTextObj, query);
      this.jobId = query.jobId ? parseInt(query.jobId) : this.jobId;
    }
    this.filterInspectStatusNormal();
    await this.getTreeType();
    this.getTableData(null, null);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
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
    filterInspectStatusNormal() {
      // 过滤巡检状态正常字段
      let dataList = [];
      let url = '/api/rest/universal/enum/get';
      let params = { enumClass: 'neatlogic.framework.common.constvalue.InspectStatus' };
      this.$https.post(url, params).then(res => {
        if (res.Status == 'OK' && res.Return) {
          dataList = res.Return.filter(val => {
            return val && val.value != 'normal';
          });
          this.searchConfig &&
            this.searchConfig.searchList &&
            this.searchConfig.searchList.forEach(val => {
              if (val.name == 'inspectStatusList') {
                val.dataList = dataList;
              }
            });
        }
      });
    },
    getInnerTbodyList(inspectResult) {
      let tbodyList = [];
      if (inspectResult && !this.$utils.isEmptyObj(inspectResult)) {
        tbodyList = Object.values(inspectResult.thresholds);
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
      // obj 对象，name获取对象的名称
      if (obj && obj.hasOwnProperty(name)) {
        return obj[name];
      } else {
        return '';
      }
    },
    getTreeType() {
      //获取树形类型
      return this.$api.cmdb.asset.getResourceTreeType().then(res => {
        let data = res.Return;
        if (this.selectType.typeId) {
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
      params.jobId = this.jobId;
      params.currentPage = currentPage || this.tableConfig.currentPage;
      params.pageSize = pageSize || this.tableConfig.pageSize;
      this.tableConfig.currentPage = currentPage || this.tableConfig.currentPage;
      this.tableConfig.pageSize = pageSize || this.tableConfig.pageSize;
      this.$addHistoryData('searchVal', this.searchVal);
      this.$addHistoryData('selectType', this.selectType);
      this.$addHistoryData('currentPage', params.currentPage);
      this.$addHistoryData('pageSize', params.pageSize);
      this.$addHistoryData('jobId', params.jobId);
      this.$addHistoryData('topNavTextObj', this.topNavTextObj);
      this.$addHistoryData('recordExpandCollapseList', this.recordExpandCollapseList);
      this.$addHistoryData('isExpandCollapse', this.isExpandCollapse);
      this.loadingShow = true;
      this.$api.inspect.inspectJob.getInspectResult(params).then(res => {
        if (res.Status == 'OK') {
          this.loadingShow = false;
          this.tableConfig = Object.assign(this.tableConfig, res.Return);
          this.resourceIdList = [];
          if (this.tableConfig && this.tableConfig.tbodyList.length > 0) {
            this.tableConfig.tbodyList.forEach(item => {
              this.resourceIdList.push(item.id);
            });
          }
          if (isFirst) {
            isFirst = !this.recordExpandCollapseList.includes(this.tableConfig.currentPage); // 切换页码数，回显数据是展开还是收起
            this.isExpandCollapse = !!isFirst;
          }
          this.getInnerTableList(this.resourceIdList); // 获取内嵌表格数据
          if (this.tableConfig && !this.$utils.isEmpty(this.tableConfig.tbodyList) && isFirst) {
            this.showInnerTableList = [];
            this.isExpandCollapse = true;
            this.tableConfig.tbodyList.forEach(val => {
              val._expand = true;
              this.showInnerTableList.push(val.id);
            });
          }
        }
      });
    },
    getInnerTableList(resourceIdList) {
      if (!this.jobId && !this.$utils.isEmpty(resourceIdList)) {
        return false;
      }
      this.$api.inspect.inspectJob.getQuestionReport({ jobId: this.jobId, resourceIdList: resourceIdList }).then(res => {
        if (res.Status == 'OK') {
          this.tableConfig.tbodyList.forEach(item => {
            res.Return.forEach(l => {
              if (item.id == l.id) {
                this.$set(item, 'inspectResult', l.inspectResult);
              }
            });
          });
        }
      });
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
          jobId: this.jobId,
          backPage: 'questionReport'
        }
      });
    },
    toCientityView(row) {
      // 跳转查看配置项页面
      this.$router.push({path: '/ci/' + row.typeId + '/cientity-view/' + row.id});
      //window.open(HOME + '/cmdb.html#/ci/' + row.typeId + '/cientity-view/' + row.id, '_blank');
    },
    openJobDetail(row) {
      // 打开新的工作详情
      window.open(HOME + '/autoexec.html#/job-detail?id=' + row.jobPhaseNodeVo.jobId + '&status=' + row.jobPhaseNodeVo.status, '_blank');
    },
    restoreHistory(historyData) {
      this.searchVal = historyData['searchVal'];
      this.selectType = historyData['selectType'];
      this.tableConfig.currentPage = historyData['currentPage'];
      this.tableConfig.pageSize = historyData['pageSize'];
      this.topNavTextObj = historyData['topNavTextObj'];
      this.jobId = historyData['jobId'];
      this.recordExpandCollapseList = historyData['recordExpandCollapseList'];
      this.isExpandCollapse = historyData['isExpandCollapse'];
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
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
