<template>
  <div class="MailServerManagement">
    <Loading :loading-show="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <div class="text-action tsfont-plus" @click="addRow()">服务器</div>
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
            <div>{{ row.isActive == 1 ? '启用' : '禁用' }}</div>
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
                  <span class="actionText" v-html="row.isActive == 1 ? '启用' : '禁用'"></span>
                </li>
                <li class="tsfont-edit icon" @click="editRow(row.uuid)">编辑</li>
                <li class="tsfont-trash-o icon" @click="deleteRow(row.uuid, row.name)">删除</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <TsDialog v-bind="editTsDialog" :is-show.sync="editTsDialog.isShow" @on-close="cancelEditRow">
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
      <template v-slot:footer>
        <div class="footer-btn-contain">
          <Button @click="cancelEditRow">取消</Button>
          <Button type="primary" @click="saveEditRow">确定</Button>
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
        { title: '名称', key: 'name', minWidth: 300, resizable: true },
        { title: 'smtp主机', key: 'host', minWidth: 300, resizable: true },
        { title: 'smtp端口', key: 'port', minWidth: 300, resizable: true },
        {
          title: '邮箱地址',
          key: 'fromAddress',
          minWidth: 300,
          resizable: true
        },
        { title: '用户', key: 'userName', minWidth: 300, resizable: true },
        { title: '密码', key: 'password', minWidth: 300, resizable: true },
        { title: '域名', key: 'domain', minWidth: 300, resizable: true },
        { title: '状态', key: 'isActive', minWidth: 300, resizable: true },
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
          label: '主键'
        },
        {
          type: 'text',
          name: 'name',
          value: '',
          defaultValue: '',
          maxlength: 30,
          width: 200,
          label: '名称',
          validateList: ['required']
        },
        {
          name: 'host',
          type: 'text',
          label: 'smtp主机',
          validateList: ['required']
        },
        {
          type: 'number',
          name: 'port',
          label: 'smtp端口',
          value: '',
          defaultValue: '25',
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'fromAddress',
          label: '邮箱地址',
          value: '',
          defaultValue: '',
          validateList: ['required', 'mail']
        },
        {
          type: 'text',
          name: 'userName',
          label: '用户名',
          value: '',
          defaultValue: '',
          validateList: ['required', 'mail']
        },
        {
          type: 'password',
          name: 'password',
          label: '密码',
          value: '',
          defaultValue: '',
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'domain',
          label: '域名',
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
        })
        .catch(error => {
          if (error.data.Message) {
            this.$Message.error('获取列表数据失败：' + error.data.Message);
          } else {
            this.$Message.error('接口请求错误');
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
        })
        .catch(error => {
          if (error.data.Message) {
            this.$Message.error('获取邮件服务器信息失败：' + error.data.Message);
          } else {
            this.$Message.error('接口请求错误');
          }
        });
    },
    editRow(uuid) {
      this.editTsDialog.title = '编辑服务器';
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
        title: '警告',
        content: '确定删除该邮件服务器：' + name + '?',
        btnType: 'error',
        'on-ok': vnode => {
          let params = { uuid: uuid };
          this.$api.framework.mailserver
            .delete(params)
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
    activeRow(status, uuid) {
      let params = { uuid: uuid, isActive: status };
      this.$api.framework.mailserver
        .active(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(status ? '启用成功' : '禁用成功');
            this.getTableDataSearch();
          }
        })
        .catch(error => {
          if (error.data.Message) {
            this.$Message.error(status ? '启用成功' : '禁用成功' + error.data.Message);
          } else {
            this.$Message.error('接口请求错误');
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
              this.$Message.success(this.$t('message.content.savesuccess'));
              this.editTsDialog.isShow = false;
              this.getTableDataSearch();
            }
          })
          .catch(error => {
            if (error.data.Message) {
              this.$Message.error('保存失败：' + error.data.Message);
            } else {
              this.$Message.error('接口请求错误');
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
