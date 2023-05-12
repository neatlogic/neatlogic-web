<template>
  <div>
    <div v-if="searchMode == 'simple' && conditionList && conditionList.length > 0 && ((workcenterConditionData.conditionGroupList && workcenterConditionData.conditionGroupList.length > 0) || (workcenterConditionData.keywordConditionList && workcenterConditionData.keywordConditionList.length > 0))" class="pl-xs pr-xs">
      <span v-for="(conditionGroup) in workcenterConditionData.conditionGroupList" :key="conditionGroup.uuid">
        <Tag
          v-for="(condition) in conditionGroup.conditionList"
          :key="condition.uuid"
          style="margin-top: 0px;"
          :closable="!readonly"
          @on-close="removeCondition(condition)"
        >{{ condition.label }}：{{ condition.text }}</Tag>
      </span>
      <span v-if="workcenterConditionData.keywordConditionList && workcenterConditionData.keywordConditionList.length > 0">
        <Tag
          v-for="(keywordCondition) in workcenterConditionData.keywordConditionList"
          :key="keywordCondition.uuid"
          style="margin-top: 0px;"
          :closable="true"
          @on-close="removeCondition(keywordCondition)"
        >
          <span>{{ keywordCondition.text }}：</span>
          <span v-for="(v, vindex) in keywordCondition.valueList" :key="vindex">
            <span>{{ v }}</span>
            <span v-if="vindex < keywordCondition.valueList.length - 1"><Divider type="vertical" /></span>
          </span>
        </Tag>
      </span>
    </div>
    <div v-else-if="searchMode == 'custom' && ((conditionList && conditionList.length > 0 && workcenterConditionData.conditionGroupList && workcenterConditionData.conditionGroupList.length > 0) || (workcenterConditionData.keywordConditionList && workcenterConditionData.keywordConditionList.length > 0))">
      <span v-if="workcenterConditionData.conditionGroupList && workcenterConditionData.conditionGroupList.length > 0 && workcenterConditionData.keywordConditionList && workcenterConditionData.keywordConditionList.length > 0" class="text-grey fz10 ml-xs">(</span>
      <span v-if="workcenterConditionData.conditionGroupList && workcenterConditionData.conditionGroupList.length > 0">
        <span v-for="(conditionGroup, index) in workcenterConditionData.conditionGroupList" :key="index">
          <span v-if="conditionGroup.conditionList.length > 1" class="text-grey fz10 ml-xs">(</span>
          <span v-for="(condition, cindex) in conditionGroup.conditionList" :key="cindex">
            <Tag style="margin-top: 0px;margin-left:6px" :closable="!readonly" @on-close="removeCondition(condition)">
              <span>{{ condition.label }}：</span>
              <span v-if="condition.expression != 'is-null' && condition.expression != 'is-not-null'">{{ condition.text }}</span>
              <span v-else-if="condition.expression == 'is-null'">{{ $t('term.expression.empty') }}</span>
              <span v-else-if="condition.expression == 'is-not-null'">{{ $t('term.expression.notempty') }}</span>
            </Tag>
            <span v-if="conditionGroup.conditionRelList.length > 0 && cindex < conditionGroup.conditionList.length - 1">
              <span v-if="conditionGroup.conditionRelList[cindex].joinType == 'and'" class="text-info fz10">{{ $t('page.and') }}</span>
              <span v-else-if="conditionGroup.conditionRelList[cindex].joinType == 'or'" class="text-info fz10">{{ $t('page.or') }}</span>
            </span>
          </span>
          <span v-if="conditionGroup.conditionList.length > 1" class="text-grey fz10 mr-xs">)</span>
          <span v-if="workcenterConditionData.conditionGroupRelList.length > 0 && index < workcenterConditionData.conditionGroupList.length - 1">
            <span v-if="workcenterConditionData.conditionGroupRelList[index].joinType == 'and'" class="text-info fz10">{{ $t('page.and') }}</span>
            <span v-else-if="workcenterConditionData.conditionGroupRelList[index].joinType == 'or'" class="text-info fz10">{{ $t('page.or') }}</span>
          </span>
        </span>
      </span>
      <span v-if="workcenterConditionData.conditionGroupList && workcenterConditionData.conditionGroupList.length > 0 && workcenterConditionData.keywordConditionList && workcenterConditionData.keywordConditionList.length > 0" class="text-grey fz10 mr-xs">)</span>
      <span v-if="workcenterConditionData.conditionGroupList && workcenterConditionData.conditionGroupList.length > 0 && workcenterConditionData.keywordConditionList && workcenterConditionData.keywordConditionList.length > 0" class="text-info fz10">{{ $t('page.and') }}</span>
      <span v-if="workcenterConditionData.keywordConditionList && workcenterConditionData.keywordConditionList.length > 0">
        <span v-if="workcenterConditionData.conditionGroupList && workcenterConditionData.conditionGroupList.length > 0 && workcenterConditionData.keywordConditionList.length > 1" class="text-grey fz10 ml-xs">(</span>
        <span v-for="(keywordCondition, index) in workcenterConditionData.keywordConditionList" :key="index">
          <Tag style="margin-top: 0px;margin-left:6px" :closable="true" @on-close="removeCondition(keywordCondition)">
            <span>{{ keywordCondition.text }}：</span>
            <span v-for="(v, vindex) in keywordCondition.valueList" :key="vindex">
              <span>{{ v }}</span>
              <span v-if="vindex < keywordCondition.valueList.length - 1"><Divider type="vertical" /></span>
            </span>
          </Tag>
          <span v-if="index < workcenterConditionData.keywordConditionList.length - 1" class="text-info fz10">{{ $t('page.and') }}</span>
        </span>
        <span v-if="workcenterConditionData.conditionGroupList && workcenterConditionData.conditionGroupList.length > 0 && workcenterConditionData.keywordConditionList.length > 1" class="text-grey fz10 mr-xs">)</span>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    // SearchInputer: resolve => require(['./search-inputer.vue'], resolve)
  },
  props: {
    readonly: { type: Boolean, default: false },
    conditionList: { type: Array },
    workcenterConditionData: { type: Object }
  },
  data() {
    return {
      searchMode: this.workcenterConditionData?.handlerType || 'simple'
    };
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
  methods: {
    removeCondition(condition) {
      this.$emit('remove', condition);
    },
    getConditionByName(name) {
      if (this.conditonList && this.conditionList.length > 0) {
        //
      }
    },
    getFormCondition(conditionGroup) {
      if (conditionGroup.channelUuidList && conditionGroup.channelUuidList.length == 1) {
        //
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    'workcenterConditionData.handlerType': {
      handler: function(val) {
        this.searchMode = val;
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
