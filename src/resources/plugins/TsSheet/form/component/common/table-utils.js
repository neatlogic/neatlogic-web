// 表格工具类
import utils from '@/resources/assets/js/util.js';

/**
 * 构建验证列表
 * @param {Object} columnAttrItem - 列属性项
 * */
export function buildValidateList({columnAttrItem = {}, readonly = false, disabled = false}) {
  const { config = {} } = columnAttrItem || {};
  const { isRequired = false, validate = '', regex = '', regexMessage = '' } = config || {};
  let validateList = [];
  if (isRequired) {
    validateList.push('required');
  }
  if (readonly || disabled) {
    return validateList;
  }
  if (!utils.isEmpty(validate)) {
    validateList.push(validate);
  }
  if (!utils.isEmpty(regex) && this.isValidRegexPattern(regex)) {
    let findRegexItem = validateList.find(item => item && item.name === 'regex');
    if (findRegexItem) {
      findRegexItem.pattern = regex;
      findRegexItem.message = regexMessage;
    } else {
      validateList.push({
        name: 'regex', 
        pattern: regex,
        message: regexMessage
      });
    }
  }
  return validateList;
}

//判断正则表达式是否合法
export function isValidRegexPattern(regexString) {
  if (typeof regexString !== 'string') {
    return false;
  }
  try {
    new RegExp(regexString); 
    return true; 
  } catch (error) {
    return false; 
  }
}
