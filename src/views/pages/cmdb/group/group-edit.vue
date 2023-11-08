<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <div>
          <TsForm ref="form" :item-list="formConfig"></TsForm>
          <div class="edit-condition">
            <div v-for="(ciGroup, index) in groupData.ciGroupList" :key="index">
              <Divider plain style="font-size:13px">
                <a class="tsfont-minus" href="javascript:void(0)" @click="delCi(index)">{{ $t('page.model') + '#' + (index + 1) }}</a>
              </Divider>
              <TsForm ref="subForm" class="mt-md" :item-list="subFormConfig">
                <template v-slot:ciId>
                  <TsFormSelect
                    ref="select"
                    v-bind="selectConfig"
                    :value="ciGroup.ciId"
                    :validateList="[{ name: 'required', message: ' ' }]"
                    @change="
                      (value, option) => {
                        return setCi(index, value, option);
                      }
                    "
                  ></TsFormSelect>
                </template>
                <template v-slot:rule>
                  <div>
                    <div>
                      <span><a class="tsfont-plus" href="javascript:void(0)" @click="addConditionGroup(index)">{{ $t('term.cmdb.rulegroup') }}</a></span>
                    </div>
                    <div v-for="(conditionGroup, groupIndex) in ciGroup.rule.conditionGroupList" :key="groupIndex" class="group-border">
                      <div class="group-content bg-op radius-md">
                        <div v-for="(conItem, conditionIndex) in conditionGroup.conditionList" :key="conditionIndex" class="condition-content">
                          <TsRow :gutter="8">
                            <Col span="10">
                              <div>
                                <TsFormSelect
                                  ref="select"
                                  :dataList="getAttrRelList(ciGroup.ciId)"
                                  search
                                  :value="conItem.id"
                                  :transfer="true"
                                  valueName="id"
                                  showName="label"
                                  textName="label"
                                  :validateList="[{ name: 'required', message: ' ' }]"
                                  @on-change="
                                    (value, option, item) => {
                                      setAttr(conItem, value, option, item);
                                    }
                                  "
                                >
                                  <template v-slot:option="{ item }">
                                    <span class="text-grey">{{ item.type == 'attr' ? '属性' : '关系' }}·</span>
                                    <span>{{ item.label }}</span>
                                    <span class="text-grey">({{ item.name }})</span>
                                  </template>
                                </TsFormSelect>
                              </div>
                            </Col>
                            <Col :span="isNeedAttrValue(conItem) ? 4 : 10">
                              <div class>
                                <TsFormSelect
                                  ref="select"
                                  :value="conItem.expression"
                                  :dataList="getExpressionList(conItem)"
                                  :transfer="true"
                                  :validateList="[{ name: 'required', message: ' ' }]"
                                  @change="
                                    (value, option) => {
                                      setAttrExpression(conItem, value);
                                    }
                                  "
                                ></TsFormSelect>
                              </div>
                            </Col>
                            <Col v-if="isNeedAttrValue(conItem)" span="8">
                              <AttrSearcher
                                v-if="conItem.type == 'attr' && getAttrById(conItem.id)"
                                ref="attrHandler"
                                :valueList="conItem.valueList"
                                :attrData="getAttrById(conItem.id)"
                                @setData="setAttrValue(conItem, arguments[0])"
                              ></AttrSearcher>
                              <TsFormSelect
                                v-if="conItem.type == 'relfrom' || conItem.type == 'relto'"
                                v-bind="getRelSelectConfig(conItem.id)"
                                :value="conItem.valueList"
                                :transfer="true"
                                @change="
                                  val => {
                                    setAttrValue(conItem, val);
                                  }
                                "
                              ></TsFormSelect>
                            </Col>
                            <Col span="2">
                              <div class="btn-group text-tip">
                                <span class="tsfont-plus mr-xs" style="cursor:pointer" @click="addCondition(conditionGroup)"></span>
                                <span
                                  v-if="conditionGroup.conditionList.length > 1"
                                  style="cursor:pointer"
                                  class="tsfont-minus"
                                  @click="delCondition(conditionGroup, conditionIndex)"
                                ></span>
                              </div>
                            </Col>
                          </TsRow>
                          <div v-if="conditionGroup.conditionList.length - 1 > conditionIndex">
                            <TsRow>
                              <Col span="12"></Col>
                              <Col span="10">
                                <div class="condition-joinType text-href">
                                  <TsFormSelect
                                    v-model="conditionGroup.conditionRelList[conditionIndex]"
                                    :dataList="joinTypeList"
                                    :clearable="false"
                                    border="none"
                                    size="small"
                                    :transfer="true"
                                    className="transparentSelect"
                                  ></TsFormSelect>
                                </div>
                              </Col>
                            </TsRow>
                          </div>
                        </div>
                      </div>
                      <div v-if="ciGroup.rule.conditionGroupList.length - 1 > groupIndex">
                        <TsRow>
                          <Col span="1"></Col>
                          <Col span="20">
                            <div class="condition-joinType text-href">
                              <TsFormSelect
                                v-model="ciGroup.rule.conditionGroupRelList[groupIndex]"
                                :dataList="joinTypeList"
                                :clearable="false"
                                border="none"
                                size="small"
                                :transfer="true"
                                className="transparentSelect"
                              ></TsFormSelect>
                            </div>
                          </Col>
                        </TsRow>
                      </div>
                      <div v-if="ciGroup.rule.conditionGroupList.length > 1" class="delGroup" @click="delConditionGroup(ciGroup.rule, groupIndex)">
                        <i class="tsfont-close-s text-tip"></i>
                      </div>
                    </div>
                  </div>
                </template>
              </TsForm>
            </div>
          </div>
          <Divider v-if="groupData" plain style="font-size:13px">
            <a class="tsfont-plus" href="javascript:void(0)" @click="addCi()">{{ $t('dialog.title.addtarget', { target: $t('page.model') }) }}</a>
          </Divider>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    AttrSearcher: resolve => require(['../cientity/attr-searcher.vue'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      isLoading: false,
      groupData: {},
      ciMap: {},
      attrMap: {},
      relMap: {},
      joinTypeList: [
        {
          text: this.$t('page.and'),
          value: 'and'
        },
        {
          text: this.$t('page.or'),
          value: 'or'
        }
      ],
      selectConfig: {
        url: 'api/rest/cmdb/ci/citype/search',
        validateList: ['required'],
        valueName: 'id',
        textName: 'label',
        childrenName: 'ciList',
        parentValueName: 'id',
        parentTextName: 'name',
        search: true,
        mode: 'group',
        transfer: true
      },
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('term.cmdb.group') }) : this.$t('dialog.title.addtarget', { target: this.$t('term.cmdb.group') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      formConfig: {
        id: { type: 'text', isHidden: true },
        name: {
          type: 'text',
          maxlength: 30,
          label: this.$t('page.name'),
          validateList: ['required'],
          width: '100%',
          onChange: value => {
            this.groupData.name = value;
          }
        },
        isActive: {
          type: 'radio',
          label: this.$t('page.enable'),
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ],
          validateList: ['required'],
          onChange: value => {
            this.groupData.isActive = value;
          }
        },
        type: {
          type: 'radio',
          label: this.$t('page.type'),
          dataList: [
            { value: 'readonly', text: this.$t('page.readonly') },
            { value: 'maintain', text: this.$t('page.maintain') }
          ],
          validateList: ['required'],
          onChange: value => {
            this.groupData.type = value;
          }
        },
        authList: {
          type: 'userselect',
          label: this.$t('page.auth'),
          width: '100%',
          transfer: true,
          validateList: ['required'],
          groupList: ['common', 'user', 'team', 'role'],
          onChange: value => {
            this.groupData.authList = value;
          }
        },
        description: {
          type: 'textarea',
          label: this.$t('page.description'),
          width: '100%',
          maxlength: 300,
          onChange: value => {
            this.groupData.description = value;
          }
        }
      },
      subFormConfig: {
        ciId: { type: 'slot', label: this.$t('page.model'), validateList: ['required'] },
        rule: { type: 'slot', label: this.$t('page.rule'), validateList: ['required'] }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getGroupById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getGroupById() {
      if (this.id) {
        this.isLoading = true;
        this.$api.cmdb.group.getGroupById(this.id).then(res => {
          this.isLoading = false;
          this.groupData = res.Return;
          for (let key in this.formConfig) {
            this.formConfig[key].value = this.groupData[key];
          }
          if (this.groupData.ciGroupList && this.groupData.ciGroupList.length > 0) {
            this.groupData.ciGroupList.forEach(cigroup => {
              this.fillCiMap(cigroup.ciId);
            });
          }
        });
      } else {
        this.$set(this.groupData, 'ciGroupList', []);
      }
    },
    async getAttrByCiId(ciId) {
      if (ciId) {
        let attrList;
        await this.$api.cmdb.ci.getAttrByCiId(ciId).then(res => {
          attrList = res.Return;
        });
        attrList.forEach(attr => {
          if (!this.attrMap['attr_' + attr.id]) {
            this.$set(this.attrMap, 'attr_' + attr.id, attr);
          }
        });
        return attrList;
      }
    },
    async getRelByCiId(ciId) {
      if (ciId) {
        let relList;
        await this.$api.cmdb.ci.getRelByCiId(ciId, {needAction: true}).then(res => {
          relList = res.Return;
        });
        relList.forEach(rel => {
          if (!this.relMap['rel' + rel.direction + '_' + rel.id]) {
            this.$set(this.relMap, 'rel' + rel.direction + '_' + rel.id, rel);
          }
        });
        return relList;
      }
    },
    getExpressionList(condition) {
      if (condition.type == 'attr' && this.attrMap[condition.id]) {
        return this.attrMap[condition.id].expressionList;
      } else if ((condition.type == 'relfrom' || condition.type == 'relto') && this.relMap[condition.id]) {
        return this.relMap[condition.id].expressionList;
      }
      return [];
    },
    addCi() {
      if (!this.groupData.ciGroupList) {
        this.$set(this.groupData, 'ciGroupList', []);
      }
      this.groupData.ciGroupList.push({ ciId: null, rule: {} });
    },
    delCi(index) {
      this.groupData.ciGroupList.splice(index, 1);
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    async setCi(index, value, option) {
      this.$set(this.groupData.ciGroupList[index], 'ciId', value);
      this.$set(this.groupData.ciGroupList[index], 'ciLabel', option.text);
      await this.fillCiMap(value);
    },
    async fillCiMap(ciId) {
      if (ciId && !this.ciMap['ci' + ciId]) {
        const elementList = [];
        const attrList = await this.getAttrByCiId(ciId);
        const relList = await this.getRelByCiId(ciId);
        attrList.forEach(attr => {
          elementList.push({ type: 'attr', id: 'attr_' + attr.id, name: attr.name, label: attr.label, expressionList: attr.expressionList });
        });
        relList.forEach(rel => {
          const name = rel.direction == 'from' ? rel.toName : rel.fromName;
          const label = rel.direction == 'from' ? rel.toLabel : rel.fromLabel;
          elementList.push({ type: 'rel' + rel.direction, id: 'rel' + rel.direction + '_' + rel.id, name: name, label: label, expressionList: rel.expressionList });
        });
        this.$set(this.ciMap, 'ci' + ciId, elementList);
      }
    },
    setAttrValue(condition, value) {
      if (value) {
        if (typeof value == 'object') {
          this.$set(condition, 'valueList', value);
        } else {
          this.$set(condition, 'valueList', [value]);
        }
      } else {
        this.$set(condition, 'valueList', null);
      }
    },
    setAttrExpression(condition, expression) {
      this.$set(condition, 'expression', expression);
    },
    setAttr(condition, id, option, item) {
      if (id) {
        this.$set(condition, 'id', id);
        this.$set(condition, 'type', item.type);
      } else {
        this.$set(condition, 'id', null);
        this.$set(condition, 'type', null);
      }
      //切换属性后清空条件和值，避免残余数据留下
      this.$set(condition, 'expression', '');
      this.$set(condition, 'valueList', null);
    },
    addCondition(conditionGroup) {
      conditionGroup.conditionList.push({
        uuid: this.$utils.setUuid(),
        id: null,
        label: '',
        name: '',
        type: '',
        expression: '',
        valueList: []
      });
      if (conditionGroup.conditionList.length > 1) {
        if (!conditionGroup.conditionRelList) {
          this.$set(conditionGroup, 'conditionRelList', []);
        }
        conditionGroup.conditionRelList.push('and');
      }
    },
    delCondition(conditionGroup, index) {
      conditionGroup.conditionList.splice(index, 1);
      if (index > 0) {
        if (conditionGroup.conditionRelList && conditionGroup.conditionRelList.length > 0) {
          conditionGroup.conditionRelList.splice(index - 1, 1);
        }
      }
    },
    addConditionGroup(index) {
      if (!this.groupData.ciGroupList[index].rule.conditionGroupRelList) {
        this.$set(this.groupData.ciGroupList[index].rule, 'conditionGroupRelList', []);
      }

      if (!this.groupData.ciGroupList[index].rule.conditionGroupList) {
        this.$set(this.groupData.ciGroupList[index].rule, 'conditionGroupList', []);
      }
      if (this.groupData.ciGroupList[index].rule.conditionGroupList.length > 0) {
        this.groupData.ciGroupList[index].rule.conditionGroupRelList.push('and');
      }
      let group = {
        uuid: this.$utils.setUuid(),
        conditionList: [
          {
            uuid: this.$utils.setUuid(),
            id: null,
            label: '',
            name: '',
            type: '',
            expression: '',
            valueList: []
          }
        ],
        conditionRelList: []
      };
      this.groupData.ciGroupList[index].rule.conditionGroupList.push(group);
    },
    delConditionGroup(rule, index) {
      rule.conditionGroupList.splice(index, 1);
      if (index > 0) {
        if (rule.conditionGroupRelList && rule.conditionGroupRelList.length > 0) {
          rule.conditionGroupRelList.splice(index - 1, 1);
        }
      }
    },
    save() {
      const form = this.$refs['form'];
      const selects = this.$refs['select'];
      let isValid = true;
      if (!form.valid()) {
        isValid = false;
      }
      if (selects && selects.length > 0) {
        selects.forEach(s => {
          if (!s.valid()) {
            isValid = false;
          }
        });
      }
      if (isValid) {
        this.$api.cmdb.group.saveGroup(this.groupData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    getAttrRelList() {
      return ciId => {
        return this.ciMap['ci' + ciId];
      };
    },
    getAttrById() {
      return attrId => {
        return this.attrMap[attrId];
      };
    },
    getRelById() {
      return relId => {
        return this.relMap[relId];
      };
    },
    getRelSelectConfig() {
      return function(id) {
        const rel = this.getRelById(id);
        if (rel) {
          return {
            border: 'border',
            dynamicUrl: '/api/rest/cmdb/cientity/search',
            params: { ciId: rel.direction == 'from' ? rel.toCiId : rel.fromCiId },
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            idListName: 'idList'
          };
        }
      };
    },
    isNeedAttrValue() {
      return condition => {
        if (!condition.expression || condition.expression == 'is-null' || condition.expression == 'is-not-null') {
          return false;
        } else {
          return true;
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scope>
@import '~@/resources/assets/css/variable.less';
//条件节点弹框
.transparentSelect {
  .ivu-input {
    background-color: transparent !important;
  }
}

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
