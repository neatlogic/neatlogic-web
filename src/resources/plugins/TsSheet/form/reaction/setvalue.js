export default ({ reaction, result, view }) => {
  if (result) {
    let value = reaction.value;
    if (reaction.type == 'dynamic' && !view.$utils.isEmpty(reaction.value)) {
      const uuidList = reaction.value.split('#');
      const formItemUuid = uuidList[0];
      const formItemAttrUuid = uuidList[1] || 'value';
      let dynamicVal = view.$utils.deepClone(view.formData[formItemUuid]);
      if (!Array.isArray(dynamicVal)) {
        if (!view.$utils.isEmpty(dynamicVal)) {
          if (typeof dynamicVal === 'object') {
            value = dynamicVal[formItemAttrUuid];
          } else {
            value = dynamicVal;
          }
        } else {
          value = null;
        }
      } else {
        let list = [];
        dynamicVal.forEach(v => {
          if (!view.$utils.isEmpty(v[formItemAttrUuid])) {
            list.push(v[formItemAttrUuid]);
          }
        });
        value = list.join(',');
      }
    }
    if ((!reaction.isFirstLoad && (!view.formData.hasOwnProperty(view.formItem.uuid) || !view.formData[view.formItem.uuid]) || (view.formData[view.formItem.uuid] && !view.$utils.isSame(value, view.formData[view.formItem.uuid]))) || (reaction.isFirstLoad && !view.executeCount['setvalue'])) {
      view.addExecuteCount('setvalue');
      view.setValue(value);
      view.$emit('change', value);
    }
  }
};
