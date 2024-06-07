<template>
  <div>
    <TsContain :siderWidth="220">
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="action-item tsfont-plus" @click="addApp()">{{ $t('page.apply') }}</span>
          <span v-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="action-item tsfont-plus" @click="addAppModule()">{{ $t('page.module') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div v-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY') && selectedApp && !selectedModule" class="action-group">
          <span class="action-item tsfont-edit" @click="editApp()">{{ $t('page.apply') }}</span>
          <span class="action-item tsfont-trash-o" @click="deleteApp()">{{ $t('page.apply') }}</span>
        </div>
        <div v-else-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="action-group">
          <span class="action-item tsfont-edit" @click="editAppModule()">{{ $t('page.module') }}</span>
          <span class="action-item tsfont-trash-o" @click="deleteAppModule()">{{ $t('page.module') }}</span>
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
        <Tabs v-model="tabValue" :animated="false" class="block-tabs">
          <TabPane :label="$t('term.inspect.assetlist')" name="assetsList">
            <AssetsManage
              v-if="tabValue == 'assetsList'"
              class="assets-manage-box"
              :appSystemId="appSystemId"
              :appModuleId="appModuleId"
            ></AssetsManage>
          </TabPane>
          <TabPane v-if="selectedApp && !selectedModule" :label="$t('term.deploy.applicationinformation')" name="applicationInfo">
            <AppInfo v-if="tabValue == 'applicationInfo'" :appSystemId="appSystemId"></AppInfo>
          </TabPane>
          <TabPane v-else :label="$t('term.deploy.moduleinformation')" name="moduleInfo">
            <ModuleInfo
              v-if="tabValue == 'moduleInfo'"
              :isShowTitle="false"
              :appSystemId="appSystemId"
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
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppInfo: () => import('@/views/pages/deploy/application-config/config/app/app-info.vue'),
    ModuleInfo: () => import('@/views/pages/deploy/application-config/config/module/module-info'),
    AppEditDialog: () => import('./app-edit-dialog.vue'),
    AppModuleEditDialog: () => import('./appmodule-edit-dialog.vue'),
    DeleteCiEntityDialog: () => import('../cientity/cientity-delete-dialog.vue'),
    AssetsManage: () => import('./assets-manage'), // 资产清单
    AppModuleTree: () => import('./app-module-tree') // 应用模块树
  },
  props: {},
  data() {
    return {
      tabValue: '',
      isApp: true,
      isEditAppDialogShow: false,
      isEditAppModuleDialogShow: false,
      isDeleteDialogShow: false,
      appCiEntityId: null,
      appCiId: null,
      appSystemId: null, // 系统id
      appModuleCiId: null,
      appModuleId: null,
      deleteCiEntityId: null,
      selectedApp: null,
      selectedModule: null,
      appModueData: {},
      ciEntityData: {} // 添加模块时，用于锁定应用
    };
  },
  beforeCreate() {},
  created() {
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
    getSelectedApp(app) {
      this.selectedApp = app;
      this.appCiEntityId = app ? app.id : null;
      this.appSystemId = app ? app.id : null;
      this.tabValue = 'assetsList';
    },
    getSelectedModule(module) {
      this.selectedModule = module;
      this.appModuleId = module ? module.id : null;
      this.tabValue = 'assetsList';
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
      this.ciEntityData = {};
      this.appModuleCiEntityId = this.appModuleId;
      this.isEditAppModuleDialogShow = true;
    },
    async addAppModule() {
      await this.getRelEntityData();
      this.appModuleCiEntityId = null;
      this.isEditAppModuleDialogShow = true;
    },
    deleteApp() {
      this.deleteCiEntityId = this.appSystemId;
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
        this.$refs.appModuleTree.refreshModule(uuid, this.appSystemId);
      }
    },
    closeDeleteDialog(needRefresh) {
      this.isDeleteDialogShow = false;
      if (needRefresh) {
        if (this.appModuleId) {
          // 删除模块后，刷新树列表
          this.$refs.appModuleTree.refreshAppByDelModule(this.appSystemId);
        } else if (this.appSystemId) {
          // 删除应用成功，刷新树列表
          this.$refs.appModuleTree.searchAppSystem();
        }
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
        await this.$api.cmdb.ci
          .getRelByCiId(this.appModuleCiId, {
            needAction: false,
            showType: 'all'
          })
          .then(res => {
            relList = res.Return || [];
            relList.forEach(element => {
              if ((element.direction === 'from' && element.fromCiId == this.appModuleCiId && element.toCiId == this.appCiId) || (element.direction === 'to' && element.toCiId == this.appModuleCiId && element.fromCiId == this.appCiId)) {
                relEntityData[`rel${element.direction}_${element.id}`] = {
                  valueList: [
                    {
                      ciEntityName: this.selectedApp.name, // 应用层的name
                      ciEntityId: this.selectedApp.id, // 应用的id
                      ciId: this.appModuleCiId
                    }
                  ]
                };
              }
            });
            this.ciEntityData = { uuid: this.$utils.setUuid(), relEntityData: relEntityData };
          });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.assets-manage-box {
  height: calc(100vh - 100px - 50px); // 100 通栏的表头+导航栏， 50是（tab(高度)+16(底部的间距)
  overflow-y: auto;
}
</style>
