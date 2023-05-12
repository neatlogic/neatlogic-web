<template>
  <div class="condition-setting permission-list">
    <div class="control-setting">
      <span>{{ $t('term.process.flowrult') }}</span>
      <span class="tsfont-plus add-btn" @click="addRule()">{{ $t('page.rule') }}</span>
    </div>
    <div v-if="formUuid == ''">
      <div class="text-tip">
        {{ $t('term.process.flowrulttip') }}
        <a href="javascript:void(0);" @click="tabSetting">{{ $t('term.process.flowsetting') }}</a>{{ $t('page.relevance') }}
      </div>
    </div>
    <div v-if="moveonConfigList && moveonConfigList.length > 0">
      <div v-for="(item,index) in moveonConfigList" :key="index" class="rule-list">
        <div class="list">
          <div class="top">
            <div class="text-grey overflow">
              <span v-html="item.type=='negative'? $t('term.process.nottransfer') : $t('term.process.transferto')"></span>
              “
              <span :title="getTargetStepList(item.targetStepList)">{{ getTargetStepList(item.targetStepList) }}</span>”
            </div>
            <div class="edit-icon">
              <i class="ts-cog-s click-tag text-action" @click="editRule(item,index)"></i>
              <span class="tsfont-close click-tag text-action del-inrule" @click="delRule(index)"></span>
            </div>
          </div>
          <div v-if="item.conditionGroupList.length >0" class="rule-content edit-setting">
            <div v-for="(groupItem,groupIndex) in item.conditionGroupList" :key="groupIndex" class="group-list">
              <div v-for="(conditionItem,conditionIndex) in groupItem.conditionList" :key="conditionIndex" class="condition-list">
                <Row :gutter="8">
                  <Col span="8">
                    <span :title="conditionShow(conditionItem.name)" class="condition-text border-color overflow">{{ conditionShow(conditionItem.name) ||$t('term.process.empty') }}</span>
                  </Col>
                  <Col :span="conditionItem.isShowConditionValue == 1?'7':'16'">
                    <span :title="expressionShow(conditionItem.name,conditionItem.expression)" class="condition-text border-color overflow">{{ expressionShow(conditionItem.name,conditionItem.expression) || $t('term.process.empty') }}</span>
                  </Col>
                  <Col v-if="conditionItem.isShowConditionValue == 1" span="9">
                    <div v-if="ruleConditionConfig[conditionItem.name]">
                      <div
                        :is="handlerType(conditionItem.name)"
                        v-model="conditionItem.valueList"
                        :config="getselectConfig(conditionItem.name)"
                        :readonly="true"
                      ></div>
                    </div>
                  </Col>
                </Row>
                <div>
                  <TsRow v-show="conditionIndex < groupItem.conditionList.length - 1">
                    <Col span="12">
                    </Col>
                    <Col span="10">
                      <div v-if="groupItem.conditionRelList[conditionIndex]" class="condition-joinType text-primary">
                        {{ getConditionJoinType(groupItem.conditionRelList ,conditionIndex) }}
                      </div>
                    </Col>
                  </TsRow>
                </div>
              </div>
              <div>
                <TsRow v-show="groupIndex < item.conditionGroupList.length - 1">
                  <Col span="2">
                  </Col>
                  <Col span="20">
                    <div v-if="item.conditionGroupRelList[groupIndex]" class="condition-joinType text-primary">
                      {{ getConditionJoinType(item.conditionGroupRelList,groupIndex) }}
                    </div>
                  </Col>
                </TsRow>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TsDialog
      :isShow.sync="ruleModel"
      type="modal"
      width="692px"
      height="400px"
      @on-ok="saveRule"
      @on-close="ruleModel= false"
    >
      <template v-slot:header>
        <div>{{ $t('term.process.flowrult') }}</div>
      </template>
      <template>
        <div class="rule-condition">
          <div class="input-border">
            <TsForm
              ref="mainRule"
              :itemList="ruleFormData"
              :labelWidth="labelWidth"
              labelPosition="top"
            ></TsForm>
          </div>
          <div v-if="isShowRule" class="edit-condition">
            <div class="text-href add-btn tsfont-plus" @click="addGroup()">{{ $t('page.combinedcondition') }}</div>
            <div v-for="(item,groupIndex) in editRuleConfig.conditionGroupList" :key="groupIndex" class="group-border">
              <div class="group-content bg-op radius-md">
                <div v-for="(conItem,conIdex) in item.conditionList" :key="conIdex" class="condition-content">
                  <TsRow :gutter="8">
                    <Col span="6">
                      <div>
                        <TsFormSelect
                          v-model="conItem.name"
                          :dataList="ruleConditionList"
                          valueName="name"
                          textName="label"
                          search
                          transfer
                          @on-change="changeConItem(conItem)"
                        ></TsFormSelect>
                      </div>
                    </Col>
                    <Col :span="conItem.isShowConditionValue && conItem.isShowConditionValue == 1?'6':'16'">
                      <div class>
                        <TsFormSelect
                          v-model="conItem.expression"
                          :dataList="getExpressionList(conItem.name)"
                          valueName="expression"
                          textName="expressionName"
                          transfer
                          @on-change="changeExpression(conItem)"
                        ></TsFormSelect>
                      </div>
                    </Col>
                    <Col v-if="conItem.isShowConditionValue && conItem.isShowConditionValue == 1" span="10">
                      <div :is="handlerType(conItem.name)" v-model="conItem.valueList" :config="getselectConfig(conItem.name)"></div>
                    </Col>
                    <Col span="2">
                      <div class="btn-group text-tip">
                        <span class="tsfont-plus" style="padding-right:8px;" @click="addCondition(item)"></span>
                        <span v-if="item.conditionList.length>1" class="ts-minus" @click="delCondition(item,conIdex)"></span>
                      </div>
                    </Col>
                  </TsRow>
                  <div v-if="item.conditionList.length-1 >conIdex">
                    <TsRow>
                      <Col span="12">
                      </Col>
                      <Col span="10">
                        <div class="condition-joinType text-href">
                          <TsFormSelect
                            v-model="item.conditionRelList[conIdex].joinType"
                            :dataList="relList"
                            :clearable="false"
                            border="none"
                            size="small"
                            className="transparentSelect"
                          ></TsFormSelect>
                        </div>
                      </Col>
                    </TsRow>
                  </div>
                </div>
              </div>
              <div v-if="editRuleConfig.conditionGroupList.length-1 >groupIndex">
                <TsRow>
                  <Col span="1">
                  </Col>
                  <Col span="20">
                    <div class="condition-joinType text-href">
                      <TsFormSelect
                        v-model="editRuleConfig.conditionGroupRelList[groupIndex].joinType"
                        :dataList="relList"
                        :clearable="false"
                        border="none"
                        size="small"
                        className="transparentSelect"
                      ></TsFormSelect>
                    </div>
                  </Col>
                </TsRow>
              </div>
              <div v-if="editRuleConfig.conditionGroupList.length>1" class="delGroup" @click="delGroup(groupIndex)">
                <i class="tsfont-close-s text-tip"></i>
              </div>
            </div>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>

