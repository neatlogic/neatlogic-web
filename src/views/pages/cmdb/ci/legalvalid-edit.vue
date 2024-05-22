<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <TsContain
          mode="dialog"
          border="border"
          :hideHeader="true"
          :siderWidth="150"
        >
          <div v-if="legalValidList && legalValidList.length > 0" slot="sider">
            <div class="legalValid">
              <div :class="!id ? 'text-primary' : ''" @click="editLegalValid()">{{ $t('term.cmdb.newrule') }}</div>
              <div
                v-for="legalValid in legalValidList"
                :key="legalValid.id"
                style="position: relative"
                :class="id && id == legalValid.id ? 'text-primary' : ''"
                class="overflow pr-xs"
                @click="editLegalValid(legalValid.id)"
              >
                <span :title="legalValid.name" :class="legalValid.isActive == 0 ? 'text-grey' : ''">{{ legalValid.name }}</span>
                <i class="tsfont-trash-o" style="cursor: pointer; position: absolute; right: 2px; top: 2px" @click="delLegalValid(legalValid)"></i>
              </div>
            </div>
          </div>
          <div slot="content" :class="legalValidList && legalValidList.length > 0 ? 'bg-block radius-md padding' : ''">
            <TsForm ref="form" :item-list="formConfig">
              <template v-slot:cron>
                <TsQuartz
                  class="inline"
                  :value="legalValidData.cron"
                  :transfer="true"
                  @change="
                    value => {
                      changeCron(value);
                    }
                  "
                ></TsQuartz>
              </template>
              <template v-slot:rule>
                <div class="edit-condition">
                  <div>
                    <span>
                      <a class="tsfont-plus" href="javascript:void(0)" @click="addConditionGroup">{{ $t('term.cmdb.rulegroup') }}</a>
                    </span>
                  </div>
                  <div v-for="(conditionGroup, groupIndex) in legalValidData.rule.conditionGroupList" :key="groupIndex" class="group-border">
                    <div class="group-content bg-op radius-md group-content-position">
                      <div v-for="(conItem, conditionIndex) in conditionGroup.conditionList" :key="conditionIndex" class="condition-content">
                        <TsRow :gutter="8">
                          <Col span="6">
                            <div>
                              <TsFormSelect
                                ref="select"
                                :dataList="attrRelList"
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
                                  <span class="text-grey">{{ item.type == 'attr' ? $t('page.attribute') : $t('page.relation') }}·</span>
                                  <span>{{ item.label }}</span>
                                  <span class="text-grey">({{ item.name }})</span>
                                </template>
                              </TsFormSelect>
                            </div>
                          </Col>
                          <Col :span="isNeedAttrValue(conItem) ? 6 : 10">
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
                          <Col v-if="isNeedAttrValue(conItem)" span="10">
                            <AttrSearcher
                              v-if="conItem.type == 'attr' && getAttrById(conItem.id)"
                              ref="attrHandler"
                              :valueList="conItem.valueList"
                              :attrData="getAttrById(conItem.id)"
                              @setData="setAttrValue(conItem, arguments[0])"
                            ></AttrSearcher>
                            <TsFormSelect
                              v-if="conItem.type == 'relfrom' || conItem.type == 'relto'"
                              v-bind="getSelSelectConfig(conItem.id)"
                              :value="conItem.valueList"
                              :transfer="true"
                              :validateList="[{ name: 'required', message: ' ' }]"
                              @change="
                                val => {
                                  setAttrValue(conItem, val);
                                }
                              "
                            ></TsFormSelect>
                          </Col>
                          <div class="operation-btn-group">
                            <div class="btn-group text-tip">
                              <span class="tsfont-plus mr-xs" style="cursor: pointer" @click="addCondition(conditionGroup)"></span>
                              <span
                                v-if="conditionGroup.conditionList.length > 1"
                                style="cursor: pointer"
                                class="tsfont-minus"
                                @click="delCondition(conditionGroup, conditionIndex)"
                              ></span>
                            </div>
                          </div>
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
                                  :validateList="[{ name: 'required', message: ' ' }]"
                                  class="transparentSelect"
                                ></TsFormSelect>
                              </div>
                            </Col>
                          </TsRow>
                        </div>
                      </div>
                    </div>
                    <div v-if="legalValidData.rule.conditionGroupList.length - 1 > groupIndex">
                      <TsRow>
                        <Col span="1"></Col>
                        <Col span="20">
                          <div class="condition-joinType text-href">
                            <TsFormSelect
                              v-model="legalValidData.rule.conditionGroupRelList[groupIndex]"
                              :dataList="joinTypeList"
                              :clearable="false"
                              border="none"
                              size="small"
                              :transfer="true"
                              class="transparentSelect"
                            ></TsFormSelect>
                          </div>
                        </Col>
                      </TsRow>
                    </div>
                    <div v-if="legalValidData.rule.conditionGroupList.length > 1" class="delGroup" @click="delConditionGroup(groupIndex)">
                      <i class="tsfont-close-s text-tip"></i>
                    </div>
                  </div>
                </div>
              </template>
            </TsForm>
          </div>
        </TsContain>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsForm from '@/resources/plugins/TsForm/TsForm';
