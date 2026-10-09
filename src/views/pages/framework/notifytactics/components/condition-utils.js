import cloneDeep from 'lodash/cloneDeep';

/** 克隆条件草稿，避免编辑或字段组件改动原配置。 */
export function cloneConditionConfig(config) {
  const result = cloneDeep(config || {});
  result.conditionGroupList = Array.isArray(result.conditionGroupList) ? result.conditionGroupList : [];
  result.conditionGroupRelList = Array.isArray(result.conditionGroupRelList) ? result.conditionGroupRelList : [];
  result.conditionGroupList.forEach(group => {
    group.conditionList = Array.isArray(group.conditionList) ? group.conditionList : [];
    group.conditionRelList = Array.isArray(group.conditionRelList) ? group.conditionRelList : [];
  });
  return result;
}

/** 删除链中节点，中间节点沿用左侧关系连接前后节点。 */
export function removeLinkedItem(items, relations, index) {
  const list = items.slice();
  if (index < 0 || index >= list.length) {
    return { list, relations: cloneDeep(relations || []) };
  }
  const removed = list.splice(index, 1)[0];
  const oldRelations = relations || [];
  const nextRelations = [];
  for (let i = 0; i < list.length - 1; i++) {
    const from = list[i].uuid;
    const to = list[i + 1].uuid;
    let relation = oldRelations.find(item => item.from === from && item.to === to);
    if (!relation && i === index - 1) {
      relation = oldRelations.find(item => item.from === from && item.to === removed.uuid);
    }
    nextRelations.push(Object.assign({}, cloneDeep(relation || {}), { from, to, joinType: relation && relation.joinType || 'and' }));
  }
  return { list, relations: nextRelations };
}

/** 判断条件值是否为空，数字零和布尔值均是有效输入。 */
export function isEmptyConditionValue(value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isEmptyConditionValue);
  }
  return false;
}

/** 按参数名取得条件元数据，不修改调用方的数据。 */
export function getConditionOption(conditionList, name) {
  return (conditionList || []).find(item => item.name === name);
}

/** 按参数和表达式查找显示及校验元数据。 */
export function getConditionExpression(conditionList, condition) {
  const option = getConditionOption(conditionList, condition.name);
  return option && (option.expressionList || []).find(item => item.expression === condition.expression);
}

/** 元数据优先决定是否需要值，失效配置回退到原字段标记。 */
export function requiresConditionValue(condition, conditionList) {
  const expression = getConditionExpression(conditionList, condition);
  if (expression && expression.isShowConditionValue !== undefined) {
    return expression.isShowConditionValue != 0;
  }
  return condition.isShowConditionValue != 0;
}

/** 校验必需字段及元数据完整性，组件另行执行动态字段校验。 */
export function isConditionComplete(condition, conditionList) {
  if (!condition.uuid || !condition.name || !condition.expression || !getConditionExpression(conditionList, condition)) {
    return false;
  }
  return !requiresConditionValue(condition, conditionList) || !isEmptyConditionValue(condition.valueList);
}

/** 校验关系链覆盖相邻节点，防止损坏的历史关系被无提示保存。 */
export function isRelationChainComplete(items, relations) {
  if ((relations || []).length !== Math.max(0, items.length - 1)) {
    return false;
  }
  return (relations || []).every((relation, index) => relation.from === items[index].uuid && relation.to === items[index + 1].uuid && ['and', 'or'].includes(relation.joinType));
}

/** 格式化失效元数据的原始值，确保只读详情仍可查看。 */
export function formatConditionValue(value) {
  if (value === null || value === undefined) {
    return '-';
  }
  if (Array.isArray(value)) {
    return value.map(formatConditionValue).join('、');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
