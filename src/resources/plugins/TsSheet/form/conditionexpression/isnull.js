export default (currentValue, oldValue, condition) => {
  let isNull = false;
  if (currentValue == null || currentValue == '' || currentValue == [] || JSON.stringify(currentValue) == '{}') {
    isNull = true;
  } 
  return isNull;
};
