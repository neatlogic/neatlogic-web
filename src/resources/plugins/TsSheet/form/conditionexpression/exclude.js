import utils from '@/resources/assets/js/util.js';
export default (currentValue, oldValue, condition) => {
  let isExclude = false;
  let conditionValue = condition.valueList;
  //处理隐藏属性过滤
  let uuidList = (condition.formItemUuid && condition.formItemUuid.split('#')) || [];
  let uuid = uuidList[1] || 'value';
  if (utils.isEmpty(currentValue)) {
    isExclude = true;
  } else {
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
      if (conditionValueList.filter(item => valueList.some(c => c === item)).length == 0) {
        isExclude = true;
      }
    } else if ((typeof currentValue == 'string' || typeof currentValue == 'number') && currentValue.indexOf(conditionValue) == -1) {
      isExclude = true;
    } else if (typeof currentValue === 'object') {
      if (currentValue[uuid] && (currentValue[uuid].indexOf(conditionValueList) === -1)) {
        isExclude = true;
      }
    } 
  } 
  return isExclude;
};
