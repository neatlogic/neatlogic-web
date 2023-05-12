export default (currentValue, oldValue, conditionValue) => {
  let isNull = false;
  if (currentValue == null || currentValue == '' || currentValue == []) {
    isNull = true;
  } 
  return isNull;
};
