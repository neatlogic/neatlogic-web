export default (currentValue, oldValue, conditionValue) => {
  let isExclude = false;
  if (currentValue == null || currentValue == '' || currentValue == [] || currentValue == {}) {
    isExclude = true;
  } else {
    if (currentValue instanceof Array) {
      let valueList = [];
      currentValue.forEach(item => {
        if (typeof item === 'object') {
          valueList.push(item.value);
        } else {
          valueList.push(item);
        }
      });
      if (conditionValue.filter(item => valueList.some(c => c === item)).length == 0) {
        isExclude = true;
      }
    } else if ((typeof currentValue == 'string' || typeof currentValue == 'number') && conditionValue.indexOf(currentValue) == -1) {
      isExclude = true;
    } else if (typeof currentValue === 'object' && conditionValue.indexOf(currentValue.value) == -1) {
      isExclude = true;
    } 
  } 
  return isExclude;
};
