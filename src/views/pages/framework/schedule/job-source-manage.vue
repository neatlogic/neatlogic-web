<!-- 作业来源管理独立组件：负责来源查询、勾选、服务器组编辑和来源删除。 -->
<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <!-- 批量按钮和搜索器由父页面工具栏展示，本组件只渲染来源表格和编辑弹窗。 -->
    <TsTable
      v-if="sourceTableData"
      keyName="sourceKey"
      :theadList="theadList"
      v-bind="sourceTableData"
      hight="600"
      @getSelected="getSelectedSource"
      @changeCurrent="changePage"
      @changePageSize="changePageSize"
    >
      <!-- <template slot="handlerName" slot-scope="{ row }">
        <span>{{ row.handlerName || row.jobGroup || '-' }}</span>
      </template> -->
      <!-- <template slot="serverGroup" slot-scope="{ row }">
        <span>{{ row.serverGroup || '-' }}</span>
      </template> -->
      <template slot="action" slot-scope="{ row }">
        <!-- 只允许编辑服务器组或删除来源，避免修改复合主键破坏调度关联。 -->
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="tsfont-edit" @click="openSourceGroupDialog([row])">{{ $t('page.edit') }}</li>
            <!-- <li class="tsfont-trash-o" @click="deleteJobSource(row)">{{ $t('page.delete') }}</li> -->
          </ul>
        </div>
      </template>
    </TsTable>
    <!-- 单行编辑和批量编辑共用服务器组表单，表单控件来自指定TsForm参考目录。 -->
    <TsDialog
      type="modal"
      :isShow.sync="isSourceGroupDialogShow"
      :title="sourceGroupDialogTitle"
      @on-close="closeSourceGroupDialog"
      @on-ok="saveSourceServerGroup"
    >
      <TsForm
        ref="sourceGroupForm"
        v-model="sourceGroupFormData"
        :itemList="sourceGroupFormSetting"
        type="type"
        labelPosition="right"
      ></TsForm>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'JobSourceManage',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    // 服务器组编辑使用指定参考目录支持的TsForm表单控件。
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    // 搜索条件由父页面CombineSearcher维护，子组件只读取关键字并调用来源接口。
    searchVal: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loadingShow: false,
      pageSize: 20,
      // 来源表第一列为多选框，后续列对应schedule_job_source及其作业显示信息。
      theadList: [
        {
          key: 'selection',
          multiple: true
        },
        {
          title: this.$t('page.name'),
          key: 'jobName'
        },
        {
          title: this.$t('page.jobgroupname'),
          key: 'jobGroup'
        },
        {
          title: this.$t('term.autoexec.jobmodule'),
          key: 'handlerName'
        },
        {
          title: this.$t('page.server') + 'ID',
          key: 'serverId'
        },
        {
          title: this.$t('page.servergroup'),
          key: 'serverGroup'
        },
        {
          title: ' ',
          key: 'action',
          width: 10,
          align: 'right'
        }
      ],
      sourceTableData: null,
      selectedSourceList: [],
      isSourceGroupDialogShow: false,
      editingSourceList: [],
      sourceGroupFormData: {
        serverGroup: null
      },
      sourceSearchParam: {
        currentPage: 1,
        pageSize: 20
      }
    };
  },
  mounted() {
    // 组件在切换到作业来源页签时挂载并独立加载第一页数据。
    this.searchJobSource(1);
  },
  methods: {
    // 查询作业来源，并增加仅供前端勾选识别的复合键。
    searchJobSource(currentPage, pageSize) {
      if (currentPage) {
        this.sourceSearchParam.currentPage = currentPage;
      }
      this.sourceSearchParam.pageSize = pageSize || this.pageSize;
      this.sourceSearchParam.keyword = this.searchVal.keyword || this.searchVal.searchWord || null;
      // 先卸载旧表格实例，同时清除TsTable内部保留的勾选状态。
      this.sourceTableData = null;
      this.selectedSourceList = [];
      this.$emit('selection-change', []);
      this.loadingShow = true;
      this.$api.framework.schedule.searchJobSource(this.sourceSearchParam).then(res => {
        if (res.Status == 'OK') {
          const result = res.Return || {};
          this.sourceTableData = {
            ...result,
            tbodyList: (result.tbodyList || []).map(row => ({
              ...row,
              sourceKey: JSON.stringify([row.jobName, row.jobGroup])
            }))
          };
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    // TsTable的第二个回调参数是所选行完整数据，批量修改直接使用这些行。
    getSelectedSource(selectedKeyList, selectedItemList) {
      this.selectedSourceList = selectedItemList || [];
      // 将完整勾选行同步给父页面，父页面据此展示批量按钮并触发本组件弹窗。
      this.$emit('selection-change', this.selectedSourceList);
    },
    // 分页由独立组件维护，避免影响配置作业和已加载作业的页码。
    changePage(currentPage) {
      this.searchJobSource(currentPage);
    },
    // 修改每页条数后从第一页重新查询作业来源。
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.searchJobSource(1, pageSize);
    },
    // 打开单行或批量服务器组编辑弹窗，仅保留后端更新所需的复合主键。
    openSourceGroupDialog(sourceList) {
      this.editingSourceList = (sourceList || []).map(row => ({
        jobName: row.jobName,
        jobGroup: row.jobGroup
      }));
      this.sourceGroupFormData = {
        serverGroup: sourceList && sourceList.length === 1 ? sourceList[0].serverGroup : null
      };
      this.isSourceGroupDialogShow = true;
    },
    // 关闭弹窗时清理编辑上下文，防止下一次编辑沿用旧数据。
    closeSourceGroupDialog() {
      this.isSourceGroupDialogShow = false;
      this.editingSourceList = [];
      this.sourceGroupFormData = {
        serverGroup: null
      };
    },
    // 单行和批量更新统一调用复合主键批量更新接口。
    saveSourceServerGroup() {
      const form = this.$refs.sourceGroupForm;
      if (!form || !form.valid()) {
        return;
      }
      const formValue = form.getFormValue();
      this.$api.framework.schedule.updateJobSourceServerGroup({
        jobSourceList: this.editingSourceList,
        serverGroup: formValue.serverGroup || null
      }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeSourceGroupDialog();
          this.searchJobSource(this.sourceSearchParam.currentPage);
        }
      });
    }//,
    // 删除来源记录不会删除作业配置，确认文案使用当前行显示名称便于核对。
    // deleteJobSource(row) {
    //   this.$createDialog({
    //     title: this.$t('dialog.title.deleteconfirm'),
    //     content: this.$t('dialog.content.deletetargetconfirm', {target: row.name || row.jobName}),
    //     btnType: 'error',
    //     'on-ok': vnode => {
    //       vnode.isShow = false;
    //       this.$api.framework.schedule.deleteJobSource({
    //         jobName: row.jobName,
    //         jobGroup: row.jobGroup
    //       }).then(res => {
    //         if (res.Status == 'OK') {
    //           this.$Message.success(this.$t('message.deletesuccess'));
    //           this.searchJobSource(1);
    //         }
    //       });
    //     }
    //   });
    // }
  },
  computed: {
    // 对话框标题区分单行编辑和批量修改场景。
    sourceGroupDialogTitle() {
      return this.editingSourceList.length > 1
        ? '批量修改服务器组'
        : this.$t('page.edit') + this.$t('page.servergroup');
    },
    // 服务器组使用指定控件目录提供的TsFormInput，并与数据库varchar(100)字段保持相同长度限制。
    sourceGroupFormSetting() {
      return {
        serverGroup: {
          type: 'text',
          label: this.$t('page.servergroup'),
          maxlength: 100,
          clearable: true,
          forbidContent: '<>&'
        }
      };
    }
  }
};
</script>
