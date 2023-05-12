<template>
  <div class="edit-condition">
    <div>
      <span><a class="tsfont-plus" href="javascript:void(0)" @click="addConditionGroup()">{{ $t('term.cmdb.rulegroup') }}</a></span>
    </div>
    <div v-for="(conditionGroup, groupIndex) in rule.conditionGroupList" :key="groupIndex" class="group-border">
      <div class="group-content bg-op radius-md">
        <div v-for="(conItem, conditionIndex) in conditionGroup.conditionList" :key="conditionIndex" class="condition-content">
          <TsRow :gutter="8">
            <Col span="10">
              <div>
                <TsFormSelect
                  ref="select"
                  :dataList="customAttrList"
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
                ></TsFormSelect>
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
                v-if="conItem.type === 'attr' && getAttrByUuid(conItem.id)"
                ref="attrHandler"
                :valueList="conItem.valueList"
                :attrData="getAttrByUuid(conItem.id)"
                @setData="setAttrValue(conItem, arguments[0])"
              ></AttrSearcher>
              <TsFormInput
                v-else-if="conItem.type === 'constattr'"
                :value="conItem.valueList && conItem.valueList.length > 0 && conItem.valueList[0]"
                border="border"
                @on-change="
                  val => {
                    setAttrValue(conItem, val);
                  }
                "
              ></TsFormInput>
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
      <div v-if="rule.conditionGroupList.length - 1 > groupIndex">
        <TsRow>
          <Col span="1"></Col>
          <Col span="20">
            <div class="condition-joinType text-href">
              <TsFormSelect
                v-model="rule.conditionGroupRelList[groupIndex]"
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
      <div v-if="rule.conditionGroupList.length > 0" class="delGroup" @click="delConditionGroup(rule, groupIndex)">
        <i class="tsfont-close-s text-tip"></i>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AttrSearcher: resolve => require(['@/views/pages/cmdb/cientity/attr-searcher.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    value: { type: Object },
    customViewId: { type: Number }
  },
  data() {
    return {
      rule: this.value || {},
      customAttrList: [],
      attrMap: {},
      constAttrExpressionList: [
        { value: 'equal', text: this.$t('term.expression.eq') },
        { value: 'notequal', text: this.$t('term.expression.ne') },
        { value: 'like', text: '包含' },
        { value: 'notlike', text: '不包含' }
      ],
      joinTypeList: [
        {
          text: '并且',
          value: 'and'
        },
        {
          text: '或者',
          value: 'or'
        }
      ]
    };
  },
  beforeCreate() {},
  async created() {
    await this.getCustomAttrList();
    //去掉匹配不上的条件
    this.clearRule();
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
    clearRule() {
      if (this.rule && this.rule.conditionGroupList && this.rule.conditionGroupList.length > 0) {
        for (let gindex = this.rule.conditionGroupList.length - 1; gindex >= 0; gindex--) {
          const conditionGroup = this.rule.conditionGroupList[gindex];
          if (conditionGroup.conditionList && conditionGroup.conditionList.length > 0) {
            for (let cindex = conditionGroup.conditionList.length - 1; cindex >= 0; cindex--) {
              const condition = conditionGroup.conditionList[cindex];
              const index = this.customAttrList.findIndex(d => d.id === condition.id);
              if (index < 0) {
                conditionGroup.conditionList.splice(cindex, 1);
              }
            }
          }
          if (conditionGroup.conditionList.length == 0) {
            this.rule.conditionGroupList.splice(gindex, 1);
          }
        }
        if (this.rule.conditionGroupList.length == 0) {
          this.rule = {};
        }
        this.updateRule();
      }
    },
    async getCustomAttrList() {
      this.customAttrList = [];
      if (this.customViewId) {
        await this.$api.cmdb.customview.getCustomViewAttrByCustomViewId(this.customViewId, 0).then(res => {
          if (res.Return.attrList && res.Return.attrList.length > 0) {
            res.Return.attrList.forEach(attr => {
              this.customAttrList.push({ id: attr.uuid, type: 'attr', label: attr.alias, expressionList: attr.attrVo.expressionList });
              if (!this.attrMap[attr.uuid]) {
                this.attrMap[attr.uuid] = attr.attrVo;
              }
            });
          }
          if (res.Return.constAttrList && res.Return.constAttrList.length > 0) {
            res.Return.constAttrList.forEach(constattr => {
              this.customAttrList.push({ id: constattr.uuid, type: 'constattr', label: constattr.alias, expressionList: this.constAttrExpressionList });
            });
          }
        });
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
      this.updateRule();
    },
    setAttrExpression(condition, expression) {
      this.$set(condition, 'expression', expression);
      this.updateRule();
    },
    setAttr(condition, uuid, option, item) {
      if (uuid) {
        this.$set(condition, 'id', uuid);
        this.$set(condition, 'type', item.type);
      } else {
        this.$set(condition, 'id', null);
        this.$set(condition, 'type', null);
      }
      //切换属性后清空条件和值，避免残余数据留下
      this.$set(condition, 'expression', '');
      this.$set(condition, 'valueList', null);
      this.updateRule();
    },
    addCondition(conditionGroup) {
      conditionGroup.conditionList.push({
        uuid: this.$utils.setUuid(),
        id: null,
        //label: '',
        //name: '',
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
      this.updateRule();
    },
    delCondition(conditionGroup, index) {
      conditionGroup.conditionList.splice(index, 1);
      if (index > 0) {
        if (conditionGroup.conditionRelList && conditionGroup.conditionRelList.length > 0) {
          conditionGroup.conditionRelList.splice(index - 1, 1);
        }
      }
      this.updateRule();
    },
    getExpressionList(condition) {
      const item = this.customAttrList.find(d => d.id === condition.id);
      if (item) {
        return item.expressionList;
      }
      return [];
    },
    addConditionGroup() {
      if (!this.rule.conditionGroupRelList) {
        this.$set(this.rule, 'conditionGroupRelList', []);
      }

      if (!this.rule.conditionGroupList) {
        this.$set(this.rule, 'conditionGroupList', []);
      }
      if (this.rule.conditionGroupList.length > 0) {
        this.rule.conditionGroupRelList.push('and');
      }
      let group = {
        uuid: this.$utils.setUuid(),
        conditionList: [
          {
            uuid: this.$utils.setUuid(),
            id: null,
            //label: '',
            //name: '',
            type: '',
            expression: '',
            valueList: []
          }
        ],
        conditionRelList: []
      };
      this.rule.conditionGroupList.push(group);
      this.updateRule();
    },
    delConditionGroup(rule, index) {
      rule.conditionGroupList.splice(index, 1);
      if (index > 0) {
        if (rule.conditionGroupRelList && rule.conditionGroupRelList.length > 0) {
          rule.conditionGroupRelList.splice(index - 1, 1);
        }
      }
      this.updateRule();
    },
    updateRule() {
      this.$emit('input', this.rule);
    }
  },
  filter: {},
  computed: {
    getAttrByUuid() {
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
    customViewId: {
      handler: function(val) {
        this.getCustomAttrList();
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';
//条件节点弹框
/deep/.transparentSelect .ivu-input {
  background-color: transparent !important;
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
