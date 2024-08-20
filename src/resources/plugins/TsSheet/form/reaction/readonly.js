export default ({ overrideConfig, result, view }) => {
  if (!overrideConfig.isReadonly) {
    if (result) {
      view.$set(view.formItem.config, 'isReadOnly', true);
    } else {
      view.$set(view.formItem.config, 'isReadOnly', false);
    }
    view.addExecuteCount('readonly');
  }
};
