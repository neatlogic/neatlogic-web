<template>
  <div>
    <TsContain
      ref="contain"
      :siderWidth="220"
      :isSiderHide="viewMode === 'matrix'"
      @scroll="rememberScroll"
    >
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="action-item tsfont-plus" @click="addApp()">{{ $t('page.apply') }}</span>
          <span v-if="$AuthUtils.hasRole('RESOURCECENTER_MODIFY')" class="action-item tsfont-plus" @click="addAppModule()">{{ $t('page.module') }}</span>
          <span class="action-item tsfont-plus" @click="addSettingDialog()">{{ $t('page.setting') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <TsFormRadio
              :value="viewMode"
              :dataList="viewModeList"
              radioType="button"
              @change="changeViewMode"
            >
              <template v-slot:label="{ node }">
                <Tooltip
                  :content="node.tooltip"
                  :max-width="300"
                  placement="bottom"
                  transfer
                >
                  <i :class="node.icon" :aria-label="node.text"></i>
                </Tooltip>
              </template>
            </TsFormRadio>
          </div>
          <template v-if="viewMode === 'list' && $AuthUtils.hasRole('RESOURCECENTER_MODIFY') && selectedApp && !selectedModule">
            <span class="action-item tsfont-edit" @click="editApp()">{{ $t('page.apply') }}</span>
            <span class="action-item tsfont-trash-o" @click="deleteApp()">{{ $t('page.apply') }}</span>
          </template>
          <template v-else-if="viewMode === 'list' && $AuthUtils.hasRole('RESOURCECENTER_MODIFY') && selectedModule">
            <span class="action-item tsfont-edit" @click="editAppModule()">{{ $t('page.module') }}</span>
            <span class="action-item tsfont-trash-o" @click="deleteAppModule()">{{ $t('page.module') }}</span>
          </template>
          <span v-if="viewMode === 'matrix'" class="action-item">
            <CombineSearcher
              v-model="matrixSearchValue"
              :width="480"
              :placeholder="$t('term.cmdb.applicationmatrix.searchplaceholder')"
              :keywordText="$t('term.cmdb.applicationmatrix.application')"
              @change="searchMatrix"
            ></CombineSearcher>
          </span>
        </div>
      </template>
      <template v-slot:sider>
        <AppModuleTree
          ref="appModuleTree"
          :value="appModueData"
          :allowInverse="false"
          :moduleName="moduleName"
          @input="updateTreeSelection"
          @getSelectedApp="getSelectedApp"
          @getSelectedModule="getSelectedModule"
        ></AppModuleTree>
      </template>
      <template v-slot:content>
        <ApplicationMatrix
          v-if="matrixInitialized"
          v-show="viewMode === 'matrix'"
          ref="applicationMatrix"
          :moduleName="moduleName"
          :historyState="matrixHistoryState"
          :keyword="matrixSearchValue.keyword || ''"
          @open="openMatrixDetail"
          @ready="restoreMatrixScroll"
        ></ApplicationMatrix>
        <ApplicationDetail
          v-if="viewMode === 'list'"
          ref="listDetail"
          :app="selectedApp"
          :module="selectedModule"
        ></ApplicationDetail>
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
    <CiAttrSettingDialog v-if="isSettingDialogShow" :moduleName="moduleName" @close="closeSettingDialog"></CiAttrSettingDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio.vue'),
    ApplicationMatrix: () => import('./application-matrix.vue'),
    ApplicationDetail: () => import('./application-detail.vue'),
    AppEditDialog: () => import('./app-edit-dialog.vue'),
    AppModuleEditDialog: () => import('./appmodule-edit-dialog.vue'),
    DeleteCiEntityDialog: () => import('../cientity/cientity-delete-dialog.vue'),
    AppModuleTree: () => import('./app-module-tree'), // 应用模块树
    CiAttrSettingDialog: () => import('./ci-attr-setting-dialog.vue.vue')
  },
  props: {},
  data() {
    return {
      viewMode: 'list',
      viewModeList: [
        { value: 'matrix', text: this.$t('term.cmdb.applicationmatrix.matrix'), icon: 'tsfont-blocklist', tooltip: this.$t('term.cmdb.applicationmatrix.matrixtip') },
        { value: 'list', text: this.$t('term.cmdb.applicationmatrix.list'), icon: 'tsfont-list', tooltip: this.$t('term.cmdb.applicationmatrix.listtip') }
      ],
      matrixInitialized: false,
      historyRestored: false,
      matrixHistoryState: null,
      matrixSearchValue: {},
      contentScrollTop: 0,
      pendingScrollTop: null,
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
      ciEntityData: {}, // 添加模块时，用于锁定应用
      isSettingDialogShow: false 

    };
  },
  beforeCreate() {},
  created() {
    this.restoreViewMode();
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
    // 组合搜索统一保存条件对象；本期仅将现有名称关键词交给矩阵查询。
    async searchMatrix(searchValue) {
      this.matrixSearchValue = searchValue || {};
      await this.$nextTick();
      if (this.$refs.applicationMatrix) {
        return this.$refs.applicationMatrix.search();
      }
    },
    // 按租户、用户和业务模块隔离显示偏好，不保存业务数据。
    getViewModeKey() {
      const user = this.$utils.getUserInfo() || {};
      const tenant = typeof TENANT === 'undefined' ? '' : TENANT;
      return ['neatlogic.cmdb.application.viewMode', tenant, user.uuid || user.userUuid || user.userId || 'anonymous', this.moduleName].join('.');
    },
    // 存储不可用时仍可正常使用列表视图。
    restoreViewMode() {
      if (this.historyRestored) {
        return;
      }
      try {
        this.viewMode = localStorage.getItem(this.getViewModeKey()) === 'matrix' ? 'matrix' : 'list';
      } catch (e) {
        this.viewMode = 'list';
      }
      this.matrixInitialized = this.viewMode === 'matrix';
    },
    // 两种视图保持挂载，仅切换可见区域，保留搜索与分页。
    async changeViewMode(mode) {
      if (mode === 'matrix') {
        this.matrixInitialized = true;
      }
      this.viewMode = mode;
      try {
        localStorage.setItem(this.getViewModeKey(), mode);
      } catch (e) {
        // 浏览器禁用本地存储时仅在本次页面内保留偏好。
      }
      await this.$nextTick();
      // 首次异步组件尚未挂载或用户已再次切换时，由组件输入值完成初始化。
      if (this.viewMode !== mode) {
        return;
      }
      if (mode === 'list') {
        const tree = this.$refs.appModuleTree;
        if (!tree) {
          return;
        }
        await tree.restoreSelection(this.appModueData, { app: this.selectedApp, module: this.selectedModule });
        if (this.viewMode !== 'list') {
          return;
        }
        // 树的恢复为静默定位，返回二级页后须同步真实实体供原列表详情读取。
        this.syncTreeSelection();
        tree.calcScrollHeight();
      }
    },
    // 隐藏的树完成异步初始化时，不覆盖矩阵返回恢复的选择。
    updateTreeSelection(value) {
      if (this.viewMode === 'list') {
        this.appModueData = value;
      }
    },
    // 树的应用、模块事件分开发送，由应用事件先清理旧模块。
    getSelectedApp(app) {
      if (this.viewMode === 'matrix') {
        return;
      }
      this.applySelection(app, null);
    },
    // 隐藏列表的异步查询不可覆盖矩阵中的当前选择。
    getSelectedModule(module) {
      if (this.viewMode === 'list') {
        this.applySelection(this.selectedApp, module);
      }
    },
    // 矩阵仅负责浏览跳转，不改变列表模式的选择和管理目标。
    openMatrixDetail(app, module) {
      this.$addHistoryData('applicationViewState', {
        viewMode: 'matrix',
        selection: { ...this.appModueData },
        search: { ...this.matrixSearchValue },
        matrix: this.$refs.applicationMatrix.getHistoryState(),
        scrollTop: this.contentScrollTop
      });
      this.$router.push({
        name: 'application-overview',
        query: {
          appSystemId: app.id,
          ...(module ? { appModuleId: module.id } : {}),
          ...(this.moduleName ? { moduleName: this.moduleName } : {})
        }
      });
    },
    // 仅恢复浏览状态和原列表选择；矩阵不维护选中项。
    restoreHistory(historyData) {
      const state = historyData.applicationViewState;
      if (state) {
        this.historyRestored = true;
        this.viewMode = state.viewMode === 'matrix' ? 'matrix' : 'list';
        this.matrixInitialized = this.viewMode === 'matrix';
        this.appModueData = { ...(state.selection || {}) };
        this.matrixHistoryState = state.matrix || null;
        // 兼容原关键词历史；新历史保留完整条件对象以支持后续增加条件。
        this.matrixSearchValue = state.search || (state.matrix && state.matrix.keyword ? { keyword: state.matrix.keyword } : {});
        this.pendingScrollTop = Number(state.scrollTop) || 0;
      }
    },
    // 由 TsContain 记录真实内容滚动，避免额外操作页面外的滚动容器。
    rememberScroll(top) {
      this.contentScrollTop = top;
    },
    // 模块方块完成加载后仅恢复滚动，不从浏览入口生成选中项。
    async restoreMatrixScroll() {
      if (this.pendingScrollTop !== null && this.$refs.contain) {
        await this.$nextTick();
        this.$refs.contain.scrollTop(this.pendingScrollTop);
        this.pendingScrollTop = null;
      }
    },
    // 单点维护详情和管理操作所使用的真实实体标识。
    applySelection(app, module) {
      this.selectedApp = app || null;
      this.selectedModule = module || null;
      this.appSystemId = app ? app.id : null;
      this.appCiEntityId = this.appSystemId;
      this.appModuleId = module ? module.id : null;
      this.appModueData = app ? { appId: app.id, ...(module ? { moduleId: module.id } : {}) } : {};
    },
    // 尚未打开矩阵时不创建组件或发起模块查询。
    refreshMatrix(options) {
      if (this.$refs.applicationMatrix) {
        return this.$refs.applicationMatrix.refresh(options);
      }
      return Promise.resolve();
    },
    // 刷新列表和矩阵的数据缓存，并刷新当前真实详情。
    async refreshViews(options = { all: true }) {
      await Promise.all([
        this.$refs.appModuleTree.refreshCurrent(),
        this.refreshMatrix(options)
      ]);
      const detail = this.$refs.listDetail;
      if (detail) {
        detail.refresh();
      }
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
    async closeAppEditDialog(needRefresh, uuid) {
      const isCreate = !this.appCiEntityId;
      this.isEditAppDialogShow = false;
      if (needRefresh && uuid) {
        if (isCreate) {
          await this.addManagedAppByUuid(uuid);
        }
        // 添加应用成功，刷新树列表
        await this.$refs.appModuleTree.refreshApp(uuid);
        if (this.viewMode === 'list') {
          this.syncTreeSelection();
        }
        await this.refreshMatrix({ all: true });
        this.refreshDetail();
      }
    },
    async closeAppModuleEditDialog(needRefresh, uuid) {
      this.isEditAppModuleDialogShow = false;
      if (needRefresh && uuid) {
        if (this.viewMode === 'matrix') {
          // 矩阵没有当前应用，新增模块后按实际数据重读，避免沿用隐藏列表的目标。
          await Promise.all([this.$refs.appModuleTree.refreshCurrent(), this.refreshMatrix({ all: true })]);
          return;
        }
        // 添加编辑模块成功，刷新树列表
        const appId = this.appSystemId;
        await this.$refs.appModuleTree.refreshModule(uuid, appId);
        this.syncTreeSelection();
        await this.refreshMatrix({ invalidateAppId: appId });
        this.refreshDetail();
      }
    },
    // 删除后先取消失效选择，再刷新两种视图及模块缓存。
    async closeDeleteDialog(needRefresh) {
      this.isDeleteDialogShow = false;
      if (needRefresh) {
        const appId = this.appSystemId;
        const app = this.selectedApp;
        const wasModule = !!this.appModuleId;
        this.applySelection(wasModule ? app : null, null);
        if (wasModule) {
          await this.$refs.appModuleTree.refreshAppByDelModule(appId);
        } else {
          await this.$refs.appModuleTree.refreshCurrent();
        }
        await this.refreshMatrix({ all: !wasModule, invalidateAppId: appId });
        this.refreshDetail();
      }
    },
    // 创建或编辑后同步树中由接口重新读取的应用和模块实体。
    syncTreeSelection() {
      const tree = this.$refs.appModuleTree;
      if (tree.selectedApp) {
        this.applySelection(tree.selectedApp, tree.selectedModule);
      }
    },
    // 编辑实体后让现有详情组件重新读取属性和资产。
    refreshDetail() {
      ['listDetail'].forEach(name => {
        if (this.$refs[name]) {
          this.$refs[name].refresh();
        }
      });
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
      // 仅列表模式用当前选中应用预填；矩阵新增模块由用户明确选择所属应用。
      this.ciEntityData = {};
      if (this.viewMode === 'list' && this.appModuleCiId && this.selectedApp) {
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
    },
    addSettingDialog() {
      this.isSettingDialogShow = true;
    },
    async addManagedAppByUuid(uuid) {
      if (!this.moduleName || !uuid) {
        return;
      }
      const appRes = await this.$api.cmdb.applicationManage.getAppsystemById({ uuid });
      const appId = appRes && appRes.Return ? appRes.Return.id : null;
      if (!appId) {
        return;
      }
      const settingRes = await this.$api.cmdb.applicationManage.getApplicationlistSetting();
      const currentConfig = (settingRes && settingRes.Return && settingRes.Return.config) || {};
      const moduleVisibleAppSystemIdListMap = currentConfig.moduleVisibleAppSystemIdListMap || {};
      const currentAppSystemIdList = moduleVisibleAppSystemIdListMap[this.moduleName] || [];
      if (currentAppSystemIdList.includes(-1) || currentAppSystemIdList.includes(appId)) {
        return;
      }
      moduleVisibleAppSystemIdListMap[this.moduleName] = [...currentAppSystemIdList, appId];
      const data = {
        config: {
          ...currentConfig,
          moduleVisibleAppSystemIdListMap
        }
      };
      if (settingRes && settingRes.Return && settingRes.Return.id) {
        data.id = settingRes.Return.id;
      }
      await this.$api.cmdb.applicationManage.saveApplicationlistSetting(data);
    },
    // 设置变更可能调整可见范围，清空旧选择及所有模块缓存。
    async closeSettingDialog(needRefresh) {
      this.isSettingDialogShow = false;
      if (needRefresh) {
        this.applySelection(null, null);
        await this.refreshViews({ all: true });
      }
    }
  },
  filter: {},
  computed: {
    moduleName() {
      return this.$route.meta.moduleName || '';
    }
  },
  watch: {}
};
</script>
