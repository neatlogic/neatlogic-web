<template>
  <div class="auth-adduser">
    <TsContain border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ $t('page.editauthority') }}</span>
        <template v-if="authName">
          <Divider type="vertical" />
          <span>
            {{ authDisplayName || authName }}
            <span v-if="authDisplayName && authDisplayName !== authName" class="text-grey">({{ authName }})</span>
          </span>
        </template>
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
          </TabPane>
          <TabPane v-if="$AuthUtils.hasRole('AUTHORITY_MODIFY')" :label="systemUserLabel" name="system">
            <SystemUserAuthMembers
              v-if="authName"
              :key="authName"
              :authName="authName"
              :authGroup="groupName"
              @count="updateSystemUserCount"
            ></SystemUserAuthMembers>
          </TabPane>
        </Tabs>
      </div>
    </TsContain>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    CommonAdduser: () => import('./common/common-adduser.vue'),
    SystemUserAuthMembers: () => import('./system-user-auth-members.vue')
  },
  props: [''],
  data() {
    return {
      authName: '', //权限名称
      authDisplayName: '', //当前权限的展示名称，由既有权限查询接口返回。
      groupName: '',
      userLabel: this.getLabel(this.$t('page.user'), 'user', 0), //用户标签名称及人数
      roleLabel: this.getLabel(this.$t('page.role'), 'role', 0), //角色标签名称及人数
      tabsName: 'user', //tabs标签
      leaveName: '', //准备进入tabsname
      tabSaveTip: true,
      path: '',
      tabsaveModel: false,
      saveModel: false,
      routerTip: false,
      userCount: 0,
      roleCount: 0,
      systemUserCount: 0,
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
    //按权限标识精确匹配展示名称；加载失败时标题仍展示标识，过期响应不覆盖当前目标。
    async loadAuthDisplayName() {
      this.authDisplayName = '';
      const authName = this.authName;
      const groupName = this.groupName;
      if (!authName) {
        return;
      }
      try {
        const res = await this.$api.framework.auth.getAuthList({ groupName: groupName || 'all', keyword: authName });
        if (res.Status == 'OK' && this.authName === authName && this.groupName === groupName) {
          const auth = (res.Return || []).find(item => item.name === authName);
          this.authDisplayName = auth ? auth.displayName : '';
        }
      } catch (error) {
        //请求错误由统一 HTTP 层提示，标题继续展示权限标识以便定位。
      }
    },
    //系统用户子组件独立刷新直接成员数量，不依赖当前选中的页签。
    updateSystemUserCount(count) {
      this.systemUserCount = count;
    },
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
        if (name == 'role' || name == 'user' || name == 'system') {
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
    //页签名称与成员人数分开展示，Badge 隐藏零人数并保留非零完整数量。
    getLabel(label, name, count) {
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
          [
            h('span', label),
            h('Badge', {
              class: 'ml-xs',
              props: {
                count: count,
                showZero: false,
                type: 'primary',
                overflowCount: Number.MAX_SAFE_INTEGER
              }
            })
          ]
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
            this.userCount = res.Return.rowNum || 0;
            this.userLabel = this.getLabel(this.$t('page.user'), 'user', this.userCount);
          }
        });
      }
      if (type == 'role' || type == 'all') {
        await this.$api.common.getAuthRoleList(data).then(res => {
          if (res.Status == 'OK') {
            this.roleCount = res.Return.roleCount || 0;
            this.roleLabel = this.getLabel(this.$t('page.role'), 'role', this.roleCount);
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    //系统用户人数变化时重建标签，沿用普通用户与角色的 Badge 展示。
    systemUserLabel() {
      return this.getLabel(this.$t('term.framework.systemuser'), 'system', this.systemUserCount);
    }
  },
  watch: {
    //初始化及权限切换均重新查询名称，不沿用上一个权限的标题。
    authName() {
      this.loadAuthDisplayName();
    }
  }
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
