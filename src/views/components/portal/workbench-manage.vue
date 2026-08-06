<template>
  <div class="portal-workbench-manage">
    <TsContain
      border="border"
      :mode="isPersonal ? 'dialog' : 'window'"
    >
      <template v-slot:topLeft>
        <div class="workbench-toolbar__actions">
          <Button type="primary" @click="toEdit()">
            <span class="tsfont-plus mr-xs"></span>
            {{ createLabel }}
          </Button>
          <Button
            v-if="canManageComponent"
            v-auth="['PORTAL_WIDGET_MANAGE', 'ADMIN']"
            type="default"
            class="ml-sm"
            @click="openComponentManageDialog"
          >
            <span class="tsfont-setting mr-xs"></span>
            组件管理
          </Button>
        </div>
      </template>
      <template v-slot:topRight>
        <InputSearcher
          v-model="keyword"
          class="workbench-search"
          @change="searchWorkbench(1)"
        ></InputSearcher>
      </template>
      <template v-slot:content>
        <div class="workbench-manage__content">
          <Tabs
            v-if="scopeList.length"
            :value="moduleGroup"
            :name="scopeTabsName"
            :animated="false"
            class="workbench-scope-tabs mb-md"
            @on-click="selectScopeByModuleGroup"
          >
            <TabPane
              v-for="scope in scopeList"
              :key="scope.moduleGroup"
              :label="scope.label"
              :name="scope.moduleGroup"
              :tab="scopeTabsName"
            ></TabPane>
          </Tabs>
          <div v-if="isPersonal" class="workbench-reference-tip text-grey mb-md">
            <span class="tsfont-info-o text-primary mr-xs"></span>
            每个模块仅可引用一个工作台。模块未配置首页时，将默认展示所引用的工作台；已配置首页时，仍优先展示原首页。
          </div>
          <div v-if="listError" class="workbench-list-state flex-center text-center">
            <NoData :text="listError"></NoData>
            <div class="text-action mt-sm" @click="searchWorkbench(currentPage)">重试</div>
          </div>
          <div v-else class="workbench-card-list">
            <TsCard
              v-bind="tableConfig"
              :padding="false"
              :border="false"
              :boxShadow="true"
              :hasHoverShadow="true"
              :bodyStyle="{ padding: '0' }"
              :sizeList="[8, 12, 20]"
              :xs="24"
              :sm="24"
              :md="12"
              :lg="12"
              :xl="12"
              :xxl="12"
              keyName="id"
              classname="workbench-template-card"
              @updatePage="searchWorkbench"
              @updateSize="changePageSize"
            >
              <template v-slot:header="{ row }">
                <div class="workbench-card__header">
                  <div class="workbench-card__title">
                    <span
                      :class="['workbench-card__name overflow', canEditWorkbench(row) ? 'text-action' : '']"
                      @click.stop="editWorkbench(row)"
                    >{{ row.name }}</span>
                    <Tag v-if="isPersonal">{{ getWorkbenchTypeLabel(row) }}</Tag>
                  </div>
                  <div v-if="isPersonal" class="workbench-card__reference">
                    <template v-if="isReferenced(row)">
                      <span class="workbench-reference-badge bg-primary-grey text-primary radius-md">
                        <span class="tsfont-check mr-xs"></span>
                        当前引用
                      </span>
                      <Button
                        type="text"
                        size="small"
                        :loading="referenceSavingId === row.id"
                        :disabled="referenceSavingId !== null && referenceSavingId !== row.id"
                        @click.stop="changePersonalReference(row, 'delete')"
                      >取消引用</Button>
                    </template>
                    <Button
                      v-else
                      type="default"
                      size="small"
                      :loading="referenceSavingId === row.id"
                      :disabled="referenceSavingId !== null && referenceSavingId !== row.id"
                      @click.stop="changePersonalReference(row, 'save')"
                    >
                      <span class="tsfont-circle-o mr-xs"></span>
                      设为引用
                    </Button>
                  </div>
                  <CommonStatus
                    v-else
                    type="block"
                    :statusValue="row.isActive == 1 ? 'succeed' : 'pending'"
                    :statusName="row.isActive == 1 ? $t('page.enable') : $t('page.disable')"
                  ></CommonStatus>
                </div>
              </template>
              <template v-slot:default="{ row }">
                <div
                  v-if="isPersonal && isReferenced(row)"
                  class="workbench-card__selected-border border-primary radius-md"
                ></div>
                <WorkbenchLayoutPreview
                  :widgetList="getWorkbenchWidgetList(row)"
                  :presentationMap="presentationMap"
                  :labelMap="labelMap"
                  lazy
                  class="bg-op"
                  @open="openPreview(row)"
                ></WorkbenchLayoutPreview>
                <div class="workbench-card__footer border-base-top padding-md">
                  <div class="workbench-card__meta text-grey">
                    <div v-if="!isPersonal" class="workbench-card__authority">
                      <span class="meta-label">适用：</span>
                      <WorkbenchAuthoritySummary :dataList="row.authorityVoList || []"></WorkbenchAuthoritySummary>
                    </div>
                    <span v-else>适用：个人</span>
                    <span>组件：{{ getWidgetCount(row) }} 个</span>
                    <span>更新于 {{ (row.lcd || row.fcd) | formatDate }}</span>
                  </div>
                  <div class="workbench-card__actions">
                    <div v-if="!isPersonal" @click.stop>
                      <TsFormSwitch
                        v-model="row.isActive"
                        :trueValue="1"
                        :falseValue="0"
                        :showStatus="false"
                        @on-change="updateActive(row)"
                      ></TsFormSwitch>
                    </div>
                    <span
                      v-if="canEditWorkbench(row)"
                      class="text-action tsfont-edit"
                      @click.stop="editWorkbench(row)"
                    >{{ $t('page.edit') }}</span>
                    <span
                      v-if="canDeleteWorkbench(row)"
                      :class="[
                        'tsfont-trash-o',
                        isPersonal && isReferenced(row) ? 'text-disabled' : 'text-action text-error'
                      ]"
                      :title="isPersonal && isReferenced(row) ? '请先取消引用后再删除' : ''"
                      @click.stop="deleteWorkbenchTemplate(row)"
                    >{{ $t('page.delete') }}</span>
                  </div>
                </div>
              </template>
            </TsCard>
          </div>
        </div>
      </template>
    </TsContain>
    <WorkbenchComponentManageDialog
      v-if="isShowComponentManageDialog"
      :moduleGroup="moduleGroup"
      :workbenchType="workbenchType"
      @close="isShowComponentManageDialog = false"
    ></WorkbenchComponentManageDialog>
    <WorkbenchPreviewDialog
      v-if="currentPreviewWorkbench"
      :workbench="currentPreviewWorkbench"
      :presentationMap="presentationMap"
      :labelMap="labelMap"
      @close="currentPreviewWorkbench = null"
    ></WorkbenchPreviewDialog>
  </div>
