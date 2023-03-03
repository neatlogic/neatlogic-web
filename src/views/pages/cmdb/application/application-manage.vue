<template>
  <div>
    <TsContain :siderWidth="220">
      <template v-slot:topLeft>
        <div class="action-group">
          <span
            v-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY')"
            class="action-item tsfont-plus"
            @click="addApp()"
          >应用</span>
          <span
            v-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY')"
            class="action-item tsfont-plus"
            @click="addAppModule()"
          >模块</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div v-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY') && (selectedApp && !selectedModule)" class="action-group">
          <span
            class="action-item tsfont-edit"
            @click="editApp()"
          >编辑应用</span>
          <span
            class="action-item tsfont-trash-o"
            @click="deleteApp()"
          >删除应用</span>
        </div>
        <div v-else-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="action-group">
          <span
            class="action-item tsfont-edit"
            @click="editAppModule()"
          >编辑模块</span>
          <span
            class="action-item tsfont-trash-o"
            @click="deleteAppModule()"
          >删除模块</span>
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
        >
          <TabPane label="资产清单" name="assetsList">
            <AssetsManage
              v-if="tabValue == 'assetsList'"
              class="assets-manage-box"
              :appSystemId="appCiEntityId"
              :appModuleId="appModuleId"
            ></AssetsManage>
          </TabPane>
          <TabPane v-if="selectedApp && !selectedModule" label="应用信息" name="applicationInfo">
            <AppInfo v-if="tabValue == 'applicationInfo'" :appSystemId="appCiEntityId"></AppInfo>
          </TabPane>
          <TabPane v-else label="模块信息" name="moduleInfo">
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
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppInfo: resolve => require(['@/views/pages/deploy/application-config/config/app/app-info.vue'], resolve),
    ModuleInfo: resolve => require(['@/views/pages/deploy/application-config/config/module/module-info'], resolve),
    AppEditDialog: resolve => require(['./app-edit-dialog.vue'], resolve),
    AppModuleEditDialog: resolve => require(['./appmodule-edit-dialog.vue'], resolve),
    DeleteCiEntityDialog: resolve => require(['../cientity/cientity-delete-dialog.vue'], resolve),
    AssetsManage: resolve => require(['./assets-manage'], resolve), // 资产清单
    AppModuleTree: resolve => require(['./app-module-tree'], resolve) // 应用模块树
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
        if (this.appModuleId) {
          // 删除模块后，刷新树列表
          this.$refs.appModuleTree.refreshAppByDelModule(this.appCiEntityId);
        } else if (this.appCiEntityId) {
          // 删除应用成功，刷新树列表
          this.$refs.appModuleTree.searchAppSystem(); 
        }
      }
    },
    getResourceEntity() {
      this.$api.cmdb.applicationManage.getResourceEntityByName('resource_appsystem').then(res => {
        if (res.Return && res.Return.ciId) {
          this.appCiId = res.Return.ciId;
        }
      });
      this.$api.cmdb.applicationManage.getResourceEntityByName('resource_appmodule').then(res => {
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
        await this.$api.cmdb.ci.getRelByCiId(this.appModuleCiId, false, 'all', null).then(res => {
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
