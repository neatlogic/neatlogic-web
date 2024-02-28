export default (currentValue, oldValue, condition) => {
  let isInclude = false;
  if (currentValue) {
    let conditionValue = condition.valueList;
    //处理隐藏属性过滤
    let uuidList = (condition.formItemUuid && condition.formItemUuid.split('#')) || [];
    let uuid = uuidList[1] || 'value';
    let conditionValueList = [];
    if (conditionValue) {
      conditionValueList = conditionValue.map(c => {
        return (typeof c === 'object' && c.value) || c;
      });
    }
    if (currentValue instanceof Array) {
      let valueList = [];
      currentValue.forEach(item => {
        if (typeof item === 'object') {
          item[uuid] != null && valueList.push(item[uuid]);
        } else {
          valueList.push(item);
        }
      });
      if (conditionValueList.filter(item => valueList.some(c => c === item)).length > 0) {
        isInclude = true;
      }
    } else if ((typeof currentValue == 'string' || typeof currentValue == 'number') && conditionValue.indexOf(currentValue) > -1) {
      isInclude = true;
    } else if (typeof currentValue === 'object') {
      if (conditionValueList.indexOf(currentValue[uuid]) > -1) {
        isInclude = true;
      }
    } 
  }
  return isInclude;
};
