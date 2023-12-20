<template>
  <div class="user-addview">
    <TsContain border="border">
      <template v-slot:navigation>
        <template v-if="canBack">
          <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
        </template>
        <template v-else>
          <span>{{ prevsetting.name }}</span>
        </template>
      </template>
      <template v-slot:topLeft>
        <span>{{ uuid && readonly?$t('term.framework.viewuser'):(uuid && !readonly?$t('dialog.title.edittarget', {target: $t('page.user')}):$t('dialog.title.createtarget', {target: $t('page.user')})) }}</span>
      </template>
      <div slot="topRight" class="top">
        <div class="bar-top">
          <div class="bar-top-right">
            <div v-if="uuid == null">
              <Button v-show="current > 0" type="default" @click="current -= 1">{{ $t('page.previousstep') }}</Button>
              <Button v-show="current != 1" type="primary" @click="next()">{{ $t('page.thenextstep') }}</Button>
              <Button
                v-show="current == 1"
                type="primary"
                :loading="isLoading"
                @click="submit()"
              >{{ $t('dialog.title.createtarget', {target: $t('page.user')}) }}</Button>
            </div>
            <div v-else>
              <Button v-if="readonly" type="primary" @click="readonly = false">{{ $t('page.edit') }}</Button>
              <Button v-else type="primary" @click="editSave()">{{ $t('page.save') }}</Button>
            </div>
          </div>
        </div>
      </div>
      <div slot="content" class="content">
        <div v-if="uuid == null">
          <div class="step">
            <!-- <Steps :current="current" :status="stepStatus">
              <Step title="基本信息" content=""></Step>
              <Step title="授权" content=""></Step>
            </Steps> -->
            <Steps :current="current" :status="stepStatus">
              <Step
                v-for="(litem, lindex) in stepList"
                :key="lindex"
                :title="litem"
                @click.native="stepClick(lindex)"
              ></Step>
            </Steps>
          </div>
          <div v-show="current == 0" class="form">
            <TsForm ref="userForm" :itemList="formData">
              <template slot="vipLevel">
                <RadioGroup v-model="formData[3].value">
                  <Radio :label="0" class="vip-level-item">
                    <span>{{ $t('page.nothave') }}</span>
                  </Radio>
                  <Radio
                    v-for="vipLevel in 1"
                    :key="vipLevel"
                    :label="vipLevel"
                    class="vip-level-item"
                  >
                    <img :src="getVipIconByLevel(vipLevel)" class="vip-icon">
                  </Radio>
                </RadioGroup>
              </template>
            </TsForm>
            <Button v-show="current != 1" type="primary" @click="next()">{{ $t('page.thenextstep') }}</Button>
          </div>
          <div v-show="current == 1" class="auth btn">
            <CommonAuth ref="commonAuth" :authList="authList" :authRoleSelectList="authRoleSelectList"></CommonAuth>
            <Button v-show="current > 0" type="default" @click="current -= 1">{{ $t('page.previousstep') }}</Button>
            <Button v-show="current != 1" type="primary" @click="next()">{{ $t('page.thenextstep') }}</Button>
            <Button
              v-show="current == 1"
              type="primary"
              :loading="isLoading"
              @click="submit()"
            >{{ $t('dialog.title.createtarget', {target: $t('page.user')}) }}</Button>
          </div>
        </div>
        <div v-else style="heigth: 100%">
          <Tabs v-model="tabsName">
            <TabPane :label="label1" name="user">
              <div class="form">
                <TsForm v-if="formShow" ref="userForm" :itemList="formData">
                  <template slot="vipLevel">
                    <RadioGroup v-model="formData[3].value" class="vip-level-item">
                      <Radio :label="0" class="vip-level-item" :disabled="readonly?true:false">
                        <span>{{ $t('page.nothave') }}</span>
                      </Radio>
                      <Radio
                        v-for="vipLevel in 1"
                        :key="vipLevel"
                        :label="vipLevel"
                        class="vip-level-item"
                        :disabled="readonly?true:false"
                      >
                        <img :src="getVipIconByLevel(vipLevel)" class="vip-icon">
                      </Radio>
                    </RadioGroup>
                  </template>
                  <template v-slot:teamRoleList>
                    <span v-for="team in teamRoleList" :key="team.id">
                      <Poptip trigger="hover" placement="right-start">
                        <Tag class="ivu-tag">{{ team.name }}</Tag>
                        <div slot="content">
                          <div v-for="(item, index) in team.teamList" :key="index">
                            <p v-if="item.name && item.childrenTeamName">{{ item.name }} <span class="tsfont-arrow-right"></span> {{ item.childrenTeamName }}</p>
                            <p v-else>{{ item.name || item.childrenTeamName }}</p>
                          </div>
                        </div>
                      </Poptip>
                    </span>
                  </template>
                  <template v-if="uuid" v-slot:token>
                    <div>
                      <span class="mr-md">{{ userToken }}</span>
                      <span><Button
                        v-show="!readonly"
                        class="reCreate"
                        size="small"
                        type="default"
                        @click="resetUserToken(uuid)"
                      >{{ $t('term.framework.recreate') }}</Button></span>
                    </div>
                  </template>
                </TsForm>
                <Button
                  v-if="!readonly"
                  type="primary"
                  :loading="isLoading"
                  class="save"
                  @click="editSave()"
                >{{ $t('page.save') }}</Button>
              </div>
            </TabPane>
            <TabPane :label="label2" name="auth">
              <div v-if="authUserSelectList !== '{}'" class="auth">
                <CommonAuth
                  v-if="!isRefreshCommonAuth"
                  ref="commonAuth"
                  :authList="authList"
                  :authUserSelectList="authUserSelectList"
                  :authRoleSelectList="authRoleSelectList"
                  :readOnly="readonly"
                ></CommonAuth>
                <Button
                  v-if="!readonly"
                  type="primary"
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
      :cancelText="$t('page.cancel')"
      :content="$t('term.framework.saveuserchange')"
      :okText="$t('page.confirm')"
      @on-ok="tabsJumping('ok')"
      @on-cancel="tabsJumping('cancel')"
    > </TsDialog>
    <TsDialog
      :isShow.sync="submitModel"
      className="vertical-center-modal"
      width="437"
      :showCloseIcon="false"
      :hasHeader="false"
      :hasFooter="false"
    >
      <div class="submitModelBox">
        <div class="submit-model-title">
          <i class="tsfont-check-s text-success"></i>{{ $t('term.deploy.createsuccess') }}
        </div>
        <div class="submit-btn-list">
          <Button size="large" type="primary" @click="backUserManage(); saveProfile('backuserlist')">{{ $t('term.framework.backtouserlist') }}</Button>
        </div>
        <div class="submit-btn-list">
          <Button size="large" @click="continueCreate(); saveProfile('keeponcreate')">{{ $t('term.framework.continuecreate') }}</Button>
        </div>
        <div class="submit-btn-list">
          <Button size="large" @click="editCrrentUser(); saveProfile('edituser')">{{ $t('dialog.title.edittarget', {target: $t('page.user')}) }}</Button>
        </div>
        <div class="submit-btn-list">
          <Checkbox v-model="submitMessage">{{ $t('term.framework.notips') }} <i class="tsfont-question-o" :title="$t('term.framework.editinsetting')"></i></Checkbox>
        </div>
      </div>
    </TsDialog>
  </div>