import TsQuartz from '@/resources/plugins/TsQuartz/TsQuartz';
export default {
  name: '',
  components: {
    TsForm,
    TsQuartz,
    TsFormSelect,
    AttrSearcher: () => import('../cientity/attr-searcher.vue')
  },
  props: {
    ciId: {
      type: Number
    }
  },
  data() {
    const _this = this;
    return {
      id: null,
      ciMap: {},
      attrMap: {},
      relMap: {},
      legalValidData: { ciId: this.ciId, rule: { conditionGroupList: [], conditionGroupRelList: [] } },
      legalValidList: [],
      attrRelList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large',
        title: this.$t('term.cmdb.legalcheckconfig')
      },
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
      formConfig: {
        id: { type: 'text', isHidden: true },
        name: {
          type: 'text',
          maxlength: 30,
          label: this.$t('page.name'),
          validateList: ['required'],
          onChange: value => {
            this.legalValidData.name = value;
          }
        },
        type: {
          type: 'radio',
          label: this.$t('page.type'),
          url: 'api/rest/universal/enum/get',
          params: { enumClass: 'neatlogic.framework.cmdb.enums.legalvalid.LegalValidType' },
          onChange: value => {
            this.legalValidData.type = value;
            if (value == 'ci') {
              this.formConfig.rule.isHidden = true;
            } else if (value == 'custom') {
              this.formConfig.rule.isHidden = false;
            }
          },
          desc: this.$t('form.help.legalrule')
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
            this.legalValidData.isActive = value;
          }
        },
        cron: {
          type: 'slot',
          label: this.$t('page.timer')
        },
        rule: {
          type: 'slot',
          label: this.$t('page.rule'),
          isHidden: true
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getCiById() {
      if (this.ciId) {
        const attrList = await this.getAttrByCiId(this.ciId);
        const relList = await this.getRelByCiId(this.ciId);
        attrList.forEach(attr => {
          this.attrRelList.push({ type: 'attr', id: 'attr_' + attr.id, name: attr.name, label: attr.label, expressionList: attr.expressionList });
        });
        relList.forEach(rel => {
          const name = rel.direction == 'from' ? rel.toName : rel.fromName;
          const label = rel.direction == 'from' ? rel.toLabel : rel.fromLabel;
          this.attrRelList.push({ type: 'rel' + rel.direction, id: 'rel' + rel.direction + '_' + rel.id, name: name, label: label, expressionList: rel.expressionList });
        });
      }
    },
    delLegalValid(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: row.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.legalvalid.deleteLegalValid(row.id).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.getLegalValidByCiId();
            if (this.id == row.id) {
              this.id = null;
            }
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
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
        await this.$api.cmdb.ci.getRelByCiId(ciId, { needAction: true }).then(res => {
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
    setAttr(condition, id, option, item) {
      if (id) {
        this.$set(condition, 'id', id);
        this.$set(condition, 'type', item.type);
      } else {
        this.$set(condition, 'id', null);
        this.$set(condition, 'type', null);
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
    getExpressionList(condition) {
      if (condition.type == 'attr' && this.attrMap[condition.id]) {
        return this.attrMap[condition.id].expressionList;
      } else if ((condition.type == 'relfrom' || condition.type == 'relto') && this.relMap[condition.id]) {
        return this.relMap[condition.id].expressionList;
      }
      return [];
    },
    addConditionGroup() {
      if (!this.legalValidData.rule.conditionGroupRelList) {
        this.$set(this.legalValidData.rule, 'conditionGroupRelList', []);
      }

      if (!this.legalValidData.rule.conditionGroupList) {
        this.$set(this.legalValidData.rule, 'conditionGroupList', []);
      }
      if (this.legalValidData.rule.conditionGroupList.length > 0) {
        this.legalValidData.rule.conditionGroupRelList.push('and');
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
      this.legalValidData.rule.conditionGroupList.push(group);
    },
    delConditionGroup(index) {
      this.legalValidData.rule.conditionGroupList.splice(index, 1);
      if (index > 0) {
        if (this.legalValidData.rule.conditionGroupRelList && this.legalValidData.rule.conditionGroupRelList.length > 0) {
          this.legalValidData.rule.conditionGroupRelList.splice(index - 1, 1);
        }
      }
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
    getLegalValidByCiId() {
      this.$api.cmdb.legalvalid.searchLegalValid({ ciId: this.ciId }).then(res => {
        this.legalValidList = res.Return;
      });
    },
    editLegalValid(id) {
      this.id = id;
    },
    changeCron(value) {
      this.legalValidData.cron = value;
    },
    async init() {
      this.getLegalValidByCiId();
      this.getCiById();
    },
    async getLegalValidById() {
      if (this.id) {
        await this.$api.cmdb.legalvalid.getLegalValidById(this.id).then(res => {
          this.legalValidData = res.Return;
          if (this.legalValidData.type == 'custom') {
            this.formConfig.rule.isHidden = false;
          } else if (this.legalValidData.type == 'ci') {
            this.formConfig.rule.isHidden = true;
          }
          for (let k in this.formConfig) {
            this.formConfig[k].value = this.legalValidData[k];
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
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
        this.$api.cmdb.legalvalid.saveLegalValid(this.legalValidData).then(res => {
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
  watch: {
    id: {
      handler: async function(val) {
        if (val) {
          await this.getLegalValidById();
        } else {
          this.legalValidData = { ciId: this.ciId, rule: { conditionGroupList: [], conditionGroupRelList: [] } };
          for (let k in this.formConfig) {
            this.$delete(this.formConfig[k], 'value');
          }
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';
//条件节点弹框
.transparentSelect {
  /deep/ .ivu-input {
    background: transparent !important;
    background-color: transparent !important;
  }
}
.group-content-position {
  position: relative;
}
.operation-btn-group {
  position: absolute;
  right: 0;
  padding-left: 12px;
}

.legalValid {
  height: 100%;
  div {
    font-weight: 400;
    min-width: 130px;
    height: 32px;
    line-height: 32px;
    padding-left: 16px;
    cursor: pointer;
    margin-right: 16px;
  }
}

.edit-condition {
  position: relative;
  padding-right: @space-md;
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
