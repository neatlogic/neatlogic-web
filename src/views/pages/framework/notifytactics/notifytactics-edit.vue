<template>
  <div>
    <TsContain border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>
          <span class="mr-md">{{ tacticsName }}</span>
          <i class="tsfont-edit text-action" @click="editName"></i>
        </span>
      </template>
      <template v-slot:topRight>
        <div class="action-top">
          <span class="action-group">
            <span class="action-item tsfont-modules" @click="editTemplateList('overview')">{{ $t('page.templatelist') }}</span>
            <span class="action-item tsfont-barlist" @click="editParamList">{{ $t('page.paramslist') }}</span>
          </span>
        </div>
      </template>
      <div
        slot="content"
        v-click-outside:false="onClickOutside"
        v-click-outside:false.mousedown="onClickOutside"
        v-click-outside:false.touchstart="onClickOutside"
      >
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
              <InputSearcher
                v-model="keyword"
                :placeholder="$t('form.placeholder.name')"
                @change="searchTacticsList"
              ></InputSearcher>
            </Col>
          </TsRow>
        </div>
        <div class="trigger-card">
          <TsCard
            :cardList="triggerList"
            :sm="12"
            :lg="8"
            :xl="8"
            :xxl="6"
          >
            <template slot-scope="{ row }">
              <div class="trigger-list">
                <div class="title" :class="{'bg-selected': row.isDel || row.isDelActive || row.isShowDetail, 'title-hover-bg': row.notifyList.length > 0}">
                  <div v-if="row.isDel || row.isDelActive" class="title-bg bg-mongolia"></div>
                  <div :class="row.isDel || row.isDelActive ? 'text-mask' : ''">
                    <span class="trigger-name">
                      {{ row.triggerName }}
                    </span>
                    <Tooltip
                      placement="bottom"
                      max-width="300"
                      theme="light"
                      transfer
                    >
                      <i class="tsfont-info-o cursor-pointer text-href"></i>
                      <div slot="content">
                        <p>{{ row.description || row.triggerName }}</p>
                      </div>
                    </Tooltip>
                  </div>
                  <div v-if="row.notifyList && row.notifyList.length > 0">
                    <div class="number-box text-title" :class="{'none': row.isDel || row.isDelActive || row.isShowDetail }">
                      <span class="pr-xs">{{ $t('page.actions') }}</span>
                      <Badge :count="row.notifyList.length" type="info"></Badge>
                    </div>
                    <div class="action-btn" :class="{'block':row.isDel || row.isDelActive || row.isShowDetail, 'text-mask': row.isDel || row.isDelActive}" @click.stop>
                      <span class="tsfont-plus text-action" @click="addCondition(row)">{{ $t('page.actions') }}</span>
                      <span class="tsfont-broom text-action" @click="emptyData('all', row)">{{ $t('page.clearconfig') }}</span>
                    </div>
                  </div>
                </div>
                <div class="content">
                  <div class="overview pr-xs overflow">
                    <div v-if="row.notifyList.length > 0" class="trigger-overview flex-start overflow">
                      <div
                        v-for="(item, index) in row.notifyList"
                        :key="index"
                        class="action-item dividing-color"
                      >
                        <template v-if="index < 3">
                          <div class="name text-tip">{{ $t('page.actions') }}{{ numberChinese(index) }}</div>
                          <div class="type flex-start">
                            <span
                              v-for="action in item.actionList"
                              :key="action.templateId"
                              class="action-icon bg-footer-btn text-center"
                              :class="setClass(action)"
                            ></span>
                          </div>
                        </template>
                      </div>
                    </div>
                    <div v-else class="tsfont-plus add-active text-action" @click.stop="addCondition(row)">{{ $t('page.actions') }}</div>
                  </div>
                  <div v-if="row.notifyList.length > 0" class="trigger-detail bg-block bottom-shadow-primary bg-selected" :class="row.isDel || row.isDelActive || row.isShowDetail? 'block' : ''">
                    <div @click.stop>
                      <DelItme
                        v-if="row.isDel || row.isDelActive"
                        :delName="delTitle"
                        @on-del="delSetting(delType, row)"
                        @on-close="closeSetting(delType, row)"
                      ></DelItme>
                    </div>
                    <div :class="row.isDel || row.isDelActive ? 'text-mask' : ''" class="pb-sm">
                      <Collapse
                        value="action_0"
                        accordion
                        @on-change="(val)=>{
                          onChangeCollapse(val, 'detail_' + row.id,row)
                        }"
                      >
                        <Panel
                          v-for="(detail, dindex) in row.notifyList"
                          :key="dindex"
                          :name="'action_' + dindex"
                          class="panel-box"
                        >
                          {{ $t('page.actions') }}{{ numberChinese(dindex) }}
                          <div slot="content">
                            <ActiveDetail
                              :config="detail"
                              :conditionList="conditionOptionList"
                            ></ActiveDetail>
                          </div>
                          <div class="panel-btn">
                            <span class="tsfont-edit text-tip-active pr-xs" @click.stop="editTactics(row, detail)"></span>
                            <span class="tsfont-trash-s text-tip-active" @click.stop="emptyData('active', row, detail, dindex)"></span>
                          </div>
                        </Panel>
                      </Collapse>
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
      :triggerList="triggerList"
      :handler="handler"
      :defaultTemplateId="templateId"
      :showTemplate="showTemplate"
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
import ActiveDetail from './tacticsedit/active-detail.vue';
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue'),
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    ConditionEdit: () => import('./tacticsedit/condition-modal.vue'),
    TacticsDialog: () => import('./tacticsedit/tactics-dialog.vue'),
    SettingTemplate: () => import('./tacticsedit/setting/setting-template'),
    SettingParameter: () => import('./tacticsedit/setting/setting-parameter'),
    DelItme: () => import('./tacticsedit/setting/del-item.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    ActiveDetail
  },
  provide() {
    return {
      $notifyBox: this
    };
  },
  directives: { ClickOutside },
  filters: {},
  props: {},
  data() {
    return {
      loadingShow: true,
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
      delTitle: this.$t('page.clearconfig') + '：',
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
      showTemplate: 'overview', //模板列表弹框或者编辑模板
      templateId: null, //模板id
      detailTemplate: '' //详情模板动作，标识详情的
    };
  },
  beforeCreate() {},
  created() {
    this.id = Math.floor(this.$route.query.id) || null;
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
    hideDel() {
      this.triggerList.forEach(e => {
        this.$set(e, 'isDel', false);
        this.$set(e, 'isDelActive', false);
      });
    },
    searchTacticsList() {
      let data = {
        policyId: this.id,
        hasAction: this.hasAction,
        keyword: this.keyword,
        needPage: false
      };
      this.$api.framework.tactics.getTriggerList(data).then(res => {
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
      this.$api.framework.tactics.editNotify(data).then(res => {
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
      const promise = this.$api.framework.tactics.editTriggerConfig(data);
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
      } else {
        this.showTemplate = 'overview';
      }
      this.templateDialog = true;
    },
    closeEdit() {
      this.templateDialog = false;
    },
    editParamList() {
      this.parameDialog = true;
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
        this.delTitle = this.$t('dialog.content.deletetargetconfirm', {target: this.$t('page.actions') + this.numberChinese(index)});
        this.$set(row, 'isDelActive', true);
        this.avtiveConfig.name = this.numberChinese(index);
        this.avtiveConfig.id = item.id;
      } else {
        this.delType = 'all';
        this.delTitle = this.$t('page.clearconfig') + '：' + row.triggerName;
        this.$set(row, 'isDel', true);
      }
    },
    delSetting(type, row) {
      if (type == 'all') {
        let data = {
          policyId: this.id,
          trigger: row.trigger
        };
        this.$api.framework.tactics.cleanHandlerNotify(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.deletesuccess'));
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
        this.$api.framework.tactics.delTriggerConfig(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.deletesuccess'));
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
    onChangeCollapse(val, text, row) {
      if (!this.$utils.isEmpty(val)) {
        this.showDetail(row, text);
      } else {
        this.hideDetail(row, text);
      }
    },
    onClickOutside() {
      this.triggerList.forEach(e => {
        this.$set(e, 'isShowDetail', false);
      });
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
          case 'EmailNotifyHandler':
            icon_class = 'text-primary tsfont-mail-s';
            break;
          case 'neatlogic.module.process.notify.handler.RemindNotifyHandler':
          case 'MessageNotifyHandler':
            icon_class = 'text-success tsfont-message-o';
            break;
          default:
            icon_class = 'text-success tsfont-message-o';
        }
        return icon_class;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';
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
        // transform: translateY(-50%);
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
          height: 100%;
          padding: 0 10px;
          flex: 1;
          &:not(:last-child) {
            border-right: 1px solid;
          }
          .action-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            line-height: 32px;
            margin-right: 6px;
            &::before{
              margin-right: 0;
            }
          }
        }
      }
    }
    .trigger-detail {
      display: none;
      width: 100%;
      min-height: 72px;
      position: absolute;
      top: 0;
      z-index: 2;
      padding: 10px 10px 0;
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
  ::v-deep .tscard-body {
    padding: 0 !important;
    overflow: initial !important;
  }
}
.block {
  display: block !important;
}
.none {
  display: none !important;
}
.panel-box {
  position: relative;
  .panel-btn {
    position: absolute;
    top: 0;
    right: 8px;
  }
}
.theme(@primary-grey) {
  .trigger-list {
    &:hover {
      .title.title-hover-bg {
        background-color: var(--primary-grey, @primary-grey);
      }
    } 
  }
}
html {
  .theme(@default-primary-grey);
  &.theme-dark {
    .theme(@dark-primary-grey,);
  }
}
</style>
