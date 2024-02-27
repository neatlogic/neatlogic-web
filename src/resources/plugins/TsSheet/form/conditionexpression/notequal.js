export default (currentValue, oldValue, condition) => {
  let isNotEqual = false;
  let conditionValue = condition.valueList;
  //处理隐藏属性过滤
  let uuidList = (condition.formItemUuid && condition.formItemUuid.split('#')) || [];
  let uuid = uuidList[1] || 'value';
  if (currentValue == conditionValue) {
    isNotEqual = false;
  } else if (currentValue instanceof Array) {
    let valueList = [];
    currentValue.forEach(item => {
      if (typeof item === 'object') {
        item[uuid] != null && valueList.push(item[uuid]);
      } else {
        valueList.push(item);
      }
    });
    if (currentValue.length !== conditionValue.length) {
      isNotEqual = true;
    } else {
      let conditionValueList = conditionValue.map(c => {
        return c.value;
      });
      if (valueList.some(cv => !conditionValueList.includes(cv)) || conditionValueList.some(cv => !valueList.includes(cv))) {
        isNotEqual = true;
      }
    }
  } else {
    if (currentValue != conditionValue) {
      isNotEqual = true;
    } else if (typeof currentValue === 'object' && currentValue[uuid] != conditionValue.value) {
      isEqual = true;
    }
  }
  return isNotEqual;
};
