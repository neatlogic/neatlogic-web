<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addRow()">{{ $t('page.template') }}</span>
      </template>
      <template slot="topRight">
        <div style="text-align:right;" :style="{'--children':3}" class="controller-group">
          <TsformSelect v-model="type" v-bind="typeConfig" @on-change="handleTypeChange" />
          <InputSearcher
            v-model="searchParam.keyword"
            @change="() => getTableDataSearch(1)"
          ></InputSearcher>
        </div>
      </template>
      <div slot="content" ref="maintable" class="content">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          @operation="operation"
          @changeCurrent="getPageData"
          @changePageSize="changePageSize"
        >
          <template slot="type" slot-scope="{ row }"> 
            {{ row.type == 'custom' ? $t('page.personal') : $t('page.system') }}
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul v-if="row.isEditable == 1" class="tstable-action-ul">
                <li class="tsfont-trash-o icon" @click="deleteRow(row.id)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <TsDialog
      v-if="editTsDialog.isShow"
      v-bind="editTsDialog"
      type="slider"
      :isShow.sync="editTsDialog.isShow"
    >
      <template v-slot>
        <TsForm ref="editForm" :itemList="editForm" labelPosition="right"></TsForm>
      </template>
      <template v-slot:footer>
        <div v-if="isShowConfirm">
          <Button @click="cancel()">{{ $t('page.cancel') }}</Button>
          <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
        </div>
        <div v-else>
          <Button type="primary" @click="cancel()">{{ $t('page.close') }}</Button>
        </div>
      </template>
    </TsDialog>
  </div>
</template>

<script>
import TsTable from '@/resources/components/TsTable/TsTable.vue';
import TsForm from '@/resources/plugins/TsForm/TsForm';

