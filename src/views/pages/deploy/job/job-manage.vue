<template>
  <div>
    <TsContain enableCollapse :siderWidth="220">
      <template v-slot:topLeft>
        <div class="action-group">
          <template v-if="canExecuteAuth">
            <template v-if="searchParam.appSystemId">
              <template v-if="canAddJob">
                <span class="tsfont-plus text-action action-item" @click="addJob">{{ $t('term.autoexec.job') }}</span>
              </template>
              <template v-else>
                <Tooltip
                  max-width="400"
                  placement="right"
                  transfer
                >
                  <span class="tsfont-plus text-disabled action-item">{{ $t('term.autoexec.job') }}</span>
                  <ul slot="content">
                    <li v-if="!selectedApp.isConfig"><span>{{ $t('term.deploy.currentapplynoconfig') }}</span>,<span v-if="canEditAuth" class="text-href" @click="toPipeline()">{{ $t('dialog.title.addtarget', {target: $t('page.config')}) }}</span><span v-else>{{ $t('page.deploy.contactwithadmin',{target: $t('dialog.title.addtarget', {target: $t('page.config')})}) }}</span></li>
                    <li v-else-if="!selectedApp.isHasModule"><span>{{ $t('term.deploy.applynoconfigmodule') }}</span>,<span v-if="canEditAuth" class="text-href" @click="addModule()">{{ $t('dialog.title.addtarget', {target: $t('page.module')}) }}</span><span v-else>{{ $t('page.deploy.contactwithadmin',{target: $t('dialog.title.addtarget', {target: $t('page.module')})}) }}</span></li>
                    <li v-else-if="selectedApp.isHasModule && !selectedApp.isHasEnv">
                      <div v-for="item in moduleList" :key="item.id" class="pb-sm">
                        <span>{{ selectedApp.abbrName }}/{{ item.abbrName }}{{ item.name?'['+item.name+']':'' }}{{ $t('term.deploy.noconfigenv') }}</span>,
                        <span v-if="canEditAuth" class="text-href" @click="addEnv(item.id)">{{ $t('dialog.title.addtarget', {target: $t('page.environment')}) }}</span>
                        <span v-else>{{ $t('page.deploy.contactwithadmin',{target: $t('dialog.title.addtarget', {target: $t('page.environment')})}) }}</span>
                      </div>
                    </li>
                    <li v-else-if="selectedModule && !selectedModule.isHasEnv">
                      <span>{{ selectedApp.abbrName }}/{{ selectedModule.abbrName }}{{ selectedModule.name?'['+selectedModule.name+']':'' }}{{ $t('term.deploy.noconfigenv') }}</span>,
                      <span v-if="canEditAuth" class="text-href" @click="addEnv(selectedModule.id)">{{ $t('dialog.title.addtarget', {target: $t('page.environment')}) }}</span>
                      <span v-else>{{ $t('page.deploy.contactwithadmin',{target: $t('dialog.title.addtarget', {target: $t('page.environment')})}) }}</span>
                    </li>
                    <li v-else-if="!hasScenarioAuth">
                      <div><span>{{ $t('term.deploy.noconfigscenauth') }}</span>,<span v-if="canEditAuth" class="text-href" @click="openAuthDialog">{{ $t('dialog.title.addtarget', {target: $t('page.auth')}) }}</span><span v-else>{{ $t('page.deploy.contactwithadmin',{target: $t('page.auth')}) }}</span></div>
                    </li>
                    <li v-else-if="!hasEnvAuth">
                      <div><span>{{ $t('term.deploy.noconfigenvauth') }}</span>,<span v-if="canEditAuth" class="text-href" @click="openAuthDialog">{{ $t('dialog.title.addtarget', {target: $t('page.auth')}) }}</span><span v-else>{{ $t('page.deploy.contactwithadmin',{target: $t('page.auth')}) }}</span></div>
                    </li>
                  </ul>
                </Tooltip>
              </template>
            </template>
            <Tooltip
              v-else
              :content="$t('term.deploy.pleaseselectmoduleenvaddjob')"
              max-width="400"
              placement="right"
              transfer
            >
              <span class="tsfont-plus text-disabled action-item">{{ $t('term.autoexec.job') }}</span>
            </Tooltip>
          </template>
          <template v-else>
            <Tooltip
              max-width="400"
              placement="right"
              transfer
            >
              <span class="tsfont-plus text-disabled action-item">{{ $t('term.autoexec.job') }}</span>
              <ul slot="content">
                <li v-if="!searchParam.appSystemId">{{ $t('term.deploy.pleaseselectmoduleenvaddjob') }}</li>
                <li v-else-if="!canEditAuth">{{ $t($t('page.deploynoexecuteconfigauthtip')) }}</li>
              </ul>
            </Tooltip>
          </template>
          <span class="tsfont-plus text-action action-item" @click="addBatchJob">{{ $t('term.deploy.batchjob') }}</span>
          <span v-if="isHasResourceLock" class="tsfont-lock text-action action-item" @click="globalLockShow">{{ $t('term.autoexec.resourcelock') }}</span>
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
          <DeployPipelineTable
            ref="tableData"
            :defaultSearchParam="searchParam"
            :defaultSearchValue="searchValue"
            :sortList="sortList"
            :sortOrder="sortOrder"
          ></DeployPipelineTable>
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
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    AppModuleList: () => import('../application-config/config/app/app-module-list.vue'),
    // SettingDialog:()=>import('./publishing/setting-dialog.vue'),
    AppEdit: () => import('@/views/pages/deploy/application-config/config/app/app-edit'), // 编辑权限
    ModuleEdit: () => import('@/views/pages/deploy/application-config/config/app/components/module-tree-edit'), // 编辑模块
    EnvEdit: () => import('@/views/pages/deploy/application-config/config/app/components/env-tree-edit'), // 编辑模块
    LockDialog: () => import('@/views/pages/deploy/job/resourcelock/resourcelock-dialog'), //资源锁
    AddBatchJobDialog: () => import('./add-batch-job-dialog.vue'),
    DeployPipelineTable: () => import('@/views/pages/deploy/job/publishing/deploy-pipeline-table.vue')
  },
  props: {},
  data() {
    return {
      searchParam: { hasParent: false, authorityActionList: ['view'], sortOrder: {key: 'planStartTime', type: 'DESC'} },
      sortList: ['planStartTime', 'startTime'],
      sortOrder: [{planStartTime: 'DESC'}],
      noConfigInfo: false, // 无配置信息，模块和环境
      moduleList: [],
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
            label: this.$t('page.environment'),
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
            label: this.$t('term.autoexec.executiontime'),
            format: 'yyyy-MM-dd',
            transfer: true,
            placeholder: this.$t('term.deploy.pleaseselecttimeperiod')
          },
          {
            type: 'userselect',
            name: 'execUserList',
            label: this.$t('term.deploy.executor'),
            groupList: ['user'],
            multiple: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'statusList',
            label: this.$t('page.jobstatus'),
            multiple: true,
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'JobStatus' },
            transfer: true
          }
        ]
      },
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
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {  
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
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$addHistoryData('searchValue', this.searchValue);
      this.$addHistoryData('searchParam', this.searchParam);
      if (this.$refs.tableData) {
        this.$refs.tableData.searchJob(currentPage, this.searchValue);
      }
    },
    getSelectedApp(app) {
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
      //if (this.canEditAuth && !this.hasEnvAuth && (isConfig && isHasModule && !isHasEnv)) {
        await this.getModuleList(this.selectedApp);
       // return false;
      // }
    },
    // toOperationDetail(row) {
    //   if (row.operationType == 'combop') {
    //     this.$router.push({
    //       path: 'action-detail?id=' + row.operationId
    //     });
    //   } else if (row.operationType == 'script') {
    //     this.$router.push({
    //       path: 'script-detail?versionId=' + row.operationId + '&status=' + row.status
    //     });
    //   }
    // },
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
    canExecuteAuth() {
      // 编辑执行权限
      if ((this.selectedApp && this.selectedApp.isHasAllAuthority) || (this.authList.includes('operation#edit') || this.authList.includes('operation#execute') || this.authList.includes('operation#all'))) {
        return true;
      }
      return false;
    },
    canEditAuth() {
      // 编辑配置权限
      if ((this.selectedApp && this.selectedApp.isHasAllAuthority) || (this.authList.includes('operation#edit') || this.authList.includes('operation#all'))) {
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
      // 前提是应用已配置流水线，再判断是否有模块或者环境
      if ((!this.$utils.isEmpty(this.selectedModule) && this.selectedModule.isHasEnv && this.selectedApp && this.selectedApp.isConfig) || (this.$utils.isEmpty(this.selectedModule) && this.selectedApp && this.selectedApp.isConfig && this.selectedApp.isHasModule && this.selectedApp.isHasEnv)) {
        return true;
      }
      return false;
    },
    canAddJob() {
      // 创建作业
      // 第一种情况：管理员权限+有模块和环境层
      // 第二种情况：编辑配置权限+环境权限+场景权限+有模块和环境层
      if (((this.authList.includes('operation#execute') || this.authList.includes('operation#edit') || this.authList.includes('operation#all')) && this.hasEnvAuth && this.hasScenarioAuth && this.hasConfigInfo) || ((this.selectedApp && this.selectedApp.isHasAllAuthority) && this.hasConfigInfo)) {
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
          this.$set(this.searchParam, 'appSystemId', appSystemId);
          this.envParam.appSystemId = appSystemId;
        } else {
          this.$delete(this.searchParam, 'appSystemId');
          this.$delete(this.envParam, 'appSystemId');
        }
        if (appModuleId) {
          this.$set(this.searchParam, 'appModuleId', appModuleId);
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
</style>
