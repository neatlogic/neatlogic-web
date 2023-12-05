<template>
  <div class="auth-adduser">
    <TsContain border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ $t('page.editauthority') }}</span>
      </template>
      <div slot="content" class="content border-color">
        <Tabs v-model="tabsName">
          <TabPane :label="userLabel" name="user">
            <CommonAdduser
              ref="commonAdduser"
              :authName="authName"
              type="auth_user"
              :refreshListSetting="refreshListSetting"
              @saveUser="editSave"
              @deleteOk="deleteOk('user')"
            ></CommonAdduser>
            <!-- <Button type="primary" @click="editSave()">{{ $t('page.save') }}</Button> -->
          </TabPane>
          <TabPane :label="roleLabel" name="role">
            <CommonAdduser
              ref="commonAddrole"
              :authName="authName"
              type="auth_role"
              :refreshListSetting="refreshListSetting"
              @saveRole="editSave"
              @deleteOk="deleteOk('role')"
            ></CommonAdduser>
            <!-- <Button type="primary" @click="editSave()">{{ $t('page.save') }}</Button> -->
          </TabPane>
        </Tabs>
      </div>
    </TsContain>
    <!-- <TsDialog
      :isShow.sync="tabsaveModel"
      width="437"
      title="提示"
      cancelText="否"
      content="是否保存对当前权限的更改？"
      okText="是"
      @on-ok="tabsJumping('ok')"
      @on-cancel="tabsJumping('cancel')"
    > </TsDialog>
    <TsDialog
      :isShow.sync="saveModel"
      width="437"
      title="提示"
      cancelText="取消"
      content="确定放弃编辑当前权限？"
      okText="确定"
      @on-ok="toQuery"
      @on-cancel="saveModel = false"
    > </TsDialog> -->
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    CommonAdduser: resolve => require(['./common/common-adduser.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      authName: '', //权限名称
      groupName: '',
      userLabel: '', // 用户标签名称
      roleLabel: '', // 角色标签名称
      tabsName: 'user', //tabs标签
      leaveName: '', //准备进入tabsname
      tabSaveTip: true,
      path: '',
      tabsaveModel: false,
      saveModel: false,
      routerTip: false,
      userCount: null,
      roleCount: null,
      roleUuidList: [],
      refreshListSetting: {
        isRefreshAuthUserList: false, // 权限列表
        isRefreshRoleUserList: false // 角色列表
      }
    };
  },
  beforeCreate() {},
  created() {
    this.authName = this.$route.query.name || null;
    this.groupName = this.$route.query.groupName || null;
    if (this.authName) this.getUserCount(this.authName, 'all');
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
    async userInit() {
      this.refreshListSetting.isRefreshAuthUserList = false;
      await this.getUserCount(this.authName, 'all');
      this.refreshListSetting.isRefreshAuthUserList = true;
    },
    async editSave(roleUuidList) {
      // 新增角色
      if (this.tabsName == 'user') {
        let data = {
          auth: this.authName,
          authGroup: this.groupName,
          action: 'cover',
          userUuidList: roleUuidList
        };
        await this.$api.common.saveAuthUser(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.userInit();
          }
        });
      } else if (this.tabsName == 'role') {
        let data = {
          auth: this.authName,
          authGroup: this.groupName,
          roleUuidList: roleUuidList,
          action: 'cover'
        };
        this.$api.common.saveAuthRole(data).then(res => {
          if (res.Status == 'OK') {
            this.refreshListSetting.isRefreshRoleUserList = false;
            this.$Message.success(this.$t('message.savesuccess'));
            this.getUserCount(this.authName, 'all');
            this.refreshListSetting.isRefreshRoleUserList = true;
          }
        });
      }
    },
    deleteOk(type) {
      if (type === 'user' || type === 'role') {
        this.getUserCount(this.authName, 'all');
      }
    },
    tabClick(name) {
      // tabs点击
      this.leaveName = name;
      if (this.tabsName != name) {
        if (name == 'role' || name == 'user') {
          this.tabSaveTip = false; //可以跳转
        }
      }
      return this.tabSaveTip;
    },
    //退出跳转
    toQuery() {
      this.routerTip = true;
      this.$router.push(this.path);
      this.routerTip = false;
    },
    //自定义初始化tabs
    getLabel(label, name) {
      var _this = this;
      return h => {
        return h(
          'div',
          {
            style: {
              padding: '8px 16px'
            },
            on: {
              click: e => {
                var tip = _this.tabClick(name); // 判断条件是否满足
                if (tip) {
                  e.stopPropagation(); // 不满足条件则阻止事件冒泡 本质是不让触发tab的on-click事件
                }
              }
            }
          },
          label
        );
      };
    },
    //tabs model跳转确认
    tabsJumping(val) {
      if (val == 'ok') {
        //调用接口
        this.editSave();
        this.tabsaveModel = false;
        this.tabsName = this.leaveName;
      } else if (val == 'cancel') {
        this.tabsaveModel = false;
        this.tabsName = this.leaveName;
      }
    },
    async getUserCount(val, type) {
      // 获取成员或者角色数量
      let data = {
        auth: val,
        keyword: ''
      };
      if (type == 'user' || type == 'all') {
        await this.$api.common.getAuthUserList(data).then(res => {
          if (res.Status == 'OK') {
            this.userCount = res.Return.rowNum || '';
            this.userLabel = this.getLabel(this.$t('page.user') + (this.userCount ? '(' + this.userCount + ')' : ''), 'user');
          }
        });
      }
      if (type == 'role' || type == 'all') {
        await this.$api.common.getAuthRoleList(data).then(res => {
          if (res.Status == 'OK') {
            this.roleCount = res.Return.roleCount || '';
            this.roleLabel = this.getLabel(this.$t('page.role') + (this.roleCount ? '(' + this.roleCount + ')' : ''), 'role');
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
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.auth-adduser {
  .ivu-tabs-nav .ivu-tabs-tab {
    padding: 0px;
  }
  .content {
    border-top: 1px solid;
    height: 100%;
  }
  .ivu-tabs-bar {
    border: none;
  }
  .ivu-tabs {
    height: 100%;
  }
}
</style>
