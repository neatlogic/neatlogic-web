<template>
  <div class="user_setting">
    <TsContain :hideHeader="true">
      <template v-slot:content>
        <div class="user_content">
          <Tabs v-model="paneName">
            <TabPane :label="$t('page.basicinfo')" name="usersetting">
              <TsForm ref="usersetting" :itemList="formSetting">
                <template v-slot:avatar>
                  <AvatarSetting class="avatar-upload">
                    <TsAvatar
                      v-bind="userInfo"
                      size="72"
                      class="avatar"
                      :data-content="$t('term.framework.changeavatar')"
                    ></TsAvatar>
                  </AvatarSetting>
                </template>
                <template v-slot:roleUuidList>
                  <div>
                    <Tag v-for="(item, index) in userInfo.roleList" :key="index" class="ivu-tag">{{ item.description }}</Tag>
                  </div>
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
                <template v-slot:token>
                  <div>
                    <span class="mr-md">{{ userToken }}</span>
                    <span><Button
                      size="small"
                      type="default"
                      @click="resetCurrentUserToken()"
                    >{{ $t('term.framework.recreate') }}</Button></span>
                  </div>
                </template>
              </TsForm>
              <Button class="save" type="primary" @click="save()">{{ $t('page.save') }}</Button>
            </TabPane>
            <TabPane :label="$t('term.framework.modifypwd')" name="password">
              <TsForm ref="password" :itemList="pwdSetting"></TsForm>
              <Button class="save" type="primary" @click="save()">{{ $t('page.save') }}</Button>
            </TabPane>
            <TabPane :label="$t('term.framework.custom')" name="convenience">
              <div v-show="paneName === 'convenience'">
                <div class="convenience">
                  <p class="title">{{ $t('term.framework.popupalert') }}</p>
                  <TsTable
                    v-bind="tableConfig"
                    :theadList="theadList"
                    :hideAction="false"
                  >
                    <template v-slot:checked="{ row }">
                      <i-switch
                        v-model="row.checked"
                        :true-value="1"
                        :false-value="0"
                        @on-change="changeChecked(row.moduleId, row)"
                      ></i-switch>
                    </template>
                    <template v-slot:userProfileOperateList="{ row }">
                      <Checkbox
                        v-for="(mitem, mindex) in row.userProfileOperateList"
                        :key="mindex"
                        v-model="mitem.checked"
                        class="check-list"
                        :disabled="row.checked ? true : false"
                        :true-value="1"
                        :false-value="0"
                        @on-change="changeProfileList(row.moduleId, row, mitem)"
                      >{{ mitem.text }}</Checkbox>
                    </template>
                  </TsTable>
                  <!-- <div class="setting-wrapper">
                    <div class="setting-top">
                      <TsRow>
                        <Col :xs="4">
                          <span class="text-grey">模块</span>
                        </Col>
                        <Col :xs="4">
                          <span class="text-grey">内容</span>
                        </Col>
                        <Col :xs="4">
                          <span class="text-grey">禁用/启用</span>
                        </Col>
                        <Col :xs="12">
                          <span class="text-grey">默认选项</span>
                        </Col>
                      </TsRow>
                    </div>
                    <div class="setting-content bg-op">
                      <div v-for="(item, index) in convenienceList" :key="index">
                        <div v-for="(citem, cindex) in item.config" :key="cindex" class="item">
                          <TsRow>
                            <Col :xs="4">
                              <span>{{ item.moduleName }}</span>
                            </Col>
                            <Col :xs="4">
                              <span>{{ citem.text }}</span>
                            </Col>
                            <Col :xs="4">
                              <span>
                                <i-switch
                                  v-model="citem.checked"
                                  :true-value="1"
                                  :false-value="0"
                                  @on-change="changeChecked(item.moduleId, citem)"
                                ></i-switch>
                              </span>
                            </Col>
                            <Col :xs="12">
                              <Checkbox
                                v-for="(mitem, mindex) in citem.userProfileOperateList"
                                :key="mindex"
                                v-model="mitem.checked"
                                class="check-list"
                                :disabled="citem.checked ? true : false"
                                :true-value="1"
                                :false-value="0"
                                @on-change="changeProfileList(item.moduleId, citem, mitem)"
                              >{{ mitem.text }}</Checkbox>
                            </Col>
                          </TsRow>
                        </div>
                      </div>
                    </div>
                  </div> -->
                </div>
                <!-- 默认页管理 -->
                <DefaultpageManage />
              </div>
            </TabPane>
            <TabPane v-if="canShow" :label="$t('term.framework.missionauth')" name="task">
              <TaskAuthorization></TaskAuthorization>
            </TabPane>
          </Tabs>
        </div>
      </template>
    </TsContain>
  </div>
