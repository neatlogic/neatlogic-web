<template>
  <div>
    <TsContain :siderWidth="220">
      <template v-slot:topLeft>
        <div class="action-group">
          <span
            v-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY')"
            class="action-item tsfont-plus"
            @click="addApp()"
          >{{ $t('page.apply') }}</span>
          <span
            v-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY')"
            class="action-item tsfont-plus"
            @click="addAppModule()"
          >{{ $t('page.module') }}</span>
          <span
            v-if="$AuthUtils.hasRole('INSPECT_SCHEDULE_EXECUTE')"
            class="action-item tsfont-sla"
            @click="openInspectionScheduleDialog()"
          >{{ $t('term.inspect.scheduleinspect') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div v-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY') && (selectedApp && !selectedModule)" class="action-group">
          <span
            class="action-item tsfont-edit"
            @click="editApp()"
          >{{ $t('dialog.title.edittarget', {target: $t('page.apply')}) }}</span>
          <span
            class="action-item tsfont-trash-o"
            @click="deleteApp()"
          >{{ $t('dialog.title.deletetarget', {target: $t('page.apply')}) }}</span>
          <span
            class="action-item tsfont-setting"
            @click="toRoleOfThreshold()"
          >{{ $t('term.inspect.thresholdrule') }}</span>
          <div class="action-item">
            <Button
              v-auth="'INSPECT_EXECUTE'"
              type="primary"
              class="ml-sm mr-sm"
              @click="openSystemInspection"
            >{{ $t('term.inspect.inspect') }}</Button>
          </div>
        </div>
        <div v-else-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="action-group">
          <span
            class="action-item tsfont-edit"
            @click="editAppModule()"
          >{{ $t('dialog.title.edittarget', {target: $t('page.module')}) }}</span>
          <span
            class="action-item tsfont-trash-o"
            @click="deleteAppModule()"
          >{{ $t('dialog.title.deletetarget', {target: $t('page.module')}) }}</span>
          <Button
            v-auth="'INSPECT_EXECUTE'"
            type="primary"
            class="ml-sm mr-sm"
            @click="openModuleInspectionDialog"
          >{{ $t('term.inspect.inspect') }}</Button>
        </div>
      </template>
      <template v-slot:sider>
        <AppModuleTree
          ref="appModuleTree"
          v-model="appModueData"
          :allowInverse="false"
          @getSelectedApp="getSelectedApp"
          @getSelectedModule="getSelectedModule"
        ></AppModuleTree>
      </template>
      <template v-slot:content>
        <Tabs
          v-model="tabValue"
          :animated="false"
          class="block-tabs"
          @on-click="tabClick"
        >
          <TabPane :label="$t('term.inspect.newproblem')" name="LatestQuestions">
            <LatestQuestionsManage
              v-if="tabValue == 'LatestQuestions'"
              class="tab-height-box"
              :appSystemId="appCiEntityId"
              :appModuleId="appModuleId"
            ></LatestQuestionsManage>
          </TabPane>
          <TabPane :label="$t('term.inspect.assetlist')" name="assetsList">
            <InspectionAssetsManage
              v-if="tabValue == 'assetsList'"
              class="tab-height-box"
              :appSystemId="appCiEntityId"
              :appModuleId="appModuleId"
              moduleName="inspect"
            ></InspectionAssetsManage>
          </TabPane>
          <TabPane v-if="selectedApp && !selectedModule" :label="$t('term.deploy.applicationinformation')" name="applicationInfo">
            <AppInfo v-if="tabValue == 'applicationInfo'" :appSystemId="appCiEntityId"></AppInfo>
          </TabPane>
          <TabPane v-else :label="$t('term.deploy.moduleinformation')" name="moduleInfo">
            <ModuleInfo
              v-if="tabValue == 'moduleInfo'"
              :isShowTitle="false"
              :appSystemId="appCiEntityId"
              :appModuleId="appModuleId"
            ></ModuleInfo>
          </TabPane>
        </Tabs>
      </template>
    </TsContain>
    <AppEditDialog
      v-if="isEditAppDialogShow"
      :ciEntityId="appCiEntityId"
      :ciId="appCiId"
      @close="closeAppEditDialog"
    ></AppEditDialog>
    <AppModuleEditDialog
      v-if="isEditAppModuleDialogShow"
      :ciEntityId="appModuleCiEntityId"
      :ciId="appModuleCiId"
      :ciEntityData="ciEntityData"
      @close="closeAppModuleEditDialog"
    ></AppModuleEditDialog>
    <DeleteCiEntityDialog
      v-if="isDeleteDialogShow"
      :allowDelete="true"
      :allowCommit="true"
      :ciEntityId="deleteCiEntityId"
      @close="closeDeleteDialog"
    ></DeleteCiEntityDialog>
    <InspectionScheduleDialog v-if="isShowInspectionScheduleDialog" :id="scheduleId" @close="isShowInspectionScheduleDialog = false"></InspectionScheduleDialog>
    <BatchSystemInspectionDialog
      v-if="isShowBatchInspectionDialog"
      :inspectionData="selectedApp"
      @close="isShowBatchInspectionDialog = false"
    ></BatchSystemInspectionDialog>
    <BatchModuleInspectionDialog
      v-if="isShowBatchModuleInspectionDialog"
      :inspectionData="selectedModule"
      :appSystemId="appCiEntityId"
      @close="isShowBatchModuleInspectionDialog = false"
    ></BatchModuleInspectionDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppInfo: () => import('@/views/pages/deploy/application-config/config/app/app-info.vue'),
    ModuleInfo: () => import('@/views/pages/deploy/application-config/config/module/module-info'),
    AppEditDialog: () => import('@/views/pages/cmdb/application/app-edit-dialog.vue'),
    AppModuleEditDialog: () => import('@/views/pages/cmdb/application/appmodule-edit-dialog.vue'),
    DeleteCiEntityDialog: () => import('@/views/pages/cmdb/cientity/cientity-delete-dialog.vue'),
    InspectionScheduleDialog: () => import('./inspection-schedule-dialog.vue'),
    InspectionAssetsManage: () => import('@/views/pages/inspect/application/inspection-assets-manage'), // 资产清单
    AppModuleTree: () => import('@/views/pages/cmdb/application/app-module-tree'), // 应用模块树
    LatestQuestionsManage: () => import('./latest-questions-manage'), // 最新问题
    BatchSystemInspectionDialog: () => import('./batch-system-inspection-dialog'), // 批量应用巡检
    BatchModuleInspectionDialog: () => import('./batch-module-inspection-dialog') // 批量模块巡检
  },
  props: {},
  data() {
    return {
      tabValue: '',
      isApp: true,
      isEditAppDialogShow: false,
      isEditAppModuleDialogShow: false,
      isDeleteDialogShow: false,
      isShowBatchInspectionDialog: false,
      isShowBatchModuleInspectionDialog: false,
      appCiEntityId: null,
      appCiId: null,
      appModuleCiId: null,
      appModuleId: null,
      deleteCiEntityId: null,
      selectedApp: null,
      selectedModule: null,
      appModueData: {},
      ciEntityData: {},
      isShowInspectionScheduleDialog: false,
      scheduleId: null
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.scheduleId) {
      this.scheduleId = Number(this.$route.query.scheduleId);
    }
    if (this.$route.query.isShowInspectionScheduleDialog) {
      this.isShowInspectionScheduleDialog = this.$route.query.isShowInspectionScheduleDialog;
    }
    this.getResourceEntity();
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
    openSystemInspection() {
      this.isShowBatchInspectionDialog = true;
    },
    openModuleInspectionDialog() {
      this.isShowBatchModuleInspectionDialog = true;
    },
    tabClick() {
      this.$addHistoryData('tabValue', this.tabValue);
    },
    restoreHistory(historyData) {
      this.tabValue = historyData['tabValue'];
    },
    getSelectedApp(app) {
      this.selectedApp = app;
      this.appCiEntityId = app ? app.id : null;
      this.tabValue = (this.tabValue && this.tabValue == 'moduleInfo' ? 'LatestQuestions' : this.tabValue) || 'LatestQuestions'; // 选中模块信息，但是切换到应用层，tab需要默认选中第一个
    },
    getSelectedModule(module) {
      this.selectedModule = module;
      this.appModuleId = module ? module.id : null;
      this.tabValue = (this.tabValue && this.tabValue == 'applicationInfo' ? 'LatestQuestions' : this.tabValue) || 'LatestQuestions'; // 选中应用信息，但是切换到模块层，tab需要默认选中第一个
    },
    addApp() {
      this.appCiEntityId = null;
      this.isEditAppDialogShow = true;
    },
    editApp() {
      this.appCiEntityId = this.selectedApp ? this.selectedApp.id : null;
      this.isEditAppDialogShow = true;
    },
    editAppModule() {
      this.appModuleCiEntityId = this.appModuleId;
      this.isEditAppModuleDialogShow = true;
    },
    async addAppModule() {
      await this.getRelEntityData();
      this.appModuleCiEntityId = null;
      this.isEditAppModuleDialogShow = true;
    },
    deleteApp() {
      this.deleteCiEntityId = this.appCiEntityId;
      this.isDeleteDialogShow = true;
    },
    deleteAppModule() {
      this.deleteCiEntityId = this.appModuleId;
      this.isDeleteDialogShow = true;
    },
    closeAppEditDialog(needRefresh, uuid) {
      this.isEditAppDialogShow = false;
      if (needRefresh && uuid) {
        // 添加应用成功，刷新树列表
        this.$refs.appModuleTree.refreshApp(uuid);
      }
    },
    closeAppModuleEditDialog(needRefresh, uuid) {
      this.isEditAppModuleDialogShow = false;
      if (needRefresh && uuid) {
        // 添加编辑模块成功，刷新树列表
        this.$refs.appModuleTree.refreshModule(uuid, this.appCiEntityId);
      }
    },
    closeDeleteDialog(needRefresh) {
      this.isDeleteDialogShow = false;
      if (needRefresh) {
        // 删除应用成功，刷新树列表
        this.appModueData = {
          appId: this.appCiEntityId // 删除成功后，默认选中当前应用层
        };
        this.$refs.appModuleTree.searchAppSystem();
      }
    },
    getResourceEntity() {
      this.$api.cmdb.applicationManage.getResourceEntityByName('scence_appsystem').then(res => {
        if (res.Return && res.Return.ciId) {
          this.appCiId = res.Return.ciId;
        }
      });
      this.$api.cmdb.applicationManage.getResourceEntityByName('scence_appmodule').then(res => {
        if (res.Return && res.Return.ciId) {
          this.appModuleCiId = res.Return.ciId;
        }
      });
    },
    async getRelEntityData() {
      // 设置添加模块时，默认选中当前应用
      this.ciEntityData = {};
      if (this.appModuleCiId) {
        let relList = [];
        let relEntityData = {};
        await this.$api.cmdb.ci.getRelByCiId(this.appModuleCiId, {needAction: false, showType: 'all'}).then(res => {
          relList = res.Return || [];
          relList.forEach(element => {
            if ((element.direction === 'from' && element.fromCiId == this.appModuleCiId && element.toCiId == this.appCiId) ||
            (element.direction === 'to' && element.toCiId == this.appModuleCiId && element.fromCiId == this.appCiId)) {
              relEntityData[`rel${element.direction}_${element.id}`] = {
                'valueList': [
                  {
                    'ciEntityName': this.selectedApp.name, // 应用层的name
                    'ciEntityId': this.selectedApp.id, // 应用的id
                    'ciId': this.appModuleCiId
                  }
                ]
              };
            }
          });
          this.ciEntityData = {uuid: this.$utils.setUuid(), relEntityData: relEntityData};
        });
      }
    },
    openInspectionScheduleDialog() {
      this.isShowInspectionScheduleDialog = true;
    },
    toRoleOfThreshold() {
      // 阈值规则
      this.$router.push({
        path: './rule-of-threshold-manage',
        query: {appSystemId: this.appCiEntityId}
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.tab-height-box {
  height: calc(100vh - 100px - 50px); // 100 通栏的表头+导航栏， 50是（tab(高度)+16(底部的间距)
  overflow-y: auto;
}
</style>
