export const CmdbDispatcher = (that, handler, key, value) => {
  if (that.$utils.isEmpty(value)) {
    return true;
  }
  // 验证cmdb分派器，匹配映射，两个数组时，有一个为空时，数据校验不通过问题
  // [{"formAttributeUuid": "ca04365ff49c4c80b39cf802e857eeaa","key": 441733552807936},{key: '441733846409216', formAttributeUuid: ''}]
  if (key !== 'filterList') {
    return false;
  }
  return value.some(item => !item.formAttributeUuid || !item.key);
};
