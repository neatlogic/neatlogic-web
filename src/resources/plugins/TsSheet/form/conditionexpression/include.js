export default (currentValue, oldValue, conditionValue) => {
  let isInclude = false;
  if (currentValue) {
    if (currentValue instanceof Array) {
      let valueList = [];
      currentValue.forEach(item => {
        if (typeof item === 'object') {
          valueList.push(item.value);
        } else {
          valueList.push(item);
        }
      });
      if (conditionValue.filter(item => valueList.some(c => c === item)).length > 0) {
        isInclude = true;
      }
    } else if (typeof currentValue == 'string' && conditionValue.indexOf(currentValue) > -1) {
      isInclude = true;
    } else if (typeof item === 'object' && conditionValue.indexOf(currentValue.value) > -1) {
      isInclude = true;
    }
  }
  return isInclude;
};
