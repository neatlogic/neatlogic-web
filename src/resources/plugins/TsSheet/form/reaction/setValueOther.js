export default ({ reaction, result, view }) => {
  if (result) {
    const currentValue = view.formItemValue;
    const valueList = reaction.valueList || [];
    let currentFormData = {...view.formData || {}}; // 浅拷贝不改变原数据
    let currentData = {};
    if (valueList.length > 0) {
      valueList.forEach(item => {
        if (item.type === 'dynamic') {
          view.$set(currentFormData, item.attrUuid, currentValue && currentValue[item.value]);
          currentData[item.attrUuid] = currentValue && currentValue[item.value];
        } else {
          view.$set(currentFormData, item.attrUuid, item.value);
          currentData[item.attrUuid] = item.value;
        }
      });
      // 更新当前行数据
      view.$emit('updateCurrentRow', currentFormData);
      view?.updateCurrentRow?.(currentData); // 表格输入组件使用
      view.addExecuteCount('setValueOther');
    }
  }
};
