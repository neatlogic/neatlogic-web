export default ({ reaction, view }) => {
  view.filter = [];
  if (!view.$utils.isEmpty(reaction.ruleList)) {
    reaction.ruleList.forEach(r => {
      let list = r.formItemUuid.split('#');
      let formItemUuid = list[0];
      let column = list[1] ? list[1] : 'value';
      let formItem = view.formItemList.find(d => d.uuid === formItemUuid);
      if (!formItem) {
        formItem = view.extraFormItemList.find(d => d.uuid === formItemUuid);
      }
      if (formItem && formItem.config) {
        let valueList = [];
        let textList = [];
        let currentFormData = view.formData[formItemUuid];
        if (currentFormData instanceof Array) {
          view.formData[formItemUuid].forEach(val => {
            const { text, value } = view.handleFilterValue(val, column, formItem);
            valueList.push(value);
            textList.push(text);
          });
        } else if (!view.$utils.isEmpty(currentFormData)) {
          const { text, value } = view.handleFilterValue(currentFormData, column, formItem);
          valueList.push(value);
          textList.push(text);
        }
        if (valueList.length > 0) {
          view.filter.push({
            uuid: r.matrixAttrUuid,
            valueList: valueList,
            textList: textList
          });
        }
      }
    });
    view.addExecuteCount('filter');
  }
};
