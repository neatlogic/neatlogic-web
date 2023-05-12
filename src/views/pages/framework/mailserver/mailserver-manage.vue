<template>
  <div class="MailServerManagement">
    <Loading :loading-show="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <div class="text-action tsfont-plus" @click="addRow()">{{ $t('page.server') }}</div>
      </template>
      <template slot="topRight">
        <TsFormInput
          v-model="searchParam.keyword"
          search
          :placeholder="$t('page.keyword')"
          clearable
          @on-enter="getTableDataSearch(1)"
          @on-clear="getTableDataSearch(1)"
        ></TsFormInput>
      </template>
      <div slot="content" ref="maintable">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          @changeCurrent="getPageData"
          @changePageSize="changePageSize"
        >
          <template slot="name" slot-scope="{ row }">
            <div :style="{ color: row.color ? row.color : '' }">{{ row.name }}</div>
          </template>
          <template slot="password" slot-scope="{ row }">
            <PasswordRow :value="row.password"></PasswordRow>
          </template>
          <template slot="isActive" slot-scope="{ row }">
            <div>{{ row.isActive == 1 ? $t('page.enable') : $t('page.disable') }}</div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li>
                  <i-switch
                    v-model="row.isActive"
                    :true-value="1"
                    :false-value="0"
                    @on-change="activeRow(row.isActive,row.uuid)"
                  ></i-switch>
                  <span class="actionText" v-html="row.isActive == 1 ? $t('page.enable') : $t('page.disable')"></span>
                </li>
                <li class="tsfont-edit icon" @click="editRow(row.uuid)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o icon" @click="deleteRow(row.uuid, row.name)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <TsDialog
      v-bind="editTsDialog"
      :is-show.sync="editTsDialog.isShow"
      @on-close="cancelEditRow"
      @on-ok="saveEditRow"
    >
      <template v-slot>
        <div class="editForm">
          <TsForm
            ref="mainForm"
            :item-list="formSetting"
            type="type"
            label-postion="right"
          > </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsTable from '@/resources/components/TsTable/TsTable.vue';
