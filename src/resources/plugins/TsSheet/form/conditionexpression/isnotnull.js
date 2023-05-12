export default (currentValue, oldValue, conditionValue) => {
  let isNotNull = false;
  if (currentValue != null && currentValue != '' && currentValue != []) {
    isNotNull = true;
  } 
  return isNotNull;
};
