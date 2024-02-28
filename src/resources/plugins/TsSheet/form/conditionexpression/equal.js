export default (currentValue, oldValue, condition) => {
  let isEqual = false;
  let conditionValue = condition.valueList;
  //处理隐藏属性过滤
  let uuidList = (condition.formItemUuid && condition.formItemUuid.split('#')) || [];
  let uuid = uuidList[1] || 'value';
  let conditionValueList = conditionValue.map(c => {
    return (typeof c === 'object' && c.value) || c;
  });
  if (conditionValue && currentValue == conditionValue) {
    isEqual = true;
  } else if (currentValue == null && (conditionValueList != [] && conditionValueList != null)) {
    isEqual = false;
  } else if (currentValue != null && (conditionValueList == [] || conditionValueList == null)) {
    isEqual = false;
  } else if (currentValue instanceof Array) {
    if (currentValue.length === conditionValue.length) {
      let valueList = [];
      currentValue.forEach(item => {
        if (typeof item === 'object') {
          item[uuid] != null && valueList.push(item[uuid]);
        } else {
          valueList.push(item);
        }
      });
      if (valueList.every(cv => conditionValueList.includes(cv)) && conditionValueList.every(cv => valueList.includes(cv))) {
        isEqual = true;
      }
    }
  } else {
    if ((typeof currentValue == 'string' || typeof currentValue == 'number') && currentValue == conditionValueList[0]) {
      isEqual = true;
    } else if (typeof currentValue === 'object' && currentValue[uuid] == conditionValueList[0]) {
      isEqual = true;
    }
  }
  return isEqual;
};
