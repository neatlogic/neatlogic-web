export default (currentValue, oldValue, condition) => {
  let isNull = false;
  if (currentValue == null || currentValue == '' || currentValue == []) {
    isNull = true;
  } 
  return isNull;
};
