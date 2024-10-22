<template>
  <div class="edit-condition">
    <div class="pb-sm">
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
                  :dataList="hasValueFormItemList"
                  search
                  :value="conItem.formItemUuid"
                  :transfer="true"
                  valueName="uuid"
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
                  :dataList="expressionList"
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
              <div>
                <FormItem
                  ref="select"
                  :formItem="getFormItem(conItem.formItemUuid)"
                  :value="conItem.valueList"
                  mode="condition"
                  isCustomValue
                  @change="
                    val => {
                      setAttrValue(conItem, val);
                    }
                  "
                ></FormItem>
              </div>
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
    FormItem: () => import('@/resources/plugins/TsSheet/form-item.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    value: { type: Object },
    formItemList: { type: Array },
    formItem: {
      type: Object,
      default: () => {}
    },
    reactionKey: { type: String }
  },
  data() {
    return {
      rule: this.value || {},
      expressionList: [
        { text: this.$t('term.expression.eq'), value: 'equal' },
        { text: this.$t('term.expression.ne'), value: 'notequal' },
        { text: this.$t('term.expression.like'), value: 'include' },
        { text: this.$t('term.expression.notlike'), value: 'exclude' },
        { text: this.$t('term.expression.empty'), value: 'isnull' },
        { text: this.$t('term.expression.notempty'), value: 'isnotnull' },
        { text: this.$t('page.valuechange'), value: 'change' }
      ],
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
      filterComponentList: ['formtableselector', 'formtableinputer', 'formsubassembly'] //过滤不参与规则的组件
    };
  },
  beforeCreate() {},
  created() {
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
              let uuidList = (condition.formItemUuid && condition.formItemUuid.split('#')) || [];
              let uuid = uuidList[0];
              const index = this.formItemList.findIndex(d => d.uuid === uuid);
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
    setAttrValue(condition, value) {
      if (!this.$utils.isEmpty(value)) {
        if (Array.isArray(value)) {
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
      this.$set(condition, 'valueList', null);
      this.updateRule();
    },
    setAttr(condition, id, option, item) {
      if (id) {
        this.$set(condition, 'formItemUuid', id);
      } else {
        this.$set(condition, 'formItemUuid', null);
      }
      //切换属性后清空条件和值，避免残余数据留下
      this.$set(condition, 'expression', '');
      this.$set(condition, 'valueList', null);
      this.updateRule();
    },
    addCondition(conditionGroup) {
      conditionGroup.conditionList.push({
        uuid: this.$utils.setUuid(),
        formItemUuid: null,
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
            formItemUuid: null,
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
      if (rule.conditionGroupList.length == 0) {
        this.$delete(rule, 'conditionGroupList');
        this.$delete(rule, 'conditionGroupRelList');
        this.$delete(rule, 'value');
        if (rule.hasOwnProperty('type')) {
          this.$delete(rule, 'type');
        }
        if (rule.hasOwnProperty('valueList')) { //条件赋值
          this.$delete(rule, 'valueList');
        }
      }
      if (!rule.conditionGroupRelList || rule.conditionGroupRelList.length == 0) {
        this.$delete(rule, 'conditionGroupRelList');
      }
      this.updateRule();
    },
    updateRule() {
      this.$emit('input', this.rule);
    },
    //校验方法，也供外部调用，修改时注意
    valid() {
      let isValid = true;
      if (this.$refs['select']) {
        this.$refs['select'].forEach(element => {
          if (element.valid && !element.valid()) {
            isValid = false;
          }
        });
      }
      if (isValid && this.rule.conditionGroupList) {
        this.rule.conditionGroupList.forEach(cg => {
          if (cg.conditionList && cg.conditionList.length > 0) {
            cg.conditionList.forEach(c => {
              if (!c.formItemUuid || !c.expression) {
                isValid = false;
              } else if (this.isNeedAttrValue(c) && (!c.valueList || c.valueList.length == 0)) {
                isValid = false;
              }
            });
          }
        });
      }
      this.$emit('reactionValid', isValid);
      return isValid;
    },
    getFormItem(formItemUuid) {
      let list = formItemUuid.split('#');
      let uuid = list[0];
      let findItem = this.$utils.deepClone(this.formItemList.find(d => d.uuid === uuid));
      if (list[1] && !this.$utils.isEmpty(findItem.config.mapping)) {
        findItem.config.mapping.value = list[1];
        findItem.config.mapping.text = list[1];
      }
      return findItem;
    }
  },
  filter: {},
  computed: {
    hasValueFormItemList() {
      let list = [];
      if (this.reactionKey === 'setValueOther') {
        list = this.formItemList.filter(d => d.uuid === this.formItem.uuid && !this.filterComponentList.includes(d.handler));
      } else {
        list = this.formItemList.filter(d => d.hasValue && (!this.formItem || d.uuid != this.formItem.uuid) && !this.filterComponentList.includes(d.handler));
      }
      let newList = [];
      list.forEach(item => {
        let obj = {
          label: item.label,
          uuid: item.uuid
        };
        let children = [];
        if (item.config && !this.$utils.isEmpty(item.config.hiddenFieldList)) {
          item.config.hiddenFieldList.forEach(a => {
            children.push({
              label: item.label + '.' + a.text,
              uuid: item.uuid + '#' + a.value
            });
          });
        }
        newList.push(obj);
        if (!this.$utils.isEmpty(children)) {
          newList.push(...children);
        }
      });
      return newList;
    },
    isNeedAttrValue() {
      return condition => {
        if (!condition.formItemUuid || !condition.expression || condition.expression == 'isnull' || condition.expression == 'isnotnull' || condition.expression == 'change') {
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
      top: 0px;
      right: 0px;
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
  width: 70px;
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
