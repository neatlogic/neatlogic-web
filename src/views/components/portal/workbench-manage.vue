<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item tsfont-plus text-action" @click="toEdit()">{{ $t('page.config') }}</span>
          <span v-auth="['PORTAL_WIDGET_MANAGE']" class="action-item tsfont-setting text-action" @click="openComponentManageDialog">组件管理</span>
        </div>
      </template>
      <template v-slot:topRight>
        <InputSearcher v-model="keyword" @change="searchWorkbench(1)"></InputSearcher>
      </template>
      <template v-slot:content>
        <TsTable
          v-bind="tableConfig"
          :theadList="theadList"
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
            <div v-if="row.isActive == 1" class="text-success">{{ $t('page.enable') }}</div>
            <div v-else class="text-grey">{{ $t('page.disable') }}</div>
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
      </template>
    </TsContain>
    <WorkbenchComponentManageDialog
      v-if="isShowComponentManageDialog"
      @close="isShowComponentManageDialog = false"
    ></WorkbenchComponentManageDialog>
  </div>
</template>

<script>
import WorkbenchComponentManageDialog from './components/workbench-component-manage-dialog.vue';

export default {
  name: 'PortalWorkbenchManage',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    GroupList: () => import('@/resources/components/GroupList/GroupList.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    WorkbenchComponentManageDialog
  },
  data() {
    return {
      keyword: '',
      pageSize: 20,
      currentPage: 1,
      theadList: [
        { title: '名称', key: 'name' },
        { title: '状态', key: 'isActive' },
        { title: '适用对象', key: 'authorityVoList' },
        { title: this.$t('page.createtime'), key: 'fcd', type: 'time' },
        { title: this.$t('page.updatetime'), key: 'lcd', type: 'time' },
        { key: 'action' }
      ],
      tableConfig: {
        tbodyList: []
      },
      oldList: [],
      isShowComponentManageDialog: false
    };
  },
  created() {
    this.searchWorkbench(1);
  },
  methods: {
    searchWorkbench(currentPage) {
      this.currentPage = currentPage || 1;
      this.$set(this.tableConfig, 'loading', true);
      this.$api.common.searchWorkbenchList({
        keyword: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize
      }).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '工作台模板加载失败');
        }
        const result = res.Return || {};
        this.tableConfig = {
          tbodyList: [],
          rowNum: 0,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          ...result,
          loading: false
        };
        this.oldList = (this.tableConfig.tbodyList || []).slice();
      }).catch(error => {
        this.tableConfig = { tbodyList: [], loading: false };
        this.oldList = [];
        this.$Message.error((error && (error.Message || error.message)) || '工作台模板加载失败');
      }).finally(() => {
        this.$set(this.tableConfig, 'loading', false);
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
          this.$api.common.deleteWorkbench(row.id).then(res => {
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
      this.$api.common.updateWorkbenchActive(row.id, row.isActive).then(res => {
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
      this.$api.common.moveWorkbench(source.id, target.sort).then(res => {
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
        name: 'workbench-edit',
        params: id ? { id } : {}
      });
    },
    openComponentManageDialog() {
      this.isShowComponentManageDialog = true;
    }
  }
};
</script>
