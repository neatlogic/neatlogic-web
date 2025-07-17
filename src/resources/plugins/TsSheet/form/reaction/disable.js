export default ({ overrideConfig, result, view }) => {
  if (!overrideConfig.isDisabled) {
    if (result) {
      view.$set(view.formItem.config, 'isDisabled', true);
      view.$set(view.currentItemReaction, 'currentItemDisabled', true);
    } else {
      view.$set(view.formItem.config, 'isDisabled', false);
      view.$set(view.currentItemReaction, 'currentItemDisabled', false);
    }
    view.addExecuteCount('disable');
  }
};
