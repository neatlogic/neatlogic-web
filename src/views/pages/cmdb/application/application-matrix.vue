<template>
  <div>
    <Loading v-if="isLoading" :loadingShow="true" type="fix"></Loading>
    <div v-if="loadError" class="padding-md bg-op radius-lg">
      <span class="text-grey mr-md">{{ $t('term.cmdb.applicationmatrix.loadfailed') }}</span>
      <span
        class="text-action tsfont-refresh"
        role="button"
        tabindex="0"
        @click="loadPage"
        @keydown.enter="loadPage"
      >{{ $t('page.retry') }}</span>
    </div>
    <TsTable
      v-else
      :theadList="theadList"
      :tbodyList="appList"
      :rowNum="rowNum"
      :currentPage="currentPage"
      :pageSize="pageSize"
      :fixedHeader="false"
      :showSizer="false"
      :disabledHover="true"
      keyName="id"
      @changeCurrent="changePage"
    >
      <template v-slot:application="{ row }">
        <button
          type="button"
          class="application-matrix-app padding-sm radius-sm bg-op text-default"
          :title="displayName(row)"
          @click="openDetail(row)"
        >
          <span class="tsfont-application text-primary mr-sm"></span>
          <span class="application-matrix-name">
            <strong>{{ row.abbrName || row.name }}</strong>
            <span v-if="row.abbrName && row.name" class="text-grey fz12">{{ row.name }}</span>
          </span>
        </button>
      </template>
      <template v-slot:modules="{ row }">
        <div v-if="moduleState[row.id] && moduleState[row.id].loading" class="padding-sm text-grey">{{ $t('page.loadingtip') }}</div>
        <div v-else-if="moduleState[row.id] && moduleState[row.id].error" class="padding-sm">
          <span class="text-grey mr-md">{{ $t('term.cmdb.applicationmatrix.modulesfailed') }}</span>
          <span
            class="text-action tsfont-refresh"
            role="button"
            tabindex="0"
            @click="retryModules(row)"
            @keydown.enter="retryModules(row)"
          >{{ $t('page.retry') }}</span>
        </div>
        <div v-else-if="modules(row).length" class="application-matrix-modules">
          <button
            v-for="module in visibleModules(row)"
            :key="module.id"
            type="button"
            class="application-matrix-tile padding-sm radius-sm border-base bg-grey text-default"
            :title="displayName(module)"
            @click="openDetail(row, module)"
          >
            <strong class="overflow">{{ module.abbrName || module.name }}</strong>
            <span v-if="module.abbrName && module.name" class="overflow text-grey fz12">{{ module.name }}</span>
          </button>
          <span
            v-if="modules(row).length > 12"
            class="text-action application-matrix-more"
            role="button"
            tabindex="0"
            @click="toggleExpanded(row)"
            @keydown.enter="toggleExpanded(row)"
          >{{ expanded[row.id] ? $t('term.cmdb.applicationmatrix.collapse') : $t('term.cmdb.applicationmatrix.more', { count: modules(row).length - 12 }) }}</span>
        </div>
        <div v-else class="padding-sm text-grey">{{ $t('term.cmdb.applicationmatrix.nomodules') }}</div>
      </template>
    </TsTable>
  </div>
</template>
<script>
import { createModuleLoader } from './application-matrix-loader.js';

