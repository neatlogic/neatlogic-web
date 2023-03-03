<!-- 处理页回复模板管理 -->
<template>
  <div class="reply-manage">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <div class="text-action tsfont-plus" @click="addRow()">回复模板</div>
      </template>
      <template slot="topRight">
        <TsFormInput
          v-model="searchParam.keyword"
          search
          placeholder="关键字"
          clearable
          @on-enter="getTableDataSearch(1)"
          @on-clear="getTableDataSearch(1)"
        ></TsFormInput>
      </template>
      <div slot="content" ref="maintable" class="content">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          @changeCurrent="getPageData"
          @changePageSize="changePageSize"
          @clickTr="selectRow"
        >
          <template slot="content" slot-scope="{ row }">
            <div class="text-href" @click="selectRow(row)" v-html="row.content"></div>
          </template>
          <template v-if="row.isEditable" slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit icon" @click="editRow(row)">{{ $t('button.add') }}</li>
                <li class="tsfont-trash-o icon" @click="deleteRow(row.id)">{{ $t('button.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <TsDialog
      v-if="editTsDialog.isShow"
      v-bind="editTsDialog"
      :isShow.sync="editTsDialog.isShow"
      @on-close="cancel"
      @on-ok="save"
    >
      <template v-slot>
        <TsForm ref="editForm" :itemList="editForm" labelPosition="right"></TsForm>
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
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    const _this = this;
    return {
      loadingShow: false,
      searchParam: {
        keywork: '',
        pageSize: 10,
        currentPage: 1
      },
      theadList: [
        {
          title: '回复内容',
          key: 'content'
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
          type: 'textarea',
          label: '回复内容',
          name: 'content',
          validateList: ['required']
        },
        {
          type: 'userselect',
          name: 'authList',
          label: '授权',
          groupList: ['user', 'role', 'team'],
          validateList: ['required'],
          transfer: true
        }
      ],
      tableData: null,
      editTsDialog: {
        type: 'modal',
        title: '',
        isShow: false,
        width: '700px'
      },
      replyType: 'custom'
    };
  },

  beforeCreate() {},

  created() {},

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
    addRow() {
      this.editTsDialog.isShow = true;
      this.editTsDialog.title = '添加模板';
      this.editForm[2].isHidden = true;
      this.replyType = 'custom';
    },
    editRow(data) {
      this.getData(data.id);
      this.editTsDialog.isShow = true;
      this.editTsDialog.title = '编辑模板';
    },
    getData(id) {
      const data = {
        id: id
      };
      this.$api.process.reply.get(data).then(res => {
        if (res.Status == 'OK') {
          const data = res.Return.template;
          this.editForm.forEach(item => {
            item.value = data[item.name];
          });
          this.replyType = data.type;
          if (data.type == 'custom') {
            this.editForm[2].isHidden = true;
          } else {
            this.editForm[2].isHidden = false;
          }
        }
      });
    },
    deleteRow(id) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.replytemplate')}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = { id: id };
          this.$api.process.reply
            .delete(data)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.content.deletesuccess'));
                this.getTableDataSearch();
                vnode.isShow = false;
              }
            })
            .catch(error => {
              if (error.data.Message) {
                this.$Message.error('删除失败：' + error.data.Message);
              } else {
                this.$Message.error('接口请求错误');
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
      this.$api.process.reply.searchFortask(this.searchParam).then(res => {
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
      this.searchParam.pageSize = size;
      this.getTableDataSearch();
    },
    cancel() {
      this.editTsDialog.isShow = false;
    },
    save() {
      if (this.$refs.editForm.valid()) {
        const data = Object.assign({ type: this.replyType }, this.$refs.editForm.getFormValue());
        this.$api.process.reply.save(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.editTsDialog.isShow = false;
            this.getTableDataSearch();
            if (this.content == '') {
              const obj = {
                id: res.Return.id,
                content: data.content
              };
              this.$emit('selectTemplate', obj);
            }
          }
        });
      }
    },
    selectRow(val) {
      this.$emit('selectTemplate', val);
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
<style lang='less' scoped>
/deep/ .tscontain-container {
  .tscontain-body {
    min-height: 200px;
    max-height: 410px;
    height: 100%;
  }
}
.content{
  padding-bottom: 16px;
}
</style>
