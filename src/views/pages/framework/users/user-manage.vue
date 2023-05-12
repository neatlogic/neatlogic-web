<template>
  <div class="user-management">
    <TsContain border="border">
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="editUser()">{{ $t('page.user') }}</span>
          <span v-if="select && select.length > 0" class="action-item tsfont-trash-o" @click="deleteData(select)">{{ $t('page.batchdelete') }}</span>
        </div>
      </template>
      <div slot="topCenter" style="text-align:right" class="pr-md">
        <Button :type="vipLevel?'primary':'default'" @click="changeVipLevel">VIP</Button>
      </div>
      <template slot="topRight">
        <InputSearcher
          v-model="keyword"
          @change="changeCurrent(1)"
        ></InputSearcher>
      </template>
      <div slot="content">
        <div class="content">
          <TsTable
            v-if="tabledata"
            v-bind="tabledata"
            keyName="id"
            multiple
            @getSelected="getSelect"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
          >
            <template slot="userName" slot-scope="{row}">
              <UserCard :uuid="row.uuid" hideName></UserCard>
              <span class="text-href" @click.stop="trClick(row)">{{ row.userName||'-' }}</span>
            </template>
            <template slot="roleDescriptionList" slot-scope="{ row }">
              <div @click.stop>
                <Tag v-for="(t, index) in showTableList(row.roleList)" :key="index">{{ t.description }}</Tag>
                <span v-if="row.roleList && row.roleList.length > 3">
                  <Dropdown placement="bottom-start" transfer>
                    <span class="text-action tsfont-option-horizontal"></span>
                    <DropdownMenu slot="list">
                      <DropdownItem v-for="(item, index) in showRestText(row.roleList)" :key="index" @click.stop>{{ item.description }}</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </span>
              </div>
            </template>
            <template slot="teamNameList" slot-scope="{ row }">
              <div @click.stop>
                <Tag v-for="(t, index) in showTableList(row.teamNameList)" :key="index">{{ t }}</Tag>
                <span v-if="row.teamNameList && row.teamNameList.length > 3" @click.stop>
                  <Dropdown placement="bottom-start" transfer @click.native.stop>
                    <span class="text-action tsfont-option-horizontal"></span>
                    <DropdownMenu slot="list">
                      <DropdownItem v-for="(item, index) in showRestText(row.teamNameList)" :key="index">{{ item }}</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </span>
              </div>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li @click.stop>
                    <i-switch
                      v-model="row.isActive"
                      :true-value="1"
                      :false-value="0"
                      @on-change="activeData(row)"
                    ></i-switch>
                    <span class="actionText" v-html="row.isActive == 1 ? $t('page.enable') : $t('page.disable')"></span>
                  </li>
                  <!-- <li class="tsfont-edit" @click="authDialog(row);getAuthSelect(row)">{{ $t('page.auth') }}</li> -->
                  <li class="tsfont-edit icon" @click.stop="editUser(row, 'user')">{{ $t('page.edit') }}</li>
                  <li class="ts-permission icon" @click.stop="editUser(row, 'auth')">{{ $t('page.auth') }}</li>
                  <li class="tsfont-trash-o icon" @click.stop="deleteData(row)">{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
        <!-- <div class="content-left">
          <div v-if='authList && authList.length > 0'>
            <CommonFilter :authList="authList" @filterSelect="filterUser" @filterRole="filterRole" type="user"></CommonFilter>
          </div>
        </div>-->
      </div>
    </TsContain>
    <TsDialog
      v-if="showAuth"
      type="modal"
      :isShow.sync="showAuth"
      width="small"
      class="authDialog"
      @on-close="showAuthClose"
    >
      <template v-slot:header>
        <div>{{ authorizationTitle }}</div>
      </template>
      <template v-slot>
        <CommonAuth
          ref="commonAuth"
          :authList="authList"
          :authUserList="authUserList"
          :isBatch="isBatch"
          :authUserSelectList="authUserSelectList"
          :authRoleSelectList="authRoleSelectList"
        ></CommonAuth>
      </template>
      <template v-slot:footer>
        <div class="drawer-footer">
          <Button style="margin-left: 8px" @click="showAuth = false">{{ $t('page.cancel') }}</Button>
          <Button v-if="isBatch" @click="saveAuth('delete')">{{ $t('page.delete') }}</Button>
          <Button v-if="isBatch" @click="saveAuth('add')">{{ $t('page.add') }}</Button>
          <Button type="primary" @click="saveAuth('cover')">{{ isBatch ? $t('page.cover') : $t('page.save') }}</Button>
        </div>
      </template>
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: 'UserManage',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    CommonAuth: resolve => require(['./common/common-auth.vue'], resolve)
  },
  props: [],
  data() {
    return {
      theadList: [
        {
          key: 'selection'
        },
        {
          title: this.$t('page.username'),
          key: 'userName'
        },
        {
          title: this.$t('page.userid'),
          key: 'userId'
        },
        {
          title: this.$t('page.role'),
          key: 'roleDescriptionList'
        },
        {
          title: this.$t('page.userteam'),
          key: 'teamNameList'
        },
        {
          title: this.$t('page.phone'),
          key: 'phone'
        },
        {
          title: this.$t('page.email'),
          key: 'email'
        },
        {
          //这个是最后一行操作栏
          title: '',
          key: 'action',
          align: 'right',
          width: 10
        }
      ],
      searchParams: {
        currentPage: 1,
        pageSize: 20
      },
      loadingShow: true,
      user: {}, //当前用户信息
      keyword: null,
      tabledata: null, //table的正文数据
      select: null, //选中哪些
      vipLevel: null, //VIP等级
      formSetting: [], //弹窗表单对应的数组
      isImmediately: true, //立即授权
      isBatch: false, //是否批量授权
      userKey: false, //判断是否有相同的userId
      allUserList: [], //所有用户
      authorizationTitle: this.$t('dialog.title.edittarget', {target: this.$t('term.framework.userpermission')}), //授权标题
      showAuth: false, //授权窗口
      authList: [], //权限列表
      authUserList: [], //授权用户列表
      authSelectList: [], //授权选中列表
      authRoleSelectList: [], //角色授权选中回显列表
      authUserSelectList: [], //用户授权选中回显列表
      filter: {
        //过滤用户
        authGroup: '',
        auth: '',
        roleName: ''
      }
    };
  },
  created() {},
  mounted() {
    this.getTable();
  },
  methods: {
    changeCurrent(currentPage) {
      this.searchParams.currentPage = currentPage;
      this.getTable();
    },
    //改变页数
    changePageSize(pageSize) {
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = pageSize;
      this.getTable();
    },
    changeVipLevel() {
      this.vipLevel = this.vipLevel ? null : 1;
      this.getTable();
    },
    getTable() {
      this.loadingShow = true;
      let data = {
        keyword: this.keyword,
        vipLevel: this.vipLevel,
        currentPage: this.searchParams.currentPage,
        pageSize: this.searchParams.pageSize
      };
      this.$addHistoryData('keyword', data.keyword);
      this.$addHistoryData('vipLevel', data.vipLevel);
      this.$addHistoryData('currentPage', data.currentPage);
      this.$addHistoryData('pageSize', data.pageSize);
      this.$api.framework.user
        .searchUser(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.tabledata = res.Return;
            this.tabledata.theadList = this.theadList;
            this.loadingShow = false;
          }
        });
    },
    restoreHistory(historyData) {
      this.keyword = historyData['keyword'];
      this.vipLevel = historyData['vipLevel'];
      this.searchParams.currentPage = historyData['currentPage'];
      this.searchParams.pageSize = historyData['pageSize'];
    },
    getSelect(li, selection) {
      this.select = selection;
    },
    //启用禁用
    activeData(row) {
      let uuid = [];
      if (typeof row == 'object') {
        uuid.push(row.uuid);
      } else {
        uuid = row;
      }
      let param = {
        userUuidList: uuid,
        isActive: row.isActive
      };
      this.$api.framework.user
        .updateActive(param)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        })
        .catch(error => {
          this.$Notice.error({ title: error.data.Message });
        });
    },
    //批量启用禁用
    batchEnaDisable: function(val) {
      let newList = [];
      this.select.forEach(item => {
        newList.push(item.uuid);
      });
      let data = {
        userUuidList: newList,
        isActive: val
      };
      this.$api.framework.user
        .updateActive(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.$refs.userTable.selectAll(false);
            this.initTable();
          }
        })
        .catch(error => {
          this.$Notice.error({ title: error.data.Message });
        });
    },
    //删除
    deleteData(row) {
      let key = row instanceof Array;
      let userUuidList = [];
      if (key && row.length > 0) {
        row.forEach(item => {
          userUuidList.push(item.uuid);
        });
      } else {
        userUuidList = [row.uuid];
      }
      let param = {
        userUuidList: userUuidList
      };
      let content = userUuidList.length > 1 ? this.$t('dialog.content.deleteconfirm', {target: this.$t('page.user') + '：' + row.map(r => { return r.userName; }).join('、')}) : key ? this.$t('dialog.content.deleteconfirm', {target: this.$t('page.user') + '：' + row[0].userName}) : this.$t('dialog.content.deleteconfirm', {target: this.$t('page.user') + '：' + row.userName});
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: content,
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.user
            .deleteUser(param)
            .then(res => {
              if (res && res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.tabledata.currentPage = 1;
                this.select = [];
                this.getTable();
              }
            });
        }
      });
    },
    //获取用户组下拉列表
    getUserList: function() {
      let data = {
        needPage: false,
        keyword: ''
      };
      this.$api.framework.team.getTeamList(data).then(res => {
        if (res.Status == 'OK') {
          let list = res.Return.teamList;
          let newObj = this.formData.find(d => d.name == 'teamUuidList');
          newObj.dataList = list;
        }
      });
    },
    //获取角色列表
    getRoleList: function() {
      let data = {
        needPage: false
      };
      this.$api.framework.role.roleList(data).then(res => {
        if (res.Status == 'OK') {
          let list = res.Return.tbodyList;
          let newObj = this.formData.find(d => d.name == 'roleUuidList');
          newObj.dataList = list;
        }
      });
    },
    //获取所有用户
    getAllUser: function() {
      let data = {
        needPage: false,
        keyword: ''
      };
      this.$api.framework.user
        .searchUser(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.allUserList = res.Return.tbodyList;
          }
        })
        .catch(error => {
          this.$Notice.error({ title: error.data.Message });
        });
    },
    //获取所有权限列表
    getAuthList: function() {
      let data = {};
      this.$api.common
        .getAuthlist(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.authList = res.Return.authGroupList;
          }
        })
        .catch(error => {
          this.$Notice.error({ title: error.data.Message });
        });
    },
    //获取用户授权列表
    getAuthSelect: function(val) {
      let userUuid = val.userUuid;
      let data = {
        userUuid: userUuid
      };
      this.$api.common.getUserAuth(data).then(res => {
        if (res.Status == 'OK') {
          let userAuthList = JSON.parse(JSON.stringify(res.Return.userAuthObj));
          this.authUserSelectList = userAuthList;
          let userRoleAuthList = JSON.parse(JSON.stringify(res.Return.userRoleAuthObj));
          this.authRoleSelectList = userRoleAuthList;
        }
      });
    },
    //用户授权
    authDialog: function(row) {
      this.showAuth = true;
      this.isBatch = false;
      if (row && row.userId != undefined) {
        this.authUserList = row;
      }
    },
    //授权框关闭
    showAuthClose: function() {
      this.authSelectList = [];
    },
    //用户过滤
    filterUser: function(val) {
      let data = val;
      let index = data.lastIndexOf('#');
      this.filter.authGroup = data.substring(0, index);
      this.filter.auth = data.substring(index + 1, data.length);
      let param = {
        authGroup: this.filter.authGroup,
        auth: this.filter.auth,
        roleName: this.filter.roleName,
        keyword: this.keyword || ''
      };
      this.getTable(param);
    },
    filterRole: function(val) {
      this.filter.roleName = val;
      let param = {
        authGroup: this.filter.authGroup,
        auth: this.filter.auth,
        roleName: this.filter.roleName,
        keyword: this.keyword || ''
      };
      this.getTable(param);
    },
    //批量授权
    batchAuth: function() {
      this.isBatch = true;
      this.showAuth = true;
      this.authorizationTitle = this.$t('term.framework.batchauth');
    },
    //保存授权
    saveAuth: function(val) {
      let action = val;
      let authList = this.$refs.commonAuth.authSelectList;
      let newList = JSON.stringify(this.authRoleSelectList);
      if (this.$refs.commonAuth.valid()) {
        let userUuidList = this.$refs.commonAuth.userUuidList;
        let data = {
          action: action,
          userAuthList: authList,
          userUuidList: userUuidList
        };
        this.$api.common
          .saveAuth(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              this.showAuth = false;
              this.initTable();
            }
          })
          .catch(error => {
            this.$Notice.error({ title: error.data.Message });
          });
      }
    },
    //table中角色、用户回显
    showTableText(val) {
      let textList = '';
      let list = val;
      if (list == undefined) {
        textList = '';
      } else if (list.length > 0 && list.length < 3) {
        textList = list.join('、');
      } else if (list.length >= 3) {
        textList = list.slice(0, 3).join('、');
      }
      return textList;
    },
    showTableList(val) {
      let list = [];
      if (val && val.length > 0) {
        for (var i = 0; i < val.length; i++) {
          list.push(val[i]);
          if (i >= 2) {
            break;
          }
        }
      }
      return list;
    },
    //剩余
    showRestText(list) {
      let textList = '';
      textList = list.slice(3);
      return textList;
    },
    //新添加用户
    editUser: function(val, key) {
      let userId = '';
      let uuid = '';
      if (val) {
        userId = val.userId || '';
        uuid = val.uuid || '';
      }
      this.$router.push({
        path: `user-addview`,
        query: { userId: userId, key: key, uuid: uuid }
      });
    },
    //行点击
    trClick: function(item) {
      let userId = '';
      let uuid = '';
      if (item) {
        userId = item.userId || '';
        uuid = item.uuid || '';
      }
      this.$router.push({
        path: `user-addview`,
        query: { userId: userId, key: 'user', readonly: true, uuid: uuid }
      });
    },
    getVipIconByLevel(vipLevel) {
      return this.$store.getters.getVipIconByLevel(vipLevel, true);
    }
  },
  computed: {},
  watch: {
    // $route: {
    //   handler: function(val) {
    //     if (val) {
    //       this.initTable();
    //     }
    //   }
    // }
  }
};
</script>

<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.user-management {
  .top {
    .bar-top {
      .bar-top-left {
        .batch {
          margin-left: 16px;
        }
      }
      .bar-top-right {
        width: 400px;
      }
    }
  }
  thead {
    > tr {
      cursor: default;
    }
  }
  .ivu-dropdown-item {
    cursor: default;
  }
  .label {
    display: inline-block;
    margin-left: 12px;
  }
  .content-left {
    height: calc(100vh - 130px);
    background: @white;
    margin-left: calc(80% + 16px);
    padding: 16px 24px;
    overflow: auto;
  }
  .actionText {
    padding-left: 5px;
  }
  /deep/ .table {
    .table-top {
      th:first-of-type {
        div {
          padding-left: 24px;
        }
      }
    }
  }
  .vip-level {
    display: inline-block;
    width: 16px;
    margin-right: 8px;
    .vip-icon {
      width: 16px;
      vertical-align: -1px;
    }
  }
}
.footer-left {
  float: left;
  line-height: 32px;
}
</style>