<script>
//条件
import Items from '@/resources/components/FormMaker/formedit/items';
import nodemixin from './nodemixin.js';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    ...Items
  },
  mixins: [nodemixin],
  props: {},
  data() {
    let _this = this;
    return {
      configData: {stepConfig: {}}, //当前节点数据
      formUuid: _this.formConfig && _this.formConfig.uuid ? _this.formConfig.uuid : '', //表单id
      newChildrenNode: _this.nodeChildren || [], //条件节点
      ruleFormData: [
        {
          type: 'select',
          name: 'targetStepList',
          value: '',
          placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.node')}),
          width: 320,
          maxlength: 30,
          label: this.$t('term.process.transferto'),
          multiple: true,
          valueName: 'uuid',
          textName: 'name',
          validateList: [
            {
              name: 'required',
              message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.node')})
            },
            {
              name: 'name-special'
            }
          ],
          dataList: []
        },
        {
          type: 'radio',
          name: 'type',
          value: '',
          defaultValue: 'optional', //默认值
          label: this.$t('page.triggercondition'),
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            {
              value: 'always',
              text: this.$t('term.process.alwaystransfer')
            },
            {
              value: 'negative',
              text: this.$t('term.process.nottransfer')
            },
            {
              value: 'optional',
              text: this.$t('page.custom')
            }
          ],
          onChange: function(val) {
            if (val != 'optional') {
              _this.isShowRule = false;
            } else {
              let groupUuid = this.$utils.setUuid();
              let conditionUuid = this.$utils.setUuid();
              let newConfig = {
                targetStepList: [],
                type: 'optional',
                conditionGroupList: [
                  {
                    uuid: groupUuid,
                    conditionList: [
                      {
                        uuid: conditionUuid,
                        name: '',
                        expression: '',
                        valueList: '',
                        isShowConditionValue: 1
                      }
                    ],
                    conditionRelList: []
                  }
                ],
                conditionGroupRelList: []
              };
              _this.editRuleConfig = newConfig;
              _this.isShowRule = true;
            }
          }
        }
      ],
      isShowRule: true,
      ruleModel: false, //规则模态框
      moveonConfigList: [], //条件节点配置
      editRuleConfig: {}, //新增规则
      labelWidth: 80,
      ruleIndex: null,
      ruleConditionList: [], //条件节点：规则条件
      ruleConditionConfig: {}, //每个条件对应的数据
      relList: [
        {
          text: this.$t('page.and'),
          value: 'and'
        },
        {
          text: this.$t('page.or'),
          value: 'or'
        }
      ]
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
    this.keyList = ['moveonConfigList'];//stepConfig 需要包含的数据
    this.getNodeSetting();
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    getNodeSetting() {
      //初始化节点数据
      let config = this.configData = this.$utils.deepClone(this.nodeConfig);
      this.getNewConditionList(this.formUuid);
      this.initNodeData(config, this.keyList);//初始化数据
    },
    getTargetStepList(arr) {
      //条件子节点
      if (this.newChildrenNode.length > 0) {
        let newArrText = [];
        this.newChildrenNode.forEach(item => {
          arr.forEach(uuid => {
            if (uuid == item.uuid) {
              newArrText.push(item.name);
            }
          });
        });
        return newArrText.join('、');
      }
    },
    addRule() {
      //条件节点添加规则
      this.ruleIndex = null;
      let groupUuid = this.$utils.setUuid();
      let conditionUuid = this.$utils.setUuid();
      let newConfig = {
        targetStepList: [],
        type: 'optional',
        conditionGroupList: [
          {
            uuid: groupUuid,
            conditionList: [
              {
                uuid: conditionUuid,
                name: '',
                type: '',
                expression: '',
                valueList: '',
                isShowConditionValue: 1
              }
            ],
            conditionRelList: []
          }
        ],
        conditionGroupRelList: []
      };
      this.getChildrenNode(newConfig.targetStepList, newConfig.type);
      this.editRuleConfig = newConfig;
      this.ruleModel = true;
    },
    editRule(item, index) {
      //编辑规则
      let _this = this;
      let obj = JSON.parse(JSON.stringify(item));
      let nodeUuidlist = obj.targetStepList;
      let type = obj.type;
      _this.editRuleConfig = obj;
      _this.getChildrenNode(nodeUuidlist, type);
      _this.ruleIndex = index;
      _this.ruleModel = true;
    },
    addGroup() {
      //条件节点规则：添加组合
      let _this = this;
      let conditionGroupRelList = _this.editRuleConfig.conditionGroupRelList || [];
      let GroupList = _this.editRuleConfig.conditionGroupList;
      let endRelUuid = GroupList[GroupList.length - 1].uuid;
      let groupUuid = _this.$utils.setUuid(); //获取组的uuid
      let uuid = _this.$utils.setUuid(); //获取条件uuid
      let groupRel = {
        from: endRelUuid,
        joinType: 'and',
        to: groupUuid
      };
      let group = {
        uuid: groupUuid,
        conditionList: [
          {
            uuid: uuid,
            name: '',
            type: '',
            expression: '',
            valueList: '',
            isShowConditionValue: 1
          }
        ],
        conditionRelList: []
      };
      this.editRuleConfig.conditionGroupRelList.push(groupRel);
      this.editRuleConfig.conditionGroupList.push(group);
    },
    delGroup(index) {
      //删除组合
      this.$delete(this.editRuleConfig.conditionGroupList, index);
      this.$delete(this.editRuleConfig.conditionGroupRelList, index - 1);
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
        type: '',
        expression: '',
        valueList: '',
        isShowConditionValue: 1
      };
      item.conditionList.push(condition);
      item.conditionRelList.push(conditionRel);
    },
    delCondition(item, index) {
      //删除条件
      this.$delete(item.conditionList, index);
      this.$delete(item.conditionRelList, index - 1);
    },
    delRule(index) {
      //删除条件节点规则
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.process.noderules')}),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          this.moveonConfigList.splice(index, 1);
          this.$Message.success(this.$t('message.deletesuccess'));
        }
      });
    },
    saveRule() {
      //条件节点：保存规则
      let _this = this;
      let rule = _this.$refs.mainRule;
      let isValue = false;
      if (rule.valid()) {
        let data = rule.getFormValue();
        _this.editRuleConfig.targetStepList = data.targetStepList;
        let type = data.type;
        _this.editRuleConfig.type = type;
        let conditionGroupList = _this.editRuleConfig.conditionGroupList || [];
        if (type != 'optional') {
          _this.editRuleConfig.conditionGroupList = [];
          if (_this.ruleIndex != null) {
            _this.moveonConfigList[_this.ruleIndex] = _this.editRuleConfig;
          } else {
            _this.moveonConfigList.push(_this.editRuleConfig);
          }
        }
        if (type == 'optional') {
          for (let i = 0; i < conditionGroupList.length; i++) {
            for (var j = 0; j < conditionGroupList[i].conditionList.length; j++) {
              let row = conditionGroupList[i].conditionList[j];
              if (typeof row === 'object') {
                for (let key in row) {
                  if (row.hasOwnProperty(key)) {
                    let val = row[key];
                    if (row.isShowConditionValue == 1) {
                      if (key == 'valueList' && Array.isArray(val)) {
                        if (val.length == 0) {
                          this.$Notice.error({
                            title: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.condition')}),
                            duration: 1.5
                          });
                          isValue = false;
                          return false;
                        } else {
                          if (val[0] == '') {
                            this.$Notice.error({
                              title: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.condition')}),
                              duration: 1.5
                            });
                            isValue = false;
                            return false;
                          }
                        }
                      } else if (!val) {
                        this.$Notice.error({
                          title: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.condition')}),
                          duration: 1.5
                        });
                        isValue = false;
                        return false;
                      } else {
                        isValue = true;
                      }
                    } else {
                      isValue = true;
                      row.valueList = '';
                    }
                  }
                }
              }
            }
          }
        }
        if (isValue) {
          if (_this.ruleIndex != null) {
            _this.moveonConfigList[_this.ruleIndex] = _this.editRuleConfig;
          } else {
            _this.moveonConfigList.push(_this.editRuleConfig);
          }
        }
        _this.ruleModel = false;
      }
    },
    getConditionJoinType(relList, index) {
      //页面条件展示
      let joinText = this.$t('page.and');
      let joinType = relList[index].joinType;
      if (joinType == 'or') {
        joinText = this.$t('page.or');
      }
      return joinText;
    },
    getChildrenNode(targetStepList, type) {
      //获取子节点/type
      this.ruleFormData.forEach(item => {
        if (item.name == 'targetStepList') {
          item.dataList = this.newChildrenNode;
          item.value = targetStepList;
        }
        if (item.name == 'type') {
          item.value = type;
          if (type == 'optional') {
            this.isShowRule = true;
          } else {
            this.isShowRule = false;
          }
        }
      });
    },
    getNewConditionList(formUuid) {
      //新的条件选择
      let data = {
        formUuid: formUuid
      };
      let _this = this;
      this.$api.process.process.conditionList(data).then(res => {
        if (res.Status == 'OK') {
          let dataList = res.Return;
          _this.ruleConditionList = dataList;
          dataList.forEach(item => {
            if (item.type == 'common') {
              item.handler = 'form' + item.controller;
            }
            _this.ruleConditionConfig[item.name] = item;
          });
        }
      });
    },
    conditionShow(val, type) {
      let text = '';
      let selectConfig = this.ruleConditionList.find(d => d.name == val);
      if (selectConfig) {
        text = selectConfig.label;
      }
      return text;
    },
    expressionShow(val, expression) {
      let expressionText = '';
      let expressionList = [];
      let selectConfig = this.ruleConditionList.find(d => d.name == val);
      if (selectConfig) {
        expressionList = selectConfig.expressionList;
        expressionText = selectConfig.expressionList.find(e => e.expression == expression).expressionName;
      }
      return expressionText;
    },
    changeConItem(item) {
      this.$set(item, 'expression', '');
      this.$set(item, 'valueList', '');
      let selectConfig = this.ruleConditionList.find(d => d.name == item.name);
      if (selectConfig) {
        item.type = selectConfig.type;
      }
    },
    changeExpression(item) {
      if (item.expression) {
        let expressionList = this.getExpressionList(item.name);
        let obj = expressionList.find(e => e.expression == item.expression);
        if (obj) {
          this.$set(item, 'isShowConditionValue', obj.isShowConditionValue);
          if (obj.isShowConditionValue == 0) {
            this.$set(item, 'valueList', '');
          }
        }
      }
    },
    saveNodeData() {
      let data = {};
      data.moveonConfigList = this.moveonConfigList;
      return data;
    }
  },

  filter: {},

  computed: {
    handlerType() {
      return function(name) {
        let type = 'forminput';
        if (this.ruleConditionConfig[name] && this.ruleConditionConfig[name].handler) {
          type = this.ruleConditionConfig[name].handler;
        }
        return type;
      };
    },
    getselectConfig() {
      return function(name) {
        let config = {};
        if (this.ruleConditionConfig[name]) {
          config = this.ruleConditionConfig[name];
          this.$set(config.config, 'readonlyClass', 'overflow text-default border-color item-readonly tsform-readonly');
          this.$set(config.config, 'sperateText', '、');
        }
        return config;
      };
    },
    getExpressionList() {
      return function(name) {
        let expressionList = [];
        if (this.ruleConditionConfig[name]) {
          expressionList = this.ruleConditionConfig[name].expressionList;
        }
        return expressionList;
      };
    }
  },

  watch: {
    formConfig: {
      handler(newVal, oldVal) {
        let _this = this;
        let newformConfig = newVal;
        this.formUuid = newformConfig.uuid || '';
      },
      deep: true
    },
    formUuid: {
      handler(newVal, oldVal) {
        this.getConditionNode(newVal);
      }
    }
  }
};
</script>

<style lang='less'>
@import '~@/resources/assets/css/variable.less';
.transparentSelect {
  .ivu-input {
    background-color: transparent !important;
  }
}
//条件节点弹框
.rule-condition {
  width: 100%;
  padding: 0 @space-xs;

  .edit-condition {
    position: relative;

    .add-btn {
      position: absolute;
      left: 80px;
      top: -60px;
      cursor: pointer;
      line-height: 20px;
    }

    .group-border {
      position: relative;
      width: 100%;

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
        border-radius: 2px;

        .btn-group {
          width: 100%;
          height: 32px;
          line-height: 32px;

          > span {
            cursor: pointer;
          }
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
        top: -8px;
        right: -8px;
        cursor: pointer;
      }
    }
  }
}
.item-readonly {
  width: 100%;
  height: 20px;
  line-height: 20px;
  border-bottom: 1px solid;
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
    z-index: 9;
  }
  &:before {
    top: 0;
  }
  &:after {
    bottom: 0;
  }
}
</style>