</template>

<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
import DefaultpageManage from './user-setting-defaultpage-manage';
import TaskAuthorization from './user-setting-task-authorization';
import AvatarSetting from './user-setting-avatar';
import TsAvatar from 'components/TsAvatar/TsAvatar';
export default {
  name: 'UserSetting',

  components: {
    TsForm,
    DefaultpageManage,
    TaskAuthorization,
    AvatarSetting,
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsAvatar
  },
  props: [''],
  data() {
    return {
      tableConfig: {
        rowNum: 0,
        pageSize: 20,
        currentPage: 1,
        tbodyList: []
      },
      theadList: [
        {
          title: this.$t('page.module'),
          key: 'moduleName'
        },
        {
          title: this.$t('page.content'),
          key: 'text'
        },
        {
          title: this.$t('page.disable') + '/' + this.$t('page.enable'),
          key: 'checked'
        },
        {
          title: this.$t('term.framework.defaultitem'),
          key: 'userProfileOperateList'
        }
      ],
      userToken: '', //用户令牌
      teamRoleList: [],
      paneName: this.$route.query.paneName || 'usersetting',
      formSetting: [
        {
          type: 'slot',
          name: 'avatar',
          label: this.$t('page.avatar'),
          labelAlign: 'center'
        },
        {
          type: 'text',
          name: 'uuid',
          value: '',
          readonly: true,
          disabled: true,
          isHidden: true,
          placeholder: '',
          width: 250,
          label: 'uuid'
        },
        {
          type: 'text',
          name: 'userId',
          value: '',
          readonly: true,
          disabled: true,
          isHidden: false,
          placeholder: '',
          width: 250,
          label: this.$t('page.userid')
        },
        {
          type: 'text',
          name: 'userName',
          value: '',
          readonly: false,
          disabled: false,
          isHidden: false,
          placeholder: '',
          maxlength: 50,
          width: 250,
          label: this.$t('page.username'),
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.username')}) }, { name: 'name-special' }]
        },
        {
          type: 'tel',
          name: 'phone',
          value: '',
          readonly: false,
          disabled: false,
          isHidden: false,
          placeholder: '',
          maxlength: 11,
          width: 250,
          label: this.$t('page.phone'),
          validateList: [{ name: 'phone', message: this.$t('message.pleaseentertruetarget', {target: this.$t('page.phonenumber')}) }]
        },
        {
          type: 'email',
          name: 'email',
          value: '',
          readonly: false,
          disabled: false,
          isHidden: false,
          placeholder: '',
          maxlength: 50,
          width: 250,
          label: this.$t('page.email'),
          validateList: [{ name: 'mail', message: this.$t('message.pleaseentertruetarget', {target: this.$t('page.email')}) }]
        },
        {
          type: 'slot',
          label: this.$t('page.role'),
          name: 'roleUuidList'
        },
        {
          type: 'slot',
          label: this.$t('term.framework.grouprole'),
          name: 'teamRoleList'
        },
        {
          type: 'slot',
          label: this.$t('term.framework.token'),
          name: 'token'
        }
      ],
      pwdSetting: [
        {
          type: 'password',
          name: 'password',
          value: '',
          readonly: false,
          disabled: false,
          isHidden: false,
          placeholder: '',
          width: 250,
          label: this.$t('term.framework.currentpwd'),
          showPassword: true,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.framework.currentpwd')}) }]
        },
        {
          type: 'password',
          name: 'newpwd',
          value: '',
          readonly: false,
          disabled: false,
          isHidden: false,
          placeholder: '',
          width: 250,
          label: this.$t('term.framework.newpwd'),
          showPassword: true,
          validateList: [
            { name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.framework.newpwd')}) },
            {
              name: 'passcode',
              message: this.$t('message.passcode')
            }
          ]
        },
        {
          type: 'password',
          name: 'confirmpwd',
          value: '',
          readonly: false,
          disabled: false,
          isHidden: false,
          placeholder: '',
          width: 250,
          label: this.$t('term.framework.confirmpwd'),
          showPassword: true,
          validateList: [
            { name: 'required', message: this.$t('term.framework.pleaseconfirmnewpwd') },
            {
              name: 'passcode',
              message: this.$t('message.passcode')
            }
          ]
        }
      ],
      convenienceList: []
    };
  },

  created() {
    this.initForm();
    this.getProfileList();
    this.getCurrentUserToken();
    this.getUserInfo();
  },

  methods: {
    resetCurrentUserToken() {
      this.$api.framework.user.resetCurrentUserToken().then(res => {
        if (res.Status == 'OK') {
          this.userToken = res.Return;
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    getUserInfo() {
      let data = {};
      this.$api.framework.user.getUser(data).then(res => {
        if (res.Status == 'OK') {
          this.teamRoleList = res.Return.teamRoleList;
        }
      });
    },
    getCurrentUserToken() {
      this.$api.common.getCurrentUserToken().then(res => {
        this.userToken = res.Return;
      });
    },
    //初始化表单
    initForm: function() {
      this.formSetting.forEach(item => {
        item.value = this.userInfo[item.name];
      });
    },
    //个性化查询
    getProfileList: function() {
      let data = {};
      this.$api.framework.user.getProfile(data).then(res => {
        if (res.Status == 'OK') {
          this.convenienceList = res.Return;
          this.convenienceList.forEach(item => {
            if (item.config) {
              item.config = JSON.parse(item.config);
            }
          });
          let configList = [];
          this.convenienceList.forEach(v => {
            if (v.config) {
              v.config.forEach(j => {
                j.moduleId = v.moduleId;
                j.moduleName = v.moduleName;
                configList.push(j);
              });
            }
          });
          this.tableConfig.tbodyList = configList;
        }
      });
    },
    //多选按钮修改
    changeProfileList(moduleId, val, clival) {
      if (clival.checked == '1') {
        val.userProfileOperateList.forEach(item => {
          if (item.value != clival.value) {
            item.checked = 0;
          }
        });
      }
      let data = {
        moduleId: moduleId,
        checked: 0,
        name: val.value,
        operate: clival.value
      };
      this.saveProfile(data);
    },
    //开关按钮修改
    changeChecked(val, clival) {
      if (clival.checked == '1') {
        clival.userProfileOperateList.forEach(item => {
          item.checked = 0;
        });
      } else {
        clival.userProfileOperateList.forEach((item, index) => {
          if (index == clival.userProfileOperateList.length - 1) {
            item.checked = 1;
          }
        });
      }
      let obj = clival.userProfileOperateList.find(d => d.checked == '1');
      let operate = '';
      if (obj !== undefined) operate = obj.value;
      let data = {
        moduleId: val,
        checked: clival.checked,
        name: clival.value,
        operate: operate
      };
      this.saveProfile(data);
    },
    save: function() {
      let _this = this;
      let refsName = this.paneName;
      if (!this.$refs[refsName].valid()) {
        return;
      }
      let data = this.$refs[refsName].getFormValue();
      if (refsName == 'password') {
        let oldpwd = '{MD5}' + _this.$md5(data.password);
        let userpwd = '{MD5}' + _this.$md5(data.newpwd);
        let newpwd = '{MD5}' + _this.$md5(data.confirmpwd);
        // if (oldpwd !== userpwd) {
        //   this.$Notice.error({
        //     title: "当前密码不正确",
        //     duration: 1.5
        //   });
        //   return;
        // }
        // if (newpwd == oldpwd) {
        //   this.$Notice.error({
        //     title: "新密码跟旧密码不能一样",
        //     duration: 1.5
        //   });
        //   return;
        // }
        if (data.newpwd !== data.confirmpwd) {
          this.$Notice.error({
            title: this.$t('message.savefailed'),
            desc: this.$t('term.framework.pwdnotsame'),
            duration: 2
          });
          return;
        }
        let pwdData = {
          oldPassword: oldpwd,
          userId: this.userInfo.userId,
          password: newpwd
        };
        this.$api.framework.user
          .updatePwd(pwdData)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.updatesuccess'));
              // this.$refs[refsName].resetFields();
            }
          })
          .catch(error => {
            this.$Notice.error({
              title: this.$t('message.modifyfail'),
              desc: error.data.Message,
              duration: 2
            });
          });
      } else {
        delete data.token;
        if (this.userInfo.roleUuidList == undefined) {
          data.roleUuidList = '';
        }
        data.roleUuidList = _this.userInfo.roleUuidList;
        this.$api.framework.user.saveCurrentUser(data).then(res => {
          if (res.Status == 'OK') {
            this.$store.dispatch('getUserInfo');
            this.$Message.success(this.$t('message.savesuccess'));
          }
        });
      }
    },
    //个性化保存
    saveProfile: function(data) {
      this.$api.framework.user
        .saveProfile(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        });
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    },
    avatar() {
      return this.$store.getters.userAvatar;
    },
    hasAuth() {
      //任务授权权限
      return this.$store.getters.userAuthList.includes('PROCESS_BASE');
    },
    moduleList() {
      return this.$store.state.topMenu.moduleList;
    },
    canShow() {
      return this.hasAuth && !this.$utils.isEmpty(this.moduleList) && this.moduleList.some((v) => v.moduleId == 'process');
    }
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.user_setting {
  position: relative;
  .user_content {
    // /deep/.ivu-tabs {
    //   /deep/.ivu-tabs-bar{
    //     border-bottom: 0px solid #ccc!important;
    //   }
    // }
    .avatar-upload {
      position: relative;
      .avatar {
        cursor: pointer;
        position: relative;
        &:hover {
          &::before {
            content: attr(data-content);
            position: absolute;
            z-index: 2;
            display: block;
            width: 72px;
            height: 72px;
            line-height: 72px;
            text-align: center;
            border-radius: 50%;
            font-size: 13px;
            color: @white;
            background-color: rgba(0, 0, 0, 0.6);
          }
        }
      }
    }
  }
  .save {
    margin-left: 120px;
  }
  .convenience {
    .title {
      margin-bottom: 8px;
      font-size: 13px;
    }
    // .setting-wrapper {
    //   width: 100%;
    //   height: 100%;
    //   .setting-top {
    //     height: 40px;
    //     line-height: 40px;
    //     padding: 0 @space-md;
    //     margin-bottom: -1px;
    //   }
    //   .setting-content {
    //     .item {
    //       padding: @space-xs @space-md;
    //       .check-list {
    //         width: 136px;
    //       }
    //     }
    //   }
    // }
  }
  .ivu-tag {
    font-size: @font-size-base;
  }
}
</style>
<style lang="less" scoped>
/deep/.ivu-tabs-bar{
  border-bottom: 0px solid #ccc!important;
}
.tsfont-arrow-right{
  font-size: 12px;
}
/deep/ .tscontain-body{
  height: calc(100vh - 50px - 16px) !important;
}
</style>
