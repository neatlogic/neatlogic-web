<template>
  <TsDialog
    :isShow="true"
    width="medium"
    :title="$t('term.workbench.widgetmanagement')"
    :hasFooter="false"
    :maskClose="false"
    @on-close="close"
  >
    <div class="workbench-component-manage">
      <div v-if="errorMessage" class="padding-lg text-center">
        <NoData :text="errorMessage"></NoData>
        <div class="text-action pt-sm cursor-pointer" @click="loadComponentList">{{ $t('page.retry') }}</div>
      </div>
      <template v-else>
        <div class="flex-between align-center pb-md">
          <Button
            type="primary"
            :disabled="!selectedComponentList.length"
            @click="openBatchAuthDialog"
          >
            {{ $t('term.workbench.batchauthorization') }}
          </Button>
          <TsFormInput
            v-model="keyword"
            search
            clearable
            width="240"
            :disabled="tableConfig.loading"
            :placeholder="$t('term.workbench.enterwidgetname')"
          ></TsFormInput>
        </div>
        <TsTable
          v-model="selectedNameList"
          v-bind="filteredTableConfig"
          :theadList="theadList"
          keyName="name"
          selectedRemain
          :height="400"
          @getSelected="getSelected"
        >
          <template v-slot:moduleGroup="{ row }">
            {{ row.moduleGroup.groupName || '-' }}
          </template>
          <template v-slot:authorityVoList="{ row }">
            <GroupList :dataList="row.authorityVoList || []"></GroupList>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-permission" @click.stop="openAuthDialog(row)">{{ $t('term.workbench.authorization') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
      <WorkbenchComponentAuthDialog
        v-if="currentComponent"
        :componentData="currentComponent"
        :moduleGroup="moduleGroup"
        :workbenchType="workbenchType"
        @close="closeAuthDialog"
      ></WorkbenchComponentAuthDialog>
      <WorkbenchComponentBatchAuthDialog
        v-if="showBatchAuthDialog"
        :componentList="selectedComponentList"
        @close="closeBatchAuthDialog"
      ></WorkbenchComponentBatchAuthDialog>
    </div>
  </TsDialog>
</template>

<script>
import { WORKBENCH_TYPE_GLOBAL } from '../workbench-constants.js';

export default {
  name: 'PortalWorkbenchComponentManageDialog',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    GroupList: () => import('@/resources/components/GroupList/GroupList.vue'),
    WorkbenchComponentAuthDialog: () => import('./workbench-component-auth-dialog.vue'),
    WorkbenchComponentBatchAuthDialog: () => import('./workbench-component-batch-auth-dialog.vue')
  },
  props: {
    moduleGroup: { type: String, default: '' },
    workbenchType: { type: String, default: WORKBENCH_TYPE_GLOBAL }
  },
  data() {
    return {
      theadList: [
        { key: 'selection', multiple: true },
        { title: this.$t('term.workbench.widgetname'), key: 'label' },
        { title: this.$t('term.workbench.owningmodule'), key: 'moduleGroup' },
        { title: this.$t('term.workbench.permission'), key: 'authorityVoList' },
        { key: 'action' }
      ],
      tableConfig: {
        tbodyList: [],
        loading: false
      },
      errorMessage: '',
      keyword: '',
      componentList: [],
      currentComponent: null,
      selectedNameList: [],
      selectedComponentList: [],
      showBatchAuthDialog: false
    };
  },
  created() {
    this.loadComponentList();
  },
  methods: {
    loadComponentList() {
      this.resetSelection();
      this.errorMessage = '';
      this.$set(this.tableConfig, 'loading', true);
      this.$api.common.searchWorkbenchWidgetManageList({
        currentPage: 1,
        pageSize: 1000,
        moduleGroup: this.moduleGroup,
        type: this.workbenchType
      }).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || this.$t('term.workbench.widgetlistloadfailed'));
        }
        const result = res.Return || {};
        this.componentList = result.tbodyList || [];
        this.tableConfig = {
          ...result,
          tbodyList: this.componentList,
          loading: false
        };
      }).catch(error => {
        this.componentList = [];
        this.tableConfig = { tbodyList: [] };
        this.errorMessage = (error && (error.Message || error.message)) || this.$t('term.workbench.widgetlistloadfailed');
      }).finally(() => {
        this.$set(this.tableConfig, 'loading', false);
      });
    },
    openAuthDialog(row) {
      this.currentComponent = row;
    },
    getSelected(nameList, componentList) {
      this.selectedNameList = (nameList || []).slice();
      this.selectedComponentList = (componentList || []).slice();
    },
    openBatchAuthDialog() {
      if (this.selectedComponentList.length) {
        this.showBatchAuthDialog = true;
      }
    },
    closeAuthDialog(needRefresh) {
      this.currentComponent = null;
      if (needRefresh) {
        this.loadComponentList();
      }
    },
    closeBatchAuthDialog(needRefresh) {
      this.showBatchAuthDialog = false;
      if (needRefresh) {
        this.loadComponentList();
      }
    },
    resetSelection() {
      this.selectedNameList = [];
      this.selectedComponentList = [];
    },
    close() {
      this.resetSelection();
      this.$emit('close');
    }
  },
  computed: {
    filteredTableConfig() {
      const keyword = this.keyword.trim().toLowerCase();
      const tbodyList = keyword
        ? this.componentList.filter(item => {
          const label = item.label || '';
          const name = item.name || '';
          return label.toLowerCase().includes(keyword) || name.toLowerCase().includes(keyword);
        })
        : this.componentList;
      return {
        ...this.tableConfig,
        tbodyList
      };
    }
  }
};
</script>