export default {
  name: 'ReplyManage',
  components: {
    TsTable,
    TsForm,
    TsformSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)

  },
  props: {},
  data() {
    return {
      loadingShow: false,
      type: 'all',
      isShowConfirm: true,
      typeConfig: Object.freeze({
        value: 'all',
        clearable: false,
        border: 'border',
        dataList: [
          { value: 'system', text: this.$t('page.system') },
          { value: 'custom', text: this.$t('page.personal') },
          { value: 'all', text: this.$t('page.all') }
        ],
        validateList: ['required']
      }),
      searchParam: {
        keyword: '',
        type: null,
        pageSize: 20,
        currentPage: 1
      },
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name',
          type: 'linktext',
          textValue: 'view'
        },
        {
          title: this.$t('page.type'),
          key: 'type',
          type: 'text',
          textValue: 'view',
          validateList: ['required']
        },
        {
          title: '',
          key: 'action',
          width: 10,
          align: 'right'
        }
      ],
      editForm: [
        {
          name: 'id',
          value: null,
          isHidden: true
        },
        {
          type: 'text',
          label: this.$t('page.name'),
          width: '100%',
          name: 'name',
          validateList: ['required',
            { 
              name: 'searchUrl', 
              url: '/api/rest/process/comment/template/save', 
              key: 'name', 
              message: this.$t('message.targetisexists', {target: this.$t('page.template')}), 
              params: { id: '' } 
            }]
        },
        {
          type: 'radio',
          name: 'type',
          label: this.$t('page.type'),
          width: '100%',
          value: 'system',
          disabled: false,
          validateList: ['required'],
          dataList: [
            {
              text: this.$t('page.personal'),
              value: 'custom'
            },
            {
              text: this.$t('page.system'),
              value: 'system'
            }
          ],
          onChange: (val) => {
            this.changeType(val);
          }
        },
        {
          type: 'ckeditor',
          label: this.$t('page.content'),
          width: '100%',
          name: 'content',
          validateList: ['required']
        }
      ],
      systemTypeFrom: 
        {
          type: 'userselect',
          name: 'authList',
          label: this.$t('page.useauth'),
          width: '100%',
          groupList: ['common', 'user', 'role', 'team'],
          validateList: ['required'],
          transfer: true
        },      
      tableData: null,
      editTsDialog: {
        type: 'modal',
        title: '',
        isShow: false,
        width: '700px'
      },
      saving: false
    };
  },

  beforeCreate() {},

  created() {
    if (this.$route.query.id) {
      this.getDataById(this.$route.query.id);
    }
  },

  beforeMount() {},

  mounted() {
    this.getTableDataSearch(1);
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    getDataById(id) {
      const data = { id: id };
      this.$api.process.reply.get(data).then(res => {
        this.editRow(res.Return.template);
      });
    },
    addRow() {
      this.editTsDialog.isShow = true;
      this.editTsDialog.title = this.$t('dialog.title.addtarget', {'target': this.$t('page.template')});
      let hasModifyAuthority = this.$AuthUtils.hasRole('PROCESS_COMMENT_TEMPLATE_MODIFY');
      this.editForm.forEach(item => {
        item.readonly = false;
        if (item.name == 'type') {
          if (!hasModifyAuthority) {
            item.disabled = true;
            item.value = 'custom';
          } else {
            item.value = 'system';
          }
        }
      });
      let authListIndex = this.editForm.findIndex(item => item.name == 'authList');
      if (authListIndex >= 0 && !hasModifyAuthority) {
        this.editForm.splice(authListIndex, 1);
      } else if (authListIndex == -1 && hasModifyAuthority) {
        this.editForm.splice(3, 0, this.systemTypeFrom);
      }
    },
    operation(row, action) {
      if (action == 'view') {
        this.getDataById(row.id);
      }
      if (action == 'del') {
        this.deleteRow(row.id);
      }
    },
    editRow(data) {
      this.editTsDialog.isShow = true;
      this.editTsDialog.title = this.$t('dialog.title.edittarget', {'target': this.$t('page.template')});
      let hasModifyAuthority = this.$AuthUtils.hasRole('PROCESS_COMMENT_TEMPLATE_MODIFY');
      
      let index = this.editForm.findIndex(item => item.name == 'authList');
      if (data.type == 'system' && index == -1) {
        this.editForm.splice(3, 0, this.systemTypeFrom);
      }
      if (data.type == 'custom' && index >= 0) {
        this.editForm.splice(index, 1);
      }
      if (data['type'] == 'system' && !hasModifyAuthority) {
        this.isShowConfirm = false;
      } else {
        this.isShowConfirm = true;
      }
      this.editForm.forEach(item => {
        item.value = data[item.name];
        if (data['type'] == 'system' && !hasModifyAuthority) {
          item.readonly = true;
        } else {
          item.readonly = false;
        }
        if (data['type'] == 'custom' && !hasModifyAuthority && item.name == 'type') {
          item.disabled = true;
        } 
      });
    },
    deleteRow(id) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.template')}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = { id: id };
          this.$api.process.reply
            .delete(data)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.getTableDataSearch(1);
                vnode.isShow = false;
              }
            });
        }
      });
    },
    getTableDataSearch(currentPage, pageSize) {
      this.loadingShow = true;
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      if (pageSize) {
        this.searchParam.pageSize = pageSize;
      }
      this.$api.process.reply.search(this.searchParam).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.tableData.theadList = this.theadList;
          this.loadingShow = false;
        }
      });
    },
    //翻页
    getPageData(currentPage) {
      this.getTableDataSearch(currentPage);
    },
    // 改变页数
    changePageSize(size) {
      this.searchParam.currentPage = 1;
      this.searchParam.pageSize = size;
      this.getTableDataSearch();
    },
    cancel() {
      this.editTsDialog.isShow = false;
    },
    save() {
      if (this.$refs.editForm.valid()) {
        if (!this.saving) {
          this.saving = true;
          this.$api.process.reply.save(this.$refs.editForm.getFormValue()).then(res => {
            this.saving = false;
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              this.editTsDialog.isShow = false;
              this.getTableDataSearch();
            }
          }).catch(error => {
            this.saving = false;
          });
        }
      }
    },
    changeType(type) {
      let index = this.editForm.findIndex(item => item.name == 'authList');
      if (type == 'system' && index == -1) {
        this.editForm.splice(3, 0, this.systemTypeFrom);
      }
      if (type == 'custom' && index >= 0) {
        this.editForm.splice(index, 1);
      }
    },
    handleTypeChange(type) {
      if (type == 'all') {
        this.searchParam.type = null;
      } else {
        this.searchParam.type = type;
      }
      this.searchParam.currentPage = 1;
      this.searchParam.pageSize = 20;
      this.getTableDataSearch();
    },
    isHasModifyAuthority() {
      return this.$AuthUtils.hasRole('PROCESS_COMMENT_TEMPLATE_MODIFY');
    }
  },

  filter: {},

  computed: {},

  watch: {
    'editTsDialog.isShow'(val) {
      if (!val) {
        this.$refs.editForm.clearForm();
      }
    }
  }
};
</script>
<style lang='less'>
</style>
