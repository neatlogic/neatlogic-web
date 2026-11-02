<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ app ? app.name : $t('term.cmdb.applicationoverview.title') }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item tsfont-refresh" @click="load(true)">{{ $t('page.refresh') }}</span>
          <span
            v-if="canManage"
            class="action-item tsfont-edit"
            @click="editScope"
          >{{ selectedModule ? $t('term.cmdb.applicationoverview.editmodule') : $t('term.cmdb.applicationoverview.editapplication') }}</span>
          <span
            v-if="canManage"
            class="action-item tsfont-trash-o"
            @click="deleteScope"
          >{{ selectedModule ? $t('term.cmdb.applicationoverview.deletemodule') : $t('term.cmdb.applicationoverview.deleteapplication') }}</span>
        </div>
      </template>
      <template v-slot:content>
        <Loading v-if="isLoading" :loadingShow="true" type="fix"></Loading>
        <div v-if="error" class="bg-op radius-lg padding-lg">
          <div class="text-grey mb-md">{{ errorText }}</div>
          <div class="action-group">
            <span v-if="error === 'failed'" class="action-item tsfont-refresh text-action" @click="load(true)">{{ $t('page.retry') }}</span>
            <span v-if="error === 'invalidmodule'" class="action-item text-action" @click="changeScope(null)">{{ $t('term.cmdb.applicationoverview.systemscope') }}</span>
          </div>
        </div>
        <template v-else-if="app && !isLoading">
          <div class="flex-start align-center padding-sm mb-md">
            <span class="tsfont-application text-primary fz20 mr-md"></span>
            <div>
              <div class="fz20 text-title mb-xs"><strong>{{ app.abbrName || app.name }}</strong><span v-if="app.abbrName && app.name" class="ml-md">{{ app.name }}</span></div>
              <div class="text-grey">{{ $t('term.deploy.abbreviation') }}: {{ app.abbrName || '-' }}<span class="ml-md">{{ $t('term.cmdb.applicationoverview.modulecount', { count: modules.length }) }}</span></div>
              <div v-if="selectedModule" class="text-primary pt-xs">{{ $t('page.module') }}: {{ selectedModule.abbrName || '' }} {{ selectedModule.name || '' }}</div>
            </div>
          </div>
          <ApplicationModuleSwitcher :value="selectedModule ? selectedModule.id : null" :modules="modules" @change="changeScope"></ApplicationModuleSwitcher>
          <div class="text-grey pt-sm pb-md">{{ selectedModule ? $t('term.cmdb.applicationoverview.modulescopehint', { name: selectedModule.name || selectedModule.abbrName }) : $t('term.cmdb.applicationoverview.systemscopehint') }}</div>
          <div class="bg-op radius-lg padding-sm">
            <ApplicationDetail
              :key="detailKey"
              :app="app"
              :module="selectedModule"
              :blockTabs="false"
            ></ApplicationDetail>
          </div>
        </template>
      </template>
    </TsContain>
    <AppEditDialog
      v-if="isEditAppShow"
      :ciEntityId="editEntityId"
      :ciId="editCiId"
      @close="closeEdit"
    ></AppEditDialog>
    <AppModuleEditDialog
      v-if="isEditModuleShow"
      :ciEntityId="editEntityId"
      :ciId="editCiId"
      @close="closeEdit"
    ></AppModuleEditDialog>
    <DeleteCiEntityDialog
      v-if="isDeleteShow"
      :allowDelete="true"
      :allowCommit="true"
      :ciEntityId="deleteTarget.id"
      @close="closeDelete"
    ></DeleteCiEntityDialog>
  </div>