</template>
<script>
import CommonAuth from './common/common-auth.vue';
export default {
  name: 'UserAddview',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    CommonAuth,
    TsDialog: resolve => require(['@/resources/plugins/TsDialog/TsDialog.vue'], resolve)
  },
  props: [''],
  data() {
    let _this = this;
    return {
      formData: [
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
          name: 'userId',
          disabled: false,
          value: '',
          placeholder: '',
          maxlength: 50,
          width: '100%',
          label: 'ID',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: 'Id'}) }, { name: 'name-special' }, {
            name: 'searchUrl',
            url: '/api/rest/user/save',
            key: 'userId'
          }],
          errorMessage: ''
        },
        {
          type: 'text',
          name: 'userName',
          disabled: false,
          value: '',
          placeholder: '',
          maxlength: 50,
          width: '100%',
          label: this.$t('page.username'),
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.username')}) }, { name: 'name-special' }]
        },
        {
          type: 'slot',
          name: 'vipLevel',
          value: 0,
          width: '100%',
          label: this.$t('term.framework.userlevel')
        },
        {
          type: 'password',
          name: 'password',
          disabled: false,
          value: '',
          placeholder: '',
          label: this.$t('term.framework.setpwd'),
          clearable: false,
          width: '100%',
          showPassword: true,
          validateList: [
            { name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.password')}) },
            {
              name: 'passcode',
              message: this.$t('message.passcode')
            }
          ],
          onChange: _this.psdChange
        },
        {
          type: 'password',
          name: 'confirmpwd',
          disabled: false,
          value: '',
          placeholder: '',
          clearable: false,
          label: this.$t('term.framework.confirmpwd'),
          width: '100%',
          showPassword: true,
          validateList: [
            { name: 'required', message: this.$t('term.framework.pleaseconfirmpwd') },
            {
              name: 'passcode',
              message: this.$t('message.passcode')
            }
          ],
          onChange: _this.psdChange
        },
        {
          type: 'email',
          name: 'email',
          disabled: false,
          value: '',
          placeholder: '',
          maxlength: 50,
          width: '100%',
          label: this.$t('page.email'),
          validateList: [{ name: 'mail', message: this.$t('message.pleaseentertruetarget', {target: this.$t('page.email')}) }]
        },
        {
          type: 'tel',
          name: 'phone',
          disabled: false,
          value: '',
          placeholder: '',
          maxlength: 11,
          width: '100%',
          label: this.$t('page.phonenumber'),
          validateList: [
            { name: 'number', message: this.$t('term.framework.inputphonenumber') },
            { name: 'phone', message: this.$t('message.pleaseentertruetarget', {target: this.$t('page.phonenumber')}) }
          ]
        },
        {
          type: 'switch',
          name: 'isActive',
          disabled: false,
          value: 1,
          trueValue: 1,
          falseValue: 0,
          label: this.$t('term.report.isactive')
        },
        {
          type: 'userselect',
          name: 'teamUuidList',
          label: this.$t('page.userteam'),
          placeholder: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.framework.searchcontent')}),
          search: true,
          multiple: true,
          width: '100%',
          transfer: true,
          groupList: ['team']
        },
        {
          type: 'userselect',
          name: 'roleUuidList',
          label: this.$t('page.role'),
          search: true,
          multiple: true,
          width: '100%',
          transfer: true,
          groupList: ['role'],
          onChange: _this.roleChange
        },
        {
          type: 'slot',
          isHidden: true,
          label: this.$t('term.framework.grouprole'),
          name: 'teamRoleList'
        },
        {
          type: 'slot',
          isHidden: true,
          label: this.$t('term.framework.token'),
          name: 'token'
        }
      ],
      teamRoleList: [],
      uuid: '', //用户uuid
      userId: '', //用户id
      newUserUuid: '', //新建uuid
      current: 0, //步骤
      stepStatus: 'process', //步骤状态
      userKey: false, //判断是否有相同用户
      authList: [], //权限列表
      userDetail: null, //用户详情
      tabsName: null, //tabs标签
      authRoleSelectList: {}, //角色授权选中回显列表
      authUserSelectList: {}, //用户授权选中回显列表
      formShow: false,
      path: '', //跳转路径
      userData: null, //用户所有初始化数据
      userToken: '', //用户令牌
      userTabsDataList: null, //用户基本信息数据
      userTabsAuthList: null, //用户授权信息数据
      submitModel: false, //提交成功模态框
      label1: '',
      label2: '',
      leaveName: '', //准备进入tabsname
      tabSaveTip: true,
      tabsaveModel: false,
      readonly: false, //只读模式
      stepList: [this.$t('page.basicinfo'), this.$t('page.auth')],
      submitMessage: false, //不再提示
      convenienceDetail: null, //个性化设置
      prevsetting: {
        router: '/user-manage',
        name: this.$t('term.framework.userlist')
      },
      canBack: false,
      isLoading: false,
      defaultAuthUserSelectList: {}, // 默认授权列表回显选中数据
      isRefreshCommonAuth: false // 是否刷新授权列表
    };
  },

  beforeCreate() {},

  created() {
    if (sessionStorage.getItem('useraddPrev')) {
      let prevsetting = JSON.parse(sessionStorage.getItem('useraddPrev'));
      if (prevsetting.router != '/') {
        this.prevPath = prevsetting;
      }
    }
    let query = this.$route.query;

    this.uuid = query.uuid || null;
    this.userId = query.userId || null;
    this.tabsName = query.key || null;
    this.readonly = query.readonly || false;
    if (this.readonly && this.uuid) {
      let newConfig = this.formData.find(v => v.name === 'teamRoleList');
      if (newConfig) {
        newConfig.isHidden = false;
      }
    }
    this.label1 = this.getLabel(this.$t('page.basicinfo'), 'user');
    this.label2 = this.getLabel(this.$t('page.auth'), 'auth');
    this.getRoleList();
    this.getAuthList();
    this.getProfile();
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
    //密码框改变
    psdChange: function(val) {
      if (this.userId != null) {
        let psd = this.formData.find(d => d.name === 'password');
        let newpwd = this.formData.find(d => d.name === 'confirmpwd');
        if (val != '') {
          psd.validateList = [
            {
              name: 'passcode',
              message: this.$t('message.passcode')
            }
          ];
          newpwd.validateList = [
            {
              name: 'passcode',
              message: this.$t('message.passcode')
            }
          ];
        } else if (val == '') {
          if (psd) {
            delete psd.validateList;
          }
          if (newpwd) {
            delete newpwd.validateList;
          }
        }
      }
    },
    //步骤条点击
    stepClick(index) {
      if (index == '1') {
        this.next();
      } else {
        this.current = index;
      }
    },
    //编辑当前用户
    editCrrentUser() {
      let val = '';
      if (this.newUserUuid != null) {
        val = this.newUserUuid;
      }
      this.$router.push({
        path: 'user-addview',
        query: { uuid: val }
      });
    },
    //继续创建
    continueCreate() {
      this.$router.replace({
        path: 'user-addview',
        query: { userId: '', key: Date.now(), uuid: '' }
      });
    },
    //下一步
    next() {
      let _this = this;
      let data = this.$refs.userForm.getFormValue();
      if (!this.$refs.userForm.valid()) {
        this.stepStatus = 'error';
        return;
      }
      this.userKey = true;
      if (data.password !== data.confirmpwd) {
        this.$Message.error(this.$t('term.framework.pwdnotsame'));
        this.stepStatus = 'error';
        return;
      }
      if (this.userId != undefined) {
        this.userKey = true;
      }
      if (this.userKey) {
        this.stepStatus = 'process';
        this.current += 1;
      }
    },
    //新增保存
    async submit() {
      this.isLoading = true;
      let userData = this.$refs.userForm.getFormValue();
      userData.password = '{MD5}' + this.$md5(userData.password);
      delete userData.confirmpwd;
      delete userData.token;
      let authList = this.$refs.commonAuth.authSelectList;
      userData.userAuthList = authList;
      await this.$api.framework.user
        .saveUser(userData)
        .then(res => {
          if (res.Status == 'OK') {
            this.newUserUuid = res.Return;
            this.formData.forEach(item => {
              if (item.name == 'uuid') {
                item.value = this.newUserUuid;
              }
            });
            this.userData = this.getData();
            if (this.convenienceDetail && this.convenienceDetail.checked == '1') {
              this.submitModel = true;
            } else {
              this.$Message.success(this.$t('message.executesuccess'));
              let data = this.convenienceDetail.userProfileOperateList.find(d => d.checked == '1');
              if (data) {
                let value = data.value;
                switch (value) {
                  //返回用户列表
                  case 'backuserlist':
                    this.backUserManage();
                    break;
                  //编辑用户
                  case 'edituser':
                    this.editCrrentUser();
                    break;
                  //继续创建
                  case 'keeponcreate':
                    this.continueCreate();
                    break;
                }
              }
            }
          }
        })
        .finally(() => { this.isLoading = false; });
    },
    //编辑保存
    editSave() {
      if (this.tabsName == 'user') {
        let data = this.$refs.userForm.getFormValue();
        if (!this.$refs.userForm.valid()) {
          return false;
        }
        if (data.password !== data.confirmpwd) {
          this.$Message.error(this.$t('term.framework.pwdnotsame'));
          this.stepStatus = 'error';
          return false;
        }
        if (data.password != null) {
          data.password = '{MD5}' + this.$md5(data.password);
        }
        delete data.confirmpwd;
        delete data.token;
        this.isLoading = true;
        this.$api.framework.user
          .saveUser(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              this.userTabsDataList = this.$refs.userForm ? this.$refs.userForm.getFormValue() : null;
              this.userData = this.getData();
            }
          })
          .finally(() => { this.isLoading = false; });
      } else if (this.tabsName == 'auth') {
        let authList = this.$refs.commonAuth.authSelectList;
        let data = {
          action: 'cover',
          userAuthList: authList,
          userUuidList: [this.uuid]
        };
        this.isLoading = true;
        this.$api.common
          .saveAuth(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              this.userTabsAuthList = this.$refs.commonAuth ? this.$utils.deepClone(this.$refs.commonAuth.authSelectList) : null;
              this.userData = this.getData();
              this.defaultAuthUserSelectList = this.$utils.deepClone(authList); // 修复切换到基本信息，选择不保存，再次切换到授权tab时，没有恢复为原始数据
            }
          })
          .finally(() => { this.isLoading = false; });
      }
    },
    //获取当前用户信息
    getUserDetail(id) {
      let _this = this;
      let obj_name = this.formData.find(d => d.name === 'userId');
      let psd = this.formData.find(d => d.name === 'password');
      let newpwd = this.formData.find(d => d.name === 'confirmpwd');
      if (newpwd) {
        delete newpwd.validateList;
      }
      if (psd) {
        delete psd.validateList;
      }
      if (obj_name) {
        obj_name.disabled = true;
      }
      this.formShow = true;
      let data = {
        userUuid: id,
        isAuthEnv: false
      };
      this.$api.common.getUser(data).then(res => {
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
          this.teamRoleList = row.teamRoleList;
          let obj = this.formData.find(d => d.name === 'teamUuidList');
          if (obj) {
            obj.value = row.teamUuidList;
          }
        }
      });
    },
    //获取用户授权列表
    getAuthSelect: function(val) {
      let uuid = val;
      let data = {
        userUuid: uuid
      };
      this.$api.common.getUserAuth(data).then(res => {
        if (res.Status == 'OK') {
          let userAuthList = this.$utils.deepClone(res.Return.userAuthObj);
          this.authUserSelectList = userAuthList;
          this.defaultAuthUserSelectList = userAuthList; // 修复切换到基本信息，选择不保存，再次切换到授权tab时，没有恢复为原始数据
          let userRoleAuthList = this.$utils.deepClone(res.Return.userRoleAuthObj);
          this.authRoleSelectList = userRoleAuthList;
        }
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
            _this.authList = res.Return.authGroupList;
            _this.$nextTick(() => {
              setTimeout(() => {
                _this.userData = _this.getData();
                _this.userTabsDataList = _this.$refs.userForm.getFormValue();
                _this.userTabsAuthList = JSON.parse(JSON.stringify(_this.$refs.commonAuth.authSelectList));
              }, 500);
            });
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
          let newConfig = this.formData.find(d => d.name == 'roleUuidList');
          if (newConfig) {
            newConfig.dataList = list;
          }
        }
      });
    },
    //初始化角色所有数据
    getData() {
      let userData = this.$refs.userForm ? this.$refs.userForm.getFormValue() : {};
      let authList = this.$refs.commonAuth ? this.$refs.commonAuth.authSelectList : [];
      userData.userAuthList = authList;
      this.canBack = true;
      return this.$utils.deepClone(userData);
    },
    //tabs点击
    tabClick(name) {
      this.isRefreshCommonAuth = false;
      this.authUserSelectList = this.defaultAuthUserSelectList; // 修复切换到基本信息，选择不保存，再次切换到授权tab时，没有恢复为原始数据
      this.leaveName = name;
      if (this.tabsName == 'user' && !this.$refs.userForm.valid()) {
        this.tabSaveTip = true; //form校验不通过无法跳转
      } else {
        if (this.tabsName != name) {
          if (name == 'auth') {
            let newData = this.$refs.userForm.getFormValue();
            if (JSON.stringify(newData) == JSON.stringify(this.userTabsDataList)) {
              this.tabSaveTip = false; //可以跳转
            } else {
              this.tabSaveTip = true;
              this.tabsaveModel = true; //打开模态框
            }
          }
          if (name == 'user') {
            let newData = this.$refs.commonAuth.authSelectList;
            if (JSON.stringify(newData) == JSON.stringify(this.userTabsAuthList)) {
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
        this.userData = this.getData();
      } else if (val == 'cancel') {
        this.tabsaveModel = false;
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
    //角色下拉框修改
    roleChange(val) {
      const list = val.map(item => {
        var index = item.lastIndexOf('#');
        return item.substring(index + 1, item.length);
      });
      let data = {
        roleUuidList: list
      };
      this.$api.common.getRoleAuth(data).then(res => {
        if (res.Status == 'OK') {
          this.authRoleSelectList = res.Return.roleAuthList;
        }
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
            if (list) {
              let obj = list.config.find(d => d.value == 'usercreatesuccess');
              if (obj) {
                this.convenienceDetail = obj;
              }
            }
          }
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
          name: 'usercreatesuccess',
          operate: val
        };
        this.$api.framework.user.saveProfile(data).then(res => {
          if (res.Status == 'OK') {
            // this.$Message.success('操作成功！');
          }
        });
      }
    },
    getVipIconByLevel(vipLevel) {
      return this.$store.getters.getVipIconByLevel(vipLevel, true);
    },
    getUserToken(uuid) {
      let data = {
        userUuid: uuid
      };
      this.$api.common.getUserToken(data).then(res => {
        if (res.Status == 'OK') {
          this.userToken = res.Return;
        }
        let token = this.formData.find(d => d.name === 'token');
        if (token) {
          token.isHidden = false;
        }
      });
    },
    resetUserToken(uuid) {
      let data = {
        userUuid: uuid
      };
      this.$api.framework.user.resetUserToken(data).then(res => {
        if (res.Status == 'OK') {
          this.userToken = res.Return;
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    backUserManage() {
      this.$router.push({
        path: '/user-manage'
      });
    }
  },

  filter: {},

  computed: {},

  watch: {
    uuid() {
      if (this.uuid != undefined) {
        let uuid = this.uuid;
        this.getUserDetail(uuid);
        this.getAuthSelect(uuid);
        this.getUserToken(uuid);
      }
    },
    // userId: function () {
    //   if (this.userId != undefined) {
    //     let userId = this.userId;
    //   }
    // },
    readonly: function(newVal) {
      if (newVal) {
        this.formData.forEach(item => {
          item.disabled = true;
        });
        this.formData
          .filter(d => d.name == 'roleUuidList' || d.name == 'teamUuidList')
          .forEach(item => {
            item.readonly = true;
          });
      } else {
        this.formData.forEach(item => {
          if (this.uuid && item.name == 'userId') {
            item.disabled = true;
          } else if (item.name != 'uuid') {
            item.disabled = false;
            item.readonly = false;
          }
        });
      }
    }
  },
  //路由离开之前
  beforeRouteLeave(to, from, next, url) {
    let _this = this;
    sessionStorage.removeItem('useraddPrev');
    let newData = this.getData();
    let data = this.userData;
    to ? this.path = to.fullPath : this.path = '';
    let isSame = _this.$utils.isSame(newData, data);
    if (isSame) {
      url ? this.$utils.gotoHref(url) : next();
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(this, {
        save: {
          fn: async(vnode) => {
            if (this.uuid) {
              return await _this.editSave();
            } else if (this.current == 1) {
              return await _this.submit();
            } else {
              return false;
            }
          }
        }
      }, to, from, next, url);
    }
  },
  beforeRouteEnter(to, from, next) {
    if (from.fullPath && from.fullPath != '/') {
      let prevsetting = {
        router: from.fullPath,
        name: from.meta.title
      };
      sessionStorage.setItem('useraddPrev', JSON.stringify(prevsetting));
    }
    next();
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/framework/manage.less';
.tsfont-arrow-right{
  font-size: 12px;
}
.user-addview {
  /deep/ .top {
    button {
      margin-left: 8px;
    }
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
      .reCreate {
        margin-left: 0px;
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
  .ivu-modal {
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
    i {
      font-size: 30px;
      margin-right: 10px;
    }
  }
  .submit-btn-list {
    margin-bottom: 10px;
  }
}
</style>

<style lang="less" scoped>
.user-addview {
  .vip-level-item {
    margin-right: 10px;
  }
  .vip-icon {
    width: 24px;
    vertical-align: middle;
    transform: translateY(-1px);
  }
}
</style>
