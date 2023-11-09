<template>
  <div class="team-addview">
    <TsContain>
      <template v-slot:navigation>
        <template v-if="canBack">
          <span class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
        </template>
        <template v-else>
          <span>{{ $t('term.framework.grouplist') }}</span>
        </template>
      </template>
      <template v-slot:topLeft>
        <span class="block-item">{{ isAdd? $t('dialog.title.createtarget', {target: $t('page.group')}):$t('dialog.title.edittarget', {target: $t('page.group')}) }}</span>
      </template>
      <div slot="topRight" class="top">
        <div class="bar-top">
          <div class="bar-top-right">
            <div v-if="isAdd">
              <Button v-show="current > 0" type="default" @click="current -= 1">{{ $t('page.previousstep') }}</Button>
              <Button v-show="current < 1" type="primary" @click="next(current+1)">{{ $t('page.thenextstep') }}</Button>
              <Button
                v-show="current == 1"
                type="primary"
                :loading="isLoading"
                class="submitBtn"
                @click="addSave"
              >{{ $t('page.save') }}</Button>
            </div>
            <div v-else>
              <!-- <Button type="default" @click="saveTeam()">{{ $t('page.save') }}</Button> -->
            </div>
          </div>
        </div>
      </div>
      <div slot="content" class="content">
        <div v-if="isAdd">
          <div class="step">
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
            <BaseDetail
              ref="teamForm"
              :uuid="uuid"
              :isEdit="isEdit"
              :isAdd="isAdd"
            ></BaseDetail>
            <Button v-show="current != 2 && current == 0" type="primary" @click="next(current+1)">{{ $t('page.thenextstep') }}</Button>
          </div>
          <div v-show="current == 1" class="adduser">
            <CommonAdduser ref="commonAdduser" :type="type" :isTeam="true"></CommonAdduser>
          </div>
        </div>
        <div v-else style="height:100%;">
          <Tabs v-model="tabsName">
            <TabPane :label="label1" name="teamTabs">
              <div class="form">
                <BaseDetail
                  ref="teamForm"
                  :uuid="uuid"
                  :isEdit="isEdit"
                  :isAdd="isAdd"
                ></BaseDetail>
                <Button
                  type="primary"
                  class="save"
                  :loading="isLoading"
                  @click="saveTeam()"
                >{{ $t('page.save') }}</Button>
              </div>
            </TabPane>
            <TabPane :label="label2" name="userTabs">
              <div class="auth">
                <CommonAdduser
                  ref="commonAdduser"
                  :authName="uuid"
                  :type="type"
                  :isTeam="true"
                  :refreshListSetting="refreshListSetting"
                  @saveUser="saveTeam"
                  @saveLevel="saveLevel"
                  @deleteOk="deleteOk"
                ></CommonAdduser>
                <!-- <Button type="primary" class="save" @click="saveTeam()">{{ $t('page.save') }}</Button> -->
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </TsContain>
    <TsDialog
      :isShow.sync="submitModel"
      className="vertical-center-modal"
      width="437"
      :hasHeader="false"
      :hasFooter="false"
    >
      <div class="submitModelBox">
        <div class="submit-model-title">
          <Icon type="i-icon tsfont-check" size="30" class="text-op" />{{ $t('term.deploy.createsuccess') }}
        </div>
        <div class="submit-btn-list">
          <Button size="large" type="primary" @click="$back(),saveProfile('backteamlist')">{{ $t('term.framework.returntogrouplist') }}</Button>
        </div>
        <div class="submit-btn-list">
          <Button size="large" @click="continueCreate(),saveProfile('keeponcreate')">{{ $t('term.framework.continuecreate') }}</Button>
        </div>
        <div class="submit-btn-list">
          <Button size="large" @click="editCrrentTeam(),saveProfile('editteam')">{{ $t('dialog.title.edittarget',{'target':$t('page.group')}) }}</Button>
        </div>
        <div class="submit-btn-list">
          <Checkbox v-model="submitMessage">{{ $t('term.framework.notips') }}</Checkbox>
        </div>
      </div>
    </TsDialog>
    <TsDialog
      :isShow.sync="tabsaveModel"
      width="437"
      :title="$t('page.tip')"
      :cancelText="$t('page.cancel')"
      :content="$t('term.framework.saveusergroupchange')"
      :okText="$t('page.confirm')"
      @on-ok="tabsJumping('ok')"
      @on-cancel="tabsJumping('cancel')"
    >
    </TsDialog>
  </div>
</template>

