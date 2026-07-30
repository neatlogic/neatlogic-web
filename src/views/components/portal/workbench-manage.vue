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
          <div class="workbench-table">
            <TsTable
              v-bind="tableConfig"
              :theadList="theadList"
              :fixedHeader="false"
              :hideAction="false"
              keyName="id"
              :canDrag="tableConfig.tbodyList && tableConfig.tbodyList.length > 1"
              @changeCurrent="searchWorkbench"
              @changePageSize="changePageSize"
              @updateRowSort="handleDragUpdate"
            >
              <template v-slot:name="{ row }">
                <span class="text-action" @click="toEdit(row.id)">{{ row.name }}</span>
              </template>
              <template v-slot:isActive="{ row }">
                <span :class="row.isActive == 1 ? 'text-success' : 'text-grey'">
                  {{ row.isActive == 1 ? $t('page.enable') : $t('page.disable') }}
                </span>
              </template>
              <template v-slot:authorityVoList="{ row }">
                <GroupList :dataList="row.authorityVoList || []"></GroupList>
              </template>
              <template v-slot:action="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li @click.stop>
                      <TsFormSwitch
                        v-model="row.isActive"
                        :trueValue="1"
                        :falseValue="0"
                        :showStatus="true"
                        @on-change="updateActive(row)"
                      ></TsFormSwitch>
                    </li>
                    <li class="tsfont-edit" @click="toEdit(row.id)">{{ $t('page.edit') }}</li>
                    <li class="tsfont-trash-o" @click="deleteWorkbenchTemplate(row)">{{ $t('page.delete') }}</li>
                  </ul>
                </div>
              </template>
            </TsTable>
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
  </div>
</template>

<script>
import {
  WORKBENCH_TYPE_GLOBAL,
  WORKBENCH_TYPE_PERSONAL
} from './workbench-constants.js';

export default {
  name: 'PortalWorkbenchManage',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    GroupList: () => import('@/resources/components/GroupList/GroupList.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    WorkbenchComponentManageDialog: () => import('./components/workbench-component-manage-dialog.vue')
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
      pageSize: 20,
      currentPage: 1,
      tableConfig: {
        tbodyList: []
      },
      oldList: [],
      scopeTabsName: `portalWorkbenchScopeTabs-${this.$utils.setUuid()}`,
      listRequestId: 0,
      isShowComponentManageDialog: false
    };
  },
  created() {
    this.searchWorkbench(1);
  },
  beforeDestroy() {
    this.listRequestId += 1;
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
        this.tableConfig = {
          tbodyList: [],
          rowNum: 0,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          ...result
        };
        this.oldList = (this.tableConfig.tbodyList || []).slice();
      }).catch(error => {
        if (requestId !== this.listRequestId) {
          return;
        }
        this.tableConfig = { tbodyList: [] };
        this.oldList = [];
        this.$Message.error((error && (error.Message || error.message)) || '工作台模板加载失败');
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
    deleteWorkbenchTemplate(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: row.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.common.deleteWorkbench(row.id, this.moduleGroup, this.workbenchType).then(res => {
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
      const previousValue = row.isActive === 1 ? 0 : 1;
      this.$api.common.updateWorkbenchActive(row.id, row.isActive, this.moduleGroup, this.workbenchType).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '工作台状态更新失败');
        }
        this.oldList = (this.tableConfig.tbodyList || []).slice();
        this.$Message.success(this.$t('message.executesuccess'));
      }).catch(error => {
        this.$set(row, 'isActive', previousValue);
        this.$Message.error((error && (error.Message || error.message)) || '工作台状态更新失败');
      });
    },
    handleDragUpdate({ oldIndex, newIndex }) {
      const source = this.oldList[oldIndex];
      const target = this.oldList[newIndex];
      if (!source || !target || oldIndex === newIndex) {
        return;
      }
      this.$api.common.moveWorkbench(source.id, target.sort, this.moduleGroup, this.workbenchType).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '工作台排序失败');
        }
        this.$Message.success(this.$t('message.savesuccess'));
      }).catch(error => {
        this.$Message.error((error && (error.Message || error.message)) || '工作台排序失败');
      }).finally(() => {
        this.searchWorkbench(this.currentPage);
      });
    },
    toEdit(id) {
      this.$router.push({
        name: this.editRouteName,
        params: id ? { id } : {},
        query: {
          ...this.editRouteQuery,
          type: this.workbenchType
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
    theadList() {
      const theadList = [
        { title: '名称', key: 'name', width: 220 },
        { title: '状态', key: 'isActive', width: 100 }
      ];
      if (this.workbenchType === WORKBENCH_TYPE_GLOBAL) {
        theadList.push({ title: '适用对象', key: 'authorityVoList', width: 220 });
      }
      theadList.push(
        { title: this.$t('page.createtime'), key: 'fcd', type: 'time', width: 180 },
        { title: this.$t('page.updatetime'), key: 'lcd', type: 'time', width: 180 },
        { key: 'action', width: 260 }
      );
      return theadList;
    }
  },
  watch: {
    moduleGroup(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }
      this.keyword = '';
      this.pageSize = 20;
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
.workbench-table {
  width: 100%;
  min-width: 0;
}

.workbench-scope-tabs {
  min-width: 0;
}

::v-deep .tscontain-body {
  overflow-x: hidden;
}

::v-deep .tstable-container,
::v-deep .tstable-main {
  max-width: 100%;
}

@media screen and (max-width: 1024px) {
  ::v-deep .tscontain-header > div > div:last-child > div {
    grid-template-columns: minmax(0, auto) 0 minmax(180px, 1fr) !important;
  }

  .workbench-search {
    width: 100%;
  }
}
</style>
