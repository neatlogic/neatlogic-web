<template>
  <div>
    <TsContain enableCollapse :siderWidth="220">
      <template v-slot:topLeft>
        <div class="action-group">
          <template v-if="canEditAuth">
            <template v-if="searchParam.appSystemId">
              <template v-if="canAddJob">
                <span class="tsfont-plus text-action action-item" @click="addJob">作业</span>
              </template>
              <template v-else>
                <Tooltip
                  max-width="400"
                  placement="right"
                  transfer
                >
                  <span class="tsfont-plus text-disabled action-item">作业</span>
                  <ul slot="content">
                    <li v-if="!selectedApp.isConfig">当前应用尚未配置，点击<span class="text-href" @click="toPipeline()">添加配置</span></li>
                    <li v-else-if="!selectedApp.isHasModule">当前应用未配置任何模块，点击<span class="text-href" @click="addModule()">添加模块</span></li>
                    <li v-else-if="selectedApp.isHasModule && !selectedApp.isHasEnv">
                      <div v-for="item in moduleList" :key="item.id" class="pb-sm">
                        <span>{{ selectedApp.name }}/{{ item.abbrName }}{{ item.name?'['+item.name+']':'' }}未配置环境信息，点击</span>
                        <span class="text-href" @click="addEnv(item.id)">添加环境</span>
                      </div>
                    </li>
                    <li v-else-if="selectedModule && !selectedModule.isHasEnv">
                      <span>{{ selectedApp.name }}/{{ selectedModule.abbrName }}{{ selectedModule.name?'['+selectedModule.name+']':'' }}未配置环境信息，点击</span>
                      <span class="text-href" @click="addEnv(selectedModule.id)">添加环境</span>
                    </li>
                    <li v-else-if="!hasScenarioAuth">
                      <div>您没有配置“场景权限”，点击<span class="text-href" @click="openAuthDialog">添加授权</span></div>
                    </li>
                    <li v-else-if="!hasEnvAuth">
                      <div>您没有配置“环境权限”，点击<span class="text-href" @click="openAuthDialog">添加授权</span></div>
                    </li>
                  </ul>
                </Tooltip>
              </template>
            </template>
            <Tooltip
              v-else
              content="请选中应用或模块后再创建作业"
              max-width="400"
              placement="right"
              transfer
            >
              <span class="tsfont-plus text-disabled action-item">作业</span>
            </Tooltip>
          </template>
          <template v-else>
            <Tooltip
              max-width="400"
              placement="right"
              transfer
            >
              <span class="tsfont-plus text-disabled action-item">作业</span>
              <ul slot="content">
                <li v-if="!searchParam.appSystemId">请选中应用或模块后再创建作业</li>
                <li v-else-if="!canEditAuth">您没有当前应用的“编辑配置权限”，请联系管理员授权</li>
              </ul>
            </Tooltip>
          </template>
          <span v-auth="'BATCHDEPLOY_MODIFY'" class="tsfont-plus text-action action-item" @click="addBatchJob">批量作业</span>
          <span v-if="isHasResourceLock" class="tsfont-lock text-action action-item" @click="globalLockShow">资源锁</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <CombineSearcher v-model="searchValue" v-bind="searchConfig" @change="searchJob(1)"></CombineSearcher>
        </div>
      </template>
      <template v-slot:sider>
        <div>
          <AppModuleList
            ref="appModuleList"
            v-model="appModuleData"
            :filter="{authorityActionList: ['view']}"
            @getSelectedApp="getSelectedApp"
            @getSelectedModule="getSelectedModule"
            @getSelectedEnv="getSelectedEnv"
          ></AppModuleList>
        </div>
      </template>
      <template v-slot:content>
        <div class="job-content">
          <TsTable
            v-bind="jobData"
            :theadList="theadList"
            :loading="isLoading"
            :sortList="sortList"
            :sortOrder="sortOrder"
            :sortMulti="false"
            @changeCurrent="searchJob"
            @changePageSize="changePageSize"
            @updateSort="updateSort"
          >
            <template v-slot:showChildren="{ row }">
              <span v-if="row.source === 'batchdeploy' || row.source === 'deployschedulepipeline'" class="text-href">
                <span v-if="!row.loading" :class="{ 'tsfont-minus-square': row['showChildren'], 'tsfont-plus-square': !row['showChildren'] }" @click="toggleChildJob(row)"></span>
                <Icon
                  v-else
                  type="ios-loading"
                  size="16"
                  class="loading"
                ></Icon>
              </span>
            </template>
            <template v-slot:name="{ row }">
              <span
                v-if="row.source === 'batchdeploy' || row.source === 'deployschedulepipeline'"
                class="text-href"
                @click="toBatchJobDetail(row)"
                @contextmenu="newTab($event, row, 'batch-job-detail')"
              >
                {{ row.name }}
              </span>
              <span
                v-else
                class="text-href"
                :class="{ 'ml-nm': !!row.parentId }"
                @contextmenu="newTab($event, row, 'job-detail')"
                @click="toJobDetail(row)"
              >{{ row.name }}</span>
              <span><Status v-if="row.reviewStatus != 'passed'" :statusValue="row.reviewStatus" :statusName="row.reviewStatusName"></Status></span>
              <Tooltip
                v-if="row.warnCount > 0 || row.isHasIgnored > 0"
                transfer
                class="stepStatues com-status"
                placement="bottom"
                theme="light"
              >
                <span class="tsfont-warning-o text-warn"></span>
                <template v-slot:content>
                  <div>
                    <div v-if="row.warnCount > 0">日志中存在告警信息</div>
                    <div v-if="row.isHasIgnored > 0">阶段中存在状态为'已忽略'的执行节点</div>
                  </div>
                </template>
              </Tooltip>
            </template>
            <template slot="operationType" slot-scope="{ row }">
              <span class="text-href" @click="toOperationDetail(row)">
                <span>{{ row.operationTypeName }}</span>
                <span v-if="row.operationName">({{ row.operationName }})</span>
              </span>
            </template>
            <template slot="status" slot-scope="{ row }">
              <Status :statusValue="row.status" :statusName="row.statusName" type="text"></Status>
            </template>
            <template v-slot:startTime="{ row }">
              <div v-if="row.startTime" class="fz10">
                <span>{{ row.startTime | formatDate }}</span>
                <span class="text-grey ml-xs">开始</span>
              </div>
              <div v-if="row.endTime" class="fz10">
                <span>{{ row.endTime | formatDate }}</span>
                <span class="text-grey ml-xs">结束</span>
              </div>
            </template>
            <template slot="completionRate" slot-scope="{ row }">
              <Liquid :percent="row.completionRate" :size="7" :config="getConfig(row)" />
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
    <!-- <SettingDialog
      v-if="showDialog"
      :appSystemId="searchParam.appSystemId"
      :appModuleId="searchParam.appModuleId"
      :selectedApp="selectedApp"
      :selectedModule="selectedModule"
      :authLevel="authType"
      @close="close"
      @addModule="addModule"
      @addEnv="addEnv"
    ></SettingDialog> -->
    <EnvEdit
      v-if="isShowEnvEdit"
      :params="envParam"
      @close="
        (needRefresh, params) => {
          closeEdit(needRefresh, params, 'env');
        }
      "
    ></EnvEdit>
    <ModuleEdit
      v-if="isShowModuleEdit"
      :appSystemId="searchParam.appSystemId"
      @close="
        (needRefresh, params) => {
          closeEdit(needRefresh, params, 'module');
        }
      "
    ></ModuleEdit>
    <AppEdit
      v-if="isShowAuthDialog"
      :isEdit="1"
      :params="{appSystemId: searchParam.appSystemId}"
      @close="closeAuthDialog"
    ></AppEdit>
    <LockDialog
      v-if="isShowResourceLockDialog"
      :selectedApp="selectedApp"
      :keywordParam="searchParam"
      @close="globalLockClose"
    ></LockDialog>
    <AddBatchJobDialog v-if="isAddBatchJobDialogShow" @close="closeBatchJob"></AddBatchJobDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    AppModuleList: resolve => require(['../application-config/config/app/app-module-list.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    Liquid: resolve => require(['@/resources/components/SimpleGraph/Liquid.vue'], resolve),
    // SettingDialog: resolve => require(['./publishing/setting-dialog.vue'], resolve),
    AppEdit: resolve => require(['@/views/pages/deploy/application-config/config/app/app-edit'], resolve), // 编辑权限
    ModuleEdit: resolve => require(['@/views/pages/deploy/application-config/config/app/components/module-tree-edit'], resolve), // 编辑模块
    EnvEdit: resolve => require(['@/views/pages/deploy/application-config/config/app/components/env-tree-edit'], resolve), // 编辑模块
    LockDialog: resolve => require(['@/views/pages/deploy/job/resourcelock/resourcelock-dialog'], resolve), //资源锁
    AddBatchJobDialog: resolve => require(['./add-batch-job-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      searchParam: { hasParent: false, authorityActionList: ['view'], sortOrder: {key: 'planStartTime', type: 'DESC'} },
      sortList: ['planStartTime', 'startTime'],
      sortOrder: [{planStartTime: 'DESC'}],
      noConfigInfo: false, // 无配置信息，模块和环境
      moduleList: [],
      isLoading: false,
      isShowResourceLockDialog: false,
      appModuleData: {},
      searchValue: {},
      searchConfig: {
        search: true,
        labelPosition: 'top',
        searchList: [
          {
            type: 'select',
            name: 'envId',
            label: '环境',
            url: '/api/rest/resourcecenter/appenv/list/forselect',
            params: { needPage: false },
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true
          },
          {
            type: 'daterange',
            name: 'startTimeRange',
            label: '执行时间',
            format: 'yyyy-MM-dd',
            transfer: true,
            placeholder: '请选择时间段'
          },
          {
            type: 'userselect',
            name: 'execUserList',
            label: '执行人',
            groupList: ['user'],
            multiple: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'statusList',
            label: '作业状态',
            multiple: true,
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'JobStatus' },
            transfer: true
          }
        ]
      },
      jobData: null,
      jobEndStatusList: ['completed', 'aborted', 'ignored', 'failed'], //终点状态节点列表，非终点状态列表的需要定时刷新。
      theadList: [
        { key: 'showChildren' },
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '场景',
          key: 'scenarioName'
        },
        {
          title: '状态',
          key: 'status'
        },
        {
          title: '耗时',
          key: 'costTime'
        },
        {
          title: '执行用户',
          key: 'execUserVo',
          type: 'user',
          uuid: 'uuid'
        },
        {
          title: '来源',
          key: 'sourceName'
        },
        {
          title: '计划时间',
          key: 'planStartTime',
          type: 'time'
        },
        {
          title: '起止时间',
          key: 'startTime',
          keyend: 'endTime'
        },
        {
          title: '触发方式',
          key: 'triggerTypeName'
        },
        {
          title: '执行情况',
          key: 'completionRate'
        }
      ],
      contentHeight: 100,
      showDialog: false,
      selectedTreeNodeConfig: {},
      selectedApp: null,
      selectedModule: null,
      selectedEnv: null,
      isShowEnvEdit: false,
      isShowModuleEdit: false,
      isHasResourceLock: false,
      envParam: {},
      authType: '',
      authList: [],
      isShowAuthDialog: false,
      isAddBatchJobDialogShow: false
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (query && !this.$utils.isEmptyObj(query) && query.appSystemId) {
      let {appSystemId, appModuleId, envId} = query;
      this.appModuleData = {
        appId: appSystemId ? parseInt(appSystemId) : null,
        moduleId: appModuleId ? parseInt(appModuleId) : null,
        envId: envId ? parseInt(envId) : null
      };
    }
    if (query && !query.appSystemId && !query.isBack) {
      this.$addHistoryData('appModuleEnvData', {}); // 清空上一次内容
    }
  },
  beforeMount() {},
  mounted() {
    this.searchJob();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.clearTimmer();
  },
  destroyed() {},
  methods: {
    toPipeline() {
      this.$router.push({
        path: '/application-config-pipeline',
        query: {
          appSystemId: this.searchParam.appSystemId
        }
      });
    },
    openAuthDialog() {
      this.isShowAuthDialog = true;
    },
    closeAuthDialog(needRefresh) {
      this.isShowAuthDialog = false;
      if (needRefresh) {
        this.$refs.appModuleList.refreshApp(this.searchParam.appSystemId).then(() => {
          this.appModuleData = {
            appId: this.searchParam.appSystemId,
            moduleId: this.searchParam.appModuleId
          };
        });
      }
    },
    toggleChildJob(row, isShow) {
      if (row['showChildren']) {
        this.$set(row, 'showChildren', false);
        for (let i = this.jobData.tbodyList.length - 1; i >= 0; i--) {
          const element = this.jobData.tbodyList[i];
          if (element.parentId === row.id) {
            this.jobData.tbodyList.splice(i, 1);
          }
        }
      } else {
        this.getChildrenJob(row);
      }
    },
    getChildrenJob(parentRow) {
      this.$set(parentRow, 'loading', true);
      this.$api.deploy.job.searchJobList({ parentId: parentRow.id }).then(res => {
        const jobList = res.Return.tbodyList;
        if (jobList && jobList.length > 0) {
          const pIndex = this.jobData.tbodyList.findIndex(d => d === parentRow);
          if (pIndex >= 0) {
            this.$set(parentRow, 'showChildren', true);
            this.$set(parentRow, 'loading', false);
            this.jobData.tbodyList.splice(pIndex + 1, 0, ...jobList);
          }
        }
      });
    },
    clearTimmer() {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
    },
    restoreHistory(historyData) {
      if (historyData['searchParam']) {
        this.searchParam = historyData['searchParam'];
      }
      if (historyData['searchValue']) {
        this.searchValue = historyData['searchValue'];
      }
      if (historyData['sortOrder']) {
        this.sortOrder = historyData['sortOrder'];
      }
      this.appModuleData = historyData['appModuleEnvData'] || {};
    },
    addJob() {
      //创建作业的条件： selectedApp时,必须有配置信息（isConfig），必须有模块(isHasModule)和环境(isHasEnv);
      // selectedModule时，当前应用层必须有配置信息(isConfig)，当前模块必须有环境(isHasEnv)
      let {isConfig, isHasModule, isHasEnv } = this.selectedApp;
      if (isConfig && isHasModule && isHasEnv) {
        let query = {};
        if (this.searchParam.appSystemId) {
          this.$set(query, 'appSystemId', this.searchParam.appSystemId);
        }
        if (this.searchParam.appModuleId) {
          this.$set(query, 'appModuleId', this.searchParam.appModuleId);
        }
        this.$router.push({
          path: '/job-add',
          query: query
        });
      } else {
        // this.showDialog = true;
      }
    },
    addBatchJob() {
      this.isAddBatchJobDialogShow = true;
    },
    closeBatchJob(needRefresh) {
      this.isAddBatchJobDialogShow = false;
      if (needRefresh) {
        this.searchJob(1);
      }
    },
    globalLockShow() {
      this.isShowResourceLockDialog = true;
    },
    globalLockClose() {
      this.isShowResourceLockDialog = false;
    },
    searchJob(currentPage) {
      this.clearTimmer();
      this.isLoading = true;
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      const param = { ...this.searchParam, ...this.searchValue };
      this.$addHistoryData('searchValue', this.searchValue);
      this.$addHistoryData('searchParam', this.searchParam);
      this.$api.deploy.job
        .searchJobList(param)
        .then(res => {
          this.jobData = res.Return;
          const idList = [];
          if (this.jobData.tbodyList && this.jobData.tbodyList.length > 0) {
            this.jobData.tbodyList.forEach(element => {
              if (element.source === 'batchdeploy' || element.source === 'deployschedulepipeline') {
                this.$set(element, '_expander', true);
                if (this.searchValue.keyword) { //keyword搜索时，匹配到的父作业也需要将子作业展开
                  this.toggleChildJob(element);
                }
              } else {
                this.$set(element, '_expander', false);
              }
              if (!this.jobEndStatusList.includes(element.status)) {
                idList.push(element.id);
              }
            });
            if (idList.length > 0) {
              this.timmer = setTimeout(() => {
                this.refresh(idList);
              }, 5000);
            }
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    refresh(idList) {
      this.clearTimmer();
      this.$api.deploy.job.searchJobList({ needPage: false, idList: idList }).then(res => {
        const jobList = res.Return.tbodyList;
        const newIdList = [];
        if (jobList && jobList.length > 0 && this.jobData.tbodyList && this.jobData.tbodyList.length > 0) {
          jobList.forEach(job => {
            const element = this.jobData.tbodyList.find(d => d.id === job.id);
            if (element) {
              this.$set(element, 'status', job.status);
              this.$set(element, 'statusName', job.statusName);
            }
          });
          this.jobData.tbodyList.forEach(job => {
            if (!this.jobEndStatusList.includes(job.status)) {
              newIdList.push(job.id);
            }
          });
          if (newIdList.length > 0) {
            this.timmer = setTimeout(() => {
              this.refresh(newIdList);
            }, 5000);
          }
        }
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchJob(1);
    },
    getSelectedApp(app) {
      //console.log(JSON.stringify(node, null, 2));
      //this.selectedTreeNodeConfig = node;
      // console.log(JSON.stringify(app, null, 2));
      this.selectedApp = app;
      this.authList = (app && app.authActionSet && app.authActionSet.length > 0) ? app.authActionSet : [];
      if (app) {
        this.handleAuthAndConfigInfo();
      }
      this.isHasResourceLock = app ? app.isHasResourceLock : false;//是否含有资源锁
    },
    getSelectedModule(module) {
      this.selectedModule = module;
    },
    getSelectedEnv(env) {
      this.selectedEnv = env;
    },
    async handleAuthAndConfigInfo() {
      // 处理权限和配置信息
      this.authType = '';
      const {isConfig, isHasModule} = this.selectedApp;
      const isHasEnv = this.selectedModule ? this.selectedModule.isHasEnv : this.selectedApp.isHasEnv;
      if (this.canEditAuth && !this.hasEnvAuth && (isConfig && isHasModule && !isHasEnv)) {
        await this.getModuleList(this.selectedApp);
        return false;
      }
    },
    newTab(e, row, redirectPage) {
      //鼠标右键打开新标签页
      let base = this.$router.options.base;
      let params = '';
      if (row && row.id) {
        params = `?id=${row.id}`;
      }
      let replaceStr = `<a href="${base}#${redirectPage}${params}" class="cursor">${row.name}</a>`;
      e.currentTarget.innerHTML = replaceStr;
    },
    toJobDetail(row) {
      this.$router.push({
        path: '/job-detail',
        query: { id: row.id }
      });
    },
    toBatchJobDetail(row) {
      this.$router.push({
        path: '/batch-job-detail',
        query: { id: row.id }
      });
    },
    toOperationDetail(row) {
      if (row.operationType == 'combop') {
        this.$router.push({
          path: 'action-detail?id=' + row.operationId
        });
      } else if (row.operationType == 'script') {
        this.$router.push({
          path: 'script-detail?versionId=' + row.operationId + '&status=' + row.status
        });
      }
    },
    close(needPage) {
      this.showDialog = false;
      if (needPage) {
        this.$refs.appModuleList.refreshApp(this.searchParam.appSystemId);
      }
    },
    addEnv(appModuleId) {
      this.envParam.appModuleId = appModuleId;
      this.isShowEnvEdit = true;
      this.close();
    },
    addModule() {
      this.isShowModuleEdit = true;
      this.close();
    },
    closeEdit(needRefresh, params, type) {
      this.isShowEnvEdit = false;
      this.isShowModuleEdit = false;
      if (needRefresh && type == 'env') {
        this.$refs.appModuleList.refreshApp(this.searchParam.appSystemId).then(() => {
          this.appModuleData = {
            appId: this.searchParam.appSystemId,
            moduleId: this.searchParam.appModuleId
          };
        });
      } else if (needRefresh && type == 'module') {
        this.$refs.appModuleList.refreshApp(this.searchParam.appSystemId).then(() => {
          this.appModuleData = {
            appId: this.searchParam.appSystemId,
            moduleId: this.searchParam.appModuleId
          };
        });
      }
    },
    async getModuleList(selectedApp) {
      await this.$api.deploy.applicationConfig.getAppModuleTreeList({ appSystemId: selectedApp.id }).then(res => {
        if (res && res.Status == 'OK') {
          this.moduleList = res.Return || [];
        }
      });
    }, updateSort(sort) {
      this.sortOrder = [];
      this.sortOrder.push(sort);
      this.$addHistoryData('sortOrder', this.sortOrder);
      for (let key in sort) {
        this.$set(this.searchParam, 'sortOrder', {'key': key, 'type': sort[key]});
      }
      this.searchJob();
    }
  },
  filter: {},
  computed: {
    getTreeHeight() {
      return () => {
        return window.innerHeight - 172;
      };
    },
    getConfig() {
      return row => {
        let config = {};
        config.status = row.status;
        row.status == 'running' ? (config.status = 'active') : row.status == 'error' ? (config.status = 'wrong') : '';
        return config;
      };
    },
    canEditAuth() {
      // 编辑配置权限
      if ((this.selectedApp && ((this.selectedApp.isHasAllAuthority) || (!this.selectedApp.isConfigAuthority))) || (this.authList.includes('operation#edit') || this.authList.includes('operation#all'))) {
        return true;
      }
      return false;
    },
    hasScenarioAuth() {
      // 场景权限
      if (this.authList.find((item) => item.includes('scenario#')) || this.authList.includes('scenario#all')) {
        return true;
      }
      return false;
    },
    hasEnvAuth() {
      // 环境权限
      if (this.authList.find((item) => item.includes('env#')) || this.authList.includes('env#all')) {
        return true;
      }
      return false;
    },
    hasConfigInfo() {
      // 配置信息，是否有模块，环境
      if ((!this.$utils.isEmpty(this.selectedModule) && this.selectedModule.isHasEnv) || (this.$utils.isEmpty(this.selectedModule) && this.selectedApp && this.selectedApp.isConfig && this.selectedApp.isHasModule && this.selectedApp.isHasEnv)) {
        return true;
      }
      return false;
    },
    canAddJob() {
      // 创建作业
      // 第一种情况：管理员权限+有模块和环境层
      // 第二种情况：编辑配置权限+环境权限+场景权限+有模块和环境层
      if (((this.authList.includes('operation#edit') || this.authList.includes('operation#all')) && this.hasEnvAuth && this.hasScenarioAuth && this.hasConfigInfo) || ((this.selectedApp && ((this.selectedApp.isHasAllAuthority) || (!this.selectedApp.isConfigAuthority))) && this.hasConfigInfo)) {
        return true;
      }
      return false;
    }
  },
  watch: {
    appModuleData: {
      handler(val) {
        const appSystemId = val && val.appId;
        const appModuleId = val && val.moduleId;
        if (appSystemId) {
          this.searchParam.appSystemId = appSystemId;
          this.envParam.appSystemId = appSystemId;
        } else {
          this.$delete(this.searchParam, 'appSystemId');
          this.$delete(this.envParam, 'appSystemId');
        }
        if (appModuleId) {
          this.searchParam.appModuleId = appModuleId;
          this.envParam.appModuleIdList = [appModuleId];
        } else {
          this.$delete(this.searchParam, 'appModuleId');
          this.$set(this.envParam, 'appModuleIdList', []);
        }
        this.searchJob(1);
        this.$addHistoryData('appModuleEnvData', val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.job-content {
  position: relative;
}
</style>
