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
                  :dataList="finalAttrList"
                  :value="conItem.id"
                  :transfer="true"
                  :validateList="[{ name: 'required', message: ' ' }]"
                  @on-change="
                    (value, option, item) => {
                      setAttr(conItem, value, option, item);
                    }
                  "
                >
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
              <AttrHandler
                v-if="isSearchReady"
                :projectId="projectId"
                :attrConfig="getAttrById(conItem.id)"
                mode="search"
                @setValue="
                  (val, text) => {
                    setAttrValue(conItem,val);
                  }
                "
              ></AttrHandler>
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
    AttrHandler: () => import('@/views/pages/rdm/project/attr-handler/attr-handler.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    value: { type: Object },
    appId: { type: Number }
  },
  data() {
    return {
      rule: this.value || {},
      attrList: [],
      attrMap: {},
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
    this.getAttrByAppId();
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
              const index = this.attrList.findIndex(d => d.id === condition.id);
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
    getAttrByAppId() {
      this.attrList = [];
      if (this.appId) {
        this.$api.rdm.app.getAppById(this.appId, 1).then(res => {
          this.attrList = res.Return.attrList;
          this.attrList.forEach(attr => {
            if (attr.id) {
              if (!this.attrMap['attr_' + attr.id]) {
                this.$set(this.attrMap, 'attr_' + attr.id, attr);
              }
            } else {
              if (!this.attrMap['attr_' + attr.type]) {
                this.$set(this.attrMap, 'attr_' + attr.type, attr);
              }
            }
          });
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
    setAttr(condition, id, option, item) {
      if (id) {
        this.$set(condition, 'id', id);
      } else {
        this.$set(condition, 'id', null);
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
      console.log(JSON.stringify(condition, null, 2));
      console.log(JSON.stringify(this.attrMap, null, 2));
      if (condition.type == 'attr' && this.attrMap[condition.id]) {
        return this.attrMap[condition.id].expressionList;
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
    }
  },
  filter: {},
  computed: {
    finalAttrList() {
      const finalDataList = [];
      if (this.attrList && this.attrList.length > 0) {
        this.attrList.forEach(data => {
          if (data.id) {
            finalDataList.push({ value: 'attr_' + data.id, text: data.label, expressionList: data.expressionList });
          } else {
            finalDataList.push({ value: data.type, text: data.label, expressionList: data.expressionList});
          }
        });
      }
      return finalDataList;
    },
    getAttrById() {
      return attrId => {
        return this.finalAttrList.find(d => d.value == attrId);
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
            params: { appId: rel.direction == 'from' ? rel.toCiId : rel.fromCiId },
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
    appId: {
      handler: function(val) {
        this.getAttrByAppId();
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';
//条件节点弹框
/deep/.transparentSelect .ivu-input{
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
