export default ({ overrideConfig, result, view }) => {
  if (!overrideConfig.isDisabled) {
    if (result) {
      view.$set(view.formItem.config, 'isDisabled', true);
    } else {
      view.$set(view.formItem.config, 'isDisabled', false);
    }
    view.addExecuteCount('disable');
  }
};
