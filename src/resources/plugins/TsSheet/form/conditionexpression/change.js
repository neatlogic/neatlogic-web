export default (currentValue, oldValue, condition) => {
  if (JSON.stringify(currentValue) !== JSON.stringify(oldValue)) {
    return true;
  }
  return false;
};
