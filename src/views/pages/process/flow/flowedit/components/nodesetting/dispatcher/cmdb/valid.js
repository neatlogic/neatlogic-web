export const CmdbDispatcherValid = (that, handler, key, value) => {
  if (that.$utils.isEmpty(value)) {
    return true;
  }
  // 验证cmdb分派器，匹配映射，两个数组时，有一个为空时，数据校验不通过问题
  // filterList[].key 是 CMDB 属性，formAttributeUuid / formAttributeKey 是表单组件引用。
  if (key !== 'filterList') {
    return false;
  }
  const formItems = that.allFormitemList || [];
  return value.some(item => {
    if (!item.formAttributeUuid || !item.formAttributeKey || !item.key) return true;
    const matches = formItems.filter(formItem => formItem.key === item.formAttributeKey);
    return matches.length !== 1 || matches[0].uuid !== item.formAttributeUuid || value.filter(filter => filter.formAttributeKey === item.formAttributeKey).length > 1;
  });
};
