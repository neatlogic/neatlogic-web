export default (currentValue, oldValue, conditionValue) => {
  let isNotEqual = false;
  if (currentValue == conditionValue) {
    isNotEqual = false;
  } else if (currentValue instanceof Array) {
    let valueList = [];
    currentValue.forEach(item => {
      if (typeof item === 'object') {
        valueList.push(item.value);
      } else {
        valueList.push(item);
      }
    });
    if (currentValue.length !== conditionValue.length) {
      isNotEqual = true;
    } else {
      if (valueList.some(cv => !conditionValue.includes(cv)) || conditionValue.some(cv => !valueList.includes(cv))) {
        isNotEqual = true;
      }
    }
  } else {
    if (conditionValue.length == 1) {
      if (currentValue != conditionValue[0] || (typeof currentValue === 'object' && currentValue.value != conditionValue[0])) {
        isNotEqual = true;
      }
    }
  }
  return isNotEqual;
};
