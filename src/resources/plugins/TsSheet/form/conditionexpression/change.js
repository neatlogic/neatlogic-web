import utils from '@/resources/assets/js/util.js';
export default (currentValue, oldValue, condition, view) => {
  if (!utils.isSame(currentValue, oldValue)) {
    return true;
  }
  return false;
};
