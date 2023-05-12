export default (currentValue, oldValue, conditionValue) => {
  let isExclude = false;
  if (currentValue == null || currentValue == '' || currentValue == []) {
    isExclude = true;
  } else {
    if (currentValue instanceof Array && conditionValue.filter(item => currentValue.some(c => c === item)).length == 0) {
      isExclude = true;
    } else if (typeof currentValue == 'string' && conditionValue.indexOf(currentValue) != -1) {
      isExclude = true;
    }
  } 
  return isExclude;
};
