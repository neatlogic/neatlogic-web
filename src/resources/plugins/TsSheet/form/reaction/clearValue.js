export default ({result, view}) => {
  if (result && !view.$utils.isEmpty(view.formData[view.formItem.uuid])) {
    view.$set(view.formData, view.formItem.uuid, null);
  }
  view.addExecuteCount('clearValue');
};
