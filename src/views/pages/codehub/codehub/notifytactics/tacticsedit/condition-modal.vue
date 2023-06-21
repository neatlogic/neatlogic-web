<template>
  <div>
    <TsDialog
      :isShow.sync="notifyDialog"
      type="modal"
      width="692px"
      height="400px"
      className="edit-notify"
      :title="activeTitle"
      @on-close="close"
    >
      <template>
        <div class="notify-condition">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <div class="select-action">
            <div class="text-title require-label" style="padding-bottom: 8px;">{{ $t('page.actions') }}</div>
            <div class="action-main bg-grey">
              <div v-for="(item, index) in actionList" :key="index" class="input-border action-list">
                <div>
                  <Checkbox v-model="item.isSet" :true-value="1" :false-value="0">{{ item.text }}</Checkbox>
                </div>
                <div v-if="item.isSet == 1" class="select-block">
                  <div class="pd-bottom">
                    <TsRow>
                      <Col span="12">
                        <TsFormSelect
                          v-model="item.templateId"
                          :placeholder="$t('term.codehub.pleaseselectanotificationtemplate')"
                          :validateList="validateSetting.required"
                          :dataList="item.template"
                          valueName="id"
                          textName="name"
                          :clearable="false"
                        >
                          <template slot="first-ul">
                            <li class="ts-plus text-href first-slot" @click.stop="toEditTemplate()">
                              {{ $t('dialog.title.createtarget',{'target':$t('page.template')}) }}
                            </li>
                          </template>
                        </TsFormSelect>
                      </Col>
                      <Col span="12">
                        <div class="action-btn">
                          <span
                            v-if="item.templateId"
                            class="ts-edit text-tip-active"
                            :title="$t('page.edit')"
                            @click="toEditTemplate(item.templateId)"
                          ></span>
                          <span class="ts-refresh text-tip-active" :title="$t('page.refresh')" @click="getNotifyTemplate('refresh')"></span>
                        </div>
                      </Col>
                    </TsRow>
                  </div>
                  <div class="pd-bottom">
                    <UserSelect
                      :value.sync="item.receiverList"
                      :placeholder="$t('term.codehub.pleaseselectthenotificationobject')"
                      :groupList="authorityConfig.groupList"
                      :validateList="validateSetting.required"
                      :excludeList="authorityConfig.excludeList"
                      :includeList="authorityConfig.includeList"
                      transfer
                    ></UserSelect>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button type="text" @click="cancelEdit">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :disabled="saving" @click="okEdit">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect'], resolve)
  },
  inject: {
    $notifyBox: {
      type: Object,
      default: null
    }
  },
  props: {
    policyId: {
      type: [Number, String],
      default: null
    },
    isShow: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: () => null
    },
    trigger: {
      type: String,
      default: null
    },
    authorityConfig: {
      type: Object,
      default: () => {}
    },
    activeTitle: {
      type: String,
      default: () => {
        return this.$t('dialog.title.addtarget', {'target': this.$t('page.actions')});
      }
    }
  },
  data() {
    return {
      id: null,
      loadingShow: true,
      notifyDialog: false,
      paramList: [], //参数列表
      defaultActionList: [],
      actionList: [], //通知动作
      conditionConfig: {
        conditionGroupList: [],
        conditionGroupRelList: []
      }, //条件
      validateSetting: {
        required: [{ name: 'required', message: this.$t('page.pleaseselect') }]
      },
      relList: [
        {
          text: this.$t('page.and'),
          value: 'and'
        },
        {
          text: this.$t('page.or'),
          value: 'or'
        }
      ],
      tacticsId: null, //策略id
      saving: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.tacticsId = parseInt(this.$route.query.id) || null;
    this.notifyDialog = this.isShow;
    this.getParamList();
    this.getAction();
    this.$nextTick(() => {
      this.initData();
    }, 500);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      let config = this.config;
      if (config) {
        this.id = config.id;
        if (config.actionList) {
          this.defaultActionList = config.actionList;
        }
        if (config.conditionConfig) {
          if (config.conditionConfig.conditionGroupList) {
            this.$set(this.conditionConfig, 'conditionGroupList', config.conditionConfig.conditionGroupList);
          } else {
            this.$set(this.conditionConfig, 'conditionGroupList', []);
          }
          if (config.conditionConfig.conditionGroupRelList) {
            this.$set(this.conditionConfig, 'conditionGroupRelList', config.conditionConfig.conditionGroupRelList);
          } else {
            this.$set(this.conditionConfig, 'conditionGroupRelList', []);
          }
        }
      }
    },
    getParamList() {
      let data = {
        policyId: this.policyId
      };
      this.$api.codehub.tactics
        .getConditionoption(data)
        .then(res => {
          if (res.Status == 'OK') {
            let paramList = res.Return.conditonOptionList || [];
            paramList.forEach(item => {
              this.$set(item, 'showName', item.name + '(' + item.label + ')');
              if (item.type != 'form') {
                item.handler = 'form' + item.controller;
              }
            });
            this.paramList = paramList;
            this.loadingShow = false;
          }
        })
        .catch(error => {
          this.$Notice.error({
            title: this.$t('term.framework.errorinfo'),
            desc: error.data.Message
          });
        });
    },
    async getAction() {
      let actionList = await this.getHandlerList();
      if (actionList && actionList.length > 0) {
        //模板列表
        this.getNotifyTemplate();
      }
    },
    getHandlerList() {
      //通知方式列表
      return new Promise((resolve, reject) => {
        this.$api.codehub.tactics
          .handlerList()
          .then(res => {
            if (res.Status == 'OK') {
              this.actionList = res.Return;
              this.actionList.forEach(i => {
                let newObj = this.defaultActionList.find(d => d.notifyHandler == i.value);
                if (newObj) {
                  this.$set(i, 'isSet', 1);
                  this.$set(i, 'template', []);
                  this.$set(i, 'templateId', newObj.templateId);
                  this.$set(i, 'receiverList', newObj.receiverList);
                  this.$set(i, 'notifyHandler', newObj.notifyHandler);
                } else {
                  this.$set(i, 'isSet', 0);
                  this.$set(i, 'template', []);
                  this.$set(i, 'templateId', '');
                  this.$set(i, 'receiverList', []);
                  this.$set(i, 'notifyHandler', '');
                }
              });
              resolve(this.actionList);
            }
          })
          .catch(error => {
            this.$Message.error(error.data.Message);
          });
      });
    },
    getNotifyTemplate(type) {
      //模板列表
      let data = {
        policyId: this.policyId
      };
      this.$api.codehub.tactics
        .getTemplateList(data)
        .then(res => {
          if (res.Status == 'OK') {
            if (type && type == 'refresh') {
              this.$Message.success(this.$t('message.refreshsuccess'));
            }
            let template = res.Return.templateList || [];
            this.actionList.forEach(a => {
              a.template = [];
            });
            template.forEach(i => {
              for (let j = 0; j < this.actionList.length; j++) {
                if (i.notifyHandler == this.actionList[j].value) {
                  this.actionList[j].template.push(i);
                  if (this.actionList[j].templateId == '') {
                    this.actionList[j].templateId = this.actionList[j].template[0].id;
                  }
                }
              }
            });
          }
        })
        .catch(error => {
          this.$Message.error(error.data.Message);
        });
    },
    cancelEdit() {
      this.notifyDialog = false;
      this.$emit('close', this.notifyDialog);
    },
    verifiedData() {
      let isDisable = false;
      let isSelect = this.actionList.find(a => a.isSet == 1);
      if (isSelect) {
        for (let i = 0; i < this.actionList.length; i++) {
          if (this.actionList[i].isSet && (!this.actionList[i].templateId || this.actionList[i].receiverList.length == 0)) {
            isDisable = false;
            this.$Notice.error({
              title: this.$t('term.codehub.pleaseselecttemplateandreceiver'),
              duration: 1.5
            });
            break;
          } else {
            isDisable = true;
          }
        }
        if (isDisable && this.conditionConfig.conditionGroupList.length > 0) {
          for (let i = 0; i < this.conditionConfig.conditionGroupList.length; i++) {
            for (var j = 0; j < this.conditionConfig.conditionGroupList[i].conditionList.length; j++) {
              let row = this.conditionConfig.conditionGroupList[i].conditionList[j];
              if (typeof row === 'object') {
                for (let key in row) {
                  if (row.hasOwnProperty(key)) {
                    let val = row[key];
                    if (key != 'type' && !val && row.isShowConditionValue == 1) {
                      isDisable = false;
                      this.$Notice.error({
                        title: this.$t('term.framework.reqcondition'),
                        duration: 1.5
                      });
                      return false;
                    } else if (row.isShowConditionValue == 0) {
                      row.valueList = '';
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        this.$Notice.error({
          title: this.$t('term.codehub.pleaseselectanaction'),
          duration: 1.5
        });
      }
      return isDisable;
    },
    saveData() {
      let data = {
        policyId: this.policyId,
        trigger: this.trigger
      };
      if (this.id) {
        this.$set(data, 'id', this.id);
      }
      if (this.actionList.length > 0) {
        let newActionList = [];
        this.actionList.forEach(i => {
          if (i.isSet == 1) {
            let obj = {
              notifyHandler: '',
              templateId: '',
              receiverList: []
            };
            obj.notifyHandler = i.value;
            obj.templateId = i.templateId;
            obj.receiverList = i.receiverList;
            newActionList.push(obj);
          }
        });
        this.$set(data, 'actionList', newActionList);
      }
      if (this.conditionConfig != {} && this.conditionConfig.conditionGroupList.length > 0) {
        this.$set(data, 'conditionConfig', this.conditionConfig);
      } else {
        this.$set(data, 'conditionConfig', {});
      }

      return data;
    },
    okEdit() {
      if (this.verifiedData()) {
        let data = this.saveData();
        this.saving = true;
        this.$api.codehub.tactics.saveHandlerNotify(data).then(res => {
          this.saving = false;
          if (res.Status == 'OK') {
            this.$Notice.success({
              title: this.$t('message.savesuccess'),
              duration: 1.5
            });
            this.notifyDialog = false;
            this.$emit('save');
          }
        }).catch(error => {
          this.saving = false;
          this.$Message.error(error.data.Message);
        });
      }
    },
    close(needRefresh) {
      this.notifyDialog = needRefresh;
      this.$emit('close', needRefresh);
    },
    //条件
    getExpressionList(name) {
      let obj = {};
      for (let i = 0; i < this.paramList.length; i++) {
        if (this.paramList[i].name == name) {
          obj = this.paramList[i];
          break;
        }
      }
      return obj;
    },
    addGroup() {
      let GroupList = this.conditionConfig.conditionGroupList;
      let uuid = this.$utils.setUuid(); //获取条件uuid
      let groupUuid = this.$utils.setUuid(); //获取组的uuid
      let group = {
        uuid: groupUuid,
        conditionList: [
          {
            uuid: uuid,
            name: '',
            expression: '',
            valueList: '',
            type: '',
            isShowConditionValue: 1
          }
        ],
        conditionRelList: []
      };
      if (GroupList && GroupList.length > 0) {
        let relUuid = GroupList[GroupList.length - 1].uuid;
        let groupRel = {
          from: relUuid,
          joinType: 'and',
          to: groupUuid
        };
        this.conditionConfig.conditionGroupRelList.push(groupRel);
      }
      this.conditionConfig.conditionGroupList.push(group);
    },
    changeConItem(item, obj) {
      item.expression = '';
      item.valueList = '';
      item.type = obj.type || '';
    },
    delGroup(index) {
      //删除组合
      this.$delete(this.conditionConfig.conditionGroupList, index);
      if (this.conditionConfig.conditionGroupRelList && this.conditionConfig.conditionGroupRelList.length > 0) {
        this.$delete(this.conditionConfig.conditionGroupRelList, index - 1);
      }
    },
    addCondition(item) {
      //条件节点规则：添加条件
      let uuid = this.$utils.setUuid(); //获取条件uuid
      let conditionRelList = item.conditionRelList || [];
      let conditionList = item.conditionList;
      let endUuid = conditionList[conditionList.length - 1].uuid;
      let conditionRel = {
        from: endUuid,
        joinType: 'and',
        to: uuid
      };
      let condition = {
        uuid: uuid,
        name: '',
        expression: '',
        valueList: '',
        type: '',
        isShowConditionValue: 1
      };
      item.conditionList.push(condition);
      item.conditionRelList.push(conditionRel);
    },
    delCondition(item, index, index1) {
      //删除条件
      this.$delete(item.conditionList, index);
      this.$delete(item.conditionRelList, index - 1);
      if (!item.conditionList.length) {
        this.delGroup(index1);
      }
    },
    toEditTemplate(templateId) {
      if (templateId) {
        this.$notifyBox.editTemplateList('edit', templateId);
      } else {
        this.$notifyBox.editTemplateList('edit');
      }
    },
    changeExpression(item) {
      if (item.expression) {
        let expressionList = this.getExpressionList(item.name).expressionList;
        let obj = expressionList.find(e => e.expression == item.expression);
        if (obj) {
          this.$set(item, 'isShowConditionValue', obj.isShowConditionValue);
          if (obj.isShowConditionValue == 0) {
            this.$set(item, 'valueList', '');
          }
        }
      }
    }
  },
  filter: {},
  computed: {
    handlerType() {
      return function(uuid) {
        let type = 'forminput';
        let selectConfig = this.paramList.find(p => p.name == uuid);
        if (selectConfig) {
          type = selectConfig.handler;
        }
        return type;
      };
    },
    getselectConfig() {
      return function(uuid) {
        let config = {};
        let selectConfig = this.paramList.find(p => p.name == uuid);
        if (selectConfig) {
          if (selectConfig.config) {
            this.$set(selectConfig.config, 'readonlyClass', 'text-default');
            this.$set(selectConfig.config, 'sperateText', '、');
          }
          config = selectConfig;
        }
        return config;
      };
    }
  },
  watch: {
    isShow: {
      handler: function(val) {
        this.notifyDialog = val;
      }
    }
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.notify-condition {
  width: 100%;
  padding: 0 @space-xs;
  .add-condition {
    padding-bottom: 8px;
  }
  .edit-condition {
    position: relative;

    .add-btn {
      position: absolute;
      left: 80px;
      top: -73px;
      cursor: pointer;
    }

    .group-border {
      position: relative;
      width: 100%;
      border-radius: 2px;
      &:hover {
        .delGroup {
          display: block;
        }
      }
      .group-content {
        padding: @space-md;
      }

      .condition-content {
        position: relative;

        .btn-group {
          width: 100%;
          height: 32px;
          line-height: 32px;

          > span {
            cursor: pointer;
          }
        }
      }
      .condition-joinType {
        position: relative;
        width: 60px;
        height: 28px;
        line-height: 28px;
        &:before,
        &:after {
          content: '';
          position: absolute;
          left: 14px;
          width: 0px;
          height: 6px;
          border-left: 1px solid;
          z-index: 2;
        }
        &:before {
          top: 0;
        }
        &:after {
          bottom: 0;
        }
      }

      .groupJoinType {
        left: 8px;
      }

      .conditionJoinType {
        left: 268px;
      }

      .delGroup {
        display: none;
        position: absolute;
        top: -9px;
        right: -4px;
        cursor: pointer;
      }
    }
  }

  .action-main {
    padding: 12px 16px;
    .select-block {
      padding-top: 8px;
      .pd-bottom{
        padding-bottom: 10px;
      }
    }
    .action-list{
      line-height: 32px;
    }
  }
  .action-btn {
    line-height: 32px;
    > span {
      padding-right: 8px;
    }
  }
}
</style>
