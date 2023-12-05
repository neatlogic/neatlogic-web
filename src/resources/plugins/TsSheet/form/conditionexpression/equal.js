export default (currentValue, oldValue, conditionValue) => {
  let isEqual = false;
  if (currentValue == conditionValue) {
    isEqual = true;
  } else if (currentValue == null && conditionValue != null) {
    isEqual = false;
  } else if (currentValue != null && conditionValue == null) {
    isEqual = false;
  } else if (currentValue instanceof Array) {
    if (currentValue.length === conditionValue.length) {
      let valueList = [];
      currentValue.forEach(item => {
        if (typeof item === 'object') {
          valueList.push(item.value);
        } else {
          valueList.push(item);
        }
      });
      if (valueList.every(cv => conditionValue.includes(cv)) && conditionValue.every(cv => valueList.includes(cv))) {
        isEqual = true;
      }
    }
  } else {
    if (conditionValue.length == 1) {
      if (currentValue == conditionValue[0] || ((typeof currentValue === 'object') && currentValue.value == conditionValue[0])) {
        isEqual = true;
      }
    }
  }
  return isEqual;
};