import TsForm from '@/resources/plugins/TsForm/TsForm';
import PasswordRow from './password-row';
export default {
  name: '',
  components: {
    TsTable,
    TsForm,
    PasswordRow,
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  filters: {},
  props: [],
  data() {
    let _this = this;
    return {
      loadingShow: true,
      tableheight: 0,
      pageSize: 20,
      theadList: [
        { title: this.$t('page.name'), key: 'name', minWidth: 300, resizable: true },
        { title: this.$t('term.framework.smtphost'), key: 'host', minWidth: 300, resizable: true },
        { title: this.$t('term.framework.smptport'), key: 'port', minWidth: 300, resizable: true },
        {
          title: this.$t('page.emailaddress'),
          key: 'fromAddress',
          minWidth: 300,
          resizable: true
        },
        { title: this.$t('page.user'), key: 'userName', minWidth: 300, resizable: true },
        { title: this.$t('page.password'), key: 'password', minWidth: 300, resizable: true },
        { title: this.$t('page.domain'), key: 'domain', minWidth: 300, resizable: true },
        { title: this.$t('page.status'), key: 'isActive', minWidth: 300, resizable: true },
        { title: ' ', key: 'action', align: 'right', width: 10 }
      ],
      tableData: null,
      editTsDialog: {
        type: 'modal',
        title: '',
        maskClose: false,
        isShow: false,
        width: '700px'
      },
      formSetting: [
        {
          type: 'text',
          name: 'uuid',
          value: null,
          defaultValue: null,
          isHidden: true,
          label: this.$t('page.primarykey')
        },
        {
          type: 'text',
          name: 'name',
          value: '',
          defaultValue: '',
          maxlength: 30,
          width: 200,
          label: this.$t('page.name'),
          validateList: ['required']
        },
        {
          name: 'host',
          type: 'text',
          label: this.$t('term.framework.smtphost'),
          validateList: ['required']
        },
        {
          type: 'number',
          name: 'port',
          label: this.$t('term.framework.smptport'),
          value: '',
          defaultValue: '25',
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'fromAddress',
          label: this.$t('page.emailaddress'),
          value: '',
          defaultValue: '',
          validateList: ['required', 'mail']
        },
        {
          type: 'text',
          name: 'userName',
          label: this.$t('page.username'),
          value: '',
          defaultValue: '',
          validateList: ['required', 'mail']
        },
        {
          type: 'password',
          name: 'password',
          label: this.$t('page.password'),
          value: '',
          defaultValue: '',
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'domain',
          label: this.$t('page.domain'),
          value: '',
          defaultValue: ''
        }
      ],
      searchParam: {
        keyword: null,
        currentPage: 1,
        pageSize: 20,
        timestamp: null
      }
    };
  },
  created() {},
  mounted() {
    let _this = this;
    this.getTableDataSearch(1);
    this.settableheight();
    let isCatalogManage = this.$route.query.isCatalogManage;
    if (isCatalogManage == '1') {
      this.addRow();
    }
    window.addEventListener('resize', this.settableheight);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.settableheight);
  },
  methods: {
    getTableDataSearch(currentPage, pageSize) {
      let _this = this;
      if (currentPage) {
        _this.searchParam.currentPage = currentPage;
      }
      if (pageSize) {
        _this.searchParam.pageSize = pageSize;
      } else {
        _this.searchParam.pageSize = this.pageSize;
      }
      _this.searchParam.timestamp = new Date().getTime();
      _this.$api.framework.mailserver
        .search(_this.searchParam)
        .then(res => {
          if (res.Status == 'OK') {
            _this.tableData = res.Return;
            _this.tableData.theadList = _this.theadList;
            this.loadingShow = false;
          }
        });
    },
    //改变页数
    changePageSize(size) {
      this.pageSize = size;
      this.getTableDataSearch();
    },
    getPageData(currentPage) {
      this.getTableDataSearch(currentPage);
    },
    addRow() {
      this.$router.push({
        path: 'mailserver-edit'
      });
      // let _this = this;
      // _this.formSetting.forEach(item => {
      //   item.value = item.defaultValue;
      // });
      // this.editTsDialog.title = '添加服务器';
      // this.editTsDialog.isShow = true;
    },
    getRowData(uuid) {
      let _this = this;
      let params = { uuid: uuid, timestamp: new Date().getTime() };
      _this.$api.framework.mailserver
        .get(params)
        .then(res => {
          if (res.Status == 'OK') {
            _this.formSetting.forEach(item => {
              item.value = res.Return[item.name];
            });
            _this.editTsDialog.isShow = true;
          }
        });
    },
    editRow(uuid) {
      this.editTsDialog.title = this.$t('dialog.title.edittarget', {'target': this.$t('page.server')});
      // this.getRowData(uuid);
      this.$router.push({
        path: 'mailserver-edit',
        query: {
          uuid: uuid
        }
      });
    },
    deleteRow(uuid, name) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          let params = { uuid: uuid };
          this.$api.framework.mailserver
            .delete(params)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.getTableDataSearch();
                vnode.isShow = false;
              }
            });
        }
      });
    },
    activeRow(status, uuid) {
      let params = { uuid: uuid, isActive: status };
      this.$api.framework.mailserver
        .active(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.getTableDataSearch();
          }
        })
        .catch(error => {
          if (error.data.Message) {
            this.$Message.error(error.data.Message);
          }
          if (status == 1) {
            status = 0;
          } else {
            status = 1;
          }
        });
    },
    saveEditRow() {
      var form = this.$refs.mainForm;
      if (form.valid()) {
        let data = form.getFormValue();
        this.$api.framework.mailserver
          .save(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              this.editTsDialog.isShow = false;
              this.getTableDataSearch();
            }
          });
      }
    },
    cancelEditRow() {
      // this.$router.push({});
      this.editTsDialog.isShow = false;
    },
    settableheight() {
      let tableheight = window.innerHeight - this.$refs.maintable.getBoundingClientRect().top - 80;
      this.tableheight = tableheight;
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less">
.MailServerManagement {
  tr {
    cursor: default;
  }
}
.editForm {
  .ivu-input-word-count {
    background: #fff;
  }
}
</style>
