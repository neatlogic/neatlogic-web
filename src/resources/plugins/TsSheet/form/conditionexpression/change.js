export default (currentValue, oldValue, condition) => {
  if (currentValue != oldValue) {
    return true;
  }
  return false;
};