export default {
  name: 'ApplicationMatrix',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    moduleName: { type: String, default: '' },
    keyword: { type: String, default: '' },
    historyState: { type: Object, default: null }
  },
  data() {
    return {
      currentPage: Math.max(1, Number(this.historyState && this.historyState.currentPage) || 1),
      pageSize: 20,
      rowNum: 0,
      appList: [],
      moduleState: {},
      expanded: { ...((this.historyState && this.historyState.expanded) || {}) },
      isLoading: false,
      loadError: false,
      generation: 0,
      theadList: [
        { key: 'application', title: this.$t('term.cmdb.applicationmatrix.application'), width: 240 },
        { key: 'modules', title: this.$t('term.cmdb.applicationmatrix.modules') }
      ]
    };
  },
  created() {
    this.moduleLoader = createModuleLoader(async appSystemId => {
      const response = await this.$api.cmdb.applicationManage.getAppmoduleListTree({ appSystemId, ...(this.moduleName ? { moduleName: this.moduleName } : {}) });
      if (!response || response.Status !== 'OK' || !Array.isArray(response.Return)) {
        throw new Error('application modules unavailable');
      }
      return response.Return;
    });
    this.loadPage();
  },
  beforeDestroy() {
    this.generation++;
    this.moduleLoader.dispose();
  },
  methods: {
    /** 应用列表的请求版本与模块请求共用，旧页响应不覆盖当前页。 */
    async loadPage() {
      const generation = ++this.generation;
      this.isLoading = true;
      this.loadError = false;
      this.appList = [];
      this.moduleState = {};
      try {
        const response = await this.$api.cmdb.applicationManage.getAppsystemListTree({
          keyword: this.keyword,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          ...(this.moduleName ? { moduleName: this.moduleName } : {})
        });
        if (generation !== this.generation) {
          return;
        }
        if (!response || response.Status !== 'OK' || !response.Return) {
          throw new Error('application list unavailable');
        }
        this.appList = response.Return.tbodyList || [];
        this.rowNum = Number(response.Return.rowNum) || 0;
        // 删除最后一页应用后回到有效页码，保持当前搜索条件。
        const maxPage = Math.max(1, Math.ceil(this.rowNum / this.pageSize));
        if (this.currentPage > maxPage) {
          this.currentPage = maxPage;
          return this.loadPage();
        }
        this.isLoading = false;
        await Promise.all(this.appList.map(app => this.loadModules(app, generation)));
        if (generation === this.generation) {
          this.$emit('ready');
        }
      } catch (error) {
        if (generation === this.generation) {
          this.loadError = true;
        }
      } finally {
        if (generation === this.generation) {
          this.isLoading = false;
        }
      }
    },
    /** 每个应用局部显示加载及失败状态，不阻塞其他应用。 */
    async loadModules(app, generation = this.generation) {
      const state = { loading: true, error: false, modules: [] };
      this.$set(this.moduleState, app.id, state);
      const isCurrent = () => generation === this.generation && this.moduleState[app.id] === state;
      try {
        const result = await this.moduleLoader.load(app.id, isCurrent);
        if (isCurrent()) {
          state.modules = result || [];
        }
      } catch (error) {
        if (isCurrent()) {
          state.error = true;
        }
      } finally {
        if (isCurrent()) {
          state.loading = false;
        }
      }
    },
    /** 搜索只针对应用名称，回到第一页，已有模块缓存可继续复用。 */
    search() {
      this.currentPage = 1;
      return this.loadPage();
    },
    changePage(page) {
      this.currentPage = page;
      return this.loadPage();
    },
    retryModules(app) {
      this.moduleLoader.invalidate(app.id);
      return this.loadModules(app);
    },
    /** 保留搜索与页码；编辑后按应用失效，手动刷新时支持清空全部缓存。 */
    refresh({ invalidateAppId, all = false } = {}) {
      if (all) {
        this.moduleLoader.clear();
      } else if (invalidateAppId !== undefined && invalidateAppId !== null) {
        this.moduleLoader.invalidate(invalidateAppId);
      }
      return this.loadPage();
    },
    /** 返回框架历史需要的界面状态，不保存应用实体和模块请求缓存。 */
    getHistoryState() {
      return { keyword: this.keyword, currentPage: this.currentPage, expanded: { ...this.expanded } };
    },
    modules(app) {
      const state = this.moduleState[app.id];
      return state ? state.modules : [];
    },
    visibleModules(app) {
      const list = this.modules(app);
      return this.expanded[app.id] ? list : list.slice(0, 12);
    },
    toggleExpanded(app) {
      this.$set(this.expanded, app.id, !this.expanded[app.id]);
    },
    displayName(item) {
      return [item.abbrName, item.name].filter(Boolean).join(' / ');
    },
    /** 打开真实应用或模块的详情，不在矩阵中维护选中状态。 */
    openDetail(app, module = null) {
      this.$emit('open', app, module);
    }
  },
  watch: {
    moduleName() {
      this.moduleLoader.clear();
      this.currentPage = 1;
      this.loadPage();
    }
  }
};
</script>
<style scoped lang="less">
.application-matrix-app {
  display: flex;
  align-items: center;
  width: 100%;
  border: 0;
  text-align: left;
  cursor: pointer;
  font: inherit;
}
.application-matrix-name {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-wrap: anywhere;
}
.application-matrix-modules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.application-matrix-tile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 148px;
  min-height: 64px;
  text-align: left;
  cursor: pointer;
  font: inherit;
  > * {
    max-width: 100%;
  }
}
.application-matrix-more {
  align-self: center;
}
</style>