<script>
import BaseDetail from './team/base-detail.vue';
export default {
  name: '',
  components: {
    BaseDetail,
    CommonAdduser: resolve => require(['./common/common-adduser.vue'], resolve)
  },
  props: [],
  data() {
    return {
      type: 'team',
      uuid: null, //分组id
      isAdd: null,
      current: 0, //步骤
      stepList: [this.$t('page.basicinfo'), this.$t('dialog.title.addtarget', {target: this.$t('page.member')})],
      stepStatus: 'process', //步骤状态
      tagValueList: [],
      tagList: [],
      reName: false, //分组重命名判断
      label1: '',
      label2: '',
      tabsName: null, //tabs标签
      leaveName: '', //准备进入tabsname
      submitModel: false, //个性化设置弹框提醒
      submitMessage: false, //不再提示
      convenienceDetail: null, //个性化设置
      timer: null,
      isLoading: false,
      tabsaveModel: false,
      path: '', //跳转路径
      userNum: '',
      teamTabsDataList: null, //用户组基本信息数据
      teamUserUuidList: null, //用户组授权信息数据
      teamData: null,
      isEdit: null,
      canBack: false,
      refreshListSetting: {
        isRefreshTeamUserList: false // 组列表
      }
    };
  },
  beforeCreate() {},
  created() {
    this.uuid = this.$route.query.uuid || null;
    this.isAdd = this.$route.query.isAdd || null;
    this.tabsName = this.$route.query.key || null;
    this.isEdit = this.$route.query.isEdit ? '1' : '0';
    if (typeof this.isAdd == 'string') {
      this.isAdd = this.isAdd !== 'false';
    }
  },
  beforeMount() {},
  mounted() {
    this.getProfile();
    let _this = this;
    this.timer = setInterval(() => {
      if (_this.$refs.teamForm && _this.$refs.commonAdduser) {
        _this.teamTabsDataList = _this.$refs.teamForm.getFormValue();
        _this.teamUserUuidList = _this.$utils.deepClone(_this.$refs.commonAdduser.userUuidList);
        _this.teamData = _this.getData();
        _this.clear();
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
    clear() {
      clearInterval(this.timer);
      this.timer = null;
    },
    //tabs model跳转确认
    tabsJumping(val) {
      if (val == 'ok') {
        //调用接口
        this.saveTeam();
        this.tabsaveModel = false;
        this.tabsName = this.leaveName;
        // this.roleData = this.getData();
      } else if (val == 'cancel') {
        this.tabsaveModel = false;
        this.tabsName = this.leaveName;
      }
    },
    //获取用户数量
    getUserNum: function(val) {
      let data = {
        teamUuid: val,
        keyword: ''
      };
      this.$api.framework.user.searchUser(data).then(res => {
        if (res.Status == 'OK') {
          let num = res.Return.rowNum;
          this.label1 = this.getLabel(this.$t('page.basicinfo'), 0, 'teamTabs');
          this.label2 = this.getLabel(this.$t('term.framework.menberlist'), num, 'userTabs');
        }
      });
    },
    //tabs点击
    tabClick(name) {
      this.leaveName = name;
      if (this.tabsName == 'teamTabs' && !this.$refs.teamForm.valid()) {
        this.tabSaveTip = true; //form校验不通过无法跳转
      } else {
        if (this.tabsName != name) {
          if (name == 'userTabs') {
            let newData = this.$refs.teamForm.getFormValue();
            if (this.$utils.isSame(newData, this.teamTabsDataList)) {
              this.tabSaveTip = false; //可以跳转
            } else {
              this.tabSaveTip = true;
              this.tabsaveModel = true; //打开模态框
            }
          }
          if (name == 'teamTabs') {
            // 成员列表
            // 点击切换，实时保存数据，点击切换不需要验证是否需要保存
            // let newData = this.$refs.commonAdduser.userUuidList;
            // if (this.$utils.isSame(newData, this.teamUserUuidList)) {
            //   this.tabSaveTip = false; //可以跳转
            // } else {
            //   this.tabSaveTip = true;
            //   this.tabsaveModel = true; //打开模态框
            // }
            this.tabSaveTip = false; //可以跳转
          }
        }
      }
      return this.tabSaveTip;
    },
    getData() {
      let teamData = this.$refs.teamForm.getFormValue();
      let userUuidList = this.$refs.commonAdduser.userUuidList;
      teamData.userUuidList = userUuidList;
      this.canBack = true;
      return this.$utils.deepClone(teamData);
    },
    stepClick(index) {
      //步骤条点击
      if (this.current == '0' && index !== '0') {
        this.next(index);
      } else {
        this.current = index;
      }
    },
    next(index) {
      if (!this.$refs.teamForm.valid()) {
        this.stepStatus = 'error';
        return;
      }
      this.reName = true;
      if (this.reName) {
        this.stepStatus = 'process';
        this.current = index;
      }
    },
    getLabel(label, num, name) {
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
          //label
          [
            h('span', label),
            num ? h('span', `(${num})`) : null
            // h('Badge', {
            //   props: {
            //     count: num
            //   }
            // })
          ]
        );
      };
    },
    async saveTeam() {
      //保存 添加  编辑用户组
      if (this.tabsName == 'teamTabs') {
        if (this.$refs.teamForm.valid()) {
          let data = {
            uuid: null,
            tagIdList: null,
            name: null
          };
          Object.assign(data, this.$refs.teamForm.getFormValue());

          data.sort = 1;
          if (this.uuid && this.isAdd) {
            //新增下级分组
            data.parentUuid = this.uuid;
          } else if (this.uuid) {
            //编辑分组
            data.uuid = this.uuid;
          }
          await this.$api.framework.team
            .saveTeamDetail(data)
            .then(res => {
              if (res.Status == 'OK') {
                this.uuid = res.Return.uuid;
                this.teamTabsDataList = this.$refs.teamForm.getFormValue();
                this.teamData = this.getData();
                this.$Message.success(this.$t('message.savesuccess'));
              }
            })
            .catch(error => {
              this.$Notice.error({
                title: error.data.Message
              });
            });
        } else {
          return false;
        }
      } else if (this.tabsName == 'userTabs') {
        //保存 批量添加分组成员
        let _this = this;
        let data = {
          teamUuid: _this.uuid,
          userUuidList: this.$refs.commonAdduser.getSaveUuidList()
        };
        await this.$api.framework.team.addUserForTeam(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.saveUserData();
          }
        });
      }
    },
    deleteOk() {
      this.saveUserData();
    },
    //保存当前用户信息，用于跳转判断
    saveUserData() {
      this.refreshListSetting.isRefreshTeamUserList = false; // 设置默认值
      this.teamUserUuidList = this.$utils.deepClone(this.$refs.commonAdduser.userUuidList);
      this.teamData = this.getData();
      this.getUserNum(this.uuid);
      this.refreshListSetting.isRefreshTeamUserList = true; // 刷新成员列表
    },
    //保存职务
    saveLevel() {
      this.teamData = this.getData();
      this.teamUserUuidList = this.$utils.deepClone(this.$refs.commonAdduser.userUuidList);
    },
    async addSave() {
      this.isLoading = true;
      let teamData = this.$refs.teamForm.getFormValue();
      teamData.userUuidList = this.$refs.commonAdduser.saveUuidList;
      if (this.uuid && this.isAdd) { //新增下级分组
        teamData.parentUuid = this.uuid;
      }
      await this.$api.framework.team.saveTeamDetail(teamData).then(res => {
        if (res.Status == 'OK') {
          this.uuid = res.Return.uuid;
          this.teamData = this.getData();
          if (this.convenienceDetail && this.convenienceDetail.checked == '1') {
            this.submitModel = true;
          } else {
            this.$Message.success(this.$t('message.executesuccess'));
            let data = this.convenienceDetail.userProfileOperateList.find(d => d.checked == '1');
            let value = data.value;
            switch (value) {
              //返回用户列表
              case 'backteamlist':
                this.$back();
                break;
                //编辑用户
              case 'editteam':
                this.editCrrentUser();
                break;
                //继续创建
              case 'keeponcreate':
                this.continueCreate();
                break;
            }
          }
        }
      }).catch(error => {
        this.$Notice.error({
          title: error.data.Message
        });
      }).finally(() => { this.isLoading = false; });
    },
    //保存成功跳转
    editCrrentTeam() {
      let val = '';
      if (this.uuid != null) {
        val = this.uuid;
      }
      this.$router.push({
        path: 'team-addview',
        query: {
          uuid: val,
          isAdd: false
        }
      });
    },
    //继续创建
    continueCreate() {
      let obj = {
        uuid: this.uuid,
        isAdd: true,
        key: 'userTabs'
      };
      this.$router.push({
        path: 'team-addview',
        query: obj
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
            let obj = list.config.find(d => d.value == 'teamcreatesuccess');
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
          name: 'teamcreatesuccess',
          operate: val
        };
        this.$api.framework.user.saveProfile(data).then(res => {
          if (res.Status == 'OK') {
            // this.$Message.success('操作成功！');
          }
        });
      }
    },
    filterUserUuidList(data) {
      // 编辑分组信息时，过滤用户列表字段
      let dataObj = this.$utils.deepClone(data);
      if (!this.$utils.isEmptyObj(dataObj) && this.uuid) {
        for (let k in dataObj) {
          if (k && k === 'userUuidList') {
            this.$delete(dataObj, k);
          }
        }
      }
      return dataObj;
    }
  },
  filter: {},
  computed: {},
  watch: {
    uuid: function() {
      if (this.uuid != undefined) {
        let uuid = this.uuid;
        this.getUserNum(uuid);
      }
    }
  },
  //路由离开之前
  beforeRouteLeave(to, from, next, url) {
    let data = this.filterUserUuidList(this.getData());
    let teamData = this.filterUserUuidList(this.teamData);
    to ? this.path = to.fullPath : this.path = '';
    if (this.$utils.isSame(data, teamData)) {
      url ? this.$utils.gotoHref(url) : next();
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(this, {
        save: {
          fn: async(vnode) => {
            if (!this.isAdd) {
              return await _this.saveTeam();
            } else if (this.current == 1) {
              return await _this.addSave();
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
.badge {
  width: 42px;
  height: 42px;
  background: #eee;
  border-radius: 6px;
  display: inline-block;
}
.team-addview {
  .ivu-tabs-nav .ivu-tabs-tab {
    padding: 0px;
  }
  /deep/ .ivu-tabs-bar {
    border-bottom: none;
  }
  .bar-top-right {
    .submitBtn {
      margin-left: @space-md;
    }
  }
  .ivu-tabs {
    height: 100%;
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
