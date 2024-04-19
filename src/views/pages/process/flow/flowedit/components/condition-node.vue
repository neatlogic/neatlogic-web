<template>
  <div class="condition-setting permission-list">
    <div class="control-setting">
      <span>{{ $t('term.process.flowrult') }}</span>
      <span class="tsfont-plus add-btn" @click="addRule()">{{ $t('page.rule') }}</span>
    </div>
    <div v-if="formUuid == ''">
      <div class="text-tip">
        {{ $t('term.process.flowrulttip') }}
        <a href="javascript:void(0);" @click="tabSetting">{{ $t('term.process.flowsetting') }}</a>
        {{ $t('page.relevance') }}
      </div>
    </div>
    <div v-if="moveonConfigList && moveonConfigList.length > 0">
      <div v-for="(item, index) in moveonConfigList" :key="index" class="rule-list">
        <div class="list">
          <div class="top">
            <div class="text-grey overflow">
              <span v-html="item.type == 'negative' ? $t('term.process.nottransfer') : $t('term.process.transferto')"></span>
              <span class="ml-xs text-default" :title="getTargetStepList(item.targetStepList)">
                <b>{{ getTargetStepList(item.targetStepList) }}</b>
              </span>
            </div>
            <div class="edit-icon">
              <i class="tsfont-setting click-tag text-action" @click="editRule(item, index)"></i>
              <span class="tsfont-close click-tag text-action del-inrule" @click="delRule(index)"></span>
            </div>
          </div>
          <div v-if="item.conditionGroupList.length > 0" class="rule-content edit-setting">
            <div v-for="(groupItem, groupIndex) in item.conditionGroupList" :key="groupIndex" class="group-list">
              <div v-for="(conditionItem, conditionIndex) in groupItem.conditionList" :key="conditionIndex">
                <div class="bg-grey padding-xs radius-sm">
                  <TsRow v-if="conditionItem.type !== 'custom'" :gutter="8">
                    <Col :span="conditionItem.isShowConditionValue == 1 ? 9 : 18">
                      <span :title="conditionShow(conditionItem.name)" class="overflow" style="font-style: italic">
                        {{ conditionShow(conditionItem.name) || $t('term.process.empty') }}
                      </span>
                    </Col>
                    <Col :span="6">
                      <span :title="expressionShow(conditionItem.name, conditionItem.expression)" class="text-grey overflow">{{ expressionShow(conditionItem.name, conditionItem.expression) || $t('term.process.empty') }}</span>
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
                  </TsRow>
                  <TsRow v-else>
                    <Col span="24">
                      <div :ref="'read'+conditionItem.uuid" class="bg-op">
                        <TsCodemirror
                          :value="conditionItem.expression"
                          codeMode="javascript"
                          :isReadOnly="true"
                          height="200px"
                        ></TsCodemirror>
                      </div>
                      <div style="text-align:right" class="tsfont-fullscreen cursor" @click="fullscreen('read'+conditionItem.uuid)">{{ $t('page.fullscreen') }}</div>
                    </Col>
                  </TsRow>
                </div>
                <div>
                  <TsRow v-show="conditionIndex < groupItem.conditionList.length - 1">
                    <Col span="12"></Col>
                    <Col span="10">
                      <div v-if="groupItem.conditionRelList[conditionIndex]" class="condition-joinType text-primary">
                        {{ getConditionJoinType(groupItem.conditionRelList, conditionIndex) }}
                      </div>
                    </Col>
                  </TsRow>
                </div>
              </div>
              <div class="mt-xs mb-xs">
                <TsRow v-show="groupIndex < item.conditionGroupList.length - 1">
                  <Col span="2"></Col>
                  <Col span="20">
                    <div v-if="item.conditionGroupRelList[groupIndex]" class="condition-joinType text-primary">
                      {{ getConditionJoinType(item.conditionGroupRelList, groupIndex) }}
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
      @on-close="ruleModel = false"
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
            <div class="text-href add-btn tsfont-plus">
              <Dropdown placement="bottom-start" :transfer="true">
                <a href="javascript:void(0)">
                  {{ $t('page.combinedcondition') }}
                  <Icon type="ios-arrow-down"></Icon>
                </a>
                <DropdownMenu slot="list">
                  <DropdownItem @click.native="addGroup()">{{ $t('page.common') }}</DropdownItem>
                  <DropdownItem @click.native="addGroup('custom')">{{ $t('page.custom') }}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div v-for="(item, groupIndex) in editRuleConfig.conditionGroupList" :key="groupIndex" class="group-border">
              <div class="group-content bg-op radius-md">
                <div v-for="(conItem, conIdex) in item.conditionList" :key="conIdex" class="condition-content">
                  <TsRow v-if="conItem.type !== 'custom'" :gutter="8">
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
                    <Col :span="conItem.isShowConditionValue && conItem.isShowConditionValue == 1 ? '6' : '16'">
                      <div>
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
                        <span style="padding-right: 8px">
                          <Dropdown placement="bottom-end" :transfer="true">
                            <span class="tsfont-plus"></span>
                            <DropdownMenu slot="list">
                              <DropdownItem @click.native="addCondition(item)">{{ $t('page.common') }}</DropdownItem>
                              <DropdownItem @click.native="addCondition(item, 'custom')">{{ $t('page.custom') }}</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </span>
                        <span v-if="item.conditionList.length > 1" class="tsfont-minus" @click="delCondition(item, conIdex)"></span>
                      </div>
                    </Col>
                  </TsRow>
                  <TsRow v-else :gutter="8">
                    <Col span="22">
                      <div>
                        <div :ref="conItem.uuid" class="bg-op">
                          <TsCodemirror
                            v-model="conItem.expression"
                            codeMode="javascript"
                            height="auto"
                            placeholder="请填写ES5脚本，最后返回true或false，范例：return data['attr'] == 1"
                          ></TsCodemirror>
                        </div>
                        <div>
                          <Poptip
                            trigger="hover"
                            word-wrap
                            width="550"
                            title="属性列表"
                            :transfer="true"
                          >
                            <span class="tsfont-question-o">{{ $t('page.help') }}</span>
                            <div slot="content">
                              <div v-if="formAttrList && formAttrList.length > 0" style="max-height: 350px; overflow: auto">
                                <ConditionAttrList :formAttrList="formAttrList"></ConditionAttrList>
                              </div>
                            </div>
                          </Poptip>
                          <div class="ml-sm tsfont-fullscreen cursor" style="display:inline-block;padding-top:1px" @click="fullscreen(conItem.uuid)">{{ $t('page.fullscreen') }}</div>
                        </div>
                      </div>
                    </Col>
                    <Col span="2">
                      <div class="btn-group text-tip">
                        <span style="padding-right: 8px">
                          <Dropdown placement="bottom-end" :transfer="true">
                            <span class="tsfont-plus"></span>
                            <DropdownMenu slot="list">
                              <DropdownItem @click.native="addCondition(item)">{{ $t('page.common') }}</DropdownItem>
                              <DropdownItem @click.native="addCondition(item, 'custom')">{{ $t('page.custom') }}</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </span>
                        <span v-if="item.conditionList.length > 1" class="tsfont-minus" @click="delCondition(item, conIdex)"></span>
                      </div>
                    </Col>
                  </TsRow>
                  <div v-if="item.conditionList.length - 1 > conIdex">
                    <TsRow>
                      <Col span="12"></Col>
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
              <div v-if="editRuleConfig.conditionGroupList.length - 1 > groupIndex">
                <TsRow>
                  <Col span="1"></Col>
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
              <div v-if="editRuleConfig.conditionGroupList.length > 1" class="delGroup" @click="delGroup(groupIndex)">
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
import screenfull from '@/resources/assets/js/screenfull.js';
import Items from '@/resources/components/FormItems';
import nodemixin from './nodemixin.js';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve),
    ConditionAttrList: resolve => require(['./condition-attr-list.vue'], resolve),
    ...Items
  },
  mixins: [nodemixin],
  props: {},
  data() {
    let _this = this;
    return {
      configData: { stepConfig: {} }, //当前节点数据
      formUuid: _this.formConfig && _this.formConfig.uuid ? _this.formConfig.uuid : '', //表单id
      newChildrenNode: _this.nodeChildren || [], //条件节点
      formAttrList: [],
      ruleFormData: [
        {
          type: 'select',
          name: 'targetStepList',
          value: '',
          placeholder: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.node') }),
          width: 320,
          maxlength: 30,
          label: this.$t('term.process.transferto'),
          multiple: true,
          valueName: 'uuid',
          textName: 'name',
          validateList: [
            {
              name: 'required',
              message: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.node') })
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
            // {
            //   value: 'negative',
            //   text: this.$t('term.process.nottransfer')
            // },
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
      //ruleConditionList: [], //条件节点：规则条件
      //ruleConditionConfig: {}, //每个条件对应的数据
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

  created() {
    console.log(JSON.stringify(this.formConfig, null, 2));
  },

  beforeMount() {},

  mounted() {
    this.keyList = ['moveonConfigList']; //stepConfig 需要包含的数据
    this.getNodeSetting();
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    fullscreen(div) {
      let fullDiv = this.$refs[div];
      if (fullDiv && fullDiv.length > 0 && screenfull.isEnabled) {
        screenfull.request(fullDiv[0]);
      }
    },
    getNodeSetting() {
      //初始化节点数据
      let config = (this.configData = this.$utils.deepClone(this.nodeConfig));
      this.getNewConditionList(this.formUuid);
      this.initNodeData(config, this.keyList); //初始化数据
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
      let obj = JSON.parse(JSON.stringify(item));
      let nodeUuidlist = obj.targetStepList;
      let type = obj.type;
      this.editRuleConfig = obj;
      this.getChildrenNode(nodeUuidlist, type);
      this.ruleIndex = index;
      this.ruleModel = true;
    },
    addGroup(type) {
      //条件节点规则：添加组合
      //let conditionGroupRelList = this.editRuleConfig.conditionGroupRelList || [];
      let GroupList = this.editRuleConfig.conditionGroupList;
      let endRelUuid = GroupList[GroupList.length - 1].uuid;
      let groupUuid = this.$utils.setUuid(); //获取组的uuid
      let uuid = this.$utils.setUuid(); //获取条件uuid
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
            type: type || '',
            expression: '',
            valueList: '',
            isShowConditionValue: type === 'custom' ? 0 : 1
          }
        ],
        conditionRelList: []
      };
      this.editRuleConfig.conditionGroupRelList.push(groupRel);
      this.editRuleConfig.conditionGroupList.push(group);
    },
    delGroup(index) {
      //删除组合
      const uuid = this.editRuleConfig.conditionGroupList[index].uuid;
      this.$delete(this.editRuleConfig.conditionGroupList, index);
      const relindex = this.editRuleConfig.conditionGroupRelList.findIndex(d => d.from === uuid || d.to === uuid);
      if (relindex >= 0) {
        this.$delete(this.editRuleConfig.conditionGroupRelList, relindex);
      }
    },
    addCondition(item, type) {
      //条件节点规则：添加条件
      let uuid = this.$utils.setUuid(); //获取条件uuid
      //let conditionRelList = item.conditionRelList || [];
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
        type: type || '',
        expression: '',
        valueList: '',
        isShowConditionValue: type === 'custom' ? 0 : 1
      };
      item.conditionList.push(condition);
      item.conditionRelList.push(conditionRel);
    },
    delCondition(item, index) {
      //删除条件
      const uuid = item.conditionList[index].uuid;
      this.$delete(item.conditionList, index);
      const relindex = item.conditionRelList.findIndex(d => d.from === uuid || d.to === uuid);
      if (relindex >= 0) {
        this.$delete(item.conditionRelList, relindex);
      }
    },
    delRule(index) {
      //删除条件节点规则
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('term.process.noderules') }),
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
      let rule = this.$refs.mainRule;
      let isValue = false;
      if (rule.valid()) {
        let data = rule.getFormValue();
        this.editRuleConfig.targetStepList = data.targetStepList;
        let type = data.type;
        this.editRuleConfig.type = type;
        let conditionGroupList = this.editRuleConfig.conditionGroupList || [];
        if (type != 'optional') {
          this.editRuleConfig.conditionGroupList = [];
          if (this.ruleIndex != null) {
            this.moveonConfigList[this.ruleIndex] = this.editRuleConfig;
          } else {
            this.moveonConfigList.push(this.editRuleConfig);
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
                    if (row.isShowConditionValue === 1) {
                      if (key == 'valueList' && Array.isArray(val)) {
                        if (val.length == 0) {
                          this.$Notice.error({
                            title: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.condition') }),
                            duration: 1.5
                          });
                          isValue = false;
                          return false;
                        } else {
                          if (val[0] == '') {
                            this.$Notice.error({
                              title: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.condition') }),
                              duration: 1.5
                            });
                            isValue = false;
                            return false;
                          }
                        }
                      } else if (!val) {
                        this.$Notice.error({
                          title: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.condition') }),
                          duration: 1.5
                        });
                        isValue = false;
                        return false;
                      } else {
                        isValue = true;
                      }
                    } else {
                      row.valueList = '';
                      if (row.type !== 'custom') {
                        isValue = true;
                      } else {
                        if (!row.expression) {
                          this.$Notice.error({
                            title: this.$t('form.placeholder.pleaseinput', { target: this.$t('term.process.customexpression') }),
                            duration: 1.5
                          });
                          isValue = false;
                          return false;
                        } else {
                          isValue = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (isValue) {
          if (this.ruleIndex != null) {
            this.moveonConfigList[this.ruleIndex] = this.editRuleConfig;
          } else {
            this.moveonConfigList.push(this.editRuleConfig);
          }
        }
        this.ruleModel = false;
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
      let dataList = [];
      if (!this.$utils.isEmpty(this.moveonConfigList)) {
        let list = [];
        this.moveonConfigList.forEach(item => {
          list.push(...item.targetStepList);
        });
        this.newChildrenNode.forEach(item => {
          let obj = this.$utils.deepClone(item);
          if (list.includes(obj.uuid)) {
            if (this.$utils.isEmpty(targetStepList)) {
              this.$set(obj, '_disabled', true);
            } else {
              let findItem = targetStepList.find(t => t === obj.uuid);
              if (!findItem) {
                this.$set(obj, '_disabled', true);
              }
            }
          }
          dataList.push(obj);
        });
      } else {
        dataList = this.$utils.deepClone(this.newChildrenNode);
      }
      //获取子节点/type
      this.ruleFormData.forEach(item => {
        if (item.name == 'targetStepList') {
          item.dataList = dataList;
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
        formUuid: formUuid,
        isAll: 1
      };
      this.$api.process.process.conditionList(data).then(res => {
        if (res.Status == 'OK') {
          this.formAttrList = res.Return;
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
    ruleConditionConfig() {
      const data = {};
      if (this.formAttrList && this.formAttrList.length > 0) {
        this.formAttrList.forEach(item => {
          data[item.name] = item;
        });
      }
      return data;
    },
    ruleConditionList() {
      const list = [];
      if (this.formAttrList && this.formAttrList.length > 0) {
        this.formAttrList.forEach(d => {
          if (d.conditionable) {
            list.push(d);
          }
        });
      }
      return list;
    },
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
        this.getNewConditionList(newVal);
      }
    }
  }
};
</script>

<style lang="less">
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
  font-weight: bold;
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
