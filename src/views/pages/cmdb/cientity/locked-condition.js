const listFields = ['attrFilterList', 'globalAttrFilterList', 'relFilterList'];
const scalarFields = ['groupId', 'filterCiEntityId', 'filterCiId'];
const clone = value => JSON.parse(JSON.stringify(value));
const hasValue = value => value !== undefined && value !== null && value !== '';
const keyOf = (field, item) => field === 'relFilterList' ? `${item.direction}:${item.relId}` : String(item.attrId);

// 只合并搜索条件，固定字段优先，保留其他临时条件及原始范围值结构。
export function mergeLockedCondition(params, condition) {
  const result = clone(params);
  listFields.forEach(field => {
    const fixed = condition[field] || [];
    const keys = new Set(fixed.map(item => keyOf(field, item)));
    result[field] = [...(result[field] || []).filter(item => !keys.has(keyOf(field, item))), ...clone(fixed)];
  });
  scalarFields.forEach(field => {
    if (hasValue(condition[field])) result[field] = clone(condition[field]);
  });
  result.dsl = null;
  result.globalAttrStrictMode = true;
  return result;
}

// 字段锁定仅作用于预设条件，关系必须同时匹配方向，避免自关联误锁。
export function isConditionLocked(condition, field, id, direction) {
  if (listFields.includes(field)) {
    return (condition[field] || []).some(item => keyOf(field, item) === (field === 'relFilterList' ? `${direction}:${id}` : String(id)));
  }
  return hasValue(condition[field]);
}

// 元数据缺失或操作符失效时拒绝检索，不能丢弃条件后放宽候选范围。
export function validateLockedCondition(condition, metadata) {
  for (const field of listFields) {
    if (condition[field] && !Array.isArray(condition[field])) return false;
    for (const item of condition[field] || []) {
      const meta = (metadata[field] || []).find(candidate => keyOf(field, field === 'relFilterList' ? { relId: candidate.id, direction: candidate.direction } : { attrId: candidate.id }) === keyOf(field, item));
      const expressions = field === 'globalAttrFilterList' ? metadata.globalExpressions : meta && meta.expressionList;
      if (!meta || !(expressions || []).some(expression => expression.value === item.expression)) return false;
      if (!['is-null', 'is-not-null'].includes(item.expression) && (!Array.isArray(item.valueList) || !item.valueList.some(hasValue))) return false;
    }
  }
  return ['groupId', 'filterCiId'].every(field => !hasValue(condition[field]) || (metadata[field] || []).some(item => String(item.id) === String(condition[field])));
}
