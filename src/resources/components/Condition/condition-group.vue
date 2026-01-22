<template>
  <div class="edit-condition">
    <div v-if="!readonly" class="mb-md">
      <span>
        <a class="tsfont-plus" href="javascript:void(0)" @click="addConditionGroup()">{{ $t('term.cmdb.rulegroup') }}</a>
      </span>
    </div>
    <div v-for="(conditionGroup, groupIndex) in rule.conditionGroupList" :key="groupIndex" class="group-border">
      <div
        class="radius-md"
        :class="{
          'padding-sm': padding,
          'bg-op': level % 2 !== 0,
          'bg-grey': level % 2 === 0,
          'border-base': border
        }"
      >
        <div v-for="(conItem, conditionIndex) in conditionGroup.conditionList" :key="conditionIndex" class="condition-content">
          <TsRow :gutter="8">
            <Col span="10">
              <div>
                <TsFormSelect
                  :dataList="attrList"
                  search
                  :disabled="readonly"
                  :value="conItem.name"
                  :transfer="true"
                  border="border"
                  valueName="name"
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
                  :disabled="readonly"
                  :value="conItem.expression"
                  :dataList="getExpressionList(conItem)"
                  :transfer="true"
                  border="border"
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
              <ConditionItem
                v-if="getAttr(conItem)"
                :readonly="readonly"
                :value="conItem.valueList"
                :expression="conItem.expression"
                :conditionItem="getAttr(conItem)"
                :conditionItemData="conItem"
                @change="
                  val => {
                    setAttrValue(conItem, val);
                  }
                "
              ></ConditionItem>
            </Col>
            <Col v-if="!readonly" span="2">
              <div class="btn-group text-grey">
                <span class="tsfont-plus mr-xs" style="cursor: pointer" @click="addCondition(conditionGroup)"></span>
                <span
                  v-if="conditionGroup.conditionList.length > 1"
                  style="cursor: pointer"
                  class="tsfont-minus"
                  @click="delCondition(conditionGroup, conditionIndex)"
                ></span>
              </div>
            </Col>
            <Col v-else-if="resultMap" span="2">
              <div v-if="resultMap[conItem.uuid]" class="pt-xs" style="text-align:center">
                <span v-if="resultMap[conItem.uuid].result" class="tsfont-check text-success text-bold"></span>
                <div v-else>
                  <Tooltip
                    v-if="resultMap[conItem.uuid].errorMsg"
                    placement="left"
                    max-width="300"
                    :transfer="true"
                    :content="resultMap[conItem.uuid].errorMsg"
                  >
                    <span class="tsfont-warning-s text-error text-bold"></span>
                  </Tooltip>
                  <span v-else class="tsfont-close text-error text-bold"></span>
                </div>
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
                    :disabled="readonly"
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
                :disabled="readonly"
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
      <div v-if="!readonly && rule.conditionGroupList.length > 0" class="delGroup" @click="delConditionGroup(rule, groupIndex)">
        <i class="tsfont-close-s text-grey"></i>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    ConditionItem: () => import('@/resources/components/Condition/condition-item.vue')
  },
  props: {
    padding: { type: Boolean, default: true },
    border: { type: Boolean, default: false },
    level: { type: Number, default: 1 },
    value: { type: Object },
    readonly: { type: Boolean, default: false },
    resultMap: { type: Object }, //结果
    attrList: [] //定义属性列表，[{name:'attrname',label:'属性名称',url:'xxx',dataList:[{value:'value',text:'text'}],expressionList:['equal','like']}]
  },
  data() {
    return {
      rule: this.value || {},
      attrMap: {},
      relMap: {},
      expressionMap: {
        equal: '等于',
        notequal: '不等于',
        like: '包含',
        notlike: '不包含',
        range: '范围',
        gt: '大于',
        lt: '小于',
        gte: '大于等于',
        lte: '小于等于',
        'is-null': '为空',
        'is-not-null': '不为空',
        inworktime: '在服务时间内',
        outworktime: '在服务时间外'
      },
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
    //去掉匹配不上的条件
    //this.clearRule();
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
    getAttr(condition) {
      return this.attrList.find(d => d.name === condition.name);
    },
    getSelectConfig(condition) {
      const item = this.attrList.find(d => d.name == condition.name);
      if (item) {
        const config = {};
        if (item.dataList) {
          config['dataList'] = item.dataList;
          config['isMultiple'] = item.isMultiple || false;
          return config;
        } else if (item.url) {
          config['dynamicUrl'] = item.url;
          config['isMultiple'] = item.isMultiple || false;
          return config;
        }
      }
      return null;
    },
    clearRule() {
      if (this.rule && this.rule.conditionGroupList && this.rule.conditionGroupList.length > 0) {
        for (let gindex = this.rule.conditionGroupList.length - 1; gindex >= 0; gindex--) {
          const conditionGroup = this.rule.conditionGroupList[gindex];
          if (conditionGroup.conditionList && conditionGroup.conditionList.length > 0) {
            for (let cindex = conditionGroup.conditionList.length - 1; cindex >= 0; cindex--) {
              const condition = conditionGroup.conditionList[cindex];
              const index = this.attrList.findIndex(d => d.name === condition.name);
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
    setAttr(condition, id, option, item) {
      if (id) {
        this.$set(condition, 'id', item.name);
        this.$set(condition, 'name', item.name);
        this.$set(condition, 'label', item.label);
      } else {
        this.$set(condition, 'id', null);
        this.$set(condition, 'name', null);
        this.$set(condition, 'label', null);
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
      const item = this.attrList.find(d => d.name === condition.name);
      if (item) {
        const expressionList = [];
        item.expressionList.forEach(d => {
          if (this.expressionMap[d]) {
            expressionList.push({ value: d, text: this.expressionMap[d] });
          }
        });
        return expressionList;
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
            label: '',
            name: '',
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
      //console.log(JSON.stringify(this.rule, null, 2));
      this.$emit('input', this.rule);
    },
    isNeedAttrValue(condition) {
      if (!condition.expression || condition.expression == 'is-null' || condition.expression == 'is-not-null') {
        return false;
      } else {
        return true;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';
//条件节点弹框
::v-deep .transparentSelect .ivu-input {
  background-color: transparent !important;
}
::v-deep .transparentSelect .ivu-tag-default {
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
