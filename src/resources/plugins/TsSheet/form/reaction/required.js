export default ({ overrideConfig, result, view }) => {
  if (!overrideConfig.isRequired) {
    if (result) {
      view.$set(view.formItem.config, 'isRequired', true);
    } else {
      view.$set(view.formItem.config, 'isRequired', false);
    }
    view.addExecuteCount('required');
  }
};
