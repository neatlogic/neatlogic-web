<template>
  <div class="scene-definition-manage-box">
    <Loading :loadingShow="isShowLoading" type="fix"></Loading>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addSceneDefinition">{{ $t('page.scene') }}</span>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="keyword"
            @change="getTableList(1)"
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsTable
            v-bind="tableConfig"
            @operation="operation"
            @changeCurrent="getTableList"
            @changePageSize="getTableList(1, ...arguments)"
          >
            <template slot="description" slot-scope="{row}">
              <span
                class="overflow scene-description-text"
                :title="row.description"
              >{{ row.description }}</span>
            </template>
            <template slot="action" slot-scope="{row}">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li
                    class="icon tsfont-trash-o"
                    @click.stop="deleteSceneDefinition(row)"
                  >{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
    
      </template>
    </TsContain>

    <TsDialog
      :title="dialogTitle"
      :isShow.sync="isShowDialog"
      type="modal"
      :okText="$t('page.save')"
      @on-ok="okDialog"
      @on-cancel="closeDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="form"
            v-model="formValue"
            :item-list="sceneForm"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'SceneDefinitionManage', // 场景定义
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {},
  data() {
    return {
      keyword: '', // 搜索关键字
      dialogTitle: '', 
      isShowDialog: false,
      isShowLoading: false,
      formValue: {},
      sceneForm: {
        id: {
          label: '#id',
          type: 'text',
          isHidden: true
        },
        name: {
          label: this.$t('page.name'),
          type: 'text',
          validateList: [
            'required',
            'name-special', 
            { name: 'searchUrl',
              url: '/api/rest/autoexec/scenario/save', 
              key: 'name',
              message: this.$t('message.targetisexists', {target: this.$t('page.name')}),
              params: { id: ''}
            }],
          maxlength: '50'
        },
        description: {
          label: this.$t('page.description'),
          type: 'textarea',
          maxlength: '500'
        }
      },
      tableConfig: {
        theadList: [
          { title: this.$t('page.name'), key: 'name', type: 'linktext', textValue: 'edit'},
          { title: this.$t('page.description'), key: 'description'},
          { title: this.$t('page.fcu'), key: 'lcu', type: 'user'},
          { title: this.$t('page.fcd'), key: 'lcd', type: 'time'},
          { title: ' ', key: 'action' }
        ],
        tbodyList: [],
        currentPage: 1,
        pageSize: 20
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getTableList();
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
    getTableList(currentPage, pageSize) {
      // 获取列表
      let params = {
        keyword: this.keyword,
        currentPage: currentPage || this.tableConfig.currentPage,
        pageSize: pageSize || this.tableConfig.pageSize
      };
      this.tableConfig.pageSize = pageSize || this.tableConfig.pageSize;
      this.isShowLoading = true;
      this.$api.autoexec.scenario.getSceneDefinitionList(params).then((res) => {
        if (res.Status == 'OK') {
          this.isShowLoading = false;
          Object.assign(this.tableConfig, res.Return);
        }
      }).catch(() => {
        this.isShowLoading = false;
      });
    },
    okDialog() {
      let form = this.$refs.form;
      if (!form.valid()) {
        return false;
      }
      this.$api.autoexec.scenario.saveSceneDefinition(this.formValue).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.isShowDialog = false;
          this.getTableList();
        }
      });
    },
    addSceneDefinition() {
      // 添加场景定义
      this.dialogTitle = this.$t('dialog.title.addtarget', {target: this.$t('page.scene')});
      this.isShowDialog = true;
    },
    deleteSceneDefinition(row) {
      // 删除场景定义
      if (row && !row.id) {
        return false;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: row && row.referredCount ? this.$t('page.deletetarget', {target: this.$t('page.scene')}) : this.$t('dialog.content.deleteconfirm', {target: this.$t('page.scene')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.scenario.deleteSceneDefinitionById(row.id).then((res) => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.getTableList(1);
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    operation(row, type) {
      // 编辑
      if (type == 'edit' && row) {
        this.formValue = {
          id: row.id,
          name: row.name,
          description: row.description
        };
        this.isShowDialog = true;
        this.dialogTitle = this.$t('dialog.title.edittarget', {target: this.$t('page.scene')});
        this.handleValidSelfName(row.id);
      }
    },
    closeDialog() {
      this.formValue = {};
      this.isShowDialog = false;
    },
    handleValidSelfName(id = null) {
      // 编辑名称时，名称改回自身，不需要校验
      if (this.sceneForm && this.sceneForm.hasOwnProperty('name')) {
        this.sceneForm['name'].validateList.forEach((item) => {
          if (item && item.hasOwnProperty('params')) {
            item.params.id = id || '';
          }
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
.scene-definition-manage-box {
  .scene-description-text {
    display: inline-block;
    width: 500px;
  }
}
</style>
