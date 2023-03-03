export default (currentValue, oldValue, conditionValue) => {
  let isInclude = false;
  if (currentValue) {
    if (currentValue instanceof Array && conditionValue.filter(item => currentValue.some(c => c === item)).length > 0) {
      isInclude = true;
    } else if (typeof currentValue == 'string' && conditionValue.indexOf(currentValue) > -1) {
      isInclude = true;
    }
  }
  return isInclude;
};
