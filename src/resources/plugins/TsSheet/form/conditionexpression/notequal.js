export default (currentValue, oldValue, conditionValue) => {
  let isNotEqual = false;
  if (currentValue == conditionValue) {
    isNotEqual = false;
  } else if (currentValue instanceof Array) {
    if (currentValue.length !== conditionValue.length) {
      isNotEqual = true;
    } else {
      if (currentValue.some(cv => !conditionValue.includes(cv)) || conditionValue.some(cv => !currentValue.includes(cv))) {
        isNotEqual = true;
      }
    }
  } else {
    if (conditionValue.length == 1) {
      if (currentValue != conditionValue[0]) {
        isNotEqual = true;
      }
    }
  }
  return isNotEqual;
};
