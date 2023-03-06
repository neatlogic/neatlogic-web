<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addRow()">{{ $t('page.replytemplate') }}</span>
      </template>
      <template slot="topRight">
        <InputSearcher
          v-model="searchParam.keyword"
          @change="getTableDataSearch(1)"
        ></InputSearcher>
      </template>
      <div slot="content" ref="maintable" class="content">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          @operation="operation"
          @changeCurrent="getPageData"
          @changePageSize="changePageSize"
        >
        </TsTable>
      </div>
    </TsContain>
    <TsDialog
      v-if="editTsDialog.isShow"
      v-bind="editTsDialog"
      :isShow.sync="editTsDialog.isShow"
      @on-close="cancel()"
      @on-ok="save()"
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
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)

  },
  props: {},
  data() {
    const _this = this;
    return {
      loadingShow: false,
      searchParam: {
        keywork: '',
        pageSize: 20,
        currentPage: 1
      },
      theadList: [
        {
          title: this.$t('page.replycontent'),
          key: 'content',
          type: 'linktext',
          textValue: 'view'
        },
        { key: 'action', title: '', type: 'action', operations: [{icon: 'tsfont-trash-o', name: this.$t('button.delete'), action: 'del', type: 'text', style: ''}]}
      ],
      editForm: [
        {
          name: 'id',
          value: null,
          isHidden: true
        },
        {
          type: 'textarea',
          label: this.$t('form.label.replycontent'),
          width: '100%',
          name: 'content',
          validateList: ['required']
        },
        {
          type: 'userselect',
          name: 'authList',
          label: this.$t('page.auth'),
          width: '100%',
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
      this.editTsDialog.title = this.$t('page.add');
    },
    operation(row, view) {
      if (view == 'view') {
        this.editRow(row);
      }
      if (row == 'del') {
        this.deleteRow(view.id);
      }
    },
    editRow(data) {
      this.editTsDialog.isShow = true;
      this.editTsDialog.title = this.$t('page.edit');
      this.editForm.forEach(item => {
        item.value = data[item.name];
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
          const data = Object.assign({ type: 'system' }, this.$refs.editForm.getFormValue());
          this.$api.process.reply.save(data).then(res => {
            this.saving = false;
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.content.savesuccess'));
              this.editTsDialog.isShow = false;
              this.getTableDataSearch();
            }
          }).catch(error => {
            this.saving = false;
          });
        }
      }
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
