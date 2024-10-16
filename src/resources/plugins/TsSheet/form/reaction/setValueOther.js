export default ({ reaction, result, view }) => {
  if (result) {
    const currentValue = view.formItemValue;
    const valueList = reaction.valueList || [];
    let currentFormData = view.formData;
    if (valueList.length > 0) {
      valueList.forEach(item => {
        if (item.type === 'dynamic') {
          view.$set(currentFormData, item.attrUuid, currentValue && currentValue[item.value]);
        } else {
          view.$set(currentFormData, item.attrUuid, item.value);
        }
      });
      view.addExecuteCount('setValueOther');
    }
  }
};
