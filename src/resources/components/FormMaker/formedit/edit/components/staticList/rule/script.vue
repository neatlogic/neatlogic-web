
<template>
  <div class="formsetting-block">
    <label class="formsetting-label text-grey label-switch">
      联动
      <span v-if="setting.isRule" class="tsfont-plus text-primary" @click="addRule">联动</span>
      <i-switch
        v-model="setting.isRule"
        class="label-right"
        @on-change="changeIsRule"
      >
      </i-switch>
    </label>
    <template v-if="setting.isRule">
      <div v-for="(rule,index) in setting.ruleList" :key="index" class="formsetting-text bg-block rule-div">
        <label class="formsetting-label text-grey label-switch">
          条件
        </label>
        <RuleCondition :attrList="setting.attributeList" :dataConfig="rule.condition"></RuleCondition>
        <div class="formsetting-text bg-block">
          <label class="formsetting-label text-grey label-switch">
            动作
          </label>
          <RuleAction :attrList="setting.attributeList" :dataList="rule.actionList"></RuleAction>
        </div>
      </div>

    </template>
  </div>
</template>
<script>
import RuleCondition from './rule-condition';
import RuleAction from './rule-action';
export default {
  name: '',
  components: {
    RuleCondition,
    RuleAction
  },
  filters: {
  },
  props: {
    setting: Object
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeIsRule() {
      this.setting.ruleList = [];
    },
    addRule() {
      this.setting.ruleList.unshift({
        condition: {
          attr: '',
          expression: '',
          value: ''
        },
        actionList: [{
          action: '',
          attr: ''
        }]
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.rule-div{
  margin-bottom: 6px;
}
</style>
