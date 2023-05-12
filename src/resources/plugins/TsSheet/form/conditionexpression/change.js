export default (currentValue, oldValue, conditionValue) => {
  console.log(currentValue);
  console.log(oldValue);
  if (currentValue != oldValue) {
    return true;
  }
  return false;
};
