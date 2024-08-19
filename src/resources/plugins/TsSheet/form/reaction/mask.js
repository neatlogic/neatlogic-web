export default ({ overrideConfig, result, view }) => {
  if (!overrideConfig.isMask) {
    if (result) {
      view.$set(view.formItem.config, 'isMask', true);
    } else {
      view.$set(view.formItem.config, 'isMask', false);
    }
    view.addExecuteCount('mask');
  }
};
