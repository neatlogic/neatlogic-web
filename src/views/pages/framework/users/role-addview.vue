<template>
  <div class="role-addview">
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span class="block-item">{{ uuid==null?$t('dialog.title.createtarget', {target: $t('page.role')}):$t('dialog.title.edittarget', {target: $t('page.role')}) }}</span>
      </template>
      <div slot="topRight" class="top">
        <div class="bar-top">
          <div class="bar-top-right">
            <div v-if="uuid == null">
              <Button v-show="current > 0" type="default" @click="current -= 1">{{ $t('page.previousstep') }}</Button>
              <Button v-show="current != 3" type="primary" @click="next(current+1)">{{ $t('page.thenextstep') }}</Button>
              <Button
                v-show="current == 3"
                type="primary"
                :loading="isLoading"
                @click="submit()"
              >{{ $t('dialog.title.createtarget', {target: $t('page.role')}) }}</Button>
            </div>
            <div v-else>
              <Button type="primary" :loading="isLoading" @click="editSave()">{{ $t('page.save') }}</Button>
            </div>
          </div>
        </div>
      </div>
      <div slot="content" class="content">
        <div v-if="uuid == null">
          <div class="step">
            <!-- <Steps :current="current" :status="stepStatus">
              <Step title="基本信息" content=""></Step>
              <Step title="添加成员" content=""></Step>
              <Step title="添加分组" content=""></Step>
              <Step title="授权" content=""></Step>
            </Steps> -->
            <Steps :current="current" :status="stepStatus">
              <Step
                v-for="(litem,lindex) in stepList"
                :key="lindex"
                :title="litem"
                @click.native="stepClick(lindex)"
              ></Step>
            </Steps>
          </div>
          <div v-show="current == 0" class="form">
            <TsForm ref="roleForm" :itemList="formData"></TsForm>
            <Button v-show="current != 3 && current == 0" type="primary" @click="next(current+1)">{{ $t('page.thenextstep') }}</Button>
          </div>
          <div v-show="current == 1" class="adduser">
            <CommonAdduserRole ref="commonAdduser" type="role"></CommonAdduserRole>
          </div>
          <div v-show="current == 2" class="addgroup">
            <CommonAddgroup ref="commonAddgroup" type="team" @addData="addData"></CommonAddgroup>
          </div>
          <div v-show="current == 3" class="auth">
            <CommonAuth ref="commonAuth" :authList="authList"></CommonAuth>
          </div>
          <div class="btn">
            <Button v-show="current > 0" type="default" @click="current -= 1">{{ $t('page.previousstep') }}</Button>
            <Button v-show="current != 3 && current != 0" type="primary" @click="next(current+1)">{{ $t('page.thenextstep') }}</Button>
            <Button
              v-show="current == 3"
              type="primary"
              :loading="isLoading"
              @click="submit()"
            >{{ $t('dialog.title.createtarget', {target: $t('page.role')}) }}</Button>
          </div>
        </div>
        <div v-else>
          <Tabs v-model="tabsName">
            <TabPane :label="label1" name="role">
              <div class="form">
                <TsForm v-if="formShow" ref="roleForm" :itemList="formData"></TsForm>
                <Button
                  type="primary"
                  class="save"
                  :loading="isLoading"
                  @click="editSave()"
                >{{ $t('page.save') }}</Button>
              </div>
            </TabPane>
            <TabPane :label="label2" name="adduser">
              <div class="auth">
                <CommonAdduserRole
                  ref="commonAdduser"
                  :authName="uuid"
                  :refreshListSetting="refreshListSetting"
                  @saveUser="editSave"
                  @deleteOk="deleteOk"
                ></CommonAdduserRole>
              </div>
            </TabPane>
            <TabPane :label="label3" name="addgroup">
              <CommonAddgroup ref="commonAddgroup"></CommonAddgroup>
            </TabPane>
            <TabPane :label="label4" name="auth">
              <div v-if="authRoleSelectList != ''" class="auth">
                <CommonAuth
                  v-if="!isRefreshCommonAuth"
                  ref="commonAuth"
                  :authList="authList"
                  :authUserSelectList="authRoleSelectList"
                ></CommonAuth>
                <Button
                  type="primary"
                  class="save"
                  :loading="isLoading"
                  @click="editSave()"
                >{{ $t('page.save') }}</Button>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </TsContain>
    <TsDialog
      :isShow.sync="tabsaveModel"
      width="437"
      :title="$t('page.tip')"
      :cancelText="$t('page.no')"
      :content="$t('term.framework.saverolechange')"
      :okText="$t('page.yes')"
      @on-ok="tabsJumping('ok')"
      @on-cancel="tabsJumping('cancel')"
    >
    </TsDialog>
    <TsDialog
      :isShow.sync="submitModel"
      className="vertical-center-modal"
      width="437"
      :hasHeader="false"
      :hasFooter="false"
      :showCloseIcon="false"
    >
      <div class="submitModelBox">
        <div class="submit-model-title">
          <Icon type="i-icon tsfont-check" size="30" class="text-op" />{{ $t('term.deploy.createsuccess') }}
        </div>
        <div class="submit-btn-list">
          <Button size="large" type="primary" @click="backRoleManage(); saveProfile('backrolelist')">{{ $t('term.framework.backtorolelist') }}</Button>
        </div>
        <div class="submit-btn-list">
          <Button size="large" @click="continueCreate(); saveProfile('keeponcreate')">{{ $t('term.framework.continuecreate') }}</Button>
        </div>
        <div class="submit-btn-list">
          <Button size="large" @click="editCrrentRole(); saveProfile('editrole')">{{ $t('dialog.title.edittarget', {target: $t('page.role')}) }}</Button>
        </div>
        <div class="submit-btn-list">
          <Checkbox v-model="submitMessage">{{ $t('term.framework.notips') }} <i class="tsfont-question-o" :title="$t('term.framework.editinsetting')"></i></Checkbox>
        </div>
      </div>
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: 'RoleAddview',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    CommonAuth: resolve => require(['./common/common-auth.vue'], resolve),
    TsDialog: resolve => require(['@/resources/plugins/TsDialog/TsDialog.vue'], resolve),
    CommonAdduserRole: resolve => require(['./common/common-adduser-role.vue'], resolve),
    CommonAddgroup: resolve => require(['./common/common-addgroup.vue'], resolve)
  },
  props: [''],
  data() {
    let _this = this;
    return {
      formData: [
        //表单数据
        {
          type: 'text',
          name: 'uuid',
          value: _this.uuid || null,
          isHidden: true,
          disabled: true,
          label: 'uuid',
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'name',
          value: '',
          placeholder: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.framework.roleid')}),
          maxlength: 50,
          label: 'ID',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.framework.roleid')}) }, { name: 'name-special' }],
          errorMessage: '',
          onChange: value => {
            _this.formData[1].errorMessage = '';
            _this.allroleList.forEach(item => {
              if (item.name == value) {
                _this.formData[1].errorMessage = this.$t('message.targetisexists', {target: this.$t('term.framework.roleid')}); 
                this.roleKey = false;
              }
            });
          }
        },
        {
          type: 'text',
          name: 'description',
          value: '',
          placeholder: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.framework.rolename')}),
          maxlength: 50,
          label: this.$t('term.framework.rolename'),
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.framework.rolename')}) }, { name: 'name-special' }]
        },        
        {
          type: 'textarea',
          name: 'rule',
          value: '',
          placeholder: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.rule')}),
          label: this.$t('page.rule'),
          tooltip: this.$t('page.rolerule')
        }
      ],
      uuid: '', //角色uuid
      roleId: '', //角色id
      newRoleUuid: '',
      allroleList: null, //所有角色列表
      current: 0, //步骤
      stepStatus: 'process', //步骤状态
      roleKey: false, //判断是否有相同角色
      tabsName: null, //tabs标签
      authList: [], //权限列表
      authRoleSelectList: {}, //角色授权选中回显列表
      path: '', //跳转路径
      roleData: null, //用户初始化数据
      formShow: false,
      userNum: '', //角色的用户数量
      roleTabsDataList: [],
      roleUserUuidList: [],
      roleGroupTeamList: [],
      teamList: [], // 新增分组所需参数
      datas: null, //分组当页数据
      roleTabsAuthList: [],
      label1: '',
      label2: '',
      label3: '',
      label4: '',
      leaveName: '', //准备进入tabsname
      tabsaveModel: false,
      submitModel: false,
      stepList: [
        this.$t('page.basicinfo'),
        this.$t('dialog.title.addtarget', {target: this.$t('page.member')}), 
        this.$t('dialog.title.addtarget', {target: this.$t('page.group')}),
        this.$t('page.auth')
      ],
      submitMessage: false, //不再提示
      convenienceDetail: null, //个性化设置
      isLoading: false,
      refreshListSetting: {
        isRefreshRoleUserList: false
      },
      defaultAuthUserSelectList: {}, // 默认授权列表回显选中数据
      isRefreshCommonAuth: false // 是否刷新授权列表
    };
  },

  beforeCreate() {},

  created() {
    this.uuid = this.$route.query.uuid || null;
    this.roleId = this.$route.query.roleId || null;
    this.tabsName = this.$route.query.key || null;
    this.getAllrole();
    this.getAuthList();
    this.getProfile();
  },

  beforeMount() {},

  mounted() {
    let _this = this;
    this.timer = setInterval(() => {
      if (_this.$refs.roleForm && _this.$refs.commonAdduser && _this.$refs.commonAddgroup && _this.$refs.commonAuth) {
        _this.roleTabsDataList = _this.$refs.roleForm.getFormValue();
        _this.roleGroupTeamList = JSON.parse(JSON.stringify(_this.$refs.commonAddgroup.teamList));
        _this.roleUserUuidList = JSON.parse(JSON.stringify(_this.$refs.commonAdduser.userListData.cardList));
        _this.roleTabsAuthList = JSON.parse(JSON.stringify(_this.$refs.commonAuth.authSelectList));
        _this.roleData = _this.getData();
        clearInterval(this.timer);
        this.timer = null;
      }
    }, 1000);
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    //步骤条点击
    stepClick(index) {
      if (this.current == '0' && index !== '0') {
        this.next(index);
      } else {
        this.current = index;
      }
    },
    next(index) {
      let _this = this;
      let data = this.$refs.roleForm.getFormValue();
      if (!this.$refs.roleForm.valid()) {
        this.stepStatus = 'error';
        return;
      }
      this.roleKey = true;
      if (this.uuid != undefined) {
        this.roleKey = true;
      } else {
        this.allroleList.forEach(item => {
          if (item.name == data.name) {
            this.roleKey = false;
          }
        });
      }
      if (this.roleKey) {
        this.stepStatus = 'process';
        this.current = index;
      }
    },
    //新增分组 所需参数
    addData(data) {
      this.teamList = data.teamList;
    },
    //新增保存 ---保存时将所需参数赋值
    async submit() {
      this.isLoading = true;
      let roleData = this.$refs.roleForm.getFormValue();
      let authList = this.$refs.commonAuth.authSelectList;
      roleData.roleAuthList = authList;
      roleData.userUuidList = this.$refs.commonAdduser.saveUuidList;
      roleData.teamList = this.$refs.commonAddgroup.teamList;
      await this.$api.framework.role
        .saverole(roleData)
        .then(res => {
          if (res.Status == 'OK') {
            this.newRoleUuid = res.Return.uuid;
            this.formData.forEach(item => {
              if (item.name == 'uuid') {
                item.value = this.newUserUuid;
              }
            });
            this.roleData = this.getData();
            if (this.convenienceDetail && this.convenienceDetail.checked == '1') {
              this.submitModel = true;
            } else {
              this.$Message.success(this.$t('message.executesuccess'));
              let data = this.convenienceDetail.userProfileOperateList.find(d => d.checked == '1');
              let value = data.value;
              switch (value) {
                //返回角色列表
                case 'backrolelist':
                  this.backRoleManage();
                  break;
                //编辑用户
                case 'editrole':
                  this.editCrrentRole();
                  break;
                //继续创建
                case 'keeponcreate':
                  this.continueCreate();
                  break;
              }
            }
          }
        })
        .catch(error => {
          this.$Notice.error({ title: error.data.Message });
        })
        .finally(() => { this.isLoading = false; });
    },
    //编辑保存
    async editSave() {
      this.isLoading = true;
      if (this.tabsName == 'role') {
        let data = this.$refs.roleForm.getFormValue();
        if (!this.$refs.roleForm.valid()) {
          return false;
        }
        await this.$api.framework.role
          .saverole(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              this.roleTabsDataList = this.$refs.roleForm.getFormValue();
              this.roleData = this.getData();
            }
          })
          .catch(error => {
            this.$Notice.error({ title: error.data.Message });
          })
          .finally(() => { this.isLoading = false; });
      } else if (this.tabsName == 'adduser') {
        let data = {
          roleUuid: this.uuid,
          userUuidList: this.$refs.commonAdduser.getSaveUuidList()
        };
        await this.$api.common.roleUserSave(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.saveUserData();
          }
        }).finally(() => { this.isLoading = false; });
      } else if (this.tabsName == 'auth') {
        let authList = this.$refs.commonAuth.authSelectList;
        let data = {
          action: 'cover',
          roleAuthList: authList,
          roleUuidList: [this.uuid]
        };
        await this.$api.common.saveRoleAuth(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.roleTabsAuthList = JSON.parse(JSON.stringify(this.$refs.commonAuth.authSelectList));
            this.roleData = this.getData();
            this.defaultAuthUserSelectList = this.$utils.deepClone(authList); // 修复切换到基本信息，选择不保存，再次切换到授权tab时，没有恢复为原始数据
          }
        }).finally(() => { this.isLoading = false; });
      } else {
        this.isLoading = false;
      }
    },
    //删除成员列表
    deleteOk() {
      this.saveUserData();
    },
    
    //保存当前用户信息，用于跳转判断
    saveUserData() {
      this.refreshListSetting.isRefreshRoleUserList = false;
      this.roleUserUuidList = JSON.parse(JSON.stringify(this.$refs.commonAdduser.userListData.cardList));
      this.roleData = this.getData();
      this.getUserNum(this.uuid);
      this.refreshListSetting.isRefreshRoleUserList = true;
    },
    //初始化角色所有数据
    getData() {
      let roleData = this.$refs.roleForm ? this.$refs.roleForm.getFormValue() : {};
      let authList = this.$refs.commonAuth ? this.$refs.commonAuth.authSelectList : [];
      let userUuidList = (this.$refs.commonAdduser && this.$refs.commonAdduser.userListData) ? this.$refs.commonAdduser.userListData.cardList : [];
      let teamList = this.$refs.commonAddgroup ? this.$refs.commonAddgroup.teamList : [];
      roleData.roleAuthList = authList;
      roleData.userUuidList = userUuidList;
      roleData.teamList = teamList;
      return JSON.parse(JSON.stringify(roleData));
    },
    //获取当前角色信息
    getRoleDetail(id) {
      let _this = this;
      let obj_name = this.formData.find(d => d.name === 'name');
      obj_name.disabled = true;
      this.formShow = true;
      let data = {
        uuid: id
      };
      this.$api.common.getRole(data).then(res => {
        if (res.Status == 'OK') {
          let row = res.Return;
          this.userDetail = row;
          for (let r in row) {
            this.formData.forEach(item => {
              if (item.name == r) {
                item.value = row[r];
              }
            });
          }
        }
      });
    },
    //获取用户数量
    getUserNum: function(val) {
      let data = {
        roleUuid: val,
        keyword: ''
      };
      this.$api.framework.user.searchUser(data).then(res => {
        if (res.Status == 'OK') {
          let num = res.Return.rowNum;
          this.userNum = num || '';
          this.label1 = this.getLabel(this.$t('page.basicinfo'), 'role');
          this.label4 = this.getLabel(this.$t('page.auth'), 'auth');
          this.label2 = this.getLabel(this.$t('term.framework.menberlist') + (this.userNum ? '(' + this.userNum + ')' : ''), 'adduser');
          this.label3 = this.getLabel(this.$t('term.framework.grouplist'), 'addgroup');
        }
      });
    },
    //获取用户授权列表
    getAuthSelect: function(val) {
      let roleList = [val];
      let data = {
        roleUuidList: roleList
      };
      this.$api.common.getRoleAuth(data).then(res => {
        if (res.Status == 'OK') {
          let roleAuthList = res.Return.roleAuthList;
          this.authRoleSelectList = JSON.parse(JSON.stringify(roleAuthList));
          this.defaultAuthUserSelectList = roleAuthList; // 修复切换到基本信息，选择不保存，再次切换到授权tab时，没有恢复为原始数据
        }
      });
    },
    //获取所有角色
    getAllrole: function() {
      let param = {
        needPage: false
      };
      this.$api.framework.role
        .roleList(param)
        .then(res => {
          if (res.Status == 'OK') {
            this.allroleList = res.Return.tbodyList;
          }
        })
        .catch(error => {
          this.$Notice.error({ title: error.data.Message });
        });
    },
    //获取所有权限列表
    getAuthList: function() {
      let data = {};
      let _this = this;
      this.$api.common
        .getAuthGrouplist(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.authList = res.Return.authGroupList;
          }
        })
        .catch(error => {
          this.$Notice.error({ title: error.data });
        });
    },
    //tabs点击
    tabClick(name) {
      this.isRefreshCommonAuth = false;
      this.authRoleSelectList = this.defaultAuthUserSelectList; // 修复切换到基本信息，选择不保存，再次切换到授权tab时，没有恢复为原始数据
      this.leaveName = name;
      if (this.tabsName == 'role' && !this.$refs.roleForm.valid()) {
        this.tabSaveTip = true; //form校验不通过无法跳转
      } else {
        if (this.tabsName != name) {
          if (name != 'role' && this.tabsName == 'role') {
            let newData = this.$refs.roleForm.getFormValue();
            if (JSON.stringify(newData) == JSON.stringify(this.roleTabsDataList)) {
              this.tabSaveTip = false; //可以跳转
            } else {
              this.tabSaveTip = true;
              this.tabsaveModel = true; //打开模态框
            }
          } else if (name != 'auth' && this.tabsName == 'auth') {
            let newData = this.$refs.commonAuth.authSelectList;
            if (JSON.stringify(newData) == JSON.stringify(this.roleTabsAuthList)) {
              this.tabSaveTip = false; //可以跳转
            } else {
              this.tabSaveTip = true;
              this.tabsaveModel = true; //打开模态框
            }
          } 
        }
      }
      return this.tabSaveTip;
    },
    //tabs model跳转确认
    tabsJumping(val) {
      if (val == 'ok') {
        //调用接口
        this.editSave();
        this.tabsaveModel = false;
        this.tabsName = this.leaveName;
        this.roleData = this.getData();
        this.tabSaveTip = false; // 解决模态框弹出后，点击确认取消按钮后，tab不可点击的问题
      } else if (val == 'cancel') {
        this.tabsaveModel = false;
        this.tabSaveTip = false; // 解决模态框弹出后，点击确认取消按钮后，tab不可点击的问题
        this.tabsName = this.leaveName;
        this.isRefreshCommonAuth = true; // 修复切换到基本信息，选择不保存，再次切换到授权tab时，没有恢复为原始数据
      }
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
    //保存成功跳转
    editCrrentRole() {
      let val = '';
      if (this.newRoleUuid != null) {
        val = this.newRoleUuid;
      }
      this.$router.push({
        path: 'role-addview',
        query: { uuid: val }
      });
    },
    //继续创建
    continueCreate() {
      this.$router.push({
        path: 'role-addview',
        query: { uuid: '', key: Date.now() }
      });
    },
    //获取个性化设置
    getProfile: function() {
      let data = {};
      this.$api.framework.user
        .getProfile(data)
        .then(res => {
          if (res.Status == 'OK') {
            let data = res.Return;
            data.forEach(item => {
              if (item.config) {
                item.config = JSON.parse(item.config);
              }
            });

            let list = data.find(d => d.moduleId == 'framework');
            let obj = list.config.find(d => d.value == 'rolecreatesuccess');
            if (obj != undefined) this.convenienceDetail = obj;
          }
        })
        .catch(error => {
          this.$Message.error(error);
        });
    },
    //保存个性化设置
    saveProfile: function(val) {
      if (!this.submitMessage) {
        return;
      } else {
        let data = {
          moduleId: 'framework',
          checked: 0,
          name: 'rolecreatesuccess',
          operate: val
        };
        this.$api.framework.user.saveProfile(data).then(res => {
          if (res.Status == 'OK') {
            // this.$Message.success('操作成功！');
          }
        });
      }
    },
    backRoleManage() {
      this.$router.push({
        path: '/role-manage'
      });
    }
  },

  filter: {},

  computed: {},

  watch: {
    uuid() {
      if (this.uuid != undefined) {
        let uuid = this.uuid;
        this.getRoleDetail(uuid);
        this.getAuthSelect(uuid);
        this.getUserNum(uuid);
      }
    }
  },
  //路由离开之前
  beforeRouteLeave(to, from, next, url) {
    let data = this.getData();
    to ? this.path = to.fullPath : this.path = '';
    if (JSON.stringify(data) == JSON.stringify(this.roleData) || this.timer) {
      url ? this.$utils.gotoHref(url) : next();
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(this, {
        save: {
          fn: async(vnode) => {
            if (this.uuid) {
              return await _this.editSave();
            } else if (this.current == 3) {
              return await _this.submit();
            } else {
              return false;
            }
          }
        }
      }, to, from, next, url);
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/framework/manage.less';
.role-addview {
  /deep/ .top {
    button {
      margin-left: 8px;
    }
  }
  /deep/.tscontain-body{
    overflow: hidden;
  }
  /deep/ .content {
    height: 100%;
    .step {
      width: 50%;
      margin: 0 auto;
      padding: 40px 0;
    }
    .form {
      width: 40%;
      margin: 0 auto;
      button {
        margin-left: 120px;
      }
    }
    .btn {
      button {
        margin-right: @space-xs;
      }
    }
  }
  /deep/ .ivu-tabs-nav .ivu-tabs-tab {
    padding: 0px;
  }
  /deep/ .ivu-tabs-bar {
    border: none;
  }
  /deep/ .ivu-tabs {
    height: 100%;
  }
}
.vertical-center-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  /deep/ .ivu-modal {
    top: 12px;
  }
}
.temporaryModelBox {
  position: relative;
  width: 100%;
  padding: 32px 0 0 64px;
  text-align: left;
  h5 {
    font-size: 16px;
  }
  p {
    line-height: 22px;
  }
}
.submitModelBox {
  text-align: center;
  button {
    width: 200px;
  }
  .submit-model-title {
    font-size: @line-height-menu;
    margin-bottom: 32px;
    > i {
      background-color: @success-color;
      border-radius: 50px;
      padding: 5px;
      margin-right: 30px;
      &::before {
        color: @white;
      }
    }
  }
  .submit-btn-list {
    margin-bottom: 10px;
  }
}
</style>
