export default (currentValue, oldValue, condition) => {
  let isNotNull = false;
  if (currentValue != null && currentValue != '' && currentValue != [] && JSON.stringify(currentValue) != '{}') {
    isNotNull = true;
  } 
  return isNotNull;
};
