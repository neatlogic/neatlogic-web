<template>
  <div>
    <div v-for="(item,groupIndex) in editRuleConfig.conditionGroupList" :key="groupIndex" class="group-border">
      <div class="group-content bg-op">
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
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
