<template>
  <div class="application-config-manage-box">
    <TsContain :siderWidth="220">
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="addAppTree">{{ $t('page.apply') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <!-- 应用层 -->
          <template v-if="configType == 'app' && canEdit">
            <span class="action-item tsfont-plus" @click="addModuleTree">{{ $t('page.module') }}</span>
            <span class="action-item tsfont-edit" @click="editAppTree">{{ $t('page.apply') }}</span>
            <span v-show="hasConfig" class="action-item tsfont-trash-o text-action" @click="clearConfig">{{ $t('page.clearconfig') }}</span>
          </template>

          <!-- 模块层 -->
          <template v-if="configType == 'module' && canEdit">
            <span class="action-item tsfont-plus" @click="addEnv">{{ $t('page.environment') }}</span>
            <span class="action-item tsfont-edit" @click="editModule">{{ $t('page.module') }}</span>
            <span v-show="hasConfig" class="action-item tsfont-trash-o text-action" @click="clearConfig">{{ $t('page.clearconfig') }}</span>
            <span v-show="hasConfig" class="action-item tsfont-copy text-action" @click="openCopyConfig">{{ $t('term.deploy.copyconfig') }}</span>
          </template>

          <!-- 环境层 -->
          <template v-if="configType == 'env' && canEdit">
            <span v-show="hasConfig" class="action-item tsfont-trash-o text-action" @click="clearConfig">{{ $t('page.clearconfig') }}</span>
            <span v-show="hasConfig && selectedEnv && selectedEnv.isDeletable" class="action-item tsfont-trash-o text-action" @click="delEnvConfig">{{ $t('term.deploy.deleteenv') }}</span>
            <span v-show="hasConfig" class="action-item tsfont-copy text-action" @click="openCopyConfig">{{ $t('term.deploy.copyconfig') }}</span>
          </template>
          <Button
            v-if="hasConfig"
            class="ml-nm"
            type="primary"
            @click="openPipelineEdit()"
          >{{ $t('term.autoexec.pipeline') }}</Button>
        </div>
      </template>
      <template v-slot:sider>
        <AppModuleList
          ref="appModuleList"
          v-model="appModuleData"
          level="env"
          alignType="tag"
          :allowInverse="false"
          :isShowFavorite="true"
          :filter="{authorityActionList: ['view']}"
          @getSelectedApp="getSelectedApp"
          @getSelectedModule="getSelectedModule"
          @getSelectedEnv="getSelectedEnv"
          @getAppSystemIdList="getAppSystemIdList"
        ></AppModuleList>
      </template>
      <template v-slot:content>
        <div class="app-content-box">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <div class="pl-nm right-content-box">
            <template v-if="hasConfig">
              <AppManage
                v-if="configType == 'app'"
                :appSystemId="appSystemId"
                :hasEditConfigAuth="canEdit"
                :authList="authList"
                :hasEditPipelineAuth="hasEditPipelineAuth"
                @updateAuth="updateAuth"
              ></AppManage>
              <ModuleManage v-if="configType == 'module'" :params="{appSystemId,appModuleId}" :hasEditConfigAuth="canEdit"></ModuleManage>
              <EnvManage
                v-if="configType == 'env'"
                :params="{appSystemId,appModuleId, envId}"
                :hasEditConfigAuth="canEdit"
                @close="closeEnvManage"
              ></EnvManage>
            </template>
            <template v-else-if="!hasConfig && !loadingShow">
              <div class="no-data-box">
                <NoData text=""></NoData>
                <div v-if="!isHasAppSystemIdList" class="flex-center pt-nm">
                  {{ $t('term.deploy.noapplytip') }}<span class="tsfont-plus text-href" @click="addAppTree">{{ $t('page.apply') }}</span>
                </div>
                <div v-else class="flex-center pt-nm">
                  {{ $t('term.deploy.applynotconfigselect') }}
                  <span class="text-href" @click="toPipeline">{{ $t('term.deploy.pipelinetemplate') }}</span>
                  {{ $t('term.framework.or') }}
                  <span class="text-href" @click="importPipelineConfig">{{ $t('term.deploy.importpipelineconfig') }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </TsContain>
    <CopyConfigModule v-if="isShowCopyConfigModule" :params="{appSystemId, appModuleId}" @close="closeCopyConfigModule"></CopyConfigModule>
    <CopyConfigEnv v-if="isShowCopyConfigEnv" :params="{appSystemId, appModuleId, envId}" @close="closeCopyConfigEnv"></CopyConfigEnv>
    <AppTreeEdit v-if="isShowAppEdit" :appSystemId="treeAppSystemId" @close="closeAppTreeEdit"></AppTreeEdit>
    <ModuleTreeEdit
      v-if="isShowModuleTreeEdit"
      :appSystemId="appSystemId"
      :appModuleId="treeAppModuleId"
      @close="closeModuleTreeEdit"
    ></ModuleTreeEdit>
    <EnvTreeEdit v-if="isShowEnvTreeEdit" :params="envParam" @close="closeEnvTreeEdit"></EnvTreeEdit>
    <ClearConfigDialog v-if="isShowClearConfigDialog" :clearConfigParams="{appSystemId, appModuleId, envId, configType}" @close="closeClearConfigDialog"></ClearConfigDialog>
    <ImportPipelineConfigDialog
      ref="importPipelineConfig"
      :appSystemId="appSystemId"
      @closeCoverDialog="closeImportPipelineConfig"
    ></ImportPipelineConfigDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ModuleManage: resolve => require(['./config/module-manage'], resolve),
    EnvManage: resolve => require(['./config/env-manage'], resolve),
    AppManage: resolve => require(['./config/app-manage'], resolve),
    AppModuleList: resolve => require(['../application-config/config/app/app-module-list.vue'], resolve),
    CopyConfigModule: resolve => require(['./config/module/copy-config-module'], resolve), // 复制配置（模块）
    CopyConfigEnv: resolve => require(['./config/env/copy-config-env'], resolve), // 复制配置（环境）
    AppTreeEdit: resolve => require(['./config/app/components/app-tree-edit'], resolve), // 编辑应用（应用配置树）
    ModuleTreeEdit: resolve => require(['./config/app/components/module-tree-edit'], resolve), // 编辑模块（应用配置树）
    EnvTreeEdit: resolve => require(['./config/app/components/env-tree-edit'], resolve), // 编辑模块（应用配置树）
    ClearConfigDialog: resolve => require(['./config/clear-config-dialog'], resolve), // 清空配置
    ImportPipelineConfigDialog: resolve => require(['pages/deploy/application-config/import-pipeline-config-dialog'], resolve) // 导入流水线配置
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      appModuleData: {},
      appSystemId: null, //应用id
      appModuleId: null, //模块id
      envId: null, //环境id
      selectedApp: null,
      selectedModule: null,
      selectedEnv: null,
      treeAppModuleId: null, // 添加编辑模块id
      treeAppSystemId: null, // 添加编辑应用id
      hasConfig: false, // 是否配置
      configType: '', // 配置类型，app应用，env环境，module模块
      isShowCopyConfigModule: false,
      isShowCopyConfigEnv: false,
      isShowEnvTreeEdit: false,
      isShowModuleTreeEdit: false,
      isShowAppEdit: false,
      isShowClearConfigDialog: false,
      envParam: {},
      authList: [], // 应用配置所有权限列表
      isHasAppSystemIdList: true //是否有应用列表
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (query && !this.$utils.isEmptyObj(query) && query.appSystemId) {
      let {appSystemId, appModuleId, envId} = query;
      this.appSystemId = appSystemId ? parseInt(appSystemId) : null;
      this.appModuleId = appModuleId ? parseInt(appModuleId) : null;
      this.envId = envId ? parseInt(envId) : null;
      this.appModuleData = {
        appId: this.appSystemId,
        moduleId: this.appModuleId,
        envId: this.envId
      };
      this.appModuleData.appId = parseInt(appSystemId);
    }
    if (query && !query.appSystemId && !query.isBack) {
      this.$addHistoryData('appModuleEnvData', {}); // 清空上一次内容
    }
    /*setTimeout(() => {
      this.$set(this.appModuleData, 'appId', 481894860644358);
      this.$set(this.appModuleData, 'moduleId', 481894994862218);
      this.$set(this.appModuleData, 'envId', 481856650534925);
    }, 1000);
    setTimeout(() => {
      const element = this.$refs['appModuleList'];
      element.refreshModule(481894994862218);
    }, 3000);*/
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
    getSelectedApp(app) {
      if (app) {
        const { authActionSet} = app;
        this.selectedApp = app;
        this.authList = authActionSet || [];
        this.hasConfig = !!app.isConfig;
        this.isHasAppSystemIdList = true;
      } else {
        this.hasConfig = false;
        this.isHasAppSystemIdList = false;
      }
    },
    getSelectedModule(module) {
      this.selectedModule = module;
    },
    getSelectedEnv(env) {
      this.selectedEnv = env;
    },
    openPipelineEdit() {
      let query = {
        appSystemId: this.appSystemId
      };
      if (this.appModuleId) {
        this.$set(query, 'appModuleId', this.appModuleId);
      }
      if (this.envId) {
        this.$set(query, 'envId', this.envId);
      }
      this.$set(query, 'hasEditAuth', this.canEdit); // 编辑配置权限
      this.$router.push({
        path: '/application-config-pipeline-detail',
        query: query
      });
    },
    toPipeline() {
      if (this.configType == 'app') {
        this.$router.push({
          path: '/application-config-pipeline',
          query: {
            appSystemId: this.appSystemId
          }
        });
      } else if (this.configType == 'module') {
        this.$router.push({
          path: '/application-config-pipeline',
          query: {
            appSystemId: this.appSystemId,
            appModuleId: this.appModuleId
          }
        });
      } else if (this.configType == 'env') {
        this.$router.push({
          path: '/application-config-pipeline',
          query: {
            appSystemId: this.appSystemId,
            appModuleId: this.appModuleId,
            envId: this.envId
          }
        });
      }
    },
    openCopyConfig() {
      if (this.configType == 'module') {
        this.isShowCopyConfigModule = true;
      } else if (this.configType == 'env') {
        this.isShowCopyConfigEnv = true;
      }
    },
    closeCopyConfigEnv(needRefresh, envId = null) {
      this.isShowCopyConfigEnv = false;
      if (needRefresh && envId) {
        this.$refs.appModuleList.refreshModule(this.appModuleId).then(() => {
          // 解决异步回调，环境层没有勾选问题
          this.appModuleData = {
            appId: this.appSystemId,
            moduleId: this.appModuleId,
            envId: parseInt(envId)
          };
        });
      }
    },
    closeCopyConfigModule(needRefresh, appModuleId = null) {
      // 关闭复制模块
      this.isShowCopyConfigModule = false;
      if (needRefresh && appModuleId) {
        this.$refs.appModuleList.refreshApp(this.appSystemId).then(() => {
          this.appModuleData = {
            appId: this.appSystemId,
            moduleId: parseInt(appModuleId)
          };
        });
      }
    },
    clearConfig() {
      // 清空配置
      this.isShowClearConfigDialog = true;
    },
    addEnv() {
      // 添加环境
      this.envParam = {};
      if (this.appSystemId && this.appModuleId) {
        this.isShowEnvTreeEdit = true;
        this.envParam = {
          appSystemId: this.appSystemId,
          appModuleId: this.appModuleId
        };
      }
    },
    closeEnvTreeEdit(needRefresh, envId) {
      // 关闭环境弹窗
      this.isShowEnvTreeEdit = false;
      if (needRefresh && envId) {
        this.$refs.appModuleList.refreshModule(this.appModuleId).then(() => {
          // 解决异步回调，环境层没有勾选问题
          this.appModuleData = {
            appId: this.appSystemId,
            moduleId: this.appModuleId,
            envId: parseInt(envId)
          };
        });
      }
    },
    closeModuleTreeEdit(needRefresh, appModuleId) {
      // 关闭模块
      this.isShowModuleTreeEdit = false;
      if (needRefresh && appModuleId) {
        this.$refs.appModuleList.refreshApp(this.appSystemId).then(() => {
          // 解决异步回调，模块没有勾选上问题
          this.appModuleData = {
            appId: this.appSystemId,
            moduleId: parseInt(appModuleId)
          };
        });
      }
    },
    addModuleTree() {
      // 添加模块
      this.treeAppModuleId = null;
      this.isEditModule = false;
      this.isShowModuleTreeEdit = true;
    },
    editModule() {
      // 编辑模块
      this.treeAppModuleId = this.appModuleId;
      this.isShowModuleTreeEdit = true;
    },
    editAppTree() {
      // 编辑应用
      this.treeAppSystemId = this.appSystemId;
      this.isShowAppEdit = true;
    },
    addAppTree() {
      // 添加应用
      this.treeAppSystemId = null;
      this.isShowAppEdit = true;
    },
    closeAppTreeEdit(needRefresh, appSystemId) {
      // 关闭应用
      this.isShowAppEdit = false;
      if (needRefresh && appSystemId) {
        let appId = parseInt(appSystemId);
        this.$refs.appModuleList.refreshApp(appId || this.appSystemId);
        this.appModuleData = {
          appId: appId || this.appSystemId
        };
      }
    },
    closeClearConfigDialog(needRefresh, configType) {
      // 清空配置
      this.isShowClearConfigDialog = false;
      if (needRefresh) {
        if (configType == 'app') {
          this.$refs.appModuleList.refreshApp(this.appSystemId);
        } else if (configType == 'module' || configType == 'env') {
          this.$refs.appModuleList.refreshModule(this.appModuleId);
        }
      }
    },
    delEnvConfig() {
      // 删除环境（应用配置新加的环境才可以删除）
      let {id, isDeletable} = this.selectedEnv;
      if (id && isDeletable) {
        let params = {
          appSystemId: this.appSystemId,
          appModuleId: this.appModuleId,
          envId: id
        };
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: this.getDelEnvPath()}),
          btnList: [//底部操作区域的按钮数组
            { 
              text: this.$t('page.cancel'),  
              ghost: true, 
              fn: vnode => { vnode.isShow = false; }
            },
            {
              text: this.$t('page.delete'), 
              type: 'error', 
              fn: vnode => {
                vnode.isShow = false; 
                this.$api.deploy.applicationConfig.delEnv(params).then(res => {
                  if (res && res.Status == 'OK') {
                    this.$Message.success(this.$t('message.deletesuccess'));
                    this.$refs.appModuleList.refreshModule(this.appModuleId);
                    this.appModuleData = {
                      appId: this.appSystemId,
                      moduleId: this.appModuleId
                    };
                  }
                });
              }
            }
          ]
        });
      }
    },
    getDelEnvPath() {
      // 获取删除环境，应用层和模块层简称/名称
      let path = '';
      if (this.selectedApp) {
        const {abbrName, name} = this.selectedApp;
        path = abbrName ? name ? `${abbrName}[${name}]` : abbrName : '';
      }
      if (this.selectedModule) {
        const {abbrName, name} = this.selectedModule;
        path = abbrName ? name ? `${path}/${abbrName}[${name}]` : `${path}/${abbrName}` : '';
      }
      if (this.selectedEnv) {
        const {name} = this.selectedEnv;
        path = name ? `${path}/${name}` : '';
      }
      return path;
    },
    closeEnvManage(needRefresh) {
      if (needRefresh) {
        // 编辑权限之后，需要刷新列表
        this.$refs.appModuleList.refreshApp(this.appSystemId).then(() => {
          this.appModuleData = {
            appId: this.appSystemId,
            moduleId: this.appModuleId,
            envId: this.envId
          };
        });
      }
    },
    updateAuth() { //更新应用权限
      this.$api.deploy.applicationConfig.searchAppSystemList({ appSystemIdList: [this.appSystemId], authorityActionList: ['view']}).then(res => {
        if (res.Return && res.Return.tbodyList.length && res.Return.tbodyList[0]) {
          this.selectedApp = res.Return.tbodyList[0];
          this.authList = res.Return.tbodyList[0].authActionSet || [];
        }
      });
    },
    getAppSystemIdList(list) { //等待左侧应用列表接口回调完
      if (this.$utils.isEmpty(this.selectedApp) || !list.length) {
        this.isHasAppSystemIdList = false;
      } else if (list && list.length) {
        this.isHasAppSystemIdList = true;
      }
      this.loadingShow = false;
    },
    restoreHistory(historyData) {
      this.appModuleData = historyData['appModuleEnvData'] || {};
    },
    importPipelineConfig() {
      // 导入流水线配置
      this.$refs.importPipelineConfig?.showDialog();
    },
    closeImportPipelineConfig(needRefresh) {
      if (needRefresh) {
        this.$refs?.appModuleList?.refreshApp(this.appSystemId);
      }
    } 
  },
  filter: {},
  computed: {
    canEdit() {
      // 是否有“编辑配置”权限，isHasAllAuthority 表示自动发布管理员权限
      if (this.authList.includes('operation#all') || this.authList.includes('operation#edit') || (this.selectedApp && this.selectedApp.isHasAllAuthority)) {
        return true;
      }
      return false;
    },
    hasEditPipelineAuth() { //是否有超级流水线权限
      if (this.authList.includes('operation#all') || this.authList.includes('operation#pipeline') || (this.selectedApp && this.selectedApp.isHasAllAuthority)) {
        return true;
      }
      return false;
    }
    
  },
  watch: {
    appModuleData: {
      handler: function(val) {
        this.configType = '';
        this.$nextTick(() => {
          this.$addHistoryData('appModuleEnvData', val);
          this.appSystemId = val && val.appId;
          this.appModuleId = val && val.moduleId;
          this.envId = val && val.envId;
          this.configType = this.envId ? 'env' : (this.appModuleId ? 'module' : (this.appSystemId ? 'app' : ''));
        });
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.application-config-manage-box {
  .app-content-box {
    display: flex;
    .right-content-box {
      width: 100%;
    }
  }
  .no-data-box {
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
  }
}
</style>