</template>

<script>
import {
  WORKBENCH_TYPE_GLOBAL,
  WORKBENCH_TYPE_PERSONAL
} from './workbench-constants.js';
import { getWorkbenchWidgetDefinitions } from './workbench-provider-registry.js';

export default {
  name: 'PortalWorkbenchManage',
  components: {
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    WorkbenchAuthoritySummary: () => import('./components/workbench-authority-summary.vue'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    WorkbenchComponentManageDialog: () => import('./components/workbench-component-manage-dialog.vue'),
    WorkbenchLayoutPreview: () => import('./components/workbench-layout-preview.vue'),
    WorkbenchPreviewDialog: () => import('./components/workbench-preview-dialog.vue')
  },
  props: {
    moduleGroup: { type: String, default: '' },
    workbenchType: { type: String, default: WORKBENCH_TYPE_GLOBAL },
    editRouteName: { type: String, default: 'workbench-edit' },
    editRouteQuery: { type: Object, default: () => ({}) },
    scopeList: { type: Array, default: () => [] }
  },
  data() {
    return {
      keyword: '',
      pageSize: 8,
      currentPage: 1,
      tableConfig: {
        tbodyList: []
      },
      scopeTabsName: `portalWorkbenchScopeTabs-${this.$utils.setUuid()}`,
      listRequestId: 0,
      referenceRequestId: 0,
      referenceSavingId: null,
      isShowComponentManageDialog: false,
      currentPreviewWorkbench: null,
      listError: ''
    };
  },
  created() {
    this.searchWorkbench(1);
  },
  beforeDestroy() {
    this.listRequestId += 1;
    this.referenceRequestId += 1;
  },
  methods: {
    selectScopeByModuleGroup(moduleGroup) {
      this.selectScope(this.scopeList.find(scope => scope.moduleGroup === moduleGroup));
    },
    selectScope(scope) {
      if (scope && scope.moduleGroup !== this.moduleGroup) {
        this.$emit('scope-change', scope.moduleGroup);
      }
    },
    searchWorkbench(currentPage) {
      this.currentPage = currentPage || 1;
      const requestId = ++this.listRequestId;
      this.listError = '';
      this.currentPreviewWorkbench = null;
      this.$set(this.tableConfig, 'loading', true);
      this.$api.common.searchWorkbenchList({
        keyword: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        moduleGroup: this.moduleGroup,
        type: this.workbenchType
      }).then(res => {
        if (requestId !== this.listRequestId) {
          return;
        }
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '工作台模板加载失败');
        }
        const result = res.Return || {};
        const tbodyList = Array.isArray(result.tbodyList) ? result.tbodyList : [];
        this.tableConfig = {
          rowNum: 0,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          ...result,
          tbodyList
        };
      }).catch(error => {
        if (requestId !== this.listRequestId) {
          return;
        }
        this.tableConfig = { tbodyList: [] };
        this.listError = (error && (error.Message || error.message)) || '工作台模板加载失败';
        this.$Message.error(this.listError);
      }).finally(() => {
        if (requestId === this.listRequestId) {
          this.$set(this.tableConfig, 'loading', false);
        }
      });
    },
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.searchWorkbench(1);
    },
    getWidgetCount(row) {
      return this.getWorkbenchWidgetList(row).length;
    },
    getWorkbenchWidgetList(row) {
      return row && row.config && Array.isArray(row.config.widgetList)
        ? row.config.widgetList
        : [];
    },
    openPreview(row) {
      this.currentPreviewWorkbench = row;
    },
    isPersonalWorkbench(row) {
      return !!(row && row.type === WORKBENCH_TYPE_PERSONAL);
    },
    isGlobalWorkbench(row) {
      return !!(row && row.type === WORKBENCH_TYPE_GLOBAL);
    },
    getWorkbenchTypeLabel(row) {
      if (this.isPersonalWorkbench(row)) {
        return '个人';
      }
      if (this.isGlobalWorkbench(row)) {
        return '全局';
      }
      return '未知';
    },
    canEditWorkbench(row) {
      return !this.isPersonal || this.isPersonalWorkbench(row);
    },
    canDeleteWorkbench(row) {
      return !this.isPersonal || this.isPersonalWorkbench(row);
    },
    editWorkbench(row) {
      if (!this.canEditWorkbench(row)) {
        return;
      }
      this.toEdit(row.id, row.type);
    },
    isReferenced(row) {
      return !!(row && (row.isEnable === 1 || row.isEnable === '1' || row.isEnable === true));
    },
    changePersonalReference(row, action) {
      if (
        !this.isPersonal ||
        !row ||
        !row.id ||
        !['save', 'delete'].includes(action) ||
        this.referenceSavingId !== null
      ) {
        return;
      }
      const requestId = ++this.referenceRequestId;
      const moduleGroup = this.moduleGroup;
      this.referenceSavingId = row.id;
      this.$api.common.toggleWorkbenchEnable(row.id, action).then(res => {
        if (requestId !== this.referenceRequestId || moduleGroup !== this.moduleGroup) {
          return;
        }
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '工作台引用状态更新失败');
        }
        this.$Message.success(action === 'save' ? '引用成功' : '已取消引用');
        this.searchWorkbench(this.currentPage);
      }).catch(error => {
        if (requestId !== this.referenceRequestId || moduleGroup !== this.moduleGroup) {
          return;
        }
        this.$Message.error((error && (error.Message || error.message)) || '工作台引用状态更新失败');
      }).finally(() => {
        if (requestId === this.referenceRequestId) {
          this.referenceSavingId = null;
        }
      });
    },
    deleteWorkbenchTemplate(row) {
      if (!this.canDeleteWorkbench(row)) {
        if (this.isPersonal) {
          this.$Message.warning('全局工作台不能在个人设置中删除');
        }
        return;
      }
      if (this.isPersonal && this.isReferenced(row)) {
        this.$Message.warning('请先取消引用后再删除');
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: row.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.common.deleteWorkbench(row.id, this.moduleGroup, row.type || this.workbenchType).then(res => {
            if (!res || res.Status !== 'OK') {
              throw new Error((res && res.Message) || '工作台模板删除失败');
            }
            this.$Message.success(this.$t('message.deletesuccess'));
            this.searchWorkbench(1);
            vnode.isShow = false;
          }).catch(error => {
            this.$Message.error((error && (error.Message || error.message)) || '工作台模板删除失败');
          });
        }
      });
    },
    updateActive(row) {
      if (this.isPersonal) {
        return;
      }
      const previousValue = row.isActive === 1 ? 0 : 1;
      this.$api.common.updateWorkbenchActive(row.id, row.isActive, this.moduleGroup, this.workbenchType).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '工作台状态更新失败');
        }
        this.$Message.success(this.$t('message.executesuccess'));
      }).catch(error => {
        this.$set(row, 'isActive', previousValue);
        this.$Message.error((error && (error.Message || error.message)) || '工作台状态更新失败');
      });
    },
    toEdit(id, type = this.workbenchType) {
      this.$router.push({
        name: this.editRouteName,
        params: id ? { id } : {},
        query: {
          ...this.editRouteQuery,
          type
        }
      });
    },
    openComponentManageDialog() {
      this.isShowComponentManageDialog = true;
    }
  },
  computed: {
    isPersonal() {
      return this.workbenchType === WORKBENCH_TYPE_PERSONAL;
    },
    canManageComponent() {
      return this.workbenchType === WORKBENCH_TYPE_GLOBAL;
    },
    createLabel() {
      return this.isPersonal ? '新建个人模板' : '新建模板';
    },
    widgetDefinitions() {
      return getWorkbenchWidgetDefinitions({
        scope: this.moduleGroup === 'index' ? 'global' : 'module',
        targetModuleGroup: this.moduleGroup,
        moduleList: this.$store.state.topMenu.moduleList || []
      });
    },
    presentationMap() {
      return this.widgetDefinitions.reduce((map, definition) => {
        map[definition.name] = {
          type: 'unknown',
          ...(definition.presentation || {})
        };
        return map;
      }, {});
    },
    labelMap() {
      return this.widgetDefinitions.reduce((map, definition) => {
        map[definition.name] = definition.label || definition.name;
        return map;
      }, {});
    }
  },
  watch: {
    moduleGroup(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }
      this.referenceRequestId += 1;
      this.referenceSavingId = null;
      this.keyword = '';
      this.pageSize = 8;
      this.currentPage = 1;
      this.searchWorkbench(1);
    }
  }
};
</script>

