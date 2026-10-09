<template>
  <div>
    <div v-if="!groups.length" class="text-tip">{{ $t('message.framework.notifyunconditional') }}</div>
    <div v-for="(group, groupIndex) in groups" :key="group.uuid || groupIndex">
      <div class="bg-grey block-container padding-sm">
        <div v-for="(condition, conditionIndex) in group.conditionList" :key="condition.uuid || conditionIndex">
          <div class="flex-start align-start">
            <span class="mr-xs">{{ parameterText(condition) }}</span>
            <span class="mr-xs">{{ expressionText(condition) }}</span>
            <component
              :is="fieldHandler(condition)"
              v-if="needsValue(condition) && canRenderField(condition)"
              :value="fieldValue(condition)"
              :config="fieldConfig(condition)"
              readonly
            ></component>
            <span v-else-if="needsValue(condition)">{{ valueText(condition.valueList) }}</span>
          </div>
          <div v-if="isMissingMetadata(condition)" class="text-warning">{{ $t('message.framework.notifymetadatamissing') }}</div>
          <div v-if="conditionIndex < group.conditionList.length - 1" class="text-primary pt-xs pb-xs">{{ relationText(group.conditionRelList, conditionIndex) }}</div>
        </div>
      </div>
      <div v-if="groupIndex < groups.length - 1" class="text-primary padding-xs">{{ relationText(config.conditionGroupRelList, groupIndex) }}</div>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import Items from '@/resources/components/FormItems';
import { getConditionOption, getConditionExpression, requiresConditionValue, formatConditionValue } from '../condition-utils';

export default {
  name: 'ConditionView',
  components: { ...Items },
  props: {
    config: { type: Object, default: () => ({}) },
    conditionList: { type: Array, default: () => [] }
  },
  methods: {
    /** 参数失效时回退到保存的名称。 */
    parameterText(condition) {
      const option = getConditionOption(this.conditionList, condition.name);
      return option && (option.label || option.name) || condition.label || condition.name;
    },
    /** 表达式失效时展示原协议标识。 */
    expressionText(condition) {
      const expression = getConditionExpression(this.conditionList, condition);
      return expression && expression.expressionName || condition.expression;
    },
    /** 所有无值表达式均遵循元数据，不只判断 is-null。 */
    needsValue(condition) {
      return requiresConditionValue(condition, this.conditionList);
    },
    /** 查询原动态字段类型，不向后端元数据写入展示字段。 */
    fieldHandler(condition) {
      const option = getConditionOption(this.conditionList, condition.name);
      return option && (option.handler || 'form' + option.controller);
    },
    /** 元数据不全时使用原始值回显，避免动态组件报错。 */
    canRenderField(condition) {
      return !!getConditionExpression(this.conditionList, condition) && !!Items[this.fieldHandler(condition)];
    },
    /** 给只读字段提供独立配置，禁止共享配置被间接修改。 */
    fieldConfig(condition) {
      const option = cloneDeep(getConditionOption(this.conditionList, condition.name) || {});
      option.handler = this.fieldHandler(condition);
      option.config = Object.assign({}, option.config, { readonlyClass: 'text-default tsform-readonly', sperateText: '、' });
      return option;
    },
    /** 隔离引用类型的只读值，防止字段内部处理影响历史配置。 */
    fieldValue(condition) {
      return cloneDeep(condition.valueList);
    },
    /** 提示失效的参数、表达式或字段处理器。 */
    isMissingMetadata(condition) {
      return !getConditionExpression(this.conditionList, condition) || !Items[this.fieldHandler(condition)];
    },
    /** 从原关系链读取 AND／OR 显示。 */
    relationText(relations, index) {
      const relation = (relations || [])[index];
      return relation && relation.joinType === 'or' ? this.$t('page.or') : this.$t('page.and');
    },
    /** 格式化动态字段无法处理的原始条件值。 */
    valueText(value) {
      return formatConditionValue(value);
    }
  },
  computed: {
    /** 读取条件组，不创建双向绑定或衍生写入状态。 */
    groups() {
      return this.config && this.config.conditionGroupList || [];
    }
  }
};
</script>
