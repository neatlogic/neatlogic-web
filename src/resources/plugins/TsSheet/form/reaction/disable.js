export default ({ overrideConfig, result, view }) => {
  if (!overrideConfig.isDisabled) {
    if (result) {
      view.$set(view.formItem.config, 'isDisabled', true);
      view.currentItemDisabled = true;
    } else {
      view.$set(view.formItem.config, 'isDisabled', false);
      view.currentItemDisabled = false;
    }
    view.addExecuteCount('disable');
  }
};