<style lang="less" scoped>
.portal-workbench-manage {
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

::v-deep .tscontain-container {
  min-width: 0;
}

.workbench-search {
  width: 240px;
  max-width: 100%;
  margin-left: auto;
}

.workbench-manage__content,
.workbench-card-list {
  width: 100%;
  min-width: 0;
}

.workbench-list-state {
  min-height: 320px;
  flex-direction: column;
}

.workbench-scope-tabs {
  min-width: 0;
}

.workbench-reference-tip {
  display: flex;
  align-items: center;
  line-height: 20px;
}

::v-deep .tscontain-body {
  overflow-x: hidden;
}

::v-deep .workbench-template-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  > .tscard-header {
    flex: 0 0 auto;
    padding: 10px 12px;
  }

  > .tscard-body {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }

  > .tscard-footer {
    height: auto;
    min-height: 76px;
    padding: 10px 12px;
  }
}

::v-deep .tscard-ul {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}

::v-deep .tscard-li {
  float: none;
  display: flex;
  margin-bottom: 4px;
}

::v-deep .tscard-page + .tstable-page,
::v-deep .tstable-page {
  margin-top: 12px;
}

.workbench-card__header {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 4px 6px;
}

.workbench-card__selected-border {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.workbench-card__title {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.workbench-card__name {
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
}

.workbench-card__reference {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.workbench-reference-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  line-height: 20px;
}

.workbench-card__footer {
  min-width: 0;
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.workbench-card__meta {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  align-items: center;
  font-size: 12px;
}

.workbench-card__authority {
  max-width: 260px;
  display: flex;
  align-items: center;
  overflow: visible;
}

.meta-label {
  flex: 0 0 auto;
}

.workbench-card__actions {
  flex: 0 0 auto;
  display: flex;
  gap: 14px;
  align-items: center;
  white-space: nowrap;
}

@media screen and (max-width: 1024px) {
  ::v-deep .tscontain-header > div > div:last-child > div {
    grid-template-columns: minmax(0, auto) 0 minmax(180px, 1fr) !important;
  }

  .workbench-search {
    width: 100%;
  }

  .workbench-card__footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