</template>
<script>
export default {
  name: 'ApplicationOverview',
  components: {
    ApplicationModuleSwitcher: () => import('./application-module-switcher.vue'),
    ApplicationDetail: () => import('./application-detail.vue'),
    AppEditDialog: () => import('./app-edit-dialog.vue'),
    AppModuleEditDialog: () => import('./appmodule-edit-dialog.vue'),
    DeleteCiEntityDialog: () => import('../cientity/cientity-delete-dialog.vue')
  },
  data() {
    return {
      app: null,
      modules: [],
      selectedModule: null,
      isLoading: false,
      error: '',
      generation: 0,
      refreshVersion: 0,
      loadedModuleName: null,
      isEditAppShow: false,
      isEditModuleShow: false,
      isDeleteShow: false,
      deleteTarget: null,
      editingBusy: false,
      editEntityId: null,
      editCiId: null
    };
  },
  created() {
    this.load();
  },
  beforeDestroy() {
    this.generation++;
  },
  methods: {
    // 只接受正整数标识，保留字符串以避免长整型标识额外丢失精度。
    parseId(value) {
      if (typeof value !== 'string' && typeof value !== 'number') {
        return null;
      }
      return /^[1-9]\d*$/.test(String(value)) ? String(value) : null;
    },
    // 先校验资源清单可见范围，再读取系统和其真实模块，旧请求不可覆盖新路由。
    async load(force = false) {
      const generation = ++this.generation;
      const query = this.$route.query;
      const appId = this.parseId(query.appSystemId);
      const moduleId = query.appModuleId === undefined ? null : this.parseId(query.appModuleId);
      this.error = '';
      if (!appId || (query.appModuleId !== undefined && !moduleId) || (query.moduleName !== undefined && typeof query.moduleName !== 'string')) {
        this.app = null;
        this.modules = [];
        this.selectedModule = null;
        this.isLoading = false;
        this.error = 'invalid';
        return;
      }
      if (!force && this.app && String(this.app.id) === appId && this.loadedModuleName === this.moduleName) {
        this.isLoading = false;
        this.applyScope(moduleId);
        return;
      }
      this.isLoading = true;
      this.app = null;
      this.modules = [];
      this.selectedModule = null;
      try {
        const visibility = await this.$api.cmdb.applicationManage.getVisibleAppsystemList({ defaultValue: [appId], ...(this.moduleName ? { moduleName: this.moduleName } : {}) });
        if (generation !== this.generation) {
          return;
        }
        if (!visibility || visibility.Status !== 'OK' || !visibility.Return) {
          throw new Error('application visibility unavailable');
        }
        const visibleList = visibility.Return.tbodyList || [];
        if (!visibleList.some(item => String(item.id) === appId)) {
          this.error = 'unavailable';
          return;
        }
        const [appResponse, moduleResponse] = await Promise.all([
          this.$api.cmdb.applicationManage.getAppsystemById({ id: appId }),
          this.$api.cmdb.applicationManage.getAppmoduleListTree({ appSystemId: appId })
        ]);
        if (generation !== this.generation) {
          return;
        }
        if (!appResponse || appResponse.Status !== 'OK' || !moduleResponse || moduleResponse.Status !== 'OK' || !Array.isArray(moduleResponse.Return)) {
          throw new Error('application detail unavailable');
        }
        if (!appResponse.Return || String(appResponse.Return.id) !== appId) {
          this.error = 'unavailable';
          return;
        }
        this.app = appResponse.Return;
        this.modules = moduleResponse.Return;
        this.loadedModuleName = this.moduleName;
        this.refreshVersion++;
        this.applyScope(moduleId);
      } catch (error) {
        if (generation === this.generation) {
          this.error = 'failed';
        }
      } finally {
        if (generation === this.generation) {
          this.isLoading = false;
        }
      }
    },
    // 模块必须来自当前系统返回列表，不把其他系统的模块作为本系统范围。
    applyScope(moduleId) {
      this.selectedModule = moduleId ? this.modules.find(module => String(module.id) === String(moduleId)) || null : null;
      if (moduleId && !this.selectedModule) {
        this.error = 'invalidmodule';
      }
    },
    // 编辑时才读取资源模型定义，并在响应后核对当前范围，避免打开其他实体。
    async editScope() {
      if (this.editingBusy || !this.app || this.error || !this.$AuthUtils.hasRole('RESOURCECENTER_MODIFY')) {
        return;
      }
      const generation = this.generation;
      const module = this.selectedModule;
      const entityId = module ? module.id : this.app.id;
      this.editingBusy = true;
      try {
        const response = await this.$api.cmdb.applicationManage.getResourceEntityByName(module ? 'scence_appmodule' : 'scence_appsystem');
        if (generation !== this.generation) {
          return;
        }
        if (!response || response.Status !== 'OK' || !response.Return || !response.Return.ciId) {
          this.$Message.error(this.$t('term.cmdb.applicationoverview.editunavailable'));
          return;
        }
        this.editEntityId = entityId;
        this.editCiId = response.Return.ciId;
        this.isEditModuleShow = !!module;
        this.isEditAppShow = !module;
      } catch (error) {
        // 请求层统一提示失败；保留当前阅读范围，不打开缺少模型的编辑窗口。
      } finally {
        this.editingBusy = false;
      }
    },
    // 保存后重新核对系统和模块，删除或移动后的旧范围不会继续显示资产。
    closeEdit(needRefresh) {
      this.isEditAppShow = false;
      this.isEditModuleShow = false;
      if (needRefresh) {
        this.load(true);
      }
    },
    // 管理目标由二级页当前范围确定，沿用现有配置项删除确认和提交流程。
    deleteScope() {
      if (!this.canManage) {
        return;
      }
      this.deleteTarget = { id: this.selectedModule ? this.selectedModule.id : this.app.id, appId: this.app.id, isModule: !!this.selectedModule };
      this.isDeleteShow = true;
    },
    // 模块删除提交后回到所属系统；系统删除提交后返回清单，取消或仅建事务不跳转。
    async closeDelete(needRefresh) {
      const target = this.deleteTarget;
      this.isDeleteShow = false;
      this.deleteTarget = null;
      if (!needRefresh || !target || !this.app || this.app.id !== target.appId) {
        return;
      }
      if (target.isModule) {
        if (this.selectedModule && this.selectedModule.id === target.id) {
          await this.changeScope(null);
        }
        await this.load(true);
      } else {
        this.app = null;
        this.modules = [];
        this.selectedModule = null;
        if (this.$hasBack()) {
          this.$back();
        } else {
          this.$router.replace({ name: 'application-manage', query: this.moduleName ? { moduleName: this.moduleName } : {} });
        }
      }
    },
    // 范围切换替换当前路由，返回仍直接回到应用清单。
    changeScope(moduleId) {
      const query = { ...this.$route.query };
      delete query.isBack;
      if (moduleId === null || moduleId === undefined) {
        delete query.appModuleId;
      } else {
        query.appModuleId = String(moduleId);
      }
      if (String(query.appModuleId || '') === String(this.$route.query.appModuleId || '')) {
        return;
      }
      // 框架按完整查询路径维护返回栈，范围切换须显式跳过本次历史记录。
      this.$skipHistory();
      return this.$router.replace({ path: this.$route.path, query });
    }
  },
  computed: {
    canManage() {
      return !!this.app && !this.isLoading && !this.error && this.$AuthUtils.hasRole('RESOURCECENTER_MODIFY');
    },
    moduleName() {
      return this.$route.meta.moduleName || this.$route.query.moduleName || '';
    },
    // 原属性组件只在挂载时加载，范围变更须重建以防显示上个模块的数据。
    detailKey() {
      return [this.app.id, this.selectedModule ? this.selectedModule.id : '', this.refreshVersion].join(':');
    },
    errorText() {
      return this.$t('term.cmdb.applicationoverview.' + this.error);
    }
  },
  watch: {
    '$route.query': {
      deep: true,
      handler() {
        this.load();
      }
    }
  }
};
</script>
