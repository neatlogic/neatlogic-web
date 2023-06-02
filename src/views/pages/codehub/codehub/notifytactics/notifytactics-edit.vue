<template>
  <div>
    <TsContain border="none">
      <div slot="top">
        <NavGuide @goPrev="goPrev(prevPath)">
          <template v-slot:left>{{ prevPath.name }}</template>
          <template v-slot:right>
            <span>
              <span class="mr-10">{{ tacticsName }}</span>
              <i class="tsfont-edit text-action" @click="editName"></i>
            </span>
            <div class="action-top">
              <span class="action-group">
                <span class="action-item tsfont-modules" @click="editTemplateList('overview')">{{ $t('page.templatelist') }}</span>
                <span class="action-item tsfont-barlist" @click="editParamList">{{ $t('page.paramslist') }}</span>
                <span class="action-item tsfont-warning-o" @click="editUser">{{ $t('term.codehub.exceptionnotification') }}</span>
              </span>
            </div>
          </template>
        </NavGuide>
      </div>
      <div slot="content">
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div class="search-box">
          <TsRow class="input-border">
            <Col span="12">
            </Col>
            <Col span="4">
              <TsFormSelect
                v-model="hasAction"
                :clearable="false"
                :dataList="selectTrigger"
                @on-change="searchTacticsList"
              ></TsFormSelect>
            </Col>
            <Col span="8">
              <Input
                v-model="keyword"
                prefix="i-icon ts-search"
                :placeholder="$t('term.codehub.pleaseenterthetriggerpointname')"
                clearable
                @on-enter="searchTacticsList"
                @on-clear="searchTacticsList"
              ></Input>
            </Col>
          </TsRow>
        </div>
        <div class="trigger-card">
          <TsCard
            :cardList="triggerList"
            :sm="12"
            :lg="8"
            :xl="6"
            :xxl="6"
          >
            <template slot-scope="{ row }">
              <div class="trigger-list">
                <div class="title">
                  <div v-if="row.isDel || row.isDelActive" class="title-bg bg-mongolia"></div>
                  <div :class="row.isDel || row.isDelActive ? 'text-mask' : ''">
                    <span class="trigger-name">
                      {{ row.triggerName }}
                    </span>
                  </div>
                  <div v-if="row.notifyList && row.notifyList.length > 0">
                    <div class="number-box text-title">
                      <span>{{ $t('page.actions') }}</span>
                      <span class="border-color number">{{ row.notifyList.length }}</span>
                    </div>
                    <div class="action-btn bg-block" :class="{'block':row.isDel || row.isDelActive || row.isShowDetail, 'text-mask': row.isDel || row.isDelActive}">
                      <span class="tsfont-plus text-action" @click="addCondition(row)">{{ $t('page.actions') }}</span>
                      <span class="tsfont-broom text-action" @click.stop="emptyData('all', row)">{{ $t('page.clearconfig') }}</span>
                    </div>
                  </div>
                </div>
                <div class="content">
                  <div class="overview">
                    <div v-if="row.notifyList.length > 0" class="trigger-overview">
                      <div
                        v-for="(item, index) in row.notifyList"
                        :key="index"
                        class="action-item overflow"
                        :class="index > 0 ? 'dividing-color' : ''"
                      >
                        <template v-if="index < 3">
                          <div class="name text-tip">{{ $t('page.actions') }}{{ numberChinese(index) }}</div>
                          <div class="type">
                            <span
                              v-for="action in item.actionList"
                              :key="action.templateId"
                              class="action-icon bg-footer-btn"
                              :class="setClass(action)"
                            ></span>
                          </div>
                        </template>
                      </div>
                    </div>
                    <div v-else class="tsfont-plus add-active text-action" @click="addCondition(row)">{{ $t('page.actions') }}</div>
                  </div>
                  <div v-if="row.notifyList.length > 0" class="trigger-detail bg-block bottom-shadow" :class="row.isDel || row.isDelActive || row.isShowDetail ? 'block' : ''">
                    <div @click.stop>
                      <DelItme
                        v-if="row.isDel || row.isDelActive"
                        :delName="delTitle + '?'"
                        @on-del="delSetting(delType, row)"
                        @on-close="closeSetting(delType, row)"
                      ></DelItme>
                    </div>
                    <div :class="row.isDel || row.isDelActive ? 'text-mask' : ''">
                      <div v-for="(detail, dindex) in row.notifyList" :key="dindex" class="list border-color">
                        <div class="name bg-block">{{ $t('page.actions') }}{{ numberChinese(dindex) }}</div>
                        <div v-for="n in detail.actionList" :key="n.templateId" class="active-li overflow">
                          <span>{{ n.notifyHandlerName }}：</span>
                          <span v-if="n.receiverObjList && n.receiverObjList.length > 0">
                            <span v-for="(user, uindex) in slice(n.receiverObjList, true)" :key="uindex" style="padding-right: 4px;">
                              <UserCard
                                class="user-name"
                                :avatar="user.avatar"
                                :userName="user.name"
                                :vipLevel="user.vipLevel"
                                :userUuid="user.uuid"
                                :type="user.type"
                                :initViaNet="true"
                              ></UserCard>
                            </span>
                            <span v-if="n.receiverObjList.length > 3" class="more">
                              <Dropdown
                                trigger="click"
                                transfer
                                style="margin-left: 20px"
                                @on-visible-change="showUserList(arguments, row, 'detail_' + detail.id)"
                              >
                                <span class="tsfont-option-vertical bg-block text-action"></span>
                                <DropdownMenu slot="list">
                                  <DropdownItem v-for="(user, uindex) in slice(n.receiverObjList, false)" :key="uindex">
                                    <UserCard
                                      class="user-name"
                                      :avatar="user.avatar"
                                      :userName="user.name"
                                      :vipLevel="user.vipLevel"
                                      :userUuid="user.uuid"
                                      :type="user.type"
                                    ></UserCard>
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </span>
                          </span>
                        </div>
                        <div class="li-btn bg-block">
                          <span class="tsfont-edit text-tip-active" @click="editTactics(row, detail)"></span>
                          <span class="tsfont-trash-s text-tip-active" @click.stop="emptyData('active', row, detail, dindex)"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </TsCard>
        </div>
      </div>
    </TsContain>
    <ConditionEdit
      v-if="conditionDialogShow"
      :isShow="conditionDialogShow"
      :activeTitle="activeTitle"
      :policyId="id"
      :config="activeConfig"
      :trigger="trigger"
      :authorityConfig="authorityConfig"
      @close="closeConditionDialog"
      @save="getTacticsData"
    ></ConditionEdit>
    <TacticsDialog :params.sync="dialogParams" :isShow.sync="isDialogShow" @updateTactics="updateTactics"></TacticsDialog>
    <SettingTemplate
      v-if="templateDialog"
      :id="id"
      :handler="handler"
      :isEditDialog.sync="isEditDialog"
      :defaultTemplateId="templateId"
      :showTemplate="showTemplate"
      :isShow.sync="templateDialog"
      @closeEdit="closeEdit"
    ></SettingTemplate>
    <SettingParameter
      v-if="parameDialog"
      :id="id"
      :handler="handler"
      :isShow.sync="parameDialog"
    ></SettingParameter>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    NavGuide: resolve => require(['@/resources/components/NavGuide/NavGuide.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    ConditionEdit: resolve => require(['./tacticsedit/condition-modal.vue'], resolve),
    TacticsDialog: resolve => require(['./tacticsedit/tactics-dialog.vue'], resolve),
    SettingTemplate: resolve => require(['./tacticsedit/setting/setting-template'], resolve),
    SettingParameter: resolve => require(['./tacticsedit/setting/setting-parameter'], resolve),
    DelItme: resolve => require(['./tacticsedit/setting/del-item.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  provide() {
    return {
      $notifyBox: this
    };
  },
  filters: {},
  props: {},
  data() {
    return {
      loadingShow: true,
      prevPath: {
        router: '/notifytactics-overview',
        name: this.$t('term.codehub.policylist')
      },
      id: null, //策略id
      handler: null, //模块
      tacticsName: null,
      config: null, //所有数据
      triggerList: [],
      isDialogShow: false,
      dialogParams: {},
      templateDialog: false,
      parameDialog: false,
      keyword: '',
      hasAction: -1,
      selectTrigger: [
        {
          text: this.$t('page.all'),
          value: -1
        },
        {
          text: this.$t('term.framework.triggeraction'),
          value: 1
        },
        {
          text: this.$t('term.framework.nottriggeraction'),
          value: 0
        }
      ],
      delTitle: this.$t('term.codehub.confirmclearconfiguration'),
      delType: 'all',
      conditionDialogShow: false, //添加动作弹框
      activeConfig: null, // 策略动作数据
      trigger: null, //触发动作
      authorityConfig: null, //角色权限
      activeTitle: this.$t('dialog.title.addtarget', {'target': this.$t('page.actions')}),
      avtiveConfig: {
        name: null,
        id: null
      },
      conditionOptionList: [],
      isEditDialog: false, //是否编辑模板
      showTemplate: 'overview', //模板列表弹框或者编辑模板
      templateId: null, //模板id
      detailTemplate: '' //详情模板动作，标识详情的
    };
  },
  beforeCreate() {},
  created() {
    this.id = parseInt(this.$route.query.id) || null;
    this.getTacticsData();
  },
  beforeMount() {},
  mounted() {
    let _this = this;
    document.addEventListener('click', _this.hideDel);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    let _this = this;
    document.removeEventListener('click', _this.hideDel);
  },
  destroyed() {},
  methods: {
    showDetail(row, text) {
      this.detailTemplate = text;
      this.$set(row, 'isShowDetail', true);
      this.triggerList.forEach(e => {
        if (row.trigger != e.trigger) {
          this.$set(e, 'isShowDetail', false);
        }
      });
    },
    hideDetail(row, text) {
      if (text == this.detailTemplate) {
        this.$set(row, 'isShowDetail', false);
      }
    },
    showUserList(arr, row, text) {
      //通知对象
      if (arr[0]) {
        this.showDetail(row, text);
      } else {
        this.hideDetail(row, text);
      }
    },
    hideDel() {
      this.triggerList.forEach(e => {
        this.$set(e, 'isDel', false);
        this.$set(e, 'isDelActive', false);
      });
    },
    goPrev() {
      this.$router.push({
        path: this.prevPath.router,
        query: {
          handler: this.handler
        }
      });
    },
    searchTacticsList() {
      let data = {
        policyId: this.id,
        hasAction: this.hasAction,
        keyword: this.keyword,
        needPage: false
      };
      this.$api.codehub.tactics.getTriggerList(data).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return;
          this.triggerList = obj.triggerList;
        }
      });
    },
    getTacticsData() {
      this.loadingShow = true;
      let data = {
        id: this.id
      };
      this.$api.codehub.tactics.editNotify(data).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return;
          let config = obj.config;
          this.config = config;
          this.tacticsName = obj.name;
          let conditionOptionList = config.conditionOptionList; //参数条件回显
          this.triggerList = config.triggerList;
          this.handler = obj.handler;
          this.$set(this.dialogParams, 'id', this.id);
          this.$set(this.dialogParams, 'handler', this.handler);
          this.loadingShow = false;
          conditionOptionList.forEach(item => {
            if (item.type != 'form') {
              item.handler = 'form' + item.controller;
            }
          });
          this.conditionOptionList = conditionOptionList;
        }
      });
    },
    async getNotifyList() {
      let data = {
        policyId: this.id,
        trigger: this.trigger
      };
      const promise = this.$api.codehub.tactics.editTriggerConfig(data);
      const res = await promise;
      this.authorityConfig = res.Return.authorityConfig;
      return promise;
    },
    updateTactics(obj) {
      if (obj.name) {
        this.tacticsName = obj.name;
      } else if (obj.userList) {
        this.dialogParams.config.userList = obj.userList;
      }
    },
    editName() {
      this.isDialogShow = true;
      this.$set(this.dialogParams, 'type', 'tacticsName');
      this.$set(this.dialogParams, 'name', this.tacticsName);
    },
    editTemplateList(type, id) {
      if (type == 'edit') {
        this.showTemplate = 'edit';
        this.templateId = id || null;
        this.isEditDialog = true;
      } else {
        this.showTemplate = 'overview';
      }
      this.templateDialog = true;
    },
    closeEdit() {
      this.isEditDialog = false;
      if (this.showTemplate == 'edit') {
        this.templateDialog = false;
      }
    },
    editParamList() {
      this.parameDialog = true;
    },
    editUser() {
      this.isDialogShow = true;
      this.$set(this.dialogParams, 'type', 'tacticsUser');
      this.$set(this.dialogParams, 'config', this.config);
    },
    async addCondition(item) {
      this.activeConfig = null;
      this.activeTitle = this.$t('dialog.title.addtarget', {'target': this.$t('page.actions')});
      this.trigger = item.trigger;
      await this.getNotifyList();
      this.conditionDialogShow = true;
    },
    closeConditionDialog(needRefresh) {
      this.conditionDialogShow = needRefresh;
    },
    async editTactics(item, obj) {
      this.activeTitle = this.$t('dialog.title.edittarget', {'target': this.$t('page.actions')});
      this.trigger = item.trigger;
      await this.getNotifyList();
      this.activeConfig = JSON.parse(JSON.stringify(obj));
      this.conditionDialogShow = true;
    },
    emptyData(type, row, item, index) {
      this.triggerList.forEach(e => {
        if (row.trigger != e.trigger) {
          this.$set(e, 'isDelActive', false);
          this.$set(e, 'isDel', false);
        }
      });
      if (type && type == 'active') {
        this.delType = 'active';
        this.delTitle = this.$t('term.codehub.confirmdeleteconfig') + this.numberChinese(index);
        this.$set(row, 'isDelActive', true);
        this.avtiveConfig.name = this.numberChinese(index);
        this.avtiveConfig.id = item.id;
      } else {
        this.delType = 'all';
        this.delTitle = this.$t('term.codehub.confirmclearconfiguration') + row.triggerName;
        this.$set(row, 'isDel', true);
      }
    },
    delSetting(type, row) {
      if (type == 'all') {
        let data = {
          policyId: this.id,
          trigger: row.trigger
        };
        this.$api.codehub.tactics.cleanHandlerNotify(data).then(res => {
          if (res.Status == 'OK') {
            this.$Notice.success({
              title: this.$t('message.clearsuccess'),
              duration: 1.5
            });
            this.getTacticsData();
          }
        });
      } else if (type == 'active') {
        this.$set(row, 'isDelActive', false);
        let data = {
          policyId: this.id,
          trigger: row.trigger,
          id: this.avtiveConfig.id
        };
        this.$api.codehub.tactics.delTriggerConfig(data).then(res => {
          if (res.Status == 'OK') {
            this.$Notice.success({
              title: this.$t('message.deletesuccess'),
              duration: 1.5
            });
            this.getTacticsData();
          }
        });
      }
    },
    closeSetting(type, row) {
      if (type == 'all') {
        this.$set(row, 'isDel', false);
      } else if (type == 'active') {
        this.$set(row, 'isDelActive', false);
      }
    },
    slice(list, key) {
      if (list.length > 0) {
        if (key) {
          return list.slice(0, 3);
        } else {
          return list.slice(3, list.length);
        }
      }
    }
  },
  computed: {
    numberChinese() {
      return function(value) {
        let number = (value + 1).toString();
        let text = this.$utils.toChinese(number);
        return text;
      };
    },
    setClass() {
      return function(item) {
        let icon_class = '';
        switch (item.notifyHandler) {
          case 'com.techsure.module.codehub.notify.EmailNotifyHandler':
            icon_class = 'text-primary tsfont-mail-s';
            break;
          case 'com.techsure.module.codehub.notify.WeChatGroupNotifyHandler':
            icon_class = 'text-warning tsfont-team-s';
            break;
          case 'com.techsure.module.codehub.notify.WeChatNotifyHandler':
            icon_class = 'text-success ts-chat';
            break;
        }
        return icon_class;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.action-top {
  position: absolute;
  right: 8px;
  top: 0;
}
.search-box {
  padding: 16px 16px 0;
}
.trigger-list {
  .trigger-name {
    font-size: 16px;
  }
  .title {
    height: 32px;
    padding: 10px 10px 0;
    display: -webkit-flex;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    .number {
      padding: 0 4px;
      border: 1px solid;
      margin-left: 4px;
    }
    .action-btn {
      display: none;
      position: absolute;
      right: 0;
      top: 0;
      z-index: 2;
      padding: 10px 12px 0;
      > span {
        padding-left: 4px;
      }
    }
    .title-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 32px;
      z-index: 9;
    }
  }
  .content {
    position: relative;
    .overview {
      position: relative;
      width: 100%;
      height: 78px;
      .add-active {
        width: 100%;
        position: absolute;
        text-align: center;
        top: 16px;
        font-size: 16px;
      }
      .trigger-overview {
        width: 100%;
        height: 100%;
        padding-bottom: 16px;
        .name {
          font-size: 13px;
          padding: 6px 0;
        }
        .action-item {
          float: left;
          width: 33.3333%;
          height: 100%;
          padding: 0 10px;
          white-space: nowrap;
          &:not(:first-child) {
            border-left: 1px solid;
          }
          .action-icon {
            display: inline-block;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            line-height: 32px;
            margin-right: 6px;
          }
        }
      }
    }
    .trigger-detail {
      display: none;
      width: 100%;
      min-height: 78px;
      position: absolute;
      top: 0;
      z-index: 2;
      padding: 12px 12px 0;
      .list {
        position: relative;
        border: 1px solid;
        padding: 12px 10px;
        margin-bottom: 16px;
        .name {
          position: absolute;
          top: -15px;
          left: 16px;
          padding: 4px 8px;
          font-size: 13px;
        }
        .li-btn {
          position: absolute;
          top: -15px;
          right: 16px;
          > span {
            padding: 0 6px;
          }
        }
      }
      .active-li {
        position: relative;
        .more {
          position: absolute;
          top: 2px;
          right: -10px;
        }
      }
    }
  }
  &:hover {
    .number-box {
      display: none;
    }
    .action-btn {
      display: block;
    }
    .trigger-overview {
      display: none;
    }
    .trigger-detail {
      display: block;
    }
  }
}
.trigger-card {
  /deep/ .tscard-body {
    padding: 0 !important;
    overflow: initial !important;
  }
}
.block {
  display: block !important;
}
</style>
