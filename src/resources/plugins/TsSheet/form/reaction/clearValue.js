export default ({result, view}) => {
  if (result) {
    view.$set(view.formData, view.formItem.uuid, null);
  }
  view.addExecuteCount('clearValue');
};
